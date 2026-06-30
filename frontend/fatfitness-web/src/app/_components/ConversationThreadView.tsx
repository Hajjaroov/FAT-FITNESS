"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { PageShell } from "@/app/_components/PageShell";
import { UserAvatar } from "@/app/_components/UserAvatar";
import { useAuth } from "@/app/_components/AuthProvider";
import { formatForumPostDate } from "@/app/_components/CommunityForumPosts";
import { useLocale, useLocalizedContent } from "@/app/_components/LocaleProvider";
import { messagesCopy } from "@/content/messages";
import { ApiError, getConversation, replyToConversation } from "@/lib/api";
import type { ConversationThread } from "@/types/messaging";

type Props = {
  conversationId: string;
};

type LoadState =
  | { kind: "loading" }
  | { kind: "success"; thread: ConversationThread }
  | { kind: "error"; message: string };

export function ConversationThreadView({ conversationId }: Props) {
  const copy = useLocalizedContent(messagesCopy);
  const { locale } = useLocale();
  const { status, accessToken, user } = useAuth();
  const [state, setState] = useState<LoadState>({ kind: "loading" });
  const [replyBody, setReplyBody] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (status !== "authenticated" || !accessToken) return;

    let isActive = true;

    async function loadThread() {
      setState({ kind: "loading" });
      try {
        const thread = await getConversation(conversationId, accessToken!);
        if (isActive) setState({ kind: "success", thread });
      } catch (err) {
        if (isActive) {
          setState({
            kind: "error",
            message: err instanceof ApiError ? err.message : copy.thread.errorTitle,
          });
        }
      }
    }

    loadThread();

    return () => {
      isActive = false;
    };
  }, [status, accessToken, conversationId, copy.thread.errorTitle]);

  useEffect(() => {
    if (state.kind === "success") {
      bottomRef.current?.scrollIntoView({ block: "end" });
    }
  }, [state]);

  async function handleReply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!accessToken || isSending || replyBody.trim().length === 0) return;
    setIsSending(true);
    setReplyError(null);
    try {
      const message = await replyToConversation(
        conversationId,
        { body: replyBody.trim() },
        accessToken,
      );
      setReplyBody("");
      setState((prev) =>
        prev.kind === "success"
          ? { kind: "success", thread: { ...prev.thread, messages: [...prev.thread.messages, message] } }
          : prev,
      );
    } catch (err) {
      setReplyError(
        err instanceof ApiError ? err.message : copy.thread.replyErrorFallback,
      );
    } finally {
      setIsSending(false);
    }
  }

  return (
    <PageShell className="gap-6">
      <Link href="/messages" className="site-text-link">
        ← {copy.thread.backLabel}
      </Link>

      {status === "checking" || (status === "authenticated" && state.kind === "loading") ? (
        <section className="site-card p-8 text-center sm:p-12" aria-live="polite">
          <p className="site-muted text-sm font-semibold">{copy.thread.loading}</p>
        </section>
      ) : null}

      {status === "anonymous" ? (
        <section className="site-card p-8 text-center sm:p-12">
          <h1 className="text-xl font-semibold">{copy.inbox.signInTitle}</h1>
          <Link
            href="/login"
            className="mt-5 inline-block rounded-xl bg-foreground px-5 py-2.5 text-sm font-semibold text-background transition hover:opacity-90"
          >
            {copy.inbox.signInLabel}
          </Link>
        </section>
      ) : null}

      {status === "authenticated" && state.kind === "error" ? (
        <section className="site-card p-8 text-center sm:p-12">
          <h1 className="text-xl font-semibold">{copy.thread.errorTitle}</h1>
          <p className="site-muted mx-auto mt-3 max-w-xl text-sm leading-7">{state.message}</p>
        </section>
      ) : null}

      {status === "authenticated" && state.kind === "success" ? (
        <section className="site-card flex flex-col overflow-hidden">
          <header className="site-divider flex items-center gap-3 border-b p-5 sm:p-6">
            <UserAvatar
              displayName={state.thread.otherParticipantDisplayName}
              userId={state.thread.otherParticipantId}
              hasAvatar={state.thread.otherParticipantHasAvatar}
              size={40}
            />
            <div className="min-w-0">
              <h1 className="truncate text-lg font-semibold">{state.thread.subject}</h1>
              <Link
                href={`/users/${state.thread.otherParticipantId}`}
                className="site-subtle text-xs transition hover:text-(--color-accent-strong)"
              >
                {copy.thread.withLabel} {state.thread.otherParticipantDisplayName}
              </Link>
            </div>
          </header>

          <div className="flex flex-col gap-3 p-5 sm:p-6">
            {state.thread.messages.map((message) => {
              const mine = user?.userId === message.senderId;
              return (
                <div
                  key={message.id}
                  className={`flex flex-col ${mine ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-xl px-4 py-2.5 text-sm leading-7 ${
                      mine
                        ? "bg-foreground text-background"
                        : "bg-(--color-surface-raised) text-foreground"
                    }`}
                  >
                    <p className="whitespace-pre-wrap wrap-break-word">{message.body}</p>
                  </div>
                  <span className="site-subtle mt-1 text-[11px]">
                    {mine ? copy.thread.youLabel : message.senderDisplayName} ·{" "}
                    {formatForumPostDate(message.sentAt, locale)}
                  </span>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          <form
            onSubmit={handleReply}
            className="site-divider border-t p-4 sm:p-5"
          >
            <textarea
              value={replyBody}
              onChange={(e) => setReplyBody(e.target.value)}
              placeholder={copy.thread.replyPlaceholder}
              rows={3}
              className="w-full rounded-xl border border-(--color-border) bg-(--color-surface) px-4 py-3 text-sm leading-7 outline-none focus:border-(--color-accent) focus:ring-2 focus:ring-(--color-accent)/20"
            />
            {replyError ? (
              <p role="alert" className="mt-2 text-xs text-red-600 dark:text-red-400">
                {replyError}
              </p>
            ) : null}
            <div className="mt-2 flex justify-end">
              <button
                type="submit"
                disabled={isSending || replyBody.trim().length === 0}
                className="min-h-10 rounded-xl bg-foreground px-5 text-sm font-semibold text-background transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSending ? copy.thread.replyPendingLabel : copy.thread.replyLabel}
              </button>
            </div>
          </form>
        </section>
      ) : null}
    </PageShell>
  );
}
