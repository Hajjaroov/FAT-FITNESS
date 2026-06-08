import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Fat Fitness Community",
  description:
    "A personal weight-loss journey and future peer-support community built around realistic beginner-friendly support.",
};

const principles = [
  {
    title: "Personal experience first",
    body: "This project starts from one real journey, not from pretending to be an expert. What you read here is shaped by lived experience, trial and error, and ongoing learning.",
  },
  {
    title: "Beginner-friendly by design",
    body: "The goal is to make fitness and weight-loss feel less intimidating for people starting from zero, starting again, or starting from a very high bodyweight.",
  },
  {
    title: "Support without fake certainty",
    body: "This is not a promise, a course, or a guaranteed method. It is a space being built around honesty, peer support, and realistic progress.",
  },
];

const routeCards = [
  {
    href: "/about",
    eyebrow: "Read now",
    title: "Journey",
    body: "The public story so far, including the 203 kg starting point, the current 161 kg point, and what this project is trying to become.",
  },
  {
    href: "/blog",
    eyebrow: "Coming next",
    title: "Blog",
    body: "Future updates, reflections, wins, setbacks, and notes from the journey as it continues over time.",
  },
  {
    href: "/community",
    eyebrow: "Coming later",
    title: "Community",
    body: "A future peer-support space for realistic conversations, beginner struggles, and progress without judgment.",
  },
];

const guardrails = [
  "Not medical advice",
  "Not professional coaching",
  "Not a guaranteed method",
  "Not built around fake perfection",
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fff7ed_0%,#fafaf9_28%,#f4f4f5_100%)] text-zinc-950">
      <header className="border-b border-zinc-200/80 bg-white/75 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <span className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-700">
            Fat Fitness
          </span>
          <nav className="flex items-center gap-4 text-sm text-zinc-600">
            <Link
              href="/about"
              className="transition hover:text-zinc-950"
            >
              Journey
            </Link>
            <Link href="/blog" className="transition hover:text-zinc-950">
              Blog
            </Link>
            <Link
              href="/community"
              className="transition hover:text-zinc-950"
            >
              Community
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10 sm:gap-10 sm:py-14">
        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-4xl border border-zinc-200/80 bg-white/90 p-8 shadow-sm sm:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-orange-700">
              Personal journey and future community
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
                This starts with one honest story. After almost 6 months, I
                reached 161 kg. The numbers matter, but the bigger point is that
                progress does not need to look polished to be real.
              </p>
              <p>
                Fat Fitness Community is being built for people who want a more
                grounded kind of motivation: less hype, less pretending, and more
                room for what the process actually feels like.
              </p>
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/about"
                className="inline-flex items-center justify-center rounded-full bg-zinc-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
              >
                Read the Journey page
              </Link>
              <Link
                href="/blog"
                className="inline-flex items-center justify-center rounded-full border border-zinc-300 bg-white px-6 py-3 text-sm font-semibold text-zinc-900 transition hover:border-zinc-950"
              >
                See what comes next
              </Link>
            </div>
          </div>

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
            <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm leading-7 text-zinc-300">
                GLP-1 is part of my personal story, so it may be mentioned here.
                That is context, not a recommendation, instruction, or medical
                position.
              </p>
            </div>
          </aside>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          {principles.map((principle) => (
            <article
              key={principle.title}
              className="rounded-[1.75rem] border border-zinc-200/80 bg-white/85 p-7 shadow-sm"
            >
              <h2 className="text-xl font-semibold tracking-tight text-zinc-950">
                {principle.title}
              </h2>
              <p className="mt-4 text-sm leading-7 text-zinc-700">
                {principle.body}
              </p>
            </article>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <article className="rounded-4xl border border-amber-200 bg-amber-50/90 p-8 shadow-sm sm:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-800">
              Ground rules
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-amber-950">
              Honest, careful, and beginner-friendly.
            </h2>
            <ul className="mt-6 space-y-3 text-sm leading-7 text-amber-950">
              {guardrails.map((item) => (
                <li
                  key={item}
                  className="rounded-2xl border border-amber-200/80 bg-white/70 px-4 py-3"
                >
                  {item}
                </li>
              ))}
            </ul>
          </article>

          <div className="grid gap-6 md:grid-cols-3">
            {routeCards.map((card) => (
              <Link
                key={card.href}
                href={card.href}
                className="group rounded-4xl border border-zinc-200/80 bg-white/90 p-7 shadow-sm transition hover:-translate-y-1 hover:border-zinc-950"
              >
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-zinc-500">
                  {card.eyebrow}
                </p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-950">
                  {card.title}
                </h2>
                <p className="mt-4 text-sm leading-7 text-zinc-700">
                  {card.body}
                </p>
                <span className="mt-6 inline-flex text-sm font-semibold text-orange-700 transition group-hover:text-zinc-950">
                  Open page
                </span>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
