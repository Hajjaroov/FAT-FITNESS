"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/_components/AuthProvider";
import { useLocalizedContent } from "@/app/_components/LocaleProvider";
import { messagesCopy } from "@/content/messages";
import { ApiError, startConversation } from "@/lib/api";

type Props = {
  recipientId: string;
  recipientDisplayName: string;
};

export function MessageComposeButton({ recipientId, recipientDisplayName }: Props) {
  const copy = useLocalizedContent(messagesCopy);
  const router = useRouter();
  const { status, user, accessToken } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const saved = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = saved;
    };
  }, [isOpen]);

  // Hide the button for anonymous visitors and on your own profile.
  if (status !== "authenticated" || user?.userId === recipientId) {
    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!accessToken || isSending || subject.trim().length < 2 || body.trim().length === 0) {
      return;
    }
    setIsSending(true);
    setError(null);
    try {
      const thread = await startConversation(
        { recipientId, subject: subject.trim(), body: body.trim() },
        accessToken,
      );
      router.push(`/messages/${thread.conversationId}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : copy.compose.errorFallback);
      setIsSending(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError(null);
          setIsOpen(true);
        }}
        className="inline-flex items-center gap-1.5 rounded-xl bg-foreground px-4 py-2 text-sm font-semibold text-background transition hover:opacity-90"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m3 7 9 6 9-6" />
        </svg>
        {copy.compose.buttonLabel}
      </button>

      {isOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => (isSending ? null : setIsOpen(false))}
            aria-hidden="true"
          />
          <div className="site-card relative z-10 w-full max-h-[90vh] overflow-y-auto p-6 sm:max-w-lg sm:p-8">
            <h2 className="text-xl font-semibold">{copy.compose.title}</h2>
            <p className="site-subtle mt-1 text-sm">
              {copy.compose.toLabel}: {recipientDisplayName}
            </p>

            <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wide text-(--color-subtle)">
                  {copy.compose.subjectLabel}
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder={copy.compose.subjectPlaceholder}
                  maxLength={160}
                  className="mt-1.5 w-full rounded-xl border border-(--color-border) bg-(--color-surface) px-4 py-2.5 text-sm outline-none focus:border-(--color-accent) focus:ring-2 focus:ring-(--color-accent)/20"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wide text-(--color-subtle)">
                  {copy.compose.bodyLabel}
                </label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder={copy.compose.bodyPlaceholder}
                  rows={5}
                  className="mt-1.5 w-full rounded-xl border border-(--color-border) bg-(--color-surface) px-4 py-3 text-sm leading-7 outline-none focus:border-(--color-accent) focus:ring-2 focus:ring-(--color-accent)/20"
                />
              </div>
              {error ? (
                <p role="alert" className="text-xs text-red-600 dark:text-red-400">
                  {error}
                </p>
              ) : null}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  disabled={isSending}
                  onClick={() => setIsOpen(false)}
                  className="min-h-10 rounded-xl border border-(--color-border) px-4 text-sm font-semibold transition hover:bg-(--color-surface-raised)"
                >
                  {copy.compose.cancelLabel}
                </button>
                <button
                  type="submit"
                  disabled={isSending || subject.trim().length < 2 || body.trim().length === 0}
                  className="min-h-10 rounded-xl bg-foreground px-5 text-sm font-semibold text-background transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSending ? copy.compose.sendPendingLabel : copy.compose.sendLabel}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
