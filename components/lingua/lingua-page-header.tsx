"use client";

import { useTranslations } from "@/components/i18n/locale-provider";

export function LinguaPageHeader() {
  const t = useTranslations();

  return (
    <div className="mb-10">
      <h1 className="text-4xl font-bold tracking-tight">{t("lingua.title")}</h1>
    </div>
  );
}
