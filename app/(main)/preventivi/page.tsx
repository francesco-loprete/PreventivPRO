import Link from "next/link";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { PreventiviTable } from "./preventivi-table";

export const dynamic = "force-dynamic";

export default async function PreventiviPage() {
  if (!isSupabaseConfigured()) {
    return (
      <div className="bg-[#1a1a1a] border border-amber-900/50 rounded-2xl p-8 text-amber-300">
        Supabase non configurato. Imposta{" "}
        <code className="text-green-400">NEXT_PUBLIC_SUPABASE_URL</code> e{" "}
        <code className="text-green-400">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>{" "}
        su Vercel o in <code className="text-green-400">.env.local</code>.
      </div>
    );
  }

  const supabase = await createClient();
  const { data: preventivi, error } = await supabase
    .from("Preventivi")
    .select("id, cliente, descrizione, prezzo")
    .order("id", { ascending: false });

  return (
    <>
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-4xl font-bold">Preventivi</h1>

        <Link
          href="/nuovo-preventivo"
          className="bg-green-500 text-black px-5 py-3 rounded-xl font-bold hover:bg-green-400"
        >
          + Nuovo Preventivo
        </Link>
      </div>

      {error ? (
        <div className="bg-[#1a1a1a] border border-red-900/50 rounded-2xl p-8 text-red-400">
          Errore nel caricamento: {error.message}
        </div>
      ) : !preventivi?.length ? (
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-12 text-center">
          <p className="text-gray-400 mb-6">Nessun preventivo salvato.</p>
          <Link
            href="/nuovo-preventivo"
            className="text-green-500 font-semibold hover:text-green-400"
          >
            Crea il primo preventivo
          </Link>
        </div>
      ) : (
        <PreventiviTable preventivi={preventivi} />
      )}
    </>
  );
}
