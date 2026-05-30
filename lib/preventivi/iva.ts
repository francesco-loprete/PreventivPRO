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
