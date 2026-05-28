import type { SupabaseClient } from "@supabase/supabase-js";
import type { ClienteInsert } from "@/lib/types/cliente";

export type ClientePickerValue =
  | {
      mode: "existing";
      clienteId: number;
      nome: string;
    }
  | {
      mode: "new";
      nome: string;
      telefono: string;
      email: string;
      indirizzo: string;
      note: string;
    };

export function validateClientePickerValue(
  value: ClientePickerValue
): { ok: true } | { ok: false; message: string } {
  if (value.mode === "existing") {
    if (!value.clienteId) {
      return { ok: false, message: "Seleziona un cliente dall'archivio." };
    }
    if (!value.nome.trim()) {
      return { ok: false, message: "Cliente selezionato non valido." };
    }
    return { ok: true };
  }

  if (!value.nome.trim()) {
    return { ok: false, message: "Inserisci il nome del nuovo cliente." };
  }

  return { ok: true };
}

export async function resolveClienteForPreventivo(
  supabase: SupabaseClient,
  userId: string,
  value: ClientePickerValue
): Promise<
  | { ok: true; clienteId: number; clienteNome: string }
  | { ok: false; message: string }
> {
  const validation = validateClientePickerValue(value);
  if (!validation.ok) {
    return { ok: false, message: validation.message };
  }

  if (value.mode === "existing") {
    const { data, error } = await supabase
      .from("clienti")
      .select("id, nome")
      .eq("id", value.clienteId)
      .eq("user_id", userId)
      .maybeSingle();

    if (error || !data) {
      return { ok: false, message: "Cliente non trovato nell'archivio." };
    }

    return {
      ok: true,
      clienteId: data.id,
      clienteNome: data.nome.trim(),
    };
  }

  const payload: ClienteInsert = {
    user_id: userId,
    nome: value.nome.trim(),
    telefono: value.telefono.trim() || null,
    email: value.email.trim() || null,
    indirizzo: value.indirizzo.trim() || null,
    note: value.note.trim() || null,
  };

  const { data, error } = await supabase
    .from("clienti")
    .insert(payload)
    .select("id, nome")
    .single();

  if (error || !data) {
    return {
      ok: false,
      message: error?.message ?? "Impossibile creare il cliente.",
    };
  }

  return {
    ok: true,
    clienteId: data.id,
    clienteNome: data.nome.trim(),
  };
}
