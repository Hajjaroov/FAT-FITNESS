"use client";

import Link from "next/link";
import { PageShell } from "@/app/_components/PageShell";
import { useLocalizedContent } from "@/app/_components/LocaleProvider";
import { learnCopy } from "@/content/journal";
import { siteCopy } from "@/content/site";

export function MedicalJourneyView() {
  const copy = useLocalizedContent(learnCopy);
  const site = useLocalizedContent(siteCopy);

  return (
    <PageShell>
      <Link href="/journal" className="site-text-link mb-8">
        {site.links.backToJournal}
      </Link>

      <section className="max-w-3xl">
        <p className="site-kicker">{copy.medical.eyebrow}</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-normal sm:text-5xl">
          {copy.medical.title}
        </h1>
        <p className="site-muted mt-6 text-base leading-8">
          {copy.medical.intro}
        </p>
      </section>

      <section className="site-divider mt-12 border-y">
        <div className="grid gap-0 sm:grid-cols-3">
          {copy.medical.summary.map((item) => (
            <div
              key={item.label}
              className="site-divider border-b py-5 sm:border-b-0 sm:border-r sm:last:border-r-0"
            >
              <p className="site-subtle text-sm">{item.label}</p>
              <p className="mt-1 text-2xl font-semibold">{item.value}</p>
              <p className="site-subtle mt-1 text-sm">{item.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <div className="grid gap-4 lg:grid-cols-[0.75fr_1.25fr]">
          <h2 className="text-2xl font-semibold tracking-normal">
            {copy.medical.entriesTitle}
          </h2>
          <p className="site-muted text-sm leading-7">
            {copy.medical.entriesIntro}
          </p>
        </div>

        <div className="site-divider mt-6 overflow-x-auto border-y">
          <table className="w-full min-w-160 border-collapse text-left text-sm">
            <thead className="site-divider border-b site-subtle">
              <tr>
                {copy.medical.tableHeaders.map((header) => (
                  <th key={header} className="py-3 pr-4 font-semibold">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="site-divider divide-y site-muted">
              {copy.medical.loggedEntries.map(([mj, date, weight, change]) => (
                <tr key={`${mj}-${date}`}>
                  <td className="py-3 pr-4">{mj}</td>
                  <td className="py-3 pr-4">{date}</td>
                  <td className="py-3 pr-4">{weight}</td>
                  <td className="py-3 pr-4">{change}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

    </PageShell>
  );
}
