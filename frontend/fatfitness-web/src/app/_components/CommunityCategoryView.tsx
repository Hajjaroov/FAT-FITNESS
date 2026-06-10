"use client";

import Link from "next/link";
import { PageShell } from "@/app/_components/PageShell";
import { useLocalizedContent } from "@/app/_components/LocaleProvider";
import { communityCopy } from "@/content/community";

type CommunityCategoryViewProps = {
  slug: string;
};

export function CommunityCategoryView({ slug }: CommunityCategoryViewProps) {
  const copy = useLocalizedContent(communityCopy);
  const category = copy.categories.items.find((item) => item.slug === slug);

  if (!category) {
    return null;
  }

  return (
    <PageShell className="gap-8">
      <Link href="/community" className="site-text-link">
        {copy.categoryDetail.backLinkLabel}
      </Link>

      <section className="site-card p-8 sm:p-10">
        <div className="grid gap-6 lg:grid-cols-[1fr_20rem] lg:items-end">
          <div>
            <p className="site-kicker">{copy.categories.eyebrow}</p>
            <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              {category.name}
            </h1>
            <p className="site-muted mt-6 max-w-3xl text-base leading-8">
              {category.description}
            </p>
          </div>

          <dl className="grid grid-cols-3 gap-4 rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 text-sm">
            <div>
              <dt className="site-subtle">{copy.categoryDetail.topicsLabel}</dt>
              <dd className="mt-1 text-2xl font-semibold">0</dd>
            </div>
            <div>
              <dt className="site-subtle">{copy.categoryDetail.repliesLabel}</dt>
              <dd className="mt-1 text-2xl font-semibold">0</dd>
            </div>
            <div>
              <dt className="site-subtle">{copy.categoryDetail.latestLabel}</dt>
              <dd className="site-muted mt-2 text-xs leading-5">
                {copy.categoryDetail.statusText}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="site-card overflow-hidden">
        <div className="site-divider border-b p-5 sm:p-6">
          <h2 className="text-3xl font-semibold tracking-tight">
            {copy.categoryDetail.threadsTitle}
          </h2>
        </div>

        <Link
          href="/community/guidelines"
          className="site-divider grid gap-3 border-b p-5 transition hover:bg-[var(--color-surface)] sm:p-6 md:grid-cols-[12rem_1fr]"
        >
          <p className="site-subtle text-sm font-semibold">
            {copy.categoryDetail.pinnedTitle}
          </p>
          <div>
            <h3 className="font-semibold">
              {copy.categoryDetail.pinnedGuidelinesTitle}
            </h3>
            <p className="site-muted mt-2 text-sm leading-7">
              {copy.categoryDetail.pinnedGuidelinesText}
            </p>
          </div>
        </Link>

        <div className="p-8 text-center sm:p-12">
          <h3 className="text-2xl font-semibold">
            {copy.categoryDetail.emptyTitle}
          </h3>
          <p className="site-muted mx-auto mt-3 max-w-xl text-sm leading-7">
            {copy.categoryDetail.emptyText}
          </p>
        </div>
      </section>
    </PageShell>
  );
}
