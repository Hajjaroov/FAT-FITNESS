"use client";

import { useState } from "react";
import Image from "next/image";

type WarmupItem = {
  name: string;
  sets: string;
  photoKey: string;
  photoSrc?: string;
};

function PhotoSlot({
  item,
  placeholder,
  fill = false,
  selected = false,
  onClick,
}: {
  item: WarmupItem;
  placeholder: string;
  fill?: boolean;
  selected?: boolean;
  onClick?: () => void;
}) {
  const base = "relative overflow-hidden";
  const border = selected
    ? "ring-2 ring-[var(--color-accent)] ring-offset-1 ring-offset-[var(--color-surface)]"
    : "ring-1 ring-[var(--color-border)]";

  return (
    <div
      className={`${base} ${border} ${onClick ? "cursor-pointer transition-all hover:ring-(--color-accent)" : ""} rounded-lg bg-(--color-surface-raised)`}
      style={{ aspectRatio: "5 / 4" }}
      onClick={onClick}
    >
      {item.photoSrc ? (
        <Image
          src={item.photoSrc}
          alt={item.name}
          fill={fill || true}
          sizes={fill ? "(max-width: 1024px) 100vw, 50vw" : "120px"}
          className="object-cover"
        />
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-1 px-3 text-center">
          <p className="site-subtle text-[10px] font-semibold uppercase">{placeholder}</p>
          <p className="site-subtle font-mono text-[9px] leading-4">{item.photoKey}</p>
        </div>
      )}
    </div>
  );
}

export function WarmupCarousel({
  items,
  placeholder,
}: {
  items: WarmupItem[];
  placeholder: string;
}) {
  const [current, setCurrent] = useState(0);

  const prev = () => setCurrent((i) => (i - 1 + items.length) % items.length);
  const next = () => setCurrent((i) => (i + 1) % items.length);

  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <div className="relative" style={{ aspectRatio: "5 / 4" }}>
        <div className="h-full w-full overflow-hidden rounded-xl ring-1 ring-(--color-border) bg-(--color-surface-raised)">
          {items[current].photoSrc ? (
            <Image
              src={items[current].photoSrc!}
              alt={items[current].name}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover" 
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 px-8 text-center">
              <p className="site-subtle text-xs font-semibold uppercase">{placeholder}</p>
              <p className="site-subtle font-mono text-[11px]">{items[current].photoKey}</p>
            </div>
          )}
        </div>

        {/* Name label */}
        <div className="absolute bottom-0 left-0 right-0 rounded-b-xl bg-linear-to-t from-black via-black/50 to-transparent px-5 pb-4 pt-4">
          <p className="text-sm font-semibold text-white">{items[current].name}</p>
          <p className="mt-0.5 text-xs text-white/70">{items[current].sets}</p>
        </div>

        {/* Arrows */}
        <button
          onClick={prev}
          aria-label="Previous"
          className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white transition hover:bg-black/60"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <button
          onClick={next}
          aria-label="Next"
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white transition hover:bg-black/60"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

        {/* Counter */}
        <div className="absolute right-3 top-3 rounded-full bg-black/40 px-2.5 py-0.5 text-xs text-white">
          {current + 1} / {items.length}
        </div>
      </div>

      {/* Thumbnail strip */}
      <div className="grid grid-cols-6 gap-2">
        {items.map((item, i) => (
          <PhotoSlot
            key={item.photoKey}
            item={item}
            placeholder={placeholder}
            selected={i === current}
            onClick={() => setCurrent(i)}
          />
        ))}
      </div>
    </div>
  );
}
