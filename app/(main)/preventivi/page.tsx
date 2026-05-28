import Link from "next/link";
import { redirect } from "next/navigation";
import { getUserClienti } from "@/lib/clienti/queries";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getUserPreventivi } from "@/lib/preventivi/queries";
import { PreventiviTable } from "./preventivi-table";

export const dynamic = "force-dynamic";

export default async function PreventiviPage() {
  if (!isSupabaseConfigured()) {
    return (
      <div className="card p-8 text-amber-300 border-amber-900/40">
        Supabase non configurato. Imposta{" "}
        <code className="text-accent">NEXT_PUBLIC_SUPABASE_URL</code> e{" "}
        <code className="text-accent">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> su
        Vercel o in <code className="text-accent">.env.local</code>.
      </div>
    );
  }

  const result = await getUserPreventivi();
  const clientiResult = await getUserClienti();
  const clienti = clientiResult.ok ? clientiResult.clienti : [];

  if (!result.ok) {
    if (result.reason === "unauthenticated") {
      redirect("/login?redirectTo=/preventivi");
    }

    return (
      <>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <h1 className="text-4xl font-bold tracking-tight">Preventivi</h1>
        </div>
        <div className="card p-8 text-red-400 border-red-900/40">
          Errore nel caricamento: {result.message}
        </div>
      </>
    );
  }

  const { preventivi } = result;

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <h1 className="text-4xl font-bold tracking-tight">Preventivi</h1>

        <Link href="/nuovo-preventivo" className="btn-primary text-center">
          + Nuovo Preventivo
        </Link>
      </div>

      {!preventivi.length ? (
        <div className="card p-12 text-center">
          <p className="text-muted mb-6">Nessun preventivo salvato.</p>
          <Link
            href="/nuovo-preventivo"
            className="text-accent font-semibold hover:text-sky-400"
          >
            Crea il primo preventivo
          </Link>
        </div>
      ) : (
        <PreventiviTable preventivi={preventivi} clienti={clienti} />
      )}
    </>
  );
}
