"use client";

import Link from "next/link";
import { PageShell } from "@/app/_components/PageShell";
import { WeightChart } from "@/app/_components/WeightChart";
import { useLocalizedContent } from "@/app/_components/LocaleProvider";
import { learnCopy } from "@/content/journal";
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

      <section className="site-divider mt-10 border-t pt-8">
        <h2 className="text-lg font-semibold tracking-normal">
          {copy.overview.weightTitle}
        </h2>
        <div className="site-divider mt-4 grid gap-0 border-t sm:grid-cols-3">
          {copy.medical.summary.map((item) => (
            <div
              key={item.label}
              className="site-divider border-b py-4 sm:border-b-0 sm:border-r sm:last:border-r-0 sm:px-4 sm:first:pl-0"
            >
              <p className="site-subtle text-xs">{item.label}</p>
              <p className="mt-1 text-2xl font-semibold">{item.value}</p>
              <p className="site-subtle mt-0.5 text-xs">{item.detail}</p>
            </div>
          ))}
        </div>
        <div className="mt-6">
          <WeightChart entries={copy.medical.loggedEntries} />
        </div>
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

    </PageShell>
  );
}
