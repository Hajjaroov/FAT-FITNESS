"use client";

import Link from "next/link";
import { UserAvatar } from "@/app/_components/UserAvatar";
import {
  useEffect,
  useRef,
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
  emptyTitle,
  emptyText,
  onRetry,
}: CommunityPostListProps) {
  const copy = useLocalizedContent(communityCopy);
  const { locale } = useLocale();
  const [isRefreshing, startRefreshing] = useTransition();

  return (
    <section className="site-card overflow-hidden">

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
            className="mt-5 min-h-11 rounded-xl border border-(--color-border) bg-foreground px-5 text-sm font-semibold text-background transition hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
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
            <div
              key={post.id}
              className="site-divider relative border-b p-5 transition hover:bg-(--color-surface) sm:p-6"
            >
              <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-(--color-subtle)">
                <Link
                  href={`/users/${post.authorId}`}
                  className="relative z-10 flex items-center gap-1.5 transition hover:text-(--color-accent-strong)"
                >
                  <UserAvatar displayName={post.authorDisplayName} size={18} />
                  {copy.posts.postedByLabel} {post.authorDisplayName}
                </Link>
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
              <h3 className="mt-3 text-xl font-semibold">
                <Link
                  href={`/community/posts/${post.id}`}
                  className="after:absolute after:inset-0 after:content-['']"
                >
                  {post.title}
                </Link>
              </h3>
              <p className="site-muted mt-2 text-sm leading-7">
                {postPreview(post.body)}
              </p>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}

type PostType = "text" | "photo" | "video";

const POST_TYPES: { key: PostType; label: string }[] = [
  { key: "text", label: "Text" },
  { key: "photo", label: "Photo" },
  { key: "video", label: "Video" },
];

export function CommunityPostComposerModal({
  categories,
  fixedCategorySlug,
  onCreated,
}: CommunityPostComposerProps) {
  const copy = useLocalizedContent(communityCopy);
  const { status, accessToken } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [postType, setPostType] = useState<PostType>("text");
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const saved = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = saved;
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => titleRef.current?.focus(), 50);
    }
  }, [isOpen]);

  function handleOpen() {
    setIsOpen(true);
    setPostType("text");
    setFormError(null);
    setSuccessMessage(null);
  }

  function handleClose() {
    if (isSubmitting) return;
    setIsOpen(false);
  }

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
        setTimeout(() => {
          setIsOpen(false);
          setSuccessMessage(null);
        }, 1400);
      })
      .catch((caughtError) => {
        setFormError(errorMessage(caughtError, copy.posts.formErrorFallback));
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  }

  return (
    <>
      {/* Trigger card */}
      <div className="site-card flex flex-wrap items-center gap-4 p-5 sm:p-6">
        <button
          type="button"
          onClick={handleOpen}
          className="flex shrink-0 cursor-pointer items-center gap-2 min-h-11 rounded-xl border border-(--color-border) bg-foreground px-5 text-sm font-semibold text-background transition hover:opacity-90"
        >
          <span className="text-base leading-none">+</span>
          {copy.posts.createTitle}
        </button>
        <p className="site-muted text-sm leading-6">{copy.posts.createIntro}</p>
      </div>

      {/* Modal */}
      {isOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={copy.posts.createTitle}
          className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
            aria-hidden="true"
          />

          {/* Dialog */}
          <div className="site-card relative z-10 flex max-h-[92vh] w-full flex-col overflow-hidden rounded-b-none sm:max-w-2xl sm:rounded-xl">
            {/* Header: type tabs + close */}
            <div className="site-divider flex items-center justify-between border-b p-4 sm:p-5">
              <div className="flex gap-2">
                {POST_TYPES.map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    disabled={key !== "text"}
                    onClick={() => setPostType(key)}
                    className={
                      postType === key
                        ? "rounded-xl border border-(--color-accent)/30 bg-(--color-accent)/10 px-4 py-1.5 text-xs font-semibold text-(--color-accent-strong)"
                        : "cursor-default rounded-xl border border-(--color-border) bg-(--color-surface) px-4 py-1.5 text-xs font-semibold text-(--color-muted) opacity-50"
                    }
                  >
                    {label}
                    {key !== "text" ? (
                      <span className="ml-1.5 text-[10px]">· soon</span>
                    ) : null}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={handleClose}
                aria-label="Close"
                className="rounded-xl border border-(--color-border) bg-(--color-surface) px-3 py-1.5 text-sm font-semibold text-(--color-muted) transition hover:text-foreground"
              >
                &#x2715;
              </button>
            </div>

            {/* Pinned guidelines — always visible, only relevant here */}
            <Link
              href="/community/guidelines"
              onClick={handleClose}
              className="site-divider flex items-center gap-3 border-b px-5 py-3 transition hover:bg-(--color-surface) sm:px-6"
            >
              <span className="shrink-0 rounded-xl border border-(--color-border) bg-(--color-surface) px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-(--color-subtle)">
                {copy.categoryDetail.pinnedTitle}
              </span>
              <span className="min-w-0 flex-1 text-sm font-semibold">
                {copy.categoryDetail.pinnedGuidelinesTitle}
              </span>
              <span className="site-muted hidden text-sm sm:block">
                {copy.categoryDetail.pinnedGuidelinesText}
              </span>
              <span className="site-subtle ml-auto shrink-0 text-sm font-light">
                &#8594;
              </span>
            </Link>

            {/* Scrollable body */}
            <div className="overflow-y-auto">
              {status === "checking" ? (
                <div className="p-6 sm:p-7" aria-live="polite">
                  <p className="site-muted text-sm">{copy.posts.checkingSession}</p>
                </div>
              ) : !accessToken ? (
                <div className="p-6 sm:p-7">
                  <h2 className="text-xl font-semibold">
                    {copy.posts.signInTitle}
                  </h2>
                  <p className="site-muted mt-3 text-sm leading-7">
                    {copy.posts.signInText}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <Link
                      href="/login"
                      onClick={handleClose}
                      className="min-h-11 rounded-xl border border-(--color-border) bg-foreground px-5 py-3 text-sm font-semibold text-background transition hover:opacity-90"
                    >
                      {copy.posts.signInLabel}
                    </Link>
                    <Link
                      href="/register"
                      onClick={handleClose}
                      className="min-h-11 rounded-xl border border-(--color-border) bg-(--color-surface) px-5 py-3 text-sm font-semibold text-foreground transition hover:border-(--color-border-strong)"
                    >
                      {copy.posts.registerLabel}
                    </Link>
                  </div>
                </div>
              ) : postType !== "text" ? (
                <div className="p-6 text-center sm:p-7">
                  <p className="text-base font-semibold">
                    {postType === "photo" ? "Photo posts" : "Video posts"}
                  </p>
                  <p className="site-muted mt-2 text-sm">
                    Being built carefully.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="p-6 sm:p-7">
                  <div className="space-y-5">
                    {fixedCategorySlug ? null : (
                      <div>
                        <label
                          htmlFor="modal-forum-post-category"
                          className="text-sm font-semibold"
                        >
                          {copy.posts.categoryLabel}
                        </label>
                        <select
                          id="modal-forum-post-category"
                          name="forum-post-category"
                          required
                          defaultValue={categories[0]?.slug ?? ""}
                          className="mt-2 min-h-12 w-full rounded-xl border border-(--color-border) bg-background px-4 text-base text-foreground outline-none transition focus:border-(--color-accent)"
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
                        htmlFor="modal-forum-post-title"
                        className="text-sm font-semibold"
                      >
                        {copy.posts.titleLabel}
                      </label>
                      <input
                        ref={titleRef}
                        id="modal-forum-post-title"
                        name="forum-post-title"
                        type="text"
                        required
                        minLength={4}
                        maxLength={160}
                        placeholder={copy.posts.titlePlaceholder}
                        className="mt-2 min-h-12 w-full rounded-xl border border-(--color-border) bg-background px-4 text-base text-foreground outline-none transition placeholder:text-(--color-subtle) focus:border-(--color-accent)"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="modal-forum-post-body"
                        className="text-sm font-semibold"
                      >
                        {copy.posts.bodyLabel}
                      </label>
                      <textarea
                        id="modal-forum-post-body"
                        name="forum-post-body"
                        required
                        minLength={20}
                        maxLength={12000}
                        rows={6}
                        placeholder={copy.posts.bodyPlaceholder}
                        className="mt-2 w-full rounded-xl border border-(--color-border) bg-background px-4 py-3 text-base leading-7 text-foreground outline-none transition placeholder:text-(--color-subtle) focus:border-(--color-accent)"
                      />
                    </div>

                    <label className="flex gap-3 rounded-xl border border-(--color-border) bg-(--color-surface) p-4 text-sm leading-6 text-(--color-muted)">
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
                        className="rounded-xl border border-red-200 bg-red-100 p-4 text-sm leading-6 text-red-800 dark:border-red-500/30 dark:bg-red-500/15 dark:text-red-300"
                      >
                        {formError}
                      </p>
                    ) : null}

                    {successMessage ? (
                      <div
                        role="status"
                        className="rounded-xl border border-emerald-200 bg-emerald-100 p-4 text-sm leading-6 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-300"
                      >
                        <p className="font-semibold">
                          {copy.posts.createSuccessTitle}
                        </p>
                        <p className="mt-1">{successMessage}</p>
                      </div>
                    ) : null}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="min-h-12 w-full rounded-xl border border-(--color-border) bg-foreground px-5 text-sm font-semibold text-background transition hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
                    >
                      {isSubmitting
                        ? copy.posts.submitPendingLabel
                        : copy.posts.submitLabel}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
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
            className="min-h-11 rounded-xl border border-(--color-border) bg-foreground px-5 py-3 text-sm font-semibold text-background transition hover:opacity-90"
          >
            {copy.posts.signInLabel}
          </Link>
          <Link
            href="/register"
            className="min-h-11 rounded-xl border border-(--color-border) bg-(--color-surface) px-5 py-3 text-sm font-semibold text-foreground transition hover:border-(--color-border-strong)"
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
              className="mt-2 min-h-12 w-full rounded-xl border border-(--color-border) bg-(--color-surface) px-4 text-base text-foreground outline-none transition focus:border-(--color-accent)"
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
            className="mt-2 min-h-12 w-full rounded-xl border border-(--color-border) bg-(--color-surface) px-4 text-base text-foreground outline-none transition placeholder:text-(--color-subtle) focus:border-(--color-accent)"
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
            className="mt-2 w-full rounded-xl border border-(--color-border) bg-(--color-surface) px-4 py-3 text-base leading-7 text-foreground outline-none transition placeholder:text-(--color-subtle) focus:border-(--color-accent)"
          />
        </div>

        <label className="flex gap-3 rounded-xl border border-(--color-border) bg-(--color-surface) p-4 text-sm leading-6 text-(--color-muted)">
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
            className="rounded-xl border border-red-200 bg-red-100 p-4 text-sm leading-6 text-red-800 dark:border-red-500/30 dark:bg-red-500/15 dark:text-red-300"
          >
            {formError}
          </p>
        ) : null}

        {successMessage ? (
          <div
            role="status"
            className="rounded-xl border border-emerald-200 bg-emerald-100 p-4 text-sm leading-6 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-300"
          >
            <p className="font-semibold">{copy.posts.createSuccessTitle}</p>
            <p className="mt-1">{successMessage}</p>
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="min-h-12 w-full rounded-xl border border-(--color-border) bg-foreground px-5 text-sm font-semibold text-background transition hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
        >
          {isSubmitting ? copy.posts.submitPendingLabel : copy.posts.submitLabel}
        </button>
      </div>
    </form>
  );
}
