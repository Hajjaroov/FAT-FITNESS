"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { PageShell } from "@/app/_components/PageShell";
import { useLocalizedContent } from "@/app/_components/LocaleProvider";
import { authCopy } from "@/content/auth";
import { ApiError, resetPassword } from "@/lib/api";

type FormState =
  | { kind: "idle" }
  | { kind: "pending" }
  | { kind: "success" }
  | { kind: "error"; message: string };

type ResetPasswordCopy = (typeof authCopy)["en"]["resetPassword"];

function resolveErrorMessage(
  error: unknown,
  copy: ResetPasswordCopy,
): string {
  if (error instanceof ApiError) {
    if (error.status === 400) {
      const msg = error.message.toLowerCase();
      if (msg.includes("expired")) return copy.expiredText;
      if (msg.includes("already been used")) return copy.alreadyUsedText;
      if (msg.includes("confirmation")) return copy.passwordMismatchError;
      return copy.fallbackErrorText;
    }
  }
  return copy.fallbackErrorText;
}

export function ResetPasswordView() {
  const copy = useLocalizedContent(authCopy).resetPassword;
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [state, setState] = useState<FormState>(
    token ? { kind: "idle" } : { kind: "error", message: copy.missingTokenText },
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (state.kind === "pending" || !token) return;

    if (newPassword.length < 8) {
      setState({ kind: "error", message: copy.passwordTooShortError });
      return;
    }
    if (newPassword !== confirmPassword) {
      setState({ kind: "error", message: copy.passwordMismatchError });
      return;
    }

    setState({ kind: "pending" });

    try {
      await resetPassword({ token, newPassword, confirmPassword });
      setState({ kind: "success" });
    } catch (error) {
      setState({ kind: "error", message: resolveErrorMessage(error, copy) });
    }
  }

  const isTokenMissing = !token;

  return (
    <PageShell className="gap-8">
      <section className="mx-auto w-full max-w-lg">
        <article className="site-card p-8 sm:p-10">
          <p className="site-kicker">{copy.eyebrow}</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            {copy.title}
          </h1>
          {!isTokenMissing && state.kind !== "success" ? (
            <p className="site-muted mt-4 text-sm leading-7">{copy.intro}</p>
          ) : null}

          <div className="mt-8">
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
            ) : isTokenMissing || (state.kind === "error" && !newPassword && !confirmPassword) ? (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-100 p-5 dark:border-red-500/30 dark:bg-red-500/15"
              >
                <p className="font-semibold text-red-800 dark:text-red-300">
                  {copy.errorTitle}
                </p>
                <p className="mt-2 text-sm leading-7 text-red-800 dark:text-red-300">
                  {isTokenMissing ? copy.missingTokenText : (state as { kind: "error"; message: string }).message}
                </p>
                <Link
                  href="/forgot-password"
                  className="mt-4 inline-block text-sm font-medium text-red-800 underline underline-offset-4 dark:text-red-300"
                >
                  Request a new link
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="reset-new-password" className="text-sm font-medium">
                    {copy.newPasswordLabel}
                  </label>
                  <input
                    id="reset-new-password"
                    type="password"
                    autoComplete="new-password"
                    placeholder={copy.newPasswordPlaceholder}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={8}
                    disabled={state.kind === "pending"}
                    className="site-input"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="reset-confirm-password" className="text-sm font-medium">
                    {copy.confirmPasswordLabel}
                  </label>
                  <input
                    id="reset-confirm-password"
                    type="password"
                    autoComplete="new-password"
                    placeholder={copy.confirmPasswordPlaceholder}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                  disabled={state.kind === "pending" || !newPassword || !confirmPassword}
                  className="site-btn-primary mt-1"
                >
                  {state.kind === "pending"
                    ? copy.submitPendingLabel
                    : copy.submitLabel}
                </button>
              </form>
            )}
          </div>
        </article>
      </section>
    </PageShell>
  );
}
