import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fat Fitness Community",
  description:
    "A personal weight-loss journey and future peer-support community built around realistic beginner-friendly support.",
};

const principles = [
  {
    title: "Personal experience first",
    body: "This project starts from one real journey, not from pretending to be an expert. Everything here is shaped by lived experience, trial and error, and ongoing learning.",
  },
  {
    title: "Beginner-friendly by design",
    body: "The focus is people starting from zero, starting again, or starting from a very high bodyweight and needing something more realistic than polished fitness content.",
  },
  {
    title: "Support without fake certainty",
    body: "This is not a course, a promise, or a guaranteed method. It is a space being built around honesty, peer support, and progress that feels repeatable in real life.",
  },
];

const journalTopics = [
  {
    title: "Progress updates",
    body: "Short, honest notes about what changed, what felt better, and what still felt hard in normal day-to-day life.",
  },
  {
    title: "What helped",
    body: "Reflections on routine, food, movement, mindset, and the practical adjustments that actually made life easier to manage.",
  },
  {
    title: "What did not work",
    body: "Setbacks, frustrating weeks, bad decisions, and the messy middle that usually gets edited out of fitness content.",
  },
];

const guardrails = [
  "I am not a coach or athlete.",
  "This is personal experience, not medical advice.",
  "Nothing here is a guaranteed method.",
  "GLP-1 is mentioned only as part of my own story.",
];

const communityPoints = [
  "A future peer-support space for realistic, beginner-friendly conversations.",
  "Room for progress logs, setbacks, small wins, and honest questions.",
  "Support without pretending everyone needs the same method.",
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
            <a href="#story" className="transition hover:text-zinc-950">
              Story
            </a>
            <a href="#journal" className="transition hover:text-zinc-950">
              Notes
            </a>
            <a href="#community" className="transition hover:text-zinc-950">
              Community
            </a>
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
                After almost 6 months, I reached 161 kg. The numbers matter, but
                the bigger point is that progress does not need to look polished
                to be real.
              </p>
              <p>
                This landing page is both the introduction and the journal front
                door. There is no need to split the same idea across separate
                About and Blog pages right now.
              </p>
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

        <section id="story" className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
          <article className="rounded-4xl border border-zinc-200/80 bg-white/90 p-8 shadow-sm sm:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-zinc-500">
              The story
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950">
              I wanted a place that feels realistic from day one.
            </h2>
            <div className="mt-6 space-y-4 text-base leading-8 text-zinc-700">
              <p>
                A lot of fitness content is built around confidence, experience,
                and polished advice. That can be useful, but it can also feel far
                away from the reality of starting at a very high bodyweight and
                trying to change your life without pretending it is easy.
              </p>
              <p>
                This project is my way of documenting the messy middle. The good
                days matter. The hard days matter too. I want this space to feel
                grounded, beginner-friendly, and honest about what is hard.
              </p>
              <p>
                The future community is meant to grow from that same tone:
                realistic support, no fake perfection, and no pressure to act
                like everyone starts from the same place.
              </p>
            </div>
          </article>

          <article className="rounded-4xl border border-amber-200 bg-amber-50/90 p-8 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-800">
              Ground rules
            </p>
            <ul className="mt-5 space-y-3 text-sm leading-7 text-amber-950">
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
        </section>

        <section id="journal" className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <article className="rounded-4xl border border-zinc-200/80 bg-white/90 p-8 shadow-sm sm:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-zinc-500">
              Journal on home
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950">
              Updates and reflections belong here for now.
            </h2>
            <div className="mt-6 space-y-4 text-base leading-8 text-zinc-700">
              <p>
                The landing page can carry the journal side of the project
                without needing a second page that says almost the same thing.
              </p>
              <p>
                For now, this is where progress updates, lessons, setbacks, and
                personal reflections belong. If there is enough real content
                later, the structure can grow later too.
              </p>
            </div>
          </article>

          <div className="grid gap-6 md:grid-cols-3">
            {journalTopics.map((topic) => (
              <article
                key={topic.title}
                className="rounded-4xl border border-zinc-200/80 bg-white/90 p-7 shadow-sm"
              >
                <h2 className="text-2xl font-semibold tracking-tight text-zinc-950">
                  {topic.title}
                </h2>
                <p className="mt-4 text-sm leading-7 text-zinc-700">
                  {topic.body}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section id="community" className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <article className="rounded-4xl border border-zinc-200/80 bg-zinc-950 p-8 text-zinc-50 shadow-sm sm:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-orange-300">
              Future community
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">
              Built for peer support, not expert performance.
            </h2>
            <p className="mt-6 text-base leading-8 text-zinc-300">
              The long-term goal is a space where people can share progress,
              beginner struggles, setbacks, small wins, and honest questions
              without being talked down to or sold a perfect method.
            </p>
          </article>

          <div className="grid gap-6 md:grid-cols-3">
            {communityPoints.map((item) => (
              <article
                key={item}
                className="rounded-4xl border border-zinc-200/80 bg-white/90 p-7 shadow-sm"
              >
                <p className="text-sm leading-7 text-zinc-700">{item}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
