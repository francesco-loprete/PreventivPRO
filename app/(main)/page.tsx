import Link from "next/link";
import { getUserClientiCount } from "@/lib/clienti/queries";
import { computeDashboardStats } from "@/lib/dashboard/stats";
import { getUserPreventivi } from "@/lib/preventivi/queries";
import { createClient } from "@/lib/supabase/server";
import { getPreventivoTotale } from "@/lib/types/preventivo";

const euroFormatter = new Intl.NumberFormat("it-IT", {
  style: "currency",
  currency: "EUR",
});

const dateFormatter = new Intl.DateTimeFormat("it-IT", {
  dateStyle: "long",
  timeStyle: "short",
});

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let clientiCount = 0;
  let stats = {
    preventiviCount: 0,
    totaleEmesso: 0,
    ultimoPreventivo: null as Awaited<
      ReturnType<typeof computeDashboardStats>
    >["ultimoPreventivo"],
  };

  if (user) {
    const [preventiviResult, count] = await Promise.all([
      getUserPreventivi(),
      getUserClientiCount(),
    ]);

    clientiCount = count;

    if (preventiviResult.ok) {
      stats = computeDashboardStats(preventiviResult.preventivi);
    }
  }

  const totaleFormatted = stats.totaleEmesso.toLocaleString("it-IT", {
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

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <Link
          href="/clienti"
          className="card p-6 hover:border-accent/40 transition-colors"
        >
          <p className="text-muted text-sm">Clienti</p>
          <h3 className="text-4xl font-bold mt-4">
            {user ? clientiCount : "—"}
          </h3>
          {user && (
            <p className="text-xs text-accent/80 mt-2">Apri archivio clienti →</p>
          )}
        </Link>

        <Link
          href="/preventivi"
          className="card p-6 hover:border-accent/40 transition-colors"
        >
          <p className="text-muted text-sm">Preventivi</p>
          <h3 className="text-4xl font-bold mt-4">
            {user ? stats.preventiviCount : "—"}
          </h3>
          {user && (
            <p className="text-xs text-accent/80 mt-2">Vedi tutti i preventivi →</p>
          )}
        </Link>

        <div className="card p-6">
          <p className="text-muted text-sm">Totale emesso</p>
          <h3 className="text-4xl font-bold mt-4">
            {user ? totaleFormatted : "—"}
          </h3>
        </div>

        <div className="card p-6">
          <p className="text-muted text-sm">Ultimo preventivo</p>
          {user && stats.ultimoPreventivo ? (
            <>
              <h3 className="text-xl font-bold mt-4 truncate">
                {stats.ultimoPreventivo.cliente}
              </h3>
              <p className="text-accent font-semibold mt-2">
                {euroFormatter.format(getPreventivoTotale(stats.ultimoPreventivo))}
              </p>
              <p className="text-xs text-muted mt-2">
                {stats.ultimoPreventivo.created_at
                  ? dateFormatter.format(
                      new Date(stats.ultimoPreventivo.created_at)
                    )
                  : "—"}
              </p>
              <Link
                href="/preventivi"
                className="text-xs text-accent/80 mt-3 inline-block hover:text-sky-400"
              >
                Vai alla lista →
              </Link>
            </>
          ) : (
            <h3 className="text-4xl font-bold mt-4">{user ? "—" : "—"}</h3>
          )}
        </div>
      </div>
    </>
  );
}
