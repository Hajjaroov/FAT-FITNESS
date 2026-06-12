"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CommunityComments } from "@/app/_components/CommunityComments";
import { PageShell } from "@/app/_components/PageShell";
import { CommunityPostReportForm } from "@/app/_components/CommunityPostReportForm";
import {
  useLocale,
  useLocalizedContent,
} from "@/app/_components/LocaleProvider";
import { formatForumPostDate } from "@/app/_components/CommunityForumPosts";
import { communityCopy } from "@/content/community";
import { ApiError, getForumPost } from "@/lib/api";
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
  const [state, setState] = useState<LoadState>({ kind: "loading" });

  useEffect(() => {
    let isActive = true;

    async function loadPost() {
      setState({ kind: "loading" });

      try {
        const post = await getForumPost(postId);

        if (isActive) {
          setState({ kind: "success", post });
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
