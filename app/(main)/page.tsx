import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <h2 className="text-4xl font-bold tracking-tight">Dashboard</h2>

        {user ? (
          <Link href="/nuovo-preventivo" className="btn-primary text-center">
            + Nuovo Preventivo
          </Link>
        ) : (
          <Link href="/login" className="btn-primary text-center">
            Accedi
          </Link>
        )}
      </div>

      {!user && (
        <div className="card p-6 mb-8">
          <p className="text-muted">
            Accedi per creare preventivi, esportare PDF e gestire i clienti.
          </p>
          <div className="flex flex-wrap gap-3 mt-5">
            <Link href="/login" className="btn-primary">
              Accedi
            </Link>
            <Link href="/registrazione" className="btn-secondary">
              Registrati
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <p className="text-muted text-sm">Preventivi Totali</p>
          <h3 className="text-4xl font-bold mt-4">—</h3>
          <p className="text-xs text-muted/70 mt-2">
            {user ? "Vedi la lista in Preventivi" : "Richiede accesso"}
          </p>
        </div>

        <div className="card p-6">
          <p className="text-muted text-sm">Entrate</p>
          <h3 className="text-4xl font-bold mt-4">—</h3>
        </div>

        <div className="card p-6">
          <p className="text-muted text-sm">Clienti</p>
          <h3 className="text-4xl font-bold mt-4">—</h3>
        </div>
      </div>
    </>
  );
}
