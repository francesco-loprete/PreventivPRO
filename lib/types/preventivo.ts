export type Preventivo = {
  id: number;
  cliente: string;
  descrizione?: string | null;
  prezzo?: number | null;
  totale?: number | null;
  created_at?: string | null;
  user_id: string;
};

export type PreventivoInsert = {
  cliente: string;
  descrizione: string;
  prezzo: number;
  user_id: string;
};

export type PreventivoUpdate = Pick<
  Preventivo,
  "cliente" | "descrizione" | "prezzo"
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
