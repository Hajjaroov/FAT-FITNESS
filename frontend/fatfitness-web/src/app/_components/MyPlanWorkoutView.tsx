"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageShell } from "@/app/_components/PageShell";
import { ExerciseCombobox } from "@/app/_components/ExerciseCombobox";
import { IconChevronDown, IconChevronUp, IconPencil, IconPlus, IconXMark } from "@/app/_components/icons";
import { useAuth } from "@/app/_components/AuthProvider";
import { useLocale, useLocalizedContent } from "@/app/_components/LocaleProvider";
import { myPlanCopy } from "@/content/myplan";
import { siteCopy } from "@/content/site";
import {
  addWorkoutPlanDay,
  addWorkoutPlanDayExercise,
  deleteWorkoutPlanDay,
  deleteWorkoutPlanDayExercise,
  getExercises,
  getWorkoutPlan,
  reorderWorkoutPlanDays,
  updateWorkoutPlanDay,
  updateWorkoutPlanDayExercise,
} from "@/lib/api";
import type {
  Exercise,
  Weekday,
  WorkoutPlanDay,
  WorkoutPlanDayExercise,
} from "@/types/workout";

const MAX_PLAN_DAYS = 50;

const WEEKDAY_ORDER: Weekday[] = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

// A plan item shows the shared catalog's German name when the UI is German
// and the item is still linked to a catalog entry; otherwise the snapshotted
// name it was added with.
function localizedItemName(
  item: WorkoutPlanDayExercise,
  exercises: Exercise[],
  locale: string,
) {
  if (locale === "de" && item.exerciseId) {
    const exercise = exercises.find((candidate) => candidate.id === item.exerciseId);
    if (exercise?.nameDe) {
      return exercise.nameDe;
    }
  }
  return item.name;
}

export function MyPlanWorkoutView() {
  const copy = useLocalizedContent(myPlanCopy);
  const site = useLocalizedContent(siteCopy);
  const router = useRouter();
  const { status, accessToken } = useAuth();

  const [days, setDays] = useState<WorkoutPlanDay[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [dayActionError, setDayActionError] = useState<string | null>(null);

  useEffect(() => {
    if (status !== "checking" && !accessToken) {
      router.replace("/login");
    }
  }, [status, accessToken, router]);

  useEffect(() => {
    if (!accessToken) return;

    let isActive = true;

    Promise.all([getWorkoutPlan(accessToken), getExercises(accessToken)])
      .then(([dayList, exerciseList]) => {
        if (!isActive) return;
        setDays(dayList);
        setExercises(exerciseList);
      })
      .catch(() => {
        if (isActive) setLoadError(copy.workout.loadError);
      });

    return () => {
      isActive = false;
    };
  }, [accessToken, copy.workout.loadError]);

  async function handleAddDay(title: string, weekday: Weekday | "") {
    if (!accessToken) return;
    setDayActionError(null);
    const day = await addWorkoutPlanDay(
      {
        title: title.trim() || undefined,
        weekday: weekday || undefined,
      },
      accessToken,
    );
    setDays((prev) => [...prev, day]);
  }

  async function handleUpdateDay(dayId: string, title: string, weekday: Weekday | "") {
    if (!accessToken) return;
    try {
      const updated = await updateWorkoutPlanDay(
        dayId,
        { title, weekday: weekday || undefined },
        accessToken,
      );
      setDays((prev) =>
        prev.map((d) =>
          d.id === dayId ? { ...d, title: updated.title, weekday: updated.weekday } : d,
        ),
      );
    } catch {
      setDayActionError(copy.workout.dayRenameError);
    }
  }

  async function handleDeleteDay(dayId: string) {
    if (!accessToken) return;
    if (!window.confirm(copy.workout.deleteDayConfirm)) return;
    try {
      await deleteWorkoutPlanDay(dayId, accessToken);
      setDays((prev) => prev.filter((d) => d.id !== dayId));
    } catch {
      setDayActionError(copy.workout.dayDeleteError);
    }
  }

  async function handleMoveDay(dayId: string, direction: -1 | 1) {
    if (!accessToken) return;
    const index = days.findIndex((d) => d.id === dayId);
    const targetIndex = index + direction;
    if (index < 0 || targetIndex < 0 || targetIndex >= days.length) return;

    const previousDays = days;
    const reordered = [...days];
    [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];
    setDays(reordered);

    try {
      const updated = await reorderWorkoutPlanDays(
        reordered.map((d) => d.id),
        accessToken,
      );
      setDays(updated);
    } catch {
      setDays(previousDays);
      setDayActionError(copy.workout.dayReorderError);
    }
  }

  function handleExerciseAdded(dayId: string, item: WorkoutPlanDayExercise) {
    setDays((prev) =>
      prev.map((d) => (d.id === dayId ? { ...d, exercises: [...d.exercises, item] } : d)),
    );
  }

  async function refetchExercises() {
    if (!accessToken) return;
    try {
      const exerciseList = await getExercises(accessToken);
      setExercises(exerciseList);
    } catch {
      // Best-effort: the newly added/reused exercise simply stays out of local
      // suggestions until the next full page load.
    }
  }

  function handleExerciseUpdated(dayId: string, item: WorkoutPlanDayExercise) {
    setDays((prev) =>
      prev.map((d) =>
        d.id === dayId
          ? {
              ...d,
              exercises: d.exercises.map((existing) => (existing.id === item.id ? item : existing)),
            }
          : d,
      ),
    );
  }

  function handleExerciseDeleted(dayId: string, itemId: string) {
    setDays((prev) =>
      prev.map((d) =>
        d.id === dayId
          ? { ...d, exercises: d.exercises.filter((existing) => existing.id !== itemId) }
          : d,
      ),
    );
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
        <p className="site-kicker">{copy.workout.pageEyebrow}</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-normal sm:text-5xl">
          {copy.workout.myWorkoutTitle}
        </h1>
        <p className="site-muted mt-6 text-base leading-8">{copy.workout.pageIntro}</p>
      </section>

      {loadError ? (
        <p className="mt-6 text-sm text-red-800 dark:text-red-300">{loadError}</p>
      ) : null}

      <section className="site-divider mt-10 border-t pt-8">
        <AddDayForm
          copy={copy.workout}
          disabled={days.length >= MAX_PLAN_DAYS}
          onAdd={handleAddDay}
        />

        {dayActionError ? (
          <p className="mt-3 text-sm text-red-800 dark:text-red-300">{dayActionError}</p>
        ) : null}

        {days.length === 0 ? (
          <p className="site-muted mt-8 text-sm">{copy.workout.emptyDaysText}</p>
        ) : (
          <div className="mt-8 grid gap-6">
            {days.map((day, index) => (
              <WorkoutDayCard
                key={day.id}
                day={day}
                exercises={exercises}
                accessToken={accessToken}
                copy={copy.workout}
                isFirst={index === 0}
                isLast={index === days.length - 1}
                onUpdate={(title, weekday) => handleUpdateDay(day.id, title, weekday)}
                onDelete={() => handleDeleteDay(day.id)}
                onMove={(direction) => handleMoveDay(day.id, direction)}
                onExerciseAdded={(item) => handleExerciseAdded(day.id, item)}
                onExercisesRefetchNeeded={refetchExercises}
                onExerciseUpdated={(item) => handleExerciseUpdated(day.id, item)}
                onExerciseDeleted={(itemId) => handleExerciseDeleted(day.id, itemId)}
              />
            ))}
          </div>
        )}
      </section>
    </PageShell>
  );
}

type WorkoutCopy = typeof myPlanCopy.en.workout;

function WeekdaySelect({
  id,
  copy,
  value,
  onChange,
}: {
  id: string;
  copy: WorkoutCopy;
  value: Weekday | "";
  onChange: (value: Weekday | "") => void;
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value as Weekday | "")}
      className="min-h-11 rounded-xl border border-(--color-border) bg-(--color-surface) px-3 text-sm text-foreground outline-none focus:border-(--color-accent)"
    >
      <option value="">{copy.noWeekdayOption}</option>
      {WEEKDAY_ORDER.map((weekday) => (
        <option key={weekday} value={weekday}>
          {copy.weekdays[weekday]}
        </option>
      ))}
    </select>
  );
}

function AddDayForm({
  copy,
  disabled,
  onAdd,
}: {
  copy: WorkoutCopy;
  disabled: boolean;
  onAdd: (title: string, weekday: Weekday | "") => Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [weekday, setWeekday] = useState<Weekday | "">("");
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsAdding(true);
    setError(null);
    try {
      await onAdd(title, weekday);
      setTitle("");
      setWeekday("");
    } catch {
      setError(copy.dayAddError);
    } finally {
      setIsAdding(false);
    }
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="add-day-weekday" className="site-subtle text-xs font-semibold uppercase">
          {copy.weekdayLabel}
        </label>
        <WeekdaySelect id="add-day-weekday" copy={copy} value={weekday} onChange={setWeekday} />
      </div>
      <div className="flex min-w-56 flex-1 flex-col gap-1.5 sm:max-w-xs">
        <label htmlFor="add-day-title" className="site-subtle text-xs font-semibold uppercase">
          {copy.dayTitleLabel}
        </label>
        <input
          id="add-day-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={copy.addDayTitlePlaceholder}
          className="min-h-11 w-full rounded-xl border border-(--color-border) bg-(--color-surface) px-4 text-sm text-foreground outline-none focus:border-(--color-accent)"
        />
      </div>
      <div className="flex flex-col items-start gap-1">
        <button
          type="submit"
          disabled={isAdding || disabled}
          className="flex min-h-11 items-center gap-2 rounded-xl border border-(--color-border) bg-foreground px-5 text-sm font-semibold text-background transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <IconPlus />
          {copy.addDayLabel}
        </button>
        {disabled ? <p className="site-muted text-xs">{copy.maxDaysHint}</p> : null}
      </div>
      {error ? <p className="w-full text-sm text-red-800 dark:text-red-300">{error}</p> : null}
    </form>
  );
}

function WorkoutDayCard({
  day,
  exercises,
  accessToken,
  copy,
  isFirst,
  isLast,
  onUpdate,
  onDelete,
  onMove,
  onExerciseAdded,
  onExercisesRefetchNeeded,
  onExerciseUpdated,
  onExerciseDeleted,
}: {
  day: WorkoutPlanDay;
  exercises: Exercise[];
  accessToken: string;
  copy: WorkoutCopy;
  isFirst: boolean;
  isLast: boolean;
  onUpdate: (title: string, weekday: Weekday | "") => void;
  onDelete: () => void;
  onMove: (direction: -1 | 1) => void;
  onExerciseAdded: (item: WorkoutPlanDayExercise) => void;
  onExercisesRefetchNeeded: () => Promise<void>;
  onExerciseUpdated: (item: WorkoutPlanDayExercise) => void;
  onExerciseDeleted: (itemId: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [titleInput, setTitleInput] = useState(day.title);
  const [weekdayInput, setWeekdayInput] = useState<Weekday | "">(day.weekday ?? "");

  return (
    <article className="rounded-xl border border-(--color-border) p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          {isEditing ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (titleInput.trim()) {
                  onUpdate(titleInput.trim(), weekdayInput);
                }
                setIsEditing(false);
              }}
              className="flex flex-wrap items-center gap-2"
            >
              <label htmlFor={`day-weekday-${day.id}`} className="sr-only">
                {copy.weekdayLabel}
              </label>
              <WeekdaySelect
                id={`day-weekday-${day.id}`}
                copy={copy}
                value={weekdayInput}
                onChange={setWeekdayInput}
              />
              <label htmlFor={`day-title-${day.id}`} className="sr-only">
                {copy.dayTitleLabel}
              </label>
              <input
                id={`day-title-${day.id}`}
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                autoFocus
                className="min-h-10 rounded-xl border border-(--color-border) bg-(--color-surface) px-3 text-lg font-semibold text-foreground outline-none focus:border-(--color-accent)"
              />
              <button
                type="submit"
                className="min-h-10 rounded-xl border border-(--color-border) bg-foreground px-4 text-sm font-semibold text-background transition hover:opacity-90"
              >
                {copy.saveLabel}
              </button>
              <button
                type="button"
                onClick={() => {
                  setTitleInput(day.title);
                  setWeekdayInput(day.weekday ?? "");
                  setIsEditing(false);
                }}
                className="min-h-10 rounded-xl border border-(--color-border) bg-background px-4 text-sm font-semibold text-foreground transition hover:border-(--color-border-strong)"
              >
                {copy.cancelLabel}
              </button>
            </form>
          ) : (
            <>
              {day.weekday ? (
                <p className="site-kicker">{copy.weekdays[day.weekday]}</p>
              ) : null}
              <h3 className={`text-xl font-semibold ${day.weekday ? "mt-1" : ""}`}>
                {day.title}
              </h3>
            </>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={isFirst}
            onClick={() => onMove(-1)}
            aria-label={copy.moveUpLabel}
            className="flex min-h-9 min-w-9 items-center justify-center rounded-xl border border-(--color-border) bg-background text-foreground transition hover:border-(--color-border-strong) disabled:cursor-not-allowed disabled:opacity-40"
          >
            <IconChevronUp />
          </button>
          <button
            type="button"
            disabled={isLast}
            onClick={() => onMove(1)}
            aria-label={copy.moveDownLabel}
            className="flex min-h-9 min-w-9 items-center justify-center rounded-xl border border-(--color-border) bg-background text-foreground transition hover:border-(--color-border-strong) disabled:cursor-not-allowed disabled:opacity-40"
          >
            <IconChevronDown />
          </button>
          {!isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              aria-label={copy.renameDayLabel}
              className="flex min-h-9 min-w-9 items-center justify-center rounded-xl border border-(--color-border) bg-background text-foreground transition hover:border-(--color-border-strong)"
            >
              <IconPencil />
            </button>
          ) : null}
          <button
            type="button"
            onClick={onDelete}
            aria-label={copy.deleteDayLabel}
            className="flex min-h-9 min-w-9 items-center justify-center rounded-xl border border-(--color-border) bg-background text-foreground transition hover:border-(--color-border-strong)"
          >
            <IconXMark />
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-3">
        {day.exercises.length === 0 ? (
          <p className="site-muted text-sm">{copy.emptyDayExercisesText}</p>
        ) : (
          day.exercises.map((item, index) => (
            <WorkoutExerciseRow
              key={item.id}
              dayId={day.id}
              item={item}
              index={index}
              exercises={exercises}
              accessToken={accessToken}
              copy={copy}
              onUpdated={onExerciseUpdated}
              onDeleted={() => onExerciseDeleted(item.id)}
            />
          ))
        )}
      </div>

      <div className="mt-5">
        <AddExerciseToDayRow
          dayId={day.id}
          exercises={exercises}
          accessToken={accessToken}
          copy={copy}
          onAdded={onExerciseAdded}
          onExercisesRefetchNeeded={onExercisesRefetchNeeded}
        />
      </div>
    </article>
  );
}

function WorkoutExerciseRow({
  dayId,
  item,
  index,
  exercises,
  accessToken,
  copy,
  onUpdated,
  onDeleted,
}: {
  dayId: string;
  item: WorkoutPlanDayExercise;
  index: number;
  exercises: Exercise[];
  accessToken: string;
  copy: WorkoutCopy;
  onUpdated: (item: WorkoutPlanDayExercise) => void;
  onDeleted: () => void;
}) {
  const { locale } = useLocale();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(item.name);
  const [sets, setSets] = useState(item.sets);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !sets.trim()) return;

    setIsSaving(true);
    setError(null);
    try {
      const updated = await updateWorkoutPlanDayExercise(
        dayId,
        item.id,
        { name: name.trim(), sets: sets.trim() },
        accessToken,
      );
      onUpdated(updated);
      setIsEditing(false);
    } catch {
      setError(copy.exerciseUpdateError);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm(copy.deleteExerciseConfirm)) return;
    setError(null);
    try {
      await deleteWorkoutPlanDayExercise(dayId, item.id, accessToken);
      onDeleted();
    } catch {
      setError(copy.exerciseDeleteError);
    }
  }

  if (!isEditing) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-(--color-border) px-4 py-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold">
            <span className="site-subtle mr-2">{index + 1}.</span>
            {localizedItemName(item, exercises, locale)}
          </p>
          <p className="site-muted text-xs">{item.sets}</p>
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
        {error ? (
          <p className="w-full text-xs text-red-800 dark:text-red-300">{error}</p>
        ) : null}
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => void handleSave(e)}
      className="rounded-xl border border-(--color-border) p-4"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor={`edit-name-${item.id}`} className="text-sm font-semibold">
            {copy.nameLabel}
          </label>
          <input
            id={`edit-name-${item.id}`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-2 min-h-11 w-full rounded-xl border border-(--color-border) bg-(--color-surface) px-4 text-sm text-foreground outline-none focus:border-(--color-accent)"
          />
        </div>
        <div>
          <label htmlFor={`edit-sets-${item.id}`} className="text-sm font-semibold">
            {copy.setsLabel}
          </label>
          <input
            id={`edit-sets-${item.id}`}
            value={sets}
            onChange={(e) => setSets(e.target.value)}
            placeholder={copy.setsPlaceholder}
            required
            className="mt-2 min-h-11 w-full rounded-xl border border-(--color-border) bg-(--color-surface) px-4 text-sm text-foreground outline-none focus:border-(--color-accent)"
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
            setName(item.name);
            setSets(item.sets);
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

function AddExerciseToDayRow({
  dayId,
  exercises,
  accessToken,
  copy,
  onAdded,
  onExercisesRefetchNeeded,
}: {
  dayId: string;
  exercises: Exercise[];
  accessToken: string;
  copy: WorkoutCopy;
  onAdded: (item: WorkoutPlanDayExercise) => void;
  onExercisesRefetchNeeded: () => Promise<void>;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [nameDe, setNameDe] = useState("");
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [sets, setSets] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSelectExercise(exercise: Exercise) {
    setSelectedExercise(exercise);
    setName(exercise.name);
    setNameDe(exercise.nameDe ?? "");
  }

  function resetForm() {
    setName("");
    setNameDe("");
    setSelectedExercise(null);
    setSets("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !sets.trim()) return;

    setIsSaving(true);
    setError(null);
    try {
      const item = await addWorkoutPlanDayExercise(
        dayId,
        {
          exerciseId: selectedExercise?.id,
          name: name.trim(),
          nameDe: nameDe.trim() || undefined,
          sets: sets.trim(),
        },
        accessToken,
      );
      if (!selectedExercise && item.exerciseId && !exercises.some((ex) => ex.id === item.exerciseId)) {
        // The server may have created a brand-new exercise, or silently reused
        // an existing catalog entry (dedup by name) not in our local list —
        // re-fetch the real catalog row instead of fabricating one.
        await onExercisesRefetchNeeded();
      }
      onAdded(item);
      resetForm();
    } catch {
      setError(copy.exerciseAddError);
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
        {copy.addExerciseLabel}
      </button>
    );
  }

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      className="rounded-xl border border-dashed border-(--color-border) bg-background p-4"
    >
      <p className="site-subtle text-xs font-bold uppercase tracking-[0.14em]">
        {copy.addExerciseLabel}
      </p>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor={`exercise-search-${dayId}`} className="text-sm font-semibold">
            {copy.nameLabel}
          </label>
          <div className="mt-2">
            <ExerciseCombobox
              id={`exercise-search-${dayId}`}
              value={name}
              onValueChange={(value) => {
                setName(value);
                setSelectedExercise(null);
              }}
              onSelectExercise={handleSelectExercise}
              exercises={exercises}
              placeholder={copy.searchPlaceholder}
              searchHint={copy.searchHint}
              noResultsLabel={copy.noResultsLabel}
            />
          </div>
        </div>

        <div>
          <label htmlFor={`exercise-name-de-${dayId}`} className="text-sm font-semibold">
            {copy.nameDeLabel}
          </label>
          <input
            id={`exercise-name-de-${dayId}`}
            value={nameDe}
            onChange={(e) => setNameDe(e.target.value)}
            placeholder={copy.nameDePlaceholder}
            className="mt-2 min-h-11 w-full rounded-xl border border-(--color-border) bg-(--color-surface) px-4 text-sm text-foreground outline-none focus:border-(--color-accent)"
          />
          <p className="site-muted mt-1 text-xs">{copy.nameDeHint}</p>
        </div>

        <div>
          <label htmlFor={`exercise-sets-${dayId}`} className="text-sm font-semibold">
            {copy.setsLabel}
          </label>
          <input
            id={`exercise-sets-${dayId}`}
            value={sets}
            onChange={(e) => setSets(e.target.value)}
            placeholder={copy.setsPlaceholder}
            required
            className="mt-2 min-h-11 w-full rounded-xl border border-(--color-border) bg-(--color-surface) px-4 text-sm text-foreground outline-none focus:border-(--color-accent)"
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
          {isSaving ? copy.savingLabel : copy.addExerciseLabel}
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
