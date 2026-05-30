import { isAppLocale, DEFAULT_LOCALE, type AppLocale } from "@/lib/i18n/types";
import { SETTINGS_STORAGE_KEY } from "@/lib/settings/storage";

export function loadLocaleFromStorage(): AppLocale {
  if (typeof window === "undefined") return DEFAULT_LOCALE;

  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_LOCALE;

    const parsed = JSON.parse(raw) as { locale?: string };
    if (parsed.locale && isAppLocale(parsed.locale)) {
      return parsed.locale;
    }
  } catch {
    return DEFAULT_LOCALE;
  }

  return DEFAULT_LOCALE;
}
