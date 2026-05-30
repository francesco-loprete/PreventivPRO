"use client";

import { useTranslations } from "@/components/i18n/locale-provider";

export function ImpostazioniPageHeader() {
  const t = useTranslations();

  return (
    <div className="mb-10">
      <h1 className="text-4xl font-bold tracking-tight">{t("settings.title")}</h1>
      <p className="text-muted mt-2">{t("settings.subtitle")}</p>
    </div>
  );
}
