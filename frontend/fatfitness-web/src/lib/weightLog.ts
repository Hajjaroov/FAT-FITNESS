import type { Locale } from "@/content/site";

type WeightLogRow = readonly [dose: string, date: string, weightKg: number];

// Single source of truth for the personal weight/GLP-1 log. To log a new
// entry, add one row here — the medical journey table, the journal/home
// summary stats, and the weight chart all derive from it.
const weightLog: WeightLogRow[] = [
  ["2.5", "2025-11-16", 203.0],
  ["2.5", "2025-11-23", 197.0],
  ["5.0", "2025-11-29", 191.5],
  ["5.0", "2025-12-06", 189.3],
  ["5.0", "2025-12-13", 187.2],
  ["5.0", "2025-12-20", 185.3],
  ["5.0", "2025-12-27", 183.0],
  ["5.0", "2026-01-04", 181.6],
  ["5.0", "2026-01-11", 180.2],
  ["5.0", "2026-01-18", 179.6],
  ["5.0", "2026-01-25", 177.6],
  ["5.0", "2026-02-01", 176.6],
  ["5.0", "2026-02-08", 174.9],
  ["6.25", "2026-02-15", 174.4],
  ["6.25", "2026-02-22", 173.0],
  ["7.5", "2026-03-01", 171.6],
  ["7.5", "2026-03-08", 170.1],
  ["7.5", "2026-03-16", 168.8],
  ["7.5", "2026-03-23", 166.5],
  ["7.5", "2026-03-30", 165.3],
  ["7.5", "2026-04-06", 164.7],
  ["7.5", "2026-04-13", 163.3],
  ["7.5", "2026-04-21", 162.8],
  ["7.5", "2026-04-29", 162.5],
  ["7.5", "2026-05-07", 162.5],
  ["7.5", "2026-05-15", 162.0],
  ["7.5", "2026-05-22", 161.5],
  ["10", "2026-05-31", 160.5],
  ["10", "2026-06-07", 158.5],
  ["10", "2026-06-14", 158.0],
  ["10", "2026-06-21", 157.2],
  ["10", "2026-06-28", 156.0],
  ["10", "2026-07-05", 154.5],
  ["10", "2026-07-12", 153.5],
  ["10", "2026-07-19", 152.5],
];

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

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function formatDecimal(value: number, locale: Locale): string {
  const fixed = value.toFixed(1);
  return locale === "de" ? fixed.replace(".", ",") : fixed;
}

function formatWeightKg(weightKg: number, locale: Locale): string {
  return `${formatDecimal(weightKg, locale)} kg`;
}

function formatChangeKg(deltaKg: number, locale: Locale): string {
  const rounded = round1(deltaKg);
  const sign = rounded > 0 ? "+" : rounded < 0 ? "-" : "";
  return `${sign}${formatDecimal(Math.abs(rounded), locale)} kg`;
}

function formatDate(iso: string, locale: Locale): string {
  const [year, month, day] = iso.split("-").map(Number);
  return locale === "de"
    ? `${day}. ${MONTHS.de[month - 1]} ${year}`
    : `${day} ${MONTHS.en[month - 1]} ${year}`;
}

// Table display always uses plain period decimals regardless of site locale,
// matching how the medical journey log has always rendered.
export function getWeightLogTable(): readonly (readonly [string, string, string, string])[] {
  return weightLog.map(([dose, date, weightKg], index) => {
    const previousWeightKg = index === 0 ? weightKg : weightLog[index - 1][2];
    return [
      dose,
      date,
      formatWeightKg(weightKg, "en"),
      formatChangeKg(weightKg - previousWeightKg, "en"),
    ] as const;
  });
}

export function getWeightSummary(locale: Locale) {
  const first = weightLog[0];
  const last = weightLog[weightLog.length - 1];
  return {
    startWeight: formatWeightKg(first[2], locale),
    startDateIso: first[1],
    startDateFormatted: formatDate(first[1], locale),
    latestWeight: formatWeightKg(last[2], locale),
    latestDateIso: last[1],
    latestDateFormatted: formatDate(last[1], locale),
    change: formatChangeKg(last[2] - first[2], locale),
  };
}
