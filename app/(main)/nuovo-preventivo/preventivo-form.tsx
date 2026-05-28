"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { VociEditor } from "@/components/preventivo/voci-editor";
import {
  calcolaTotaleVoci,
  createEmptyVoce,
  validateVoci,
  vociToDescrizione,
  type Voce,
} from "@/lib/preventivi/voci";
import { createClient } from "@/lib/supabase/client";
import type { PreventivoInsert } from "@/lib/types/preventivo";
import { rlsErrorHint } from "@/lib/types/preventivo";

export function PreventivoForm() {
  const router = useRouter();
  const [cliente, setCliente] = useState("");
  const [voci, setVoci] = useState<Voce[]>([createEmptyVoce()]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const totaleGenerale = calcolaTotaleVoci(voci);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(false);

    const clienteTrimmed = cliente.trim();

    if (!clienteTrimmed) {
      setError("Inserisci il nome del cliente.");
      return;
    }

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

      const payload: PreventivoInsert = {
        cliente: clienteTrimmed,
        descrizione: vociToDescrizione(validation.voci),
        prezzo: validation.totale,
        user_id: user.id,
      };

      const { error: insertError } = await supabase.from("preventivi").insert(payload);

      if (insertError) {
        setError(insertError.message + rlsErrorHint(insertError.code));
        return;
      }

      setSuccess(true);
      setCliente("");
      setVoci([createEmptyVoce()]);
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
    <form onSubmit={handleSubmit} className="card p-8 max-w-4xl">
      <div className="mb-6">
        <label htmlFor="cliente" className="block mb-2 text-muted text-sm">
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
          className="input-field"
          disabled={loading}
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
        <p className="mb-4 text-red-400 text-sm" role="alert">
          {error}
        </p>
      )}

      {success && (
        <p className="mb-4 text-accent text-sm" role="status">
          Preventivo salvato su Supabase.
        </p>
      )}

      <div className="mt-6 text-right mb-6">
        <p className="text-muted text-sm">Totale Generale</p>
        <p className="text-3xl font-bold text-accent">€ {totaleGenerale}</p>
      </div>

      <button type="submit" disabled={loading} className="btn-primary px-6 py-4">
        {loading ? "Salvataggio..." : "Salva Preventivo"}
      </button>
    </form>
  );
}
