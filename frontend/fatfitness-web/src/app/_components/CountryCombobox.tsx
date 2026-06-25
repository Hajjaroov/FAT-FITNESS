"use client";

import { useId, useState } from "react";
import { useLocale } from "@/app/_components/LocaleProvider";
import {
  getCountryOptions,
  otherCountryOptionCode,
  type CountryOption,
} from "@/content/countries";

type CountryComboboxProps = {
  id: string;
  label: string;
  placeholder: string;
  searchHint: string;
  noResultsLabel: string;
  initialCode?: string;
};

const maxCountrySuggestions = 9;

function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function CountryCombobox({
  id,
  label,
  placeholder,
  searchHint,
  noResultsLabel,
  initialCode,
}: CountryComboboxProps) {
  const { locale } = useLocale();
  const listboxId = useId();

  const initialOption = initialCode
    ? getCountryOptions(locale).find((o) => o.code === initialCode)
    : undefined;

  const [query, setQuery] = useState(initialOption?.label ?? "");
  const [selectedCode, setSelectedCode] = useState(initialCode ?? "");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const options = getCountryOptions(locale);
  const otherOption = options.find(
    (option) => option.code === otherCountryOptionCode,
  );
  const countryOptions = options.filter(
    (option) => option.code !== otherCountryOptionCode,
  );
  const normalizedQuery = normalizeSearch(query);
  const countrySuggestions = countryOptions
    .filter((option) => {
      if (!normalizedQuery) {
        return true;
      }

      return (
        normalizeSearch(option.label).includes(normalizedQuery) ||
        option.code.toLowerCase().includes(normalizedQuery)
      );
    })
    .slice(0, maxCountrySuggestions);
  const suggestions = otherOption
    ? [...countrySuggestions, otherOption]
    : countrySuggestions;
  const activeOption = suggestions[activeIndex];

  function selectOption(option: CountryOption) {
    setQuery(option.label);
    setSelectedCode(option.code);
    setIsOpen(false);
    setActiveIndex(0);
  }

  return (
    <div>
      <label htmlFor={id} className="text-sm font-semibold text-foreground">
        {label}
      </label>
      <div className="relative mt-2">
        <input
          id={id}
          name={id}
          type="text"
          value={query}
          autoComplete="off"
          placeholder={placeholder}
          role="combobox"
          aria-autocomplete="list"
          aria-controls={listboxId}
          aria-expanded={isOpen}
          aria-activedescendant={
            activeOption ? `${listboxId}-${activeOption.code}` : undefined
          }
          data-country-code={selectedCode}
          onBlur={() => window.setTimeout(() => setIsOpen(false), 120)}
          onChange={(event) => {
            setQuery(event.target.value);
            setSelectedCode("");
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
              setActiveIndex((index) =>
                Math.min(index + 1, suggestions.length - 1),
              );
            }

            if (event.key === "ArrowUp") {
              event.preventDefault();
              setActiveIndex((index) => Math.max(index - 1, 0));
            }

            if (event.key === "Enter" && activeOption) {
              event.preventDefault();
              selectOption(activeOption);
            }

            if (event.key === "Escape") {
              setIsOpen(false);
            }
          }}
          className="min-h-12 w-full rounded-2xl border border-(--color-border) bg-(--color-surface) px-4 text-base text-foreground outline-none transition placeholder:text-(--color-subtle) focus:border-(--color-accent)"
        />
        <input
          type="hidden"
          name={`${id}-code`}
          value={selectedCode}
          readOnly
        />

        {isOpen ? (
          <div
            id={listboxId}
            role="listbox"
            className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-10 overflow-hidden rounded-2xl border border-(--color-border) bg-(--color-surface-raised) p-2 shadow-(--shadow-card)"
          >
            <p className="site-muted px-3 py-2 text-xs leading-5">
              {searchHint}
            </p>
            {suggestions.length > 0 ? (
              suggestions.map((option, index) => (
                <button
                  key={option.code}
                  id={`${listboxId}-${option.code}`}
                  type="button"
                  role="option"
                  aria-selected={selectedCode === option.code}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => selectOption(option)}
                  className={`flex min-h-11 w-full items-center justify-start rounded-xl px-3 text-left text-sm transition ${
                    index === activeIndex
                      ? "bg-(--color-accent-soft) text-foreground"
                      : "text-(--color-muted) hover:bg-(--color-accent-soft) hover:text-foreground"
                  }`}
                >
                  <span>{option.label}</span>
                </button>
              ))
            ) : (
              <p className="site-muted px-3 py-3 text-sm">{noResultsLabel}</p>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
