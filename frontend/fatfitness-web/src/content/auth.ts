import type { Locale } from "@/content/site";

type AuthField = {
  id: string;
  label: string;
  type: "email" | "password" | "text";
  autoComplete: string;
  placeholder: string;
  kind?: "country";
};

type AuthPageCopy = {
  eyebrow: string;
  title: string;
  intro: string;
  formTitle: string;
  formIntro: string;
  disabledNote: string;
  submitLabel: string;
  fields: AuthField[];
  agreementLabel?: string;
  switchPrompt: string;
  switchHref: string;
  switchLabel: string;
};

type AuthCopy = {
  shared: {
    unavailableLabel: string;
    privacyLine: string;
    countrySearchHint: string;
    countryNoResults: string;
  };
  login: AuthPageCopy;
  register: AuthPageCopy;
};

export const authCopy = {
  en: {
    shared: {
      unavailableLabel: "Not open yet",
      privacyLine:
        "When accounts open, signup should stay simple. Health details, weight history, photos, and medical topics should stay optional and private unless someone chooses otherwise.",
      countrySearchHint: "Choose Other if your country is not listed.",
      countryNoResults: "No country or region found. Choose Other if needed.",
    },
    login: {
      eyebrow: "Sign in",
      title: "Welcome back to Fat Fitness Community.",
      intro:
        "When the forum opens, this is where members will sign in to post, reply, report content, and manage their account.",
      formTitle: "Sign in",
      formIntro: "Account access is not active yet, but this is the planned login shape.",
      disabledNote:
        "Login is disabled for now. This form does not send or save anything.",
      submitLabel: "Sign in",
      fields: [
        {
          id: "login-email",
          label: "Email",
          type: "email",
          autoComplete: "email",
          placeholder: "name@example.com",
        },
        {
          id: "login-password",
          label: "Password",
          type: "password",
          autoComplete: "current-password",
          placeholder: "Password",
        },
      ],
      switchPrompt: "No account yet?",
      switchHref: "/register",
      switchLabel: "Preview registration",
    },
    register: {
      eyebrow: "Create account",
      title: "Create your community account.",
      intro:
        "Registration should stay small and clear: a public display name, email, country or region, and password. Personal health details can wait until optional profile or tool features exist.",
      formTitle: "Register",
      formIntro:
        "These are the planned basic fields for a future forum account.",
      disabledNote:
        "Registration is disabled for now. This form does not send or save anything.",
      submitLabel: "Create account",
      fields: [
        {
          id: "register-name",
          label: "Display name",
          type: "text",
          autoComplete: "nickname",
          placeholder: "How you want to appear",
        },
        {
          id: "register-email",
          label: "Email",
          type: "email",
          autoComplete: "email",
          placeholder: "name@example.com",
        },
        {
          id: "register-country",
          label: "Country / region",
          type: "text",
          kind: "country",
          autoComplete: "country-name",
          placeholder: "Start typing your country",
        },
        {
          id: "register-password",
          label: "Password",
          type: "password",
          autoComplete: "new-password",
          placeholder: "Password",
        },
        {
          id: "register-confirm-password",
          label: "Confirm password",
          type: "password",
          autoComplete: "new-password",
          placeholder: "Confirm password",
        },
      ],
      agreementLabel:
        "I agree to follow the community rules and privacy terms when registration opens.",
      switchPrompt: "Already have an account?",
      switchHref: "/login",
      switchLabel: "Preview login",
    },
  },
  de: {
    shared: {
      unavailableLabel: "Noch nicht offen",
      privacyLine:
        "Wenn Accounts starten, sollte die Registrierung einfach bleiben. Gesundheitsdaten, Gewichtsverlauf, Fotos und medizinische Themen sollten optional und privat bleiben, außer jemand entscheidet sich bewusst dafür.",
      countrySearchHint:
        "Wähle Andere, falls dein Land nicht in der Liste ist.",
      countryNoResults:
        "Kein Land oder keine Region gefunden. Wähle bei Bedarf Andere.",
    },
    login: {
      eyebrow: "Einloggen",
      title: "Willkommen zurück bei Fat Fitness Community.",
      intro:
        "Wenn das Forum öffnet, können Mitglieder sich hier einloggen, posten, antworten, Inhalte melden und ihren Account verwalten.",
      formTitle: "Einloggen",
      formIntro:
        "Account-Zugang ist noch nicht aktiv, aber so ist der Login geplant.",
      disabledNote:
        "Login ist aktuell deaktiviert. Dieses Formular sendet oder speichert nichts.",
      submitLabel: "Einloggen",
      fields: [
        {
          id: "login-email",
          label: "E-Mail",
          type: "email",
          autoComplete: "email",
          placeholder: "name@example.com",
        },
        {
          id: "login-password",
          label: "Passwort",
          type: "password",
          autoComplete: "current-password",
          placeholder: "Passwort",
        },
      ],
      switchPrompt: "Noch kein Account?",
      switchHref: "/register",
      switchLabel: "Registrierung ansehen",
    },
    register: {
      eyebrow: "Account erstellen",
      title: "Erstelle deinen Community-Account.",
      intro:
        "Die Registrierung sollte klein und klar bleiben: ein öffentlicher Anzeigename, E-Mail, Land oder Region und Passwort. Persönliche Gesundheitsdaten können warten, bis optionale Profile oder Tools existieren.",
      formTitle: "Registrieren",
      formIntro:
        "Das sind die geplanten Basisfelder für einen späteren Forum-Account.",
      disabledNote:
        "Registrierung ist aktuell deaktiviert. Dieses Formular sendet oder speichert nichts.",
      submitLabel: "Account erstellen",
      fields: [
        {
          id: "register-name",
          label: "Anzeigename",
          type: "text",
          autoComplete: "nickname",
          placeholder: "Wie du erscheinen willst",
        },
        {
          id: "register-email",
          label: "E-Mail",
          type: "email",
          autoComplete: "email",
          placeholder: "name@example.com",
        },
        {
          id: "register-country",
          label: "Land / Region",
          type: "text",
          kind: "country",
          autoComplete: "country-name",
          placeholder: "Land eingeben",
        },
        {
          id: "register-password",
          label: "Passwort",
          type: "password",
          autoComplete: "new-password",
          placeholder: "Passwort",
        },
        {
          id: "register-confirm-password",
          label: "Passwort wiederholen",
          type: "password",
          autoComplete: "new-password",
          placeholder: "Passwort wiederholen",
        },
      ],
      agreementLabel:
        "Ich stimme zu, die Community-Regeln und Datenschutzbedingungen einzuhalten, sobald die Registrierung öffnet.",
      switchPrompt: "Schon einen Account?",
      switchHref: "/login",
      switchLabel: "Login ansehen",
    },
  },
} satisfies Record<Locale, AuthCopy>;
