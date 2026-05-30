"use client";

import Link from "next/link";
import { useTranslations } from "@/components/i18n/locale-provider";

export function ClientiPageHeader() {
  const t = useTranslations();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">{t("clienti.title")}</h1>
        <p className="text-muted mt-2 text-sm">{t("clienti.subtitle")}</p>
      </div>
      <Link href="/nuovo-preventivo" className="btn-secondary text-center">
        {t("clienti.newPreventivo")}
      </Link>
    </div>
  );
}

export function ClientiPageError({ message }: { message: string }) {
  const t = useTranslations();

  return (
    <>
      <h1 className="text-4xl font-bold tracking-tight mb-10">{t("clienti.title")}</h1>
      <div className="card p-8 text-red-400 border-red-900/40">
        {t("clienti.loadError")} {message}
      </div>
    </>
  );
}
