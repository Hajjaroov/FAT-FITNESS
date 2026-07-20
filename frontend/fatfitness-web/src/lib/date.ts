import type { Locale } from "@/content/site";

const MONTHS: Record<Locale, string[]> = {
  en: [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ],
  de: [
    "Januar", "Februar", "März", "April", "Mai", "Juni",
    "Juli", "August", "September", "Oktober", "November", "Dezember",
  ],
};

// Monday-first, matching the weekday convention already used for the
// /myplan/workout weekday picker.
const WEEKDAYS_SHORT: Record<Locale, string[]> = {
  en: ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
  de: ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"],
};

// Formats a "YYYY-MM-DD" date as an unambiguous, locale-aware long date
// ("15 January 2026" / "15. Januar 2026") - used for journal/home content and
// as the DatePicker trigger's display text, never as the native browser date
// input's locale/OS-dependent format (e.g. ambiguous US MM/DD/YYYY).
export function formatDateLong(iso: string, locale: Locale): string {
  const [year, month, day] = iso.split("-").map(Number);
  if (!year || !month || !day) return "";
  return locale === "de"
    ? `${day}. ${MONTHS.de[month - 1]} ${year}`
    : `${day} ${MONTHS.en[month - 1]} ${year}`;
}

// Formats a "YYYY-MM-DD" date as compact day-first "DD/MM/YYYY" - for dense
// table/list rows where formatDateLong's spelled-out month would take too
// much space, but raw ISO's year-first order reads backwards.
export function formatDateShort(iso: string): string {
  const [year, month, day] = iso.split("-");
  if (!year || !month || !day) return "";
  return `${day}/${month}/${year}`;
}

export function monthName(month: number, locale: Locale): string {
  return MONTHS[locale][month - 1];
}

export function weekdayShortLabels(locale: Locale): string[] {
  return WEEKDAYS_SHORT[locale];
}
