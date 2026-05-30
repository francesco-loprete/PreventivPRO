"use client";

import { useEffect, useState } from "react";
import { persistAppLocale } from "@/lib/i18n/locale-events";
import { LOCALE_CHANGE_EVENT } from "@/lib/i18n/locale-events";
import { DEFAULT_LOCALE, type AppLocale } from "@/lib/i18n/types";
import { loadSettings } from "@/lib/settings/storage";

type LanguageSettingsSectionProps = {
  disabled?: boolean;
};

export function LanguageSettingsSection({
  disabled = false,
}: LanguageSettingsSectionProps) {
  const [locale, setLocaleState] = useState<AppLocale>(DEFAULT_LOCALE);

  useEffect(() => {
    setLocaleState(loadSettings().locale);
  }, []);

  useEffect(() => {
    function onLocaleChange(event: Event) {
      const nextLocale = (event as CustomEvent<AppLocale>).detail;
      if (nextLocale === "it" || nextLocale === "en") {
        setLocaleState(nextLocale);
      }
    }

    window.addEventListener(LOCALE_CHANGE_EVENT, onLocaleChange);
    return () => window.removeEventListener(LOCALE_CHANGE_EVENT, onLocaleChange);
  }, []);

  function handleChange(nextLocale: AppLocale) {
    setLocaleState(nextLocale);
    persistAppLocale(nextLocale);
  }

  return (
    <section className="space-y-4" aria-labelledby="language-settings-heading">
      <h2
        id="language-settings-heading"
        className="text-lg font-semibold text-accent"
      >
        Lingua
      </h2>
      <div>
        <label htmlFor="app-locale" className="sr-only">
          Lingua
        </label>
        <select
          id="app-locale"
          name="locale"
          value={locale}
          onChange={(event) => handleChange(event.target.value as AppLocale)}
          className="input-field max-w-xs"
          disabled={disabled}
        >
          <option value="it">Italiano</option>
          <option value="en">English</option>
        </select>
      </div>
    </section>
  );
}
