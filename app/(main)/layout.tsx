import Link from "next/link";
import { BrandTitle } from "@/components/brand-title";
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
    <main className="min-h-screen bg-background text-foreground flex">
      <aside className="w-64 bg-card border-r border-border p-6 shrink-0 flex flex-col shadow-xl shadow-black/20">
        <Link href="/" className="block mb-10 hover:opacity-90 transition-opacity">
          <BrandTitle />
        </Link>

        <nav className="flex flex-col gap-3 flex-1">
          <Link href="/" className="nav-link">
            Dashboard
          </Link>
          <Link href="/nuovo-preventivo" className="nav-link">
            Nuovo Preventivo
          </Link>
          <Link href="/preventivi" className="nav-link">
            Preventivi
          </Link>
          <span className="text-muted/40">Clienti</span>
          <Link href="/impostazioni" className="nav-link">
            Impostazioni
          </Link>
        </nav>

        <div className="pt-6 mt-6 border-t border-border">
          {user ? (
            <>
              <p className="text-xs text-muted mb-1">Sessione</p>
              <p className="text-sm text-foreground/90 truncate mb-3" title={displayEmail}>
                {displayEmail}
              </p>
              <LogoutButton />
            </>
          ) : (
            <div className="flex flex-col gap-2 text-sm">
              <Link href="/login" className="text-accent hover:text-sky-400">
                Accedi
              </Link>
              <Link href="/registrazione" className="text-muted hover:text-accent">
                Registrati
              </Link>
            </div>
          )}
        </div>
      </aside>

      <section className="flex-1 p-6 md:p-10">{children}</section>
    </main>
  );
}
