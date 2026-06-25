"use client";

import Link from "next/link";
import { PageShell } from "@/app/_components/PageShell";
import { useLocalizedContent } from "@/app/_components/LocaleProvider";
import { learnCopy } from "@/content/journal";
import { siteCopy } from "@/content/site";

export function FoodAndDietView() {
  const copy = useLocalizedContent(learnCopy);
  const site = useLocalizedContent(siteCopy);

  return (
    <PageShell>
      <Link href="/journal" className="site-text-link mb-8">
        {site.links.backToJournal}
      </Link>

      <section className="max-w-3xl">
        <p className="site-kicker">{copy.food.eyebrow}</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-normal sm:text-5xl">
          {copy.food.title}
        </h1>
        <p className="site-muted mt-6 text-base leading-8">{copy.food.intro}</p>
      </section>

      <section className="site-divider mt-12 border-y">
        <div className="grid gap-0 sm:grid-cols-4">
          {copy.food.dailyTotals.map((total) => (
            <div
              key={total.label}
              className="site-divider border-b py-5 sm:border-b-0 sm:border-r sm:last:border-r-0"
            >
              <p className="site-subtle text-sm">{total.label}</p>
              <p className="mt-1 text-2xl font-semibold">{total.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold tracking-normal">
          {copy.food.mealsTitle}
        </h2>
        <div className="site-divider mt-6 divide-y border-y">
          {copy.food.meals.map((meal) => (
            <article
              key={meal.name}
              className="grid gap-5 py-7 lg:grid-cols-[0.7fr_1.3fr]"
            >
              <div>
                <h3 className="text-xl font-semibold">{meal.name}</h3>
                <p className="site-muted mt-2 text-sm leading-7">
                  {meal.summary}
                </p>
              </div>
              <ul className="site-muted space-y-2.5 text-sm leading-6">
                {meal.items.map((item) => (
                  <li key={item.label} className="flex items-start gap-3">
                    <span className="site-dot mt-[0.4rem] shrink-0" />
                    <span>
                      <span>{item.label}</span>
                      {item.detail && (
                        <span className="site-subtle mt-0.5 block text-xs">{item.detail}</span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
        {copy.food.weeklyNote && (
          <p className="site-muted mt-6 text-sm leading-7 italic">
            {copy.food.weeklyNote}
          </p>
        )}
      </section>

      <section className="site-divider mt-12 grid gap-8 border-b pb-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <h2 className="text-2xl font-semibold tracking-normal">
            {copy.food.supplementsTitle}
          </h2>
          <p className="site-muted mt-3 text-sm leading-7">
            {copy.food.supplementsIntro}
          </p>
        </div>
        <ul className="site-muted grid gap-3 text-base leading-7 sm:grid-cols-2">
          {copy.food.supplements.map((supplement) => (
            <li
              key={supplement}
              className="site-divider border-b pb-3 last:border-b-0 last:pb-0 sm:nth-last-[-n+2]:border-b-0 sm:nth-last-[-n+2]:pb-0"
            >
              {supplement}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
        <h2 className="text-2xl font-semibold tracking-normal">
          {copy.food.boundariesTitle}
        </h2>
        <ul className="site-muted space-y-3 text-base leading-8">
          {copy.food.boundaries.map((boundary) => (
            <li key={boundary} className="flex gap-3">
              <span className="site-dot bg-foreground" />
              <span>{boundary}</span>
            </li>
          ))}
        </ul>
      </section>
    </PageShell>
  );
}
