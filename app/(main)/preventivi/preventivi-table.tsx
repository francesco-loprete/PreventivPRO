"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { generatePreventivoPdf } from "@/lib/pdf/generate-preventivo-pdf";
import { createClient } from "@/lib/supabase/client";
import type { Preventivo } from "@/lib/types/preventivo";

const euroFormatter = new Intl.NumberFormat("it-IT", {
  style: "currency",
  currency: "EUR",
});

type PreventiviTableProps = {
  preventivi: Preventivo[];
};

function rlsHint(code: string | undefined) {
  if (code === "42501") {
    return " Permesso negato: esegui anche le policy update/delete in supabase/rls-preventivi.sql.";
  }
  return "";
}

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
    setDescrizione(preventivo.descrizione);
    setPrezzo(String(preventivo.prezzo));
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
    const { error: updateError } = await supabase
      .from("Preventivi")
      .update({
        cliente: clienteTrimmed,
        descrizione: descrizioneTrimmed,
        prezzo: prezzoNumber,
      })
      .eq("id", editing.id);

    setLoading(false);

    if (updateError) {
      setError(updateError.message + rlsHint(updateError.code));
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
    const { error: deleteError } = await supabase
      .from("Preventivi")
      .delete()
      .eq("id", preventivo.id);

    setLoading(false);

    if (deleteError) {
      setError(deleteError.message + rlsHint(deleteError.code));
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

  return (
    <>
      {error && !editing && (
        <p className="mb-4 text-red-400 text-sm" role="alert">
          {error}
        </p>
      )}

      <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-800 bg-black/40">
                <th className="px-6 py-4 text-sm font-semibold text-gray-400 uppercase tracking-wide">
                  Cliente
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-400 uppercase tracking-wide">
                  Descrizione
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-400 uppercase tracking-wide text-right">
                  Prezzo
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-400 uppercase tracking-wide text-right">
                  Azioni
                </th>
              </tr>
            </thead>
            <tbody>
              {initialPreventivi.map((preventivo) => (
                <tr
                  key={preventivo.id}
                  className="border-b border-gray-800/80 last:border-b-0 hover:bg-white/[0.03] transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-white whitespace-nowrap">
                    {preventivo.cliente}
                  </td>
                  <td className="px-6 py-4 text-gray-300 max-w-md">
                    {preventivo.descrizione}
                  </td>
                  <td className="px-6 py-4 text-green-400 font-semibold text-right whitespace-nowrap">
                    {euroFormatter.format(preventivo.prezzo)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => handlePdf(preventivo)}
                        disabled={loading || pdfGeneratingId === preventivo.id}
                        className="px-3 py-1.5 text-sm rounded-lg border border-gray-600 text-gray-300 hover:border-sky-500 hover:text-sky-400 transition-colors disabled:opacity-50"
                      >
                        {pdfGeneratingId === preventivo.id ? "PDF..." : "PDF"}
                      </button>
                      <button
                        type="button"
                        onClick={() => openEdit(preventivo)}
                        disabled={loading}
                        className="px-3 py-1.5 text-sm rounded-lg border border-gray-600 text-gray-300 hover:border-green-500 hover:text-green-400 transition-colors disabled:opacity-50"
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-title"
        >
          <form
            onSubmit={handleUpdate}
            className="w-full max-w-lg bg-[#1a1a1a] border border-gray-800 rounded-2xl p-8 shadow-2xl"
          >
            <h2 id="edit-title" className="text-2xl font-bold text-green-500 mb-6">
              Modifica preventivo
            </h2>

            <div className="mb-4">
              <label htmlFor="edit-cliente" className="block mb-2 text-gray-400">
                Cliente
              </label>
              <input
                id="edit-cliente"
                type="text"
                required
                value={cliente}
                onChange={(e) => setCliente(e.target.value)}
                className="w-full bg-black border border-gray-700 rounded-xl p-4"
                disabled={loading}
              />
            </div>

            <div className="mb-4">
              <label htmlFor="edit-descrizione" className="block mb-2 text-gray-400">
                Descrizione
              </label>
              <textarea
                id="edit-descrizione"
                required
                value={descrizione}
                onChange={(e) => setDescrizione(e.target.value)}
                className="w-full bg-black border border-gray-700 rounded-xl p-4 h-28"
                disabled={loading}
              />
            </div>

            <div className="mb-6">
              <label htmlFor="edit-prezzo" className="block mb-2 text-gray-400">
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
                className="w-full bg-black border border-gray-700 rounded-xl p-4"
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
                className="px-5 py-3 rounded-xl border border-gray-600 text-gray-300 hover:border-gray-500 disabled:opacity-50"
              >
                Annulla
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-3 rounded-xl bg-green-500 text-black font-bold hover:bg-green-400 disabled:opacity-50"
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
