"use client";

import { useId, useState } from "react";
import { useLocale } from "@/app/_components/LocaleProvider";
import type { Exercise } from "@/types/workout";

type ExerciseComboboxProps = {
  id: string;
  value: string;
  onValueChange: (value: string) => void;
  onSelectExercise: (exercise: Exercise) => void;
  exercises: Exercise[];
  placeholder: string;
  searchHint: string;
  noResultsLabel: string;
};

const maxSuggestions = 8;

function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

function displayName(exercise: Exercise, locale: string) {
  return locale === "de" && exercise.nameDe ? exercise.nameDe : exercise.name;
}

function matchesQuery(exercise: Exercise, normalizedQuery: string) {
  if (!normalizedQuery) return true;
  if (normalizeSearch(exercise.name).includes(normalizedQuery)) return true;
  return exercise.nameDe ? normalizeSearch(exercise.nameDe).includes(normalizedQuery) : false;
}

// Same ranking as FoodCombobox: exact match > starts-with > word-boundary
// match > substring-anywhere, so a query like "press" prefers "Press-ups"
// over something merely containing it mid-word.
function matchRank(exercise: Exercise, normalizedQuery: string): number {
  const candidates = [exercise.name, exercise.nameDe].filter((value): value is string =>
    Boolean(value),
  );
  let best = 3;
  for (const candidate of candidates) {
    const normalized = normalizeSearch(candidate);
    if (normalized === normalizedQuery) return 0;
    if (normalized.startsWith(normalizedQuery)) {
      best = Math.min(best, 1);
      continue;
    }
    const startsAsWord = normalized
      .split(/[,\s]+/)
      .some((part) => part.startsWith(normalizedQuery));
    if (startsAsWord) {
      best = Math.min(best, 2);
    }
  }
  return best;
}

export function ExerciseCombobox({
  id,
  value,
  onValueChange,
  onSelectExercise,
  exercises,
  placeholder,
  searchHint,
  noResultsLabel,
}: ExerciseComboboxProps) {
  const { locale } = useLocale();
  const listboxId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const normalizedQuery = normalizeSearch(value);
  const suggestions = exercises
    .filter((exercise) => matchesQuery(exercise, normalizedQuery))
    .map((exercise) => ({ exercise, rank: matchRank(exercise, normalizedQuery) }))
    .sort((a, b) => a.rank - b.rank)
    .slice(0, maxSuggestions)
    .map(({ exercise }) => exercise);
  const activeExercise = suggestions[activeIndex];

  function selectExercise(exercise: Exercise) {
    onValueChange(displayName(exercise, locale));
    onSelectExercise(exercise);
    setIsOpen(false);
    setActiveIndex(0);
  }

  return (
    <div className="relative">
      <input
        id={id}
        type="text"
        value={value}
        autoComplete="off"
        placeholder={placeholder}
        role="combobox"
        aria-autocomplete="list"
        aria-controls={listboxId}
        aria-expanded={isOpen}
        onBlur={() => window.setTimeout(() => setIsOpen(false), 120)}
        onChange={(event) => {
          onValueChange(event.target.value);
          setIsOpen(true);
          setActiveIndex(0);
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={(event) => {
          if (!isOpen && ["ArrowDown", "ArrowUp"].includes(event.key)) {
            setIsOpen(true);
            return;
          }

          if (event.key === "ArrowDown") {
            event.preventDefault();
            setActiveIndex((index) => Math.min(index + 1, suggestions.length - 1));
          }

          if (event.key === "ArrowUp") {
            event.preventDefault();
            setActiveIndex((index) => Math.max(index - 1, 0));
          }

          if (event.key === "Enter" && activeExercise) {
            event.preventDefault();
            selectExercise(activeExercise);
          }

          if (event.key === "Escape") {
            setIsOpen(false);
          }
        }}
        className="min-h-12 w-full rounded-xl border border-(--color-border) bg-(--color-surface) px-4 text-base text-foreground outline-none transition placeholder:text-(--color-subtle) focus:border-(--color-accent)"
      />

      {isOpen ? (
        <div
          id={listboxId}
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-10 max-h-72 overflow-y-auto rounded-xl border border-(--color-border) bg-(--color-surface-raised) p-2 shadow-(--shadow-card)"
        >
          <p className="site-muted px-3 py-2 text-xs leading-5">{searchHint}</p>
          {suggestions.length > 0 ? (
            suggestions.map((exercise, index) => (
              <button
                key={exercise.id}
                type="button"
                role="option"
                aria-selected={index === activeIndex}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => selectExercise(exercise)}
                className={`flex w-full flex-col items-start gap-0.5 rounded-xl px-3 py-2 text-left text-sm transition ${
                  index === activeIndex
                    ? "bg-(--color-accent-soft) text-foreground"
                    : "text-(--color-muted) hover:bg-(--color-accent-soft) hover:text-foreground"
                }`}
              >
                <span className="font-semibold">{displayName(exercise, locale)}</span>
              </button>
            ))
          ) : (
            <p className="site-muted px-3 py-3 text-sm">{noResultsLabel}</p>
          )}
        </div>
      ) : null}
    </div>
  );
}
