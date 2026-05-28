"use client";

import type { Voce } from "@/lib/preventivi/voci";

const inputCompact =
  "w-full min-w-0 bg-slate-950/60 border border-border rounded-lg px-2 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/20";

const rowGrid =
  "grid grid-cols-[minmax(0,1fr)_56px_72px_64px_64px_28px] gap-2 items-center flex-nowrap";

type VociEditorProps = {
  voci: Voce[];
  onChange: (voci: Voce[]) => void;
  disabled?: boolean;
  idPrefix?: string;
};

export function VociEditor({
  voci,
  onChange,
  disabled = false,
  idPrefix = "voce",
}: VociEditorProps) {
  function aggiornaVoce(index: number, campo: keyof Voce, valore: string | number) {
    onChange(
      voci.map((voce, i) => (i === index ? { ...voce, [campo]: valore } : voce))
    );
  }

  function aggiungiVoce() {
    onChange([
      ...voci,
      {
        descrizione: "",
        quantita: 1,
        unita: "pz",
        prezzo: 0,
      },
    ]);
  }

  function rimuoviVoce(index: number) {
    if (voci.length <= 1) return;
    onChange(voci.filter((_, i) => i !== index));
  }

  return (
    <div>
      <div className="overflow-x-auto -mx-1 px-1">
        <div className="min-w-[520px]">
          <div
            className={`${rowGrid} mb-2 text-xs text-muted uppercase tracking-wide`}
          >
            <span>Descrizione</span>
            <span className="text-center">Q.tà</span>
            <span className="text-center">U.M.</span>
            <span className="text-center">Prezzo</span>
            <span className="text-center">Totale</span>
            <span />
          </div>

          <div className="space-y-2">
            {voci.map((voce, index) => (
              <div key={`${idPrefix}-${index}`} className={rowGrid}>
                <input
                  id={index === 0 ? `${idPrefix}-descrizione` : undefined}
                  type="text"
                  required={index === 0}
                  value={voce.descrizione}
                  onChange={(e) =>
                    aggiornaVoce(index, "descrizione", e.target.value)
                  }
                  placeholder="Lavoro..."
                  className={inputCompact}
                  disabled={disabled}
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
                  disabled={disabled}
                />

                <input
                  type="text"
                  placeholder="pz"
                  value={voce.unita}
                  onChange={(e) => aggiornaVoce(index, "unita", e.target.value)}
                  className={`${inputCompact} text-center`}
                  disabled={disabled}
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
                  disabled={disabled}
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
                    disabled={disabled}
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
        disabled={disabled}
        className="mt-4 btn-secondary text-sm py-2 px-4"
      >
        + Aggiungi Riga
      </button>
    </div>
  );
}

export { inputCompact, rowGrid };
