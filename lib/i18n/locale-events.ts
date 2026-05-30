import type { AppLocale } from "@/lib/i18n/types";
import { loadSettings, saveSettings } from "@/lib/settings/storage";

export const LOCALE_CHANGE_EVENT = "preventivpro-locale-change";

export function persistAppLocale(nextLocale: AppLocale): void {
  const settings = loadSettings();
  saveSettings({ ...settings, locale: nextLocale });

  if (typeof document !== "undefined") {
    document.documentElement.lang = nextLocale;
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent(LOCALE_CHANGE_EVENT, { detail: nextLocale })
    );
  }
}
