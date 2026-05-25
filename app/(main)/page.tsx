import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      <div className="flex items-center justify-between mb-10">
        <h2 className="text-4xl font-bold">Dashboard</h2>

        {user ? (
          <Link
            href="/nuovo-preventivo"
            className="bg-green-500 text-black px-5 py-3 rounded-xl font-bold hover:bg-green-400"
          >
            + Nuovo Preventivo
          </Link>
        ) : (
          <Link
            href="/login"
            className="bg-green-500 text-black px-5 py-3 rounded-xl font-bold hover:bg-green-400"
          >
            Accedi
          </Link>
        )}
      </div>

      {!user && (
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-6 mb-8">
          <p className="text-gray-300">
            Accedi per creare preventivi, esportare PDF e gestire i clienti.
          </p>
          <div className="flex gap-3 mt-4">
            <Link
              href="/login"
              className="bg-green-500 text-black px-5 py-2.5 rounded-xl font-bold hover:bg-green-400"
            >
              Accedi
            </Link>
            <Link
              href="/registrazione"
              className="px-5 py-2.5 rounded-xl border border-gray-600 text-gray-300 hover:border-green-500 hover:text-green-400"
            >
              Registrati
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#1a1a1a] p-6 rounded-2xl">
          <p className="text-gray-400">Preventivi Totali</p>
          <h3 className="text-4xl font-bold mt-4">{user ? "—" : "—"}</h3>
          <p className="text-xs text-gray-500 mt-2">
            {user ? "Vedi la lista in Preventivi" : "Richiede accesso"}
          </p>
        </div>

        <div className="bg-[#1a1a1a] p-6 rounded-2xl">
          <p className="text-gray-400">Entrate</p>
          <h3 className="text-4xl font-bold mt-4">—</h3>
        </div>

        <div className="bg-[#1a1a1a] p-6 rounded-2xl">
          <p className="text-gray-400">Clienti</p>
          <h3 className="text-4xl font-bold mt-4">—</h3>
        </div>
      </div>
    </>
  );
}
