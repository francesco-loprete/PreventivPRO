import Link from "next/link";
import { redirect } from "next/navigation";
import { getUserClienti } from "@/lib/clienti/queries";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getUserPreventivi } from "@/lib/preventivi/queries";
import { ClientiTable } from "./clienti-table";

export const dynamic = "force-dynamic";

export default async function ClientiPage() {
  if (!isSupabaseConfigured()) {
    return (
      <div className="card p-8 text-amber-300 border-amber-900/40">
        Supabase non configurato.
      </div>
    );
  }

  const result = await getUserClienti();
  const preventiviResult = await getUserPreventivi();
  const preventivi = preventiviResult.ok ? preventiviResult.preventivi : [];

  if (!result.ok) {
    if (result.reason === "unauthenticated") {
      redirect("/login?redirectTo=/clienti");
    }

    return (
      <>
        <h1 className="text-4xl font-bold tracking-tight mb-10">Clienti</h1>
        <div className="card p-8 text-red-400 border-red-900/40">
          Errore nel caricamento: {result.message}
        </div>
      </>
    );
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Clienti</h1>
          <p className="text-muted mt-2 text-sm">
            Archivio clienti collegato ai preventivi.
          </p>
        </div>
        <Link href="/nuovo-preventivo" className="btn-secondary text-center">
          + Nuovo preventivo
        </Link>
      </div>

      <ClientiTable clienti={result.clienti} preventivi={preventivi} />
    </>
  );
}
