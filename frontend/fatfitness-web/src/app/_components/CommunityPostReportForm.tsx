"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useAuth } from "@/app/_components/AuthProvider";
import { useLocalizedContent } from "@/app/_components/LocaleProvider";
import { communityCopy } from "@/content/community";
import { ApiError, reportForumPost } from "@/lib/api";

type CommunityPostReportFormProps = {
  postId: string;
};

function formValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
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

export function CommunityPostReportForm({
  postId,
}: CommunityPostReportFormProps) {
  const copy = useLocalizedContent(communityCopy);
  const { status, accessToken } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!accessToken) {
      setFormError(copy.reports.signInRequiredError);
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);
    const reason = formValue(formData, "forum-report-reason");
    const details = formValue(formData, "forum-report-details");

    setFormError(null);
    setSuccessMessage(null);

    if (!reason) {
      setFormError(copy.reports.reasonRequiredError);
      return;
    }

    setIsSubmitting(true);

    void reportForumPost(
      postId,
      {
        reason,
        details: details || undefined,
      },
      accessToken,
    )
      .then(() => {
        form.reset();
        setSuccessMessage(copy.reports.successText);
      })
      .catch((caughtError) => {
        setFormError(errorMessage(caughtError, copy.reports.errorFallback));
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  }

  if (status === "checking") {
    return (
      <aside className="site-card p-6 sm:p-7" aria-live="polite">
        <p className="site-kicker">{copy.reports.eyebrow}</p>
        <p className="site-muted mt-4 text-sm leading-7">
          {copy.reports.checkingSession}
        </p>
      </aside>
    );
  }

  if (!accessToken) {
    return (
      <aside className="site-card p-6 sm:p-7">
        <p className="site-kicker">{copy.reports.eyebrow}</p>
        <h2 className="mt-3 text-2xl font-semibold">
          {copy.reports.signInTitle}
        </h2>
        <p className="site-muted mt-3 text-sm leading-7">
          {copy.reports.signInText}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/login"
            className="min-h-11 rounded-full border border-(--color-border) bg-foreground px-5 py-3 text-sm font-semibold text-background transition hover:opacity-90"
          >
            {copy.reports.signInLabel}
          </Link>
          <Link
            href="/register"
            className="min-h-11 rounded-full border border-(--color-border) bg-(--color-surface) px-5 py-3 text-sm font-semibold text-foreground transition hover:border-(--color-border-strong)"
          >
            {copy.reports.registerLabel}
          </Link>
        </div>
      </aside>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="site-card p-6 sm:p-7">
      <p className="site-kicker">{copy.reports.eyebrow}</p>
      <h2 className="mt-3 text-2xl font-semibold">{copy.reports.title}</h2>
      <p className="site-muted mt-3 text-sm leading-7">
        {copy.reports.intro}
      </p>

      <div className="mt-6 space-y-5">
        <div>
          <label
            htmlFor="forum-report-reason"
            className="text-sm font-semibold text-foreground"
          >
            {copy.reports.reasonLabel}
          </label>
          <select
            id="forum-report-reason"
            name="forum-report-reason"
            required
            defaultValue=""
            className="mt-2 min-h-12 w-full rounded-2xl border border-(--color-border) bg-(--color-surface) px-4 text-base text-foreground outline-none transition focus:border-(--color-accent)"
          >
            <option value="" disabled>
              {copy.reports.reasonPlaceholder}
            </option>
            {copy.reports.reasons.map((reason) => (
              <option key={reason.value} value={reason.value}>
                {reason.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="forum-report-details"
            className="text-sm font-semibold text-foreground"
          >
            {copy.reports.detailsLabel}
          </label>
          <textarea
            id="forum-report-details"
            name="forum-report-details"
            maxLength={1000}
            rows={5}
            placeholder={copy.reports.detailsPlaceholder}
            className="mt-2 w-full rounded-2xl border border-(--color-border) bg-(--color-surface) px-4 py-3 text-base leading-7 text-foreground outline-none transition placeholder:text-(--color-subtle) focus:border-(--color-accent)"
          />
        </div>

        {formError ? (
          <p
            role="alert"
            className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm leading-6 text-red-700 dark:text-red-200"
          >
            {formError}
          </p>
        ) : null}

        {successMessage ? (
          <div
            role="status"
            className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm leading-6 text-emerald-800 dark:text-emerald-200"
          >
            <p className="font-semibold">{copy.reports.successTitle}</p>
            <p className="mt-1">{successMessage}</p>
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="min-h-12 w-full rounded-full border border-(--color-border) bg-foreground px-5 text-sm font-semibold text-background transition hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
        >
          {isSubmitting
            ? copy.reports.submitPendingLabel
            : copy.reports.submitLabel}
        </button>
      </div>
    </form>
  );
}
