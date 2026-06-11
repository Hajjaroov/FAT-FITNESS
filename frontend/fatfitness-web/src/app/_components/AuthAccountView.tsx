"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { CountryCombobox } from "@/app/_components/CountryCombobox";
import { PageShell } from "@/app/_components/PageShell";
import { useAuth } from "@/app/_components/AuthProvider";
import { useLocalizedContent } from "@/app/_components/LocaleProvider";
import { authCopy } from "@/content/auth";
import { ApiError, registerUser, verifyEmail } from "@/lib/api";
import type { RegisterResponse } from "@/types/auth";

type AuthAccountViewProps = {
  mode: "login" | "register";
};

type FormState =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success"; message: string }
  | { kind: "error"; message: string };

type VerificationState =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success" }
  | { kind: "error"; message: string };

function formValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function isChecked(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

function errorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError) {
    return error.message || fallback;
  }

  if (error instanceof Error) {
    return error.message || fallback;
  }

  return fallback;
}

function inputMinLength(id: string) {
  if (id.includes("password")) {
    return 8;
  }

  if (id === "register-name") {
    return 2;
  }

  return undefined;
}

export function AuthAccountView({ mode }: AuthAccountViewProps) {
  const copy = useLocalizedContent(authCopy);
  const page = copy[mode];
  const noteId = `${mode}-account-note`;
  const { status, user, login, logout } = useAuth();
  const [formState, setFormState] = useState<FormState>({ kind: "idle" });
  const [registration, setRegistration] = useState<RegisterResponse | null>(null);
  const [verificationState, setVerificationState] = useState<VerificationState>({
    kind: "idle",
  });
  const agreementLabel =
    "agreementLabel" in page ? page.agreementLabel : undefined;
  const isSubmitting = formState.kind === "submitting";
  const isVerifying = verificationState.kind === "submitting";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    setFormState({ kind: "submitting" });
    setVerificationState({ kind: "idle" });

    try {
      if (mode === "login") {
        await login({
          email: formValue(formData, "login-email"),
          password: formValue(formData, "login-password"),
          clientType: "WEB",
          deviceLabel: "Web browser",
        });

        setFormState({ kind: "success", message: page.successText });
        return;
      }

      const countryRegionCode = formValue(formData, "register-country-code");
      const password = formValue(formData, "register-password");
      const confirmPassword = formValue(formData, "register-confirm-password");
      const acceptedTerms = isChecked(formData, "register-agreement");

      if (!countryRegionCode) {
        setFormState({
          kind: "error",
          message: copy.shared.countryRequiredError,
        });
        return;
      }

      if (password !== confirmPassword) {
        setFormState({
          kind: "error",
          message: copy.shared.passwordMismatchError,
        });
        return;
      }

      if (!acceptedTerms) {
        setFormState({
          kind: "error",
          message: copy.shared.agreementRequiredError,
        });
        return;
      }

      const response = await registerUser({
        displayName: formValue(formData, "register-name"),
        email: formValue(formData, "register-email"),
        countryRegionCode,
        password,
        confirmPassword,
        acceptedCommunityRules: acceptedTerms,
        acceptedPrivacyPolicy: acceptedTerms,
      });

      setRegistration(response);
      setFormState({ kind: "success", message: page.successText });
    } catch (error) {
      setFormState({
        kind: "error",
        message: errorMessage(error, copy.shared.formErrorFallback),
      });
    }
  }

  async function handleVerifyDevelopmentToken() {
    if (!registration?.devEmailVerificationToken) {
      return;
    }

    setVerificationState({ kind: "submitting" });

    try {
      await verifyEmail(registration.devEmailVerificationToken);
      setVerificationState({ kind: "success" });
    } catch (error) {
      setVerificationState({
        kind: "error",
        message: errorMessage(error, copy.shared.formErrorFallback),
      });
    }
  }

  async function handleLogout() {
    setFormState({ kind: "submitting" });

    try {
      await logout();
      setFormState({ kind: "idle" });
    } catch (error) {
      setFormState({
        kind: "error",
        message: errorMessage(error, copy.shared.formErrorFallback),
      });
    }
  }

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
            <p className="font-semibold text-foreground">{page.statusLabel}</p>
            <p className="mt-2">{page.statusNote}</p>
            {status === "checking" ? (
              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.2em] text-(--color-subtle)">
                {copy.shared.checkingSession}
              </p>
            ) : null}
          </div>

          <p className="site-muted mt-6 max-w-2xl text-sm leading-7">
            {copy.shared.privacyLine}
          </p>
        </article>

        <form
          aria-describedby={noteId}
          onSubmit={handleSubmit}
          className="site-card p-8 sm:p-10"
        >
          <div className="mb-7">
            <p className="site-kicker">{page.formTitle}</p>
            <p className="site-muted mt-3 text-sm leading-7">
              {page.formIntro}
            </p>
          </div>

          {mode === "login" && user ? (
            <div className="rounded-3xl border border-(--color-border) bg-(--color-accent-soft) p-5">
              <p className="text-sm font-semibold text-foreground">
                {copy.shared.activeSessionLabel}
              </p>
              <p className="site-muted mt-2 text-sm leading-7">
                {copy.shared.signedInAs}{" "}
                <span className="font-semibold text-foreground">
                  {user.displayName}
                </span>{" "}
                ({user.email}).
              </p>
              <p className="site-muted mt-4 text-sm leading-7">
                {page.successText}
              </p>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleLogout}
                className="mt-5 min-h-12 rounded-full border border-(--color-border) bg-foreground px-5 text-sm font-semibold text-background transition hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
              >
                {isSubmitting
                  ? copy.shared.logoutPendingLabel
                  : copy.shared.logoutLabel}
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {page.fields.map((field) =>
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
                      required
                      minLength={inputMinLength(field.id)}
                      className="mt-2 min-h-12 w-full rounded-2xl border border-(--color-border) bg-(--color-surface) px-4 text-base text-foreground outline-none transition placeholder:text-(--color-subtle) focus:border-(--color-accent)"
                    />
                  </div>
                ),
              )}

              {agreementLabel ? (
                <label className="flex gap-3 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 text-sm leading-6 text-(--color-muted)">
                  <input
                    type="checkbox"
                    name="register-agreement"
                    className="mt-1 h-4 w-4 rounded border-(--color-border) accent-(--color-accent)"
                  />
                  <span>{agreementLabel}</span>
                </label>
              ) : null}

              {formState.kind === "error" ? (
                <p
                  role="alert"
                  className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm leading-6 text-red-700 dark:text-red-200"
                >
                  {formState.message}
                </p>
              ) : null}

              {formState.kind === "success" ? (
                <div
                  role="status"
                  className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm leading-6 text-emerald-800 dark:text-emerald-200"
                >
                  <p className="font-semibold">{page.successTitle}</p>
                  <p className="mt-1">{formState.message}</p>
                </div>
              ) : null}

              {registration?.devEmailVerificationToken ? (
                <div className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-4">
                  <p className="text-sm font-semibold text-foreground">
                    {copy.shared.devVerificationLabel}
                  </p>
                  <code className="mt-3 block overflow-x-auto rounded-xl bg-(--color-surface-raised) p-3 text-xs text-(--color-muted)">
                    {registration.devEmailVerificationToken}
                  </code>
                  <button
                    type="button"
                    disabled={isVerifying}
                    onClick={handleVerifyDevelopmentToken}
                    className="mt-4 min-h-11 rounded-full border border-(--color-border) bg-foreground px-5 text-sm font-semibold text-background transition hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
                  >
                    {isVerifying
                      ? copy.shared.verifyPendingLabel
                      : copy.shared.verifyDevTokenLabel}
                  </button>

                  {verificationState.kind === "success" ? (
                    <p className="mt-4 text-sm leading-6 text-emerald-800 dark:text-emerald-200">
                      <span className="font-semibold">
                        {copy.shared.verifySuccessTitle}.
                      </span>{" "}
                      {copy.shared.verifySuccessText}
                    </p>
                  ) : null}

                  {verificationState.kind === "error" ? (
                    <p
                      role="alert"
                      className="mt-4 text-sm leading-6 text-red-700 dark:text-red-200"
                    >
                      {verificationState.message}
                    </p>
                  ) : null}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="min-h-12 w-full rounded-full border border-(--color-border) bg-foreground px-5 text-sm font-semibold text-background transition hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
              >
                {isSubmitting ? page.submitPendingLabel : page.submitLabel}
              </button>
            </div>
          )}

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
