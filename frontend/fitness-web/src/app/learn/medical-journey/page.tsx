import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Medical Journey | Fat Fitness Community",
  description:
    "A personal GLP-1 and medical journey log documented carefully without medical advice.",
};

const summary = [
  { label: "Starting point", value: "203.0 kg", detail: "2025-11-16" },
  { label: "Latest logged point", value: "158.0 kg", detail: "2026-06-07" },
  { label: "Logged change", value: "-45.0 kg", detail: "Personal log" },
];

const loggedEntries = [
  ["2.5", "2025-11-16", "203.0 kg", "0 kg"],
  ["2.5", "2025-11-23", "197.0 kg", "-6.0 kg"],
  ["5.0", "2025-11-29", "191.5 kg", "-5.5 kg"],
  ["5.0", "2025-12-06", "189.3 kg", "-2.2 kg"],
  ["5.0", "2025-12-13", "187.2 kg", "-2.2 kg"],
  ["5.0", "2025-12-20", "185.3 kg", "-1.9 kg"],
  ["5.0", "2025-12-27", "183.0 kg", "-2.3 kg"],
  ["5.0", "2026-01-04", "181.6 kg", "-1.4 kg"],
  ["5.0", "2026-01-11", "180.2 kg", "-1.4 kg"],
  ["5.0", "2026-01-18", "179.6 kg", "-0.6 kg"],
  ["5.0", "2026-01-25", "177.6 kg", "-2.0 kg"],
  ["5.0", "2026-02-01", "176.6 kg", "-1.0 kg"],
  ["5.0", "2026-02-08", "174.9 kg", "-1.7 kg"],
  ["6.25", "2026-02-15", "174.4 kg", "-0.5 kg"],
  ["6.25", "2026-02-22", "173.0 kg", "-1.4 kg"],
  ["7.5", "2026-03-01", "171.6 kg", "-1.4 kg"],
  ["7.5", "2026-03-08", "170.1 kg", "-1.5 kg"],
  ["7.5", "2026-03-16", "168.8 kg", "-1.3 kg"],
  ["7.5", "2026-03-23", "166.5 kg", "-2.3 kg"],
  ["7.5", "2026-03-30", "165.3 kg", "-1.2 kg"],
  ["7.5", "2026-04-06", "164.7 kg", "-0.6 kg"],
  ["7.5", "2026-04-13", "163.3 kg", "-1.4 kg"],
  ["7.5", "2026-04-21", "162.8 kg", "-0.5 kg"],
  ["7.5", "2026-04-29", "162.5 kg", "-0.3 kg"],
  ["7.5", "2026-05-07", "162.5 kg", "0 kg"],
  ["7.5", "2026-05-15", "162.0 kg", "-0.5 kg"],
  ["7.5", "2026-05-22", "161.5 kg", "-0.5 kg"],
  ["10", "2026-05-31", "160.5 kg", "-1.0 kg"],
  ["10", "2026-06-07", "158.0 kg", "-2.5 kg"],
];

const boundaries = [
  "This is a personal log, not a GLP-1 recommendation.",
  "This page should not explain dosing decisions or tell anyone when to change medication.",
  "Medical decisions belong with qualified professionals.",
];

export default function MedicalJourneyPage() {
  return (
    <div className="min-h-screen bg-[#fafaf9] text-zinc-950">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-sm font-semibold uppercase text-zinc-700">
            Fat Fitness
          </Link>
          <nav className="flex items-center gap-5 text-sm text-zinc-600">
            <Link href="/" className="transition hover:text-zinc-950">
              Home
            </Link>
            <Link href="/learn" className="font-medium text-zinc-950">
              Learn
            </Link>
            <Link href="/community" className="transition hover:text-zinc-950">
              Community
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-col px-6 py-12 sm:py-16">
        <Link
          href="/learn"
          className="mb-8 inline-flex w-fit border-b border-zinc-300 pb-1 text-sm font-semibold text-zinc-700 transition hover:border-zinc-950 hover:text-zinc-950"
        >
          Back to Learn
        </Link>

        <section className="max-w-3xl">
          <p className="text-sm font-semibold uppercase text-orange-700">
            Medical Journey
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-normal text-zinc-950 sm:text-5xl">
            A personal GLP-1 log, documented carefully.
          </h1>
          <p className="mt-6 text-base leading-8 text-zinc-700">
            This page records the personal timeline provided for the journey. It
            is here for transparency and context, not as medication advice,
            dosing guidance, or a method for anyone else to copy.
          </p>
        </section>

        <section className="mt-12 border-y border-zinc-200">
          <div className="grid gap-0 sm:grid-cols-3">
            {summary.map((item) => (
              <div
                key={item.label}
                className="border-b border-zinc-200 py-5 sm:border-b-0 sm:border-r sm:last:border-r-0"
              >
                <p className="text-sm text-zinc-500">{item.label}</p>
                <p className="mt-1 text-2xl font-semibold text-zinc-950">
                  {item.value}
                </p>
                <p className="mt-1 text-sm text-zinc-500">{item.detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <div className="grid gap-4 lg:grid-cols-[0.75fr_1.25fr]">
            <h2 className="text-2xl font-semibold tracking-normal text-zinc-950">
              Logged Entries
            </h2>
            <p className="text-sm leading-7 text-zinc-600">
              `MJ` is kept as the source log label. The table shows completed
              entries through 2026-06-07 only.
            </p>
          </div>

          <div className="mt-6 overflow-x-auto border-y border-zinc-200">
            <table className="w-full min-w-[640px] border-collapse text-left text-sm">
              <thead className="border-b border-zinc-200 text-zinc-500">
                <tr>
                  <th className="py-3 pr-4 font-semibold">MJ</th>
                  <th className="py-3 pr-4 font-semibold">Date</th>
                  <th className="py-3 pr-4 font-semibold">Weight</th>
                  <th className="py-3 pr-4 font-semibold">Change</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-zinc-700">
                {loggedEntries.map(([mj, date, weight, change]) => (
                  <tr key={`${mj}-${date}`}>
                    <td className="py-3 pr-4">{mj}</td>
                    <td className="py-3 pr-4">{date}</td>
                    <td className="py-3 pr-4">{weight}</td>
                    <td className="py-3 pr-4">{change}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
          <h2 className="text-2xl font-semibold tracking-normal text-zinc-950">
            Boundaries
          </h2>
          <ul className="space-y-3 text-base leading-8 text-zinc-700">
            {boundaries.map((boundary) => (
              <li key={boundary} className="flex gap-3">
                <span className="mt-3 h-2 w-2 shrink-0 rounded-full bg-zinc-950" />
                <span>{boundary}</span>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
