"use client";

import Image from "next/image";
import Link from "next/link";
import { PageShell } from "@/app/_components/PageShell";
import { useLocalizedContent } from "@/app/_components/LocaleProvider";
import { homeCopy } from "@/content/home";

export function HomePageView() {
  const copy = useLocalizedContent(homeCopy);

  return (
    <PageShell>
      {/* ── Open hero — no card box ── */}
      <section className="flex flex-col items-center pt-10 pb-14 text-center sm:pt-14 sm:pb-18">
        <div className="mb-6">
          <Image
            src="/photos/logo/logo-500.png"
            alt="Fat Fitness"
            width={250}
            height={250}
            className="rounded-xl shadow-md"
            priority
          />
        </div>

        <p className="site-kicker">{copy.hero.eyebrow}</p>

        <h1 className="mt-4 max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          {copy.hero.title}
        </h1>

        <p className="site-muted mt-6 max-w-xl text-base leading-8">
          {copy.hero.paragraphs[0]}
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/journal"
            className="rounded-xl bg-foreground px-6 py-2.5 text-sm font-semibold text-background transition hover:opacity-80"
          >
            {copy.cta.journal}
          </Link>
          <Link
            href="/community"
            className="rounded-xl border border-(--color-border) bg-(--color-surface) px-6 py-2.5 text-sm font-semibold text-(--color-muted) shadow-sm transition hover:text-foreground"
          >
            {copy.cta.community}
          </Link>
        </div>
      </section>

      {/* ── Stats strip ── */}
      <section
        aria-label={copy.snapshot.eyebrow}
        className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-(--color-border) bg-(--color-border) sm:grid-cols-4"
      >
        {copy.snapshot.items.map((item) => (
          <div
            key={item.label}
            className="flex flex-col items-center bg-(--color-surface) px-5 py-7 text-center"
          >
            <span className="text-3xl font-bold tracking-tight">{item.value}</span>
            <span className="site-muted mt-2 text-xs uppercase tracking-wider">
              {item.label}
            </span>
          </div>
        ))}
      </section>

      {/* ── Body — editorial text + card ── */}
      <section className="grid gap-10 pt-14 pb-6 lg:grid-cols-[1fr_360px]">
        <article>
          <p className="site-kicker">{copy.why.eyebrow}</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
            {copy.why.title}
          </h2>
          <div className="site-muted mt-5 space-y-4 text-base leading-8">
            {copy.why.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </article>

        <aside className="site-card p-7 lg:self-start">
          <p className="site-kicker">{copy.journal.eyebrow}</p>
          <h2 className="mt-3 text-xl font-semibold tracking-tight">
            {copy.journal.title}
          </h2>
          <ul className="mt-5 space-y-3">
            {copy.journal.points.map((point) => (
              <li key={point} className="flex gap-3 text-sm leading-7">
                <span
                  className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-(--color-accent)"
                  aria-hidden="true"
                />
                <span className="site-muted">{point}</span>
              </li>
            ))}
          </ul>
          <Link href="/journal" className="site-text-link mt-6 inline-block">
            {copy.cta.journal} →
          </Link>
        </aside>
      </section>

      {/* ── Guardrails — numbered editorial grid ── */}
      <div className="mb-8 overflow-hidden rounded-xl border border-(--color-border) bg-(--color-border)">
        <div className="grid grid-cols-1 gap-px sm:grid-cols-2">
          {copy.snapshot.guardrails.map((item, i) => (
            <div
              key={item}
              className="flex items-start gap-4 bg-(--color-surface) px-6 py-5"
            >
              <span className="mt-0.5 min-w-6 shrink-0 text-sm font-black text-(--color-accent)">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="site-muted text-sm leading-6">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
