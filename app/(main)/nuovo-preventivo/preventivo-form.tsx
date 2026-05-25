"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function PreventivoForm() {
  const router = useRouter();
  const [cliente, setCliente] = useState("");
  const [descrizione, setDescrizione] = useState("");
  const [prezzo, setPrezzo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(false);

    const clienteTrimmed = cliente.trim();
    const descrizioneTrimmed = descrizione.trim();
    const prezzoNumber = Number(prezzo);

    if (!clienteTrimmed) {
      setError("Inserisci il nome del cliente.");
      return;
    }
    if (!descrizioneTrimmed) {
      setError("Inserisci la descrizione del lavoro.");
      return;
    }
    if (!Number.isFinite(prezzoNumber) || prezzoNumber <= 0) {
      setError("Inserisci un prezzo valido maggiore di zero.");
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      setError("Sessione scaduta. Accedi di nuovo.");
      return;
    }

    const row: {
      cliente: string;
      descrizione: string;
      prezzo: number;
      user_id?: string;
    } = {
      cliente: clienteTrimmed,
      descrizione: descrizioneTrimmed,
      prezzo: prezzoNumber,
      user_id: user.id,
    };

    const { error: insertError } = await supabase.from("Preventivi").insert(row);

    setLoading(false);

    if (insertError) {
      if (insertError.code === "42501") {
        setError(
          "Permesso negato: abilita le policy RLS per la tabella Preventivi in Supabase (vedi supabase/rls-preventivi.sql)."
        );
      } else {
        setError(insertError.message);
      }
      return;
    }

    setSuccess(true);
    setCliente("");
    setDescrizione("");
    setPrezzo("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="bg-[#1a1a1a] p-8 rounded-2xl max-w-3xl">
      <div className="mb-6">
        <label htmlFor="cliente" className="block mb-2 text-gray-400">
          Nome Cliente
        </label>
        <input
          id="cliente"
          name="cliente"
          type="text"
          required
          value={cliente}
          onChange={(e) => setCliente(e.target.value)}
          placeholder="Mario Rossi"
          className="w-full bg-black border border-gray-700 rounded-xl p-4"
          disabled={loading}
        />
      </div>

      <div className="mb-6">
        <label htmlFor="descrizione" className="block mb-2 text-gray-400">
          Descrizione Lavoro
        </label>
        <textarea
          id="descrizione"
          name="descrizione"
          required
          value={descrizione}
          onChange={(e) => setDescrizione(e.target.value)}
          placeholder="Sito web aziendale..."
          className="w-full bg-black border border-gray-700 rounded-xl p-4 h-32"
          disabled={loading}
        />
      </div>

      <div className="mb-6">
        <label htmlFor="prezzo" className="block mb-2 text-gray-400">
          Prezzo €
        </label>
        <input
          id="prezzo"
          name="prezzo"
          type="number"
          required
          min={0.01}
          step={0.01}
          value={prezzo}
          onChange={(e) => setPrezzo(e.target.value)}
          placeholder="1500"
          className="w-full bg-black border border-gray-700 rounded-xl p-4"
          disabled={loading}
        />
      </div>

      {error && (
        <p className="mb-4 text-red-400 text-sm" role="alert">
          {error}
        </p>
      )}

      {success && (
        <p className="mb-4 text-green-400 text-sm" role="status">
          Preventivo salvato su Supabase.
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="bg-green-500 text-black px-6 py-4 rounded-xl font-bold hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Salvataggio..." : "Salva Preventivo"}
      </button>
    </form>
  );
}
