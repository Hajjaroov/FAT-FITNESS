"use client";

import { useState } from "react";
import { useLocale } from "@/app/_components/LocaleProvider";
import { formatDateLong, monthName, weekdayShortLabels } from "@/lib/date";
import { IconCalendar, IconChevronLeft, IconChevronRight } from "@/app/_components/icons";

type DatePickerProps = {
  id: string;
  value: string;
  onChange: (iso: string) => void;
};

function parseIso(iso: string): { year: number; month: number; day: number } | null {
  const [year, month, day] = iso.split("-").map(Number);
  if (!year || !month || !day) return null;
  return { year, month, day };
}

function toIso(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

// Monday-first offset (0 = Monday .. 6 = Sunday) of the month's 1st day.
function firstWeekdayOffset(year: number, month: number): number {
  const jsWeekday = new Date(year, month - 1, 1).getDay();
  return (jsWeekday + 6) % 7;
}

// Custom-styled replacement for native <input type="date">, whose closed-
// state display format is locale/OS-dependent (often ambiguous US
// MM/DD/YYYY) with no way to override it while keeping the native control.
export function DatePicker({ id, value, onChange }: DatePickerProps) {
  const { locale } = useLocale();
  const today = new Date();
  const parsed = parseIso(value);

  const [isOpen, setIsOpen] = useState(false);
  const [viewYear, setViewYear] = useState(parsed?.year ?? today.getFullYear());
  const [viewMonth, setViewMonth] = useState(parsed?.month ?? today.getMonth() + 1);

  function openPicker() {
    if (parsed) {
      setViewYear(parsed.year);
      setViewMonth(parsed.month);
    }
    setIsOpen(true);
  }

  function selectDay(day: number) {
    onChange(toIso(viewYear, viewMonth, day));
    setIsOpen(false);
  }

  function goToPreviousMonth() {
    if (viewMonth === 1) {
      setViewYear((y) => y - 1);
      setViewMonth(12);
    } else {
      setViewMonth((m) => m - 1);
    }
  }

  function goToNextMonth() {
    if (viewMonth === 12) {
      setViewYear((y) => y + 1);
      setViewMonth(1);
    } else {
      setViewMonth((m) => m + 1);
    }
  }

  const totalDays = daysInMonth(viewYear, viewMonth);
  const leadingBlanks = firstWeekdayOffset(viewYear, viewMonth);
  const weekdays = weekdayShortLabels(locale);
  const isCurrentMonth =
    today.getFullYear() === viewYear && today.getMonth() + 1 === viewMonth;

  return (
    <div
      className="relative"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setIsOpen(false);
        }
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") setIsOpen(false);
      }}
    >
      <button
        id={id}
        type="button"
        onClick={() => (isOpen ? setIsOpen(false) : openPicker())}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        className="flex min-h-11 w-full items-center justify-between gap-2 rounded-xl border border-(--color-border) bg-(--color-surface) px-4 text-sm text-foreground outline-none transition focus:border-(--color-accent)"
      >
        <span>{parsed ? formatDateLong(value, locale) : ""}</span>
        <IconCalendar />
      </button>

      {isOpen ? (
        <div
          role="dialog"
          className="absolute left-0 top-[calc(100%+0.5rem)] z-10 w-72 rounded-xl border border-(--color-border) bg-(--color-surface-raised) p-3 shadow-(--shadow-card)"
        >
          <div className="flex items-center justify-between">
            <button
              type="button"
              aria-label="Previous month"
              onClick={goToPreviousMonth}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-(--color-muted) transition hover:bg-(--color-accent-soft) hover:text-foreground"
            >
              <IconChevronLeft />
            </button>
            <span className="text-sm font-semibold text-foreground">
              {monthName(viewMonth, locale)} {viewYear}
            </span>
            <button
              type="button"
              aria-label="Next month"
              onClick={goToNextMonth}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-(--color-muted) transition hover:bg-(--color-accent-soft) hover:text-foreground"
            >
              <IconChevronRight />
            </button>
          </div>

          <div className="mt-3 grid grid-cols-7 gap-1 text-center">
            {weekdays.map((weekday) => (
              <span key={weekday} className="site-subtle text-[11px] font-semibold uppercase">
                {weekday}
              </span>
            ))}

            {Array.from({ length: leadingBlanks }).map((_, index) => (
              <span key={`blank-${index}`} />
            ))}

            {Array.from({ length: totalDays }, (_, index) => index + 1).map((day) => {
              const isSelected =
                parsed?.year === viewYear && parsed.month === viewMonth && parsed.day === day;
              const isToday = isCurrentMonth && today.getDate() === day;
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => selectDay(day)}
                  aria-label={formatDateLong(toIso(viewYear, viewMonth, day), locale)}
                  aria-pressed={isSelected}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm transition ${
                    isSelected
                      ? "bg-foreground font-semibold text-background"
                      : isToday
                        ? "border border-(--color-accent) text-foreground"
                        : "text-foreground hover:bg-(--color-accent-soft)"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
