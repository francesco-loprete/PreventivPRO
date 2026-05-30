import type { SupabaseClient } from "@supabase/supabase-js";
import type { Preventivo, PreventivoInsert } from "@/lib/types/preventivo";
import { getPreventivoTotale } from "@/lib/types/preventivo";

const DUPLICATE_COLUMNS =
  "id, cliente, cliente_id, descrizione, prezzo, created_at, user_id" as const;

export async function duplicatePreventivo(
  supabase: SupabaseClient,
  userId: string,
  source: Preventivo
): Promise<
  | { ok: true; preventivo: Preventivo }
  | { ok: false; message: string; code?: string }
> {
  const payload: PreventivoInsert = {
    cliente: source.cliente,
    cliente_id: source.cliente_id ?? null,
    descrizione: source.descrizione ?? "",
    prezzo: getPreventivoTotale(source),
    user_id: userId,
  };

  const { data, error } = await supabase
    .from("preventivi")
    .insert(payload)
    .select(DUPLICATE_COLUMNS)
    .single();

  if (error || !data) {
    return {
      ok: false,
      message: error?.message ?? "Impossibile duplicare il preventivo.",
      code: error?.code,
    };
  }

  return { ok: true, preventivo: data as Preventivo };
}
