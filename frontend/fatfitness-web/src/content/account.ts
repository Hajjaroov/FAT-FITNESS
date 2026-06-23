import type { Locale } from "@/content/site";
import type { UserRole, UserStatus } from "@/types/auth";

type AccountCopy = {
  eyebrow: string;
  title: string;
  intro: string;
  loading: {
    title: string;
    body: string;
  };
  signedOut: {
    title: string;
    body: string;
    loginLabel: string;
    registerLabel: string;
  };
  summary: {
    title: string;
    intro: string;
    activeBadge: string;
    logoutLabel: string;
    logoutPendingLabel: string;
    logoutError: string;
  };
  labels: {
    displayName: string;
    email: string;
    countryRegion: string;
    status: string;
    roles: string;
    emailVerifiedAt: string;
    lastLoginAt: string;
  };
  empty: {
    country: string;
    date: string;
  };
  statuses: Record<UserStatus, string>;
  roles: Record<UserRole, string>;
  community: {
    title: string;
    body: string;
  };
  privacy: {
    title: string;
    body: string;
  };
  savedPosts: {
    title: string;
    loading: string;
    emptyTitle: string;
    emptyText: string;
    error: string;
    openLabel: string;
  };
};

export const accountCopy = {
  en: {
    eyebrow: "Account",
    title: "Your Fat Fitness account.",
    intro:
      "This is the small account home for the current browser session. It shows what the backend knows about the signed-in user without collecting health details.",
    loading: {
      title: "Checking your session",
      body: "The browser is asking the backend whether a saved refresh session is still active.",
    },
    signedOut: {
      title: "You are not signed in.",
      body: "Sign in with a verified account, or create a new one before starting community threads.",
      loginLabel: "Sign in",
      registerLabel: "Create account",
    },
    summary: {
      title: "Account summary",
      intro:
        "Your account can start forum threads now. Replies and deeper community features are still being built carefully.",
      activeBadge: "Signed in",
      logoutLabel: "Log out",
      logoutPendingLabel: "Logging out...",
      logoutError: "Logout failed. Please try again.",
    },
    labels: {
      displayName: "Display name",
      email: "Email",
      countryRegion: "Country / region",
      status: "Status",
      roles: "Roles",
      emailVerifiedAt: "Email verified",
      lastLoginAt: "Last login",
    },
    empty: {
      country: "Not set",
      date: "Not available",
    },
    statuses: {
      PENDING_EMAIL_VERIFICATION: "Pending email verification",
      ACTIVE: "Active",
      BANNED: "Banned",
      DELETED: "Deleted",
    },
    roles: {
      OWNER: "Owner",
      ADMIN: "Admin",
      MODERATOR: "Moderator",
      USER: "User",
    },
    community: {
      title: "Community access",
      body:
        "Email verification is the gate we will reuse before posting, replying, reporting, or using other account-only community actions.",
    },
    privacy: {
      title: "Privacy boundary",
      body:
        "Basic registration stays intentionally light: no weight history, GLP-1 status, photos, diet logs, or medical history are part of this account page.",
    },
    savedPosts: {
      title: "Saved threads",
      loading: "Loading saved threads...",
      emptyTitle: "No saved threads yet.",
      emptyText:
        "When you save a thread from the community, it will appear here.",
      error: "Could not load saved threads. Please try again.",
      openLabel: "Open thread",
    },
  },
  de: {
    eyebrow: "Account",
    title: "Dein Fat Fitness Account.",
    intro:
      "Das ist die kleine Account-Startseite für die aktuelle Browser-Sitzung. Sie zeigt, was das Backend über den eingeloggten Nutzer kennt, ohne Gesundheitsdaten zu sammeln.",
    loading: {
      title: "Sitzung wird geprüft",
      body: "Der Browser fragt das Backend, ob eine gespeicherte Refresh-Sitzung noch aktiv ist.",
    },
    signedOut: {
      title: "Du bist nicht eingeloggt.",
      body:
        "Logge dich mit einem verifizierten Account ein oder erstelle einen neuen Account, bevor du Community-Threads startest.",
      loginLabel: "Einloggen",
      registerLabel: "Account erstellen",
    },
    summary: {
      title: "Account-Übersicht",
      intro:
        "Dein Account kann jetzt Forum-Threads starten. Antworten und tiefere Community-Funktionen werden noch sorgfältig gebaut.",
      activeBadge: "Eingeloggt",
      logoutLabel: "Ausloggen",
      logoutPendingLabel: "Wird ausgeloggt...",
      logoutError: "Ausloggen fehlgeschlagen. Bitte versuche es erneut.",
    },
    labels: {
      displayName: "Anzeigename",
      email: "E-Mail",
      countryRegion: "Land / Region",
      status: "Status",
      roles: "Rollen",
      emailVerifiedAt: "E-Mail verifiziert",
      lastLoginAt: "Letzter Login",
    },
    empty: {
      country: "Nicht gesetzt",
      date: "Nicht verfügbar",
    },
    statuses: {
      PENDING_EMAIL_VERIFICATION: "E-Mail-Verifizierung offen",
      ACTIVE: "Aktiv",
      BANNED: "Gesperrt",
      DELETED: "Gelöscht",
    },
    roles: {
      OWNER: "Owner",
      ADMIN: "Admin",
      MODERATOR: "Moderator",
      USER: "User",
    },
    community: {
      title: "Community-Zugang",
      body:
        "Die E-Mail-Verifizierung ist die Grenze, die wir später für Beiträge, Antworten, Meldungen und andere Account-Funktionen wiederverwenden.",
    },
    privacy: {
      title: "Datenschutz-Grenze",
      body:
        "Die Basis-Registrierung bleibt bewusst schlank: Gewichtsverlauf, GLP-1-Status, Fotos, Ernährungslogs oder medizinische Geschichte gehören nicht zu dieser Account-Seite.",
    },
    savedPosts: {
      title: "Gespeicherte Threads",
      loading: "Gespeicherte Threads werden geladen...",
      emptyTitle: "Noch keine gespeicherten Threads.",
      emptyText:
        "Wenn du einen Thread aus der Community speicherst, erscheint er hier.",
      error:
        "Gespeicherte Threads konnten nicht geladen werden. Bitte versuche es erneut.",
      openLabel: "Thread öffnen",
    },
  },
} satisfies Record<Locale, AccountCopy>;
