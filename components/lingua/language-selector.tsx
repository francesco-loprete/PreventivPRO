"use client";

import { useLocale, useTranslations } from "@/components/i18n/locale-provider";
import { persistAppLocale } from "@/lib/i18n/locale-events";
import type { AppLocale } from "@/lib/i18n/types";

export function LanguageSelector() {
  const t = useTranslations();
  const { locale, setLocale } = useLocale();

  function handleChange(nextLocale: AppLocale) {
    setLocale(nextLocale);
    persistAppLocale(nextLocale);
  }

  return (
    <div className="card p-8 max-w-2xl">
      <label htmlFor="app-locale" className="block mb-2 text-muted text-sm">
        {t("lingua.label")}
      </label>
      <select
        id="app-locale"
        name="locale"
        value={locale}
        onChange={(event) => handleChange(event.target.value as AppLocale)}
        className="input-field max-w-xs"
      >
        <option value="it">{t("settings.languageIt")}</option>
        <option value="en">{t("settings.languageEn")}</option>
      </select>
    </div>
  );
}
