export type AppSettings = {
  companyName: string;
  phone: string;
  email: string;
  logoDataUrl: string | null;
};

export const SETTINGS_STORAGE_KEY = "preventivpro-settings";

export const DEFAULT_SETTINGS: AppSettings = {
  companyName: "",
  phone: "",
  email: "",
  logoDataUrl: null,
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
      companyName: parsed.companyName ?? "",
      phone: parsed.phone ?? "",
      email: parsed.email ?? "",
      logoDataUrl: parsed.logoDataUrl ?? null,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
}

export function getStoredLogoDataUrl(): string | null {
  return loadSettings().logoDataUrl;
}
