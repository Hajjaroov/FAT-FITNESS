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
  { href: "/journal", key: "journal" },
  { href: "/myplan", key: "myplan", requiresAuth: true },
  { href: "/community", key: "community" },
] as const;

export const siteCopy = {
  en: {
    brand: "Fat Fitness",
    nav: {
      home: "Home",
      journal: "Journal",
      myplan: "My Plan",
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
      admin: "Reports",
      messages: "Messages",
      logout: "Log out",
      logoutPending: "Logging out...",
    },
    links: {
      backToJournal: "Back to Journal",
      open: "Open",
    },
    footer: {
      tagline: "A personal weight-loss journey and peer-support community.",
      legalTitle: "Legal",
      impressum: "Impressum",
      privacy: "Privacy Policy",
      disclaimer: "Personal experience only — not medical or dietary advice.",
      copyright: "© 2025–2026 Fat Fitness Community",
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
      journal: "Journal",
      myplan: "Mein Plan",
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
      admin: "Meldungen",
      messages: "Nachrichten",
      logout: "Ausloggen",
      logoutPending: "Wird ausgeloggt...",
    },
    links: {
      backToJournal: "Zurück zum Journal",
      open: "Öffnen",
    },
    footer: {
      tagline: "Eine persönliche Abnehmreise und Peer-Support-Community.",
      legalTitle: "Rechtliches",
      impressum: "Impressum",
      privacy: "Datenschutz",
      disclaimer: "Persönliche Erfahrung — keine medizinische oder ernährungsmedizinische Beratung.",
      copyright: "© 2025–2026 Fat Fitness Community",
    },
    placeholder: {
      eyebrow: "Platzhalterseite",
      body: "Diese Seite ist vorerst nur ein Platzhalter und wird in einem späteren Meilenstein ausgearbeitet.",
    },
  },
} satisfies Record<Locale, unknown>;
