import Link from "next/link";
import { LogoutButton } from "@/components/auth/logout-button";
import { createClient } from "@/lib/supabase/server";

export default async function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const displayEmail = user?.email ?? "";

  return (
    <main className="min-h-screen bg-[#0f0f0f] text-white flex">
      <aside className="w-64 bg-black border-r border-gray-800 p-6 shrink-0 flex flex-col">
        <Link
          href="/"
          className="text-3xl font-bold text-green-500 mb-10 block hover:text-green-400"
        >
          PreventivPRO
        </Link>

        <nav className="flex flex-col gap-4 flex-1">
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

        <div className="pt-6 mt-6 border-t border-gray-800">
          {user ? (
            <>
              <p className="text-xs text-gray-500 mb-1">Sessione</p>
              <p className="text-sm text-gray-300 truncate mb-3" title={displayEmail}>
                {displayEmail}
              </p>
              <LogoutButton />
            </>
          ) : (
            <div className="flex flex-col gap-2 text-sm">
              <Link href="/login" className="text-green-500 hover:text-green-400">
                Accedi
              </Link>
              <Link href="/registrazione" className="text-gray-400 hover:text-green-400">
                Registrati
              </Link>
            </div>
          )}
        </div>
      </aside>

      <section className="flex-1 p-10">{children}</section>
    </main>
  );
}
