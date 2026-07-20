"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PageShell } from "@/app/_components/PageShell";
import { UserAvatar } from "@/app/_components/UserAvatar";
import { BroadcastComposer } from "@/app/_components/BroadcastComposer";
import { useAuth } from "@/app/_components/AuthProvider";
import { formatForumPostDate } from "@/app/_components/CommunityForumPosts";
import { useLocalizedContent } from "@/app/_components/LocaleProvider";
import { messagesCopy } from "@/content/messages";
import { ApiError, deleteConversation, getConversations } from "@/lib/api";
import type { ConversationSummary } from "@/types/messaging";

type LoadState =
  | { kind: "loading" }
  | { kind: "success"; conversations: ConversationSummary[] }
  | { kind: "error"; message: string };

export function MessagesInboxView() {
  const copy = useLocalizedContent(messagesCopy);
  const { status, accessToken } = useAuth();
  const [state, setState] = useState<LoadState>({ kind: "loading" });
  const [reloadKey, setReloadKey] = useState(0);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (status !== "authenticated" || !accessToken) return;

    let isActive = true;

    async function loadInbox() {
      setState({ kind: "loading" });
      try {
        const conversations = await getConversations(accessToken!);
        if (isActive) setState({ kind: "success", conversations });
      } catch (err) {
        if (isActive) {
          setState({
            kind: "error",
            message: err instanceof ApiError ? err.message : copy.inbox.errorTitle,
          });
        }
      }
    }

    loadInbox();

    return () => {
      isActive = false;
    };
  }, [status, accessToken, reloadKey, copy.inbox.errorTitle]);

  async function handleDelete(conversationId: string) {
    if (!accessToken || deletingId) return;
    setDeletingId(conversationId);
    setDeleteError(null);
    try {
      await deleteConversation(conversationId, accessToken);
      setPendingDelete(null);
      setState((prev) =>
        prev.kind === "success"
          ? {
              kind: "success",
              conversations: prev.conversations.filter(
                (c) => c.conversationId !== conversationId,
              ),
            }
          : prev,
      );
    } catch (err) {
      setDeleteError(
        err instanceof ApiError ? err.message : copy.inbox.deleteErrorFallback,
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <PageShell className="gap-8">
      <header>
        <p className="site-kicker">{copy.inbox.eyebrow}</p>
        <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">{copy.inbox.title}</h1>
        <p className="site-muted mt-3 max-w-2xl text-sm leading-7">{copy.inbox.intro}</p>
      </header>

      {status === "authenticated" ? <BroadcastComposer /> : null}

      {status === "checking" ? (
        <section className="site-card p-8 text-center sm:p-12" aria-live="polite">
          <p className="site-muted text-sm font-semibold">{copy.inbox.loading}</p>
        </section>
      ) : null}

      {status === "anonymous" ? (
        <section className="site-card p-8 text-center sm:p-12">
          <h2 className="text-xl font-semibold">{copy.inbox.signInTitle}</h2>
          <p className="site-muted mx-auto mt-3 max-w-xl text-sm leading-7">
            {copy.inbox.signInText}
          </p>
          <Link
            href="/login"
            className="mt-5 inline-block rounded-xl bg-foreground px-5 py-2.5 text-sm font-semibold text-background transition hover:opacity-90"
          >
            {copy.inbox.signInLabel}
          </Link>
        </section>
      ) : null}

      {status === "authenticated" && state.kind === "loading" ? (
        <section className="site-card p-8 text-center sm:p-12" aria-live="polite">
          <p className="site-muted text-sm font-semibold">{copy.inbox.loading}</p>
        </section>
      ) : null}

      {status === "authenticated" && state.kind === "error" ? (
        <section className="site-card p-8 text-center sm:p-12">
          <h2 className="text-xl font-semibold">{copy.inbox.errorTitle}</h2>
          <p className="site-muted mx-auto mt-3 max-w-xl text-sm leading-7">{state.message}</p>
          <button
            type="button"
            onClick={() => setReloadKey((k) => k + 1)}
            className="mt-5 inline-block rounded-xl border border-(--color-border) px-5 py-2.5 text-sm font-semibold transition hover:bg-(--color-surface)"
          >
            {copy.inbox.retryLabel}
          </button>
        </section>
      ) : null}

      {status === "authenticated" && state.kind === "success" ? (
        state.conversations.length === 0 ? (
          <section className="site-card p-8 text-center sm:p-12">
            <h2 className="text-xl font-semibold">{copy.inbox.emptyTitle}</h2>
            <p className="site-muted mx-auto mt-3 max-w-xl text-sm leading-7">
              {copy.inbox.emptyText}
            </p>
          </section>
        ) : (
          <section className="site-card overflow-hidden">
            <ul className="divide-y divide-(--color-border)">
              {state.conversations.map((conversation) => (
                <li key={conversation.conversationId} className="relative">
                  <div className="flex items-center gap-4 p-5 transition hover:bg-(--color-surface) sm:p-6">
                    <UserAvatar
                      displayName={conversation.otherParticipantDisplayName}
                      userId={conversation.otherParticipantId}
                      hasAvatar={conversation.otherParticipantHasAvatar}
                      size={40}
                    />
                    <Link
                      href={`/messages/${conversation.conversationId}`}
                      className="min-w-0 flex-1 after:absolute after:inset-0"
                    >
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-semibold text-foreground">
                          {conversation.subject}
                        </span>
                        {conversation.unread ? (
                          <span className="shrink-0 rounded-full bg-(--color-accent-strong) px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                            {copy.inbox.unreadLabel}
                          </span>
                        ) : null}
                      </div>
                      <p className="site-subtle mt-0.5 truncate text-xs">
                        {conversation.otherParticipantDisplayName} ·{" "}
                        {formatForumPostDate(conversation.lastMessageAt)}
                      </p>
                      <p
                        className={`mt-1 truncate text-sm ${
                          conversation.unread
                            ? "font-medium text-foreground"
                            : "text-(--color-muted)"
                        }`}
                      >
                        {conversation.lastMessagePreview}
                      </p>
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setDeleteError(null);
                        setPendingDelete(conversation.conversationId);
                      }}
                      className="relative z-10 shrink-0 text-xs text-(--color-subtle) transition hover:text-red-600"
                    >
                      {copy.inbox.deleteLabel}
                    </button>
                  </div>

                  {pendingDelete === conversation.conversationId ? (
                    <div className="relative z-10 border-t border-(--color-border) bg-(--color-surface) px-5 py-4 sm:px-6">
                      <p className="text-sm font-semibold">{copy.inbox.deleteConfirmText}</p>
                      {deleteError ? (
                        <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                          {deleteError}
                        </p>
                      ) : null}
                      <div className="mt-3 flex gap-2">
                        <button
                          type="button"
                          disabled={deletingId === conversation.conversationId}
                          onClick={() => void handleDelete(conversation.conversationId)}
                          className="min-h-9 rounded-xl bg-red-600 px-4 text-xs font-semibold text-white transition hover:bg-red-700 disabled:cursor-wait disabled:opacity-60"
                        >
                          {deletingId === conversation.conversationId
                            ? copy.inbox.deletePendingLabel
                            : copy.inbox.deleteConfirmLabel}
                        </button>
                        <button
                          type="button"
                          disabled={deletingId === conversation.conversationId}
                          onClick={() => setPendingDelete(null)}
                          className="min-h-9 rounded-xl border border-(--color-border) px-4 text-xs font-semibold transition hover:bg-(--color-surface-raised)"
                        >
                          {copy.inbox.cancelLabel}
                        </button>
                      </div>
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        )
      ) : null}
    </PageShell>
  );
}
