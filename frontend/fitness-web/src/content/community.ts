import type { Locale } from "@/content/site";

export const communityCopy = {
  en: {
    hero: {
      eyebrow: "Community",
      title: "A forum for realistic support.",
      intro:
        "A place for journey logs, beginner questions, food and training discussions, GLP-1 experience, progress wins, and practical support.",
    },
    categories: {
      eyebrow: "Forum index",
      title: "Boards",
      intro: "Choose a board to read or post in when the forum opens.",
      openCategoryLabel: "Open board",
      items: [
        {
          slug: "introductions",
          name: "Introductions",
          description:
            "Who you are, where you are starting, and what kind of support helps.",
        },
        {
          slug: "journey-logs",
          name: "Journey Logs",
          description:
            "Long-running progress threads with updates, setbacks, and small wins.",
        },
        {
          slug: "food-and-diet",
          name: "Food & Diet",
          description:
            "Meal ideas, practical routines, shopping notes, and what did or did not work.",
        },
        {
          slug: "training-at-high-bodyweight",
          name: "Training at High Bodyweight",
          description:
            "Beginner movement, gym anxiety, equipment, recovery, and realistic starting points.",
        },
        {
          slug: "glp-1-experience",
          name: "GLP-1 Experience",
          description:
            "Personal experiences and questions to discuss with qualified professionals.",
        },
        {
          slug: "questions-and-support",
          name: "Questions & Support",
          description:
            "Beginner questions where replies should be careful, kind, and non-prescriptive.",
        },
        {
          slug: "progress-wins",
          name: "Progress Wins",
          description:
            "Scale and non-scale wins without turning progress into competition.",
        },
        {
          slug: "equipment-and-tools",
          name: "Equipment & Tools",
          description:
            "Benches, dumbbells, tracking apps, food tools, and other practical product notes.",
        },
      ],
    },
    forumIndex: {
      statusLabel: "Forum status",
      statusText:
        "Posting opens later after accounts, reporting, and moderation are ready.",
      guidelinesLabel: "Community guidelines",
      headers: {
        board: "Board",
        topics: "Topics",
        replies: "Replies",
        latest: "Latest",
      },
      latestEmpty: "No threads yet",
      groups: [
        {
          title: "Start here",
          slugs: ["introductions", "journey-logs", "questions-and-support"],
        },
        {
          title: "Food, training, and health context",
          slugs: [
            "food-and-diet",
            "training-at-high-bodyweight",
            "glp-1-experience",
          ],
        },
        {
          title: "Wins, tools, and practical notes",
          slugs: ["progress-wins", "equipment-and-tools"],
        },
      ],
    },
    categoryDetail: {
      backLinkLabel: "Community",
      statusLabel: "Board status",
      statusText: "No threads yet",
      threadsTitle: "Threads",
      emptyTitle: "No threads yet",
      emptyText:
        "This board will open after accounts, reporting, and moderation are ready.",
      pinnedTitle: "Pinned",
      pinnedGuidelinesTitle: "Community guidelines",
      pinnedGuidelinesText: "Read the rules before posting later.",
      topicsLabel: "Topics",
      repliesLabel: "Replies",
      latestLabel: "Latest",
    },
    guidelines: {
      backLinkLabel: "Community",
      hero: {
        eyebrow: "Community guidelines",
        title: "Rules for a safer support forum.",
        intro:
          "These guidelines define the tone and boundaries for the future forum. The topics here can be sensitive: weight, food, training, GLP-1, medical decisions, confidence, shame, and progress.",
        note:
          "This page is the practical behavior guide that the forum should be built around.",
        statusLabel: "Status",
      },
      principles: {
        title: "The basic promise",
        items: [
          {
            title: "Support, not coaching",
            text: "Members can share personal experience, but nobody should present themselves as the authority on how another person must lose weight.",
          },
          {
            title: "Context over judgment",
            text: "People start from different health, money, mobility, time, and confidence situations. Replies should make room for that reality.",
          },
          {
            title: "Safety over engagement",
            text: "If a post is dramatic but harmful, unsafe, shaming, or medically risky, moderation should win over activity metrics.",
          },
        ],
      },
      rules: {
        eyebrow: "Rules",
        title: "Core rules",
        items: [
          "No body shaming, humiliation, harassment, or mocking progress.",
          "No extreme diet promotion, starvation challenges, purging advice, or eating-disorder encouragement.",
          "No medical advice stated as fact. Personal experience is okay; instructions for others are not.",
          "No telling people to start, stop, dose, or change medication, including GLP-1.",
          "No supplement scams, steroid promotion, miracle cures, or affiliate spam disguised as help.",
          "No before/after photo abuse, reposting, sexual comments, or pressure to share progress photos.",
        ],
      },
      healthTopics: {
        eyebrow: "Health topics",
        title: "How health topics should be discussed",
        intro:
          "Diet, training, medication, OP/surgery, symptoms, side effects, and weight data can be discussed as personal context. They should not become instructions, diagnosis, or pressure.",
        examplesTitle: "Safer wording examples",
        avoidLabel: "Avoid",
        preferLabel: "Prefer",
        examples: [
          {
            avoid: "You should take this dose.",
            prefer:
              "This is what happened in my own treatment, and a doctor should guide dosing.",
          },
          {
            avoid: "This diet works for everyone.",
            prefer:
              "This structure helped me, but it may not fit another person's health or life.",
          },
          {
            avoid: "Ignore your doctor and try this.",
            prefer:
              "That sounds like something to discuss with a qualified professional.",
          },
        ],
      },
      moderation: {
        title: "Future moderation actions",
        intro:
          "When posting exists, moderation should be available from the first real forum milestone.",
        items: [
          "Report a post or reply",
          "Hide or delete unsafe content",
          "Lock heated or risky threads",
          "Pin important safety information",
          "Ban users who repeatedly harm the community",
          "Keep moderator notes for serious incidents",
        ],
      },
      posting: {
        title: "Before posting later",
        items: [
          "Am I sharing my own experience instead of prescribing a method?",
          "Could this pressure someone into unsafe food, medication, or exercise choices?",
          "Would I say this to someone who is anxious, ashamed, or starting from zero?",
          "Does this belong with a doctor, therapist, dietitian, or emergency service instead of a forum?",
        ],
      },
    },
  },
  de: {
    hero: {
      eyebrow: "Community",
      title: "Ein Forum fuer realistische Unterstuetzung.",
      intro:
        "Ein Ort fuer Journey Logs, Anfaengerfragen, Essen- und Trainingsdiskussionen, GLP-1 Erfahrung, Fortschritts-Wins und praktische Unterstuetzung.",
    },
    categories: {
      eyebrow: "Forum-Index",
      title: "Boards",
      intro: "Waehle ein Board, um spaeter darin zu lesen oder zu posten.",
      openCategoryLabel: "Board oeffnen",
      items: [
        {
          slug: "introductions",
          name: "Vorstellungen",
          description: "Wer du bist, wo du startest und welche Art Support hilft.",
        },
        {
          slug: "journey-logs",
          name: "Journey Logs",
          description:
            "Langfristige Fortschritts-Threads mit Updates, Rueckschlaegen und kleinen Erfolgen.",
        },
        {
          slug: "food-and-diet",
          name: "Essen & Ernaehrung",
          description:
            "Mahlzeitenideen, praktische Routinen, Einkaufnotizen und was funktioniert oder nicht.",
        },
        {
          slug: "training-at-high-bodyweight",
          name: "Training bei hohem Koerpergewicht",
          description:
            "Anfaengerbewegung, Gym-Angst, Equipment, Erholung und realistische Startpunkte.",
        },
        {
          slug: "glp-1-experience",
          name: "GLP-1 Erfahrung",
          description:
            "Persoenliche Erfahrungen und Fragen fuer qualifizierte Fachpersonen.",
        },
        {
          slug: "questions-and-support",
          name: "Fragen & Support",
          description:
            "Anfaengerfragen, bei denen Antworten vorsichtig, freundlich und nicht vorschreibend sein sollen.",
        },
        {
          slug: "progress-wins",
          name: "Fortschritts-Wins",
          description:
            "Scale und Non-Scale Wins, ohne Fortschritt zu einem Wettbewerb zu machen.",
        },
        {
          slug: "equipment-and-tools",
          name: "Equipment & Tools",
          description:
            "Baenke, Kurzhanteln, Tracking-Apps, Food-Tools und andere praktische Produktnotizen.",
        },
      ],
    },
    forumIndex: {
      statusLabel: "Forum-Status",
      statusText:
        "Posten startet spaeter, wenn Accounts, Meldungen und Moderation bereit sind.",
      guidelinesLabel: "Community-Regeln",
      headers: {
        board: "Board",
        topics: "Themen",
        replies: "Antworten",
        latest: "Letztes",
      },
      latestEmpty: "Noch keine Threads",
      groups: [
        {
          title: "Start hier",
          slugs: ["introductions", "journey-logs", "questions-and-support"],
        },
        {
          title: "Essen, Training und Gesundheitskontext",
          slugs: [
            "food-and-diet",
            "training-at-high-bodyweight",
            "glp-1-experience",
          ],
        },
        {
          title: "Wins, Tools und praktische Notizen",
          slugs: ["progress-wins", "equipment-and-tools"],
        },
      ],
    },
    categoryDetail: {
      backLinkLabel: "Community",
      statusLabel: "Board-Status",
      statusText: "Noch keine Threads",
      threadsTitle: "Threads",
      emptyTitle: "Noch keine Threads",
      emptyText:
        "Dieses Board oeffnet spaeter, wenn Accounts, Meldungen und Moderation bereit sind.",
      pinnedTitle: "Angepinnt",
      pinnedGuidelinesTitle: "Community-Regeln",
      pinnedGuidelinesText: "Lies die Regeln, bevor spaeter gepostet wird.",
      topicsLabel: "Themen",
      repliesLabel: "Antworten",
      latestLabel: "Letztes",
    },
    guidelines: {
      backLinkLabel: "Community",
      hero: {
        eyebrow: "Community-Regeln",
        title: "Regeln fuer ein sichereres Support-Forum.",
        intro:
          "Diese Regeln definieren Ton und Grenzen fuer das zukuenftige Forum. Die Themen hier koennen sensibel sein: Gewicht, Essen, Training, GLP-1, medizinische Entscheidungen, Selbstvertrauen, Scham und Fortschritt.",
        note:
          "Diese Seite ist der praktische Verhaltensrahmen, um den das Forum gebaut werden soll.",
        statusLabel: "Status",
      },
      principles: {
        title: "Das Grundversprechen",
        items: [
          {
            title: "Support, kein Coaching",
            text: "Mitglieder koennen persoenliche Erfahrungen teilen, aber niemand soll so auftreten, als duerfte er anderen vorschreiben, wie sie abnehmen muessen.",
          },
          {
            title: "Kontext statt Urteil",
            text: "Menschen starten mit unterschiedlichen Gesundheits-, Geld-, Mobilitaets-, Zeit- und Selbstvertrauenssituationen. Antworten sollen dafuer Platz lassen.",
          },
          {
            title: "Sicherheit vor Engagement",
            text: "Wenn ein Post dramatisch, aber schaedlich, unsicher, beschaemend oder medizinisch riskant ist, soll Moderation wichtiger sein als Aktivitaetszahlen.",
          },
        ],
      },
      rules: {
        eyebrow: "Regeln",
        title: "Kernregeln",
        items: [
          "Kein Body Shaming, keine Erniedrigung, keine Belaestigung und kein Auslachen von Fortschritt.",
          "Keine extremen Diaeten, Hunger-Challenges, Purging-Tipps oder Ermutigung zu Essstoerungen.",
          "Keine medizinische Beratung als Fakt. Persoenliche Erfahrung ist okay; Anweisungen fuer andere nicht.",
          "Niemandem sagen, Medikamente zu starten, zu stoppen, zu dosieren oder zu aendern, inklusive GLP-1.",
          "Keine Supplement-Scams, Steroid-Promotion, Wunderheilungen oder Affiliate-Spam als Hilfe tarnen.",
          "Kein Missbrauch von Vorher/Nachher-Fotos, kein Reposting, keine sexualisierten Kommentare und kein Druck, Fortschrittsfotos zu teilen.",
        ],
      },
      healthTopics: {
        eyebrow: "Gesundheitsthemen",
        title: "Wie Gesundheitsthemen besprochen werden sollen",
        intro:
          "Diaet, Training, Medikamente, OP/Surgery, Symptome, Nebenwirkungen und Gewichtsdaten koennen als persoenlicher Kontext besprochen werden. Sie sollen nicht zu Anweisungen, Diagnosen oder Druck werden.",
        examplesTitle: "Sicherere Formulierungen",
        avoidLabel: "Vermeiden",
        preferLabel: "Besser",
        examples: [
          {
            avoid: "Du solltest diese Dosis nehmen.",
            prefer:
              "Das ist in meiner eigenen Behandlung passiert, und Dosierung gehoert zu einem Arzt.",
          },
          {
            avoid: "Diese Diaet funktioniert fuer alle.",
            prefer:
              "Diese Struktur hat mir geholfen, aber sie passt vielleicht nicht zu Gesundheit oder Leben einer anderen Person.",
          },
          {
            avoid: "Ignorier deinen Arzt und probier das.",
            prefer:
              "Das klingt nach etwas, das du mit einer qualifizierten Fachperson besprechen solltest.",
          },
        ],
      },
      moderation: {
        title: "Zukuenftige Moderationsaktionen",
        intro:
          "Wenn Posten existiert, soll Moderation ab dem ersten echten Forum-Meilenstein verfuegbar sein.",
        items: [
          "Post oder Antwort melden",
          "Unsichere Inhalte verstecken oder loeschen",
          "Aufgeheizte oder riskante Threads sperren",
          "Wichtige Sicherheitsinformationen pinnen",
          "User bannen, die der Community wiederholt schaden",
          "Moderatornotizen fuer ernste Vorfaelle fuehren",
        ],
      },
      posting: {
        title: "Spaeter vor dem Posten",
        items: [
          "Teile ich meine eigene Erfahrung, statt eine Methode vorzuschreiben?",
          "Koennte das jemanden zu unsicheren Essens-, Medikamenten- oder Trainingsentscheidungen draengen?",
          "Wuerde ich das jemandem sagen, der aengstlich, beschaemt oder ganz am Anfang ist?",
          "Gehoert das eher zu Arzt, Therapeut, Ernaehrungsfachperson oder Notfallhilfe statt in ein Forum?",
        ],
      },
    },
  },
} satisfies Record<Locale, unknown>;

export const communityCategorySlugs = communityCopy.en.categories.items.map(
  (category) => category.slug,
);

export function isCommunityCategorySlug(slug: string) {
  return communityCategorySlugs.includes(slug);
}
