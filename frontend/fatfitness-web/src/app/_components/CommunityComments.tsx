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

  useEffect(() => {
    if (!isReporting) return;
    const saved = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = saved;
    };
  }, [isReporting]);

  return (
    <article className="p-5 sm:p-6">
      <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-(--color-subtle)">
        <span>{copy.comments.postedByLabel} {comment.authorDisplayName}</span>
        <span aria-hidden="true">/</span>
        <time dateTime={comment.createdAt}>
          {formatForumPostDate(comment.createdAt, locale)}
        </time>
      </div>

      <p className="mt-3 whitespace-pre-wrap text-base leading-8">{comment.body}</p>

      <div className="mt-4 flex items-center justify-between">
        <button
          type="button"
          disabled={isLiking || !accessToken}
          onClick={() => void handleLike()}
          aria-label={localLiked ? copy.interactions.likedLabel : copy.interactions.likeLabel}
          className={
            localLiked
              ? "flex items-center gap-1.5 text-xs font-semibold text-blue-700 transition dark:text-blue-300"
              : "flex items-center gap-1.5 text-xs text-(--color-muted) transition hover:text-foreground disabled:cursor-default"
          }
        >
          {localLiked ? (
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5 shrink-0" aria-hidden="true">
              <path d="M7.493 18.5c-.425 0-.82-.236-.975-.632A7.48 7.48 0 0 1 6 15.125c0-1.75.599-3.358 1.602-4.634.151-.192.373-.309.6-.397.473-.183.89-.514 1.212-.924a9.042 9.042 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75A.75.75 0 0 1 15 2a2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23h-.952ZM2.062 14.382a12.01 12.01 0 0 0-.18.432c-.057.147-.11.295-.158.444-.05.153-.093.306-.129.46-.038.157-.068.315-.09.474-.024.162-.04.325-.05.488H2.5A6.01 6.01 0 0 0 4 18.5h.493v-4.118Z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3.5 w-3.5 shrink-0" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z" />
            </svg>
          )}
          {localLikeCount > 0 ? <span>{localLikeCount}</span> : null}
        </button>
        {accessToken ? (
          <button
            type="button"
            onClick={() => setIsReporting(true)}
            className="text-xs text-(--color-subtle) transition hover:text-(--color-muted)"
          >
            {copy.comments.reportLabel}
          </button>
        ) : null}
      </div>

      {isReporting ? (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsReporting(false)}
            aria-hidden="true"
          />
          <div className="relative z-10 w-full max-h-[90vh] overflow-y-auto sm:max-w-lg">
            <CommunityCommentReportForm
              commentId={comment.id}
              onCancel={() => setIsReporting(false)}
            />
          </div>
        </div>
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
  const [isOpen, setIsOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const bodyId = `forum-comment-body-${postId}`;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    if (!accessToken) return;

    setFormError(null);
    setIsSubmitting(true);

    void createForumComment(
      postId,
      {
        body: formValue(formData, "forum-comment-body"),
        acceptedCommunityGuidelines: true,
      },
      accessToken,
    )
      .then((comment) => {
        form.reset();
        onCreated(comment);
        setIsOpen(false);
      })
      .catch((caughtError) => {
        setFormError(errorMessage(caughtError, copy.comments.formErrorFallback));
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  }

  const footerClass = "site-divider border-t p-4 sm:p-5";

  if (locked) {
    return (
      <div className={footerClass}>
        <p className="text-xs text-(--color-muted)">
          {copy.comments.lockedTitle} — {copy.comments.lockedText}
        </p>
      </div>
    );
  }

  if (status === "checking") {
    return null;
  }

  if (!accessToken) {
    return (
      <div className={`${footerClass} flex flex-wrap items-center gap-4`}>
        <p className="text-sm text-(--color-muted)">{copy.comments.signInTitle}</p>
        <Link
          href="/login"
          className="min-h-10 rounded-full border border-(--color-border) bg-foreground px-4 text-xs font-semibold text-background transition hover:opacity-90"
        >
          {copy.comments.signInLabel}
        </Link>
      </div>
    );
  }

  if (!isOpen) {
    return (
      <div className={footerClass}>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="w-full cursor-text rounded-2xl border border-(--color-border) bg-(--color-surface) px-4 py-3 text-left text-sm text-(--color-subtle) transition hover:border-(--color-border-strong)"
        >
          {copy.comments.createTitle}…
        </button>
      </div>
    );
  }

  return (
    <div className={footerClass}>
      <form onSubmit={handleSubmit}>
        <textarea
          id={bodyId}
          name="forum-comment-body"
          required
          minLength={2}
          maxLength={6000}
          autoFocus
          rows={4}
          placeholder={copy.comments.bodyPlaceholder}
          className="w-full rounded-2xl border border-(--color-border) bg-background px-4 py-3 text-sm leading-7 text-foreground outline-none transition placeholder:text-(--color-subtle) focus:border-(--color-accent)"
        />

        {formError ? (
          <p
            role="alert"
            className="mt-3 rounded-xl border border-red-200 bg-red-100 p-3 text-xs text-red-800 dark:border-red-500/30 dark:bg-red-500/15 dark:text-red-300"
          >
            {formError}
          </p>
        ) : null}

        <div className="mt-3 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              setFormError(null);
            }}
            className="text-xs text-(--color-muted) transition hover:text-foreground"
          >
            {copy.comments.cancelReportLabel}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="min-h-9 rounded-full border border-(--color-border) bg-foreground px-4 text-xs font-semibold text-background transition hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
          >
            {isSubmitting
              ? copy.comments.submitPendingLabel
              : copy.comments.submitLabel}
          </button>
        </div>
      </form>
    </div>
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
            className="rounded-2xl border border-red-200 bg-red-100 p-4 text-sm leading-6 text-red-800 dark:border-red-500/30 dark:bg-red-500/15 dark:text-red-300"
          >
            {formError}
          </p>
        ) : null}

        {successMessage ? (
          <div
            role="status"
            className="rounded-2xl border border-emerald-200 bg-emerald-100 p-4 text-sm leading-6 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-300"
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
