"use client";

import { useTranslations } from "@/components/i18n/locale-provider";

export function NuovoPreventivoHeader() {
  const t = useTranslations();

  return (
    <h1 className="text-4xl font-bold mb-10 tracking-tight">
      {t("preventivo.newTitle")}{" "}
      <span className="text-accent">{t("preventivo.newTitleAccent")}</span>
    </h1>
  );
}
