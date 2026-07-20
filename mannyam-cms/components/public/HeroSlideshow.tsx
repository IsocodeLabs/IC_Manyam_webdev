"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const SLIDES = [
  {
    large: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=75",
    small: "https://images.unsplash.com/photo-1593693411515-c20261bcad6e?auto=format&fit=crop&w=600&q=75",
    largeLink: "/destination-rajasthan",
    smallLink: "/destination-kerala",
    largeLabel: "Rajasthan",
    smallLabel: "Kerala Backwaters"
  },
  {
    large: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=75",
    small: "https://images.unsplash.com/photo-1545389336-cf090694435e?auto=format&fit=crop&w=600&q=75",
    largeLink: "/experience-honeymoon",
    smallLink: "/experience-spiritual",
    largeLabel: "Honeymoon and Romance",
    smallLabel: "Spiritual India"
  },
  {
    large: "https://unsplash.com/photos/rFP3OzmYH6M/download?w=1200&fm=jpg&fit=crop",
    small: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=600&q=75",
    largeLink: "/festival-holi",
    smallLink: "/destination-rajasthan",
    largeLabel: "Colours of Holi",
    smallLabel: "Desert Forts"
  },
  {
    large: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=75",
    small: "https://images.unsplash.com/photo-1615824996195-f780bba7cfab?auto=format&fit=crop&w=600&q=75",
    largeLink: "/destination-himalayas",
    smallLink: "/experience-wildlife",
    largeLabel: "The Himalayas",
    smallLabel: "Wildlife Safari"
  }
];

export function HeroSlideshow() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isHovered]);

  return (
    <>
      {/* Arch image right */}
      <div 
        className="absolute right-[5%] top-1/2 -translate-y-1/2 w-[38%] max-w-[520px] aspect-[100/128] rounded-[20px] overflow-hidden shadow-[0_50px_90px_-30px_rgba(0,0,0,.55)] hidden md:block group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {SLIDES.map((slide, index) => (
          <Link href={slide.largeLink} key={"large-" + index} className={"absolute inset-0 transition-opacity duration-1000 " + (index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0")}>
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
        {SLIDES.map((slide, index) => (
          <Link href={slide.smallLink} key={"small-" + index} className={"absolute inset-0 transition-opacity duration-1000 " + (index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0")}>
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
        {SLIDES.map((slide, index) => (
          <Link href={slide.largeLink} key={"mobile-" + index} className={"absolute inset-0 transition-opacity duration-1000 " + (index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0")}>
            <img src={slide.large} alt={slide.largeLabel} className="w-full h-full object-cover" />
          </Link>
        ))}
      </div>
    </>
  );
}
