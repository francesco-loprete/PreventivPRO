import { createClient } from "@/lib/supabase/server";
import type { Preventivo } from "@/lib/types/preventivo";

const PREVENTIVO_COLUMNS =
  "id, cliente, cliente_id, descrizione, prezzo, created_at, user_id" as const;

export type UserPreventiviResult =
  | { ok: true; preventivi: Preventivo[]; userId: string }
  | { ok: false; reason: "unauthenticated" }
  | { ok: false; reason: "query"; message: string };

export async function getUserPreventivi(): Promise<UserPreventiviResult> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { ok: false, reason: "unauthenticated" };
  }

  const { data, error } = await supabase
    .from("preventivi")
    .select(PREVENTIVO_COLUMNS)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return { ok: false, reason: "query", message: error.message };
  }

  return {
    ok: true,
    preventivi: (data ?? []) as Preventivo[],
    userId: user.id,
  };
}

export async function requireAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { ok: false as const };
  }

  return { ok: true as const, user, supabase };
}
