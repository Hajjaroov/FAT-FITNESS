"use client";

import Image from "next/image";
import Link from "next/link";
import { PageShell } from "@/app/_components/PageShell";
import { useLocalizedContent } from "@/app/_components/LocaleProvider";
import { learnCopy } from "@/content/journal";
import { siteCopy } from "@/content/site";

function ExercisePhotoSlot({
  name,
  photoKey,
  photoSrc,
  label,
}: {
  name: string;
  photoKey: string;
  photoSrc?: string;
  label: string;
}) {
  return (
    <div className="site-photo-slot">
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
          <p className="site-subtle text-xs font-semibold uppercase">{label}</p>
          <p className="site-subtle mt-2 wrap-break-word font-mono text-[11px] leading-5">
            {photoKey}
          </p>
        </div>
      )}
    </div>
  );
}

export function TrainingView() {
  const copy = useLocalizedContent(learnCopy);
  const site = useLocalizedContent(siteCopy);

  return (
    <PageShell>
      <Link href="/journal" className="site-text-link mb-8">
        {site.links.backToJournal}
      </Link>

      <section className="max-w-3xl">
        <p className="site-kicker">{copy.training.eyebrow}</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-normal sm:text-5xl">
          {copy.training.title}
        </h1>
        <p className="site-muted mt-6 text-base leading-8">
          {copy.training.intro}
        </p>
      </section>

      <section className="site-divider mt-12 grid gap-8 border-y py-8 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <h2 className="text-2xl font-semibold tracking-normal">
            {copy.training.walkingTitle}
          </h2>
          <p className="site-muted mt-3 text-sm leading-7">
            {copy.training.walkingIntro}
          </p>
        </div>
        <div className="site-divider divide-y">
          {copy.training.walkingProgression.map((item) => (
            <div
              key={item.phase}
              className="grid gap-2 py-4 sm:grid-cols-[0.45fr_0.55fr]"
            >
              <p className="font-semibold">{item.phase}</p>
              <p className="site-muted">{item.target}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="site-divider grid gap-8 border-b py-10 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <h2 className="text-2xl font-semibold tracking-normal">
            {copy.training.warmupTitle}
          </h2>
          <p className="site-muted mt-3 text-sm leading-7">
            {copy.training.warmupIntro}
          </p>
        </div>
        <ul className="site-muted space-y-3 text-base leading-8">
          {copy.training.warmup.map((item) => (
            <li key={item} className="flex gap-3">
              <span className="site-dot" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold tracking-normal">
          {copy.training.scheduleTitle}
        </h2>
        <div className="site-divider mt-6 divide-y border-y">
          {copy.training.schedule.map((day) => (
            <article
              key={`${day.day}-${day.focus}`}
              className="grid gap-6 py-8 lg:grid-cols-[0.55fr_1.45fr]"
            >
              <div>
                <p className="site-subtle text-sm font-semibold uppercase">
                  {day.day}
                </p>
                <h3 className="mt-2 text-2xl font-semibold">{day.focus}</h3>
              </div>
              <div className="grid gap-6 lg:grid-cols-2">
                <div>
                  <p className="site-subtle text-sm font-semibold">
                    {copy.training.exerciseLabel}
                  </p>
                  <ul className="site-muted mt-3 space-y-4 text-sm leading-7">
                    {day.exercises.map((exercise) => (
                      <li
                        key={exercise.photoKey}
                        className="site-divider grid gap-4 border-b pb-4 last:border-b-0 sm:grid-cols-[9rem_1fr]"
                      >
                        <ExercisePhotoSlot
                          name={exercise.name}
                          photoKey={exercise.photoKey}
                          photoSrc={exercise.photoSrc}
                          label={copy.training.photoPlaceholder}
                        />
                        <div>
                          <p className="font-semibold text-foreground">
                            {exercise.name}
                          </p>
                          <p className="site-muted mt-1">{exercise.sets}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="site-subtle text-sm font-semibold">
                    {copy.training.notesLabel}
                  </p>
                  <ul className="site-muted mt-3 space-y-3 text-sm leading-7">
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

    </PageShell>
  );
}
