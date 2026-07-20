"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export interface HeroSlide {
  large: string;
  small: string;
  largeLink: string;
  smallLink: string;
  largeLabel: string;
  smallLabel: string;
}

export function HeroSlideshow({ slides }: { slides: HeroSlide[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      if (!slides || slides.length === 0) return;
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 3200);
    return () => clearInterval(interval);
  }, [isHovered, slides]);

  if (!slides || slides.length === 0) return null;

  return (
    <>
      {/* Arch image right */}
      <div 
        className="absolute right-[5%] top-1/2 -translate-y-1/2 w-[38%] max-w-[520px] aspect-[100/128] rounded-[20px] overflow-hidden shadow-[0_50px_90px_-30px_rgba(0,0,0,.55)] hidden md:block group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {slides.map((slide, index) => (
          <Link href={slide.largeLink} key={"large-" + index} className={"absolute inset-0 transition-opacity duration-[1500ms] ease-in-out " + (index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0")}>
            <img src={slide.large} alt={slide.largeLabel} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute bottom-4 left-4 right-4 text-ivory opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-sand/90 block mb-1">Explore</span>
              <div className="font-display text-[22px] drop-shadow-[0_1px_3px_rgba(0,0,0,.5)]">{slide.largeLabel}</div>
            </div>
          </Link>
        ))}
      </div>
      {/* Second small image */}
      <div 
        className="absolute right-[30%] bottom-[9%] w-[16%] max-w-[220px] aspect-[100/120] rounded-[18px] overflow-hidden shadow-[0_30px_60px_-18px_rgba(0,0,0,.5)] hidden md:block z-[4] group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {slides.map((slide, index) => (
          <Link href={slide.smallLink} key={"small-" + index} className={"absolute inset-0 transition-opacity duration-[1500ms] ease-in-out " + (index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0")}>
            <img src={slide.small} alt={slide.smallLabel} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute bottom-4 left-4 right-4 text-ivory opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="font-sans text-[9px] uppercase tracking-[0.2em] text-sand/90 block mb-1">Explore</span>
              <div className="font-display text-[16px] drop-shadow-[0_1px_3px_rgba(0,0,0,.5)] leading-tight">{slide.smallLabel}</div>
            </div>
          </Link>
        ))}
      </div>
      {/* Veil gradient */}
      <div className="absolute inset-0 bg-[linear-gradient(100deg,rgba(28,32,14,.88)_0%,rgba(28,32,14,.5)_36%,rgba(28,32,14,0)_60%)] md:block hidden pointer-events-none z-[1]" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/30 to-transparent md:hidden pointer-events-none z-[1]" />
      {/* Mobile arch */}
      <div 
        className="absolute left-1/2 top-[34px] -translate-x-1/2 w-[74%] aspect-[100/124] rounded-[18px] overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,.32)] md:hidden group"
      >
        {slides.map((slide, index) => (
          <Link href={slide.largeLink} key={"mobile-" + index} className={"absolute inset-0 transition-opacity duration-[1500ms] ease-in-out " + (index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0")}>
            <img src={slide.large} alt={slide.largeLabel} className="w-full h-full object-cover" />
          </Link>
        ))}
      </div>
    </>
  );
}
