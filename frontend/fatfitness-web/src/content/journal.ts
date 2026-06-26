import type { Locale } from "@/content/site";

type Exercise = {
  name: string;
  sets: string;
  photoKey: string;
  photoSrc?: string;
};

type WarmupItem = {
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
  ["10", "2026-06-07", "158.5 kg", "-2.0 kg"],
  ["10", "2026-06-14", "158.0 kg", "-0.5 kg"],
  ["10", "2026-06-21", "157.0 kg", "-1.0 kg"],
] as const;

const warmupItems: WarmupItem[] = [
  { name: "March in place", sets: "2 minutes", photoKey: "warmup-march-in-place", photoSrc: "" },
  { name: "Shoulder rolls", sets: "10 forward and 10 back", photoKey: "warmup-shoulder-rolls", photoSrc: "" },
  { name: "Arm circles", sets: "10 forward and 10 back", photoKey: "warmup-arm-circles", photoSrc: "" },
  { name: "Hip circles", sets: "10 each direction", photoKey: "warmup-hip-circles", photoSrc: "" },
  { name: "Bodyweight chair squats", sets: "10 slow reps", photoKey: "warmup-chair-squats", photoSrc: "" },
  { name: "Cat-cow mobility", sets: "20 reps", photoKey: "warmup-cat-cow", photoSrc: "" },
];

const englishSchedule: TrainingDay[] = [
  {
    day: "Monday",
    focus: "Upper A",
    exercises: [
      {
        name: "Incline dumbbell press, 30-45 degrees",
        sets: "3 x 8-10",
        photoKey: "incline-dumbbell-press",
        photoSrc: ""
      },
      {
        name: "Chest-supported dumbbell row",
        sets: "3 x 10",
        photoKey: "chest-supported-dumbbell-row",
        photoSrc: ""
      },
      {
        name: "Seated dumbbell shoulder press",
        sets: "3 x 10",
        photoKey: "seated-dumbbell-shoulder-press",
        photoSrc: ""
      },
      {
        name: "Dumbbell lateral raise",
        sets: "3 x 12-15",
        photoKey: "dumbbell-lateral-raise",
        photoSrc: ""
      },
      {
        name: "Dumbbell curl",
        sets: "3 x 12",
        photoKey: "dumbbell-curl",
        photoSrc: ""
      },
      {
        name: "Overhead dumbbell tricep extension",
        sets: "3 x 12",
        photoKey: "overhead-dumbbell-tricep-extension",
        photoSrc: ""
      },
    ],
    notes: [
      "• Chest-supported row: cheast fat gets in the way — deal with it.",
      "• Shoulder press, lateral raise, curl, and overhead tricep extension: 2 sets are enough for the first 2 weeks.",
      "• Overhead tricep extension: use a chair or a flat bench — an upright bench can cause the dumbbell to scratch it, and the range of motion is easier when the back is supported flat.",

    ],
  },
  {
    day: "Wednesday",
    focus: "Lower + Core",
    exercises: [
      {
        name: "Chair squat",
        sets: "3 x 8",
        photoKey: "chair-squat",
        photoSrc: ""
      },
      {
        name: "Romanian deadlift",
        sets: "3 x 10",
        photoKey: "romanian-deadlift",
        photoSrc: ""
      },
      {
        name: "Hip thrust",
        sets: "3 x 10-12",
        photoKey: "hip-thrust",
        photoSrc: ""
      },
      {
        name: "Lateral step-out squat",
        sets: "2 x 12-15 each side",
        photoKey: "lateral-step-out-squat",
        photoSrc: ""
      },
      {
        name: "Standing calf raise",
        sets: "3 x 15",
        photoKey: "standing-calf-raise",
        photoSrc: ""
      },
      {
        name: "Seated core brace",
        sets: "5 x 15 seconds",
        photoKey: "seated-core-brace",
        photoSrc: ""
      },
    ],
    notes: [
      "• Chair squat: use the chair as a touch target for depth, not a full sit.",
      "• Hip thrust: spread arms along the bench and lightly touch it as your start position — as you drive your hips up, your upper back rests on the bench to support your weight.",
      "• Standing calf raise: start with bodyweight, then progress to dumbbells or step/stair variations.",
      "• Seated core brace: start by just holding the seated position, then progress by lifting your legs.",
    ],
  },
  {
    day: "Friday",
    focus: "Upper B",
    exercises: [
      { name: "Flat dumbbell press", sets: "3 x 8-10", photoKey: "flat-dumbbell-press", photoSrc: "" },
      { name: "One-arm dumbbell row", sets: "3 x 10 each side", photoKey: "one-arm-dumbbell-row", photoSrc: "" },
      { name: "Arnold press", sets: "3 x 10", photoKey: "arnold-press", photoSrc: "" },
      { name: "Rear delt fly", sets: "3 x 12-15", photoKey: "rear-delt-fly", photoSrc: "" },
      { name: "Hammer curl", sets: "3 x 12", photoKey: "hammer-curl", photoSrc: "" },
      { name: "Skull crusher", sets: "3 x 12", photoKey: "skull-crusher", photoSrc: "" },
    ],
    notes: [
      "• Shoulder press, rear delt fly, hammer curl, and skull crusher: 2 sets are enough for the first 2 weeks.",
      "• Rest well between shoulder press and rear delt fly — shoulders tire quickly and are generally not a strong muscle group at a higher weight. Keep the load light on both.",
      "• Skull crusher: stay focused and control the path of the dumbbell throughout — if the bar is long, the risk of hitting your head is real.",
    ],
  },
  {
    day: "Saturday",
    focus: "Recovery W5+",
    exercises: [
      { name: "Chest-supported row", sets: "2 x 12", photoKey: "chest-supported-row", photoSrc: "" },
      {
        name: "Incline dumbbell press",
        sets: "2 x 12",
        photoKey: "incline-dumbbell-press-recovery",
        photoSrc: ""
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
    notes: [
      "• This is not a hard training day — the goal is blood flow, technique practice, recovery, mobility, and some extra upper-body hypertrophy.",
      "• Overhead tricep extension can be done standing on this day.",
      "• Finish with 5–10 minutes of hip mobility and stretching after the workout.",
    ],
  },
];

const germanSchedule: TrainingDay[] = [
  {
    day: "Montag",
    focus: "Oberkörper A",
    exercises: englishSchedule[0].exercises,
    notes: [
      "• Chest-supported Row: Brustfett kann im Weg sein — damit umgehen.",
      "• Schulterdrücken, Seitheben, Curl und Overhead Tricep Extension: In den ersten 2 Wochen reichen 2 Sätze.",
      "• Overhead Tricep Extension: Stuhl oder flache Bank verwenden — aufrechte Position kann dazu führen, dass die Hantel die Bank kratzt, und der Bewegungsradius ist flach angenehmer.",

    ],
  },
  {
    day: "Mittwoch",
    focus: "Unterkörper + Core",
    exercises: englishSchedule[1].exercises,
    notes: [
      "• Chair Squat: Den Stuhl als Berührungspunkt für die Tiefe nutzen, nicht als volles Hinsetzen.",
      "• Hip Thrust: Arme auf der Bank ausstrecken und die Bank leicht berühren als Startposition — beim Hochdrücken der Hüfte liegt der obere Rücken zur Unterstützung auf der Bank.",
      "• Standing Calf Raise: Mit Körpergewicht beginnen, dann zu Kurzhanteln oder Stufen-/Treppenvarianten steigern.",
      "• Seated Core Brace: Zunächst nur die sitzende Position halten, dann mit Beinheben steigern.",
    ],
  },
  {
    day: "Freitag",
    focus: "Oberkörper B",
    exercises: englishSchedule[2].exercises,
    notes: [
      "• Schulterdrücken, Rear Delt Fly, Hammer Curl und Skull Crusher: In den ersten 2 Wochen reichen 2 Sätze.",
      "• Zwischen Schulterdrücken und Rear Delt Fly gut erholen — Schultern ermüden schnell und sind bei höherem Körpergewicht oft keine starke Muskelgruppe. Leichte Gewichte bei beiden wählen.",
      "• Skull Crusher: die Hantel bewusst kontrollieren und die Bahn im Blick behalten — bei einer langen Stange besteht echtes Risiko, den Kopf zu treffen.",
    ],
  },
  {
    day: "Samstag",
    focus: "Recovery W5+",
    exercises: englishSchedule[3].exercises,
    notes: [
      "• Kein harter Trainingstag — das Ziel ist Durchblutung, Technikübung, Erholung, Mobilität und etwas zusätzliche Oberkörperhypertrophie.",
      "• Overhead Tricep Extension kann an diesem Tag im Stehen ausgeführt werden.",
      "• Nach dem Training 5–10 Minuten Hip Mobility und Stretching.",
    ],
  },
];

export const learnCopy = {
  en: {
    overview: {
      eyebrow: "Journal",
      title:
        "Practical notes from the journey, organized without pretending to be a course.",
      intro:
        "Personal notes from the journey — food, training, and medical context, documented honestly. Not coaching, not medical advice, and not a guaranteed method for anyone else.",
      weightTitle: "Weight Progress",
      sections: [
        {
          href: "/journal/food-and-diet",
          title: "Food & Diet",
          summary:
            "Personal diet structure, meal ideas, supplements, and what is being learned from the current routine.",
          startsWith: [
            "Current diet example around 1790 kcal, 173 g protein, 132 g carbs, and 47 g fat.",
            "Meal structure, simple foods, supplements, and product notes.",
            "Later, a tool can help build similar meal structures for selected nutrition targets.",
          ],
        },
        {
          href: "/journal/training",
          title: "Training",
          summary:
            "Training from a very high starting weight, with beginner-friendly notes that do not assume fitness experience.",
          startsWith: [
            "Current training situation and 3-4 sessions per week.",
            "Exercises that fit the real starting point.",
            "Notes about confidence, gym, recovery, and equipment.",
          ],
        },
        {
          href: "/journal/medical-journey",
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
    },
    food: {
      eyebrow: "Food & Diet",
      title: "The current food structure behind the journey.",
      intro:
        "This page documents the current personal diet , it is not a plan everyone should follow.",
      dailyTotals: [
        { label: "Calories", value: "1790 kcal" },
        { label: "Protein", value: "173 g" },
        { label: "Carbs", value: "132 g" },
        { label: "Fat", value: "47 g" },
      ],
      mealsTitle: "Meals",
      meals: [
        {
          name: "Shake",
          summary: "320 kcal | 44 g protein | 16.5 g carbs | 7 g fat",
          items: [
            { label: "30 g whey", detail: "120 kcal | 22.8 g protein | 1.5 g carbs | 2 g fat" },
            { label: "10 g collagen + vitamin C + zinc", detail: "40 kcal | 10 g protein | 0 g carbs | 0 g fat" },
            { label: "330 ml lactose-free milk, 1.5 %", detail: "152 kcal | 11.2 g protein | 15 g carbs | 5 g fat" },
            { label: "10 g creatine", detail: "0 kcal" },
          ],
        },
        {
          name: "Meal 1",
          summary: "350 kcal | 33 g protein | 8 g carbs | 21 g fat",
          items: [
            { label: "3 eggs M, boiled", detail: "234 kcal | 21 g protein | 1.5 g carbs | 16.2 g fat" },
            { label: "1 tomato, 83 g", detail: "17 kcal | 0.7 g protein | 3.2 g carbs | 0.2 g fat" },
            { label: "Körniger Frischkäse, 100 g", detail: "98 kcal | 11.5 g protein | 2.8 g carbs | 4.5 g fat" },
          ],
        },
        {
          name: "Meal 2 and Meal 3",
          summary: "2 meals, each around 560 kcal | 48 g protein | 54 g carbs | 9.5 g fat",
          items: [
            { label: "333 g chicken breast", detail: "403 kcal | 77.5 g protein | 0 g carbs | 5 g fat" },
            { label: "Sauce: olive oil, mustard, tomato paste, 3.5 % yogurt", detail: "116 kcal | 1.4 g protein | 3.2 g carbs | 7.75 g fat" },
            { label: "250 g frozen vegetables, Italian style", detail: "125 kcal | 4 g protein | 7.25 g carbs | 4.75 g fat" },
            { label: "160 g broccoli / Kaisergemüse", detail: "66 kcal | 4 g protein | 8 g carbs | 0.7 g fat" },
            { label: "150 g potato", detail: "116 kcal | 3 g protein | 25 g carbs | 0.2 g fat" },
            { label: "80 g rice", detail: "290 kcal | 6 g protein | 64 g carbs | 0.5 g fat" },
          ],
        },
      ],
      weeklyNote:
        "This meal structure runs 6 days a week. On the seventh day, eating out — usually grilled meat, döner, or shawarma. No fried food, pasta, or pizza.",
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
    },
    training: {
      eyebrow: "Training",
      title: "A beginner routine built around a real starting point 160kg.",
      intro:
        "A gym would be the ideal setup, but that is not an option right now. Instead: two dumbbells, a bench, and a plan built with AI. Training only started after losing enough weight to feel comfortable moving — not to get fit from scratch, but to protect existing muscle and build some to support the rest of the journey. Walking, warm-up, weekly schedule, and exercises logged here as a personal record, not a plan for anyone else to follow.",
      walkingTitle: "Walking Progression",
      walkingIntro: "• Walking is planned on off days and increases over time.\n• It is recovery work, not punishment cardio.",
      walkingProgression: [
        { phase: "Weeks 01-08", target: "30 minutes on off days" },
        { phase: "Weeks 09-16", target: "40 minutes on off days" },
        { phase: "Weeks 17-24", target: "50 minutes on off days" },
      ],
      warmupTitle: "Warm-Up Protocol",
      warmupIntro:
        "• Around 5 to 8 minutes total.\n• March in place slowly — fill the 2 minutes, don't rush them.\n• Bodyweight chair squats: use the chair as a touch target only, not a full sit.\n• Cat-cow mobility looks odd but is genuinely good for the back.\n• Session duration: maximum 60 minutes including warm-up.",
      warmup: warmupItems,
      scheduleTitle: "Weekly Schedule, Weeks 1-12",
      exerciseLabel: "Exercises",
      notesLabel: "Notes",
      photoPlaceholder: "Photo later",
      schedule: englishSchedule,
    },
    medical: {
      eyebrow: "Medical Journey",
      title: "A personal GLP-1 log.",
      intro:
        "A personal Mounjaro log, shared for transparency. Not medication advice, a dosing guide, or a method for anyone else to follow — medical decisions belong with a qualified professional.",
      summary: [
        { label: "Starting point", value: "203.0 kg", detail: "2025-11-16" },
        { label: "Latest logged point", value: "157.0 kg", detail: "2026-06-21" },
        { label: "Logged change", value: "-46.0 kg", detail: "Personal log" },
      ],
      entriesTitle: "Logged Entries",
      tableHeaders: ["Dose (mg)", "Date", "Weight", "Change"],
      loggedEntries,
    },
  },
  de: {
    overview: {
      eyebrow: "Journal",
      title:
        "Praktische Notizen aus der Reise, geordnet ohne so zu tun, als wäre es ein Kurs.",
      intro:
        "Persönliche Notizen aus der Reise — Essen, Training und medizinischer Kontext, ehrlich dokumentiert. Kein Coaching, keine medizinische Beratung und keine garantierte Methode für andere.",
      weightTitle: "Gewichtsverlauf",
      sections: [
        {
          href: "/journal/food-and-diet",
          title: "Essen & Ernährung",
          summary:
            "Persönliche Ernährungsstruktur, Mahlzeitenideen, Supplements und was aus der aktuellen Routine gelernt wird.",
          startsWith: [
            "Aktuelles Ernährungsbeispiel mit etwa 1790 kcal, 173 g Eiweiß, 132 g Kohlenhydrate und 47 g Fett.",
            "Mahlzeitenstruktur, einfache Lebensmittel, Supplements und Produktnotizen.",
            "Später kann ein Tool helfen, ähnliche Mahlzeitenstrukturen für bestimmte Nährwerte zu bauen.",
          ],
        },
        {
          href: "/journal/training",
          title: "Training",
          summary:
            "Training aus einem sehr hohen Startgewicht heraus, mit anfängerfreundlichen Notizen ohne Fitness-Erfahrung vorauszusetzen.",
          startsWith: [
            "Aktuelle Trainingssituation und 3-4 Einheiten pro Woche.",
            "Übungen, die zum echten Startpunkt passen.",
            "Notizen zu Sicherheit, Gym, Erholung und Equipment.",
          ],
        },
        {
          href: "/journal/medical-journey",
          title: "Medizinische Reise",
          summary:
            "Persönlicher medizinischer Kontext, inklusive GLP-1 Historie und andere Entscheidungen, vorsichtig dokumentiert.",
          startsWith: [
            "GLP-1 Timeline von 203 kg am 16. November 2025 bis 158 kg am 7. Juni 2026.",
            "Shot- und Gewichtslogs als persönliche Aufzeichnungen, nicht als Dosierungsanleitung.",
            "Themen für Ärztegespräche und persönliche Reflexionen, keine medizinische Beratung.",
          ],
        },
      ],
    },
    food: {
      eyebrow: "Essen & Ernährung",
      title: "Die aktuelle Ernährungsstruktur hinter der Reise.",
      intro:
        "Diese Seite zeigt ein persönliches Ernährungsbeispiel und ist kein Plan, den alle befolgen sollten.",
      dailyTotals: [
        { label: "Kalorien", value: "1790 kcal" },
        { label: "Eiweiß", value: "173 g" },
        { label: "Kohlenhydrate", value: "132 g" },
        { label: "Fett", value: "47 g" },
      ],
      mealsTitle: "Mahlzeiten",
      meals: [
        {
          name: "Shake",
          summary: "320 kcal | 44 g Eiweiß | 16,5 g Kohlenhydrate | 7 g Fett",
          items: [
            { label: "30 g Whey", detail: "120 kcal | 22,8 g Eiweiß | 1,5 g Kohlenhydrate | 2 g Fett" },
            { label: "10 g Collagen + Vitamin C + Zink", detail: "40 kcal | 10 g Eiweiß | 0 g Kohlenhydrate | 0 g Fett" },
            { label: "330 ml laktosefreie Milch, 1,5 %", detail: "152 kcal | 11,2 g Eiweiß | 15 g Kohlenhydrate | 5 g Fett" },
            { label: "10 g Creatin", detail: "0 kcal" },
          ],
        },
        {
          name: "Mahlzeit 1",
          summary: "350 kcal | 33 g Eiweiß | 8 g Kohlenhydrate | 21 g Fett",
          items: [
            { label: "3 Eier M, gekocht", detail: "234 kcal | 21 g Eiweiß | 1,5 g Kohlenhydrate | 16,2 g Fett" },
            { label: "1 Tomate, 83 g", detail: "17 kcal | 0,7 g Eiweiß | 3,2 g Kohlenhydrate | 0,2 g Fett" },
            { label: "Körniger Frischkäse, 100 g", detail: "98 kcal | 11,5 g Eiweiß | 2,8 g Kohlenhydrate | 4,5 g Fett" },
          ],
        },
        {
          name: "Mahlzeit 2 und Mahlzeit 3",
          summary: "2 Mahlzeiten, jeweils etwa 560 kcal | 48 g Eiweiß | 54 g Kohlenhydrate | 9,5 g Fett",
          items: [
            { label: "333 g Hähnchenbrust", detail: "403 kcal | 77,5 g Eiweiß | 0 g Kohlenhydrate | 5 g Fett" },
            { label: "Sauce: Olivenöl, Senf, Tomatenmark, Joghurt 3,5 %", detail: "116 kcal | 1,4 g Eiweiß | 3,2 g Kohlenhydrate | 7,75 g Fett" },
            { label: "250 g TK-Gemüse, Italienische Art", detail: "125 kcal | 4 g Eiweiß | 7,25 g Kohlenhydrate | 4,75 g Fett" },
            { label: "160 g Brokkoli / Kaisergemüse", detail: "66 kcal | 4 g Eiweiß | 8 g Kohlenhydrate | 0,7 g Fett" },
            { label: "150 g Kartoffel", detail: "116 kcal | 3 g Eiweiß | 25 g Kohlenhydrate | 0,2 g Fett" },
            { label: "80 g Reis", detail: "290 kcal | 6 g Eiweiß | 64 g Kohlenhydrate | 0,5 g Fett" },
          ],
        },
      ],
      weeklyNote:
        "Diese Mahlzeitenstruktur gilt für 6 Tage pro Woche. Am siebten Tag gibt es Restaurantbesuch — meistens Gegrilltes, Döner oder Shawarma. Kein Frittiertes, keine Nudeln, keine Pizza.",
      supplementsTitle: "Supplements",
      supplementsIntro:
        "Diese gehören standardmäßig zu Essen und Ernährung, außer sie hängen mit Laborwerten, ärztlicher Begleitung, Medikamenten-Interaktionen oder OP-Erholung zusammen.",
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
    },
    training: {
      eyebrow: "Training",
      title: "Eine Anfängerroutine, gebaut um einen echten Startpunkt 160kg.",
      intro:
        "Ein Fitnessstudio wäre ideal, ist aber momentan keine Option. Stattdessen: zwei Kurzhanteln, eine Bank und ein mit KI entwickelter Plan. Mit dem Training wurde erst begonnen, nachdem genug Gewicht verloren war, um sich dabei wohlzufühlen — nicht um von null fit zu werden, sondern um vorhandene Muskeln zu erhalten und neue aufzubauen, die die Reise unterstützen. Geh-Progression, Warm-up, Wochenplan und Übungen hier als persönliche Aufzeichnung, kein Plan zum Nachahmen.",
      walkingTitle: "Lauf-Progression",
      walkingIntro: "• Laufen ist für freie Tage geplant und steigert sich mit der Zeit.\n• Es ist eine Erholungsarbeit, kein Strafkardio.",
      walkingProgression: [
        { phase: "Wochen 01-08", target: "30 Minuten an freien Tagen" },
        { phase: "Wochen 09-16", target: "40 Minuten an freien Tagen" },
        { phase: "Wochen 17-24", target: "50 Minuten an freien Tagen" },
      ],
      warmupTitle: "Warm-up Protokoll",
      warmupIntro:
        "• Etwa 5 bis 8 Minuten insgesamt.\n• Auf der Stelle langsam marschieren — die 2 Minuten ausfüllen, nicht überspringen.\n• Bodyweight Chair Squats: den Stuhl nur als Berührungspunkt nutzen, nicht als volles Hinsetzen.\n• Cat-Cow Mobilität sieht merkwürdig aus, ist aber wirklich gut für den Rücken.\n• Trainingszeit: maximal 60 Minuten inklusive Warm-up."
,
      warmup: warmupItems,
      scheduleTitle: "Wochenplan, Wochen 1-12",
      exerciseLabel: "Übungen",
      notesLabel: "Notizen",
      photoPlaceholder: "Foto später",
      schedule: germanSchedule,
    },
    medical: {
      eyebrow: "Medizinische Reise",
      title: "Ein persönlicher GLP-1 Log.",
      intro:
        "Ein persönlicher Mounjaro Log, für Transparenz geteilt. Keine Medikamentenberatung, keine Dosierungsanleitung und keine Methode für andere — medizinische Entscheidungen gehören zu qualifizierten Fachpersonen.",
      summary: [
        { label: "Startpunkt", value: "203.0 kg", detail: "2025-11-16" },
        { label: "Letzter eingetragener Stand", value: "157.0 kg", detail: "2026-06-21" },
        { label: "Eingetragene Veränderung", value: "-46.0 kg", detail: "Persönlicher Log" },
      ],
      entriesTitle: "Eingetragene Werte",
      tableHeaders: ["Dosis (mg)", "Datum", "Gewicht", "Veränderung"],
      loggedEntries,
    },
  },
} satisfies Record<Locale, unknown>;
