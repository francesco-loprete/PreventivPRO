"use client";

import Link from "next/link";
import {
  useLocale,
  useTranslations,
} from "@/components/i18n/locale-provider";
import { getDateLocale } from "@/lib/i18n/get-messages";
import { getPreventivoTotaleVisualizzato } from "@/lib/preventivi/iva";
import type { Preventivo } from "@/lib/types/preventivo";

type DashboardViewProps = {
  user: boolean;
  clientiCount: number;
  preventiviCount: number;
  totaleEmesso: number;
  ultimoPreventivo: Preventivo | null;
};

export function DashboardView({
  user,
  clientiCount,
  preventiviCount,
  totaleEmesso,
  ultimoPreventivo,
}: DashboardViewProps) {
  const t = useTranslations();
  const { locale } = useLocale();

  const euroFormatter = new Intl.NumberFormat(getDateLocale(locale), {
    style: "currency",
    currency: "EUR",
  });

  const totaleFormatted = totaleEmesso.toLocaleString(getDateLocale(locale), {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });

  const dateFormatter = new Intl.DateTimeFormat(getDateLocale(locale), {
    dateStyle: "long",
    timeStyle: "short",
  });

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <h2 className="text-4xl font-bold tracking-tight">{t("dashboard.title")}</h2>

        {user ? (
          <Link href="/nuovo-preventivo" className="btn-primary text-center">
            {t("dashboard.newPreventivo")}
          </Link>
        ) : (
          <Link href="/login" className="btn-primary text-center">
            {t("dashboard.signIn")}
          </Link>
        )}
      </div>

      {!user && (
        <div className="card p-6 mb-8">
          <p className="text-muted">{t("dashboard.guestMessage")}</p>
          <div className="flex flex-wrap gap-3 mt-5">
            <Link href="/login" className="btn-primary">
              {t("dashboard.signIn")}
            </Link>
            <Link href="/registrazione" className="btn-secondary">
              {t("dashboard.signUp")}
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <Link
          href="/clienti"
          className="card p-6 hover:border-accent/40 transition-colors"
        >
          <p className="text-muted text-sm">{t("dashboard.clients")}</p>
          <h3 className="text-4xl font-bold mt-4">{user ? clientiCount : "—"}</h3>
          {user && (
            <p className="text-xs text-accent/80 mt-2">
              {t("dashboard.openClientsArchive")}
            </p>
          )}
        </Link>

        <Link
          href="/preventivi"
          className="card p-6 hover:border-accent/40 transition-colors"
        >
          <p className="text-muted text-sm">{t("dashboard.quotes")}</p>
          <h3 className="text-4xl font-bold mt-4">
            {user ? preventiviCount : "—"}
          </h3>
          {user && (
            <p className="text-xs text-accent/80 mt-2">
              {t("dashboard.viewAllQuotes")}
            </p>
          )}
        </Link>

        <div className="card p-6">
          <p className="text-muted text-sm">{t("dashboard.totalIssued")}</p>
          <h3 className="text-4xl font-bold mt-4">{user ? totaleFormatted : "—"}</h3>
        </div>

        <div className="card p-6">
          <p className="text-muted text-sm">{t("dashboard.lastQuote")}</p>
          {user && ultimoPreventivo ? (
            <>
              <h3 className="text-xl font-bold mt-4 truncate">
                {ultimoPreventivo.cliente}
              </h3>
              <p className="text-accent font-semibold mt-2">
                {euroFormatter.format(
                  getPreventivoTotaleVisualizzato(ultimoPreventivo)
                )}
              </p>
              <p className="text-xs text-muted mt-2">
                {ultimoPreventivo.created_at
                  ? dateFormatter.format(new Date(ultimoPreventivo.created_at))
                  : "—"}
              </p>
              <Link
                href="/preventivi"
                className="text-xs text-accent/80 mt-3 inline-block hover:text-sky-400"
              >
                {t("dashboard.goToList")}
              </Link>
            </>
          ) : (
            <h3 className="text-4xl font-bold mt-4">—</h3>
          )}
        </div>
      </div>
    </>
  );
}
