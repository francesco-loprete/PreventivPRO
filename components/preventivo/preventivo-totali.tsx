"use client";

import {
  ALIQUOTE_IVA,
  calcolaRiepilogoIva,
  type AliquotaIva,
} from "@/lib/preventivi/iva";
import { formatImportoDisplay } from "@/lib/preventivi/voci";
import { useTranslations } from "@/components/i18n/locale-provider";

type PreventivoTotaliProps = {
  imponibile: number;
  aliquotaIva: AliquotaIva;
  onAliquotaIvaChange: (aliquota: AliquotaIva) => void;
  disabled?: boolean;
  idPrefix?: string;
  totaleGeneraleClassName?: string;
};

export function PreventivoTotali({
  imponibile,
  aliquotaIva,
  onAliquotaIvaChange,
  disabled = false,
  idPrefix = "preventivo",
  totaleGeneraleClassName = "text-3xl",
}: PreventivoTotaliProps) {
  const t = useTranslations();
  const riepilogo = calcolaRiepilogoIva(imponibile, aliquotaIva);

  return (
    <div className="mt-6 space-y-4">
      <div className="text-right">
        <p className="text-muted text-sm">{t("preventivo.totalGeneral")}</p>
        <p className={`font-bold text-accent ${totaleGeneraleClassName}`}>
          € {formatImportoDisplay(imponibile)}
        </p>
      </div>

      <div>
        <label
          htmlFor={`${idPrefix}-aliquota-iva`}
          className="block mb-2 text-muted text-sm"
        >
          {t("preventivo.vatRate")}
        </label>
        <select
          id={`${idPrefix}-aliquota-iva`}
          value={aliquotaIva}
          onChange={(event) =>
            onAliquotaIvaChange(Number(event.target.value) as AliquotaIva)
          }
          className="input-field max-w-xs"
          disabled={disabled}
        >
          {ALIQUOTE_IVA.map((aliquota) => (
            <option key={aliquota} value={aliquota}>
              {aliquota}%
            </option>
          ))}
        </select>
      </div>

      <dl className="border-t border-border pt-4 space-y-2 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-muted">{t("preventivo.taxableAmount")}</dt>
          <dd className="font-medium tabular-nums">
            € {formatImportoDisplay(riepilogo.imponibile)}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted">
            {t("preventivo.vatAmount", { rate: riepilogo.aliquota })}
          </dt>
          <dd className="font-medium tabular-nums">
            € {formatImportoDisplay(riepilogo.iva)}
          </dd>
        </div>
        <div className="flex justify-between gap-4 text-base">
          <dt className="font-semibold">{t("preventivo.totalWithVat")}</dt>
          <dd className="font-bold text-accent tabular-nums">
            € {formatImportoDisplay(riepilogo.totaleIvaInclusa)}
          </dd>
        </div>
      </dl>
    </div>
  );
}
