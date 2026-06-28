"use client";

import Link from "next/link";
import { UserAvatar } from "@/app/_components/UserAvatar";
import { useEffect, useState } from "react";
import { useAuth } from "@/app/_components/AuthProvider";
import { CommunityComments } from "@/app/_components/CommunityComments";
import { PageShell } from "@/app/_components/PageShell";
import { CommunityPostReportForm } from "@/app/_components/CommunityPostReportForm";
import {
  useLocale,
  useLocalizedContent,
} from "@/app/_components/LocaleProvider";
import { formatForumPostDate } from "@/app/_components/CommunityForumPosts";
import { communityCopy } from "@/content/community";
import {
  ApiError,
  bookmarkForumPost,
  getForumPost,
  likeForumPost,
} from "@/lib/api";
import type { ForumPost } from "@/types/community";

type CommunityPostDetailViewProps = {
  postId: string;
};

type LoadState =
  | { kind: "loading" }
  | { kind: "success"; post: ForumPost }
  | { kind: "error"; message: string };

function errorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError) {
    return error.message || fallback;
  }

  if (error instanceof Error) {
    return error.message || fallback;
  }

  return fallback;
}

export function CommunityPostDetailView({
  postId,
}: CommunityPostDetailViewProps) {
  const copy = useLocalizedContent(communityCopy);
  const { locale } = useLocale();
  const { accessToken, status: authStatus } = useAuth();
  const [state, setState] = useState<LoadState>({ kind: "loading" });
  const [likeCount, setLikeCount] = useState(0);
  const [liked, setLiked] = useState<boolean | null>(null);
  const [bookmarked, setBookmarked] = useState<boolean | null>(null);
  const [isLiking, setIsLiking] = useState(false);
  const [isBookmarking, setIsBookmarking] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const [likeError, setLikeError] = useState<string | null>(null);
  const [bookmarkError, setBookmarkError] = useState<string | null>(null);

  useEffect(() => {
    if (!isReporting) return;
    const saved = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = saved;
    };
  }, [isReporting]);

  useEffect(() => {
    if (authStatus === "checking") return;

    let isActive = true;

    async function loadPost() {
      setState({ kind: "loading" });

      try {
        const post = await getForumPost(postId, accessToken ?? undefined);

        if (isActive) {
          setState({ kind: "success", post });
          setLikeCount(post.likeCount);
          setLiked(post.likedByCurrentUser);
          setBookmarked(post.bookmarkedByCurrentUser);
        }
      } catch (caughtError) {
        if (isActive) {
          setState({
            kind: "error",
            message: errorMessage(caughtError, copy.posts.formErrorFallback),
          });
        }
      }
    }

    loadPost();

    return () => {
      isActive = false;
    };
  }, [copy.posts.formErrorFallback, postId, accessToken, authStatus]);

  async function handleLike() {
    if (!accessToken || isLiking) return;
    setIsLiking(true);
    setLikeError(null);

    try {
      const result = await likeForumPost(postId, accessToken);
      setLiked(result.liked);
      setLikeCount(result.likeCount);
    } catch {
      setLikeError(copy.interactions.likeError);
    } finally {
      setIsLiking(false);
    }
  }

  async function handleBookmark() {
    if (!accessToken || isBookmarking) return;
    setIsBookmarking(true);
    setBookmarkError(null);

    try {
      const result = await bookmarkForumPost(postId, accessToken);
      setBookmarked(result.bookmarked);
    } catch {
      setBookmarkError(copy.interactions.bookmarkError);
    } finally {
      setIsBookmarking(false);
    }
  }

  return (
    <PageShell className="gap-8">
      <Link href="/community" className="site-text-link">
        {copy.posts.detailBackLabel}
      </Link>

      {state.kind === "loading" ? (
        <section className="site-card p-8 text-center sm:p-12" aria-live="polite">
          <p className="site-muted text-sm font-semibold">
            {copy.posts.detailLoading}
          </p>
        </section>
      ) : null}

      {state.kind === "error" ? (
        <section className="site-card p-8 text-center sm:p-12">
          <h1 className="text-3xl font-semibold">
            {copy.posts.detailErrorTitle}
          </h1>
          <p className="site-muted mx-auto mt-3 max-w-xl text-sm leading-7">
            {state.message}
          </p>
        </section>
      ) : null}

      {state.kind === "success" ? (
        <section className="flex flex-col gap-6">
          <div className="flex flex-col gap-6">
            <article className="site-card overflow-hidden">
              <header className="site-divider border-b p-8 sm:p-10">
                <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-(--color-subtle)">
                  <Link
                    href={`/community/categories/${state.post.categorySlug}`}
                    className="transition hover:text-(--color-accent-strong)"
                  >
                    {state.post.categoryName}
                  </Link>
                  <span aria-hidden="true">/</span>
                  <Link
                    href={`/users/${state.post.authorId}`}
                    className="flex items-center gap-1.5 transition hover:text-(--color-accent-strong)"
                  >
                    <UserAvatar displayName={state.post.authorDisplayName} size={18} />
                    {copy.posts.postedByLabel} {state.post.authorDisplayName}
                  </Link>
                  <span aria-hidden="true">/</span>
                  <time dateTime={state.post.createdAt}>
                    {formatForumPostDate(state.post.createdAt, locale)}
                  </time>
                </div>

                <h1 className="mt-5 max-w-4xl text-4xl font-semibold tracking-tight sm:text-5xl">
                  {state.post.title}
                </h1>
              </header>

              <div className="p-8 sm:p-10">
                <p className="whitespace-pre-wrap text-base leading-8">
                  {state.post.body}
                </p>
              </div>

              <footer className="site-divider border-t px-8 py-5 sm:px-10">
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    disabled={isLiking || !accessToken}
                    onClick={() => void handleLike()}
                    aria-label={liked ? copy.interactions.likedLabel : copy.interactions.likeLabel}
                    className={
                      liked
                        ? "flex min-h-10 items-center gap-2 rounded-xl border border-blue-500/30 bg-blue-500/10 px-3 text-blue-700 transition dark:text-blue-200"
                        : "flex min-h-10 items-center gap-2 rounded-xl border border-(--color-border) bg-(--color-surface) px-3 text-(--color-muted) transition hover:border-(--color-border-strong) hover:text-foreground disabled:cursor-default"
                    }
                  >
                    {liked ? (
                      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 shrink-0" aria-hidden="true">
                        <path d="M7.493 18.5c-.425 0-.82-.236-.975-.632A7.48 7.48 0 0 1 6 15.125c0-1.75.599-3.358 1.602-4.634.151-.192.373-.309.6-.397.473-.183.89-.514 1.212-.924a9.042 9.042 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75A.75.75 0 0 1 15 2a2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23h-.952ZM2.062 14.382a12.01 12.01 0 0 0-.18.432c-.057.147-.11.295-.158.444-.05.153-.093.306-.129.46-.038.157-.068.315-.09.474-.024.162-.04.325-.05.488H2.5A6.01 6.01 0 0 0 4 18.5h.493v-4.118Z" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4 shrink-0" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z" />
                      </svg>
                    )}
                    {likeCount > 0 ? <span className="text-xs font-semibold">{likeCount}</span> : null}
                  </button>
                  <button
                    type="button"
                    disabled={isBookmarking || !accessToken}
                    onClick={() => void handleBookmark()}
                    aria-label={bookmarked ? copy.interactions.bookmarkedLabel : copy.interactions.bookmarkLabel}
                    className={
                      bookmarked
                        ? "flex min-h-10 min-w-10 items-center justify-center rounded-xl border border-amber-200 bg-amber-100 px-3 text-amber-800 transition dark:border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-200"
                        : "flex min-h-10 min-w-10 items-center justify-center rounded-xl border border-(--color-border) bg-(--color-surface) px-3 text-(--color-muted) transition hover:border-(--color-border-strong) hover:text-foreground disabled:cursor-default"
                    }
                  >
                    {bookmarked ? (
                      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 shrink-0" aria-hidden="true">
                        <path fillRule="evenodd" d="M6.32 2.577a49.255 49.255 0 0 1 11.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 0 1-1.085.67L12 18.089l-7.165 3.583A.75.75 0 0 1 3.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93Z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4 shrink-0" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
                      </svg>
                    )}
                  </button>
                  {accessToken ? (
                    <button
                      type="button"
                      onClick={() => setIsReporting(true)}
                      className="ml-auto text-xs text-(--color-subtle) transition hover:text-(--color-muted)"
                    >
                      {copy.reports.eyebrow}
                    </button>
                  ) : null}
                </div>
                {!accessToken ? (
                  <p className="mt-3 text-xs text-(--color-subtle)">
                    {copy.interactions.signInToInteract}
                  </p>
                ) : null}
                {likeError ? (
                  <p
                    role="alert"
                    className="mt-3 text-xs text-red-800 dark:text-red-300"
                  >
                    {likeError}
                  </p>
                ) : null}
                {bookmarkError ? (
                  <p
                    role="alert"
                    className="mt-3 text-xs text-red-800 dark:text-red-300"
                  >
                    {bookmarkError}
                  </p>
                ) : null}
              </footer>
            </article>

            <CommunityComments
              postId={state.post.id}
              locked={state.post.locked}
            />
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
              <div className="site-card relative z-10 flex max-h-[90vh] w-full flex-col overflow-hidden sm:max-w-lg sm:rounded-xl">
                <div className="site-divider flex items-center justify-between border-b p-4 sm:p-5">
                  <p className="text-sm font-semibold">{copy.reports.title}</p>
                  <button
                    type="button"
                    onClick={() => setIsReporting(false)}
                    aria-label="Close"
                    className="rounded-xl border border-(--color-border) bg-(--color-surface) px-3 py-1.5 text-sm font-semibold text-(--color-muted) transition hover:text-foreground"
                  >
                    &#x2715;
                  </button>
                </div>
                <div className="overflow-y-auto">
                  <CommunityPostReportForm postId={state.post.id} />
                </div>
              </div>
            </div>
          ) : null}
        </section>
      ) : null}
    </PageShell>
  );
}
