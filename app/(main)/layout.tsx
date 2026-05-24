import Link from "next/link";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="min-h-screen bg-[#0f0f0f] text-white flex">
      <aside className="w-64 bg-black border-r border-gray-800 p-6 shrink-0">
        <Link
          href="/"
          className="text-3xl font-bold text-green-500 mb-10 block hover:text-green-400"
        >
          PreventivPRO
        </Link>

        <nav className="flex flex-col gap-4">
          <Link href="/" className="hover:text-green-400">
            Dashboard
          </Link>
          <Link href="/nuovo-preventivo" className="hover:text-green-400">
            Nuovo Preventivo
          </Link>
          <Link href="/preventivi" className="hover:text-green-400">
            Preventivi
          </Link>
          <span className="text-gray-600">Clienti</span>
          <span className="text-gray-600">Impostazioni</span>
        </nav>
      </aside>

      <section className="flex-1 p-10">{children}</section>
    </main>
  );
}
