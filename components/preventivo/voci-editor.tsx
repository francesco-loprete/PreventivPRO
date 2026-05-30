"use client";

import type { Voce } from "@/lib/preventivi/voci";
import {
  calcolaTotaleRiga,
  formatImportoDisplay,
  formatPrezzoDisplay,
  formatQuantitaDisplay,
  parsePrezzoInput,
  parseQuantitaInput,
} from "@/lib/preventivi/voci";
import { useTranslations } from "@/components/i18n/locale-provider";

const inputCompact =
  "w-full min-w-0 max-w-full box-border bg-slate-950/60 border border-border rounded-lg px-2 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/20";

const rowGrid =
  "md:grid md:grid-cols-[minmax(0,1fr)_56px_72px_64px_64px_28px] md:gap-2 md:items-center";

const mobileLabel =
  "md:hidden text-xs text-muted uppercase tracking-wide mb-1 block";

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
  const t = useTranslations();

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
    <div className="voci-editor-root w-full min-w-0 max-w-full overflow-x-hidden">
      <div className="hidden md:grid md:grid-cols-[minmax(0,1fr)_56px_72px_64px_64px_28px] md:gap-2 mb-2 text-xs text-muted uppercase tracking-wide">
        <span>{t("preventivo.description")}</span>
        <span className="text-center">{t("preventivo.qty")}</span>
        <span className="text-center">{t("preventivo.unit")}</span>
        <span className="text-center">{t("preventivo.price")}</span>
        <span className="text-center">{t("preventivo.total")}</span>
        <span />
      </div>

      <div className="space-y-3 md:space-y-2 w-full min-w-0">
        {voci.map((voce, index) => (
          <article
            key={`${idPrefix}-${index}`}
            className={`w-full min-w-0 max-w-full box-border rounded-xl border border-border bg-slate-950/30 p-4 max-md:space-y-3 md:rounded-none md:border-0 md:bg-transparent md:p-0 ${rowGrid}`}
          >
            <div className="flex items-center justify-between gap-2 md:hidden">
              <span className="text-xs text-muted uppercase tracking-wide">
                {t("preventivo.row", { n: index + 1 })}
              </span>
              {voci.length > 1 && (
                <button
                  type="button"
                  onClick={() => rimuoviVoce(index)}
                  disabled={disabled}
                  className="text-red-400 hover:text-red-300 text-sm px-2 py-1 shrink-0"
                  aria-label={t("preventivo.removeRow")}
                >
                  {t("preventivo.removeRow")}
                </button>
              )}
            </div>

            <div className="w-full min-w-0 md:min-w-0">
              <label htmlFor={`${idPrefix}-desc-${index}`} className={mobileLabel}>
                {t("preventivo.description")}
              </label>
              <input
                id={index === 0 ? `${idPrefix}-descrizione` : `${idPrefix}-desc-${index}`}
                type="text"
                required={index === 0}
                value={voce.descrizione}
                onChange={(e) =>
                  aggiornaVoce(index, "descrizione", e.target.value)
                }
                placeholder={t("preventivo.workPlaceholder")}
                className={inputCompact}
                disabled={disabled}
              />
            </div>

            <div className="voce-fields-grid grid grid-cols-2 gap-3 w-full min-w-0 md:contents">
              <div className="min-w-0">
                <label className={mobileLabel}>{t("preventivo.qty")}</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="1"
                  value={formatQuantitaDisplay(voce.quantita)}
                  onChange={(e) =>
                    aggiornaVoce(index, "quantita", parseQuantitaInput(e.target.value))
                  }
                  className={`${inputCompact} md:text-center`}
                  disabled={disabled}
                  aria-label={t("preventivo.qty")}
                />
              </div>

              <div className="min-w-0">
                <label className={mobileLabel}>{t("preventivo.unit")}</label>
                <input
                  type="text"
                  placeholder="pz"
                  value={voce.unita}
                  onChange={(e) => aggiornaVoce(index, "unita", e.target.value)}
                  className={`${inputCompact} md:text-center`}
                  disabled={disabled}
                  aria-label={t("preventivo.unit")}
                />
              </div>

              <div className="min-w-0">
                <label className={mobileLabel}>{t("preventivo.price")}</label>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="100"
                  value={formatPrezzoDisplay(voce.prezzo)}
                  onChange={(e) =>
                    aggiornaVoce(index, "prezzo", parsePrezzoInput(e.target.value))
                  }
                  className={`${inputCompact} md:text-center`}
                  disabled={disabled}
                  aria-label={t("preventivo.price")}
                />
              </div>

              <div className="min-w-0">
                <label className={mobileLabel}>{t("preventivo.total")}</label>
                <input
                  type="text"
                  value={formatImportoDisplay(
                    calcolaTotaleRiga(voce.quantita, voce.prezzo)
                  )}
                  readOnly
                  tabIndex={-1}
                  className={`${inputCompact} md:text-center bg-slate-900/80 text-accent font-medium`}
                  aria-label={t("preventivo.total")}
                />
              </div>
            </div>

            {voci.length > 1 ? (
              <button
                type="button"
                onClick={() => rimuoviVoce(index)}
                disabled={disabled}
                className="hidden md:inline text-red-400 hover:text-red-300 text-sm leading-none justify-self-center"
                aria-label={t("preventivo.removeRow")}
              >
                ✕
              </button>
            ) : (
              <span className="hidden md:block" />
            )}
          </article>
        ))}
      </div>

      <button
        type="button"
        onClick={aggiungiVoce}
        disabled={disabled}
        className="mt-4 btn-secondary text-sm py-2 px-4 w-full md:w-auto"
      >
        {t("preventivo.addRow")}
      </button>
    </div>
  );
}

export { inputCompact, rowGrid };
