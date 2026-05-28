import {
  BRAND_COMPANY,
  BRAND_PDF_LOGO_PATHS,
  type BrandCompanyContact,
} from "@/lib/branding/constants";
import { loadSettings } from "@/lib/settings/storage";

/**
 * Recapiti effettivi: default da constants.ts, override opzionale da Impostazioni (localStorage).
 */
export function getCompanyContact(): BrandCompanyContact {
  if (typeof window === "undefined") {
    return { ...BRAND_COMPANY };
  }

  const stored = loadSettings();
  return {
    companyName:
      stored.companyName.trim() || BRAND_COMPANY.companyName,
    phone: stored.phone.trim() || BRAND_COMPANY.phone,
    email: stored.email.trim() || BRAND_COMPANY.email,
  };
}

export function getStoredLogoDataUrl(): string | null {
  if (typeof window === "undefined") return null;
  return loadSettings().logoDataUrl;
}

export function getPdfLogoPaths(): readonly string[] {
  return BRAND_PDF_LOGO_PATHS;
}
