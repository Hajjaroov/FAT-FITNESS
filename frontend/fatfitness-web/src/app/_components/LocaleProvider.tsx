"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { defaultLocale, isLocale, type Locale } from "@/content/site";

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);
const storageKey = "fat-fitness-locale";

function getBrowserLocale(): Locale {
  if (typeof window === "undefined") {
    return defaultLocale;
  }

  const stored = window.localStorage.getItem(storageKey);
  if (isLocale(stored)) {
    return stored;
  }

  return window.navigator.language.toLowerCase().startsWith("de")
    ? "de"
    : defaultLocale;
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(defaultLocale);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setLocale(getBrowserLocale());
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    window.localStorage.setItem(storageKey, locale);
  }, [locale]);

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);

  if (!context) {
    throw new Error("useLocale must be used inside LocaleProvider");
  }

  return context;
}

export function useLocalizedContent<T>(copy: Record<Locale, T>) {
  const { locale } = useLocale();

  return copy[locale] ?? copy[defaultLocale];
}
