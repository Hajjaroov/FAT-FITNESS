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
    pageEyebrow: string;
    pageIntro: string;
    myDietTitle: string;
    addMealLabel: string;
    renameMealLabel: string;
    mealTitleLabel: string;
    deleteMealLabel: string;
    deleteMealConfirm: string;
    moveUpLabel: string;
    moveDownLabel: string;
    emptyMealsText: string;
    emptyMealItemsText: string;
    addFoodLabel: string;
    searchPlaceholder: string;
    searchHint: string;
    noResultsLabel: string;
    nameLabel: string;
    nameDeLabel: string;
    nameDePlaceholder: string;
    nameDeHint: string;
    unitLabelLabel: string;
    unitLabelPlaceholder: string;
    quantityLabel: string;
    caloriesLabel: string;
    proteinLabel: string;
    carbsLabel: string;
    fatLabel: string;
    caloriesUnit: string;
    saveLabel: string;
    savingLabel: string;
    cancelLabel: string;
    editLabel: string;
    deleteLabel: string;
    deleteItemConfirm: string;
    flagLabel: string;
    flagModalTitle: string;
    flagCurrentValuesLabel: string;
    flagProposedValuesLabel: string;
    flagCommentLabel: string;
    flagCommentPlaceholder: string;
    flagSubmitLabel: string;
    flagSubmittedMessage: string;
    flagErrorMessage: string;
    flagDuplicateError: string;
    mealSubtotalLabel: string;
    dayTotalCaloriesLabel: string;
    dayTotalProteinLabel: string;
    dayTotalCarbsLabel: string;
    dayTotalFatLabel: string;
    loadError: string;
    itemAddError: string;
    itemUpdateError: string;
    itemDeleteError: string;
    mealAddError: string;
    mealRenameError: string;
    mealDeleteError: string;
    mealReorderError: string;
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
        "Build your own meals from foods you add, and see the totals as you go.",
      linkLabel: "Open Diet",
      pageEyebrow: "Personal tracking",
      pageIntro:
        "This is your own diet, built meal by meal. Add a meal, add foods to it, and the totals update as you go. Nothing here is a plan for anyone else to follow.",
      myDietTitle: "My Diet",
      addMealLabel: "Add a meal",
      renameMealLabel: "Rename",
      mealTitleLabel: "Meal title",
      deleteMealLabel: "Delete meal",
      deleteMealConfirm: "Delete this meal and everything in it?",
      moveUpLabel: "Move up",
      moveDownLabel: "Move down",
      emptyMealsText: "No meals yet. Add your first one to start building your diet.",
      emptyMealItemsText: "No foods in this meal yet.",
      addFoodLabel: "Add food",
      searchPlaceholder: "Search foods, e.g. eggs",
      searchHint: "Pick a suggestion or keep typing to add your own.",
      noResultsLabel: "No matches. Fill in the details below to add it yourself.",
      nameLabel: "Name (English)",
      nameDeLabel: "German name (optional)",
      nameDePlaceholder: "e.g. Rührei",
      nameDeHint: "If you know it, adding this helps other users find this food when searching in German.",
      unitLabelLabel: "Serving",
      unitLabelPlaceholder: "e.g. 1 egg, 57g or 100g",
      quantityLabel: "Quantity",
      caloriesLabel: "Calories",
      proteinLabel: "Protein (g)",
      carbsLabel: "Carbs (g)",
      fatLabel: "Fat (g)",
      caloriesUnit: "kcal",
      saveLabel: "Save",
      savingLabel: "Saving...",
      cancelLabel: "Cancel",
      editLabel: "Edit",
      deleteLabel: "Delete",
      deleteItemConfirm: "Remove this food from the meal?",
      flagLabel: "Flag",
      flagModalTitle: "Flag this food's macros",
      flagCurrentValuesLabel: "Current values",
      flagProposedValuesLabel: "Your suggested values",
      flagCommentLabel: "Comment (optional)",
      flagCommentPlaceholder: "What looks wrong, and why?",
      flagSubmitLabel: "Submit for review",
      flagSubmittedMessage: "Thanks — a moderator will review this.",
      flagErrorMessage: "Could not submit. Please try again.",
      flagDuplicateError: "You've already flagged this food.",
      mealSubtotalLabel: "Meal total",
      dayTotalCaloriesLabel: "Calories",
      dayTotalProteinLabel: "Protein",
      dayTotalCarbsLabel: "Carbs",
      dayTotalFatLabel: "Fat",
      loadError: "Could not load your diet. Please try again.",
      itemAddError: "Could not add this food. Please try again.",
      itemUpdateError: "Could not save changes. Please try again.",
      itemDeleteError: "Could not remove this food. Please try again.",
      mealAddError: "Could not add a meal. Please try again.",
      mealRenameError: "Could not rename this meal. Please try again.",
      mealDeleteError: "Could not delete this meal. Please try again.",
      mealReorderError: "Could not reorder meals. Please try again.",
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
        "Baue deine eigenen Mahlzeiten aus Lebensmitteln, die du hinzufügst, und sieh die Summen live.",
      linkLabel: "Ernährung öffnen",
      pageEyebrow: "Persönliches Tracking",
      pageIntro:
        "Das ist deine eigene Ernährung, Mahlzeit für Mahlzeit aufgebaut. Füge eine Mahlzeit hinzu, füge Lebensmittel hinzu, und die Summen aktualisieren sich live. Das hier ist kein Plan, dem jemand anderes folgen soll.",
      myDietTitle: "Meine Ernährung",
      addMealLabel: "Mahlzeit hinzufügen",
      renameMealLabel: "Umbenennen",
      mealTitleLabel: "Titel der Mahlzeit",
      deleteMealLabel: "Mahlzeit löschen",
      deleteMealConfirm: "Diese Mahlzeit und alles darin löschen?",
      moveUpLabel: "Nach oben",
      moveDownLabel: "Nach unten",
      emptyMealsText:
        "Noch keine Mahlzeiten. Füge deine erste hinzu, um deine Ernährung aufzubauen.",
      emptyMealItemsText: "Noch keine Lebensmittel in dieser Mahlzeit.",
      addFoodLabel: "Lebensmittel hinzufügen",
      searchPlaceholder: "Lebensmittel suchen, z. B. Eier",
      searchHint: "Wähle einen Vorschlag oder tippe weiter, um selbst etwas hinzuzufügen.",
      noResultsLabel: "Keine Treffer. Fülle die Angaben unten aus, um es selbst hinzuzufügen.",
      nameLabel: "Name (Englisch)",
      nameDeLabel: "Deutscher Name (optional)",
      nameDePlaceholder: "z. B. Rührei",
      nameDeHint:
        "Falls du ihn kennst, hilft dieser Eintrag anderen, dieses Lebensmittel bei einer deutschen Suche zu finden.",
      unitLabelLabel: "Portion",
      unitLabelPlaceholder: "z. B. 1 Ei, 57g oder 100g",
      quantityLabel: "Menge",
      caloriesLabel: "Kalorien",
      proteinLabel: "Protein (g)",
      carbsLabel: "Kohlenhydrate (g)",
      fatLabel: "Fett (g)",
      caloriesUnit: "kcal",
      saveLabel: "Speichern",
      savingLabel: "Wird gespeichert...",
      cancelLabel: "Abbrechen",
      editLabel: "Bearbeiten",
      deleteLabel: "Löschen",
      deleteItemConfirm: "Dieses Lebensmittel aus der Mahlzeit entfernen?",
      flagLabel: "Melden",
      flagModalTitle: "Makros dieses Lebensmittels melden",
      flagCurrentValuesLabel: "Aktuelle Werte",
      flagProposedValuesLabel: "Deine vorgeschlagenen Werte",
      flagCommentLabel: "Kommentar (optional)",
      flagCommentPlaceholder: "Was sieht falsch aus, und warum?",
      flagSubmitLabel: "Zur Prüfung einreichen",
      flagSubmittedMessage: "Danke — ein Moderator wird das prüfen.",
      flagErrorMessage: "Konnte nicht gesendet werden. Bitte versuche es erneut.",
      flagDuplicateError: "Du hast dieses Lebensmittel bereits gemeldet.",
      mealSubtotalLabel: "Zwischensumme",
      dayTotalCaloriesLabel: "Kalorien",
      dayTotalProteinLabel: "Eiweiß",
      dayTotalCarbsLabel: "Kohlenhydrate",
      dayTotalFatLabel: "Fett",
      loadError: "Deine Ernährung konnte nicht geladen werden. Bitte versuche es erneut.",
      itemAddError: "Lebensmittel konnte nicht hinzugefügt werden. Bitte versuche es erneut.",
      itemUpdateError: "Änderungen konnten nicht gespeichert werden. Bitte versuche es erneut.",
      itemDeleteError: "Lebensmittel konnte nicht entfernt werden. Bitte versuche es erneut.",
      mealAddError: "Mahlzeit konnte nicht hinzugefügt werden. Bitte versuche es erneut.",
      mealRenameError: "Mahlzeit konnte nicht umbenannt werden. Bitte versuche es erneut.",
      mealDeleteError: "Mahlzeit konnte nicht gelöscht werden. Bitte versuche es erneut.",
      mealReorderError: "Reihenfolge konnte nicht gespeichert werden. Bitte versuche es erneut.",
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
