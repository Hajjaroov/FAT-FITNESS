"use client";

import Link from "next/link";
import { useState } from "react";
import { PageShell } from "@/app/_components/PageShell";
import { useLocalizedContent } from "@/app/_components/LocaleProvider";
import { authCopy } from "@/content/auth";
import { ApiError, forgotPassword } from "@/lib/api";

type FormState =
  | { kind: "idle" }
  | { kind: "pending" }
  | { kind: "success" }
  | { kind: "error"; message: string };

export function ForgotPasswordView() {
  const copy = useLocalizedContent(authCopy).forgotPassword;
  const [email, setEmail] = useState("");
  const [state, setState] = useState<FormState>({ kind: "idle" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (state.kind === "pending") return;
    setState({ kind: "pending" });

    try {
      await forgotPassword({ email: email.trim() });
      setState({ kind: "success" });
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : copy.formErrorFallback;
      setState({ kind: "error", message });
    }
  }

  return (
    <PageShell className="gap-8">
      <section className="mx-auto w-full max-w-lg">
        <article className="site-card p-8 sm:p-10">
          <p className="site-kicker">{copy.eyebrow}</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            {copy.title}
          </h1>
          <p className="site-muted mt-4 text-sm leading-7">{copy.intro}</p>

          <div className="mt-8">
            {state.kind === "success" ? (
              <div
                role="status"
                className="rounded-2xl border border-emerald-200 bg-emerald-100 p-5 dark:border-emerald-500/30 dark:bg-emerald-500/15"
              >
                <p className="font-semibold text-emerald-800 dark:text-emerald-300">
                  {copy.successTitle}
                </p>
                <p className="mt-2 text-sm leading-7 text-emerald-800 dark:text-emerald-300">
                  {copy.successText}
                </p>
                <Link
                  href="/login"
                  className="mt-5 inline-flex min-h-11 items-center rounded-full border border-(--color-border) bg-foreground px-5 text-sm font-semibold text-background transition hover:opacity-90"
                >
                  {copy.backToLogin}
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="forgot-email"
                    className="text-sm font-medium"
                  >
                    {copy.emailLabel}
                  </label>
                  <input
                    id="forgot-email"
                    type="email"
                    autoComplete="email"
                    placeholder={copy.emailPlaceholder}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={state.kind === "pending"}
                    className="site-input"
                  />
                </div>

                {state.kind === "error" ? (
                  <p
                    role="alert"
                    className="rounded-xl border border-red-200 bg-red-100 px-4 py-3 text-sm text-red-800 dark:border-red-500/30 dark:bg-red-500/15 dark:text-red-300"
                  >
                    {state.message}
                  </p>
                ) : null}

                <button
                  type="submit"
                  disabled={state.kind === "pending" || !email.trim()}
                  className="site-btn-primary mt-1"
                >
                  {state.kind === "pending"
                    ? copy.submitPendingLabel
                    : copy.submitLabel}
                </button>

                <Link
                  href="/login"
                  className="text-center text-sm text-foreground/60 hover:text-foreground transition"
                >
                  {copy.backToLogin}
                </Link>
              </form>
            )}
          </div>
        </article>
      </section>
    </PageShell>
  );
}
