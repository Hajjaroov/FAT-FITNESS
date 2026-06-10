"use client";

import Link from "next/link";
import { CountryCombobox } from "@/app/_components/CountryCombobox";
import { PageShell } from "@/app/_components/PageShell";
import { useLocalizedContent } from "@/app/_components/LocaleProvider";
import { authCopy } from "@/content/auth";

type AuthPlaceholderViewProps = {
  mode: "login" | "register";
};

export function AuthPlaceholderView({ mode }: AuthPlaceholderViewProps) {
  const copy = useLocalizedContent(authCopy);
  const page = copy[mode];
  const noteId = `${mode}-disabled-note`;
  const agreementLabel =
    "agreementLabel" in page ? page.agreementLabel : undefined;

  return (
    <PageShell className="gap-8">
      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <article className="site-card p-8 sm:p-10">
          <p className="site-kicker">{page.eyebrow}</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
            {page.title}
          </h1>
          <p className="site-muted mt-6 max-w-2xl text-base leading-8">
            {page.intro}
          </p>

          <div
            id={noteId}
            className="mt-8 rounded-3xl border border-(--color-border) bg-(--color-accent-soft) p-5 text-sm leading-7 text-(--color-muted)"
          >
            <p className="font-semibold text-foreground">
              {copy.shared.unavailableLabel}
            </p>
            <p className="mt-2">{page.disabledNote}</p>
          </div>

          <p className="site-muted mt-6 max-w-2xl text-sm leading-7">
            {copy.shared.privacyLine}
          </p>
        </article>

        <form
          aria-describedby={noteId}
          onSubmit={(event) => event.preventDefault()}
          className="site-card p-8 sm:p-10"
        >
          <div className="mb-7">
            <p className="site-kicker">{page.formTitle}</p>
            <p className="site-muted mt-3 text-sm leading-7">
              {page.formIntro}
            </p>
          </div>

          <div className="space-y-5">
            {page.fields.map((field) => (
              "kind" in field && field.kind === "country" ? (
                <CountryCombobox
                  key={field.id}
                  id={field.id}
                  label={field.label}
                  placeholder={field.placeholder}
                  searchHint={copy.shared.countrySearchHint}
                  noResultsLabel={copy.shared.countryNoResults}
                />
              ) : (
                <div key={field.id}>
                  <label
                    htmlFor={field.id}
                    className="text-sm font-semibold text-foreground"
                  >
                    {field.label}
                  </label>
                  <input
                    id={field.id}
                    name={field.id}
                    type={field.type}
                    autoComplete={field.autoComplete}
                    placeholder={field.placeholder}
                    className="mt-2 min-h-12 w-full rounded-2xl border border-(--color-border) bg-(--color-surface) px-4 text-base text-foreground outline-none transition placeholder:text-(--color-subtle) focus:border-(--color-accent)"
                  />
                </div>
              )
            ))}

            {agreementLabel ? (
              <label className="flex gap-3 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 text-sm leading-6 text-(--color-muted)">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 rounded border-(--color-border) accent-(--color-accent)"
                />
                <span>{agreementLabel}</span>
              </label>
            ) : null}

            <button
              type="button"
              disabled
              className="min-h-12 w-full cursor-not-allowed rounded-full border border-(--color-border) bg-foreground px-5 text-sm font-semibold text-background opacity-60"
            >
              {page.submitLabel}
            </button>
          </div>

          <p className="site-muted mt-6 text-center text-sm leading-7">
            {page.switchPrompt}{" "}
            <Link href={page.switchHref} className="site-text-link">
              {page.switchLabel}
            </Link>
          </p>
        </form>
      </section>
    </PageShell>
  );
}
