"use client";

import { PageShell } from "@/app/_components/PageShell";
import { useLocalizedContent } from "@/app/_components/LocaleProvider";
import { communityCopy } from "@/content/community";

export function CommunityView() {
  const copy = useLocalizedContent(communityCopy);

  return (
    <PageShell className="gap-12">
      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <article className="site-card p-8 sm:p-10">
          <p className="site-kicker">{copy.hero.eyebrow}</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            {copy.hero.title}
          </h1>
          <p className="site-muted mt-6 max-w-3xl text-base leading-8">
            {copy.hero.intro}
          </p>
        </article>

        <aside className="site-panel p-8 sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] opacity-75">
            {copy.hero.shapeLabel}
          </p>
          <div className="mt-6 space-y-4 text-lg leading-8">
            {copy.hero.shapePoints.map((point) => (
              <p key={point}>{point}</p>
            ))}
          </div>
          <p className="mt-8 rounded-2xl border border-current/15 bg-current/5 p-4 text-sm leading-7">
            {copy.hero.note}
          </p>
        </aside>
      </section>

      <section>
        <h2 className="text-3xl font-semibold tracking-tight">
          {copy.distinction.title}
        </h2>
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {copy.distinction.points.map((point, index) => (
            <article key={point.title} className="site-card p-6">
              <p className="site-subtle text-sm font-semibold">
                0{index + 1}
              </p>
              <h3 className="mt-4 text-2xl font-semibold">{point.title}</h3>
              <p className="site-muted mt-4 text-sm leading-7">{point.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="site-divider border-y py-10">
        <div className="grid gap-6 lg:grid-cols-[0.7fr_1.3fr]">
          <div>
            <p className="site-kicker">{copy.categories.eyebrow}</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">
              {copy.categories.title}
            </h2>
            <p className="site-muted mt-4 text-sm leading-7">
              {copy.categories.intro}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {copy.categories.items.map((category, index) => (
              <article
                key={category.name}
                className="site-divider border-b pb-4 sm:border sm:p-5"
              >
                <div className="flex items-start gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-sm font-semibold">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="font-semibold">{category.name}</h3>
                    <p className="site-muted mt-2 text-sm leading-7">
                      {category.description}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <article className="site-callout p-8 sm:p-10">
          <p className="site-kicker">{copy.safety.eyebrow}</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">
            {copy.safety.title}
          </h2>
          <p className="mt-5 text-base leading-8">{copy.safety.intro}</p>
        </article>

        <ul className="site-card divide-y divide-[var(--color-border)] p-3">
          {copy.safety.rules.map((rule) => (
            <li key={rule} className="flex gap-3 p-4 text-sm leading-7">
              <span className="site-dot" />
              <span>{rule}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="site-divider grid gap-6 border-t pt-10 lg:grid-cols-[0.75fr_1.25fr]">
        <div>
          <p className="site-kicker">{copy.roadmap.eyebrow}</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">
            {copy.roadmap.title}
          </h2>
          <p className="site-muted mt-4 text-sm leading-7">
            {copy.roadmap.caution}
          </p>
        </div>
        <ol className="grid gap-3 sm:grid-cols-2">
          {copy.roadmap.items.map((item, index) => (
            <li key={item} className="site-card flex items-center gap-4 p-5">
              <span className="site-subtle text-sm font-semibold">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="font-semibold">{item}</span>
            </li>
          ))}
        </ol>
      </section>
    </PageShell>
  );
}
