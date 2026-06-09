"use client";

import { PageShell } from "@/app/_components/PageShell";
import { useLocalizedContent } from "@/app/_components/LocaleProvider";
import { siteCopy } from "@/content/site";

type PlaceholderPageProps = {
  title: string;
};

export function PlaceholderPage({ title }: PlaceholderPageProps) {
  const copy = useLocalizedContent(siteCopy);

  return (
    <PageShell className="min-h-[calc(100vh-5rem)] justify-center">
      <section className="site-card w-full max-w-xl p-8">
        <p className="site-kicker">{copy.placeholder.eyebrow}</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-normal">{title}</h1>
        <p className="site-muted mt-4 text-sm leading-6">
          {copy.placeholder.body}
        </p>
      </section>
    </PageShell>
  );
}
