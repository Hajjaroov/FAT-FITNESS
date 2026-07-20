"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageShell } from "@/app/_components/PageShell";
import { DatePicker } from "@/app/_components/DatePicker";
import { IconPencil, IconXMark } from "@/app/_components/icons";
import { formatDateShort } from "@/lib/date";
import { useAuth } from "@/app/_components/AuthProvider";
import { useLocalizedContent } from "@/app/_components/LocaleProvider";
import { myPlanCopy } from "@/content/myplan";
import { siteCopy } from "@/content/site";
import {
  addWeightEntry,
  deleteWeightEntry,
  getWeightEntries,
  updateWeightEntry,
} from "@/lib/api";
import type { WeightEntry } from "@/types/myplan";

type EntryFormState =
  | { kind: "idle" }
  | { kind: "saving" }
  | { kind: "saved" }
  | { kind: "error"; message: string };

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function formatWeightKg(weightKg: number): string {
  return `${round1(weightKg)} kg`;
}

function todayISODate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function MyPlanWeightEntriesView() {
  const copy = useLocalizedContent(myPlanCopy);
  const site = useLocalizedContent(siteCopy);
  const router = useRouter();
  const { status, accessToken } = useAuth();

  const [entries, setEntries] = useState<WeightEntry[]>([]);
  const [entriesLoadError, setEntriesLoadError] = useState<string | null>(null);

  const [entryDate, setEntryDate] = useState(todayISODate());
  const [entryWeight, setEntryWeight] = useState("");
  const [entryForm, setEntryForm] = useState<EntryFormState>({ kind: "idle" });

  useEffect(() => {
    if (status !== "checking" && !accessToken) {
      router.replace("/login");
    }
  }, [status, accessToken, router]);

  useEffect(() => {
    if (!accessToken) return;
    let isActive = true;

    getWeightEntries(accessToken)
      .then((list) => {
        if (isActive) setEntries(list);
      })
      .catch(() => {
        if (isActive) setEntriesLoadError(copy.weight.entriesLoadError);
      });

    return () => {
      isActive = false;
    };
  }, [accessToken, copy.weight.entriesLoadError]);

  async function handleAddEntry(e: React.FormEvent) {
    e.preventDefault();
    if (!accessToken) return;
    const kg = parseFloat(entryWeight);
    if (!Number.isFinite(kg) || kg < 1) return;
    setEntryForm({ kind: "saving" });
    try {
      const added = await addWeightEntry(entryDate, kg, accessToken);
      setEntries((prev) => {
        const next = [...prev.filter((en) => en.entryDate !== added.entryDate), added];
        return next.sort((a, b) => a.entryDate.localeCompare(b.entryDate));
      });
      setEntryWeight("");
      setEntryDate(todayISODate());
      setEntryForm({ kind: "saved" });
    } catch {
      setEntryForm({ kind: "error", message: copy.weight.entryError });
    }
  }

  function handleEntryUpdated(updated: WeightEntry) {
    setEntries((prev) =>
      prev
        .map((existing) => (existing.id === updated.id ? updated : existing))
        .sort((a, b) => a.entryDate.localeCompare(b.entryDate)),
    );
  }

  function handleEntryDeleted(entryId: string) {
    setEntries((prev) => prev.filter((existing) => existing.id !== entryId));
  }

  if (status === "checking" || !accessToken) {
    return null;
  }

  return (
    <PageShell>
      <Link href="/myplan" className="site-text-link mb-8">
        {site.links.backToMyPlan}
      </Link>

      <section className="max-w-3xl">
        <p className="site-kicker">{copy.weightEntries.pageEyebrow}</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-normal sm:text-5xl">
          {copy.weightEntries.myWeightEntriesTitle}
        </h1>
        <p className="site-muted mt-6 text-base leading-8">
          {copy.weightEntries.pageIntro}
        </p>
      </section>

      <section className="site-divider mt-10 border-t pt-8">
        {entriesLoadError ? (
          <p className="mt-2 text-sm text-red-800 dark:text-red-300">{entriesLoadError}</p>
        ) : null}

        {/* Add entry */}
        <form onSubmit={(e) => void handleAddEntry(e)} className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="weightEntriesDate" className="site-subtle text-xs font-semibold uppercase">
              {copy.weight.entryDateLabel}
            </label>
            <div className="w-44">
              <DatePicker id="weightEntriesDate" value={entryDate} onChange={setEntryDate} />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="weightEntriesWeight" className="site-subtle text-xs font-semibold uppercase">
              {copy.weight.entryWeightLabel}
            </label>
            <input
              id="weightEntriesWeight"
              type="number"
              step="0.1"
              min="1"
              value={entryWeight}
              onChange={(e) => setEntryWeight(e.target.value)}
              required
              className="w-36 rounded-xl border border-(--color-border) bg-(--color-surface) px-4 py-2.5 text-sm text-foreground outline-none focus:border-(--color-border-strong)"
            />
          </div>
          <button
            type="submit"
            disabled={entryForm.kind === "saving"}
            className="min-h-10 rounded-xl border border-(--color-border) bg-foreground px-5 py-2.5 text-sm font-semibold text-background transition hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
          >
            {entryForm.kind === "saving" ? copy.weight.addingLabel : copy.weight.addEntryLabel}
          </button>
          {entryForm.kind === "saved" ? (
            <p className="text-sm text-emerald-700 dark:text-emerald-400">{copy.weight.entryAdded}</p>
          ) : null}
          {entryForm.kind === "error" ? (
            <p className="text-sm text-red-800 dark:text-red-300">{entryForm.message}</p>
          ) : null}
        </form>

        {/* Entries list */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold">{copy.weight.entriesTitle}</h2>
          {entries.length === 0 ? (
            <p className="site-muted mt-4 text-sm">{copy.weight.progressNoEntries}</p>
          ) : (
            <div className="mt-4 grid gap-3">
              {entries.map((entry) => (
                <WeightEntryRow
                  key={entry.id}
                  entry={entry}
                  accessToken={accessToken}
                  copy={copy.weight}
                  onUpdated={handleEntryUpdated}
                  onDeleted={() => handleEntryDeleted(entry.id)}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </PageShell>
  );
}

type WeightCopy = typeof myPlanCopy.en.weight;

function WeightEntryRow({
  entry,
  accessToken,
  copy,
  onUpdated,
  onDeleted,
}: {
  entry: WeightEntry;
  accessToken: string;
  copy: WeightCopy;
  onUpdated: (entry: WeightEntry) => void;
  onDeleted: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [weightKg, setWeightKg] = useState(String(entry.weightKg));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const weight = parseFloat(weightKg);
    if (!Number.isFinite(weight) || weight <= 0) return;

    setIsSaving(true);
    setError(null);
    try {
      const updated = await updateWeightEntry(entry.id, weight, accessToken);
      onUpdated(updated);
      setIsEditing(false);
    } catch {
      setError(copy.updateError);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm(copy.deleteEntryConfirm)) return;
    setError(null);
    try {
      await deleteWeightEntry(entry.id, accessToken);
      onDeleted();
    } catch {
      setError(copy.deleteError);
    }
  }

  if (!isEditing) {
    return (
      <div className="rounded-xl border border-(--color-border) px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 text-sm">
            <span className="font-semibold">{formatDateShort(entry.entryDate)}</span>
            <span>{formatWeightKg(entry.weightKg)}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              aria-label={copy.editLabel}
              className="flex min-h-9 min-w-9 items-center justify-center rounded-xl border border-(--color-border) bg-background text-foreground transition hover:border-(--color-border-strong)"
            >
              <IconPencil />
            </button>
            <button
              type="button"
              onClick={() => void handleDelete()}
              aria-label={copy.deleteLabel}
              className="flex min-h-9 min-w-9 items-center justify-center rounded-xl border border-(--color-border) bg-background text-foreground transition hover:border-(--color-border-strong)"
            >
              <IconXMark />
            </button>
          </div>
        </div>
        {error ? <p className="mt-2 text-xs text-red-800 dark:text-red-300">{error}</p> : null}
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => void handleSave(e)}
      className="rounded-xl border border-(--color-border) p-4"
    >
      <div className="flex flex-wrap items-end gap-3">
        <span className="site-subtle text-sm font-semibold">{formatDateShort(entry.entryDate)}</span>
        <div>
          <label htmlFor={`edit-weight-${entry.id}`} className="text-sm font-semibold">
            {copy.entryWeightLabel}
          </label>
          <input
            id={`edit-weight-${entry.id}`}
            type="number"
            step="0.1"
            min="1"
            value={weightKg}
            onChange={(e) => setWeightKg(e.target.value)}
            required
            className="mt-2 min-h-11 w-36 rounded-xl border border-(--color-border) bg-(--color-surface) px-4 text-sm text-foreground outline-none focus:border-(--color-accent)"
          />
        </div>
      </div>

      {error ? <p className="mt-3 text-xs text-red-800 dark:text-red-300">{error}</p> : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={isSaving}
          className="min-h-10 rounded-xl border border-(--color-border) bg-foreground px-5 text-sm font-semibold text-background transition hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
        >
          {isSaving ? copy.savingLabel : copy.saveLabel}
        </button>
        <button
          type="button"
          onClick={() => {
            setWeightKg(String(entry.weightKg));
            setIsEditing(false);
          }}
          className="min-h-10 rounded-xl border border-(--color-border) bg-background px-5 text-sm font-semibold text-foreground transition hover:border-(--color-border-strong)"
        >
          {copy.cancelLabel}
        </button>
      </div>
    </form>
  );
}
