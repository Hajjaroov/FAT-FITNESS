import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Fat Fitness Community",
  description:
    "A personal weight-loss journey and future peer-support community built around realistic beginner-friendly support.",
};

const guardrails = [
  "I am not a coach or athlete.",
  "This is personal experience, not medical advice.",
  "Nothing here is a guaranteed method.",
  "GLP-1 is mentioned only as part of my own story.",
];

const journalPoints = [
  "Honest progress updates from normal day-to-day life.",
  "Reflections on what helped, what failed, and what I am still learning.",
  "A beginner perspective instead of polished fitness advice.",
  "A simple place to document the journey without overcomplicating the structure.",
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fff7ed_0%,#fafaf9_30%,#f4f4f5_100%)] text-zinc-950">
      <header className="border-b border-zinc-200/80 bg-white/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-700"
          >
            Fat Fitness
          </Link>
          <nav className="flex items-center gap-5 text-sm text-zinc-600">
            <Link href="/" className="font-medium text-zinc-950">
              Home
            </Link>
            <Link href="/community" className="transition hover:text-zinc-950">
              Community
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10 sm:gap-8 sm:py-14">
        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <article className="rounded-4xl border border-zinc-200/80 bg-white/92 p-8 shadow-sm sm:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-orange-700">
              Personal journey
            </p>
            <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight text-zinc-950 sm:text-5xl lg:text-6xl">
              Realistic support for people who do not see themselves in polished
              fitness culture.
            </h1>
            <div className="mt-6 max-w-3xl space-y-4 text-base leading-8 text-zinc-700">
              <p>
                I am not a coach or athlete. I am documenting my own weight-loss
                journey from 203 kg and building a community for people who want
                realistic, beginner-friendly support.
              </p>
              <p>
                After almost 6 months, I reached 161 kg. The numbers matter, but
                the bigger point is that progress does not need to look polished
                to be real.
              </p>
              <p>
                This page is where the project starts. It brings the core
                context, the current position, and the journal side of the
                journey together in one place.
              </p>
            </div>
          </article>

          <aside className="rounded-4xl border border-zinc-200/80 bg-zinc-950 p-8 text-zinc-50 shadow-sm sm:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-orange-300">
              Snapshot
            </p>
            <dl className="mt-6 space-y-5">
              <div>
                <dt className="text-sm text-zinc-400">Starting point</dt>
                <dd className="mt-1 text-3xl font-semibold">203 kg</dd>
              </div>
              <div>
                <dt className="text-sm text-zinc-400">Current known point</dt>
                <dd className="mt-1 text-3xl font-semibold">161 kg</dd>
              </div>
              <div>
                <dt className="text-sm text-zinc-400">Timeframe</dt>
                <dd className="mt-1 text-3xl font-semibold">Almost 6 months</dd>
              </div>
            </dl>
            <ul className="mt-8 space-y-3 text-sm leading-7 text-zinc-200">
              {guardrails.map((item) => (
                <li
                  key={item}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                >
                  {item}
                </li>
              ))}
            </ul>
          </aside>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <article className="rounded-4xl border border-zinc-200/80 bg-white/92 p-8 shadow-sm sm:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-zinc-500">
              Why this exists
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950">
              I wanted a place that feels realistic from day one.
            </h2>
            <div className="mt-6 space-y-4 text-base leading-8 text-zinc-700">
              <p>
                A lot of fitness content is built around confidence, experience,
                and polished advice. That can help some people, but it can also
                feel very far away from the reality of starting at a very high
                bodyweight and trying to change your life without pretending it
                is easy.
              </p>
              <p>
                This project is my way of documenting the messy middle. The good
                days matter. The hard days matter too. What worked for me should
                be presented as my experience, not as a rule for everyone else.
              </p>
              <p>
                I want the tone here to stay grounded, beginner-friendly, and
                honest about what is difficult, what is improving, and what still
                needs to be figured out.
              </p>
            </div>
          </article>

          <article className="rounded-4xl border border-amber-200 bg-amber-50/90 p-8 shadow-sm sm:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-800">
              What you will find here
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-amber-950">
              Notes, progress, and practical reflection.
            </h2>
            <ul className="mt-6 space-y-4 text-base leading-8 text-amber-950/90">
              {journalPoints.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-3 h-2.5 w-2.5 rounded-full bg-orange-600" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>
        </section>
      </main>
    </div>
  );
}
