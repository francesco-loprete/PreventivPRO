export type Voce = {
  descrizione: string;
  quantita: number;
  unita: string;
  prezzo: number;
};

export function createEmptyVoce(): Voce {
  return {
    descrizione: "",
    quantita: 1,
    unita: "pz",
    prezzo: 0,
  };
}

export function parseVociFromDescrizione(
  descrizione: string | null | undefined
): Voce[] {
  if (!descrizione?.trim()) return [];

  const voci: Voce[] = [];

  for (const line of descrizione.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const withUnit =
      /^(.+?) \((\d+(?:[.,]\d+)?) (\S+) × €(\d+(?:[.,]\d+)?) = €(\d+(?:[.,]\d+)?)\)$/;
    const withoutUnit =
      /^(.+?) \((\d+(?:[.,]\d+)?) × €(\d+(?:[.,]\d+)?)(?: = €(\d+(?:[.,]\d+)?))?\)$/;

    const matchUnit = trimmed.match(withUnit);
    if (matchUnit) {
      voci.push({
        descrizione: matchUnit[1].trim(),
        quantita: Number(matchUnit[2].replace(",", ".")),
        unita: matchUnit[3],
        prezzo: Number(matchUnit[4].replace(",", ".")),
      });
      continue;
    }

    const matchSimple = trimmed.match(withoutUnit);
    if (matchSimple) {
      voci.push({
        descrizione: matchSimple[1].trim(),
        quantita: Number(matchSimple[2].replace(",", ".")),
        unita: "pz",
        prezzo: Number(matchSimple[3].replace(",", ".")),
      });
      continue;
    }

    voci.push({
      descrizione: trimmed,
      quantita: 1,
      unita: "pz",
      prezzo: 0,
    });
  }

  return voci;
}

export function vociToDescrizione(voci: Voce[]): string {
  return voci
    .map((v) => {
      const unita = v.unita.trim() || "pz";
      const totale = v.quantita * v.prezzo;
      return `${v.descrizione.trim()} (${v.quantita} ${unita} × €${v.prezzo} = €${totale})`;
    })
    .join("\n");
}

export function calcolaTotaleVoci(voci: Voce[]): number {
  return voci.reduce((totale, voce) => totale + voce.quantita * voce.prezzo, 0);
}

export type VociValidationResult =
  | { ok: true; voci: Voce[]; totale: number }
  | { ok: false; message: string };

export function validateVoci(voci: Voce[]): VociValidationResult {
  const vociValide = voci.filter((v) => v.descrizione.trim());

  if (vociValide.length === 0) {
    return { ok: false, message: "Aggiungi almeno una voce con descrizione." };
  }

  const voceInvalida = vociValide.find(
    (v) => !Number.isFinite(v.quantita) || v.quantita <= 0 || v.prezzo < 0
  );

  if (voceInvalida) {
    return {
      ok: false,
      message: "Quantità e prezzo devono essere valori validi (quantità > 0).",
    };
  }

  const totale = calcolaTotaleVoci(vociValide);

  if (totale <= 0) {
    return {
      ok: false,
      message: "Il totale generale deve essere maggiore di zero.",
    };
  }

  return {
    ok: true,
    voci: vociValide.map((v) => ({
      descrizione: v.descrizione.trim(),
      quantita: v.quantita,
      unita: v.unita.trim() || "pz",
      prezzo: v.prezzo,
    })),
    totale,
  };
}

export function vociFromPreventivo(
  descrizione: string | null | undefined,
  prezzoFallback: number
): Voce[] {
  const parsed = parseVociFromDescrizione(descrizione);

  if (parsed.length > 0) {
    return parsed.map((v) => ({
      ...v,
      unita: v.unita === "—" ? "pz" : v.unita,
    }));
  }

  if (descrizione?.trim()) {
    return [
      {
        descrizione: descrizione.trim(),
        quantita: 1,
        unita: "pz",
        prezzo: prezzoFallback,
      },
    ];
  }

  return [createEmptyVoce()];
}
