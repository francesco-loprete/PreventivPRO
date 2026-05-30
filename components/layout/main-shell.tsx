"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/brand-logo";
import { LogoutButton } from "@/components/auth/logout-button";
import { useTranslations } from "@/components/i18n/locale-provider";

type MainShellProps = {
  children: React.ReactNode;
  userEmail: string;
  isLoggedIn: boolean;
};

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
  const t = useTranslations();

  const bottomNavItems = [
    {
      href: "/",
      label: t("nav.home"),
      icon: "⌂",
      match: (path: string) => path === "/",
    },
    {
      href: "/nuovo-preventivo",
      label: t("nav.newQuote"),
      icon: "+",
      match: (path: string) => path.startsWith("/nuovo-preventivo"),
    },
    {
      href: "/preventivi",
      label: t("nav.list"),
      icon: "☰",
      match: (path: string) => path.startsWith("/preventivi"),
    },
    {
      href: "/clienti",
      label: t("nav.clients"),
      icon: "👤",
      match: (path: string) => path.startsWith("/clienti"),
    },
    {
      href: "/impostazioni",
      label: t("nav.setup"),
      icon: "⚙",
      match: (path: string) => path.startsWith("/impostazioni"),
    },
  ] as const;

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col md:flex-row">
      <header className="md:hidden sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-border bg-card/95 backdrop-blur-md px-4 py-3 pt-safe">
        <Link href="/" className="hover:opacity-90 transition-opacity">
          <BrandLogo variant="icon" />
        </Link>
        {!isLoggedIn && (
          <Link href="/login" className="text-sm text-accent font-medium">
            {t("nav.signIn")}
          </Link>
        )}
      </header>

      <aside className="hidden md:flex w-64 bg-card border-r border-border p-6 shrink-0 flex-col shadow-xl shadow-black/20">
        <Link href="/" className="block mb-10 hover:opacity-90 transition-opacity">
          <BrandLogo />
        </Link>

        <nav className="flex flex-col gap-3 flex-1">
          <Link
            href="/"
            className={navClassName(pathname === "/", "sidebar")}
          >
            {t("nav.dashboard")}
          </Link>
          <Link
            href="/nuovo-preventivo"
            className={navClassName(
              pathname.startsWith("/nuovo-preventivo"),
              "sidebar"
            )}
          >
            {t("nav.newQuote")}
          </Link>
          <Link
            href="/preventivi"
            className={navClassName(pathname.startsWith("/preventivi"), "sidebar")}
          >
            {t("nav.quotes")}
          </Link>
          <Link
            href="/clienti"
            className={navClassName(pathname.startsWith("/clienti"), "sidebar")}
          >
            {t("nav.clients")}
          </Link>
          <Link
            href="/impostazioni"
            className={navClassName(pathname.startsWith("/impostazioni"), "sidebar")}
          >
            {t("nav.settings")}
          </Link>
          <Link
            href="/lingua"
            className={navClassName(pathname.startsWith("/lingua"), "sidebar")}
          >
            🌐 {t("nav.language")}
          </Link>
        </nav>

        <div className="pt-6 mt-6 border-t border-border">
          {isLoggedIn ? (
            <>
              <p className="text-xs text-muted mb-1">{t("nav.session")}</p>
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
                {t("nav.signIn")}
              </Link>
              <Link href="/registrazione" className="text-muted hover:text-accent">
                {t("nav.signUp")}
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
          aria-label={t("nav.mainNavAria")}
        >
          <ul className="grid grid-cols-5 gap-1 px-1 py-2">
            {bottomNavItems.map(({ href, label, icon, match }) => {
              const active = match(pathname);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={`flex flex-col items-center justify-center gap-1 rounded-xl py-2 text-[11px] ${navClassName(active, "bottom")}`}
                    aria-current={active ? "page" : undefined}
                  >
                    <span className="text-base leading-none" aria-hidden>
                      {icon}
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
