"use client";

import Link from "next/link";
import { PageShell } from "@/app/_components/PageShell";
import { useLocalizedContent } from "@/app/_components/LocaleProvider";
import { communityCopy } from "@/content/community";

export function CommunityGuidelinesView() {
  const copy = useLocalizedContent(communityCopy);
  const guidelines = copy.guidelines;

  return (
    <PageShell className="gap-12">
      <Link href="/community" className="site-text-link">
        {guidelines.backLinkLabel}
      </Link>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <article className="site-card p-8 sm:p-10">
          <p className="site-kicker">{guidelines.hero.eyebrow}</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            {guidelines.hero.title}
          </h1>
          <p className="site-muted mt-6 max-w-3xl text-base leading-8">
            {guidelines.hero.intro}
          </p>
        </article>

        <aside className="site-panel p-8 sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] opacity-75">
            {guidelines.hero.statusLabel}
          </p>
          <p className="mt-6 text-base leading-8">{guidelines.hero.note}</p>
        </aside>
      </section>

      <section>
        <h2 className="text-3xl font-semibold tracking-tight">
          {guidelines.principles.title}
        </h2>
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {guidelines.principles.items.map((item, index) => (
            <article key={item.title} className="site-card p-6">
              <p className="site-subtle text-sm font-semibold">
                0{index + 1}
              </p>
              <h3 className="mt-4 text-2xl font-semibold">{item.title}</h3>
              <p className="site-muted mt-4 text-sm leading-7">{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="site-divider grid gap-8 border-y py-10 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="site-kicker">{guidelines.rules.eyebrow}</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">
            {guidelines.rules.title}
          </h2>
        </div>
        <ul className="site-card divide-y divide-(--color-border) p-3">
          {guidelines.rules.items.map((rule) => (
            <li key={rule} className="flex gap-3 p-4 text-sm leading-7">
              <span className="site-dot" />
              <span>{rule}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <article className="site-callout p-8 sm:p-10">
          <p className="site-kicker">{guidelines.healthTopics.eyebrow}</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">
            {guidelines.healthTopics.title}
          </h2>
          <p className="mt-5 text-base leading-8">
            {guidelines.healthTopics.intro}
          </p>
        </article>

        <div className="space-y-4">
          <h3 className="text-2xl font-semibold">
            {guidelines.healthTopics.examplesTitle}
          </h3>
          {guidelines.healthTopics.examples.map((example) => (
            <article key={example.avoid} className="site-card p-5">
              <p className="site-subtle text-sm font-semibold">
                {guidelines.healthTopics.avoidLabel}
              </p>
              <p className="mt-2 text-sm leading-7">{example.avoid}</p>
              <p className="site-subtle mt-4 text-sm font-semibold">
                {guidelines.healthTopics.preferLabel}
              </p>
              <p className="site-muted mt-2 text-sm leading-7">
                {example.prefer}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="site-divider grid gap-6 border-t pt-10 lg:grid-cols-2">
        <article>
          <h2 className="text-3xl font-semibold tracking-tight">
            {guidelines.moderation.title}
          </h2>
          <p className="site-muted mt-4 text-sm leading-7">
            {guidelines.moderation.intro}
          </p>
          <ul className="site-muted mt-6 space-y-3 text-sm leading-7">
            {guidelines.moderation.items.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="site-dot" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="site-card p-8">
          <h2 className="text-3xl font-semibold tracking-tight">
            {guidelines.posting.title}
          </h2>
          <ul className="site-muted mt-6 space-y-4 text-sm leading-7">
            {guidelines.posting.items.map((item) => (
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
