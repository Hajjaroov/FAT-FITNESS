"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PageShell } from "@/app/_components/PageShell";
import { useAuth } from "@/app/_components/AuthProvider";
import {
  useLocale,
  useLocalizedContent,
} from "@/app/_components/LocaleProvider";
import { accountCopy } from "@/content/account";
import { getCountryOptions } from "@/content/countries";
import { ApiError, bookmarkForumPost, getBookmarkedPosts } from "@/lib/api";
import { formatTimestampShort, formatTimestampWithTime } from "@/lib/date";
import type { Locale } from "@/content/site";
import type { CurrentUser } from "@/types/auth";
import type { ForumPost } from "@/types/community";

type SavedPostsSectionProps = {
  accessToken: string;
};

function SavedPostsSection({ accessToken }: SavedPostsSectionProps) {
  const copy = useLocalizedContent(accountCopy);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    getBookmarkedPosts(accessToken)
      .then((result) => {
        if (isActive) {
          setPosts(result);
          setStatus("success");
        }
      })
      .catch((caughtError) => {
        if (isActive) {
          setError(
            caughtError instanceof ApiError
              ? caughtError.message
              : copy.savedPosts.error,
          );
          setStatus("error");
        }
      });

    return () => {
      isActive = false;
    };
  }, [accessToken, copy.savedPosts.error]);

  async function handleUnsave(postId: string) {
    setRemovingId(postId);
    try {
      await bookmarkForumPost(postId, accessToken);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <section className="site-card overflow-hidden">
      <header className="site-divider border-b p-6 sm:p-7">
        <h2 className="text-xl font-semibold">{copy.savedPosts.title}</h2>
      </header>

      {status === "loading" ? (
        <div className="p-6 sm:p-7" aria-live="polite">
          <p className="site-muted text-sm font-semibold">
            {copy.savedPosts.loading}
          </p>
        </div>
      ) : null}

      {status === "error" ? (
        <div className="p-6 sm:p-7">
          <p className="text-sm text-red-800 dark:text-red-300">
            {error ?? copy.savedPosts.error}
          </p>
        </div>
      ) : null}

      {status === "success" && posts.length === 0 ? (
        <div className="p-6 sm:p-7">
          <p className="text-base font-semibold">{copy.savedPosts.emptyTitle}</p>
          <p className="site-muted mt-2 text-sm leading-7">
            {copy.savedPosts.emptyText}
          </p>
        </div>
      ) : null}

      {status === "success" && posts.length > 0 ? (
        <ul className="divide-y divide-(--color-border)">
          {posts.map((post) => {
            const isDeleted = post.status !== "PUBLISHED";
            const isRemoving = removingId === post.id;

            return (
              <li key={post.id} className="flex items-start justify-between gap-4 p-5 sm:p-6">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className={`truncate text-sm font-semibold${isDeleted ? " line-through opacity-50" : ""}`}>
                      {post.title}
                    </p>
                    {isDeleted ? (
                      <span className="shrink-0 rounded-md border border-red-200 bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
                        {copy.savedPosts.deletedBadge}
                      </span>
                    ) : null}
                  </div>
                  <p className="site-subtle mt-1 text-xs">
                    <Link
                      href={`/users/${post.authorId}`}
                      className="transition hover:text-(--color-accent-strong)"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {post.authorDisplayName}
                    </Link>
                    {" · "}
                    {formatTimestampShort(post.createdAt)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {!isDeleted ? (
                    <Link
                      href={`/community/posts/${post.id}`}
                      className="min-h-9 rounded-xl border border-(--color-border) bg-(--color-surface) px-3 py-2 text-xs font-semibold text-(--color-muted) transition hover:border-(--color-border-strong) hover:text-foreground"
                    >
                      {copy.savedPosts.openLabel}
                    </Link>
                  ) : null}
                  <button
                    type="button"
                    disabled={isRemoving}
                    aria-label={copy.savedPosts.unsaveLabel}
                    onClick={() => handleUnsave(post.id)}
                    className="flex min-h-9 w-9 items-center justify-center rounded-xl border border-(--color-border) bg-(--color-surface) text-(--color-muted) transition hover:border-(--color-border-strong) hover:text-foreground disabled:cursor-wait disabled:opacity-50"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="size-4" aria-hidden="true">
                      <path d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z" />
                    </svg>
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}
    </section>
  );
}

function formatDateTime(value: string | null, fallback: string) {
  if (!value) {
    return fallback;
  }

  const formatted = formatTimestampWithTime(value);
  return formatted || fallback;
}

function getCountryLabel(user: CurrentUser, locale: Locale, fallback: string) {
  const country = getCountryOptions(locale).find(
    (option) => option.code === user.countryRegionCode,
  );

  return country?.label ?? user.countryRegionCode ?? fallback;
}

export function AccountDashboardView() {
  const copy = useLocalizedContent(accountCopy);
  const { locale } = useLocale();
  const { status, user, accessToken, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  async function handleLogout() {
    setIsLoggingOut(true);
    setLogoutError(null);

    try {
      await logout();
    } catch {
      setLogoutError(copy.summary.logoutError);
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <PageShell className="gap-8">
      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <article className="site-panel p-8 sm:p-10">
          <p className="site-kicker">{copy.eyebrow}</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
            {copy.title}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 opacity-85">
            {copy.intro}
          </p>
        </article>

        {status === "checking" ? (
          <article className="site-card p-8 sm:p-10" aria-live="polite">
            <p className="site-kicker">{copy.loading.title}</p>
            <p className="site-muted mt-4 text-base leading-8">
              {copy.loading.body}
            </p>
          </article>
        ) : null}

        {status !== "checking" && !user ? (
          <article className="site-card p-8 sm:p-10">
            <p className="site-kicker">{copy.signedOut.title}</p>
            <p className="site-muted mt-4 text-base leading-8">
              {copy.signedOut.body}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/login"
                className="min-h-12 rounded-xl border border-(--color-border) bg-foreground px-5 py-3 text-sm font-semibold text-background transition hover:opacity-90"
              >
                {copy.signedOut.loginLabel}
              </Link>
              <Link
                href="/register"
                className="min-h-12 rounded-xl border border-(--color-border) bg-(--color-surface) px-5 py-3 text-sm font-semibold text-foreground transition hover:border-(--color-border-strong)"
              >
                {copy.signedOut.registerLabel}
              </Link>
            </div>
          </article>
        ) : null}

        {user ? (
          <article className="site-card p-8 sm:p-10">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="site-kicker">{copy.summary.title}</p>
                <p className="site-muted mt-4 max-w-2xl text-base leading-8">
                  {copy.summary.intro}
                </p>
              </div>
              <span className="rounded-xl border border-emerald-200 bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-300">
                {copy.summary.activeBadge}
              </span>
            </div>

            <dl className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-(--color-border) bg-(--color-surface-raised) p-4">
                <dt className="site-subtle text-xs font-bold uppercase">
                  {copy.labels.displayName}
                </dt>
                <dd className="mt-2 text-base font-semibold">
                  {user.displayName}
                </dd>
              </div>
              <div className="rounded-xl border border-(--color-border) bg-(--color-surface-raised) p-4">
                <dt className="site-subtle text-xs font-bold uppercase">
                  {copy.labels.email}
                </dt>
                <dd className="mt-2 wrap-break-word text-base font-semibold">
                  {user.email}
                </dd>
              </div>
              <div className="rounded-xl border border-(--color-border) bg-(--color-surface-raised) p-4">
                <dt className="site-subtle text-xs font-bold uppercase">
                  {copy.labels.countryRegion}
                </dt>
                <dd className="mt-2 text-base font-semibold">
                  {getCountryLabel(user, locale, copy.empty.country)}
                </dd>
              </div>
              <div className="rounded-xl border border-(--color-border) bg-(--color-surface-raised) p-4">
                <dt className="site-subtle text-xs font-bold uppercase">
                  {copy.labels.status}
                </dt>
                <dd className="mt-2 text-base font-semibold">
                  {copy.statuses[user.status]}
                </dd>
              </div>
              <div className="rounded-xl border border-(--color-border) bg-(--color-surface-raised) p-4">
                <dt className="site-subtle text-xs font-bold uppercase">
                  {copy.labels.roles}
                </dt>
                <dd className="mt-2 text-base font-semibold">
                  {user.roles.map((role) => copy.roles[role]).join(", ")}
                </dd>
              </div>
              <div className="rounded-xl border border-(--color-border) bg-(--color-surface-raised) p-4">
                <dt className="site-subtle text-xs font-bold uppercase">
                  {copy.labels.emailVerifiedAt}
                </dt>
                <dd className="mt-2 text-base font-semibold">
                  {formatDateTime(user.emailVerifiedAt, copy.empty.date)}
                </dd>
              </div>
              <div className="rounded-xl border border-(--color-border) bg-(--color-surface-raised) p-4 sm:col-span-2">
                <dt className="site-subtle text-xs font-bold uppercase">
                  {copy.labels.lastLoginAt}
                </dt>
                <dd className="mt-2 text-base font-semibold">
                  {formatDateTime(user.lastLoginAt, copy.empty.date)}
                </dd>
              </div>
            </dl>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                href="/settings"
                className="min-h-12 rounded-xl border border-(--color-border) bg-(--color-surface) px-5 py-3 text-sm font-semibold text-foreground transition hover:border-(--color-border-strong)"
              >
                {copy.summary.settingsLabel}
              </Link>
              <button
                type="button"
                disabled={isLoggingOut}
                onClick={handleLogout}
                className="min-h-12 rounded-xl border border-(--color-border) bg-foreground px-5 text-sm font-semibold text-background transition hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
              >
                {isLoggingOut
                  ? copy.summary.logoutPendingLabel
                  : copy.summary.logoutLabel}
              </button>
              {logoutError ? (
                <p role="alert" className="text-sm text-red-800 dark:text-red-300">
                  {logoutError}
                </p>
              ) : null}
            </div>
          </article>
        ) : null}
      </section>

      {accessToken ? <SavedPostsSection accessToken={accessToken} /> : null}
    </PageShell>
  );
}
