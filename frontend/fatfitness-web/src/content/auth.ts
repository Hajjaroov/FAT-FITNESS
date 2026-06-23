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
  statusLabel: string;
  statusNote: string;
  submitLabel: string;
  submitPendingLabel: string;
  successTitle: string;
  successText: string;
  fields: AuthField[];
  agreementLabel?: string;
  switchPrompt: string;
  switchHref: string;
  switchLabel: string;
};

type AuthCopy = {
  shared: {
    privacyLine: string;
    countrySearchHint: string;
    countryNoResults: string;
    formErrorFallback: string;
    countryRequiredError: string;
    agreementRequiredError: string;
    passwordMismatchError: string;
    checkingSession: string;
    activeSessionLabel: string;
    signedInAs: string;
    logoutLabel: string;
    logoutPendingLabel: string;
  };
  login: AuthPageCopy;
  register: AuthPageCopy;
};

export const authCopy = {
  en: {
    shared: {
      privacyLine:
        "Signup stays intentionally small. Health details, weight history, photos, and medical topics are not part of basic registration.",
      countrySearchHint: "Choose Other if your country is not listed.",
      countryNoResults: "No country or region found. Choose Other if needed.",
      formErrorFallback: "Something went wrong. Please check the form and try again.",
      countryRequiredError: "Choose a country or region from the list, or choose Other.",
      agreementRequiredError: "Please accept the community rules and privacy terms.",
      passwordMismatchError: "Password and confirmation do not match.",
      checkingSession: "Checking saved browser session...",
      activeSessionLabel: "Session active",
      signedInAs: "Signed in as",
      logoutLabel: "Log out",
      logoutPendingLabel: "Logging out...",
    },
    login: {
      eyebrow: "Sign in",
      title: "Welcome back to Fat Fitness Community.",
      intro:
        "Sign in to test the account flow that will later protect posting, replies, reports, and account settings.",
      formTitle: "Sign in",
      formIntro:
        "Use an active, verified account. The browser keeps the refresh session in an HttpOnly cookie.",
      statusLabel: "Account access",
      statusNote:
        "Login is connected to the local backend. The access token stays in memory and is not saved in localStorage.",
      submitLabel: "Sign in",
      submitPendingLabel: "Signing in...",
      successTitle: "You are signed in.",
      successText:
        "The session is active for this browser. Verified accounts can start forum threads now.",
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
      switchLabel: "Create account",
    },
    register: {
      eyebrow: "Create account",
      title: "Create your community account.",
      intro:
        "Registration stays small and clear: a public display name, email, country or region, and password. Personal health details can wait until optional profile or tool features exist.",
      formTitle: "Register",
      formIntro:
        "Create an account with a display name, email, country or region, and password.",
      statusLabel: "Email verification",
      statusNote:
        "After registering you will receive a verification email. Click the link in that email to activate your account before signing in.",
      submitLabel: "Create account",
      submitPendingLabel: "Creating account...",
      successTitle: "Account created.",
      successText:
        "Check your email for a verification link. Click it to activate your account, then sign in.",
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
        "I agree to follow the community rules and privacy terms.",
      switchPrompt: "Already have an account?",
      switchHref: "/login",
      switchLabel: "Sign in",
    },
  },
  de: {
    shared: {
      privacyLine:
        "Die Registrierung bleibt bewusst klein. Gesundheitsdaten, Gewichtsverlauf, Fotos und medizinische Themen gehören nicht zur Basis-Registrierung.",
      countrySearchHint:
        "Wähle Andere, falls dein Land nicht in der Liste ist.",
      countryNoResults:
        "Kein Land oder keine Region gefunden. Wähle bei Bedarf Andere.",
      formErrorFallback:
        "Etwas ist schiefgelaufen. Bitte prüfe das Formular und versuche es erneut.",
      countryRequiredError:
        "Wähle ein Land oder eine Region aus der Liste, oder wähle Andere.",
      agreementRequiredError:
        "Bitte akzeptiere die Community-Regeln und Datenschutzbedingungen.",
      passwordMismatchError: "Passwort und Wiederholung stimmen nicht überein.",
      checkingSession: "Gespeicherte Browser-Sitzung wird geprüft...",
      activeSessionLabel: "Sitzung aktiv",
      signedInAs: "Eingeloggt als",
      logoutLabel: "Ausloggen",
      logoutPendingLabel: "Wird ausgeloggt...",
    },
    login: {
      eyebrow: "Einloggen",
      title: "Willkommen zurück bei Fat Fitness Community.",
      intro:
        "Logge dich ein, um den Account-Ablauf zu testen, der später Posten, Antworten, Meldungen und Account-Einstellungen schützt.",
      formTitle: "Einloggen",
      formIntro:
        "Nutze einen aktiven, verifizierten Account. Der Browser hält die Refresh-Sitzung in einem HttpOnly-Cookie.",
      statusLabel: "Account-Zugang",
      statusNote:
        "Login ist mit dem lokalen Backend verbunden. Das Access Token bleibt im Speicher und wird nicht in localStorage gespeichert.",
      submitLabel: "Einloggen",
      submitPendingLabel: "Wird eingeloggt...",
      successTitle: "Du bist eingeloggt.",
      successText:
        "Die Sitzung ist für diesen Browser aktiv. Verifizierte Accounts können jetzt Forum-Threads starten.",
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
      switchLabel: "Account erstellen",
    },
    register: {
      eyebrow: "Account erstellen",
      title: "Erstelle deinen Community-Account.",
      intro:
        "Die Registrierung bleibt klein und klar: ein öffentlicher Anzeigename, E-Mail, Land oder Region und Passwort. Persönliche Gesundheitsdaten können warten, bis optionale Profile oder Tools existieren.",
      formTitle: "Registrieren",
      formIntro:
        "Erstelle einen Account mit Anzeigename, E-Mail, Land oder Region und Passwort.",
      statusLabel: "E-Mail-Verifizierung",
      statusNote:
        "Nach der Registrierung erhältst du eine Bestätigungs-E-Mail. Klicke auf den Link in der E-Mail, um deinen Account zu aktivieren, bevor du dich einloggst.",
      submitLabel: "Account erstellen",
      submitPendingLabel: "Account wird erstellt...",
      successTitle: "Account erstellt.",
      successText:
        "Schau in deine E-Mails und klicke auf den Bestätigungslink. Danach kannst du dich einloggen.",
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
        "Ich stimme zu, die Community-Regeln und Datenschutzbedingungen einzuhalten.",
      switchPrompt: "Schon einen Account?",
      switchHref: "/login",
      switchLabel: "Einloggen",
    },
  },
} satisfies Record<Locale, AuthCopy>;
