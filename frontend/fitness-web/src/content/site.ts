export const locales = ["en", "de"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export function isLocale(value: string | null | undefined): value is Locale {
  return locales.includes(value as Locale);
}

export const siteNavigation = [
  { href: "/", key: "home" },
  { href: "/learn", key: "learn" },
  { href: "/community", key: "community" },
] as const;

export const siteCopy = {
  en: {
    brand: "Fat Fitness",
    nav: {
      home: "Home",
      learn: "Learn",
      community: "Community",
    },
    controls: {
      languageLabel: "Language",
      themeLabel: "Theme",
      switchToEnglish: "Switch to English",
      switchToGerman: "Switch to German",
      light: "Light",
      dark: "Dark",
    },
    links: {
      backToLearn: "Back to Learn",
      open: "Open",
    },
    placeholder: {
      eyebrow: "Placeholder page",
      body: "This page is only a temporary placeholder and will be worked on in a later milestone.",
    },
  },
  de: {
    brand: "Fat Fitness",
    nav: {
      home: "Start",
      learn: "Lernen",
      community: "Community",
    },
    controls: {
      languageLabel: "Sprache",
      themeLabel: "Design",
      switchToEnglish: "Zu Englisch wechseln",
      switchToGerman: "Zu Deutsch wechseln",
      light: "Hell",
      dark: "Dunkel",
    },
    links: {
      backToLearn: "Zurueck zu Lernen",
      open: "Oeffnen",
    },
    placeholder: {
      eyebrow: "Platzhalterseite",
      body: "Diese Seite ist vorerst nur ein Platzhalter und wird in einem spaeteren Meilenstein ausgearbeitet.",
    },
  },
} satisfies Record<Locale, unknown>;
