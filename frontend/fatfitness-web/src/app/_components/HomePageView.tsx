"use client";

import { PageShell } from "@/app/_components/PageShell";
import { useLocalizedContent } from "@/app/_components/LocaleProvider";
import { homeCopy } from "@/content/home";

export function HomePageView() {
  const copy = useLocalizedContent(homeCopy);

  return (
    <PageShell className="gap-6 sm:gap-8">
      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <article className="site-card p-8 sm:p-10">
          <p className="site-kicker">{copy.hero.eyebrow}</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            {copy.hero.title}
          </h1>
          <div className="site-muted mt-6 max-w-3xl space-y-4 text-base leading-8">
            {copy.hero.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </article>

        <aside className="site-panel p-8 sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] opacity-75">
            {copy.snapshot.eyebrow}
          </p>
          <dl className="mt-6 space-y-5">
            {copy.snapshot.items.map((item) => (
              <div key={item.label}>
                <dt className="text-sm opacity-65">{item.label}</dt>
                <dd className="mt-1 text-3xl font-semibold">{item.value}</dd>
              </div>
            ))}
          </dl>
          <ul className="mt-8 space-y-3 text-sm leading-7">
            {copy.snapshot.guardrails.map((item) => (
              <li
                key={item}
                className="rounded-2xl border border-current/15 bg-current/5 px-4 py-3"
              >
                {item}
              </li>
            ))}
          </ul>
        </aside>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <article className="site-card p-8 sm:p-10">
          <p className="site-kicker">{copy.why.eyebrow}</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">
            {copy.why.title}
          </h2>
          <div className="site-muted mt-6 space-y-4 text-base leading-8">
            {copy.why.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </article>

        <article className="site-callout p-8 sm:p-10">
          <p className="site-kicker">{copy.journal.eyebrow}</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">
            {copy.journal.title}
          </h2>
          <ul className="mt-6 space-y-4 text-base leading-8">
            {copy.journal.points.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="site-dot" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </PageShell>
  );
}
