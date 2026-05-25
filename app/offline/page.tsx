import Link from "next/link";

export default function OfflinePage() {
  return (
    <main className="min-h-screen bg-[#0f0f0f] text-white flex items-center justify-center p-8">
      <div className="max-w-md text-center bg-[#1a1a1a] border border-gray-800 rounded-2xl p-10">
        <h1 className="text-3xl font-bold text-green-500 mb-4">Sei offline</h1>
        <p className="text-gray-400 mb-8">
          PreventivPRO non ha connessione. Le pagine già visitate potrebbero essere
          disponibili; per dati aggiornati torna online.
        </p>
        <Link
          href="/"
          className="inline-block bg-green-500 text-black px-6 py-3 rounded-xl font-bold hover:bg-green-400"
        >
          Riprova
        </Link>
      </div>
    </main>
  );
}
