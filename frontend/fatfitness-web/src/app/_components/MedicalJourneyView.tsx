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

      <div className="site-divider mt-8 flex flex-wrap gap-6 border-t pt-6">
        {copy.medical.summary.map((item) => (
          <div key={item.label}>
            <p className="site-subtle text-xs">{item.label}</p>
            <p className="mt-0.5 text-lg font-semibold">{item.value}</p>
            <p className="site-subtle text-xs">{item.detail}</p>
          </div>
        ))}
      </div>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold tracking-normal">
          {copy.medical.entriesTitle}
        </h2>

        <div className="site-divider mt-6 border-y">
          <table className="w-full table-fixed border-collapse text-center text-xs sm:text-sm">
            <thead className="site-divider border-b site-subtle">
              <tr>
                {copy.medical.tableHeaders.map((header) => (
                  <th key={header} className="px-3 py-3 font-semibold sm:px-4">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="site-divider divide-y site-muted">
              {copy.medical.loggedEntries.map(([mj, date, weight, change]) => (
                <tr key={`${mj}-${date}`}>
                  <td className="px-3 py-3 sm:px-4">{mj}</td>
                  <td className="px-3 py-3 sm:px-4">{date}</td>
                  <td className="px-3 py-3 sm:px-4">{weight}</td>
                  <td className="px-3 py-3">{change}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

    </PageShell>
  );
}
