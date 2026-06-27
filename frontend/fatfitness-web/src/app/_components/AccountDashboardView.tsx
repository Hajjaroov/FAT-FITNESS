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
import { ApiError, getBookmarkedPosts } from "@/lib/api";
import type { Locale } from "@/content/site";
import type { CurrentUser } from "@/types/auth";
import type { ForumPost } from "@/types/community";

type SavedPostsSectionProps = {
  accessToken: string;
};

function SavedPostsSection({ accessToken }: SavedPostsSectionProps) {
  const copy = useLocalizedContent(accountCopy);
  const { locale } = useLocale();
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [error, setError] = useState<string | null>(null);

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
          {posts.map((post) => (
            <li key={post.id} className="flex items-start justify-between gap-4 p-5 sm:p-6">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{post.title}</p>
                <p className="site-subtle mt-1 text-xs">
                  {new Intl.DateTimeFormat(locale, {
                    dateStyle: "medium",
                  }).format(new Date(post.createdAt))}
                </p>
              </div>
              <Link
                href={`/community/posts/${post.id}`}
                className="shrink-0 min-h-9 rounded-xl border border-(--color-border) bg-(--color-surface) px-3 py-2 text-xs font-semibold text-(--color-muted) transition hover:border-(--color-border-strong) hover:text-foreground"
              >
                {copy.savedPosts.openLabel}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

function formatDateTime(value: string | null, locale: Locale, fallback: string) {
  if (!value) {
    return fallback;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return fallback;
  }

  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
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
                  {formatDateTime(user.emailVerifiedAt, locale, copy.empty.date)}
                </dd>
              </div>
              <div className="rounded-xl border border-(--color-border) bg-(--color-surface-raised) p-4 sm:col-span-2">
                <dt className="site-subtle text-xs font-bold uppercase">
                  {copy.labels.lastLoginAt}
                </dt>
                <dd className="mt-2 text-base font-semibold">
                  {formatDateTime(user.lastLoginAt, locale, copy.empty.date)}
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

      {user ? (
        <section className="grid gap-6 md:grid-cols-2">
          <article className="site-card p-6 sm:p-7">
            <h2 className="text-xl font-semibold">{copy.community.title}</h2>
            <p className="site-muted mt-3 text-sm leading-7">
              {copy.community.body}
            </p>
          </article>
          <article className="site-card p-6 sm:p-7">
            <h2 className="text-xl font-semibold">{copy.privacy.title}</h2>
            <p className="site-muted mt-3 text-sm leading-7">
              {copy.privacy.body}
            </p>
          </article>
        </section>
      ) : null}

      {accessToken ? <SavedPostsSection accessToken={accessToken} /> : null}
    </PageShell>
  );
}
