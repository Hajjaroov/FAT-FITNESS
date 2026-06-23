"use client";

import Link from "next/link";
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
  const { accessToken } = useAuth();
  const [state, setState] = useState<LoadState>({ kind: "loading" });
  const [likeCount, setLikeCount] = useState(0);
  const [liked, setLiked] = useState<boolean | null>(null);
  const [bookmarked, setBookmarked] = useState<boolean | null>(null);
  const [isLiking, setIsLiking] = useState(false);
  const [isBookmarking, setIsBookmarking] = useState(false);
  const [likeError, setLikeError] = useState<string | null>(null);
  const [bookmarkError, setBookmarkError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    async function loadPost() {
      setState({ kind: "loading" });

      try {
        const post = await getForumPost(postId);

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
  }, [copy.posts.formErrorFallback, postId]);

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
        <section className="grid gap-6 lg:grid-cols-[1fr_24rem] lg:items-start">
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
                  <span>
                    {copy.posts.postedByLabel} {state.post.authorDisplayName}
                  </span>
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
                    className={
                      liked
                        ? "min-h-10 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 text-xs font-semibold text-blue-700 transition dark:text-blue-200"
                        : "min-h-10 rounded-full border border-(--color-border) bg-(--color-surface) px-4 text-xs font-semibold text-(--color-muted) transition hover:border-(--color-border-strong) hover:text-foreground disabled:cursor-default"
                    }
                  >
                    {liked
                      ? copy.interactions.likedLabel
                      : copy.interactions.likeLabel}
                    {likeCount > 0 ? ` · ${likeCount}` : null}
                  </button>
                  <button
                    type="button"
                    disabled={isBookmarking || !accessToken}
                    onClick={() => void handleBookmark()}
                    className={
                      bookmarked
                        ? "min-h-10 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 text-xs font-semibold text-amber-700 transition dark:text-amber-200"
                        : "min-h-10 rounded-full border border-(--color-border) bg-(--color-surface) px-4 text-xs font-semibold text-(--color-muted) transition hover:border-(--color-border-strong) hover:text-foreground disabled:cursor-default"
                    }
                  >
                    {bookmarked
                      ? copy.interactions.bookmarkedLabel
                      : copy.interactions.bookmarkLabel}
                  </button>
                </div>
                {!accessToken ? (
                  <p className="mt-3 text-xs text-(--color-subtle)">
                    {copy.interactions.signInToInteract}
                  </p>
                ) : null}
                {likeError ? (
                  <p
                    role="alert"
                    className="mt-3 text-xs text-red-700 dark:text-red-200"
                  >
                    {likeError}
                  </p>
                ) : null}
                {bookmarkError ? (
                  <p
                    role="alert"
                    className="mt-3 text-xs text-red-700 dark:text-red-200"
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

          <CommunityPostReportForm postId={state.post.id} />
        </section>
      ) : null}
    </PageShell>
  );
}
