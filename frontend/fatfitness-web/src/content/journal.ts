import type { Locale } from "@/content/site";
import { getWeightLogTable, getWeightSummary } from "@/lib/weightLog";
import { formatDateShort } from "@/lib/date";

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

const loggedEntries = getWeightLogTable();
const enWeightSummary = getWeightSummary("en");
const deWeightSummary = getWeightSummary("de");

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
            "Current diet example around 1810 kcal, 187 g protein, 128 g carbs, and 50 g fat.",
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
            `GLP-1 timeline from ${enWeightSummary.startWeight} on ${enWeightSummary.startDateFormatted} to ${enWeightSummary.latestWeight} on ${enWeightSummary.latestDateFormatted}.`,
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
        { label: "Calories", value: "1810 kcal" },
        { label: "Protein", value: "187 g" },
        { label: "Carbs", value: "128 g" },
        { label: "Fat", value: "50 g" },
        { label: "Fiber", value: "29.4 g" },
      ],
      mealsTitle: "Meals",
      meals: [
        {
          name: "Shake",
          summary: "312 kcal | 44 g protein | 16.5 g carbs | 7 g fat | 0 g fiber",
          items: [
            { label: "30 g whey", detail: "120 kcal | 22.8 g protein | 1.5 g carbs | 2 g fat" },
            { label: "10 g creatine + 10 g collagen", detail: "40 kcal | 10 g protein | 0 g carbs | 0 g fat" },
            { label: "330 ml lactose-free milk, 1.5 %", detail: "152 kcal | 11.2 g protein | 15 g carbs | 5 g fat" },
          ],
        },
        {
          name: "Meal 1",
          summary: "305 kcal | 29 g protein | 7 g carbs | 18 g fat | 1 g fiber",
          items: [
            { label: "3 eggs M, boiled", detail: "190 kcal | 17 g protein | 1 g carbs | 13 g fat" },
            { label: "1 tomato, 83 g", detail: "17 kcal | 0.7 g protein | 3.2 g carbs | 0.2 g fat" },
            { label: "Körniger Frischkäse, 100 g", detail: "98 kcal | 11.5 g protein | 2.8 g carbs | 4.5 g fat" },
          ],
        },
        {
          name: "Meal 2",
          summary: "595 kcal | 56.8 g protein | 52.3 g carbs | 12.6 g fat | 14.2 g fiber",
          items: [
            { label: "200 g chicken breast", detail: "240 kcal | 45 g protein | 0 g carbs | 5.2 g fat" },
            { label: "Sauce: mustard, tomato paste, 3.5 % yogurt", detail: "58 kcal | 0.7 g protein | 1.6 g carbs | 3.9 g fat" },
            { label: "125 g frozen vegetables, Italian style", detail: "62.5 kcal | 2 g protein | 3.6 g carbs | 2.4 g fat" },
            { label: "80 g broccoli / Kaisergemüse", detail: "33 kcal | 2 g protein | 4 g carbs | 0.35 g fat" },
            { label: "75 g potato", detail: "58 kcal | 1.5 g protein | 12.5 g carbs | 0.1 g fat" },
            { label: "38 g mushrooms", detail: "6.8 kcal | 0.75 g protein | 0.6 g carbs | 0.1 g fat" },
            { label: "40 g burgul", detail: "137 kcal | 4.9 g protein | 30 g carbs | 0.5 g fat" },
          ],
        },
        {
          name: "Meal 3",
          summary: "595 kcal | 56.8 g protein | 52.3 g carbs | 12.6 g fat | 14.2 g fiber",
          items: [
            { label: "200 g chicken breast", detail: "240 kcal | 45 g protein | 0 g carbs | 5.2 g fat" },
            { label: "Sauce: mustard, tomato paste, 3.5 % yogurt", detail: "58 kcal | 0.7 g protein | 1.6 g carbs | 3.9 g fat" },
            { label: "125 g frozen vegetables, Italian style", detail: "62.5 kcal | 2 g protein | 3.6 g carbs | 2.4 g fat" },
            { label: "80 g broccoli / Kaisergemüse", detail: "33 kcal | 2 g protein | 4 g carbs | 0.35 g fat" },
            { label: "75 g potato", detail: "58 kcal | 1.5 g protein | 12.5 g carbs | 0.1 g fat" },
            { label: "38 g mushrooms", detail: "6.8 kcal | 0.75 g protein | 0.6 g carbs | 0.1 g fat" },
            { label: "40 g burgul", detail: "137 kcal | 4.9 g protein | 30 g carbs | 0.5 g fat" },
          ],
        },
      ],
      weeklyNote:
        "This meal structure runs 6 days a week. On the seventh day, eating out — usually grilled meat, döner, or shawarma. No fried food, pasta, or pizza.",
      supplementsTitle: "Supplements",
      supplementsIntro:
        "These belong under food and diet by default unless they are tied to labs, doctor guidance, medication interactions, or OP recovery.",
      supplements: [
        {
          key: "d3-k2",
          name: "Vitamin D3 5000 IU + K2",
          brand: "vit4ever",
          photoSrc: "/photos/supplements/d3-k2.png",
          detail:
            "Vitamin D3 deficiency is extremely common in Germany — limited sunlight for most of the year means most people do not produce enough naturally. D3 supports immunity, bone density, mood, and hormone regulation. K2 (ideally MK-7 form) is the essential partner: it activates proteins that direct calcium into bones and teeth rather than soft tissues and arteries. Without K2, high-dose D3 can accelerate calcification risks. The 5000 IU dose is a common starting point, but blood work is the only reliable way to know what your body actually needs. Get your 25(OH)D level checked and let a doctor recommend your dose.",
          facts: [
            "Take with a fatty meal — D3 is fat-soluble and absorption improves significantly.",
            "K2 MK-7 form is more bioavailable and longer-acting than MK-4.",
            "Blood test (25(OH)D level) recommended before taking high doses.",
            "Deficiency is widespread in Germany, especially through the winter months.",
          ],
        },
        {
          key: "omega3",
          name: "Omega-3, 1500 EPA / 750 DHA",
          brand: "IRON BROTHERS",
          photoSrc: "/photos/supplements/omega3.png",
          detail:
            "Two things determine whether an Omega-3 supplement is worth taking: the molecular form and the EPA/DHA values. The triglyceride form absorbs up to 70–80% more efficiently than the cheaper and more common ethyl ester form. EPA supports inflammation control, cardiovascular health, and mood. DHA is critical for brain and eye function. The target here is a minimum of 2 g combined Omega-3 per day. At 3 capsules: 1500 mg EPA + 750 mg DHA = 2250 mg total. Always read the supplement facts panel — total fish oil weight is not the same as EPA + DHA content.",
          facts: [
            "Look for 'triglyceride form' on the label — not 'ethyl ester'.",
            "Check actual EPA + DHA milligrams, not just the total fish oil dose.",
            "Take with a meal — dietary fat improves absorption further.",
            "Aim for at least 2 g of combined EPA + DHA per day.",
          ],
        },
        {
          key: "multivitamin",
          name: "Multivitamins & Minerals",
          brand: "Weightworld",
          photoSrc: "/photos/supplements/multivitamins.png",
          detail:
            "Eating on a sustained calorie deficit creates real micronutrient gaps over time even with careful food choices. A multivitamin acts as a daily safety net — not a replacement for real food, but a way to cover what a restricted diet may be missing. Particularly relevant for B-vitamins (especially B12 for anyone eating less meat), zinc, selenium, iodine, and vitamin A. The goal is not optimisation — it is to avoid silent deficiencies that would undermine health and the diet itself over the long term.",
          facts: [
            "Most useful during a sustained calorie deficit when food variety is reduced.",
            "Not a replacement for a varied diet, but a sensible insurance policy.",
            "Check the formula includes B12, zinc, selenium, and iodine.",
          ],
        },
        {
          key: "electrolytes",
          name: "Electrolyte Complex",
          brand: "gloryfeel",
          photoSrc: "/photos/supplements/electrolytes.png",
          detail:
            "GLP-1 medications like Mounjaro significantly reduce appetite — and with it, fluid intake often drops unnoticed. Proper hydration is not just about water volume: electrolytes (sodium, potassium, magnesium, chloride) regulate how the body retains and distributes water. Without them, drinking large amounts can actually flush minerals out. Despite targeting 3–4 liters per day, electrolytes help that water stay where it is needed — inside cells, supporting energy, muscle function, and preventing cramps. Electrolyte loss also accelerates during active weight loss.",
          facts: [
            "Especially important on GLP-1 medications where fluid intake can drop unnoticed.",
            "Electrolytes help the body retain and use the water you drink.",
            "Supports energy, prevents muscle cramps, and reduces fatigue headaches.",
            "Sodium, potassium, and magnesium are the three key electrolytes to prioritise.",
          ],
        },
        {
          key: "magnesium",
          name: "Magnesium Citrate",
          brand: "WeightWorld",
          photoSrc: "/photos/supplements/magnesium.png",
          detail:
            "Not the final pick. After using magnesium citrate, a better option was found: Magnesium Bisglycinate. Bisglycinate is a chelated form — magnesium bound to the amino acid glycine — which makes it significantly gentler on the digestive system and better absorbed. Citrate has a mild laxative effect useful for constipation, but at higher doses it can cause diarrhoea. Current dose: 1 capsule = 222 mg elemental magnesium. If starting fresh, go straight to Bisglycinate. Magnesium supports sleep quality, muscle relaxation, nerve function, and energy production.",
          facts: [
            "Bisglycinate = better absorption, gentler on the stomach — the better long-term choice.",
            "Citrate = useful for constipation, but can cause diarrhoea at higher doses.",
            "Magnesium oxide is the cheapest form but has very poor absorption.",
            "Supports sleep quality, muscle relaxation, and nerve function.",
            "Current dose: 222 mg elemental magnesium per capsule (1 capsule daily).",
          ],
        },
        {
          key: "whey",
          name: "30 g Whey Protein",
          brand: "BioTechUSA",
          photoSrc: "/photos/supplements/whey.png",
          detail:
            "Hitting 170+ g of protein per day from whole food alone is genuinely difficult on a calorie deficit. Whey protein fills the gap cleanly — fast-digesting, high bioavailability, minimal fat and carbs. Always vanilla: neutral enough to mix with milk, water, yogurt, or oats — the safe option you cannot get wrong. Brand comparison from personal experience: PBN was excellent value but is no longer available and had reports of inaccurate labelling. Bulk caused stomach discomfort, likely from high lactose. IRON BROTHERS is currently the best price-per-gram on the German market — average taste with milk, acceptable with water. BioTechUSA vanilla with milk is the current choice: good taste, mixes well, consistent quality.",
          facts: [
            "Always vanilla if unsure — it mixes well with anything.",
            "Compare price per gram of protein, not price per kg of powder.",
            "Whey concentrate is fine unless you are lactose intolerant — isolate has less lactose.",
            "Brands tried: PBN (discontinued), Bulk (stomach issues), IRON BROTHERS (good price), BioTechUSA (current).",
          ],
        },
        {
          key: "creatine",
          name: "10 g Creatine Monohydrate",
          brand: "IRON BROTHERS",
          photoSrc: "/photos/supplements/creatine.png",
          detail:
            "Creatine is one of the most extensively researched supplements in sports science, with consistent evidence across decades. It increases phosphocreatine stores in muscles, which allows ATP (cellular energy) to regenerate faster during short intense efforts — weightlifting, sprints, anything explosive. For someone building strength from scratch, it is a clean and meaningful addition. Monohydrate is the original form: proven, cheap, and identical in effect to more expensive alternatives like Kre-Alkalyn or creatine HCl. No loading phase needed — 5–10 g daily is sufficient. Mixed directly into the whey shake. Rule: buy the cheapest monohydrate from a reputable manufacturer. The active compound is the same everywhere.",
          facts: [
            "No loading phase needed — 5–10 g daily is the standard effective dose.",
            "Monohydrate is identical in effect to more expensive creatine forms.",
            "Takes 2–4 weeks of consistent use before the strength benefit becomes noticeable.",
            "Brand is irrelevant — just confirm it is pure monohydrate from a reputable source.",
            "Safe for long-term use with no evidence of kidney harm in healthy individuals.",
          ],
        },
        {
          key: "collagen",
          name: "10 g Collagen",
          brand: "IRON BROTHERS",
          photoSrc: "/photos/supplements/collagen.png",
          detail:
            "Collagen supports the structural integrity of joints, tendons, ligaments, and skin — all under extra demand when losing significant weight. Rapid weight loss reduces the fat tissue that cushions joints and can loosen skin, making collagen genuinely relevant rather than cosmetic. The critical detail: vitamin C is required for collagen synthesis — the body cannot build collagen without it. The vit4ever product did not include vitamin C, requiring a separate supplement. The IRON BROTHERS version includes vitamin C in the formula — simpler and not more expensive. Either product works as long as vitamin C is covered. Best taken 30–60 minutes before training when collagen synthesis is most active.",
          facts: [
            "Vitamin C is non-negotiable — the body cannot synthesise collagen without it.",
            "Best taken 30–60 minutes before training to support connective tissue repair.",
            "Relevant for joint health, tendon support, and skin elasticity during weight loss.",
            "Check your product includes vitamin C — or add a separate supplement.",
            "Hydrolysed collagen (type I/III) is the most studied form for joints and skin.",
          ],
        },
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
        { label: "Starting point", value: enWeightSummary.startWeight, detail: formatDateShort(enWeightSummary.startDateIso) },
        { label: "Latest logged point", value: enWeightSummary.latestWeight, detail: formatDateShort(enWeightSummary.latestDateIso) },
        { label: "Logged change", value: enWeightSummary.change, detail: "Personal log" },
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
            "Aktuelles Ernährungsbeispiel mit etwa 1810 kcal, 187 g Eiweiß, 128 g Kohlenhydrate und 50 g Fett.",
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
            `GLP-1 Timeline von ${deWeightSummary.startWeight} am ${deWeightSummary.startDateFormatted} bis ${deWeightSummary.latestWeight} am ${deWeightSummary.latestDateFormatted}.`,
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
        { label: "Kalorien", value: "1810 kcal" },
        { label: "Eiweiß", value: "187 g" },
        { label: "Kohlenhydrate", value: "128 g" },
        { label: "Fett", value: "50 g" },
        { label: "Ballaststoffe", value: "29,4 g" },
      ],
      mealsTitle: "Mahlzeiten",
      meals: [
        {
          name: "Shake",
          summary: "312 kcal | 44 g Eiweiß | 16,5 g Kohlenhydrate | 7 g Fett | 0 g Ballaststoffe",
          items: [
            { label: "30 g Whey", detail: "120 kcal | 22,8 g Eiweiß | 1,5 g Kohlenhydrate | 2 g Fett" },
            { label: "10 g Creatin + 10 g Collagen", detail: "40 kcal | 10 g Eiweiß | 0 g Kohlenhydrate | 0 g Fett" },
            { label: "330 ml laktosefreie Milch, 1,5 %", detail: "152 kcal | 11,2 g Eiweiß | 15 g Kohlenhydrate | 5 g Fett" },
          ],
        },
        {
          name: "Mahlzeit 1",
          summary: "305 kcal | 29 g Eiweiß | 7 g Kohlenhydrate | 18 g Fett | 1 g Ballaststoffe",
          items: [
            { label: "3 Eier M, gekocht", detail: "190 kcal | 17 g Eiweiß | 1 g Kohlenhydrate | 13 g Fett" },
            { label: "1 Tomate, 83 g", detail: "17 kcal | 0,7 g Eiweiß | 3,2 g Kohlenhydrate | 0,2 g Fett" },
            { label: "Körniger Frischkäse, 100 g", detail: "98 kcal | 11,5 g Eiweiß | 2,8 g Kohlenhydrate | 4,5 g Fett" },
          ],
        },
        {
          name: "Mahlzeit 2",
          summary: "595 kcal | 56,8 g Eiweiß | 52,3 g Kohlenhydrate | 12,6 g Fett | 14,2 g Ballaststoffe",
          items: [
            { label: "200 g Hähnchenbrust", detail: "240 kcal | 45 g Eiweiß | 0 g Kohlenhydrate | 5,2 g Fett" },
            { label: "Sauce: Senf, Tomatenmark, Joghurt 3,5 %", detail: "58 kcal | 0,7 g Eiweiß | 1,6 g Kohlenhydrate | 3,9 g Fett" },
            { label: "125 g TK-Gemüse, Italienische Art", detail: "62,5 kcal | 2 g Eiweiß | 3,6 g Kohlenhydrate | 2,4 g Fett" },
            { label: "80 g Brokkoli / Kaisergemüse", detail: "33 kcal | 2 g Eiweiß | 4 g Kohlenhydrate | 0,35 g Fett" },
            { label: "75 g Kartoffel", detail: "58 kcal | 1,5 g Eiweiß | 12,5 g Kohlenhydrate | 0,1 g Fett" },
            { label: "38 g Pilze", detail: "6,8 kcal | 0,75 g Eiweiß | 0,6 g Kohlenhydrate | 0,1 g Fett" },
            { label: "40 g Burgul", detail: "137 kcal | 4,9 g Eiweiß | 30 g Kohlenhydrate | 0,5 g Fett" },
          ],
        },
        {
          name: "Mahlzeit 3",
          summary: "595 kcal | 56,8 g Eiweiß | 52,3 g Kohlenhydrate | 12,6 g Fett | 14,2 g Ballaststoffe",
          items: [
            { label: "200 g Hähnchenbrust", detail: "240 kcal | 45 g Eiweiß | 0 g Kohlenhydrate | 5,2 g Fett" },
            { label: "Sauce: Senf, Tomatenmark, Joghurt 3,5 %", detail: "58 kcal | 0,7 g Eiweiß | 1,6 g Kohlenhydrate | 3,9 g Fett" },
            { label: "125 g TK-Gemüse, Italienische Art", detail: "62,5 kcal | 2 g Eiweiß | 3,6 g Kohlenhydrate | 2,4 g Fett" },
            { label: "80 g Brokkoli / Kaisergemüse", detail: "33 kcal | 2 g Eiweiß | 4 g Kohlenhydrate | 0,35 g Fett" },
            { label: "75 g Kartoffel", detail: "58 kcal | 1,5 g Eiweiß | 12,5 g Kohlenhydrate | 0,1 g Fett" },
            { label: "38 g Pilze", detail: "6,8 kcal | 0,75 g Eiweiß | 0,6 g Kohlenhydrate | 0,1 g Fett" },
            { label: "40 g Burgul", detail: "137 kcal | 4,9 g Eiweiß | 30 g Kohlenhydrate | 0,5 g Fett" },
          ],
        },
      ],
      weeklyNote:
        "Diese Mahlzeitenstruktur gilt für 6 Tage pro Woche. Am siebten Tag gibt es Restaurantbesuch — meistens Gegrilltes, Döner oder Shawarma. Kein Frittiertes, keine Nudeln, keine Pizza.",
      supplementsTitle: "Supplements",
      supplementsIntro:
        "Diese gehören standardmäßig zu Essen und Ernährung, außer sie hängen mit Laborwerten, ärztlicher Begleitung, Medikamenten-Interaktionen oder OP-Erholung zusammen.",
      supplements: [
        {
          key: "d3-k2",
          name: "Vitamin D3 5000 IU + K2",
          brand: "vit4ever",
          photoSrc: "/photos/supplements/d3-k2.png",
          detail:
            "Vitamin-D3-Mangel ist in Deutschland weit verbreitet — wenig Sonnenlicht über viele Monate bedeutet, dass die meisten Menschen nicht genug davon selbst produzieren können. D3 unterstützt das Immunsystem, die Knochendichte, die Stimmung und die Hormonregulation. K2 (idealerweise MK-7-Form) ist der unverzichtbare Partner: Es lenkt Kalzium gezielt in Knochen und Zähne statt in Weichteile und Arterien. Ohne K2 kann hochdosiertes D3 Verkalkungsrisiken erhöhen. Die 5000-IU-Dosis ist ein üblicher Ausgangspunkt, doch Blutarbeit ist der einzig verlässliche Weg, den eigenen Bedarf zu kennen. Den 25(OH)D-Wert messen lassen und die Dosierung mit einem Arzt absprechen.",
          facts: [
            "Mit einer fetthaltigen Mahlzeit nehmen — D3 ist fettlöslich und wird so deutlich besser aufgenommen.",
            "K2 MK-7 ist bioverfügbarer und länger wirksam als K2 MK-4.",
            "Bluttest (25(OH)D-Spiegel) vor der Einnahme hoher Dosen empfohlen.",
            "In Deutschland sind die meisten Menschen defizient — besonders in den Wintermonaten.",
          ],
        },
        {
          key: "omega3",
          name: "Omega-3, 1500 EPA / 750 DHA",
          brand: "IRON BROTHERS",
          photoSrc: "/photos/supplements/omega3.png",
          detail:
            "Zwei Dinge entscheiden, ob ein Omega-3-Supplement wirklich etwas bringt: die molekulare Form und die EPA/DHA-Gehalte. Die Triglycerid-Form wird bis zu 70–80 % effizienter aufgenommen als die günstigere Ethylester-Form. EPA unterstützt die Entzündungsregulation, die Herzgesundheit und die Stimmung. DHA ist wichtig für Gehirn und Sehkraft. Das Ziel hier ist mindestens 2 g kombiniertes Omega-3 täglich. Bei 3 Kapseln: 1500 mg EPA + 750 mg DHA = 2250 mg gesamt. Immer das Nährwertlabel lesen — das Gesamtgewicht des Fischöls ist nicht dasselbe wie der EPA+DHA-Gehalt.",
          facts: [
            "Auf dem Label nach 'Triglycerid-Form' suchen — nicht 'Ethylester'.",
            "Tatsächliche EPA- und DHA-Milligramm prüfen, nicht nur die Gesamtdosis.",
            "Mit einer Mahlzeit einnehmen — Nahrungsfett verbessert die Aufnahme weiter.",
            "Ziel: mindestens 2 g kombiniertes EPA + DHA täglich.",
          ],
        },
        {
          key: "multivitamin",
          name: "Multivitamine & Mineralstoffe",
          brand: "Weightworld",
          photoSrc: "/photos/supplements/multivitamins.png",
          detail:
            "Ein anhaltend kalorienbeschränktes Essen erzeugt über die Zeit echte Mikronährstofflücken, selbst bei sorgfältiger Auswahl. Ein Multivitamin dient als tägliche Absicherung — kein Ersatz für echtes Essen, aber ein sinnvoller Puffer für das, was eine eingeschränkte Ernährungsphase langfristig fehlen lässt. Besonders relevant sind B-Vitamine (vor allem B12 für alle, die weniger Fleisch essen), Zink, Selen, Jod und Vitamin A. Das Ziel ist nicht Optimierung, sondern das stille Vermeiden von Mängeln, die Gesundheit und Diät von innen untergraben würden.",
          facts: [
            "Besonders nützlich bei anhaltendem Kaloriendefizit mit eingeschränkter Lebensmittelvielfalt.",
            "Kein Ersatz für eine abwechslungsreiche Ernährung, aber eine sinnvolle Absicherung.",
            "Auf B12, Zink, Selen und Jod im Präparat achten.",
          ],
        },
        {
          key: "electrolytes",
          name: "Elektrolyt-Komplex",
          brand: "gloryfeel",
          photoSrc: "/photos/supplements/electrolytes.png",
          detail:
            "GLP-1-Medikamente wie Mounjaro reduzieren den Appetit erheblich — und damit oft unbemerkt auch die Flüssigkeitszufuhr. Gute Hydration bedeutet nicht nur Wasser trinken: Elektrolyte (Natrium, Kalium, Magnesium, Chlorid) steuern, wie der Körper das Wasser speichert und verteilt. Ohne Elektrolyte können große Wassermengen Mineralstoffe aus dem Körper spülen. Trotz eines Tagesziels von 3–4 Litern helfen Elektrolyte sicherzustellen, dass das Wasser bleibt, wo es gebraucht wird — in den Zellen, für Energie, Muskelfunktion und Vorbeugung von Krämpfen.",
          facts: [
            "Besonders wichtig bei GLP-1-Medikamenten, wo die Flüssigkeitszufuhr unbemerkt sinken kann.",
            "Elektrolyte helfen dem Körper, das aufgenommene Wasser zu nutzen und zu halten.",
            "Unterstützt Energie, beugt Muskelkrämpfen vor und reduziert Erschöpfungs-Kopfschmerzen.",
            "Natrium, Kalium und Magnesium sind die drei wichtigsten Elektrolyte.",
          ],
        },
        {
          key: "magnesium",
          name: "Magnesium Citrat",
          brand: "WeightWorld",
          photoSrc: "/photos/supplements/magnesium.png",
          detail:
            "Nicht die endgültige Wahl. Nach der Nutzung von Magnesium Citrat wurde eine bessere Option gefunden: Magnesium Bisglycinat. Bisglycinat ist eine chelierte Form — Magnesium gebunden an die Aminosäure Glycin — was es deutlich magenverträglicher und besser aufnehmbar macht. Citrat hat einen leichten abführenden Effekt, der bei Verstopfung nützlich sein kann, bei höheren Dosen aber Durchfall verursachen kann. Aktuelle Dosis: 1 Kapsel = 222 mg elementares Magnesium. Wer neu anfängt, sollte direkt zu Bisglycinat greifen. Magnesium unterstützt Schlafqualität, Muskelentspannung, Nervenfunktion und Energieproduktion.",
          facts: [
            "Bisglycinat = bessere Aufnahme, magenverträglicher — die bessere Wahl auf Dauer.",
            "Citrat = nützlich bei Verstopfung, kann bei höheren Dosen Durchfall verursachen.",
            "Magnesiumoxid ist die günstigste Form, hat aber eine sehr schlechte Bioverfügbarkeit.",
            "Unterstützt Schlafqualität, Muskelentspannung und Nervenfunktion.",
            "Aktuelle Dosis: 222 mg elementares Magnesium pro Kapsel (1 Kapsel täglich).",
          ],
        },
        {
          key: "whey",
          name: "30 g Whey Protein",
          brand: "BioTechUSA",
          photoSrc: "/photos/supplements/whey.png",
          detail:
            "Täglich 170+ g Protein allein aus vollwertigen Lebensmitteln zu erreichen ist bei einem Kaloriendefizit wirklich schwierig. Whey-Protein schließt diese Lücke sauber — schnell verdaulich, hohe Bioverfügbarkeit, wenig Fett und Kohlenhydrate. Immer Vanilla: neutral genug, um mit Milch, Wasser, Joghurt oder Haferflocken gemischt zu werden — die sichere Wahl. Markenvergleich: PBN war preislich ausgezeichnet, ist aber nicht mehr erhältlich und hatte Berichte über ungenaue Nährwertangaben. Bulk verursachte Magenbeschwerden, wahrscheinlich durch hohen Laktosegehalt. IRON BROTHERS ist aktuell das günstigste Preis-pro-Gramm-Angebot auf dem deutschen Markt. BioTechUSA Vanilla mit Milch ist die aktuelle Wahl: guter Geschmack, mischt sich gut, gleichbleibende Qualität.",
          facts: [
            "Im Zweifelsfall immer Vanilla — passt zu allem.",
            "Preis pro Gramm Protein vergleichen, nicht den Preis pro Kilogramm Pulver.",
            "Whey-Konzentrat ist gut, es sei denn du bist laktoseintolerant — Isolat hat weniger Laktose.",
            "Getestete Marken: PBN (nicht mehr verfügbar), Bulk (Magenprobleme), IRON BROTHERS (guter Preis), BioTechUSA (aktuelle Wahl).",
          ],
        },
        {
          key: "creatine",
          name: "10 g Creatin Monohydrat",
          brand: "IRON BROTHERS",
          photoSrc: "/photos/supplements/creatine.png",
          detail:
            "Kreatin ist eines der am umfangreichsten erforschten Supplements in der Sportwissenschaft, mit konsistenten Belegen über Jahrzehnte. Es erhöht den Phosphokreatin-Speicher in den Muskeln, was die ATP-Regeneration bei kurzen intensiven Belastungen beschleunigt — Krafttraining, Sprints, alles Explosive. Für jemanden, der von Grund auf Kraft aufbaut, ist es eine sinnvolle Ergänzung. Monohydrat ist die ursprüngliche Form: bewiesen, günstig und in der Wirksamkeit identisch mit teureren Formen wie Kre-Alkalyn oder Kreatin-HCl. Keine Ladephase nötig — 5–10 g täglich reichen. Wird direkt in den Whey-Shake gemischt. Regel: das günstigste Monohydrat von einem seriösen Hersteller kaufen.",
          facts: [
            "Keine Ladephase nötig — 5–10 g täglich ist die standardmäßig wirksame Dosis.",
            "Monohydrat ist in der Wirkung identisch mit teureren Kreatin-Formen.",
            "Es dauert 2–4 Wochen kontinuierlicher Einnahme, bis der Krafteffekt spürbar ist.",
            "Marke irrelevant — nur reines Monohydrat von einem seriösen Hersteller wählen.",
            "Bei gesunden Personen langfristig sicher — kein Beleg für Nierenschäden.",
          ],
        },
        {
          key: "collagen",
          name: "10 g Kollagen",
          brand: "IRON BROTHERS",
          photoSrc: "/photos/supplements/collagen.png",
          detail:
            "Kollagen unterstützt die strukturelle Integrität von Gelenken, Sehnen, Bändern und Haut — alles, was beim Verlust erheblicher Gewichtsmengen unter besonderem Druck steht. Schneller Gewichtsverlust reduziert das Fettgewebe, das Gelenke polstert, und kann die Haut lockern, was Kollagen zu echter Unterstützung macht. Der entscheidende Punkt: Vitamin C ist für die Kollagensynthese unverzichtbar — der Körper kann ohne es kein Kollagen aufbauen. Das vit4ever-Kollagen enthielt kein Vitamin C, weshalb ein separates Präparat nötig war. Die IRON-BROTHERS-Version enthält Vitamin C bereits in der Formel — einfacher und nicht teurer. Idealerweise 30–60 Minuten vor dem Training einnehmen.",
          facts: [
            "Vitamin C ist unverzichtbar — ohne es kann der Körper kein Kollagen aufbauen.",
            "Idealerweise 30–60 Minuten vor dem Training für optimale Kollagensynthese.",
            "Relevant für Gelenkgesundheit, Sehnenunterstützung und Hautelastizität beim Abnehmen.",
            "Sicherstellen, dass das Produkt Vitamin C enthält — oder separat ergänzen.",
            "Hydrolysiertes Kollagen (Typ I/III) ist die am besten untersuchte Form für Gelenke und Haut.",
          ],
        },
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
        { label: "Startpunkt", value: deWeightSummary.startWeight, detail: formatDateShort(deWeightSummary.startDateIso) },
        { label: "Letzter eingetragener Stand", value: deWeightSummary.latestWeight, detail: formatDateShort(deWeightSummary.latestDateIso) },
        { label: "Eingetragene Veränderung", value: deWeightSummary.change, detail: "Persönlicher Log" },
      ],
      entriesTitle: "Eingetragene Werte",
      tableHeaders: ["Dosis (mg)", "Datum", "Gewicht", "Veränderung"],
      loggedEntries,
    },
  },
} satisfies Record<Locale, unknown>;
