"use client";

import Link from "next/link";
import { PageShell } from "@/app/_components/PageShell";
import { useLocalizedContent } from "@/app/_components/LocaleProvider";
import { communityCopy } from "@/content/community";

export function CommunityView() {
  const copy = useLocalizedContent(communityCopy);

  return (
    <PageShell className="gap-8">
      <section className="site-card p-8 sm:p-10">
        <div className="grid gap-6 lg:grid-cols-[1fr_18rem] lg:items-end">
          <div>
            <p className="site-kicker">{copy.hero.eyebrow}</p>
            <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              {copy.hero.title}
            </h1>
            <p className="site-muted mt-6 max-w-3xl text-base leading-8">
              {copy.hero.intro}
            </p>
          </div>

          <aside className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
            <p className="site-subtle text-sm font-semibold">
              {copy.forumIndex.statusLabel}
            </p>
            <p className="site-muted mt-2 text-sm leading-6">
              {copy.forumIndex.statusText}
            </p>
            <Link href="/community/guidelines" className="site-text-link mt-4">
              {copy.forumIndex.guidelinesLabel}
            </Link>
          </aside>
        </div>
      </section>

      <section className="site-card overflow-hidden">
        <div className="site-divider border-b p-5 sm:p-6">
          <p className="site-kicker">{copy.categories.eyebrow}</p>
          <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_20rem] lg:items-end">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight">
                {copy.categories.title}
              </h2>
              <p className="site-muted mt-2 text-sm leading-7">
                {copy.categories.intro}
              </p>
            </div>
            <div className="site-subtle hidden grid-cols-[5rem_5rem_1fr] gap-4 text-sm font-semibold md:grid">
              <span>{copy.forumIndex.headers.topics}</span>
              <span>{copy.forumIndex.headers.replies}</span>
              <span>{copy.forumIndex.headers.latest}</span>
            </div>
          </div>
        </div>

        <div>
          {copy.forumIndex.groups.map((group) => (
            <section key={group.title}>
              <div className="border-b border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-3 sm:px-6">
                <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                  {group.title}
                </h3>
              </div>

              {group.slugs.map((slug) => {
                const board = copy.categories.items.find(
                  (category) => category.slug === slug,
                );

                if (!board) {
                  return null;
                }

                return (
                  <Link
                    key={board.slug}
                    href={`/community/categories/${board.slug}`}
                    className="site-divider grid gap-4 border-b p-5 transition hover:bg-[var(--color-surface)] sm:p-6 md:grid-cols-[1fr_20rem] md:items-center"
                  >
                    <div>
                      <h4 className="text-xl font-semibold">{board.name}</h4>
                      <p className="site-muted mt-2 max-w-2xl text-sm leading-7">
                        {board.description}
                      </p>
                    </div>

                    <dl className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <dt className="site-subtle md:hidden">
                          {copy.forumIndex.headers.topics}
                        </dt>
                        <dd className="mt-1 font-semibold md:mt-0">0</dd>
                      </div>
                      <div>
                        <dt className="site-subtle md:hidden">
                          {copy.forumIndex.headers.replies}
                        </dt>
                        <dd className="mt-1 font-semibold md:mt-0">0</dd>
                      </div>
                      <div>
                        <dt className="site-subtle md:hidden">
                          {copy.forumIndex.headers.latest}
                        </dt>
                        <dd className="site-muted mt-1 md:mt-0">
                          {copy.forumIndex.latestEmpty}
                        </dd>
                      </div>
                    </dl>
                  </Link>
                );
              })}
            </section>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
