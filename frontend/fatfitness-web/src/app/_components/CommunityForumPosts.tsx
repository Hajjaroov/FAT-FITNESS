"use client";

import Link from "next/link";
import {
  useEffect,
  useState,
  useTransition,
  type Dispatch,
  type FormEvent,
  type SetStateAction,
} from "react";
import { useAuth } from "@/app/_components/AuthProvider";
import {
  useLocale,
  useLocalizedContent,
} from "@/app/_components/LocaleProvider";
import { communityCopy } from "@/content/community";
import { ApiError, createForumPost, getForumPosts } from "@/lib/api";
import type { ForumPost } from "@/types/community";

export type CommunityCategoryOption = {
  slug: string;
  name: string;
  description: string;
};

type LoadState = "idle" | "loading" | "success" | "error";

type CommunityPostsState = {
  posts: ForumPost[];
  status: LoadState;
  error: string | null;
  setPosts: Dispatch<SetStateAction<ForumPost[]>>;
  refresh: () => Promise<void>;
};

type CommunityPostListProps = {
  posts: ForumPost[];
  status: LoadState;
  error: string | null;
  categories: CommunityCategoryOption[];
  title: string;
  intro: string;
  emptyTitle: string;
  emptyText: string;
  onRetry: () => Promise<void>;
};

type CommunityPostComposerProps = {
  categories: CommunityCategoryOption[];
  fixedCategorySlug?: string;
  onCreated: (post: ForumPost) => void;
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

function categoryName(
  categories: CommunityCategoryOption[],
  slug: string,
  fallback: string,
) {
  return categories.find((category) => category.slug === slug)?.name ?? fallback;
}

function postPreview(body: string) {
  const compact = body.replace(/\s+/g, " ").trim();

  if (compact.length <= 180) {
    return compact;
  }

  return `${compact.slice(0, 180)}...`;
}

export function formatForumPostDate(value: string, locale: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function useCommunityPosts(
  categorySlug?: string,
  limit = 50,
): CommunityPostsState {
  const copy = useLocalizedContent(communityCopy);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [status, setStatus] = useState<LoadState>("idle");
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setStatus("loading");
    setError(null);

    try {
      const nextPosts = await getForumPosts({ categorySlug, limit });
      setPosts(nextPosts);
      setStatus("success");
    } catch (caughtError) {
      setError(errorMessage(caughtError, copy.posts.formErrorFallback));
      setStatus("error");
    }
  }

  useEffect(() => {
    let isActive = true;

    async function loadPosts() {
      setStatus("loading");
      setError(null);

      try {
        const nextPosts = await getForumPosts({ categorySlug, limit });

        if (!isActive) {
          return;
        }

        setPosts(nextPosts);
        setStatus("success");
      } catch (caughtError) {
        if (!isActive) {
          return;
        }

        setError(errorMessage(caughtError, copy.posts.formErrorFallback));
        setStatus("error");
      }
    }

    loadPosts();

    return () => {
      isActive = false;
    };
  }, [categorySlug, copy.posts.formErrorFallback, limit]);

  return { posts, status, error, setPosts, refresh };
}

export function CommunityPostList({
  posts,
  status,
  error,
  categories,
  title,
  intro,
  emptyTitle,
  emptyText,
  onRetry,
}: CommunityPostListProps) {
  const copy = useLocalizedContent(communityCopy);
  const { locale } = useLocale();
  const [isRefreshing, startRefreshing] = useTransition();

  return (
    <section className="site-card overflow-hidden">
      <div className="site-divider border-b p-5 sm:p-6">
        <p className="site-kicker">{copy.posts.eyebrow}</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight">{title}</h2>
        <p className="site-muted mt-2 text-sm leading-7">{intro}</p>
      </div>

      {status === "loading" ? (
        <div className="p-8 text-center sm:p-12" aria-live="polite">
          <p className="site-muted text-sm font-semibold">
            {copy.posts.loading}
          </p>
        </div>
      ) : null}

      {status === "error" ? (
        <div className="p-8 text-center sm:p-12">
          <h3 className="text-2xl font-semibold">{copy.posts.errorTitle}</h3>
          <p className="site-muted mx-auto mt-3 max-w-xl text-sm leading-7">
            {error ?? copy.posts.formErrorFallback}
          </p>
          <button
            type="button"
            disabled={isRefreshing}
            onClick={() => {
              startRefreshing(() => {
                void onRetry();
              });
            }}
            className="mt-5 min-h-11 rounded-full border border-(--color-border) bg-foreground px-5 text-sm font-semibold text-background transition hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
          >
            {isRefreshing ? copy.posts.retryPendingLabel : copy.posts.retryLabel}
          </button>
        </div>
      ) : null}

      {status === "success" && posts.length === 0 ? (
        <div className="p-8 text-center sm:p-12">
          <h3 className="text-2xl font-semibold">{emptyTitle}</h3>
          <p className="site-muted mx-auto mt-3 max-w-xl text-sm leading-7">
            {emptyText}
          </p>
        </div>
      ) : null}

      {status === "success" && posts.length > 0 ? (
        <div>
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/community/posts/${post.id}`}
              className="site-divider block border-b p-5 transition hover:bg-(--color-surface) sm:p-6"
            >
              <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-(--color-subtle)">
                <span>
                  {copy.posts.postedByLabel} {post.authorDisplayName}
                </span>
                <span aria-hidden="true">/</span>
                <span>
                  {copy.posts.inLabel}{" "}
                  {categoryName(categories, post.categorySlug, post.categoryName)}
                </span>
                <span aria-hidden="true">/</span>
                <time dateTime={post.createdAt}>
                  {formatForumPostDate(post.createdAt, locale)}
                </time>
              </div>
              <h3 className="mt-3 text-xl font-semibold">{post.title}</h3>
              <p className="site-muted mt-2 text-sm leading-7">
                {postPreview(post.body)}
              </p>
              <span className="site-text-link mt-4">
                {copy.posts.readPostLabel}
              </span>
            </Link>
          ))}
        </div>
      ) : null}
    </section>
  );
}

export function CommunityPostComposer({
  categories,
  fixedCategorySlug,
  onCreated,
}: CommunityPostComposerProps) {
  const copy = useLocalizedContent(communityCopy);
  const { status, accessToken } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const categorySlug =
      fixedCategorySlug ?? formValue(formData, "forum-post-category");
    const acceptedCommunityGuidelines = formChecked(
      formData,
      "forum-post-guidelines",
    );

    setFormError(null);
    setSuccessMessage(null);

    if (!accessToken) {
      setFormError(copy.posts.signInRequiredError);
      return;
    }

    if (!categorySlug) {
      setFormError(copy.posts.categoryRequiredError);
      return;
    }

    if (!acceptedCommunityGuidelines) {
      setFormError(copy.posts.guidelinesRequiredError);
      return;
    }

    setIsSubmitting(true);

    void createForumPost(
      {
        categorySlug,
        title: formValue(formData, "forum-post-title"),
        body: formValue(formData, "forum-post-body"),
        acceptedCommunityGuidelines,
      },
      accessToken,
    )
      .then((post) => {
        form.reset();
        onCreated(post);
        setSuccessMessage(copy.posts.createSuccessText);
      })
      .catch((caughtError) => {
        setFormError(errorMessage(caughtError, copy.posts.formErrorFallback));
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  }

  if (status === "checking") {
    return (
      <aside className="site-card p-6 sm:p-7" aria-live="polite">
        <p className="site-kicker">{copy.posts.createTitle}</p>
        <p className="site-muted mt-4 text-sm leading-7">
          {copy.posts.checkingSession}
        </p>
      </aside>
    );
  }

  if (!accessToken) {
    return (
      <aside className="site-card p-6 sm:p-7">
        <p className="site-kicker">{copy.posts.createTitle}</p>
        <h2 className="mt-3 text-2xl font-semibold">
          {copy.posts.signInTitle}
        </h2>
        <p className="site-muted mt-3 text-sm leading-7">
          {copy.posts.signInText}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/login"
            className="min-h-11 rounded-full border border-(--color-border) bg-foreground px-5 py-3 text-sm font-semibold text-background transition hover:opacity-90"
          >
            {copy.posts.signInLabel}
          </Link>
          <Link
            href="/register"
            className="min-h-11 rounded-full border border-(--color-border) bg-(--color-surface) px-5 py-3 text-sm font-semibold text-foreground transition hover:border-(--color-border-strong)"
          >
            {copy.posts.registerLabel}
          </Link>
        </div>
      </aside>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="site-card p-6 sm:p-7">
      <p className="site-kicker">{copy.posts.createTitle}</p>
      <p className="site-muted mt-3 text-sm leading-7">
        {copy.posts.createIntro}
      </p>

      <div className="mt-6 space-y-5">
        {fixedCategorySlug ? null : (
          <div>
            <label
              htmlFor="forum-post-category"
              className="text-sm font-semibold text-foreground"
            >
              {copy.posts.categoryLabel}
            </label>
            <select
              id="forum-post-category"
              name="forum-post-category"
              required
              defaultValue={categories[0]?.slug ?? ""}
              className="mt-2 min-h-12 w-full rounded-2xl border border-(--color-border) bg-(--color-surface) px-4 text-base text-foreground outline-none transition focus:border-(--color-accent)"
            >
              {categories.map((category) => (
                <option key={category.slug} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label
            htmlFor="forum-post-title"
            className="text-sm font-semibold text-foreground"
          >
            {copy.posts.titleLabel}
          </label>
          <input
            id="forum-post-title"
            name="forum-post-title"
            type="text"
            required
            minLength={4}
            maxLength={160}
            placeholder={copy.posts.titlePlaceholder}
            className="mt-2 min-h-12 w-full rounded-2xl border border-(--color-border) bg-(--color-surface) px-4 text-base text-foreground outline-none transition placeholder:text-(--color-subtle) focus:border-(--color-accent)"
          />
        </div>

        <div>
          <label
            htmlFor="forum-post-body"
            className="text-sm font-semibold text-foreground"
          >
            {copy.posts.bodyLabel}
          </label>
          <textarea
            id="forum-post-body"
            name="forum-post-body"
            required
            minLength={20}
            maxLength={12000}
            rows={8}
            placeholder={copy.posts.bodyPlaceholder}
            className="mt-2 w-full rounded-2xl border border-(--color-border) bg-(--color-surface) px-4 py-3 text-base leading-7 text-foreground outline-none transition placeholder:text-(--color-subtle) focus:border-(--color-accent)"
          />
        </div>

        <label className="flex gap-3 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 text-sm leading-6 text-(--color-muted)">
          <input
            type="checkbox"
            name="forum-post-guidelines"
            className="mt-1 h-4 w-4 rounded border-(--color-border) accent-(--color-accent)"
          />
          <span>{copy.posts.guidelinesLabel}</span>
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
            <p className="font-semibold">{copy.posts.createSuccessTitle}</p>
            <p className="mt-1">{successMessage}</p>
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="min-h-12 w-full rounded-full border border-(--color-border) bg-foreground px-5 text-sm font-semibold text-background transition hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
        >
          {isSubmitting ? copy.posts.submitPendingLabel : copy.posts.submitLabel}
        </button>
      </div>
    </form>
  );
}
