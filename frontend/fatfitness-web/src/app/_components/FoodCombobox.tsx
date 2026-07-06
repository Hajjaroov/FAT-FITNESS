"use client";

import { useId, useState } from "react";
import { useLocale } from "@/app/_components/LocaleProvider";
import type { Food } from "@/types/diet";

type FoodComboboxProps = {
  id: string;
  value: string;
  onValueChange: (value: string) => void;
  onSelectFood: (food: Food) => void;
  foods: Food[];
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

function displayName(food: Food, locale: string) {
  return locale === "de" && food.nameDe ? food.nameDe : food.name;
}

function matchesQuery(food: Food, normalizedQuery: string) {
  if (!normalizedQuery) return true;
  if (normalizeSearch(food.name).includes(normalizedQuery)) return true;
  return food.nameDe ? normalizeSearch(food.nameDe).includes(normalizedQuery) : false;
}

// SR Legacy names are comma-separated descriptions (e.g. "Chicken, breast,
// raw"), and the shared list is fetched already sorted alphabetically by
// name. A plain substring filter would let something like "Babyfood, ...,
// chicken, ..." outrank "Chicken, breast, raw" purely because "B" sorts
// before "C" — so rank word/phrase-boundary matches ahead of the food name
// merely containing the query somewhere in the middle.
function matchRank(food: Food, normalizedQuery: string): number {
  const candidates = [food.name, food.nameDe].filter((value): value is string => Boolean(value));
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

export function FoodCombobox({
  id,
  value,
  onValueChange,
  onSelectFood,
  foods,
  placeholder,
  searchHint,
  noResultsLabel,
}: FoodComboboxProps) {
  const { locale } = useLocale();
  const listboxId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const normalizedQuery = normalizeSearch(value);
  const suggestions = foods
    .filter((food) => matchesQuery(food, normalizedQuery))
    .map((food) => ({ food, rank: matchRank(food, normalizedQuery) }))
    .sort((a, b) => a.rank - b.rank)
    .slice(0, maxSuggestions)
    .map(({ food }) => food);
  const activeFood = suggestions[activeIndex];

  function selectFood(food: Food) {
    onValueChange(displayName(food, locale));
    onSelectFood(food);
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

          if (event.key === "Enter" && activeFood) {
            event.preventDefault();
            selectFood(activeFood);
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
            suggestions.map((food, index) => (
              <button
                key={food.id}
                type="button"
                role="option"
                aria-selected={index === activeIndex}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => selectFood(food)}
                className={`flex w-full flex-col items-start gap-0.5 rounded-xl px-3 py-2 text-left text-sm transition ${
                  index === activeIndex
                    ? "bg-(--color-accent-soft) text-foreground"
                    : "text-(--color-muted) hover:bg-(--color-accent-soft) hover:text-foreground"
                }`}
              >
                <span className="font-semibold">{displayName(food, locale)}</span>
                <span className="site-subtle text-xs">
                  {food.caloriesPerUnit} kcal | {food.proteinPerUnit}g protein |{" "}
                  {food.carbsPerUnit}g carbs | {food.fatPerUnit}g fat ({food.unitLabel})
                </span>
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
