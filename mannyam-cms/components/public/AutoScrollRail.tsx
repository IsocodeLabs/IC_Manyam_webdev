"use client";

import { useEffect, useRef, useState } from "react";

interface AutoScrollRailProps {
  children: React.ReactNode;
  speed?: number;
  direction?: "left" | "right";
  className?: string;
}

export function AutoScrollRail({ children, speed = 0.5, direction = "left", className = "" }: AutoScrollRailProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const initialised = useRef(false);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    // If scrolling left, start at the end
    if (!initialised.current) {
      if (direction === "left") {
        container.scrollLeft = container.scrollWidth - container.clientWidth;
      }
      initialised.current = true;
    }

    let animationId: number;

    function step() {
      if (!container) return;

      if (!isPaused) {
        const maxScroll = container.scrollWidth - container.clientWidth;

        if (direction === "left") {
          container.scrollLeft -= speed;
          if (container.scrollLeft <= 0) {
            container.scrollLeft = maxScroll;
          }
        } else {
          container.scrollLeft += speed;
          if (container.scrollLeft >= maxScroll) {
            container.scrollLeft = 0;
          }
        }
      }

      animationId = requestAnimationFrame(step);
    }

    animationId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationId);
  }, [isPaused, speed, direction]);

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
