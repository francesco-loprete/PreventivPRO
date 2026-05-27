"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { generatePreventivoPdf } from "@/lib/pdf/generate-preventivo-pdf";
import { createClient } from "@/lib/supabase/client";
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
};

export function PreventiviTable({ preventivi: initialPreventivi }: PreventiviTableProps) {
  const router = useRouter();
  const [editing, setEditing] = useState<Preventivo | null>(null);
  const [cliente, setCliente] = useState("");
  const [descrizione, setDescrizione] = useState("");
  const [prezzo, setPrezzo] = useState("");
  const [loading, setLoading] = useState(false);
  const [pdfGeneratingId, setPdfGeneratingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  function openEdit(preventivo: Preventivo) {
    setError(null);
    setEditing(preventivo);
    setCliente(preventivo.cliente);
    setDescrizione(preventivo.descrizione ?? "");
    setPrezzo(String(getPreventivoTotale(preventivo)));
  }

  function closeEdit() {
    setEditing(null);
    setError(null);
  }

  async function handleUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;

    const clienteTrimmed = cliente.trim();
    const descrizioneTrimmed = descrizione.trim();
    const prezzoNumber = Number(prezzo);

    if (!clienteTrimmed || !descrizioneTrimmed) {
      setError("Cliente e descrizione sono obbligatori.");
      return;
    }
    if (!Number.isFinite(prezzoNumber) || prezzoNumber <= 0) {
      setError("Inserisci un prezzo valido maggiore di zero.");
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

    const { error: updateError } = await supabase
      .from("preventivi")
      .update({
        cliente: clienteTrimmed,
        descrizione: descrizioneTrimmed,
        prezzo: prezzoNumber,
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
      await generatePreventivoPdf(preventivo);
    } catch {
      setError("Errore durante la generazione del PDF.");
    } finally {
      setPdfGeneratingId(null);
    }
  }

  function handleWhatsApp(preventivo: Preventivo) {
    const totale = getPreventivoTotale(preventivo);
    const totaleFormatted = totale.toLocaleString("it-IT", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    const message = `Ciao, ti invio il preventivo di ${preventivo.cliente} per un totale di €${totaleFormatted}`;
    window.open(
      `https://wa.me/?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

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
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => handlePdf(preventivo)}
                        disabled={loading || pdfGeneratingId === preventivo.id}
                        className="btn-ghost hover:border-accent hover:text-accent"
                      >
                        {pdfGeneratingId === preventivo.id ? "PDF..." : "PDF"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleWhatsApp(preventivo)}
                        disabled={loading}
                        className="btn-ghost hover:border-[#25D366] hover:text-[#25D366]"
                      >
                        WhatsApp
                      </button>
                      <button
                        type="button"
                        onClick={() => openEdit(preventivo)}
                        disabled={loading}
                        className="btn-ghost hover:border-accent hover:text-accent"
                      >
                        Modifica
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(preventivo)}
                        disabled={loading}
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
            className="w-full max-w-lg card p-8 shadow-2xl shadow-black/40"
          >
            <h2 id="edit-title" className="text-2xl font-bold mb-6">
              Modifica <span className="text-accent">preventivo</span>
            </h2>

            <div className="mb-4">
              <label htmlFor="edit-cliente" className="block mb-2 text-muted text-sm">
                Cliente
              </label>
              <input
                id="edit-cliente"
                type="text"
                required
                value={cliente}
                onChange={(e) => setCliente(e.target.value)}
                className="input-field"
                disabled={loading}
              />
            </div>

            <div className="mb-4">
              <label htmlFor="edit-descrizione" className="block mb-2 text-muted text-sm">
                Descrizione
              </label>
              <textarea
                id="edit-descrizione"
                required
                value={descrizione}
                onChange={(e) => setDescrizione(e.target.value)}
                className="input-field h-28 resize-none"
                disabled={loading}
              />
            </div>

            <div className="mb-6">
              <label htmlFor="edit-prezzo" className="block mb-2 text-muted text-sm">
                Prezzo €
              </label>
              <input
                id="edit-prezzo"
                type="number"
                required
                min={0.01}
                step={0.01}
                value={prezzo}
                onChange={(e) => setPrezzo(e.target.value)}
                className="input-field"
                disabled={loading}
              />
            </div>

            {error && (
              <p className="mb-4 text-red-400 text-sm" role="alert">
                {error}
              </p>
            )}

            <div className="flex gap-3 justify-end">
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
