"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { PreventivoInsert } from "@/lib/types/preventivo";
import { rlsErrorHint } from "@/lib/types/preventivo";

type Voce = {
  descrizione: string;
  quantita: number;
  unita: string;
  prezzo: number;
};

const inputCompact =
  "w-full min-w-0 bg-slate-950/60 border border-border rounded-lg px-2 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/20";

const rowGrid =
  "grid grid-cols-[minmax(0,1fr)_56px_72px_64px_64px_28px] gap-2 items-center flex-nowrap";

export function PreventivoForm() {
  const router = useRouter();
  const [cliente, setCliente] = useState("");
  const [descrizione, setDescrizione] = useState("");
  const [prezzo, setPrezzo] = useState("");
  const [quantita, setQuantita] = useState("");
  const [voci, setVoci] = useState<Voce[]>([
    {
      descrizione: "",
      quantita: 1,
      unita: "pz",
      prezzo: 0,
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const aggiungiVoce = () => {
    setVoci([
      ...voci,
      {
        descrizione: "",
        quantita: 1,
        unita: "pz",
        prezzo: 0,
      },
    ]);
  };

  const totaleGenerale = voci.reduce(
    (totale, voce) => totale + (voce.quantita * voce.prezzo),
    0
  );

  function aggiornaVoce(index: number, campo: keyof Voce, valore: string | number) {
    const nuoveVoci = voci.map((voce, i) =>
      i === index ? { ...voce, [campo]: valore } : voce
    );
    setVoci(nuoveVoci);

    if (index === 0) {
      const prima = nuoveVoci[0];
      setDescrizione(prima.descrizione);
      setQuantita(String(prima.quantita));
      setPrezzo(String(prima.prezzo));
    }
  }

  function rimuoviVoce(index: number) {
    if (voci.length <= 1) return;
    setVoci(voci.filter((_, i) => i !== index));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(false);

    const clienteTrimmed = cliente.trim();
    const vociValide = voci.filter((v) => v.descrizione.trim());

    if (!clienteTrimmed) {
      setError("Inserisci il nome del cliente.");
      return;
    }

    if (vociValide.length === 0) {
      setError("Aggiungi almeno una voce con descrizione.");
      return;
    }

    const voceInvalida = vociValide.find(
      (v) => !Number.isFinite(v.quantita) || v.quantita <= 0 || v.prezzo < 0
    );
    if (voceInvalida) {
      setError("Quantità e prezzo devono essere valori validi (quantità > 0).");
      return;
    }

    if (totaleGenerale <= 0) {
      setError("Il totale generale deve essere maggiore di zero.");
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

      const vociDaSalvare = vociValide.map((v) => ({
        descrizione: v.descrizione.trim(),
        quantita: v.quantita,
        unita: v.unita.trim() || "pz",
        prezzo: v.prezzo,
      }));

      const totale = voci.reduce(
        (totale, voce) => totale + (voce.quantita * voce.prezzo),
        0
      );

      const descrizioneFinale = vociDaSalvare
        .map(
          (v) =>
            `${v.descrizione} (${v.quantita} ${v.unita} × €${v.prezzo} = €${v.quantita * v.prezzo})`
        )
        .join("\n");

      const payload: PreventivoInsert = {
        cliente: clienteTrimmed,
        descrizione: descrizioneFinale,
        prezzo: totale,
        user_id: user.id,
      };

      const { error: insertError } = await supabase.from("preventivi").insert(payload);

      if (insertError) {
        setError(insertError.message + rlsErrorHint(insertError.code));
        return;
      }

      setSuccess(true);
      setCliente("");
      setDescrizione("");
      setPrezzo("");
      setQuantita("");
      setVoci([{ descrizione: "", quantita: 1, unita: "pz", prezzo: 0 }]);
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

        <div className="overflow-x-auto -mx-1 px-1">
          <div className="min-w-[520px]">
            <div className={`${rowGrid} mb-2 text-xs text-muted uppercase tracking-wide`}>
              <span>Descrizione</span>
              <span className="text-center">Q.tà</span>
              <span className="text-center">U.M.</span>
              <span className="text-center">Prezzo</span>
              <span className="text-center">Totale</span>
              <span />
            </div>

            <div className="space-y-2">
              {voci.map((voce, index) => (
                <div key={index} className={rowGrid}>
                  <input
                    id={index === 0 ? "descrizione" : undefined}
                    name={index === 0 ? "descrizione" : undefined}
                    type="text"
                    required={index === 0}
                    value={voce.descrizione}
                    onChange={(e) =>
                      aggiornaVoce(index, "descrizione", e.target.value)
                    }
                    placeholder="Lavoro..."
                    className={inputCompact}
                    disabled={loading}
                  />

                  <input
                    type="number"
                    min={1}
                    step={1}
                    placeholder="1"
                    value={voce.quantita}
                    onChange={(e) =>
                      aggiornaVoce(index, "quantita", Number(e.target.value) || 0)
                    }
                    className={`${inputCompact} text-center`}
                    disabled={loading}
                  />

                  <input
                    type="text"
                    placeholder="pz"
                    value={voce.unita}
                    onChange={(e) => aggiornaVoce(index, "unita", e.target.value)}
                    className={`${inputCompact} text-center`}
                    disabled={loading}
                    title="Unità di misura"
                  />

                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    placeholder="100"
                    value={voce.prezzo}
                    onChange={(e) =>
                      aggiornaVoce(index, "prezzo", Number(e.target.value) || 0)
                    }
                    className={`${inputCompact} text-center`}
                    disabled={loading}
                  />

                  <input
                    type="text"
                    value={voce.quantita * voce.prezzo}
                    readOnly
                    tabIndex={-1}
                    className={`${inputCompact} text-center bg-slate-900/80 text-accent font-medium`}
                  />

                  {voci.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => rimuoviVoce(index)}
                      disabled={loading}
                      className="text-red-400 hover:text-red-300 text-sm leading-none"
                      aria-label="Rimuovi riga"
                    >
                      ✕
                    </button>
                  ) : (
                    <span />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={aggiungiVoce}
          disabled={loading}
          className="mt-4 btn-secondary text-sm py-2 px-4"
        >
          + Aggiungi Riga
        </button>
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
        <p className="text-3xl font-bold text-accent">
          € {totaleGenerale}
        </p>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn-primary px-6 py-4"
      >
        {loading ? "Salvataggio..." : "Salva Preventivo"}
      </button>
    </form>
  );
}
