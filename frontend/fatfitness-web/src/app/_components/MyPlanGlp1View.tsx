"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageShell } from "@/app/_components/PageShell";
import { DatePicker } from "@/app/_components/DatePicker";
import { IconPencil, IconPlus, IconXMark } from "@/app/_components/icons";
import { formatDateShort } from "@/lib/date";
import { useAuth } from "@/app/_components/AuthProvider";
import { useLocalizedContent } from "@/app/_components/LocaleProvider";
import { myPlanCopy } from "@/content/myplan";
import { siteCopy } from "@/content/site";
import {
  addMedicationLogEntry,
  ApiError,
  deleteMedicationLogEntry,
  getMedicationLogEntries,
  getWeightEntries,
  getWeightGoals,
  updateMedicationLogEntry,
} from "@/lib/api";
import type { MedicationLogEntry } from "@/types/glp1";
import type { WeightEntry, WeightGoal } from "@/types/myplan";

// Built from local date parts (not toISOString, which is UTC) so users east
// of UTC don't get yesterday's date pre-filled for a few hours after midnight.
function todayISODate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function round1(value: number) {
  return Math.round(value * 10) / 10;
}

function formatChange(value: number, unit: string) {
  const rounded = round1(value);
  const sign = rounded > 0 ? "+" : "";
  return `${sign}${rounded} ${unit}`;
}

type ChangeDisplay = { kind: "value"; amount: number } | { kind: "first" };

// Reference point for "change since start": the user's explicit start weight
// if set, otherwise the earliest logged weight entry, otherwise no reference
// exists yet. Never persisted — recomputed here every render so editing the
// start weight later immediately reflects in every entry's figure.
function computeChange(
  entryDate: string,
  weightForDate: number | undefined,
  goal: WeightGoal,
  earliestWeightEntry: WeightEntry | undefined,
): ChangeDisplay | null {
  if (weightForDate === undefined) return null;

  if (goal.startWeight !== null) {
    return { kind: "value", amount: weightForDate - goal.startWeight };
  }

  if (earliestWeightEntry) {
    if (entryDate === earliestWeightEntry.entryDate) {
      return { kind: "first" };
    }
    return { kind: "value", amount: weightForDate - earliestWeightEntry.weightKg };
  }

  return null;
}

export function MyPlanGlp1View() {
  const copy = useLocalizedContent(myPlanCopy);
  const site = useLocalizedContent(siteCopy);
  const router = useRouter();
  const { status, accessToken } = useAuth();

  const [entries, setEntries] = useState<MedicationLogEntry[]>([]);
  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>([]);
  const [goal, setGoal] = useState<WeightGoal>({
    startWeight: null,
    goalWeight: null,
    updatedAt: null,
  });
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (status !== "checking" && !accessToken) {
      router.replace("/login");
    }
  }, [status, accessToken, router]);

  useEffect(() => {
    if (!accessToken) return;

    let isActive = true;

    Promise.all([
      getMedicationLogEntries(accessToken),
      getWeightEntries(accessToken),
      getWeightGoals(accessToken),
    ])
      .then(([entryList, weightList, weightGoal]) => {
        if (!isActive) return;
        setEntries(entryList);
        setWeightEntries(weightList);
        setGoal(weightGoal);
      })
      .catch(() => {
        if (isActive) setLoadError(copy.glp1.loadError);
      });

    return () => {
      isActive = false;
    };
  }, [accessToken, copy.glp1.loadError]);

  function handleEntryAdded(entry: MedicationLogEntry) {
    setEntries((prev) => [...prev, entry].sort((a, b) => a.entryDate.localeCompare(b.entryDate)));

    // The backend upserts the weight entry for this date in the same request
    // and returns its resulting value, so local weight state can be updated
    // directly without a second round trip.
    if (entry.weightKg !== null) {
      setWeightEntries((prev) => {
        const withoutDate = prev.filter((w) => w.entryDate !== entry.entryDate);
        return [
          ...withoutDate,
          { id: entry.id, entryDate: entry.entryDate, weightKg: entry.weightKg!, createdAt: entry.updatedAt },
        ].sort((a, b) => a.entryDate.localeCompare(b.entryDate));
      });
    }
  }

  function handleEntryUpdated(entry: MedicationLogEntry) {
    setEntries((prev) =>
      prev
        .map((existing) => (existing.id === entry.id ? entry : existing))
        .sort((a, b) => a.entryDate.localeCompare(b.entryDate)),
    );
  }

  function handleEntryDeleted(entryId: string) {
    setEntries((prev) => prev.filter((existing) => existing.id !== entryId));
  }

  if (status === "checking" || !accessToken) {
    return null;
  }

  const weightByDate = new Map(weightEntries.map((w) => [w.entryDate, w.weightKg]));
  const earliestWeightEntry = weightEntries[0];

  return (
    <PageShell>
      <Link href="/myplan" className="site-text-link mb-8">
        {site.links.backToMyPlan}
      </Link>

      <section className="max-w-3xl">
        <p className="site-kicker">{copy.glp1.pageEyebrow}</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-normal sm:text-5xl">
          {copy.glp1.myGlp1Title}
        </h1>
        <p className="site-muted mt-6 text-base leading-8">{copy.glp1.pageIntro}</p>
      </section>

      {loadError ? (
        <p className="mt-6 text-sm text-red-800 dark:text-red-300">{loadError}</p>
      ) : null}

      <section className="site-divider mt-10 border-t pt-8">
        <h2 className="text-lg font-semibold">{copy.glp1.entriesTitle}</h2>

        {entries.length === 0 ? (
          <p className="site-muted mt-4 text-sm">{copy.glp1.emptyEntriesText}</p>
        ) : (
          <div className="mt-6 grid gap-3">
            {entries.map((entry) => (
              <Glp1EntryRow
                key={entry.id}
                entry={entry}
                accessToken={accessToken}
                copy={copy.glp1}
                weightForDate={weightByDate.get(entry.entryDate)}
                change={computeChange(
                  entry.entryDate,
                  weightByDate.get(entry.entryDate),
                  goal,
                  earliestWeightEntry,
                )}
                onUpdated={handleEntryUpdated}
                onDeleted={() => handleEntryDeleted(entry.id)}
              />
            ))}
          </div>
        )}

        <div className="mt-6">
          <AddGlp1EntryForm
            accessToken={accessToken}
            copy={copy.glp1}
            onAdded={handleEntryAdded}
          />
        </div>
      </section>
    </PageShell>
  );
}

type Glp1Copy = typeof myPlanCopy.en.glp1;

function Glp1EntryRow({
  entry,
  accessToken,
  copy,
  weightForDate,
  change,
  onUpdated,
  onDeleted,
}: {
  entry: MedicationLogEntry;
  accessToken: string;
  copy: Glp1Copy;
  weightForDate: number | undefined;
  change: ChangeDisplay | null;
  onUpdated: (entry: MedicationLogEntry) => void;
  onDeleted: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [entryDate, setEntryDate] = useState(entry.entryDate);
  const [doseMg, setDoseMg] = useState(String(entry.doseMg));
  const [notes, setNotes] = useState(entry.notes ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const dose = parseFloat(doseMg);
    if (!entryDate || !Number.isFinite(dose) || dose <= 0) return;

    setIsSaving(true);
    setError(null);
    try {
      const updated = await updateMedicationLogEntry(
        entry.id,
        { entryDate, doseMg: dose, notes: notes.trim() || undefined },
        accessToken,
      );
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
      await deleteMedicationLogEntry(entry.id, accessToken);
      onDeleted();
    } catch {
      setError(copy.deleteError);
    }
  }

  if (!isEditing) {
    return (
      <div className="rounded-xl border border-(--color-border) px-4 py-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 text-sm sm:justify-between">
              <span className="font-semibold">{formatDateShort(entry.entryDate)}</span>
              <span>
                {entry.doseMg} {copy.doseUnit}
              </span>
              {weightForDate !== undefined ? <span>{weightForDate} kg</span> : null}
              {change !== null ? (
                <span className="site-subtle">
                  {change.kind === "first"
                    ? copy.firstEntryLabel
                    : `${copy.changeLabel}: ${formatChange(change.amount, "kg")}`}
                </span>
              ) : null}
            </div>
            {entry.notes ? <p className="site-muted mt-1 text-xs">{entry.notes}</p> : null}
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
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label htmlFor={`edit-date-${entry.id}`} className="text-sm font-semibold">
            {copy.dateLabel}
          </label>
          <div className="mt-2">
            <DatePicker id={`edit-date-${entry.id}`} value={entryDate} onChange={setEntryDate} />
          </div>
        </div>
        <div>
          <label htmlFor={`edit-dose-${entry.id}`} className="text-sm font-semibold">
            {copy.doseLabel} ({copy.doseUnit})
          </label>
          <input
            id={`edit-dose-${entry.id}`}
            type="number"
            step="0.01"
            min="0.01"
            value={doseMg}
            onChange={(e) => setDoseMg(e.target.value)}
            required
            className="mt-2 min-h-11 w-full rounded-xl border border-(--color-border) bg-(--color-surface) px-4 text-sm text-foreground outline-none focus:border-(--color-accent)"
          />
        </div>
        <div className="sm:col-span-3">
          <label htmlFor={`edit-notes-${entry.id}`} className="text-sm font-semibold">
            {copy.notesLabel}
          </label>
          <textarea
            id={`edit-notes-${entry.id}`}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={copy.notesPlaceholder}
            rows={2}
            maxLength={1000}
            className="mt-2 w-full rounded-xl border border-(--color-border) bg-(--color-surface) px-4 py-3 text-sm text-foreground outline-none focus:border-(--color-accent)"
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
            setEntryDate(entry.entryDate);
            setDoseMg(String(entry.doseMg));
            setNotes(entry.notes ?? "");
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

function AddGlp1EntryForm({
  accessToken,
  copy,
  onAdded,
}: {
  accessToken: string;
  copy: Glp1Copy;
  onAdded: (entry: MedicationLogEntry) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [entryDate, setEntryDate] = useState(todayISODate());
  const [doseMg, setDoseMg] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function resetForm() {
    setEntryDate(todayISODate());
    setDoseMg("");
    setWeightKg("");
    setNotes("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const dose = parseFloat(doseMg);
    if (!entryDate || !Number.isFinite(dose) || dose <= 0) return;

    const weightValue = weightKg.trim() === "" ? null : parseFloat(weightKg);
    if (weightValue !== null && (!Number.isFinite(weightValue) || weightValue <= 0)) return;

    setIsSaving(true);
    setError(null);
    try {
      const entry = await addMedicationLogEntry(
        {
          entryDate,
          doseMg: dose,
          notes: notes.trim() || undefined,
          weightKg: weightValue ?? undefined,
        },
        accessToken,
      );
      onAdded(entry);
      resetForm();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : copy.addError);
    } finally {
      setIsSaving(false);
    }
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-(--color-border) bg-background p-4 text-sm font-semibold text-(--color-muted) transition hover:border-(--color-border-strong) hover:text-foreground"
      >
        <IconPlus />
        {copy.addEntryLabel}
      </button>
    );
  }

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      className="rounded-xl border border-dashed border-(--color-border) bg-background p-4"
    >
      <p className="site-subtle text-xs font-bold uppercase tracking-[0.14em]">
        {copy.addEntryLabel}
      </p>

      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <div>
          <label htmlFor="glp1-date" className="text-sm font-semibold">
            {copy.dateLabel}
          </label>
          <div className="mt-2">
            <DatePicker id="glp1-date" value={entryDate} onChange={setEntryDate} />
          </div>
        </div>
        <div>
          <label htmlFor="glp1-dose" className="text-sm font-semibold">
            {copy.doseLabel} ({copy.doseUnit})
          </label>
          <input
            id="glp1-dose"
            type="number"
            step="0.01"
            min="0.01"
            value={doseMg}
            onChange={(e) => setDoseMg(e.target.value)}
            required
            className="mt-2 min-h-11 w-full rounded-xl border border-(--color-border) bg-(--color-surface) px-4 text-sm text-foreground outline-none focus:border-(--color-accent)"
          />
        </div>
        <div>
          <label htmlFor="glp1-weight" className="text-sm font-semibold">
            {copy.weightLabel}
          </label>
          <input
            id="glp1-weight"
            type="number"
            step="0.01"
            min="0.01"
            value={weightKg}
            onChange={(e) => setWeightKg(e.target.value)}
            className="mt-2 min-h-11 w-full rounded-xl border border-(--color-border) bg-(--color-surface) px-4 text-sm text-foreground outline-none focus:border-(--color-accent)"
          />
        </div>
        <div className="sm:col-span-3">
          <label htmlFor="glp1-notes" className="text-sm font-semibold">
            {copy.notesLabel}
          </label>
          <textarea
            id="glp1-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={copy.notesPlaceholder}
            rows={2}
            maxLength={1000}
            className="mt-2 w-full rounded-xl border border-(--color-border) bg-(--color-surface) px-4 py-3 text-sm text-foreground outline-none focus:border-(--color-accent)"
          />
          <p className="site-muted mt-1 text-xs">{copy.weightHint}</p>
        </div>
      </div>

      {error ? <p className="mt-3 text-xs text-red-800 dark:text-red-300">{error}</p> : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={isSaving}
          className="min-h-10 rounded-xl border border-(--color-border) bg-foreground px-5 text-sm font-semibold text-background transition hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
        >
          {isSaving ? copy.savingLabel : copy.addEntryLabel}
        </button>
        <button
          type="button"
          onClick={() => {
            resetForm();
            setIsOpen(false);
          }}
          className="min-h-10 rounded-xl border border-(--color-border) bg-background px-5 text-sm font-semibold text-foreground transition hover:border-(--color-border-strong)"
        >
          {copy.cancelLabel}
        </button>
      </div>
    </form>
  );
}
