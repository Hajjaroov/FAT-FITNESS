"use client";

import { useState } from "react";
import Image from "next/image";

type ExerciseItem = {
  name: string;
  sets: string;
  photoKey: string;
  photoSrc?: string;
};

function Thumbnail({
  item,
  selected,
  placeholder,
  onClick,
}: {
  item: ExerciseItem;
  selected: boolean;
  placeholder: string;
  onClick: () => void;
}) {
  const ring = selected
    ? "ring-2 ring-[var(--color-accent)] ring-offset-1 ring-offset-[var(--color-surface)]"
    : "ring-1 ring-[var(--color-border)] hover:ring-[var(--color-accent)]";

  return (
    <div
      className={`relative cursor-pointer overflow-hidden rounded-lg bg-(--color-surface-raised) transition-all ${ring}`}
      style={{ aspectRatio: "5 / 4" }}
      onClick={onClick}
    >
      {item.photoSrc ? (
        <Image src={item.photoSrc} alt={item.name} fill sizes="96px" className="object-cover" />
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-1 px-2 text-center">
          <p className="site-subtle text-[9px] font-semibold uppercase">{placeholder}</p>
          <p className="site-subtle font-mono text-[8px] leading-3">{item.photoKey}</p>
        </div>
      )}
    </div>
  );
}

export function ExerciseCarousel({
  items,
  placeholder,
}: {
  items: ExerciseItem[];
  placeholder: string;
}) {
  const [current, setCurrent] = useState(0);

  const prev = () => setCurrent((i) => (i - 1 + items.length) % items.length);
  const next = () => setCurrent((i) => (i + 1) % items.length);

  const item = items[current];

  return (
    <div className="flex flex-col gap-3">
      {/* Main photo */}
      <div className="relative overflow-hidden rounded-xl ring-1 ring-(--color-border) bg-(--color-surface-raised)" style={{ aspectRatio: "5 / 4" }}>
        {item.photoSrc ? (
          <Image
            src={item.photoSrc}
            alt={item.name}
            fill
            sizes="(max-width: 1280px) 100vw, 45vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 px-8 text-center">
            <p className="site-subtle text-xs font-semibold uppercase">{placeholder}</p>
            <p className="site-subtle font-mono text-[11px]">{item.photoKey}</p>
          </div>
        )}

        {/* Name + sets label */}
        <div className="absolute bottom-0 left-0 right-0 rounded-b-xl bg-linear-to-t from-black via-black/50 to-transparent px-5 pb-4 pt-4">
          <p className="text-sm font-semibold text-white">{item.name}</p>
          <p className="mt-0.5 text-xs text-white/70">{item.sets}</p>
        </div>

        {/* Arrows */}
        <button
          onClick={prev}
          aria-label="Previous exercise"
          className="absolute left-3 top-1/2 -translate-y-1/2 rounded-xl bg-black/40 p-2 text-white transition hover:bg-black/60"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <button
          onClick={next}
          aria-label="Next exercise"
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl bg-black/40 p-2 text-white transition hover:bg-black/60"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

        {/* Counter */}
        <div className="absolute right-3 top-3 rounded-xl bg-black/40 px-2.5 py-0.5 text-xs text-white">
          {current + 1} / {items.length}
        </div>
      </div>

      {/* Thumbnail strip */}
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${items.length}, 1fr)` }}
      >
        {items.map((ex, i) => (
          <Thumbnail
            key={ex.photoKey}
            item={ex}
            selected={i === current}
            placeholder={placeholder}
            onClick={() => setCurrent(i)}
          />
        ))}
      </div>
    </div>
  );
}
