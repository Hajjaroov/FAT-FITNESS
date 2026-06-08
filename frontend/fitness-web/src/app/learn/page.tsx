import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Learn | Fat Fitness Community",
  description:
    "Beginner-friendly personal learning notes about food, training, and medical journey topics.",
};

const sections = [
  {
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
    title: "Medical Journey",
    summary:
      "Personal medical context, including GLP-1 history and other medical decisions, documented carefully.",
    startsWith: [
      "GLP-1 timeline from 203 kg on 16 November 2025 to 158 kg on 7 June 2026.",
      "Shot and weight logs as personal records, not dosing instructions.",
      "Doctor-discussion topics and personal reflections, not medical advice.",
    ],
  },
];

const boundaries = [
  "Everything here starts from personal experience.",
  "No diet, training, supplement, medication, or OP content should be framed as a universal method.",
  "Medical decisions belong with qualified professionals.",
];

export default function LearnPage() {
  return (
    <div className="min-h-screen bg-[#fafaf9] text-zinc-950">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-700"
          >
            Fat Fitness
          </Link>
          <nav className="flex items-center gap-5 text-sm text-zinc-600">
            <Link href="/" className="transition hover:text-zinc-950">
              Home
            </Link>
            <Link href="/learn" className="font-medium text-zinc-950">
              Learn
            </Link>
            <Link href="/community" className="transition hover:text-zinc-950">
              Community
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-col px-6 py-12 sm:py-16">
        <section className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-orange-700">
            Learn
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-normal text-zinc-950 sm:text-5xl">
            Practical notes from the journey, organized without pretending to be
            a course.
          </h1>
          <p className="mt-6 text-base leading-8 text-zinc-700">
            This area will collect the more structured parts of the project:
            food, training, and medical journey notes. The goal is to make the
            experience easier to understand without turning it into coaching,
            medical advice, or a guaranteed method.
          </p>
        </section>

        <section className="mt-12 border-y border-zinc-200">
          {sections.map((section) => (
            <article
              key={section.title}
              className="grid gap-5 border-b border-zinc-200 py-8 last:border-b-0 lg:grid-cols-[0.85fr_1.15fr]"
            >
              <div>
                <h2 className="text-2xl font-semibold tracking-normal text-zinc-950">
                  {section.title}
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-7 text-zinc-600">
                  {section.summary}
                </p>
              </div>
              <ul className="space-y-3 text-base leading-8 text-zinc-700">
                {section.startsWith.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-3 h-2 w-2 shrink-0 rounded-full bg-orange-600" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </section>

        <section className="mt-10 grid gap-6 border-b border-zinc-200 pb-10 lg:grid-cols-[0.75fr_1.25fr]">
          <h2 className="text-2xl font-semibold tracking-normal text-zinc-950">
            Boundaries
          </h2>
          <ul className="space-y-3 text-base leading-8 text-zinc-700">
            {boundaries.map((boundary) => (
              <li key={boundary} className="flex gap-3">
                <span className="mt-3 h-2 w-2 shrink-0 rounded-full bg-zinc-950" />
                <span>{boundary}</span>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
