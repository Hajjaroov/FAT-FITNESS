"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PageShell } from "@/app/_components/PageShell";
import { MyPlanWeightChart } from "@/app/_components/MyPlanWeightChart";
import { DatePicker } from "@/app/_components/DatePicker";
import { formatDateShort } from "@/lib/date";
import { useAuth } from "@/app/_components/AuthProvider";
import { useLocalizedContent } from "@/app/_components/LocaleProvider";
import { myPlanCopy } from "@/content/myplan";
import {
  addWeightEntry,
  ApiError,
  getWeightEntries,
  getWeightGoals,
  updateWeightGoals,
} from "@/lib/api";
import type { WeightEntry, WeightGoal } from "@/types/myplan";

type GoalFormState =
  | { kind: "idle" }
  | { kind: "saving" }
  | { kind: "saved" }
  | { kind: "error"; message: string };

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

function formatChangeKg(deltaKg: number): string {
  const rounded = round1(deltaKg);
  const sign = rounded > 0 ? "+" : "";
  return `${sign}${rounded} kg`;
}

function todayISODate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function MyPlanView() {
  const copy = useLocalizedContent(myPlanCopy);
  const router = useRouter();
  const { status, accessToken } = useAuth();

  const [goal, setGoal] = useState<WeightGoal | null>(null);
  const [entries, setEntries] = useState<WeightEntry[]>([]);
  const [goalLoadError, setGoalLoadError] = useState<string | null>(null);
  const [entriesLoadError, setEntriesLoadError] = useState<string | null>(null);

  const [startInput, setStartInput] = useState("");
  const [goalInput, setGoalInput] = useState("");
  const [goalForm, setGoalForm] = useState<GoalFormState>({ kind: "idle" });

  const [entryDate, setEntryDate] = useState(todayISODate());
  const [entryWeight, setEntryWeight] = useState("");
  const [entryForm, setEntryForm] = useState<EntryFormState>({ kind: "idle" });

  const goalFormRef = useRef<HTMLFormElement>(null);
  const entryFormRef = useRef<HTMLFormElement>(null);

  // Redirect to /login when not signed in
  useEffect(() => {
    if (status !== "checking" && !accessToken) {
      router.replace("/login");
    }
  }, [status, accessToken, router]);

  // Load goals and entries once the token is available
  useEffect(() => {
    if (!accessToken) return;

    let isActive = true;

    getWeightGoals(accessToken)
      .then((g) => {
        if (!isActive) return;
        setGoal(g);
        if (g.startWeight !== null) setStartInput(String(g.startWeight));
        if (g.goalWeight !== null) setGoalInput(String(g.goalWeight));
      })
      .catch(() => {
        if (isActive) setGoalLoadError(copy.weight.goalsLoadError);
      });

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
  }, [accessToken, copy.weight.goalsLoadError, copy.weight.entriesLoadError]);

  async function handleSaveGoals(e: React.FormEvent) {
    e.preventDefault();
    if (!accessToken) return;
    const start = parseFloat(startInput);
    const goalVal = parseFloat(goalInput);
    if (!Number.isFinite(start) || !Number.isFinite(goalVal) || start < 1 || goalVal < 1) return;
    setGoalForm({ kind: "saving" });
    try {
      const updated = await updateWeightGoals(start, goalVal, accessToken);
      setGoal(updated);
      setGoalForm({ kind: "saved" });
    } catch {
      setGoalForm({ kind: "error", message: copy.weight.goalsSaveError });
    }
  }

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
    } catch (err) {
      const isDuplicate = err instanceof ApiError && err.status === 409;
      setEntryForm({
        kind: "error",
        message: isDuplicate ? copy.weight.entryDuplicateError : copy.weight.entryError,
      });
    }
  }

  const hasGoals =
    goal !== null && goal.startWeight !== null && goal.goalWeight !== null;

  // Still checking or redirecting
  if (status === "checking" || !accessToken) {
    return null;
  }

  return (
    <PageShell>
      {/* Hero */}
      <section className="max-w-3xl">
        <p className="site-kicker">{copy.eyebrow}</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-normal sm:text-5xl">
          {copy.title}
        </h1>
        <p className="site-muted mt-6 text-base leading-8">
          {copy.intro}
        </p>
      </section>

      {/* Weight section */}
      <section className="site-divider mt-10 border-t pt-8">
        <h2 className="text-lg font-semibold">{copy.weight.sectionTitle}</h2>

        {goalLoadError ? (
          <p className="mt-4 text-sm text-red-800 dark:text-red-300">{goalLoadError}</p>
        ) : null}

        {/* Weight progress stats */}
        {hasGoals ? (
          <div className="site-divider mt-6 grid gap-0 border-t sm:grid-cols-3">
            {[
              {
                label: copy.weight.progressStartLabel,
                value: formatWeightKg(goal.startWeight!),
                detail: null,
              },
              {
                label: copy.weight.progressLatestLabel,
                value:
                  entries.length > 0
                    ? formatWeightKg(entries[entries.length - 1].weightKg)
                    : copy.weight.progressNoEntries,
                detail: entries.length > 0 ? formatDateShort(entries[entries.length - 1].entryDate) : null,
              },
              {
                label: copy.weight.progressChangeLabel,
                value:
                  entries.length > 0
                    ? formatChangeKg(entries[entries.length - 1].weightKg - goal.startWeight!)
                    : copy.weight.progressNoEntries,
                detail: null,
              },
            ].map((item) => (
              <div
                key={item.label}
                className="site-divider border-b py-4 text-center sm:border-b-0 sm:border-r sm:last:border-r-0 sm:px-4 sm:first:pl-0"
              >
                <p className="site-subtle text-xs">{item.label}</p>
                <p className="mt-1 text-2xl font-semibold">{item.value}</p>
                {item.detail ? (
                  <p className="site-subtle mt-0.5 text-xs">{item.detail}</p>
                ) : null}
              </div>
            ))}
          </div>
        ) : null}

        {/* Chart */}
        <div className="mt-6">
          {!hasGoals ? (
            <p className="site-muted text-sm">{copy.weight.chartPrompt}</p>
          ) : (
            <MyPlanWeightChart
              startWeight={goal.startWeight!}
              goalWeight={goal.goalWeight!}
              entries={entries}
              tooltipLabel={copy.weight.tooltipLabel}
            />
          )}
        </div>

        {/* Goals form */}
        <div className="mt-8">
          <h3 className="text-base font-semibold">{copy.weight.goalsTitle}</h3>
          <form ref={goalFormRef} onSubmit={handleSaveGoals} className="mt-4 flex flex-wrap items-end gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="startWeight" className="site-subtle text-xs font-semibold uppercase">
                {copy.weight.startWeightLabel}
              </label>
              <input
                id="startWeight"
                type="number"
                step="0.1"
                min="1"
                value={startInput}
                onChange={(e) => setStartInput(e.target.value)}
                required
                className="w-36 rounded-xl border border-(--color-border) bg-(--color-surface) px-4 py-2.5 text-sm text-foreground outline-none focus:border-(--color-border-strong)"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="goalWeight" className="site-subtle text-xs font-semibold uppercase">
                {copy.weight.goalWeightLabel}
              </label>
              <input
                id="goalWeight"
                type="number"
                step="0.1"
                min="1"
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
                required
                className="w-36 rounded-xl border border-(--color-border) bg-(--color-surface) px-4 py-2.5 text-sm text-foreground outline-none focus:border-(--color-border-strong)"
              />
            </div>
            <button
              type="submit"
              disabled={goalForm.kind === "saving"}
              className="min-h-10 rounded-xl border border-(--color-border) bg-foreground px-5 py-2.5 text-sm font-semibold text-background transition hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
            >
              {goalForm.kind === "saving" ? copy.weight.savingLabel : copy.weight.saveGoalsLabel}
            </button>
            {goalForm.kind === "saved" ? (
              <p className="text-sm text-emerald-700 dark:text-emerald-400">{copy.weight.goalsSaved}</p>
            ) : null}
            {goalForm.kind === "error" ? (
              <p className="text-sm text-red-800 dark:text-red-300">{goalForm.message}</p>
            ) : null}
          </form>
        </div>

        {/* Entry form */}
        <div className="mt-8">
          <h3 className="text-base font-semibold">{copy.weight.entryTitle}</h3>
          {entriesLoadError ? (
            <p className="mt-2 text-sm text-red-800 dark:text-red-300">{entriesLoadError}</p>
          ) : null}
          <form ref={entryFormRef} onSubmit={handleAddEntry} className="mt-4 flex flex-wrap items-end gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="entryDate" className="site-subtle text-xs font-semibold uppercase">
                {copy.weight.entryDateLabel}
              </label>
              <div className="w-44">
                <DatePicker id="entryDate" value={entryDate} onChange={setEntryDate} />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="entryWeight" className="site-subtle text-xs font-semibold uppercase">
                {copy.weight.entryWeightLabel}
              </label>
              <input
                id="entryWeight"
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
        </div>
      </section>

      {/* Diet section */}
      <section className="site-divider mt-12 border-t pt-8">
        <h2 className="text-2xl font-semibold tracking-normal">{copy.diet.title}</h2>
        <p className="site-muted mt-3 max-w-2xl text-sm leading-7">{copy.diet.summary}</p>
        <p className="mt-4">
          <Link href="/myplan/diet" className="site-text-link text-sm">
            {copy.diet.linkLabel}
          </Link>
        </p>
      </section>

      {/* Workout section */}
      <section className="site-divider mt-10 border-t pt-8">
        <h2 className="text-2xl font-semibold tracking-normal">{copy.workout.title}</h2>
        <p className="site-muted mt-3 max-w-2xl text-sm leading-7">{copy.workout.summary}</p>
        <p className="mt-4">
          <Link href="/myplan/workout" className="site-text-link text-sm">
            {copy.workout.linkLabel}
          </Link>
        </p>
      </section>

      {/* Weight Entries section */}
      <section className="site-divider mt-10 border-t pt-8">
        <h2 className="text-2xl font-semibold tracking-normal">{copy.weightEntries.title}</h2>
        <p className="site-muted mt-3 max-w-2xl text-sm leading-7">{copy.weightEntries.summary}</p>
        <p className="mt-4">
          <Link href="/myplan/weight-entries" className="site-text-link text-sm">
            {copy.weightEntries.linkLabel}
          </Link>
        </p>
      </section>

      {/* GLP-1 section */}
      <section className="site-divider mt-10 border-t pt-8">
        <h2 className="text-2xl font-semibold tracking-normal">{copy.glp1.title}</h2>
        <p className="site-muted mt-3 max-w-2xl text-sm leading-7">{copy.glp1.summary}</p>
        <p className="mt-4">
          <Link href="/myplan/glp1" className="site-text-link text-sm">
            {copy.glp1.linkLabel}
          </Link>
        </p>
      </section>
    </PageShell>
  );
}

