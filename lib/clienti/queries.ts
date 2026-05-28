import { createClient } from "@/lib/supabase/server";
import type { Cliente } from "@/lib/types/cliente";

const CLIENTE_COLUMNS =
  "id, user_id, nome, telefono, email, indirizzo, note, created_at" as const;

export type UserClientiResult =
  | { ok: true; clienti: Cliente[]; userId: string }
  | { ok: false; reason: "unauthenticated" }
  | { ok: false; reason: "query"; message: string };

export async function getUserClienti(): Promise<UserClientiResult> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { ok: false, reason: "unauthenticated" };
  }

  const { data, error } = await supabase
    .from("clienti")
    .select(CLIENTE_COLUMNS)
    .eq("user_id", user.id)
    .order("nome", { ascending: true });

  if (error) {
    return { ok: false, reason: "query", message: error.message };
  }

  return {
    ok: true,
    clienti: (data ?? []) as Cliente[],
    userId: user.id,
  };
}

export async function getUserClientiCount(): Promise<number> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return 0;

  const { count, error } = await supabase
    .from("clienti")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  if (error) return 0;
  return count ?? 0;
}
