/**
 * BRANDING CENTRALIZZATO PreventivPRO
 * ───────────────────────────────────
 * Modifica SOLO questo file per logo, colori, nome attività e recapiti.
 * Non editare preventivi, CRUD, PDF sharing o WhatsApp sharing per cambiare il brand.
 */

/** Nome app (UI, PDF, PWA, metadata). */
export const BRAND_NAME = "PreventivPRO";

export const APP_NAME = BRAND_NAME;
export const APP_SHORT_NAME = BRAND_NAME;
export const APP_DESCRIPTION =
  "Gestione preventivi professionale. Crea, modifica ed esporta preventivi ovunque.";
export const APP_THEME_COLOR = "#0F172A";
export const APP_BACKGROUND_COLOR = "#0F172A";

export const BRAND_TITLE = {
  prefix: "Preventiv",
  suffix: "PRO",
} as const;

/** Colori brand (logo nero/verde). */
export const BRAND_GREEN = "#22C55E";
export const BRAND_GREEN_RGB = [34, 197, 94] as const;
export const BRAND_DARK = "#0F0F0F";
export const BRAND_DARK_RGB = [15, 15, 15] as const;

/** Asset logo — percorsi public/ (non modificare i file da altre parti del codice). */
export const BRAND_LOGO_SVG = "/logo-preventivpro.svg";
export const BRAND_LOGO_PNG = "/branding/logo-preventivpro.png";
export const BRAND_ICON_PNG = "/apple-touch-icon.png";

/** Recapiti attività (footer PDF, impostazioni predefinite). */
export const BRAND_COMPANY = {
  companyName: "PreventivPRO",
  phone: "",
  email: "",
} as const;

export type BrandCompanyContact = {
  companyName: string;
  phone: string;
  email: string;
};

/** Testi footer PDF. */
export const BRAND_PDF = {
  generatedByLine: `Documento generato da ${BRAND_NAME}`,
  validityLine: "Valido salvo diversa indicazione scritta.",
} as const;

/** Ordine di fallback per il logo nei PDF (custom upload → PNG → icona → SVG). */
export const BRAND_PDF_LOGO_PATHS = [
  BRAND_LOGO_PNG,
  BRAND_ICON_PNG,
  BRAND_LOGO_SVG,
] as const;
