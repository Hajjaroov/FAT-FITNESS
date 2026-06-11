export const localeOptions = [
  { value: "en", label: "English" },
  { value: "de", label: "Deutsch" },
] as const;

export type Locale = (typeof localeOptions)[number]["value"];

export const locales = localeOptions.map((option) => option.value);

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
      light: "Light",
      dark: "Dark",
      switchToLightTheme: "Switch to light mode",
      switchToDarkTheme: "Switch to dark mode",
    },
    account: {
      checking: "Checking session...",
      login: "Sign in",
      signedInAs: "Signed in:",
      logout: "Log out",
      logoutPending: "Logging out...",
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
      light: "Hell",
      dark: "Dunkel",
      switchToLightTheme: "Zu hellem Modus wechseln",
      switchToDarkTheme: "Zu dunklem Modus wechseln",
    },
    account: {
      checking: "Sitzung wird geprüft...",
      login: "Einloggen",
      signedInAs: "Eingeloggt:",
      logout: "Ausloggen",
      logoutPending: "Wird ausgeloggt...",
    },
    links: {
      backToLearn: "Zurück zu Lernen",
      open: "Öffnen",
    },
    placeholder: {
      eyebrow: "Platzhalterseite",
      body: "Diese Seite ist vorerst nur ein Platzhalter und wird in einem späteren Meilenstein ausgearbeitet.",
    },
  },
} satisfies Record<Locale, unknown>;
