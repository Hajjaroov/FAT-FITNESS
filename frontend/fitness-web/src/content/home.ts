import type { Locale } from "@/content/site";

export const homeCopy = {
  en: {
    hero: {
      eyebrow: "Personal journey",
      title:
        "Realistic support for people who do not see themselves in polished fitness culture.",
      paragraphs: [
        "I am not a coach or athlete. I am documenting my own weight-loss journey from 203 kg and building a community for people who want realistic, beginner-friendly support.",
        "My latest logged point is 158 kg on 7 June 2026. The numbers matter, but the bigger point is that progress does not need to look polished to be real.",
        "This page is where the project starts. It brings the core context, the current position, and the journal side of the journey together in one place.",
      ],
    },
    snapshot: {
      eyebrow: "Snapshot",
      items: [
        { label: "Starting point", value: "203 kg" },
        { label: "Current known point", value: "158 kg" },
        { label: "Latest log", value: "7 Jun 2026" },
      ],
      guardrails: [
        "I am not a coach or athlete.",
        "This is personal experience, not medical advice.",
        "Nothing here is a guaranteed method.",
        "GLP-1 is mentioned only as part of my own story.",
      ],
    },
    why: {
      eyebrow: "Why this exists",
      title: "I wanted a place that feels realistic from day one.",
      paragraphs: [
        "A lot of fitness content is built around confidence, experience, and polished advice. That can help some people, but it can also feel very far away from the reality of starting at a very high bodyweight and trying to change your life without pretending it is easy.",
        "This project is my way of documenting the messy middle. The good days matter. The hard days matter too. What worked for me should be presented as my experience, not as a rule for everyone else.",
        "I want the tone here to stay grounded, beginner-friendly, and honest about what is difficult, what is improving, and what still needs to be figured out.",
      ],
    },
    journal: {
      eyebrow: "What you will find here",
      title: "Notes, progress, and practical reflection.",
      points: [
        "Honest progress updates from normal day-to-day life.",
        "Reflections on what helped, what failed, and what I am still learning.",
        "A beginner perspective instead of polished fitness advice.",
        "A simple place to document the journey without overcomplicating the structure.",
      ],
    },
  },
  de: {
    hero: {
      eyebrow: "Persoenliche Reise",
      title:
        "Realistische Unterstuetzung fuer Menschen, die sich in perfekter Fitness-Kultur nicht wiederfinden.",
      paragraphs: [
        "Ich bin kein Coach und kein Athlet. Ich dokumentiere meine eigene Abnehmreise ab 203 kg und baue eine Community fuer Menschen auf, die realistische, anfaengerfreundliche Unterstuetzung suchen.",
        "Mein letzter eingetragener Stand ist 158 kg am 7. Juni 2026. Die Zahlen sind wichtig, aber der groessere Punkt ist: Fortschritt muss nicht perfekt aussehen, um echt zu sein.",
        "Diese Seite ist der Startpunkt des Projekts. Sie verbindet den Kern der Geschichte, den aktuellen Stand und die Journal-Seite der Reise an einem Ort.",
      ],
    },
    snapshot: {
      eyebrow: "Momentaufnahme",
      items: [
        { label: "Startpunkt", value: "203 kg" },
        { label: "Aktueller bekannter Stand", value: "158 kg" },
        { label: "Letzter Eintrag", value: "7. Juni 2026" },
      ],
      guardrails: [
        "Ich bin kein Coach und kein Athlet.",
        "Das ist persoenliche Erfahrung, keine medizinische Beratung.",
        "Nichts hier ist eine garantierte Methode.",
        "GLP-1 wird nur als Teil meiner eigenen Geschichte erwaehnt.",
      ],
    },
    why: {
      eyebrow: "Warum es das gibt",
      title: "Ich wollte einen Ort, der sich ab Tag eins realistisch anfuehlt.",
      paragraphs: [
        "Viele Fitness-Inhalte drehen sich um Selbstsicherheit, Erfahrung und perfekt formulierte Tipps. Das kann manchen helfen, aber es fuehlt sich oft weit weg an, wenn man mit sehr hohem Gewicht startet und sein Leben veraendern will, ohne so zu tun, als waere es einfach.",
        "Dieses Projekt ist meine Art, die unordentliche Mitte zu dokumentieren. Gute Tage zaehlen. Schwere Tage auch. Was fuer mich funktioniert hat, soll als meine Erfahrung stehen, nicht als Regel fuer alle.",
        "Der Ton hier soll bodenstaendig, anfaengerfreundlich und ehrlich bleiben: was schwer ist, was besser wird und was noch herausgefunden werden muss.",
      ],
    },
    journal: {
      eyebrow: "Was du hier findest",
      title: "Notizen, Fortschritt und praktische Reflexion.",
      points: [
        "Ehrliche Fortschritts-Updates aus dem normalen Alltag.",
        "Reflexionen darueber, was geholfen hat, was nicht funktioniert hat und was ich noch lerne.",
        "Eine Anfaengerperspektive statt perfekter Fitness-Ratschlaege.",
        "Ein einfacher Ort, um die Reise zu dokumentieren, ohne die Struktur unnoetig kompliziert zu machen.",
      ],
    },
  },
} satisfies Record<Locale, unknown>;
