"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";

interface FestivalItem {
  slug: string;
  title: string;
  when: string;
  desc: string;
  img: string;
}

export function FestivalScrollRail({ items }: { items: FestivalItem[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    let animationId: number;

    function step() {
      if (!container) return;

      if (!isPaused) {
        container.scrollLeft += 0.6;

        if (container.scrollLeft >= container.scrollWidth - container.clientWidth) {
          container.scrollLeft = 0;
        }
      }

      animationId = requestAnimationFrame(step);
    }

    animationId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationId);
  }, [isPaused]);

  return (
    <div
      ref={scrollRef}
      className="flex gap-[13px] overflow-x-auto mt-6 px-5 md:px-10 pb-2 scrollbar-thin scrollbar-thumb-gold/30"
      style={{ scrollBehavior: "auto" }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      {items.map((f) => (
        <Link
          key={f.slug}
          href={`/${f.slug}`}
          className="flex-shrink-0 w-[74%] md:w-[30%] relative rounded-[16px] overflow-hidden aspect-[3/4] group"
        >
          <img
            src={f.img}
            alt={f.title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/95 via-ink/40 to-transparent" />
          <div className="absolute left-4 right-4 bottom-4 text-ivory z-10">
            <div className="text-[9px] uppercase tracking-[0.2em] text-sand/80">{f.when}</div>
            <h3 className="font-display text-[24px] mt-0.5">{f.title}</h3>
            <div className="text-[11.5px] text-ivory/70 mt-0.5">{f.desc}</div>
          </div>
        </Link>
      ))}
    </div>
  );
}
