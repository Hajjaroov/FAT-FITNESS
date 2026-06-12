"use client";

import Link from "next/link";
import {
  CommunityPostComposer,
  CommunityPostList,
  formatForumPostDate,
  useCommunityPosts,
} from "@/app/_components/CommunityForumPosts";
import { PageShell } from "@/app/_components/PageShell";
import {
  useLocale,
  useLocalizedContent,
} from "@/app/_components/LocaleProvider";
import { communityCopy } from "@/content/community";

type CommunityCategoryViewProps = {
  slug: string;
};

export function CommunityCategoryView({ slug }: CommunityCategoryViewProps) {
  const copy = useLocalizedContent(communityCopy);
  const { locale } = useLocale();
  const category = copy.categories.items.find((item) => item.slug === slug);
  const { posts, status, error, setPosts, refresh } = useCommunityPosts(slug);
  const latestPost = posts[0];

  if (!category) {
    return null;
  }

  return (
    <PageShell className="gap-8">
      <Link href="/community" className="site-text-link">
        {copy.categoryDetail.backLinkLabel}
      </Link>

      <section className="site-card p-8 sm:p-10">
        <div className="grid gap-6 lg:grid-cols-[1fr_20rem] lg:items-end">
          <div>
            <p className="site-kicker">{copy.categories.eyebrow}</p>
            <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              {category.name}
            </h1>
            <p className="site-muted mt-6 max-w-3xl text-base leading-8">
              {category.description}
            </p>
          </div>

          <dl className="grid grid-cols-3 gap-4 rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 text-sm">
            <div>
              <dt className="site-subtle">{copy.categoryDetail.topicsLabel}</dt>
              <dd className="mt-1 text-2xl font-semibold">
                {status === "loading" ? "..." : posts.length}
              </dd>
            </div>
            <div>
              <dt className="site-subtle">{copy.categoryDetail.repliesLabel}</dt>
              <dd className="mt-1 text-2xl font-semibold">0</dd>
            </div>
            <div>
              <dt className="site-subtle">{copy.categoryDetail.latestLabel}</dt>
              <dd className="site-muted mt-2 text-xs leading-5">
                {latestPost ? (
                  <span>
                    <span className="block font-semibold text-foreground">
                      {latestPost.title}
                    </span>
                    <time dateTime={latestPost.createdAt}>
                      {formatForumPostDate(latestPost.createdAt, locale)}
                    </time>
                  </span>
                ) : (
                  copy.categoryDetail.statusText
                )}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_24rem]">
        <div className="flex flex-col gap-6">
          <Link
            href="/community/guidelines"
            className="site-card grid gap-3 p-5 transition hover:bg-[var(--color-surface)] sm:p-6 md:grid-cols-[12rem_1fr]"
          >
            <p className="site-subtle text-sm font-semibold">
              {copy.categoryDetail.pinnedTitle}
            </p>
            <div>
              <h3 className="font-semibold">
                {copy.categoryDetail.pinnedGuidelinesTitle}
              </h3>
              <p className="site-muted mt-2 text-sm leading-7">
                {copy.categoryDetail.pinnedGuidelinesText}
              </p>
            </div>
          </Link>

          <CommunityPostList
            posts={posts}
            status={status}
            error={error}
            categories={copy.categories.items}
            title={copy.categoryDetail.threadsTitle}
            intro={copy.categoryDetail.threadsIntro}
            emptyTitle={copy.categoryDetail.emptyTitle}
            emptyText={copy.categoryDetail.emptyText}
            onRetry={refresh}
          />
        </div>

        <CommunityPostComposer
          categories={copy.categories.items}
          fixedCategorySlug={slug}
          onCreated={(post) => {
            setPosts((currentPosts) => [post, ...currentPosts]);
          }}
        />
      </section>
    </PageShell>
  );
}
