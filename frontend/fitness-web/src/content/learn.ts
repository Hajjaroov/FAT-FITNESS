import type { Locale } from "@/content/site";

type Exercise = {
  name: string;
  sets: string;
  photoKey: string;
  photoSrc?: string;
};

type TrainingDay = {
  day: string;
  focus: string;
  exercises: Exercise[];
  notes: string[];
};

const loggedEntries = [
  ["2.5", "2025-11-16", "203.0 kg", "0 kg"],
  ["2.5", "2025-11-23", "197.0 kg", "-6.0 kg"],
  ["5.0", "2025-11-29", "191.5 kg", "-5.5 kg"],
  ["5.0", "2025-12-06", "189.3 kg", "-2.2 kg"],
  ["5.0", "2025-12-13", "187.2 kg", "-2.2 kg"],
  ["5.0", "2025-12-20", "185.3 kg", "-1.9 kg"],
  ["5.0", "2025-12-27", "183.0 kg", "-2.3 kg"],
  ["5.0", "2026-01-04", "181.6 kg", "-1.4 kg"],
  ["5.0", "2026-01-11", "180.2 kg", "-1.4 kg"],
  ["5.0", "2026-01-18", "179.6 kg", "-0.6 kg"],
  ["5.0", "2026-01-25", "177.6 kg", "-2.0 kg"],
  ["5.0", "2026-02-01", "176.6 kg", "-1.0 kg"],
  ["5.0", "2026-02-08", "174.9 kg", "-1.7 kg"],
  ["6.25", "2026-02-15", "174.4 kg", "-0.5 kg"],
  ["6.25", "2026-02-22", "173.0 kg", "-1.4 kg"],
  ["7.5", "2026-03-01", "171.6 kg", "-1.4 kg"],
  ["7.5", "2026-03-08", "170.1 kg", "-1.5 kg"],
  ["7.5", "2026-03-16", "168.8 kg", "-1.3 kg"],
  ["7.5", "2026-03-23", "166.5 kg", "-2.3 kg"],
  ["7.5", "2026-03-30", "165.3 kg", "-1.2 kg"],
  ["7.5", "2026-04-06", "164.7 kg", "-0.6 kg"],
  ["7.5", "2026-04-13", "163.3 kg", "-1.4 kg"],
  ["7.5", "2026-04-21", "162.8 kg", "-0.5 kg"],
  ["7.5", "2026-04-29", "162.5 kg", "-0.3 kg"],
  ["7.5", "2026-05-07", "162.5 kg", "0 kg"],
  ["7.5", "2026-05-15", "162.0 kg", "-0.5 kg"],
  ["7.5", "2026-05-22", "161.5 kg", "-0.5 kg"],
  ["10", "2026-05-31", "160.5 kg", "-1.0 kg"],
  ["10", "2026-06-07", "158.0 kg", "-2.5 kg"],
] as const;

const englishSchedule: TrainingDay[] = [
  {
    day: "Monday",
    focus: "Upper A",
    exercises: [
      {
        name: "Incline dumbbell press, 30-45 degrees",
        sets: "3 x 8-10",
        photoKey: "incline-dumbbell-press",
      },
      {
        name: "Chest-supported dumbbell row",
        sets: "3 x 10",
        photoKey: "chest-supported-dumbbell-row",
      },
      {
        name: "Dumbbell lateral raise",
        sets: "3 x 12-15",
        photoKey: "dumbbell-lateral-raise",
      },
      {
        name: "Seated dumbbell shoulder press",
        sets: "3 x 10",
        photoKey: "seated-dumbbell-shoulder-press",
      },
      { name: "Dumbbell curl", sets: "3 x 12", photoKey: "dumbbell-curl" },
      {
        name: "Overhead dumbbell tricep extension",
        sets: "3 x 12",
        photoKey: "overhead-dumbbell-tricep-extension",
      },
    ],
    notes: [
      "Chest-supported row uses a bench at incline.",
      "Some upper-body movements use 2 sets for the first 2 weeks.",
      "Overhead tricep extension may work better with a chair.",
    ],
  },
  {
    day: "Wednesday",
    focus: "Lower + Core",
    exercises: [
      { name: "Chair squat", sets: "3 x 8", photoKey: "chair-squat" },
      { name: "Romanian deadlift", sets: "3 x 10", photoKey: "romanian-deadlift" },
      { name: "Hip thrust", sets: "3 x 10-12", photoKey: "hip-thrust" },
      {
        name: "Supported split squat",
        sets: "2 x 6 each leg",
        photoKey: "supported-split-squat",
      },
      { name: "Standing calf raise", sets: "3 x 15", photoKey: "standing-calf-raise" },
      {
        name: "Seated core brace",
        sets: "5 x 15 seconds",
        photoKey: "seated-core-brace",
      },
    ],
    notes: [
      "Use chair depth as the squat target.",
      "Hip thrust can be bench-supported if comfortable.",
      "Hold a chair for balance on supported split squats.",
      "Calf raises can progress from bodyweight to dumbbells and step/stair variations.",
    ],
  },
  {
    day: "Friday",
    focus: "Upper B",
    exercises: [
      { name: "Flat dumbbell press", sets: "3 x 8-10", photoKey: "flat-dumbbell-press" },
      { name: "One-arm dumbbell row", sets: "3 x 10", photoKey: "one-arm-dumbbell-row" },
      { name: "Arnold press", sets: "3 x 10", photoKey: "arnold-press" },
      { name: "Rear delt fly", sets: "3 x 12-15", photoKey: "rear-delt-fly" },
      { name: "Hammer curl", sets: "3 x 12", photoKey: "hammer-curl" },
      { name: "Skull crusher", sets: "3 x 12", photoKey: "skull-crusher" },
    ],
    notes: [
      "The source PDF includes a note that seated dumbbell shoulder press may be a harder option.",
      "Current load notes exist in the source PDF, but row mapping needs verification before publishing.",
    ],
  },
  {
    day: "Saturday",
    focus: "Recovery W5+",
    exercises: [
      { name: "Chest-supported row", sets: "2 x 12", photoKey: "chest-supported-row" },
      {
        name: "Incline dumbbell press",
        sets: "2 x 12",
        photoKey: "incline-dumbbell-press-recovery",
      },
      { name: "Lateral raise", sets: "2 x 15", photoKey: "lateral-raise-recovery" },
      { name: "Rear delt fly", sets: "2 x 15", photoKey: "rear-delt-fly-recovery" },
      { name: "Hammer curl", sets: "2 x 15", photoKey: "hammer-curl-recovery" },
      {
        name: "Overhead tricep extension",
        sets: "2 x 15",
        photoKey: "overhead-tricep-extension-recovery",
      },
      { name: "Farmer carry", sets: "3 x 20-30 seconds", photoKey: "farmer-carry" },
      {
        name: "Hip mobility and stretching",
        sets: "5-10 minutes",
        photoKey: "hip-mobility-stretching",
      },
    ],
    notes: ["Use lighter weights."],
  },
];

const germanSchedule: TrainingDay[] = [
  {
    day: "Montag",
    focus: "Oberkoerper A",
    exercises: englishSchedule[0].exercises,
    notes: [
      "Chest-supported Row nutzt eine Schraegbank.",
      "Einige Oberkoerperuebungen nutzen in den ersten 2 Wochen 2 Saetze.",
      "Overhead Tricep Extension kann mit einem Stuhl besser funktionieren.",
    ],
  },
  {
    day: "Mittwoch",
    focus: "Unterkoerper + Core",
    exercises: englishSchedule[1].exercises,
    notes: [
      "Die Stuhltiefe dient als Ziel fuer die Kniebeuge.",
      "Hip Thrust kann mit Bankunterstuetzung gemacht werden, wenn es bequem ist.",
      "Bei Supported Split Squats einen Stuhl fuer Balance halten.",
      "Calf Raises koennen von Koerpergewicht zu Kurzhanteln und spaeter Stufe/Treppe gesteigert werden.",
    ],
  },
  {
    day: "Freitag",
    focus: "Oberkoerper B",
    exercises: englishSchedule[2].exercises,
    notes: [
      "Die PDF-Quelle notiert, dass Seated Dumbbell Shoulder Press eine schwierigere Option sein kann.",
      "Aktuelle Gewichtsnotizen existieren in der Quelle, aber die Row-Zuordnung muss vor Veroeffentlichung geprueft werden.",
    ],
  },
  {
    day: "Samstag",
    focus: "Recovery W5+",
    exercises: englishSchedule[3].exercises,
    notes: ["Leichtere Gewichte nutzen."],
  },
];

export const learnCopy = {
  en: {
    overview: {
      eyebrow: "Learn",
      title:
        "Practical notes from the journey, organized without pretending to be a course.",
      intro:
        "This area will collect the more structured parts of the project: food, training, and medical journey notes. The goal is to make the experience easier to understand without turning it into coaching, medical advice, or a guaranteed method.",
      sections: [
        {
          href: "/learn/food-and-diet",
          title: "Food & Diet",
          summary:
            "Personal diet structure, meal ideas, supplements, and what is being learned from the current routine.",
          startsWith: [
            "Current diet example around 1850 kcal, 190 g protein, 125 g carbs, and 55 g fat.",
            "Meal structure, simple foods, supplements, and product notes.",
            "Later, a tool can help build similar meal structures for selected nutrition targets.",
          ],
        },
        {
          href: "/learn/training",
          title: "Training",
          summary:
            "Training from a very high starting weight, with beginner-friendly notes that do not assume fitness experience.",
          startsWith: [
            "Current training situation and 3-4 sessions per week.",
            "Exercises that fit the real starting point, with photos later.",
            "Notes about confidence, gym anxiety, recovery, and equipment.",
          ],
        },
        {
          href: "/learn/medical-journey",
          title: "Medical Journey",
          summary:
            "Personal medical context, including GLP-1 history and other medical decisions, documented carefully.",
          startsWith: [
            "GLP-1 timeline from 203 kg on 16 November 2025 to 158 kg on 7 June 2026.",
            "Shot and weight logs as personal records, not dosing instructions.",
            "Doctor-discussion topics and personal reflections, not medical advice.",
          ],
        },
      ],
      boundariesTitle: "Boundaries",
      boundaries: [
        "Everything here starts from personal experience.",
        "No diet, training, supplement, medication, or OP content should be framed as a universal method.",
        "Medical decisions belong with qualified professionals.",
      ],
    },
    food: {
      eyebrow: "Food & Diet",
      title: "The current food structure behind the journey.",
      intro:
        "This page documents the current personal diet example. It is useful as context for the journey and later tools, but it should not be presented as a plan everyone should follow.",
      dailyTotals: [
        { label: "Calories", value: "1850 kcal" },
        { label: "Protein", value: "190 g" },
        { label: "Carbs", value: "125 g" },
        { label: "Fat", value: "55 g" },
      ],
      mealsTitle: "Meals",
      meals: [
        {
          name: "Meal 1",
          summary: "350 kcal | 33 g protein | 8 g carbs | 21 g fat",
          items: ["3 boiled medium eggs", "1 tomato, 83 g", "100 g koerniger Frischkaese"],
        },
        {
          name: "Shake",
          summary: "320 kcal | 44 g protein | 16.5 g carbs | 7 g fat",
          items: [
            "30 g whey",
            "10 g collagen + vitamin C + zinc",
            "330 ml lactose-free milk, 1.5%",
            "10 g creatine",
          ],
        },
        {
          name: "Meal 2 and Meal 3",
          summary: "2 meals, each around 530 kcal | 50 g protein | 46 g carbs | 10 g fat",
          items: [
            "Chicken breast",
            "Olive oil, mustard, tomato paste, and yogurt sauce",
            "Frozen vegetables, broccoli or Kaisergemuese, mushrooms",
            "Potato and bulgur",
          ],
        },
        {
          name: "Snack",
          summary: "125 kcal | 13 g protein | 7 g carbs | 5 g fat",
          items: ["Milbona Skyr Vanille", "Chia", "Almonds"],
        },
      ],
      supplementsTitle: "Supplements",
      supplementsIntro:
        "These belong under food and diet by default unless they are tied to labs, doctor guidance, medication interactions, or OP recovery.",
      supplements: [
        "D3 5000 IU + K2",
        "Omega-3, 1500 EPA / 750 DHA",
        "Multi-vitamin",
        "Electrolyte complex",
        "Magnesium citrate",
        "30 g whey protein",
        "10 g creatine monohydrate",
        "10 g collagen",
      ],
      boundariesTitle: "Boundaries",
      boundaries: [
        "This is one personal diet structure, not a universal diet plan.",
        "Supplements are listed as part of the current routine, not as recommendations.",
        "A future meal-structure tool should help with targets without claiming to prescribe a diet.",
      ],
    },
    training: {
      eyebrow: "Training",
      title: "A beginner routine built around the real starting point.",
      intro:
        "This page captures the clear workout structure from the OneNote PDF: walking progression, warm-up, weekly schedule, exercises, sets, and practical notes. It stays personal and avoids turning the routine into a universal program.",
      walkingTitle: "Walking Progression",
      walkingIntro: "Walking is planned on off days and increases over time.",
      walkingProgression: [
        { phase: "Weeks 01-08", target: "30 minutes on off days" },
        { phase: "Weeks 09-16", target: "40 minutes on off days" },
        { phase: "Weeks 17-24", target: "50 minutes on off days" },
      ],
      warmupTitle: "Warm-Up Protocol",
      warmupIntro:
        "The notes say to go slow and use the chair as a touch target, not a full sit.",
      warmup: [
        "March in place: 2 minutes",
        "Shoulder rolls: 10 reps",
        "Arm circles: 10 forward and 10 backward",
        "Hip circles: 10 each direction",
        "Bodyweight chair squats: 10 slow reps",
        "Cat-cow mobility: 8 reps",
      ],
      scheduleTitle: "Weekly Schedule, Weeks 1-12",
      exerciseLabel: "Exercises",
      notesLabel: "Notes",
      photoPlaceholder: "Photo later",
      schedule: englishSchedule,
      boundariesTitle: "Boundaries",
      boundaries: [
        "This is a personal routine, not a beginner program for everyone.",
        "Exercise photos can come later after the movements are reviewed.",
        "Exact current loads need verification from the original table before public use.",
      ],
    },
    medical: {
      eyebrow: "Medical Journey",
      title: "A personal GLP-1 log, documented carefully.",
      intro:
        "This page records the personal timeline provided for the journey. It is here for transparency and context, not as medication advice, dosing guidance, or a method for anyone else to copy.",
      summary: [
        { label: "Starting point", value: "203.0 kg", detail: "2025-11-16" },
        { label: "Latest logged point", value: "158.0 kg", detail: "2026-06-07" },
        { label: "Logged change", value: "-45.0 kg", detail: "Personal log" },
      ],
      entriesTitle: "Logged Entries",
      entriesIntro:
        "`MJ` is kept as the source log label. The table shows completed entries through 2026-06-07 only.",
      tableHeaders: ["MJ", "Date", "Weight", "Change"],
      loggedEntries,
      boundariesTitle: "Boundaries",
      boundaries: [
        "This is a personal log, not a GLP-1 recommendation.",
        "This page should not explain dosing decisions or tell anyone when to change medication.",
        "Medical decisions belong with qualified professionals.",
      ],
    },
  },
  de: {
    overview: {
      eyebrow: "Lernen",
      title:
        "Praktische Notizen aus der Reise, geordnet ohne so zu tun, als waere es ein Kurs.",
      intro:
        "Dieser Bereich sammelt die strukturierteren Teile des Projekts: Essen, Training und medizinische Reise. Das Ziel ist, die Erfahrung verstaendlicher zu machen, ohne daraus Coaching, medizinische Beratung oder eine garantierte Methode zu machen.",
      sections: [
        {
          href: "/learn/food-and-diet",
          title: "Essen & Ernaehrung",
          summary:
            "Persoenliche Ernaehrungsstruktur, Mahlzeitenideen, Supplements und was aus der aktuellen Routine gelernt wird.",
          startsWith: [
            "Aktuelles Ernaehrungsbeispiel mit etwa 1850 kcal, 190 g Protein, 125 g Carbs und 55 g Fett.",
            "Mahlzeitenstruktur, einfache Lebensmittel, Supplements und Produktnotizen.",
            "Spaeter kann ein Tool helfen, aehnliche Mahlzeitenstrukturen fuer bestimmte Naehrwerte zu bauen.",
          ],
        },
        {
          href: "/learn/training",
          title: "Training",
          summary:
            "Training aus einem sehr hohen Startgewicht heraus, mit anfaengerfreundlichen Notizen ohne Fitness-Erfahrung vorauszusetzen.",
          startsWith: [
            "Aktuelle Trainingssituation und 3-4 Einheiten pro Woche.",
            "Uebungen, die zum echten Startpunkt passen, mit Fotos spaeter.",
            "Notizen zu Sicherheit, Gym-Angst, Erholung und Equipment.",
          ],
        },
        {
          href: "/learn/medical-journey",
          title: "Medizinische Reise",
          summary:
            "Persoenlicher medizinischer Kontext, inklusive GLP-1 Historie und andere Entscheidungen, vorsichtig dokumentiert.",
          startsWith: [
            "GLP-1 Timeline von 203 kg am 16. November 2025 bis 158 kg am 7. Juni 2026.",
            "Shot- und Gewichtslogs als persoenliche Aufzeichnungen, nicht als Dosierungsanleitung.",
            "Themen fuer Aerztegespraeche und persoenliche Reflexionen, keine medizinische Beratung.",
          ],
        },
      ],
      boundariesTitle: "Grenzen",
      boundaries: [
        "Alles hier startet bei persoenlicher Erfahrung.",
        "Keine Diaet, kein Training, kein Supplement, keine Medikamente und keine OP-Themen sollen als universelle Methode dargestellt werden.",
        "Medizinische Entscheidungen gehoeren zu qualifizierten Fachpersonen.",
      ],
    },
    food: {
      eyebrow: "Essen & Ernaehrung",
      title: "Die aktuelle Ernaehrungsstruktur hinter der Reise.",
      intro:
        "Diese Seite dokumentiert das aktuelle persoenliche Ernaehrungsbeispiel. Es ist als Kontext fuer die Reise und spaetere Tools hilfreich, sollte aber nicht als Plan dargestellt werden, dem jeder folgen soll.",
      dailyTotals: [
        { label: "Kalorien", value: "1850 kcal" },
        { label: "Protein", value: "190 g" },
        { label: "Carbs", value: "125 g" },
        { label: "Fett", value: "55 g" },
      ],
      mealsTitle: "Mahlzeiten",
      meals: [
        {
          name: "Mahlzeit 1",
          summary: "350 kcal | 33 g Protein | 8 g Carbs | 21 g Fett",
          items: ["3 gekochte Eier, mittel", "1 Tomate, 83 g", "100 g koerniger Frischkaese"],
        },
        {
          name: "Shake",
          summary: "320 kcal | 44 g Protein | 16.5 g Carbs | 7 g Fett",
          items: [
            "30 g Whey",
            "10 g Collagen + Vitamin C + Zink",
            "330 ml laktosefreie Milch, 1.5%",
            "10 g Creatin",
          ],
        },
        {
          name: "Mahlzeit 2 und Mahlzeit 3",
          summary:
            "2 Mahlzeiten, jeweils etwa 530 kcal | 50 g Protein | 46 g Carbs | 10 g Fett",
          items: [
            "Haehnchenbrust",
            "Olivenoel, Senf, Tomatenmark und Joghurt-Sauce",
            "TK-Gemuese, Brokkoli oder Kaisergemuese, Champignons",
            "Kartoffel und Bulgur",
          ],
        },
        {
          name: "Snack",
          summary: "125 kcal | 13 g Protein | 7 g Carbs | 5 g Fett",
          items: ["Milbona Skyr Vanille", "Chia", "Mandeln"],
        },
      ],
      supplementsTitle: "Supplements",
      supplementsIntro:
        "Diese gehoeren standardmaessig zu Essen und Ernaehrung, ausser sie haengen mit Laborwerten, aerztlicher Begleitung, Medikamenten-Interaktionen oder OP-Erholung zusammen.",
      supplements: [
        "D3 5000 IU + K2",
        "Omega-3, 1500 EPA / 750 DHA",
        "Multi-Vitamin",
        "Elektrolyt-Komplex",
        "Magnesium Citrate",
        "30 g Whey Protein",
        "10 g Creatine Monohydrate",
        "10 g Collagen",
      ],
      boundariesTitle: "Grenzen",
      boundaries: [
        "Das ist eine persoenliche Ernaehrungsstruktur, kein universeller Diaetplan.",
        "Supplements werden als Teil der aktuellen Routine gelistet, nicht als Empfehlung.",
        "Ein spaeteres Mahlzeitenstruktur-Tool soll bei Zielwerten helfen, ohne eine Diaet vorzuschreiben.",
      ],
    },
    training: {
      eyebrow: "Training",
      title: "Eine Anfaengerroutine, gebaut um den echten Startpunkt.",
      intro:
        "Diese Seite sammelt die klare Trainingsstruktur aus der OneNote-PDF: Geh-Progression, Warm-up, Wochenplan, Uebungen, Saetze und praktische Notizen. Sie bleibt persoenlich und macht daraus kein universelles Programm.",
      walkingTitle: "Geh-Progression",
      walkingIntro: "Gehen ist fuer freie Tage geplant und steigert sich mit der Zeit.",
      walkingProgression: [
        { phase: "Wochen 01-08", target: "30 Minuten an freien Tagen" },
        { phase: "Wochen 09-16", target: "40 Minuten an freien Tagen" },
        { phase: "Wochen 17-24", target: "50 Minuten an freien Tagen" },
      ],
      warmupTitle: "Warm-up Protokoll",
      warmupIntro:
        "Die Notizen sagen: langsam arbeiten und den Stuhl als Beruehrungspunkt nutzen, nicht als volles Hinsetzen.",
      warmup: [
        "Auf der Stelle marschieren: 2 Minuten",
        "Schulterkreisen: 10 Wiederholungen",
        "Armkreisen: 10 vorwaerts und 10 rueckwaerts",
        "Hueftkreisen: 10 pro Richtung",
        "Bodyweight Chair Squats: 10 langsame Wiederholungen",
        "Cat-Cow Mobilitaet: 8 Wiederholungen",
      ],
      scheduleTitle: "Wochenplan, Wochen 1-12",
      exerciseLabel: "Uebungen",
      notesLabel: "Notizen",
      photoPlaceholder: "Foto spaeter",
      schedule: germanSchedule,
      boundariesTitle: "Grenzen",
      boundaries: [
        "Das ist eine persoenliche Routine, kein Anfaengerprogramm fuer alle.",
        "Uebungsfotos koennen spaeter kommen, nachdem die Bewegungen geprueft wurden.",
        "Exakte aktuelle Gewichte muessen vor oeffentlicher Nutzung aus der Originaltabelle verifiziert werden.",
      ],
    },
    medical: {
      eyebrow: "Medizinische Reise",
      title: "Ein persoenlicher GLP-1 Log, vorsichtig dokumentiert.",
      intro:
        "Diese Seite haelt die bereitgestellte persoenliche Timeline fest. Sie ist fuer Transparenz und Kontext da, nicht als Medikamentenberatung, Dosierungsanleitung oder Methode zum Kopieren.",
      summary: [
        { label: "Startpunkt", value: "203.0 kg", detail: "2025-11-16" },
        { label: "Letzter eingetragener Stand", value: "158.0 kg", detail: "2026-06-07" },
        { label: "Eingetragene Veraenderung", value: "-45.0 kg", detail: "Persoenlicher Log" },
      ],
      entriesTitle: "Eingetragene Werte",
      entriesIntro:
        "`MJ` bleibt als Quell-Label erhalten. Die Tabelle zeigt nur abgeschlossene Eintraege bis 2026-06-07.",
      tableHeaders: ["MJ", "Datum", "Gewicht", "Veraenderung"],
      loggedEntries,
      boundariesTitle: "Grenzen",
      boundaries: [
        "Das ist ein persoenlicher Log, keine GLP-1 Empfehlung.",
        "Diese Seite soll keine Dosierungsentscheidungen erklaeren und niemandem sagen, wann Medikamente geaendert werden sollen.",
        "Medizinische Entscheidungen gehoeren zu qualifizierten Fachpersonen.",
      ],
    },
  },
} satisfies Record<Locale, unknown>;
