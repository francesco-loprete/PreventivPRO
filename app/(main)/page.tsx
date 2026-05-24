import Link from "next/link";

export default function Home() {
  return (
    <>
      <div className="flex items-center justify-between mb-10">
        <h2 className="text-4xl font-bold">Dashboard</h2>

        <Link
          href="/nuovo-preventivo"
          className="bg-green-500 text-black px-5 py-3 rounded-xl font-bold hover:bg-green-400"
        >
          + Nuovo Preventivo
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="bg-[#1a1a1a] p-6 rounded-2xl">
          <p className="text-gray-400">Preventivi Totali</p>
          <h3 className="text-4xl font-bold mt-4">24</h3>
        </div>

        <div className="bg-[#1a1a1a] p-6 rounded-2xl">
          <p className="text-gray-400">Entrate</p>
          <h3 className="text-4xl font-bold mt-4">€ 12.400</h3>
        </div>

        <div className="bg-[#1a1a1a] p-6 rounded-2xl">
          <p className="text-gray-400">Clienti</p>
          <h3 className="text-4xl font-bold mt-4">18</h3>
        </div>
      </div>
    </>
  );
}
