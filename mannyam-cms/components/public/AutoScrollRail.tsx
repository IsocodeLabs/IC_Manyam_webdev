"use client";

import { useEffect, useRef, useState } from "react";

interface AutoScrollRailProps {
  children: React.ReactNode;
  speed?: number;
  className?: string;
}

export function AutoScrollRail({ children, speed = 0.5, className = "" }: AutoScrollRailProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    let animationId: number;

    function step() {
      if (!container) return;

      if (!isPaused) {
        container.scrollLeft += speed;

        if (container.scrollLeft >= container.scrollWidth - container.clientWidth) {
          container.scrollLeft = 0;
        }
      }

      animationId = requestAnimationFrame(step);
    }

    animationId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationId);
  }, [isPaused, speed]);

  return (
    <div
      ref={scrollRef}
      className={`flex overflow-x-auto scrollbar-hide ${className}`}
      style={{ scrollBehavior: "auto" }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      {children}
    </div>
  );
}
