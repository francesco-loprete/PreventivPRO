import Link from "next/link";
import { getUserClientiCount } from "@/lib/clienti/queries";
import { getUserPreventivi } from "@/lib/preventivi/queries";
import { createClient } from "@/lib/supabase/server";
import { getPreventivoTotale } from "@/lib/types/preventivo";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let preventiviCount = 0;
  let entrateTotali = 0;
  let clientiCount = 0;

  if (user) {
    const [preventiviResult, count] = await Promise.all([
      getUserPreventivi(),
      getUserClientiCount(),
    ]);

    if (preventiviResult.ok) {
      preventiviCount = preventiviResult.preventivi.length;
      entrateTotali = preventiviResult.preventivi.reduce(
        (sum, p) => sum + getPreventivoTotale(p),
        0
      );
    }

    clientiCount = count;
  }

  const entrateFormatted = entrateTotali.toLocaleString("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });

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
          <h3 className="text-4xl font-bold mt-4">
            {user ? preventiviCount : "—"}
          </h3>
          <p className="text-xs text-muted/70 mt-2">
            {user ? "Vedi la lista in Preventivi" : "Richiede accesso"}
          </p>
        </div>

        <div className="card p-6">
          <p className="text-muted text-sm">Entrate</p>
          <h3 className="text-4xl font-bold mt-4">
            {user ? entrateFormatted : "—"}
          </h3>
        </div>

        <Link href="/clienti" className="card p-6 hover:border-accent/40 transition-colors">
          <p className="text-muted text-sm">Clienti</p>
          <h3 className="text-4xl font-bold mt-4">
            {user ? clientiCount : "—"}
          </h3>
          {user && (
            <p className="text-xs text-accent/80 mt-2">Apri archivio clienti →</p>
          )}
        </Link>
      </div>
    </>
  );
}
