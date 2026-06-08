import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Training | Fat Fitness Community",
  description:
    "Personal training notes from a beginner-friendly workout routine at a high starting weight.",
};

const walkingProgression = [
  { phase: "Weeks 01-08", target: "30 minutes on off days" },
  { phase: "Weeks 09-16", target: "40 minutes on off days" },
  { phase: "Weeks 17-24", target: "50 minutes on off days" },
];

const warmup = [
  "March in place: 2 minutes",
  "Shoulder rolls: 10 reps",
  "Arm circles: 10 forward and 10 backward",
  "Hip circles: 10 each direction",
  "Bodyweight chair squats: 10 slow reps",
  "Cat-cow mobility: 8 reps",
];

const schedule = [
  {
    day: "Monday",
    focus: "Upper A",
    exercises: [
      {
        name: "Incline dumbbell press, 30-45 degrees",
        sets: "3 x 8-10",
        photoKey: "incline-dumbbell-press",
      },
      {
        name: "Chest-supported dumbbell row",
        sets: "3 x 10",
        photoKey: "chest-supported-dumbbell-row",
      },
      {
        name: "Dumbbell lateral raise",
        sets: "3 x 12-15",
        photoKey: "dumbbell-lateral-raise",
      },
      {
        name: "Seated dumbbell shoulder press",
        sets: "3 x 10",
        photoKey: "seated-dumbbell-shoulder-press",
      },
      {
        name: "Dumbbell curl",
        sets: "3 x 12",
        photoKey: "dumbbell-curl",
      },
      {
        name: "Overhead dumbbell tricep extension",
        sets: "3 x 12",
        photoKey: "overhead-dumbbell-tricep-extension",
      },
    ],
    notes: [
      "Chest-supported row uses a bench at incline.",
      "Some upper-body movements use 2 sets for the first 2 weeks.",
      "Overhead tricep extension may work better with a chair.",
    ],
  },
  {
    day: "Wednesday",
    focus: "Lower + Core",
    exercises: [
      {
        name: "Chair squat",
        sets: "3 x 8",
        photoKey: "chair-squat",
      },
      {
        name: "Romanian deadlift",
        sets: "3 x 10",
        photoKey: "romanian-deadlift",
      },
      {
        name: "Hip thrust",
        sets: "3 x 10-12",
        photoKey: "hip-thrust",
      },
      {
        name: "Supported split squat",
        sets: "2 x 6 each leg",
        photoKey: "supported-split-squat",
      },
      {
        name: "Standing calf raise",
        sets: "3 x 15",
        photoKey: "standing-calf-raise",
      },
      {
        name: "Seated core brace",
        sets: "5 x 15 seconds",
        photoKey: "seated-core-brace",
      },
    ],
    notes: [
      "Use chair depth as the squat target.",
      "Hip thrust can be bench-supported if comfortable.",
      "Hold a chair for balance on supported split squats.",
      "Calf raises can progress from bodyweight to dumbbells and step/stair variations.",
    ],
  },
  {
    day: "Friday",
    focus: "Upper B",
    exercises: [
      {
        name: "Flat dumbbell press",
        sets: "3 x 8-10",
        photoKey: "flat-dumbbell-press",
      },
      {
        name: "One-arm dumbbell row",
        sets: "3 x 10",
        photoKey: "one-arm-dumbbell-row",
      },
      {
        name: "Arnold press",
        sets: "3 x 10",
        photoKey: "arnold-press",
      },
      {
        name: "Rear delt fly",
        sets: "3 x 12-15",
        photoKey: "rear-delt-fly",
      },
      {
        name: "Hammer curl",
        sets: "3 x 12",
        photoKey: "hammer-curl",
      },
      {
        name: "Skull crusher",
        sets: "3 x 12",
        photoKey: "skull-crusher",
      },
    ],
    notes: [
      "The source PDF includes a note that seated dumbbell shoulder press may be a harder option.",
      "Current load notes exist in the source PDF, but row mapping needs verification before publishing.",
    ],
  },
  {
    day: "Saturday",
    focus: "Recovery W5+",
    exercises: [
      {
        name: "Chest-supported row",
        sets: "2 x 12",
        photoKey: "chest-supported-row",
      },
      {
        name: "Incline dumbbell press",
        sets: "2 x 12",
        photoKey: "incline-dumbbell-press-recovery",
      },
      {
        name: "Lateral raise",
        sets: "2 x 15",
        photoKey: "lateral-raise-recovery",
      },
      {
        name: "Rear delt fly",
        sets: "2 x 15",
        photoKey: "rear-delt-fly-recovery",
      },
      {
        name: "Hammer curl",
        sets: "2 x 15",
        photoKey: "hammer-curl-recovery",
      },
      {
        name: "Overhead tricep extension",
        sets: "2 x 15",
        photoKey: "overhead-tricep-extension-recovery",
      },
      {
        name: "Farmer carry",
        sets: "3 x 20-30 seconds",
        photoKey: "farmer-carry",
      },
      {
        name: "Hip mobility and stretching",
        sets: "5-10 minutes",
        photoKey: "hip-mobility-stretching",
      },
    ],
    notes: ["Use lighter weights."],
  },
];

const boundaries = [
  "This is a personal routine, not a beginner program for everyone.",
  "Exercise photos can come later after the movements are reviewed.",
  "Exact current loads need verification from the original table before public use.",
];

function ExercisePhotoSlot({
  name,
  photoKey,
  photoSrc,
}: {
  name: string;
  photoKey: string;
  photoSrc?: string;
}) {
  return (
    <div className="relative flex aspect-[4/3] min-h-28 items-center justify-center overflow-hidden border border-dashed border-zinc-300 bg-zinc-100">
      {photoSrc ? (
        <Image
          src={photoSrc}
          alt={`${name} exercise photo`}
          fill
          sizes="(max-width: 1024px) 160px, 180px"
          className="object-cover"
        />
      ) : (
        <div className="px-4 text-center">
          <p className="text-xs font-semibold uppercase text-zinc-500">
            Photo later
          </p>
          <p className="mt-2 break-words font-mono text-[11px] leading-5 text-zinc-500">
            {photoKey}
          </p>
        </div>
      )}
    </div>
  );
}

export default function TrainingPage() {
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
            Training
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-normal text-zinc-950 sm:text-5xl">
            A beginner routine built around the real starting point.
          </h1>
          <p className="mt-6 text-base leading-8 text-zinc-700">
            This page captures the clear workout structure from the OneNote PDF:
            walking progression, warm-up, weekly schedule, exercises, sets, and
            practical notes. It stays personal and avoids turning the routine
            into a universal program.
          </p>
        </section>

        <section className="mt-12 grid gap-8 border-y border-zinc-200 py-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <h2 className="text-2xl font-semibold tracking-normal text-zinc-950">
              Walking Progression
            </h2>
            <p className="mt-3 text-sm leading-7 text-zinc-600">
              Walking is planned on off days and increases over time.
            </p>
          </div>
          <div className="divide-y divide-zinc-200">
            {walkingProgression.map((item) => (
              <div
                key={item.phase}
                className="grid gap-2 py-4 sm:grid-cols-[0.45fr_0.55fr]"
              >
                <p className="font-semibold text-zinc-950">{item.phase}</p>
                <p className="text-zinc-700">{item.target}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-8 border-b border-zinc-200 py-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <h2 className="text-2xl font-semibold tracking-normal text-zinc-950">
              Warm-Up Protocol
            </h2>
            <p className="mt-3 text-sm leading-7 text-zinc-600">
              The notes say to go slow and use the chair as a touch target, not
              a full sit.
            </p>
          </div>
          <ul className="space-y-3 text-base leading-8 text-zinc-700">
            {warmup.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-3 h-2 w-2 shrink-0 rounded-full bg-orange-600" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold tracking-normal text-zinc-950">
            Weekly Schedule, Weeks 1-12
          </h2>
          <div className="mt-6 divide-y divide-zinc-200 border-y border-zinc-200">
            {schedule.map((day) => (
              <article
                key={day.day}
                className="grid gap-6 py-8 lg:grid-cols-[0.55fr_1.45fr]"
              >
                <div>
                  <p className="text-sm font-semibold uppercase text-zinc-500">
                    {day.day}
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold text-zinc-950">
                    {day.focus}
                  </h3>
                </div>
                <div className="grid gap-6 lg:grid-cols-2">
                  <div>
                    <p className="text-sm font-semibold text-zinc-500">
                      Exercises
                    </p>
                    <ul className="mt-3 space-y-4 text-sm leading-7 text-zinc-700">
                      {day.exercises.map((exercise) => (
                        <li
                          key={exercise.photoKey}
                          className="grid gap-4 border-b border-zinc-100 pb-4 last:border-b-0 sm:grid-cols-[9rem_1fr]"
                        >
                          <ExercisePhotoSlot
                            name={exercise.name}
                            photoKey={exercise.photoKey}
                          />
                          <div>
                            <p className="font-semibold text-zinc-950">
                              {exercise.name}
                            </p>
                            <p className="mt-1 text-zinc-600">
                              {exercise.sets}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-500">
                      Notes
                    </p>
                    <ul className="mt-3 space-y-3 text-sm leading-7 text-zinc-700">
                      {day.notes.map((note) => (
                        <li key={note}>{note}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-10 grid gap-6 border-b border-zinc-200 pb-10 lg:grid-cols-[0.75fr_1.25fr]">
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
