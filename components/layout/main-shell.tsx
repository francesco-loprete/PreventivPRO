"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandTitle } from "@/components/brand-title";
import { LogoutButton } from "@/components/auth/logout-button";

type MainShellProps = {
  children: React.ReactNode;
  userEmail: string;
  isLoggedIn: boolean;
};

const NAV_ITEMS = [
  { href: "/", label: "Home", match: (path: string) => path === "/" },
  {
    href: "/nuovo-preventivo",
    label: "Nuovo",
    match: (path: string) => path.startsWith("/nuovo-preventivo"),
  },
  {
    href: "/preventivi",
    label: "Lista",
    match: (path: string) => path.startsWith("/preventivi"),
  },
  {
    href: "/impostazioni",
    label: "Setup",
    match: (path: string) => path.startsWith("/impostazioni"),
  },
] as const;

function navClassName(active: boolean, variant: "sidebar" | "bottom") {
  if (variant === "bottom") {
    return active
      ? "text-accent font-semibold"
      : "text-muted hover:text-accent transition-colors";
  }

  return active ? "text-accent font-medium" : "nav-link";
}

export function MainShell({ children, userEmail, isLoggedIn }: MainShellProps) {
  const pathname = usePathname();

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col md:flex-row">
      <header className="md:hidden sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-border bg-card/95 backdrop-blur-md px-4 py-3 pt-safe">
        <Link href="/" className="hover:opacity-90 transition-opacity">
          <BrandTitle size="sm" />
        </Link>
        {!isLoggedIn && (
          <Link href="/login" className="text-sm text-accent font-medium">
            Accedi
          </Link>
        )}
      </header>

      <aside className="hidden md:flex w-64 bg-card border-r border-border p-6 shrink-0 flex-col shadow-xl shadow-black/20">
        <Link href="/" className="block mb-10 hover:opacity-90 transition-opacity">
          <BrandTitle />
        </Link>

        <nav className="flex flex-col gap-3 flex-1">
          <Link
            href="/"
            className={navClassName(NAV_ITEMS[0].match(pathname), "sidebar")}
          >
            Dashboard
          </Link>
          <Link
            href="/nuovo-preventivo"
            className={navClassName(NAV_ITEMS[1].match(pathname), "sidebar")}
          >
            Nuovo Preventivo
          </Link>
          <Link
            href="/preventivi"
            className={navClassName(NAV_ITEMS[2].match(pathname), "sidebar")}
          >
            Preventivi
          </Link>
          <span className="text-muted/40">Clienti</span>
          <Link
            href="/impostazioni"
            className={navClassName(NAV_ITEMS[3].match(pathname), "sidebar")}
          >
            Impostazioni
          </Link>
        </nav>

        <div className="pt-6 mt-6 border-t border-border">
          {isLoggedIn ? (
            <>
              <p className="text-xs text-muted mb-1">Sessione</p>
              <p
                className="text-sm text-foreground/90 truncate mb-3"
                title={userEmail}
              >
                {userEmail}
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

      <div className="flex flex-1 flex-col min-w-0">
        <section className="flex-1 p-4 sm:p-6 md:p-10 pb-24 md:pb-10">
          {children}
        </section>

        <nav
          className="md:hidden fixed bottom-0 inset-x-0 z-30 border-t border-border bg-card/95 backdrop-blur-md pb-safe"
          aria-label="Navigazione principale"
        >
          <ul className="grid grid-cols-4 gap-1 px-2 py-2">
            {NAV_ITEMS.map(({ href, label, match }) => {
              const active = match(pathname);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={`flex flex-col items-center justify-center gap-1 rounded-xl py-2 text-xs ${navClassName(active, "bottom")}`}
                    aria-current={active ? "page" : undefined}
                  >
                    <span className="text-base leading-none" aria-hidden>
                      {label === "Home"
                        ? "⌂"
                        : label === "Nuovo"
                          ? "+"
                          : label === "Lista"
                            ? "☰"
                            : "⚙"}
                    </span>
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </main>
  );
}
