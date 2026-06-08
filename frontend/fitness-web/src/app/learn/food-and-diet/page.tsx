import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Food & Diet | Fat Fitness Community",
  description:
    "A personal food and diet overview based on one beginner-friendly weight-loss journey.",
};

const dailyTotals = [
  { label: "Calories", value: "1850 kcal" },
  { label: "Protein", value: "190 g" },
  { label: "Carbs", value: "125 g" },
  { label: "Fat", value: "55 g" },
];

const meals = [
  {
    name: "Meal 1",
    summary: "350 kcal | 33 g protein | 8 g carbs | 21 g fat",
    items: [
      "3 boiled medium eggs",
      "1 tomato, 83 g",
      "100 g koerniger Frischkaese",
    ],
  },
  {
    name: "Shake",
    summary: "320 kcal | 44 g protein | 16.5 g carbs | 7 g fat",
    items: [
      "30 g whey",
      "10 g collagen + vitamin C + zinc",
      "330 ml lactose-free milk, 1.5%",
      "10 g creatine",
    ],
  },
  {
    name: "Meal 2 and Meal 3",
    summary: "2 meals, each around 530 kcal | 50 g protein | 46 g carbs | 10 g fat",
    items: [
      "Chicken breast",
      "Olive oil, mustard, tomato paste, and yogurt sauce",
      "Frozen vegetables, broccoli or Kaisergemuese, mushrooms",
      "Potato and bulgur",
    ],
  },
  {
    name: "Snack",
    summary: "125 kcal | 13 g protein | 7 g carbs | 5 g fat",
    items: ["Milbona Skyr Vanille", "Chia", "Almonds"],
  },
];

const supplements = [
  "D3 5000 IU + K2",
  "Omega-3, 1500 EPA / 750 DHA",
  "Multi-vitamin",
  "Electrolyte complex",
  "Magnesium citrate",
  "30 g whey protein",
  "10 g creatine monohydrate",
  "10 g collagen",
];

const boundaries = [
  "This is one personal diet structure, not a universal diet plan.",
  "Supplements are listed as part of the current routine, not as recommendations.",
  "A future meal-structure tool should help with targets without claiming to prescribe a diet.",
];

export default function FoodAndDietPage() {
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
            Food & Diet
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-normal text-zinc-950 sm:text-5xl">
            The current food structure behind the journey.
          </h1>
          <p className="mt-6 text-base leading-8 text-zinc-700">
            This page documents the current personal diet example. It is useful
            as context for the journey and later tools, but it should not be
            presented as a plan everyone should follow.
          </p>
        </section>

        <section className="mt-12 border-y border-zinc-200">
          <div className="grid gap-0 sm:grid-cols-4">
            {dailyTotals.map((total) => (
              <div
                key={total.label}
                className="border-b border-zinc-200 py-5 sm:border-b-0 sm:border-r sm:last:border-r-0"
              >
                <p className="text-sm text-zinc-500">{total.label}</p>
                <p className="mt-1 text-2xl font-semibold text-zinc-950">
                  {total.value}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold tracking-normal text-zinc-950">
            Meals
          </h2>
          <div className="mt-6 divide-y divide-zinc-200 border-y border-zinc-200">
            {meals.map((meal) => (
              <article
                key={meal.name}
                className="grid gap-5 py-7 lg:grid-cols-[0.7fr_1.3fr]"
              >
                <div>
                  <h3 className="text-xl font-semibold text-zinc-950">
                    {meal.name}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-zinc-600">
                    {meal.summary}
                  </p>
                </div>
                <ul className="space-y-2 text-base leading-8 text-zinc-700">
                  {meal.items.map((item) => (
                    <li key={item} className="flex gap-3">
                      <span className="mt-3 h-2 w-2 shrink-0 rounded-full bg-orange-600" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-12 grid gap-8 border-b border-zinc-200 pb-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <h2 className="text-2xl font-semibold tracking-normal text-zinc-950">
              Supplements
            </h2>
            <p className="mt-3 text-sm leading-7 text-zinc-600">
              These belong under food and diet by default unless they are tied to
              labs, doctor guidance, medication interactions, or OP recovery.
            </p>
          </div>
          <ul className="grid gap-3 text-base leading-7 text-zinc-700 sm:grid-cols-2">
            {supplements.map((supplement) => (
              <li key={supplement} className="border-b border-zinc-200 pb-3">
                {supplement}
              </li>
            ))}
          </ul>
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
