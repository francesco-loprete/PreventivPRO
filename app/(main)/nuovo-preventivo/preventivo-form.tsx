"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import {
  ClientePicker,
  createClientePickerState,
  type ClientePickerState,
} from "@/components/clienti/cliente-picker";
import { PreventivoTotali } from "@/components/preventivo/preventivo-totali";
import { VociEditor } from "@/components/preventivo/voci-editor";
import { FormFeedback } from "@/components/ui/form-feedback";
import { resolveClienteForPreventivo } from "@/lib/clienti/resolve-cliente";
import {
  calcolaTotaleVoci,
  createEmptyVoce,
  validateVoci,
  vociToDescrizione,
  type Voce,
} from "@/lib/preventivi/voci";
import {
  DEFAULT_ALIQUOTA_IVA,
  type AliquotaIva,
} from "@/lib/preventivi/iva";
import { createClient } from "@/lib/supabase/client";
import type { Cliente } from "@/lib/types/cliente";
import type { PreventivoInsert } from "@/lib/types/preventivo";
import { rlsErrorHint } from "@/lib/types/preventivo";

type PreventivoFormProps = {
  clienti: Cliente[];
  initialClienteId?: number;
};

export function PreventivoForm({
  clienti,
  initialClienteId,
}: PreventivoFormProps) {
  const router = useRouter();
  const [clientePicker, setClientePicker] = useState<ClientePickerState>(() =>
    createClientePickerState(clienti, { clienteId: initialClienteId })
  );
  const [voci, setVoci] = useState<Voce[]>([createEmptyVoce()]);
  const [aliquotaIva, setAliquotaIva] = useState<AliquotaIva>(DEFAULT_ALIQUOTA_IVA);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const totaleGenerale = calcolaTotaleVoci(voci);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(false);

    const validation = validateVoci(voci);
    if (!validation.ok) {
      setError(validation.message);
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("Sessione scaduta. Accedi di nuovo.");
        setLoading(false);
        return;
      }

      const resolved = await resolveClienteForPreventivo(
        supabase,
        user.id,
        clientePicker
      );

      if (!resolved.ok) {
        setError(resolved.message);
        setLoading(false);
        return;
      }

      const payload: PreventivoInsert = {
        cliente: resolved.clienteNome,
        cliente_id: resolved.clienteId,
        descrizione: vociToDescrizione(validation.voci),
        prezzo: validation.totale,
        aliquota_iva: aliquotaIva,
        user_id: user.id,
      };

      const { error: insertError } = await supabase.from("preventivi").insert(payload);

      if (insertError) {
        setError(insertError.message + rlsErrorHint(insertError.code));
        return;
      }

      setSuccess(true);
      setClientePicker(
        createClientePickerState(clienti, { clienteId: initialClienteId })
      );
      setVoci([createEmptyVoce()]);
      setAliquotaIva(DEFAULT_ALIQUOTA_IVA);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Errore imprevisto durante il salvataggio."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card p-4 sm:p-6 md:p-8 max-w-4xl w-full min-w-0 overflow-x-hidden">
      <div className="mb-6">
        <label className="block mb-2 text-muted text-sm">Cliente</label>
        <ClientePicker
          clienti={clienti}
          value={clientePicker}
          onChange={setClientePicker}
          disabled={loading}
          idPrefix="nuovo"
        />
      </div>

      <div className="mb-6">
        <label className="block mb-2 text-muted text-sm">Voci Preventivo</label>
        <VociEditor
          voci={voci}
          onChange={setVoci}
          disabled={loading}
          idPrefix="nuovo"
        />
      </div>

      {error && (
        <FormFeedback error={error} className="mb-4" />
      )}

      {success && (
        <FormFeedback success="Preventivo salvato con successo." className="mb-4" />
      )}

      {loading && (
        <FormFeedback loading loadingMessage="Salvataggio in corso..." className="mb-4" />
      )}

      <PreventivoTotali
        imponibile={totaleGenerale}
        aliquotaIva={aliquotaIva}
        onAliquotaIvaChange={setAliquotaIva}
        disabled={loading}
        idPrefix="nuovo"
        totaleGeneraleClassName="text-3xl"
      />

      <button type="submit" disabled={loading} className="btn-primary px-6 py-4 mt-6">
        {loading ? "Salvataggio..." : "Salva Preventivo"}
      </button>
    </form>
  );
}
