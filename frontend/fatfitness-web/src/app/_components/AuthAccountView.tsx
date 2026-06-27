"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { CountryCombobox } from "@/app/_components/CountryCombobox";
import { PageShell } from "@/app/_components/PageShell";
import { useAuth } from "@/app/_components/AuthProvider";
import { useLocalizedContent } from "@/app/_components/LocaleProvider";
import { authCopy } from "@/content/auth";
import { ApiError, registerUser } from "@/lib/api";

type AuthAccountViewProps = {
  mode: "login" | "register";
};

type FormState =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success"; message: string }
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
  const router = useRouter();
  const { status, user, login, logout } = useAuth();
  const [formState, setFormState] = useState<FormState>({ kind: "idle" });
  const agreementLabel =
    "agreementLabel" in page ? page.agreementLabel : undefined;
  const isSubmitting = formState.kind === "submitting";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    setFormState({ kind: "submitting" });

    try {
      if (mode === "login") {
        await login({
          email: formValue(formData, "login-email"),
          password: formValue(formData, "login-password"),
          clientType: "WEB",
          deviceLabel: "Web browser",
        });

        router.push("/community");
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

      await registerUser({
        displayName: formValue(formData, "register-name"),
        email: formValue(formData, "register-email"),
        countryRegionCode,
        password,
        confirmPassword,
        acceptedCommunityRules: acceptedTerms,
        acceptedPrivacyPolicy: acceptedTerms,
      });

      setFormState({ kind: "success", message: page.successText });
    } catch (error) {
      setFormState({
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
            className="mt-8 rounded-xl border border-(--color-border) bg-(--color-accent-soft) p-5 text-sm leading-7 text-(--color-muted)"
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
            <div className="rounded-xl border border-(--color-border) bg-(--color-accent-soft) p-5">
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
                className="mt-5 min-h-12 rounded-xl border border-(--color-border) bg-foreground px-5 text-sm font-semibold text-background transition hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
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
                      className="mt-2 min-h-12 w-full rounded-xl border border-(--color-border) bg-(--color-surface) px-4 text-base text-foreground outline-none transition placeholder:text-(--color-subtle) focus:border-(--color-accent)"
                    />
                  </div>
                ),
              )}

              {agreementLabel ? (
                <label className="flex gap-3 rounded-xl border border-(--color-border) bg-(--color-surface) p-4 text-sm leading-6 text-(--color-muted)">
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
                  className="rounded-xl border border-red-200 bg-red-100 p-4 text-sm leading-6 text-red-800 dark:border-red-500/30 dark:bg-red-500/15 dark:text-red-300"
                >
                  {formState.message}
                </p>
              ) : null}

              {formState.kind === "success" ? (
                <div
                  role="status"
                  className="rounded-xl border border-emerald-200 bg-emerald-100 p-4 text-sm leading-6 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-300"
                >
                  <p className="font-semibold">{page.successTitle}</p>
                  <p className="mt-1">{formState.message}</p>
                </div>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="min-h-12 w-full rounded-xl border border-(--color-border) bg-foreground px-5 text-sm font-semibold text-background transition hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
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

          {mode === "login" ? (
            <p className="mt-3 text-center text-sm text-foreground/50">
              <Link href="/forgot-password" className="hover:text-foreground transition">
                Forgot password?
              </Link>
            </p>
          ) : null}
        </form>
      </section>
    </PageShell>
  );
}
