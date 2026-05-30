"use client";

import Link from "next/link";
import { useTranslations } from "@/components/i18n/locale-provider";
import type { Cliente } from "@/lib/types/cliente";
import type { Preventivo } from "@/lib/types/preventivo";
import { PreventiviTable } from "@/app/(main)/preventivi/preventivi-table";

type PreventiviPageContentProps = {
  preventivi: Preventivo[];
  clienti: Cliente[];
  errorMessage?: string;
};

export function PreventiviPageContent({
  preventivi,
  clienti,
  errorMessage,
}: PreventiviPageContentProps) {
  const t = useTranslations();

  if (errorMessage) {
    return (
      <>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <h1 className="text-4xl font-bold tracking-tight">{t("preventivi.title")}</h1>
        </div>
        <div className="card p-8 text-red-400 border-red-900/40">
          {t("preventivi.loadError")} {errorMessage}
        </div>
      </>
    );
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <h1 className="text-4xl font-bold tracking-tight">{t("preventivi.title")}</h1>

        <Link href="/nuovo-preventivo" className="btn-primary text-center">
          {t("preventivi.newQuote")}
        </Link>
      </div>

      {!preventivi.length ? (
        <div className="card p-12 text-center">
          <p className="text-muted mb-6">{t("preventivi.empty")}</p>
          <Link
            href="/nuovo-preventivo"
            className="text-accent font-semibold hover:text-sky-400"
          >
            {t("preventivi.createFirst")}
          </Link>
        </div>
      ) : (
        <PreventiviTable preventivi={preventivi} clienti={clienti} />
      )}
    </>
  );
}
