import type { Locale } from "@/content/site";

type MyPlanCopy = {
  title: string;
  eyebrow: string;
  intro: string;
  weight: {
    sectionTitle: string;
    chartPrompt: string;
    goalsTitle: string;
    startWeightLabel: string;
    goalWeightLabel: string;
    saveGoalsLabel: string;
    savingLabel: string;
    goalsSaved: string;
    goalsSaveError: string;
    entryTitle: string;
    entryDateLabel: string;
    entryWeightLabel: string;
    addEntryLabel: string;
    addingLabel: string;
    entryAdded: string;
    entryError: string;
    entryDuplicateError: string;
    entriesLoadError: string;
    goalsLoadError: string;
    tooltipLabel: string;
  };
  diet: {
    title: string;
    summary: string;
    linkLabel: string;
  };
  workout: {
    title: string;
    summary: string;
    linkLabel: string;
  };
  glp1: {
    title: string;
    summary: string;
    linkLabel: string;
  };
};

export const myPlanCopy = {
  en: {
    title: "My Plan",
    eyebrow: "Personal tracking",
    intro:
      "This is your private space to track what matters — weight progress, meals, training, and medication. Nothing here is public. It is just for you.",
    weight: {
      sectionTitle: "Weight",
      chartPrompt: "Set your start weight and goal to begin tracking.",
      goalsTitle: "Start weight & goal",
      startWeightLabel: "Start weight (kg)",
      goalWeightLabel: "Goal weight (kg)",
      saveGoalsLabel: "Save goals",
      savingLabel: "Saving...",
      goalsSaved: "Goals saved.",
      goalsSaveError: "Could not save goals. Please try again.",
      entryTitle: "Log a weight entry",
      entryDateLabel: "Date",
      entryWeightLabel: "Weight (kg)",
      addEntryLabel: "Add entry",
      addingLabel: "Adding...",
      entryAdded: "Entry added.",
      entryError: "Could not add entry. Please try again.",
      entryDuplicateError: "An entry for this date already exists.",
      entriesLoadError: "Could not load weight entries.",
      goalsLoadError: "Could not load weight goals.",
      tooltipLabel: "Weight",
    },
    diet: {
      title: "Diet",
      summary:
        "Track your daily meals, personal calorie and macro targets, and build your own food database. Coming in a future update.",
      linkLabel: "Open Diet",
    },
    workout: {
      title: "Workout",
      summary:
        "Build your weekly training plan, pick exercises from the library, and mark sessions as done. Coming in a future update.",
      linkLabel: "Open Workout",
    },
    glp1: {
      title: "GLP-1 / Medication",
      summary:
        "Log your injection dates, doses, and personal notes. A private timeline — no medical advice, just your own record. Coming in a future update.",
      linkLabel: "Open GLP-1 Log",
    },
  },
  de: {
    title: "Mein Plan",
    eyebrow: "Persönliches Tracking",
    intro:
      "Das ist dein privater Bereich, um das Wichtigste zu verfolgen — Gewichtsverlauf, Mahlzeiten, Training und Medikamente. Hier ist nichts öffentlich. Es ist nur für dich.",
    weight: {
      sectionTitle: "Gewicht",
      chartPrompt: "Lege dein Startgewicht und Ziel fest, um mit dem Tracking zu beginnen.",
      goalsTitle: "Startgewicht & Ziel",
      startWeightLabel: "Startgewicht (kg)",
      goalWeightLabel: "Zielgewicht (kg)",
      saveGoalsLabel: "Ziele speichern",
      savingLabel: "Wird gespeichert...",
      goalsSaved: "Ziele gespeichert.",
      goalsSaveError: "Ziele konnten nicht gespeichert werden. Bitte versuche es erneut.",
      entryTitle: "Gewichtseintrag hinzufügen",
      entryDateLabel: "Datum",
      entryWeightLabel: "Gewicht (kg)",
      addEntryLabel: "Eintrag hinzufügen",
      addingLabel: "Wird hinzugefügt...",
      entryAdded: "Eintrag hinzugefügt.",
      entryError: "Eintrag konnte nicht hinzugefügt werden. Bitte versuche es erneut.",
      entryDuplicateError: "Für dieses Datum existiert bereits ein Eintrag.",
      entriesLoadError: "Gewichtseinträge konnten nicht geladen werden.",
      goalsLoadError: "Gewichtsziele konnten nicht geladen werden.",
      tooltipLabel: "Gewicht",
    },
    diet: {
      title: "Ernährung",
      summary:
        "Verfolge deine täglichen Mahlzeiten, persönliche Kalorien- und Makroziele und baue deine eigene Lebensmitteldatenbank auf. Kommt in einem zukünftigen Update.",
      linkLabel: "Ernährung öffnen",
    },
    workout: {
      title: "Training",
      summary:
        "Erstelle deinen wöchentlichen Trainingsplan, wähle Übungen aus der Bibliothek und markiere Einheiten als erledigt. Kommt in einem zukünftigen Update.",
      linkLabel: "Training öffnen",
    },
    glp1: {
      title: "GLP-1 / Medikamente",
      summary:
        "Dokumentiere deine Injektionsdaten, Dosen und persönliche Notizen. Eine private Zeitlinie — keine medizinische Beratung, nur deine eigene Aufzeichnung. Kommt in einem zukünftigen Update.",
      linkLabel: "GLP-1-Tagebuch öffnen",
    },
  },
} satisfies Record<Locale, MyPlanCopy>;
