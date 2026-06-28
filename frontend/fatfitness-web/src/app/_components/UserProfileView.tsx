"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PageShell } from "@/app/_components/PageShell";
import { UserAvatar } from "@/app/_components/UserAvatar";
import { useLocale } from "@/app/_components/LocaleProvider";
import { ApiError, getPublicUserProfile } from "@/lib/api";
import { getCountryOptions } from "@/content/countries";
import type { Locale } from "@/content/site";
import type { UserPublicProfile } from "@/types/user";

type Props = {
  userId: string;
};

type LoadState =
  | { kind: "loading" }
  | { kind: "success"; profile: UserPublicProfile }
  | { kind: "error"; message: string };

function formatJoinDate(value: string, locale: Locale) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(date);
}

function formatDate(value: string, locale: Locale) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(date);
}

function countryLabel(code: string | null, locale: Locale) {
  if (!code) return null;
  return getCountryOptions(locale).find((o) => o.code === code)?.label ?? code;
}

function roleBadgeClass(role: string) {
  if (role === "OWNER") return "border-amber-200 bg-amber-100 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-300";
  if (role === "ADMIN") return "border-red-200 bg-red-100 text-red-800 dark:border-red-500/30 dark:bg-red-500/15 dark:text-red-300";
  if (role === "MODERATOR") return "border-blue-200 bg-blue-100 text-blue-800 dark:border-blue-500/30 dark:bg-blue-500/15 dark:text-blue-300";
  return "border-(--color-border) bg-(--color-surface) text-(--color-muted)";
}

function roleLabel(role: string) {
  if (role === "OWNER") return "Owner";
  if (role === "ADMIN") return "Admin";
  if (role === "MODERATOR") return "Moderator";
  return role;
}

export function UserProfileView({ userId }: Props) {
  const { locale } = useLocale();
  const [state, setState] = useState<LoadState>({ kind: "loading" });

  useEffect(() => {
    let isActive = true;

    getPublicUserProfile(userId)
      .then((profile) => {
        if (isActive) setState({ kind: "success", profile });
      })
      .catch((err) => {
        if (isActive) {
          const message =
            err instanceof ApiError
              ? err.message
              : "Profile could not be loaded.";
          setState({ kind: "error", message });
        }
      });

    return () => {
      isActive = false;
    };
  }, [userId]);

  return (
    <PageShell className="gap-8">
      <Link href="/community" className="site-text-link">
        ← Back to community
      </Link>

      {state.kind === "loading" ? (
        <section className="site-card p-8 text-center sm:p-12" aria-live="polite">
          <p className="site-muted text-sm font-semibold">Loading profile…</p>
        </section>
      ) : null}

      {state.kind === "error" ? (
        <section className="site-card p-8 text-center sm:p-12">
          <h1 className="text-3xl font-semibold">Profile not found</h1>
          <p className="site-muted mx-auto mt-3 max-w-xl text-sm leading-7">
            {state.message}
          </p>
        </section>
      ) : null}

      {state.kind === "success" ? (
        <div className="flex flex-col gap-6">
          {/* Profile header card */}
          <section className="site-card p-6 sm:p-8">
            <div className="flex flex-wrap items-start gap-5">
              <UserAvatar
                displayName={state.profile.displayName}
                userId={userId}
                hasAvatar={state.profile.hasAvatar}
                size={64}
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-semibold">{state.profile.displayName}</h1>
                  {state.profile.publicRoles.map((role) => (
                    <span
                      key={role}
                      className={`rounded-xl border px-2.5 py-0.5 text-xs font-semibold ${roleBadgeClass(role)}`}
                    >
                      {roleLabel(role)}
                    </span>
                  ))}
                </div>
                <p className="site-muted mt-1 text-sm">
                  {countryLabel(state.profile.countryRegionCode, locale)
                    ? `${countryLabel(state.profile.countryRegionCode, locale)} · `
                    : ""}
                  Member since {formatJoinDate(state.profile.joinedAt, locale)}
                </p>
              </div>
            </div>

            <dl className="mt-6 flex flex-wrap gap-4">
              <div className="rounded-xl border border-(--color-border) bg-(--color-surface-raised) px-5 py-3 text-center">
                <dt className="site-subtle text-xs font-bold uppercase">Threads</dt>
                <dd className="mt-1 text-xl font-semibold">{state.profile.threadCount}</dd>
              </div>
              <div className="rounded-xl border border-(--color-border) bg-(--color-surface-raised) px-5 py-3 text-center">
                <dt className="site-subtle text-xs font-bold uppercase">Comments</dt>
                <dd className="mt-1 text-xl font-semibold">{state.profile.commentCount}</dd>
              </div>
              <div className="rounded-xl border border-(--color-border) bg-(--color-surface-raised) px-5 py-3 text-center">
                <dt className="site-subtle text-xs font-bold uppercase">Likes received</dt>
                <dd className="mt-1 text-xl font-semibold">{state.profile.likesReceived}</dd>
              </div>
            </dl>
          </section>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Recent threads */}
            <section className="site-card overflow-hidden">
              <header className="site-divider border-b p-5 sm:p-6">
                <p className="site-kicker">Activity</p>
                <h2 className="mt-2 text-xl font-semibold">Recent threads</h2>
              </header>
              {state.profile.recentThreads.length === 0 ? (
                <p className="site-muted p-5 text-sm sm:p-6">No threads yet.</p>
              ) : (
                <ul className="divide-y divide-(--color-border)">
                  {state.profile.recentThreads.map((thread) => (
                    <li key={thread.id}>
                      <Link
                        href={`/community/posts/${thread.id}`}
                        className="block p-5 transition hover:bg-(--color-surface) sm:p-6"
                      >
                        <p className="truncate text-sm font-semibold">{thread.title}</p>
                        <p className="site-subtle mt-1 text-xs">
                          {thread.categoryName} · {formatDate(thread.createdAt, locale)}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Recent comments */}
            <section className="site-card overflow-hidden">
              <header className="site-divider border-b p-5 sm:p-6">
                <p className="site-kicker">Activity</p>
                <h2 className="mt-2 text-xl font-semibold">Recent comments</h2>
              </header>
              {state.profile.recentComments.length === 0 ? (
                <p className="site-muted p-5 text-sm sm:p-6">No comments yet.</p>
              ) : (
                <ul className="divide-y divide-(--color-border)">
                  {state.profile.recentComments.map((c) => (
                    <li key={c.commentId}>
                      <Link
                        href={`/community/posts/${c.postId}`}
                        className="block p-5 transition hover:bg-(--color-surface) sm:p-6"
                      >
                        <p className="site-muted line-clamp-2 text-sm leading-6">
                          &ldquo;{c.excerpt}&rdquo;
                        </p>
                        <p className="site-subtle mt-1.5 text-xs">
                          in {c.postTitle} · {formatDate(c.createdAt, locale)}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </div>
      ) : null}
    </PageShell>
  );
}
