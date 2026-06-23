"use client";

import Link from "next/link";
import {
  useEffect,
  useState,
  useTransition,
  type FormEvent,
} from "react";
import { useAuth } from "@/app/_components/AuthProvider";
import { formatForumPostDate } from "@/app/_components/CommunityForumPosts";
import {
  useLocale,
  useLocalizedContent,
} from "@/app/_components/LocaleProvider";
import { communityCopy } from "@/content/community";
import {
  ApiError,
  createForumComment,
  getForumComments,
  likeForumComment,
  reportForumComment,
} from "@/lib/api";
import type { ForumComment } from "@/types/community";

type LoadState = "idle" | "loading" | "success" | "error";

type CommunityCommentsProps = {
  postId: string;
  locked: boolean;
};

type CommunityCommentComposerProps = {
  postId: string;
  locked: boolean;
  onCreated: (comment: ForumComment) => void;
};

type CommunityCommentItemProps = {
  comment: ForumComment;
  locale: string;
};

type CommunityCommentReportFormProps = {
  commentId: string;
  onCancel: () => void;
};

function errorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError) {
    return error.message || fallback;
  }

  if (error instanceof Error) {
    return error.message || fallback;
  }

  return fallback;
}

function formValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function formChecked(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

export function CommunityComments({ postId, locked }: CommunityCommentsProps) {
  const copy = useLocalizedContent(communityCopy);
  const { locale } = useLocale();
  const { accessToken } = useAuth();
  const [comments, setComments] = useState<ForumComment[]>([]);
  const [status, setStatus] = useState<LoadState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, startRefreshing] = useTransition();

  async function refresh() {
    setStatus("loading");
    setError(null);

    try {
      const nextComments = await getForumComments(
        { postId, limit: 100 },
        accessToken ?? undefined,
      );
      setComments(nextComments);
      setStatus("success");
    } catch (caughtError) {
      setError(errorMessage(caughtError, copy.comments.formErrorFallback));
      setStatus("error");
    }
  }

  useEffect(() => {
    let isActive = true;

    async function loadComments() {
      setStatus("loading");
      setError(null);

      try {
        const nextComments = await getForumComments(
          { postId, limit: 100 },
          accessToken ?? undefined,
        );

        if (!isActive) {
          return;
        }

        setComments(nextComments);
        setStatus("success");
      } catch (caughtError) {
        if (!isActive) {
          return;
        }

        setError(errorMessage(caughtError, copy.comments.formErrorFallback));
        setStatus("error");
      }
    }

    loadComments();

    return () => {
      isActive = false;
    };
  }, [accessToken, copy.comments.formErrorFallback, postId]);

  return (
    <section className="site-card overflow-hidden">
      <header className="site-divider border-b p-5 sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="site-kicker">{copy.comments.eyebrow}</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">
              {copy.comments.title}
            </h2>
          </div>
          <p className="rounded-full border border-(--color-border) bg-(--color-surface) px-4 py-2 text-sm font-semibold text-(--color-muted)">
            {status === "success" ? comments.length : "..."}
          </p>
        </div>
        <p className="site-muted mt-3 max-w-3xl text-sm leading-7">
          {copy.comments.intro}
        </p>
      </header>

      {status === "loading" ? (
        <div className="p-8 text-center sm:p-12" aria-live="polite">
          <p className="site-muted text-sm font-semibold">
            {copy.comments.loading}
          </p>
        </div>
      ) : null}

      {status === "error" ? (
        <div className="p-8 text-center sm:p-12">
          <h3 className="text-2xl font-semibold">{copy.comments.errorTitle}</h3>
          <p className="site-muted mx-auto mt-3 max-w-xl text-sm leading-7">
            {error ?? copy.comments.formErrorFallback}
          </p>
          <button
            type="button"
            disabled={isRefreshing}
            onClick={() => {
              startRefreshing(() => {
                void refresh();
              });
            }}
            className="mt-5 min-h-11 rounded-full border border-(--color-border) bg-foreground px-5 text-sm font-semibold text-background transition hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
          >
            {isRefreshing
              ? copy.comments.retryPendingLabel
              : copy.comments.retryLabel}
          </button>
        </div>
      ) : null}

      {status === "success" && comments.length === 0 ? (
        <div className="p-8 text-center sm:p-12">
          <h3 className="text-2xl font-semibold">
            {copy.comments.emptyTitle}
          </h3>
          <p className="site-muted mx-auto mt-3 max-w-xl text-sm leading-7">
            {copy.comments.emptyText}
          </p>
        </div>
      ) : null}

      {status === "success" && comments.length > 0 ? (
        <div className="divide-y divide-(--color-border)">
          {comments.map((comment) => (
            <CommunityCommentItem
              key={comment.id}
              comment={comment}
              locale={locale}
            />
          ))}
        </div>
      ) : null}

      <CommunityCommentComposer
        postId={postId}
        locked={locked}
        onCreated={(comment) => {
          setComments((currentComments) => [...currentComments, comment]);
          setStatus("success");
        }}
      />
    </section>
  );
}

function CommunityCommentItem({
  comment,
  locale,
}: CommunityCommentItemProps) {
  const copy = useLocalizedContent(communityCopy);
  const { accessToken } = useAuth();
  const [isReporting, setIsReporting] = useState(false);
  const [localLikeCount, setLocalLikeCount] = useState(comment.likeCount);
  const [localLiked, setLocalLiked] = useState(comment.likedByCurrentUser);
  const [isLiking, setIsLiking] = useState(false);

  async function handleLike() {
    if (!accessToken || isLiking) return;
    setIsLiking(true);
    try {
      const result = await likeForumComment(comment.id, accessToken);
      setLocalLiked(result.liked);
      setLocalLikeCount(result.likeCount);
    } catch {
      // keep current state on failure
    } finally {
      setIsLiking(false);
    }
  }

  return (
    <article className="p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-(--color-subtle)">
          <span>
            {copy.comments.postedByLabel} {comment.authorDisplayName}
          </span>
          <span aria-hidden="true">/</span>
          <time dateTime={comment.createdAt}>
            {formatForumPostDate(comment.createdAt, locale)}
          </time>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={isLiking || !accessToken}
            onClick={() => void handleLike()}
            className={
              localLiked
                ? "min-h-10 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 text-xs font-semibold text-blue-700 transition dark:text-blue-200"
                : "min-h-10 rounded-full border border-(--color-border) bg-(--color-surface) px-4 text-xs font-semibold text-(--color-muted) transition hover:border-(--color-border-strong) hover:text-foreground disabled:cursor-default"
            }
          >
            {localLiked
              ? copy.interactions.likedLabel
              : copy.interactions.likeLabel}
            {localLikeCount > 0 ? ` · ${localLikeCount}` : null}
          </button>
          <button
            type="button"
            aria-expanded={isReporting}
            onClick={() => {
              setIsReporting((currentValue) => !currentValue);
            }}
            className="min-h-10 rounded-full border border-(--color-border) bg-(--color-surface) px-4 text-xs font-semibold text-(--color-muted) transition hover:border-(--color-border-strong) hover:text-foreground"
          >
            {isReporting
              ? copy.comments.cancelReportLabel
              : copy.comments.reportLabel}
          </button>
        </div>
      </div>

      <p className="mt-4 whitespace-pre-wrap text-base leading-8">
        {comment.body}
      </p>

      {isReporting ? (
        <CommunityCommentReportForm
          commentId={comment.id}
          onCancel={() => {
            setIsReporting(false);
          }}
        />
      ) : null}
    </article>
  );
}

function CommunityCommentComposer({
  postId,
  locked,
  onCreated,
}: CommunityCommentComposerProps) {
  const copy = useLocalizedContent(communityCopy);
  const { status, accessToken } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const bodyId = `forum-comment-body-${postId}`;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const acceptedCommunityGuidelines = formChecked(
      formData,
      "forum-comment-guidelines",
    );

    setFormError(null);
    setSuccessMessage(null);

    if (!accessToken) {
      setFormError(copy.comments.signInRequiredError);
      return;
    }

    if (!acceptedCommunityGuidelines) {
      setFormError(copy.comments.guidelinesRequiredError);
      return;
    }

    setIsSubmitting(true);

    void createForumComment(
      postId,
      {
        body: formValue(formData, "forum-comment-body"),
        acceptedCommunityGuidelines,
      },
      accessToken,
    )
      .then((comment) => {
        form.reset();
        onCreated(comment);
        setSuccessMessage(copy.comments.createSuccessText);
      })
      .catch((caughtError) => {
        setFormError(errorMessage(caughtError, copy.comments.formErrorFallback));
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  }

  if (locked) {
    return (
      <aside className="site-divider border-t bg-(--color-surface) p-5 sm:p-6">
        <p className="site-kicker">{copy.comments.createTitle}</p>
        <h3 className="mt-3 text-2xl font-semibold">
          {copy.comments.lockedTitle}
        </h3>
        <p className="site-muted mt-3 text-sm leading-7">
          {copy.comments.lockedText}
        </p>
      </aside>
    );
  }

  if (status === "checking") {
    return (
      <aside
        className="site-divider border-t bg-(--color-surface) p-5 sm:p-6"
        aria-live="polite"
      >
        <p className="site-kicker">{copy.comments.createTitle}</p>
        <p className="site-muted mt-4 text-sm leading-7">
          {copy.comments.checkingSession}
        </p>
      </aside>
    );
  }

  if (!accessToken) {
    return (
      <aside className="site-divider border-t bg-(--color-surface) p-5 sm:p-6">
        <p className="site-kicker">{copy.comments.createTitle}</p>
        <h3 className="mt-3 text-2xl font-semibold">
          {copy.comments.signInTitle}
        </h3>
        <p className="site-muted mt-3 text-sm leading-7">
          {copy.comments.signInText}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/login"
            className="min-h-11 rounded-full border border-(--color-border) bg-foreground px-5 py-3 text-sm font-semibold text-background transition hover:opacity-90"
          >
            {copy.comments.signInLabel}
          </Link>
          <Link
            href="/register"
            className="min-h-11 rounded-full border border-(--color-border) bg-background px-5 py-3 text-sm font-semibold text-foreground transition hover:border-(--color-border-strong)"
          >
            {copy.comments.registerLabel}
          </Link>
        </div>
      </aside>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="site-divider border-t bg-(--color-surface) p-5 sm:p-6"
    >
      <p className="site-kicker">{copy.comments.createTitle}</p>
      <p className="site-muted mt-3 text-sm leading-7">
        {copy.comments.createIntro}
      </p>

      <div className="mt-6 space-y-5">
        <div>
          <label
            htmlFor={bodyId}
            className="text-sm font-semibold text-foreground"
          >
            {copy.comments.bodyLabel}
          </label>
          <textarea
            id={bodyId}
            name="forum-comment-body"
            required
            minLength={2}
            maxLength={6000}
            rows={5}
            placeholder={copy.comments.bodyPlaceholder}
            className="mt-2 w-full rounded-2xl border border-(--color-border) bg-background px-4 py-3 text-base leading-7 text-foreground outline-none transition placeholder:text-(--color-subtle) focus:border-(--color-accent)"
          />
        </div>

        <label className="flex gap-3 rounded-2xl border border-(--color-border) bg-background p-4 text-sm leading-6 text-(--color-muted)">
          <input
            type="checkbox"
            name="forum-comment-guidelines"
            className="mt-1 h-4 w-4 rounded border-(--color-border) accent-(--color-accent)"
          />
          <span>{copy.comments.guidelinesLabel}</span>
        </label>

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
            <p className="font-semibold">{copy.comments.createSuccessTitle}</p>
            <p className="mt-1">{successMessage}</p>
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="min-h-12 w-full rounded-full border border-(--color-border) bg-foreground px-5 text-sm font-semibold text-background transition hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
        >
          {isSubmitting
            ? copy.comments.submitPendingLabel
            : copy.comments.submitLabel}
        </button>
      </div>
    </form>
  );
}

function CommunityCommentReportForm({
  commentId,
  onCancel,
}: CommunityCommentReportFormProps) {
  const copy = useLocalizedContent(communityCopy);
  const { status, accessToken } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const reasonId = `forum-comment-report-reason-${commentId}`;
  const detailsId = `forum-comment-report-details-${commentId}`;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!accessToken) {
      setFormError(copy.commentReports.signInRequiredError);
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);
    const reason = formValue(formData, "forum-comment-report-reason");
    const details = formValue(formData, "forum-comment-report-details");

    setFormError(null);
    setSuccessMessage(null);

    if (!reason) {
      setFormError(copy.commentReports.reasonRequiredError);
      return;
    }

    setIsSubmitting(true);

    void reportForumComment(
      commentId,
      {
        reason,
        details: details || undefined,
      },
      accessToken,
    )
      .then(() => {
        form.reset();
        setSuccessMessage(copy.commentReports.successText);
      })
      .catch((caughtError) => {
        setFormError(
          errorMessage(caughtError, copy.commentReports.errorFallback),
        );
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  }

  if (status === "checking") {
    return (
      <div
        className="mt-5 rounded-3xl border border-(--color-border) bg-(--color-surface) p-5"
        aria-live="polite"
      >
        <p className="site-kicker">{copy.commentReports.eyebrow}</p>
        <p className="site-muted mt-3 text-sm leading-7">
          {copy.commentReports.checkingSession}
        </p>
      </div>
    );
  }

  if (!accessToken) {
    return (
      <div className="mt-5 rounded-3xl border border-(--color-border) bg-(--color-surface) p-5">
        <p className="site-kicker">{copy.commentReports.eyebrow}</p>
        <h3 className="mt-3 text-xl font-semibold">
          {copy.commentReports.signInTitle}
        </h3>
        <p className="site-muted mt-3 text-sm leading-7">
          {copy.commentReports.signInText}
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/login"
            className="min-h-11 rounded-full border border-(--color-border) bg-foreground px-5 py-3 text-sm font-semibold text-background transition hover:opacity-90"
          >
            {copy.commentReports.signInLabel}
          </Link>
          <Link
            href="/register"
            className="min-h-11 rounded-full border border-(--color-border) bg-background px-5 py-3 text-sm font-semibold text-foreground transition hover:border-(--color-border-strong)"
          >
            {copy.commentReports.registerLabel}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-5 rounded-3xl border border-(--color-border) bg-(--color-surface) p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="site-kicker">{copy.commentReports.eyebrow}</p>
          <h3 className="mt-3 text-xl font-semibold">
            {copy.commentReports.title}
          </h3>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="min-h-10 rounded-full border border-(--color-border) bg-background px-4 text-xs font-semibold text-(--color-muted) transition hover:border-(--color-border-strong) hover:text-foreground"
        >
          {copy.comments.cancelReportLabel}
        </button>
      </div>
      <p className="site-muted mt-3 text-sm leading-7">
        {copy.commentReports.intro}
      </p>

      <div className="mt-5 space-y-5">
        <div>
          <label
            htmlFor={reasonId}
            className="text-sm font-semibold text-foreground"
          >
            {copy.commentReports.reasonLabel}
          </label>
          <select
            id={reasonId}
            name="forum-comment-report-reason"
            required
            defaultValue=""
            className="mt-2 min-h-12 w-full rounded-2xl border border-(--color-border) bg-background px-4 text-base text-foreground outline-none transition focus:border-(--color-accent)"
          >
            <option value="" disabled>
              {copy.commentReports.reasonPlaceholder}
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
            htmlFor={detailsId}
            className="text-sm font-semibold text-foreground"
          >
            {copy.commentReports.detailsLabel}
          </label>
          <textarea
            id={detailsId}
            name="forum-comment-report-details"
            maxLength={1000}
            rows={4}
            placeholder={copy.commentReports.detailsPlaceholder}
            className="mt-2 w-full rounded-2xl border border-(--color-border) bg-background px-4 py-3 text-base leading-7 text-foreground outline-none transition placeholder:text-(--color-subtle) focus:border-(--color-accent)"
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
            <p className="font-semibold">{copy.commentReports.successTitle}</p>
            <p className="mt-1">{successMessage}</p>
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="min-h-12 w-full rounded-full border border-(--color-border) bg-foreground px-5 text-sm font-semibold text-background transition hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
        >
          {isSubmitting
            ? copy.commentReports.submitPendingLabel
            : copy.commentReports.submitLabel}
        </button>
      </div>
    </form>
  );
}
