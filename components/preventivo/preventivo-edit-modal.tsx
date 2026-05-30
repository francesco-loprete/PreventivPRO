"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import {
  ClientePicker,
  createClientePickerState,
  type ClientePickerState,
} from "@/components/clienti/cliente-picker";
import { FirmaClienteSection } from "@/components/preventivo/firma-cliente-section";
import { PreventivoTotali } from "@/components/preventivo/preventivo-totali";
import { VociEditor } from "@/components/preventivo/voci-editor";
import { FormFeedback } from "@/components/ui/form-feedback";
import { useLocale, useTranslations } from "@/components/i18n/locale-provider";
import { resolveClienteForPreventivo } from "@/lib/clienti/resolve-cliente";
import {
  DEFAULT_ALIQUOTA_IVA,
  normalizeAliquotaIva,
  type AliquotaIva,
} from "@/lib/preventivi/iva";
import {
  calcolaTotaleVoci,
  validateVoci,
  vociFromPreventivo,
  vociToDescrizione,
  type Voce,
} from "@/lib/preventivi/voci";
import { createClient } from "@/lib/supabase/client";
import type { Cliente } from "@/lib/types/cliente";
import type { Preventivo } from "@/lib/types/preventivo";
import { getPreventivoTotale, rlsErrorHint } from "@/lib/types/preventivo";

type PreventivoEditModalProps = {
  preventivo: Preventivo | null;
  clienti: Cliente[];
  onClose: () => void;
  onSuccess?: (message: string) => void;
  idPrefix?: string;
};

export function PreventivoEditModal({
  preventivo,
  clienti,
  onClose,
  onSuccess,
  idPrefix = "edit",
}: PreventivoEditModalProps) {
  const router = useRouter();
  const t = useTranslations();
  const { translateError } = useLocale();
  const [clientePicker, setClientePicker] = useState<ClientePickerState>(() =>
    createClientePickerState(clienti)
  );
  const [voci, setVoci] = useState<Voce[]>([]);
  const [aliquotaIva, setAliquotaIva] = useState<AliquotaIva>(DEFAULT_ALIQUOTA_IVA);
  const [validoFinoAl, setValidoFinoAl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totaleGenerale = calcolaTotaleVoci(voci);

  useEffect(() => {
    if (!preventivo) return;

    setError(null);
    setClientePicker(
      createClientePickerState(clienti, {
        clienteId: preventivo.cliente_id,
        nomeFallback: preventivo.cliente,
      })
    );
    setVoci(
      vociFromPreventivo(preventivo.descrizione, getPreventivoTotale(preventivo))
    );
    setAliquotaIva(normalizeAliquotaIva(preventivo.aliquota_iva));
    setValidoFinoAl(preventivo.valido_fino_al?.slice(0, 10) ?? "");
  }, [preventivo, clienti]);

  async function handleUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!preventivo) return;

    const validation = validateVoci(voci);
    if (!validation.ok) {
      setError(translateError(validation.message));
      return;
    }

    setLoading(true);
    setError(null);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      setError(t("common.sessionExpired"));
      return;
    }

    const resolved = await resolveClienteForPreventivo(
      supabase,
      user.id,
      clientePicker
    );

    if (!resolved.ok) {
      setLoading(false);
      setError(translateError(resolved.message));
      return;
    }

    const { error: updateError } = await supabase
      .from("preventivi")
      .update({
        cliente: resolved.clienteNome,
        cliente_id: resolved.clienteId,
        descrizione: vociToDescrizione(validation.voci),
        prezzo: validation.totale,
        aliquota_iva: aliquotaIva,
        valido_fino_al: validoFinoAl.trim() || null,
      })
      .eq("id", preventivo.id)
      .eq("user_id", user.id);

    setLoading(false);

    if (updateError) {
      setError(updateError.message + rlsErrorHint(updateError.code));
      return;
    }

    onClose();
    onSuccess?.(t("preventivo.quoteUpdated"));
    router.refresh();
  }

  if (!preventivo) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={`${idPrefix}-edit-title`}
    >
      <form
        onSubmit={handleUpdate}
        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto overflow-x-hidden card p-4 sm:p-6 md:p-8 shadow-2xl shadow-black/40 min-w-0"
      >
        <h2 id={`${idPrefix}-edit-title`} className="text-2xl font-bold mb-6">
          {t("preventivo.editTitle")}{" "}
          <span className="text-accent">{t("preventivo.editTitleAccent")}</span>
        </h2>

        <div className="mb-6">
          <label className="block mb-2 text-muted text-sm">{t("common.client")}</label>
          <ClientePicker
            clienti={clienti}
            value={clientePicker}
            onChange={setClientePicker}
            disabled={loading}
            idPrefix={idPrefix}
          />
        </div>

        <div className="mb-6">
          <label className="block mb-2 text-muted text-sm">{t("preventivo.quoteLines")}</label>
          <VociEditor
            voci={voci}
            onChange={setVoci}
            disabled={loading}
            idPrefix={idPrefix}
          />
        </div>

        <PreventivoTotali
          imponibile={totaleGenerale}
          aliquotaIva={aliquotaIva}
          onAliquotaIvaChange={setAliquotaIva}
          disabled={loading}
          idPrefix={idPrefix}
          totaleGeneraleClassName="text-2xl sm:text-3xl"
        />

        <div className="mb-6">
          <label
            htmlFor={`${idPrefix}-valido-fino-al`}
            className="block mb-2 text-muted text-sm"
          >
            {t("preventivo.validUntil")}
          </label>
          <input
            id={`${idPrefix}-valido-fino-al`}
            type="date"
            value={validoFinoAl}
            onChange={(event) => setValidoFinoAl(event.target.value)}
            disabled={loading}
            className="input-field max-w-xs"
          />
        </div>

        <FirmaClienteSection
          preventivoId={preventivo.id}
          firmaCliente={preventivo.firma_cliente}
          idPrefix={`${idPrefix}-firma`}
        />

        <FormFeedback
          error={error}
          loading={loading}
          loadingMessage={t("common.saving")}
          className="mb-4 space-y-2"
        />

        <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="btn-secondary disabled:opacity-50"
          >
            {t("common.cancel")}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary disabled:opacity-50"
          >
            {loading ? t("common.saving") : t("clienti.saveChanges")}
          </button>
        </div>
      </form>
    </div>
  );
}
