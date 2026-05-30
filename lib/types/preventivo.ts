export type Preventivo = {
  id: number;
  cliente: string;
  cliente_id?: number | null;
  descrizione?: string | null;
  prezzo?: number | null;
  aliquota_iva?: number | null;
  firma_cliente?: string | null;
  valido_fino_al?: string | null;
  totale?: number | null;
  created_at?: string | null;
  user_id: string;
};

export type PreventivoInsert = {
  cliente: string;
  cliente_id?: number | null;
  descrizione: string;
  prezzo: number;
  aliquota_iva?: number;
  valido_fino_al?: string | null;
  user_id: string;
};

export type PreventivoUpdate = Pick<
  Preventivo,
  "cliente" | "cliente_id" | "descrizione" | "prezzo" | "aliquota_iva" | "valido_fino_al"
>;

export function getPreventivoTotale(preventivo: Preventivo): number {
  return preventivo.totale ?? preventivo.prezzo ?? 0;
}

export function rlsErrorHint(code: string | undefined): string {
  if (code === "42501") {
    return " Permesso negato: esegui supabase/auth-rls-preventivi.sql in Supabase.";
  }
  return "";
}
