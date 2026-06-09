"use client";

import Link from "next/link";
import { PageShell } from "@/app/_components/PageShell";
import { useLocalizedContent } from "@/app/_components/LocaleProvider";
import { learnCopy } from "@/content/learn";
import { siteCopy } from "@/content/site";

export function LearnOverviewView() {
  const copy = useLocalizedContent(learnCopy);
  const site = useLocalizedContent(siteCopy);

  return (
    <PageShell>
      <section className="max-w-3xl">
        <p className="site-kicker">{copy.overview.eyebrow}</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-normal sm:text-5xl">
          {copy.overview.title}
        </h1>
        <p className="site-muted mt-6 text-base leading-8">
          {copy.overview.intro}
        </p>
      </section>

      <section className="site-divider mt-12 border-y">
        {copy.overview.sections.map((section) => (
          <article
            key={section.href}
            className="site-divider grid gap-5 border-b py-8 last:border-b-0 lg:grid-cols-[0.85fr_1.15fr]"
          >
            <div>
              <h2 className="text-2xl font-semibold tracking-normal">
                {section.title}
              </h2>
              <p className="site-muted mt-3 max-w-xl text-sm leading-7">
                {section.summary}
              </p>
            </div>
            <ul className="site-muted space-y-3 text-base leading-8">
              {section.startsWith.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="site-dot" />
                  <span>{item}</span>
                </li>
              ))}
              <li>
                <Link href={section.href} className="site-text-link">
                  {site.links.open} {section.title}
                </Link>
              </li>
            </ul>
          </article>
        ))}
      </section>

      <section className="site-divider mt-10 grid gap-6 border-b pb-10 lg:grid-cols-[0.75fr_1.25fr]">
        <h2 className="text-2xl font-semibold tracking-normal">
          {copy.overview.boundariesTitle}
        </h2>
        <ul className="site-muted space-y-3 text-base leading-8">
          {copy.overview.boundaries.map((boundary) => (
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
