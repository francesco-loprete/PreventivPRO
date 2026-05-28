"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import {
  ClientePicker,
  createClientePickerState,
  type ClientePickerState,
} from "@/components/clienti/cliente-picker";
import { VociEditor } from "@/components/preventivo/voci-editor";
import { resolveClienteForPreventivo } from "@/lib/clienti/resolve-cliente";
import { downloadPreventivoPdf, buildPreventivoPdfBlob } from "@/lib/pdf/generate-preventivo-pdf";
import {
  buildWhatsAppMessage,
  sharePreventivoPdfViaWhatsApp,
} from "@/lib/pdf/share-preventivo-pdf";
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

const euroFormatter = new Intl.NumberFormat("it-IT", {
  style: "currency",
  currency: "EUR",
});

const dateFormatter = new Intl.DateTimeFormat("it-IT", {
  dateStyle: "medium",
  timeStyle: "short",
});

type PreventiviTableProps = {
  preventivi: Preventivo[];
  clienti: Cliente[];
};

export function PreventiviTable({
  preventivi: initialPreventivi,
  clienti,
}: PreventiviTableProps) {
  const router = useRouter();
  const [editing, setEditing] = useState<Preventivo | null>(null);
  const [clientePicker, setClientePicker] = useState<ClientePickerState>(() =>
    createClientePickerState(clienti)
  );
  const [voci, setVoci] = useState<Voce[]>([]);
  const [loading, setLoading] = useState(false);
  const [pdfGeneratingId, setPdfGeneratingId] = useState<number | null>(null);
  const [whatsappSharingId, setWhatsappSharingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const totaleGenerale = calcolaTotaleVoci(voci);

  function openEdit(preventivo: Preventivo) {
    setError(null);
    setEditing(preventivo);
    setClientePicker(
      createClientePickerState(clienti, {
        clienteId: preventivo.cliente_id,
        nomeFallback: preventivo.cliente,
      })
    );
    setVoci(
      vociFromPreventivo(preventivo.descrizione, getPreventivoTotale(preventivo))
    );
  }

  function closeEdit() {
    setEditing(null);
    setError(null);
  }

  async function handleUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;

    const validation = validateVoci(voci);
    if (!validation.ok) {
      setError(validation.message);
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
      setError("Sessione scaduta. Accedi di nuovo.");
      return;
    }

    const resolved = await resolveClienteForPreventivo(
      supabase,
      user.id,
      clientePicker
    );

    if (!resolved.ok) {
      setLoading(false);
      setError(resolved.message);
      return;
    }

    const { error: updateError } = await supabase
      .from("preventivi")
      .update({
        cliente: resolved.clienteNome,
        cliente_id: resolved.clienteId,
        descrizione: vociToDescrizione(validation.voci),
        prezzo: validation.totale,
      })
      .eq("id", editing.id)
      .eq("user_id", user.id);

    setLoading(false);

    if (updateError) {
      setError(updateError.message + rlsErrorHint(updateError.code));
      return;
    }

    closeEdit();
    router.refresh();
  }

  async function handleDelete(preventivo: Preventivo) {
    const confirmed = window.confirm(
      `Eliminare il preventivo di ${preventivo.cliente}?`
    );
    if (!confirmed) return;

    setLoading(true);
    setError(null);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      setError("Sessione scaduta. Accedi di nuovo.");
      return;
    }

    const { error: deleteError } = await supabase
      .from("preventivi")
      .delete()
      .eq("id", preventivo.id)
      .eq("user_id", user.id);

    setLoading(false);

    if (deleteError) {
      setError(deleteError.message + rlsErrorHint(deleteError.code));
      return;
    }

    router.refresh();
  }

  async function handlePdf(preventivo: Preventivo) {
    setError(null);
    setPdfGeneratingId(preventivo.id);

    try {
      await downloadPreventivoPdf(preventivo);
    } catch {
      setError("Errore durante la generazione del PDF.");
    } finally {
      setPdfGeneratingId(null);
    }
  }

  async function handleWhatsApp(preventivo: Preventivo) {
    setError(null);
    setWhatsappSharingId(preventivo.id);

    try {
      const { blob, filename } = await buildPreventivoPdfBlob(preventivo);
      const message = buildWhatsAppMessage(preventivo);
      await sharePreventivoPdfViaWhatsApp(blob, filename, message);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        return;
      }
      setError("Errore durante la condivisione su WhatsApp.");
    } finally {
      setWhatsappSharingId(null);
    }
  }

  const isRowBusy = (preventivoId: number) =>
    loading ||
    pdfGeneratingId === preventivoId ||
    whatsappSharingId === preventivoId;

  return (
    <>
      {error && !editing && (
        <p className="mb-4 text-red-400 text-sm" role="alert">
          {error}
        </p>
      )}

      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border bg-slate-950/40">
                <th className="px-6 py-4 text-sm font-semibold text-muted uppercase tracking-wide">
                  Cliente
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-muted uppercase tracking-wide text-right">
                  Totale
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-muted uppercase tracking-wide">
                  Data
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-muted uppercase tracking-wide text-right">
                  Azioni
                </th>
              </tr>
            </thead>
            <tbody>
              {initialPreventivi.map((preventivo) => (
                <tr
                  key={preventivo.id}
                  className="border-b border-border/80 last:border-b-0 hover:bg-white/[0.03] transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-foreground whitespace-nowrap">
                    {preventivo.cliente}
                  </td>
                  <td className="px-6 py-4 text-accent font-semibold text-right whitespace-nowrap">
                    {euroFormatter.format(getPreventivoTotale(preventivo))}
                  </td>
                  <td className="px-6 py-4 text-muted whitespace-nowrap">
                    {preventivo.created_at
                      ? dateFormatter.format(new Date(preventivo.created_at))
                      : "—"}
                  </td>
                  <td className="px-3 sm:px-6 py-4">
                    <div className="flex items-center justify-end gap-1.5 sm:gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => handlePdf(preventivo)}
                        disabled={isRowBusy(preventivo.id)}
                        className="btn-ghost hover:border-accent hover:text-accent min-w-[52px]"
                        aria-label={`Scarica PDF preventivo ${preventivo.cliente}`}
                      >
                        {pdfGeneratingId === preventivo.id ? "PDF..." : "PDF"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleWhatsApp(preventivo)}
                        disabled={isRowBusy(preventivo.id)}
                        className="btn-ghost hover:border-[#25D366] hover:text-[#25D366] min-w-[52px]"
                        aria-label={`Condividi preventivo ${preventivo.cliente} su WhatsApp`}
                      >
                        {whatsappSharingId === preventivo.id ? "..." : "WhatsApp"}
                      </button>
                      <button
                        type="button"
                        onClick={() => openEdit(preventivo)}
                        disabled={loading || pdfGeneratingId !== null || whatsappSharingId !== null}
                        className="btn-ghost hover:border-accent hover:text-accent"
                      >
                        Modifica
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(preventivo)}
                        disabled={loading || pdfGeneratingId !== null || whatsappSharingId !== null}
                        className="px-3 py-1.5 text-sm rounded-lg border border-red-900/60 text-red-400 hover:bg-red-950/80 hover:border-red-700 transition-colors disabled:opacity-50"
                      >
                        Elimina
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-title"
        >
          <form
            onSubmit={handleUpdate}
            className="w-full max-w-4xl max-h-[90vh] overflow-y-auto card p-6 sm:p-8 shadow-2xl shadow-black/40"
          >
            <h2 id="edit-title" className="text-2xl font-bold mb-6">
              Modifica <span className="text-accent">preventivo</span>
            </h2>

            <div className="mb-6">
              <label className="block mb-2 text-muted text-sm">Cliente</label>
              <ClientePicker
                clienti={clienti}
                value={clientePicker}
                onChange={setClientePicker}
                disabled={loading}
                idPrefix="edit"
              />
            </div>

            <div className="mb-6">
              <label className="block mb-2 text-muted text-sm">Voci Preventivo</label>
              <VociEditor
                voci={voci}
                onChange={setVoci}
                disabled={loading}
                idPrefix="edit"
              />
            </div>

            <div className="mb-6 text-right">
              <p className="text-muted text-sm">Totale Generale</p>
              <p className="text-2xl sm:text-3xl font-bold text-accent">
                € {totaleGenerale}
              </p>
            </div>

            {error && (
              <p className="mb-4 text-red-400 text-sm" role="alert">
                {error}
              </p>
            )}

            <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
              <button
                type="button"
                onClick={closeEdit}
                disabled={loading}
                className="btn-secondary disabled:opacity-50"
              >
                Annulla
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary disabled:opacity-50"
              >
                {loading ? "Salvataggio..." : "Salva modifiche"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
