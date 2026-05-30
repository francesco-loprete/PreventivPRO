import { BRAND_COMPANY } from "@/lib/branding/constants";
import { DEFAULT_LOCALE, type AppLocale } from "@/lib/i18n/types";

export type AppSettings = {
  companyName: string;
  phone: string;
  email: string;
  logoDataUrl: string | null;
  locale: AppLocale;
};

export const SETTINGS_STORAGE_KEY = "preventivpro-settings";

/** Valori iniziali form Impostazioni (da branding centralizzato). */
export const DEFAULT_SETTINGS: AppSettings = {
  companyName: BRAND_COMPANY.companyName,
  phone: BRAND_COMPANY.phone,
  email: BRAND_COMPANY.email,
  logoDataUrl: null,
  locale: DEFAULT_LOCALE,
};

export function loadSettings(): AppSettings {
  if (typeof window === "undefined") {
    return DEFAULT_SETTINGS;
  }

  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;

    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    return {
      companyName: parsed.companyName ?? DEFAULT_SETTINGS.companyName,
      phone: parsed.phone ?? DEFAULT_SETTINGS.phone,
      email: parsed.email ?? DEFAULT_SETTINGS.email,
      logoDataUrl: parsed.logoDataUrl ?? null,
      locale:
        parsed.locale === "en" || parsed.locale === "it"
          ? parsed.locale
          : DEFAULT_SETTINGS.locale,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
}
