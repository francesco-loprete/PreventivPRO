export type Cliente = {
  id: number;
  user_id: string;
  nome: string;
  telefono?: string | null;
  email?: string | null;
  indirizzo?: string | null;
  note?: string | null;
  created_at?: string | null;
};

export type ClienteInsert = {
  user_id: string;
  nome: string;
  telefono?: string | null;
  email?: string | null;
  indirizzo?: string | null;
  note?: string | null;
};

export type ClienteUpdate = Pick<
  Cliente,
  "nome" | "telefono" | "email" | "indirizzo" | "note"
>;

export function rlsClientiErrorHint(code: string | undefined): string {
  if (code === "42501") {
    return " Permesso negato: esegui supabase/clienti-archivio.sql in Supabase.";
  }
  return "";
}

export function formatClienteLabel(cliente: Cliente): string {
  const parts = [cliente.nome];
  if (cliente.telefono?.trim()) parts.push(cliente.telefono.trim());
  return parts.join(" · ");
}
