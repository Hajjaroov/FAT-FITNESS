import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Journey | Fat Fitness Community",
  description:
    "A personal weight-loss journey from 203 kg, built around realistic beginner-friendly support.",
};

const reflections = [
  {
    title: "Starting from a very high weight changes everything",
    body: "I started at 203 kg. That means simple advice is not always simple in real life. Walking, consistency, confidence, recovery, and even basic routine all feel different when you are beginning from that point.",
  },
  {
    title: "Fast motivation is not the same as a repeatable life",
    body: "I am trying to build something I can keep doing, not something that looks impressive for two weeks. For me, that means realistic food choices, manageable movement, and honest adjustments when I mess up.",
  },
  {
    title: "The goal is support, not pretending to have answers",
    body: "This project exists because a lot of people need encouragement without being talked down to. I want this space to feel grounded, beginner-friendly, and honest about what is hard.",
  },
];

const boundaries = [
  "I am not a coach or athlete.",
  "This page is personal experience, not medical advice.",
  "Nothing here is a guaranteed method or a plan you are supposed to follow.",
  "For medical decisions, especially around medication, speak with a qualified professional.",
];

const nextSteps = [
  "More written updates over time as the journey continues.",
  "Reflections on habits, training, mindset, and setbacks from a beginner perspective.",
  "A future community space for peer support, not expert coaching.",
  "Photos may come later, but the first version of this page stays focused on words and context.",
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff7ed,_#fafaf9_45%,_#f4f4f5_100%)] text-zinc-950">
      <header className="border-b border-zinc-200/80 bg-white/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
          <span className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-700">
            Fat Fitness
          </span>
          <span className="text-sm text-zinc-500">Journey</span>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 py-12 sm:py-16">
        <section className="grid gap-6 lg:grid-cols-[1.45fr_0.85fr]">
          <div className="rounded-[2rem] border border-zinc-200/80 bg-white/90 p-8 shadow-sm sm:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-orange-700">
              Public journey
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-zinc-950 sm:text-5xl">
              From 203 kg to 161 kg, with a lot still being figured out along
              the way.
            </h1>
            <div className="mt-6 space-y-4 text-base leading-8 text-zinc-700">
              <p>
                I am not a coach or athlete. I am documenting my own weight-loss
                journey and building a space for people who want realistic,
                beginner-friendly support without fake perfection.
              </p>
              <p>
                After almost 6 months, I reached 161 kg. That matters to me, but
                the bigger story is how different this feels from the usual
                before-and-after content online. I am learning in public, trying
                to be honest about what helped, what felt difficult, and what is
                still unfinished.
              </p>
              <p>
                Fat Fitness Community starts with that honesty. This is about
                personal experience, practical reflection, and a style of support
                that feels more human than motivational slogans.
              </p>
            </div>
          </div>

          <aside className="rounded-[2rem] border border-zinc-200/80 bg-zinc-950 p-8 text-zinc-50 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-orange-300">
              Quick context
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
            <p className="mt-6 text-sm leading-7 text-zinc-300">
              GLP-1 has been one personal tool in my own process. I mention it
              because it is part of the truth of my journey, not because I am
              recommending it, explaining how to use it, or telling anyone else
              what to do.
            </p>
          </aside>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          {reflections.map((reflection) => (
            <article
              key={reflection.title}
              className="rounded-[1.75rem] border border-zinc-200/80 bg-white/85 p-7 shadow-sm"
            >
              <h2 className="text-xl font-semibold tracking-tight text-zinc-950">
                {reflection.title}
              </h2>
              <p className="mt-4 text-sm leading-7 text-zinc-700">
                {reflection.body}
              </p>
            </article>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
          <article className="rounded-[2rem] border border-zinc-200/80 bg-white/90 p-8 shadow-sm sm:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-zinc-500">
              Why this exists
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950">
              I wanted a place that feels realistic from day one.
            </h2>
            <div className="mt-6 space-y-4 text-base leading-8 text-zinc-700">
              <p>
                A lot of fitness content is built around confidence, experience,
                and polished advice. That is useful for some people, but it can
                also feel far away from the reality of starting at a very high
                bodyweight and trying to change your life without pretending it
                is easy.
              </p>
              <p>
                This project is my way of documenting the messy middle. The good
                days matter. The hard days matter too. I want the future
                community to be a place where people can talk honestly about
                beginner struggles, GLP-1 experience, routine, setbacks, and
                small wins without being treated like a failure for not being
                perfect.
              </p>
              <p>
                There is still a lot I will add and rewrite over time. This first
                version is here to explain the core story clearly enough that the
                rest of the project has a trustworthy foundation.
              </p>
            </div>
          </article>

          <div className="grid gap-6">
            <article className="rounded-[2rem] border border-amber-200 bg-amber-50/90 p-8 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-800">
                What this is not
              </p>
              <ul className="mt-5 space-y-3 text-sm leading-7 text-amber-950">
                {boundaries.map((boundary) => (
                  <li
                    key={boundary}
                    className="rounded-2xl border border-amber-200/80 bg-white/70 px-4 py-3"
                  >
                    {boundary}
                  </li>
                ))}
              </ul>
            </article>

            <article className="rounded-[2rem] border border-zinc-200/80 bg-white/90 p-8 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-zinc-500">
                What comes later
              </p>
              <ul className="mt-5 space-y-3 text-sm leading-7 text-zinc-700">
                {nextSteps.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-2 h-2 w-2 rounded-full bg-orange-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </section>
      </main>
    </div>
  );
}
