"use client";

import {
  calcolaRiepilogoIva,
  getPreventivoTotaleVisualizzato,
  hasAliquotaIvaSalvata,
} from "@/lib/preventivi/iva";
import {
  calcolaTotaleRiga,
  formatImportoDisplay,
  parseVociFromDescrizione,
} from "@/lib/preventivi/voci";
import type { Preventivo } from "@/lib/types/preventivo";
import { getPreventivoTotale } from "@/lib/types/preventivo";

const euroFormatter = new Intl.NumberFormat("it-IT", {
  style: "currency",
  currency: "EUR",
});

const dateFormatter = new Intl.DateTimeFormat("it-IT", {
  dateStyle: "long",
  timeStyle: "short",
});

type PreventivoViewModalProps = {
  preventivo: Preventivo | null;
  onClose: () => void;
};

export function PreventivoViewModal({
  preventivo,
  onClose,
}: PreventivoViewModalProps) {
  if (!preventivo) return null;

  const imponibile = getPreventivoTotale(preventivo);
  const voci = parseVociFromDescrizione(preventivo.descrizione);
  const hasIva = hasAliquotaIvaSalvata(preventivo.aliquota_iva);
  const riepilogo = hasIva
    ? calcolaRiepilogoIva(imponibile, preventivo.aliquota_iva)
    : null;
  const totaleVisualizzato = getPreventivoTotaleVisualizzato(preventivo);

  const rows =
    voci.length > 0
      ? voci
      : [
          {
            descrizione: preventivo.descrizione?.trim() || "—",
            quantita: 1,
            unita: "—",
            prezzo: imponibile,
          },
        ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="preventivo-view-title"
    >
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto overflow-x-hidden card p-4 sm:p-6 md:p-8 shadow-2xl shadow-black/40 min-w-0">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h2 id="preventivo-view-title" className="text-2xl font-bold">
              Preventivo <span className="text-accent">N° {preventivo.id}</span>
            </h2>
            <p className="text-muted text-sm mt-1">{preventivo.cliente}</p>
            <p className="text-muted text-xs mt-1">
              {preventivo.created_at
                ? dateFormatter.format(new Date(preventivo.created_at))
                : "—"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary px-3 py-2 text-sm shrink-0"
          >
            Chiudi
          </button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-border mb-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted uppercase text-xs tracking-wide bg-slate-950/40">
                <th className="px-4 py-3">Descrizione</th>
                <th className="px-4 py-3 text-right">Q.tà</th>
                <th className="px-4 py-3">U.M.</th>
                <th className="px-4 py-3 text-right">Prezzo</th>
                <th className="px-4 py-3 text-right">Totale</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((voce, index) => (
                <tr
                  key={index}
                  className="border-b border-border/60 last:border-b-0"
                >
                  <td className="px-4 py-3">{voce.descrizione}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{voce.quantita}</td>
                  <td className="px-4 py-3 text-muted">{voce.unita}</td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {euroFormatter.format(voce.prezzo)}
                  </td>
                  <td className="px-4 py-3 text-right font-medium tabular-nums">
                    {euroFormatter.format(
                      calcolaTotaleRiga(voce.quantita, voce.prezzo)
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <dl className="border-t border-border pt-4 space-y-2 text-sm">
          {riepilogo ? (
            <>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Imponibile</dt>
                <dd className="font-medium tabular-nums">
                  € {formatImportoDisplay(riepilogo.imponibile)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">IVA ({riepilogo.aliquota}%)</dt>
                <dd className="font-medium tabular-nums">
                  € {formatImportoDisplay(riepilogo.iva)}
                </dd>
              </div>
              <div className="flex justify-between gap-4 text-base pt-2">
                <dt className="font-semibold">Totale IVA inclusa</dt>
                <dd className="font-bold text-accent tabular-nums">
                  {euroFormatter.format(totaleVisualizzato)}
                </dd>
              </div>
            </>
          ) : (
            <div className="flex justify-between gap-4 text-base">
              <dt className="font-semibold">Totale</dt>
              <dd className="font-bold text-accent tabular-nums">
                {euroFormatter.format(totaleVisualizzato)}
              </dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}
