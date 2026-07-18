"use client";

import { PageShell } from "@/app/_components/PageShell";
import { useLocalizedContent } from "@/app/_components/LocaleProvider";
import { offlineCopy } from "@/content/offline";

export function OfflineView() {
  const copy = useLocalizedContent(offlineCopy);

  return (
    <PageShell className="min-h-[calc(100vh-5rem)] justify-center">
      <section className="site-card w-full max-w-xl p-8 text-center">
        <p className="site-kicker">{copy.eyebrow}</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-normal">{copy.title}</h1>
        <p className="site-muted mt-4 text-sm leading-6">{copy.body}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-6 min-h-11 rounded-xl border border-(--color-border) bg-foreground px-5 text-sm font-semibold text-background transition hover:opacity-90"
        >
          {copy.retryLabel}
        </button>
      </section>
    </PageShell>
  );
}
