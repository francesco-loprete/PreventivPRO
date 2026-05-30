export const ALIQUOTE_IVA = [0, 4, 10, 22] as const;

export type AliquotaIva = (typeof ALIQUOTE_IVA)[number];

export const DEFAULT_ALIQUOTA_IVA: AliquotaIva = 22;

export type RiepilogoIva = {
  imponibile: number;
  aliquota: AliquotaIva;
  iva: number;
  totaleIvaInclusa: number;
};

export function isAliquotaIva(value: number): value is AliquotaIva {
  return (ALIQUOTE_IVA as readonly number[]).includes(value);
}

/** Preventivi esistenti senza aliquota salvata → default 22%. */
export function normalizeAliquotaIva(
  value: number | null | undefined
): AliquotaIva {
  if (value != null && isAliquotaIva(value)) {
    return value;
  }
  return DEFAULT_ALIQUOTA_IVA;
}

export function calcolaRiepilogoIva(
  imponibile: number,
  aliquota: number | null | undefined
): RiepilogoIva {
  const aliquotaNormalizzata = normalizeAliquotaIva(aliquota);
  const iva = imponibile * (aliquotaNormalizzata / 100);

  return {
    imponibile,
    aliquota: aliquotaNormalizzata,
    iva,
    totaleIvaInclusa: imponibile + iva,
  };
}

export function hasAliquotaIvaSalvata(
  aliquota: number | null | undefined
): aliquota is AliquotaIva {
  return aliquota != null && isAliquotaIva(aliquota);
}

/** Totale da mostrare in liste e riepiloghi: IVA inclusa se aliquota salvata, altrimenti imponibile. */
export function getPreventivoTotaleVisualizzato(preventivo: {
  prezzo?: number | null;
  totale?: number | null;
  aliquota_iva?: number | null;
}): number {
  const imponibile = preventivo.totale ?? preventivo.prezzo ?? 0;

  if (!hasAliquotaIvaSalvata(preventivo.aliquota_iva)) {
    return imponibile;
  }

  const iva = imponibile * (preventivo.aliquota_iva / 100);
  return imponibile + iva;
}
