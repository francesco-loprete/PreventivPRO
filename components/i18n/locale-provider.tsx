"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  createTranslator,
  translateKnownError,
} from "@/lib/i18n/get-messages";
import { loadLocaleFromStorage } from "@/lib/i18n/load-locale";
import { persistAppLocale, LOCALE_CHANGE_EVENT } from "@/lib/i18n/locale-events";
import { DEFAULT_LOCALE, type AppLocale } from "@/lib/i18n/types";

type LocaleContextValue = {
  locale: AppLocale;
  setLocale: (locale: AppLocale) => void;
  t: ReturnType<typeof createTranslator>;
  translateError: (message: string) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<AppLocale>(DEFAULT_LOCALE);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setLocaleState(loadLocaleFromStorage());
    setReady(true);
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

  useEffect(() => {
    if (!ready) return;
    document.documentElement.lang = locale;
  }, [locale, ready]);

  const setLocale = useCallback((nextLocale: AppLocale) => {
    setLocaleState(nextLocale);
    persistAppLocale(nextLocale);
  }, []);

  const t = useMemo(() => createTranslator(locale), [locale]);

  const translateError = useCallback(
    (message: string) => translateKnownError(message, t),
    [t]
  );

  const value = useMemo(
    () => ({ locale, setLocale, t, translateError }),
    [locale, setLocale, t, translateError]
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocale must be used within LocaleProvider");
  }
  return context;
}

export function useTranslations() {
  return useLocale().t;
}
