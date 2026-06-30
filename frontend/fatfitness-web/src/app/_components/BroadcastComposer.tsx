"use client";

import { useState, type FormEvent } from "react";
import { useAuth } from "@/app/_components/AuthProvider";
import { useLocalizedContent } from "@/app/_components/LocaleProvider";
import { messagesCopy } from "@/content/messages";
import { ApiError, broadcastMessage } from "@/lib/api";

const BROADCAST_ROLES = ["OWNER", "ADMIN"];

export function BroadcastComposer() {
  const copy = useLocalizedContent(messagesCopy);
  const { user, accessToken } = useAuth();
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successText, setSuccessText] = useState<string | null>(null);

  const canBroadcast =
    !!user && (user.roles ?? []).some((r) => BROADCAST_ROLES.includes(r));

  if (!canBroadcast) {
    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!accessToken || isSending || subject.trim().length < 2 || body.trim().length === 0) {
      return;
    }
    setIsSending(true);
    setError(null);
    setSuccessText(null);
    try {
      const result = await broadcastMessage(
        { subject: subject.trim(), body: body.trim() },
        accessToken,
      );
      setSuccessText(
        copy.broadcast.successText.replace("{count}", String(result.recipientCount)),
      );
      setSubject("");
      setBody("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : copy.broadcast.errorFallback);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <section className="site-card border-(--color-accent)/40 p-6 sm:p-8">
      <div className="flex items-center gap-2">
        <span className="rounded-xl border border-amber-200 bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-300">
          Admin
        </span>
        <h2 className="text-lg font-semibold">{copy.broadcast.title}</h2>
      </div>
      <p className="site-muted mt-2 text-sm leading-7">{copy.broadcast.hint}</p>

      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
        <div>
          <label className="text-xs font-bold uppercase tracking-wide text-(--color-subtle)">
            {copy.broadcast.subjectLabel}
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder={copy.broadcast.subjectPlaceholder}
            maxLength={160}
            className="mt-1.5 w-full rounded-xl border border-(--color-border) bg-(--color-surface) px-4 py-2.5 text-sm outline-none focus:border-(--color-accent) focus:ring-2 focus:ring-(--color-accent)/20"
          />
        </div>
        <div>
          <label className="text-xs font-bold uppercase tracking-wide text-(--color-subtle)">
            {copy.broadcast.bodyLabel}
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={copy.broadcast.bodyPlaceholder}
            rows={4}
            className="mt-1.5 w-full rounded-xl border border-(--color-border) bg-(--color-surface) px-4 py-3 text-sm leading-7 outline-none focus:border-(--color-accent) focus:ring-2 focus:ring-(--color-accent)/20"
          />
        </div>
        {error ? (
          <p role="alert" className="text-xs text-red-600 dark:text-red-400">
            {error}
          </p>
        ) : null}
        {successText ? (
          <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            {successText}
          </p>
        ) : null}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSending || subject.trim().length < 2 || body.trim().length === 0}
            className="min-h-10 rounded-xl bg-foreground px-5 text-sm font-semibold text-background transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSending ? copy.broadcast.sendPendingLabel : copy.broadcast.sendLabel}
          </button>
        </div>
      </form>
    </section>
  );
}
