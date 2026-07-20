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
    progressStartLabel: string;
    progressLatestLabel: string;
    progressChangeLabel: string;
    progressNoEntries: string;
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
    flagInvalidMacrosError: string;
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
    pageEyebrow: string;
    pageIntro: string;
    myWorkoutTitle: string;
    addDayLabel: string;
    addDayTitlePlaceholder: string;
    maxDaysHint: string;
    weekdayLabel: string;
    noWeekdayOption: string;
    weekdays: Record<
      "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY" | "SUNDAY",
      string
    >;
    renameDayLabel: string;
    dayTitleLabel: string;
    deleteDayLabel: string;
    deleteDayConfirm: string;
    moveUpLabel: string;
    moveDownLabel: string;
    emptyDaysText: string;
    emptyDayExercisesText: string;
    addExerciseLabel: string;
    searchPlaceholder: string;
    searchHint: string;
    noResultsLabel: string;
    nameLabel: string;
    nameDeLabel: string;
    nameDePlaceholder: string;
    nameDeHint: string;
    setsLabel: string;
    setsPlaceholder: string;
    saveLabel: string;
    savingLabel: string;
    cancelLabel: string;
    editLabel: string;
    deleteLabel: string;
    deleteExerciseConfirm: string;
    loadError: string;
    dayAddError: string;
    dayRenameError: string;
    dayDeleteError: string;
    dayReorderError: string;
    exerciseAddError: string;
    exerciseUpdateError: string;
    exerciseDeleteError: string;
  };
  glp1: {
    title: string;
    summary: string;
    linkLabel: string;
    pageEyebrow: string;
    pageIntro: string;
    myGlp1Title: string;
    entriesTitle: string;
    emptyEntriesText: string;
    addEntryLabel: string;
    dateLabel: string;
    doseLabel: string;
    doseUnit: string;
    weightLabel: string;
    weightHint: string;
    notesLabel: string;
    notesPlaceholder: string;
    changeLabel: string;
    firstEntryLabel: string;
    saveLabel: string;
    savingLabel: string;
    cancelLabel: string;
    editLabel: string;
    deleteLabel: string;
    deleteEntryConfirm: string;
    loadError: string;
    addError: string;
    updateError: string;
    deleteError: string;
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
      progressStartLabel: "Starting point",
      progressLatestLabel: "Latest logged point",
      progressChangeLabel: "Logged change",
      progressNoEntries: "No entries yet",
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
      flagInvalidMacrosError: "Please enter valid numbers for all four macros.",
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
        "Build your weekly training plan and pick exercises from the library.",
      linkLabel: "Open Workout",
      pageEyebrow: "Personal tracking",
      pageIntro:
        "This is your own weekly training plan. Add a block for each training day — pick a day of the week and give it a name, or leave the day open for something like a warm-up protocol — then list the exercises with their sets.",
      myWorkoutTitle: "My Workout",
      addDayLabel: "Add a day",
      addDayTitlePlaceholder: "e.g. Upper A or Warm-Up Protocol",
      maxDaysHint: "A weekly plan can have up to 50 blocks.",
      weekdayLabel: "Day of the week",
      noWeekdayOption: "No specific day",
      weekdays: {
        MONDAY: "Monday",
        TUESDAY: "Tuesday",
        WEDNESDAY: "Wednesday",
        THURSDAY: "Thursday",
        FRIDAY: "Friday",
        SATURDAY: "Saturday",
        SUNDAY: "Sunday",
      },
      renameDayLabel: "Edit",
      dayTitleLabel: "Day title",
      deleteDayLabel: "Delete day",
      deleteDayConfirm: "Delete this day and everything in it?",
      moveUpLabel: "Move up",
      moveDownLabel: "Move down",
      emptyDaysText: "No days yet. Add your first one to start building your weekly plan.",
      emptyDayExercisesText: "No exercises in this day yet.",
      addExerciseLabel: "Add exercise",
      searchPlaceholder: "Search exercises, e.g. squats",
      searchHint: "Pick a suggestion or keep typing to add your own.",
      noResultsLabel: "No matches. Fill in the details below to add it yourself.",
      nameLabel: "Name (English)",
      nameDeLabel: "German name (optional)",
      nameDePlaceholder: "e.g. Kniebeugen",
      nameDeHint:
        "If you know it, adding this helps other users find this exercise when searching in German.",
      setsLabel: "Sets / reps",
      setsPlaceholder: "e.g. 3 x 8-10 or 2 minutes",
      saveLabel: "Save",
      savingLabel: "Saving...",
      cancelLabel: "Cancel",
      editLabel: "Edit",
      deleteLabel: "Delete",
      deleteExerciseConfirm: "Remove this exercise from the day?",
      loadError: "Could not load your workout plan. Please try again.",
      dayAddError: "Could not add a day. Please try again.",
      dayRenameError: "Could not save this day. Please try again.",
      dayDeleteError: "Could not delete this day. Please try again.",
      dayReorderError: "Could not reorder days. Please try again.",
      exerciseAddError: "Could not add this exercise. Please try again.",
      exerciseUpdateError: "Could not save changes. Please try again.",
      exerciseDeleteError: "Could not remove this exercise. Please try again.",
    },
    glp1: {
      title: "GLP-1 / Medication",
      summary:
        "Log your injection dates, doses, and personal notes. A private timeline — no medical advice, just your own record.",
      linkLabel: "Open GLP-1 Log",
      pageEyebrow: "Personal tracking",
      pageIntro:
        "A private log of your injections — date, dose, and an optional note. Not medical advice, a dosing guide, or a method for anyone else to follow — medical decisions belong with a qualified professional. If you log a weight alongside a dose, it also becomes part of your weight history on the Weight section above.",
      myGlp1Title: "My GLP-1 Log",
      entriesTitle: "Logged Entries",
      emptyEntriesText: "No entries yet. Log your first dose below if you'd like to track it.",
      addEntryLabel: "Add entry",
      dateLabel: "Date",
      doseLabel: "Dose",
      doseUnit: "mg",
      weightLabel: "Weight (kg, optional)",
      weightHint:
        "If you weigh yourself on injection day, add it here — it's saved to your weight history too, unless you've already logged a weight for this date.",
      notesLabel: "Notes (optional)",
      notesPlaceholder: "e.g. injection site, how you felt",
      changeLabel: "Change",
      firstEntryLabel: "First entry",
      saveLabel: "Save",
      savingLabel: "Saving...",
      cancelLabel: "Cancel",
      editLabel: "Edit",
      deleteLabel: "Delete",
      deleteEntryConfirm: "Delete this entry?",
      loadError: "Could not load your GLP-1 log. Please try again.",
      addError: "Could not add this entry. Please try again.",
      updateError: "Could not save changes. Please try again.",
      deleteError: "Could not delete this entry. Please try again.",
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
      progressStartLabel: "Startpunkt",
      progressLatestLabel: "Letzter eingetragener Stand",
      progressChangeLabel: "Eingetragene Veränderung",
      progressNoEntries: "Noch keine Einträge",
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
      flagInvalidMacrosError: "Bitte gib für alle vier Makros gültige Zahlen ein.",
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
        "Erstelle deinen wöchentlichen Trainingsplan und wähle Übungen aus der Bibliothek.",
      linkLabel: "Training öffnen",
      pageEyebrow: "Persönliches Tracking",
      pageIntro:
        "Das ist dein eigener wöchentlicher Trainingsplan. Füge für jeden Trainingstag einen Block hinzu — wähle einen Wochentag und gib ihm einen Namen, oder lass den Tag offen, z. B. für ein Aufwärmprogramm — und liste dann die Übungen mit ihren Sätzen auf.",
      myWorkoutTitle: "Mein Training",
      addDayLabel: "Tag hinzufügen",
      addDayTitlePlaceholder: "z. B. Oberkörper A oder Aufwärmprogramm",
      maxDaysHint: "Ein Wochenplan kann bis zu 50 Blöcke haben.",
      weekdayLabel: "Wochentag",
      noWeekdayOption: "Kein fester Tag",
      weekdays: {
        MONDAY: "Montag",
        TUESDAY: "Dienstag",
        WEDNESDAY: "Mittwoch",
        THURSDAY: "Donnerstag",
        FRIDAY: "Freitag",
        SATURDAY: "Samstag",
        SUNDAY: "Sonntag",
      },
      renameDayLabel: "Bearbeiten",
      dayTitleLabel: "Titel des Tages",
      deleteDayLabel: "Tag löschen",
      deleteDayConfirm: "Diesen Tag und alles darin löschen?",
      moveUpLabel: "Nach oben",
      moveDownLabel: "Nach unten",
      emptyDaysText:
        "Noch keine Tage. Füge deinen ersten hinzu, um deinen Wochenplan aufzubauen.",
      emptyDayExercisesText: "Noch keine Übungen an diesem Tag.",
      addExerciseLabel: "Übung hinzufügen",
      searchPlaceholder: "Übungen suchen, z. B. Kniebeugen",
      searchHint: "Wähle einen Vorschlag oder tippe weiter, um selbst etwas hinzuzufügen.",
      noResultsLabel: "Keine Treffer. Fülle die Angaben unten aus, um sie selbst hinzuzufügen.",
      nameLabel: "Name (Englisch)",
      nameDeLabel: "Deutscher Name (optional)",
      nameDePlaceholder: "z. B. Kniebeugen",
      nameDeHint:
        "Falls du ihn kennst, hilft dieser Eintrag anderen, diese Übung bei einer deutschen Suche zu finden.",
      setsLabel: "Sätze / Wiederholungen",
      setsPlaceholder: "z. B. 3 x 8-10 oder 2 Minuten",
      saveLabel: "Speichern",
      savingLabel: "Wird gespeichert...",
      cancelLabel: "Abbrechen",
      editLabel: "Bearbeiten",
      deleteLabel: "Löschen",
      deleteExerciseConfirm: "Diese Übung aus dem Tag entfernen?",
      loadError: "Dein Trainingsplan konnte nicht geladen werden. Bitte versuche es erneut.",
      dayAddError: "Tag konnte nicht hinzugefügt werden. Bitte versuche es erneut.",
      dayRenameError: "Tag konnte nicht gespeichert werden. Bitte versuche es erneut.",
      dayDeleteError: "Tag konnte nicht gelöscht werden. Bitte versuche es erneut.",
      dayReorderError: "Reihenfolge konnte nicht gespeichert werden. Bitte versuche es erneut.",
      exerciseAddError: "Übung konnte nicht hinzugefügt werden. Bitte versuche es erneut.",
      exerciseUpdateError: "Änderungen konnten nicht gespeichert werden. Bitte versuche es erneut.",
      exerciseDeleteError: "Übung konnte nicht entfernt werden. Bitte versuche es erneut.",
    },
    glp1: {
      title: "GLP-1 / Medikamente",
      summary:
        "Dokumentiere deine Injektionsdaten, Dosen und persönliche Notizen. Eine private Zeitlinie — keine medizinische Beratung, nur deine eigene Aufzeichnung.",
      linkLabel: "GLP-1-Tagebuch öffnen",
      pageEyebrow: "Persönliches Tracking",
      pageIntro:
        "Ein privates Protokoll deiner Injektionen — Datum, Dosis und eine optionale Notiz. Keine medizinische Beratung, keine Dosierungsanleitung und kein Vorbild für andere — medizinische Entscheidungen gehören in die Hände einer qualifizierten Fachperson. Wenn du zusammen mit einer Dosis ein Gewicht einträgst, wird es auch Teil deines Gewichtsverlaufs im Bereich Gewicht oben.",
      myGlp1Title: "Mein GLP-1-Tagebuch",
      entriesTitle: "Erfasste Einträge",
      emptyEntriesText:
        "Noch keine Einträge. Erfasse unten deine erste Dosis, falls du sie verfolgen möchtest.",
      addEntryLabel: "Eintrag hinzufügen",
      dateLabel: "Datum",
      doseLabel: "Dosis",
      doseUnit: "mg",
      weightLabel: "Gewicht (kg, optional)",
      weightHint:
        "Falls du dich am Injektionstag wiegst, trage es hier ein — es wird auch in deinem Gewichtsverlauf gespeichert, außer für dieses Datum ist bereits ein Gewicht erfasst.",
      notesLabel: "Notizen (optional)",
      notesPlaceholder: "z. B. Injektionsstelle, wie du dich gefühlt hast",
      changeLabel: "Veränderung",
      firstEntryLabel: "Erster Eintrag",
      saveLabel: "Speichern",
      savingLabel: "Wird gespeichert...",
      cancelLabel: "Abbrechen",
      editLabel: "Bearbeiten",
      deleteLabel: "Löschen",
      deleteEntryConfirm: "Diesen Eintrag löschen?",
      loadError: "Dein GLP-1-Tagebuch konnte nicht geladen werden. Bitte versuche es erneut.",
      addError: "Eintrag konnte nicht hinzugefügt werden. Bitte versuche es erneut.",
      updateError: "Änderungen konnten nicht gespeichert werden. Bitte versuche es erneut.",
      deleteError: "Eintrag konnte nicht gelöscht werden. Bitte versuche es erneut.",
    },
  },
} satisfies Record<Locale, MyPlanCopy>;
