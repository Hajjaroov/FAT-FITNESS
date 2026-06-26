"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { PageShell } from "@/app/_components/PageShell";
import { useLocalizedContent } from "@/app/_components/LocaleProvider";
import { learnCopy } from "@/content/journal";
import { siteCopy } from "@/content/site";

type SupplementItem = typeof learnCopy.en.food.supplements[number];

export function FoodAndDietView() {
  const copy = useLocalizedContent(learnCopy);
  const site = useLocalizedContent(siteCopy);
  const [selected, setSelected] = useState<SupplementItem | null>(null);

  useEffect(() => {
    if (!selected) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setSelected(null); };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [selected]);

  return (
    <>
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
        <ul className="site-muted grid text-sm sm:grid-cols-2">
          {copy.food.supplements.map((supplement) => (
            <li
              key={supplement.key}
              className="site-divider border-b last:border-b-0 sm:nth-last-[-n+2]:border-b-0"
            >
              <button
                type="button"
                onClick={() => setSelected(supplement)}
                className="w-full py-3 text-left transition-colors hover:text-foreground"
              >
                {supplement.name}
              </button>
            </li>
          ))}
        </ul>
      </section>

    </PageShell>
    {selected && (
      <div
        className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
        aria-modal="true"
        role="dialog"
        aria-label={selected.name}
      >
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setSelected(null)}
        />
        <div className="relative z-10 w-full max-h-[92vh] overflow-y-auto rounded-t-3xl bg-(--color-surface) shadow-2xl sm:rounded-3xl sm:max-w-lg">
          {/* Photo area */}
          {selected.photoSrc ? (
            <div className="relative flex aspect-4/3 w-full items-center justify-center overflow-hidden rounded-t-3xl bg-(--color-surface-raised) p-6">
              <Image
                src={selected.photoSrc}
                alt={selected.name}
                fill
                className="object-contain p-6"
              />
            </div>
          ) : (
            <div className="relative flex aspect-4/3 items-center justify-center overflow-hidden rounded-t-3xl bg-(--color-surface-raised)">
              <svg
                className="opacity-20"
                width="56"
                height="26"
                viewBox="0 0 56 26"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <rect x="1" y="1" width="54" height="24" rx="12" />
                <line x1="28" y1="1" x2="28" y2="25" />
              </svg>
            </div>
          )}

          {/* Close button */}
          <button
            type="button"
            aria-label="Close"
            onClick={() => setSelected(null)}
            className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/60"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {/* Content */}
          <div className="p-6 sm:p-8">
            <p className="site-kicker">{selected.brand}</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              {selected.name}
            </h2>
            <p className="site-muted mt-4 text-sm leading-7">
              {selected.detail}
            </p>
            {selected.facts.length > 0 && (
              <ul className="mt-6 space-y-2.5">
                {selected.facts.map((fact) => (
                  <li key={fact} className="flex items-start gap-3">
                    <span className="site-dot mt-[0.4rem] shrink-0" />
                    <span className="site-muted text-sm leading-6">{fact}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    )}
    </>
  );
}
