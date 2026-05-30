"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BrandLogo } from "@/components/brand-logo";
import { LogoutButton } from "@/components/auth/logout-button";
import { useTranslations } from "@/components/i18n/locale-provider";

type MainShellProps = {
  children: React.ReactNode;
  userEmail: string;
  isLoggedIn: boolean;
};

function navClassName(active: boolean) {
  return active ? "text-accent font-medium" : "nav-link";
}

type SidebarPanelProps = {
  pathname: string;
  userEmail: string;
  isLoggedIn: boolean;
  onNavigate?: () => void;
};

function SidebarPanel({
  pathname,
  userEmail,
  isLoggedIn,
  onNavigate,
}: SidebarPanelProps) {
  const t = useTranslations();

  return (
    <>
      <Link
        href="/"
        className="block mb-10 hover:opacity-90 transition-opacity"
        onClick={onNavigate}
      >
        <BrandLogo />
      </Link>

      <nav className="flex flex-col gap-3 flex-1">
        <Link
          href="/"
          className={navClassName(pathname === "/")}
          onClick={onNavigate}
        >
          {t("nav.dashboard")}
        </Link>
        <Link
          href="/nuovo-preventivo"
          className={navClassName(pathname.startsWith("/nuovo-preventivo"))}
          onClick={onNavigate}
        >
          {t("nav.newQuote")}
        </Link>
        <Link
          href="/preventivi"
          className={navClassName(pathname.startsWith("/preventivi"))}
          onClick={onNavigate}
        >
          {t("nav.quotes")}
        </Link>
        <Link
          href="/clienti"
          className={navClassName(pathname.startsWith("/clienti"))}
          onClick={onNavigate}
        >
          {t("nav.clients")}
        </Link>
        <Link
          href="/impostazioni"
          className={navClassName(pathname.startsWith("/impostazioni"))}
          onClick={onNavigate}
        >
          {t("nav.settings")}
        </Link>
        <Link
          href="/lingua"
          className={navClassName(pathname.startsWith("/lingua"))}
          onClick={onNavigate}
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
            <Link
              href="/login"
              className="text-accent hover:text-sky-400"
              onClick={onNavigate}
            >
              {t("nav.signIn")}
            </Link>
            <Link
              href="/registrazione"
              className="text-muted hover:text-accent"
              onClick={onNavigate}
            >
              {t("nav.signUp")}
            </Link>
          </div>
        )}
      </div>
    </>
  );
}

function MenuIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
      className="h-6 w-6"
    >
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function MainShell({ children, userEmail, isLoggedIn }: MainShellProps) {
  const pathname = usePathname();
  const t = useTranslations();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!drawerOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setDrawerOpen(false);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  function closeDrawer() {
    setDrawerOpen(false);
  }

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col md:flex-row">
      <header className="md:hidden sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-border bg-card/95 backdrop-blur-md px-4 py-3 pt-safe">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="text-foreground hover:text-accent transition-colors shrink-0"
            aria-expanded={drawerOpen}
            aria-controls="mobile-nav-drawer"
            aria-label={t("nav.mainNavAria")}
          >
            <MenuIcon />
          </button>
          <Link href="/" className="hover:opacity-90 transition-opacity shrink-0">
            <BrandLogo variant="icon" />
          </Link>
        </div>
        {!isLoggedIn && (
          <Link href="/login" className="text-sm text-accent font-medium shrink-0">
            {t("nav.signIn")}
          </Link>
        )}
      </header>

      {drawerOpen && (
        <>
          <button
            type="button"
            className="md:hidden fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm"
            onClick={closeDrawer}
            aria-label={t("common.close")}
          />
          <aside
            id="mobile-nav-drawer"
            className="md:hidden fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border p-6 flex flex-col shadow-xl shadow-black/20 pt-safe"
            aria-label={t("nav.mainNavAria")}
          >
            <SidebarPanel
              pathname={pathname}
              userEmail={userEmail}
              isLoggedIn={isLoggedIn}
              onNavigate={closeDrawer}
            />
          </aside>
        </>
      )}

      <aside className="hidden md:flex w-64 bg-card border-r border-border p-6 shrink-0 flex-col shadow-xl shadow-black/20">
        <SidebarPanel
          pathname={pathname}
          userEmail={userEmail}
          isLoggedIn={isLoggedIn}
        />
      </aside>

      <div className="flex flex-1 flex-col min-w-0">
        <section className="flex-1 p-4 sm:p-6 md:p-10 pb-10">
          {children}
        </section>
      </div>
    </main>
  );
}
