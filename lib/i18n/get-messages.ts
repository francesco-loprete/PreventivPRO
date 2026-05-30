import { enMessages } from "@/lib/i18n/messages/en";
import { itMessages } from "@/lib/i18n/messages/it";
import type { AppLocale, Messages } from "@/lib/i18n/types";
import { DEFAULT_LOCALE } from "@/lib/i18n/types";

const catalogs: Record<AppLocale, Messages> = {
  it: itMessages,
  en: enMessages,
};

export function getMessages(locale: AppLocale): Messages {
  return catalogs[locale] ?? catalogs[DEFAULT_LOCALE];
}

export type TranslationParams = Record<string, string | number>;

function getNestedValue(obj: unknown, path: string): string | undefined {
  const keys = path.split(".");
  let current: unknown = obj;

  for (const key of keys) {
    if (!current || typeof current !== "object" || !(key in current)) {
      return undefined;
    }
    current = (current as Record<string, unknown>)[key];
  }

  return typeof current === "string" ? current : undefined;
}

function interpolate(template: string, params?: TranslationParams): string {
  if (!params) return template;

  return template.replace(/\{(\w+)\}/g, (_, key: string) => {
    const value = params[key];
    return value === undefined ? `{${key}}` : String(value);
  });
}

export function createTranslator(locale: AppLocale) {
  const messages = getMessages(locale);
  const fallback = getMessages(DEFAULT_LOCALE);

  return function t(path: string, params?: TranslationParams): string {
    const value =
      getNestedValue(messages, path) ?? getNestedValue(fallback, path) ?? path;
    return interpolate(value, params);
  };
}

const ERROR_MESSAGE_PATHS: Record<string, keyof Messages["errors"]> = {
  "Aggiungi almeno una voce con descrizione.": "addAtLeastOneLine",
  "Quantità e prezzo devono essere valori validi (quantità > 0).":
    "invalidQtyPrice",
  "Il totale generale deve essere maggiore di zero.": "totalMustBePositive",
  "Seleziona un cliente dall'archivio.": "selectClientFromArchive",
  "Cliente selezionato non valido.": "invalidSelectedClient",
  "Inserisci il nome del nuovo cliente.": "enterNewClientName",
  "Cliente non trovato nell'archivio.": "clientNotFound",
};

export function translateKnownError(
  message: string,
  t: ReturnType<typeof createTranslator>
): string {
  const key = ERROR_MESSAGE_PATHS[message];
  if (!key) return message;
  return t(`errors.${key}`);
}

export function getDateLocale(locale: AppLocale): string {
  return locale === "en" ? "en-GB" : "it-IT";
}

export function getPdfMessages(locale: AppLocale): Messages["pdf"] {
  return getMessages(locale).pdf;
}

export function getWhatsAppMessages(locale: AppLocale): Messages["whatsapp"] {
  return getMessages(locale).whatsapp;
}
