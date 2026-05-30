"use client";

import type { Preventivo } from "@/lib/types/preventivo";

type PreventivoRowActionsProps = {
  preventivo: Preventivo;
  onApri?: () => void;
  onModifica: () => void;
  onPdf: () => void;
  onWhatsApp: () => void;
  onDuplica: () => void;
  onElimina?: () => void;
  isBusy: boolean;
  modificaDisabled?: boolean;
  duplicatingId: number | null;
  pdfGeneratingId: number | null;
  whatsappSharingId: number | null;
  showApri?: boolean;
  showElimina?: boolean;
};

export function PreventivoRowActions({
  preventivo,
  onApri,
  onModifica,
  onPdf,
  onWhatsApp,
  onDuplica,
  onElimina,
  isBusy,
  modificaDisabled = false,
  duplicatingId,
  pdfGeneratingId,
  whatsappSharingId,
  showApri = false,
  showElimina = false,
}: PreventivoRowActionsProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:flex-wrap items-end sm:items-center justify-end gap-2 min-w-[148px] sm:min-w-0">
      <div className="flex items-center justify-end gap-1.5 flex-wrap w-full">
        {showApri && onApri && (
          <button
            type="button"
            onClick={onApri}
            disabled={isBusy}
            className="btn-ghost hover:border-accent hover:text-accent shrink-0 px-3 py-1.5 text-sm font-medium"
          >
            Apri
          </button>
        )}
        <button
          type="button"
          onClick={onModifica}
          disabled={modificaDisabled}
          className="btn-ghost hover:border-accent hover:text-accent shrink-0 px-3 py-1.5 text-sm font-medium"
        >
          Modifica
        </button>
        <button
          type="button"
          onClick={onDuplica}
          disabled={isBusy}
          className="btn-ghost hover:border-accent hover:text-accent shrink-0 px-3 py-1.5 text-sm font-medium"
          aria-label={`Duplica preventivo ${preventivo.cliente}`}
        >
          {duplicatingId === preventivo.id ? "..." : "Duplica"}
        </button>
      </div>
      <div className="flex items-center justify-end gap-1.5 flex-wrap w-full">
        <button
          type="button"
          onClick={onPdf}
          disabled={isBusy}
          className="btn-ghost hover:border-accent hover:text-accent min-w-[52px] shrink-0 px-3 py-1.5 text-sm font-medium"
          aria-label={`Scarica PDF preventivo ${preventivo.cliente}`}
        >
          {pdfGeneratingId === preventivo.id ? "PDF..." : "PDF"}
        </button>
        <button
          type="button"
          onClick={onWhatsApp}
          disabled={isBusy}
          className="btn-ghost hover:border-[#25D366] hover:text-[#25D366] min-w-[52px] shrink-0 px-3 py-1.5 text-sm font-medium"
          aria-label={`Condividi preventivo ${preventivo.cliente} su WhatsApp`}
        >
          {whatsappSharingId === preventivo.id ? "..." : "WhatsApp"}
        </button>
        {showElimina && onElimina && (
          <button
            type="button"
            onClick={onElimina}
            disabled={modificaDisabled}
            className="px-3 py-1.5 text-sm rounded-lg border border-red-900/60 text-red-400 hover:bg-red-950/80 hover:border-red-700 transition-colors disabled:opacity-50 shrink-0"
          >
            Elimina
          </button>
        )}
      </div>
    </div>
  );
}
