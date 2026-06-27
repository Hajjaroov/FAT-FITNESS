"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { PageShell } from "@/app/_components/PageShell";
import { useLocalizedContent } from "@/app/_components/LocaleProvider";
import { authCopy } from "@/content/auth";
import { ApiError, verifyEmail } from "@/lib/api";

type VerifyState =
  | { kind: "verifying" }
  | { kind: "success" }
  | { kind: "error"; message: string };

export function VerifyEmailView() {
  const copy = useLocalizedContent(authCopy).verifyEmail;
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [state, setState] = useState<VerifyState>(
    token ? { kind: "verifying" } : { kind: "error", message: copy.missingTokenText },
  );

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    verifyEmail(token)
      .then(() => {
        if (!cancelled) setState({ kind: "success" });
      })
      .catch((error) => {
        if (cancelled) return;
        if (error instanceof ApiError && error.status === 400) {
          setState({ kind: "error", message: copy.expiredText });
        } else {
          setState({ kind: "error", message: copy.fallbackErrorText });
        }
      });

    return () => {
      cancelled = true;
    };
  // copy strings are stable per render — token is the real dependency
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <PageShell className="gap-8">
      <section className="mx-auto w-full max-w-lg">
        <article className="site-card p-8 sm:p-10">
          <p className="site-kicker">{copy.eyebrow}</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            {copy.title}
          </h1>

          <div className="mt-8">
            {state.kind === "verifying" ? (
              <p className="site-muted text-sm leading-7">{copy.verifyingText}</p>
            ) : null}

            {state.kind === "success" ? (
              <div
                role="status"
                className="rounded-xl border border-emerald-200 bg-emerald-100 p-5 dark:border-emerald-500/30 dark:bg-emerald-500/15"
              >
                <p className="font-semibold text-emerald-800 dark:text-emerald-300">
                  {copy.successTitle}
                </p>
                <p className="mt-2 text-sm leading-7 text-emerald-800 dark:text-emerald-300">
                  {copy.successText}
                </p>
                <Link
                  href="/login"
                  className="mt-5 inline-flex min-h-11 items-center rounded-xl border border-(--color-border) bg-foreground px-5 text-sm font-semibold text-background transition hover:opacity-90"
                >
                  {copy.signInLabel}
                </Link>
              </div>
            ) : null}

            {state.kind === "error" ? (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-100 p-5 dark:border-red-500/30 dark:bg-red-500/15"
              >
                <p className="font-semibold text-red-800 dark:text-red-300">
                  {copy.errorTitle}
                </p>
                <p className="mt-2 text-sm leading-7 text-red-800 dark:text-red-300">
                  {state.message}
                </p>
              </div>
            ) : null}
          </div>
        </article>
      </section>
    </PageShell>
  );
}
