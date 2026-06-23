import type { Locale } from "@/content/site";

export const adminCopy = {
  en: {
    eyebrow: "Admin",
    title: "Moderation reports",
    intro:
      "Review reports from forum threads and replies. This dashboard can hide reported content, resolve reports, or dismiss reports; locking, banning, and full audit tools come later.",
    loading: {
      title: "Checking admin access",
      body: "The dashboard is checking your current session before loading reports.",
    },
    signedOut: {
      title: "Sign in required",
      body:
        "Moderation tools are only available to signed-in owner, admin, or moderator accounts.",
      loginLabel: "Sign in",
    },
    noAccess: {
      title: "No moderation access",
      body:
        "Your account is signed in, but it does not have owner, admin, or moderator access.",
    },
    filters: {
      title: "Filters",
      statusLabel: "Status",
      targetTypeLabel: "Type",
      refreshLabel: "Refresh",
      refreshPendingLabel: "Refreshing...",
      statuses: {
        OPEN: "Open",
        RESOLVED: "Resolved",
        DISMISSED: "Dismissed",
        ALL: "All",
      },
      targetTypes: {
        ALL: "All",
        POST: "Threads",
        COMMENT: "Replies",
      },
    },
    list: {
      loading: "Loading reports...",
      errorTitle: "Reports could not be loaded",
      emptyTitle: "No reports here",
      emptyText:
        "Reports matching the selected filters will appear here when members submit them.",
      reportedByLabel: "Reported by",
      authorLabel: "Author",
      reasonLabel: "Reason",
      detailsLabel: "Details",
      targetLabel: "Target",
      createdLabel: "Created",
      resolvedLabel: "Resolved",
      noDetails: "No extra details were provided.",
      openThreadLabel: "Open thread",
    },
    targetTypes: {
      POST: "Thread",
      COMMENT: "Reply",
    },
    actions: {
      title: "Review",
      noteLabel: "Resolution note optional",
      notePlaceholder:
        "Add what happened, for example: removed after review, duplicate report, reviewed and safe, or handled manually.",
      hideLabel: "Remove content and resolve",
      resolveLabel: "Mark resolved",
      dismissLabel: "Dismiss",
      submitPendingLabel: "Saving...",
      successHidden: "Content removed and report marked resolved.",
      successLocked: "Thread locked.",
      successBanned: "User banned and sessions revoked.",
      successResolved: "Report marked resolved.",
      successDismissed: "Report dismissed.",
      closedTitle: "Already reviewed",
      closedBody:
        "This report has already been reviewed. Change actions can be added later if needed.",
      errorFallback: "Could not update this report. Please try again.",
      lockLabel: "Lock thread",
      banLabel: "Ban user",
    },
    statusBadges: {
      OPEN: "Open",
      RESOLVED: "Resolved",
      DISMISSED: "Dismissed",
    },
  },
  de: {
    eyebrow: "Admin",
    title: "Moderationsmeldungen",
    intro:
      "Prüfe Meldungen aus Forum-Threads und Antworten. Dieses Dashboard kann gemeldete Inhalte verstecken, Meldungen lösen oder Meldungen ablehnen; Sperren, Bann und vollständige Audit-Werkzeuge kommen später.",
    loading: {
      title: "Admin-Zugriff wird geprüft",
      body:
        "Das Dashboard prüft deine aktuelle Sitzung, bevor Meldungen geladen werden.",
    },
    signedOut: {
      title: "Einloggen erforderlich",
      body:
        "Moderationswerkzeuge sind nur für eingeloggte Owner-, Admin- oder Moderator-Accounts verfügbar.",
      loginLabel: "Einloggen",
    },
    noAccess: {
      title: "Kein Moderationszugriff",
      body:
        "Dein Account ist eingeloggt, hat aber keinen Owner-, Admin- oder Moderator-Zugriff.",
    },
    filters: {
      title: "Filter",
      statusLabel: "Status",
      targetTypeLabel: "Typ",
      refreshLabel: "Aktualisieren",
      refreshPendingLabel: "Wird aktualisiert...",
      statuses: {
        OPEN: "Offen",
        RESOLVED: "Gelöst",
        DISMISSED: "Abgelehnt",
        ALL: "Alle",
      },
      targetTypes: {
        ALL: "Alle",
        POST: "Threads",
        COMMENT: "Antworten",
      },
    },
    list: {
      loading: "Meldungen werden geladen...",
      errorTitle: "Meldungen konnten nicht geladen werden",
      emptyTitle: "Keine Meldungen hier",
      emptyText:
        "Meldungen mit den ausgewählten Filtern erscheinen hier, wenn Mitglieder sie senden.",
      reportedByLabel: "Gemeldet von",
      authorLabel: "Autor",
      reasonLabel: "Grund",
      detailsLabel: "Details",
      targetLabel: "Ziel",
      createdLabel: "Erstellt",
      resolvedLabel: "Gelöst",
      noDetails: "Es wurden keine weiteren Details angegeben.",
      openThreadLabel: "Thread öffnen",
    },
    targetTypes: {
      POST: "Thread",
      COMMENT: "Antwort",
    },
    actions: {
      title: "Prüfen",
      noteLabel: "Lösungsnotiz optional",
      notePlaceholder:
        "Ergänze, was passiert ist, zum Beispiel: nach Prüfung versteckt, doppelte Meldung, geprüft und sicher, oder manuell behandelt.",
      hideLabel: "Inhalt verstecken und lösen",
      resolveLabel: "Als gelöst markieren",
      dismissLabel: "Ablehnen",
      submitPendingLabel: "Wird gespeichert...",
      successLocked: "Thread gesperrt.",
      successBanned: "Benutzer gesperrt und Sitzungen widerrufen.",
      successHidden: "Inhalt versteckt und Meldung als gelöst markiert.",
      successResolved: "Meldung als gelöst markiert.",
      successDismissed: "Meldung abgelehnt.",
      closedTitle: "Bereits geprüft",
      closedBody:
        "Diese Meldung wurde bereits geprüft. Änderungsaktionen können später ergänzt werden, falls nötig.",
      errorFallback:
        "Diese Meldung konnte nicht aktualisiert werden. Bitte versuche es erneut.",
      lockLabel: "Thread sperren",
      banLabel: "Benutzer sperren",
    },
    statusBadges: {
      OPEN: "Offen",
      RESOLVED: "Gelöst",
      DISMISSED: "Abgelehnt",
    },
  },
} satisfies Record<Locale, unknown>;
