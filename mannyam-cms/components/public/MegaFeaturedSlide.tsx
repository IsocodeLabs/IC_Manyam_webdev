"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Slide {
  image: string;
  label: string;
  subtitle: string;
  href: string;
}

export function MegaFeaturedSlide({ slides, interval = 2800 }: { slides: Slide[], interval?: number }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, interval);
    return () => clearInterval(timer);
  }, [isHovered, slides.length, interval]);

  return (
    <div 
      className="absolute inset-0 group" 
      onMouseEnter={() => setIsHovered(true)} 
      onMouseLeave={() => setIsHovered(false)}
    >
      {slides.map((slide, index) => (
        <Link key={index} href={slide.href} className={"absolute inset-0 transition-opacity duration-[1500ms] ease-in-out " + (index === currentIndex ? "opacity-100 z-10 pointer-events-auto" : "opacity-0 z-0 pointer-events-none")}>
          <img src={slide.image} alt={slide.label} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/30 to-transparent" />
          <div className="absolute left-3.5 right-3.5 bottom-3 text-ivory z-10 drop-shadow-md">
            <div className="text-[9.5px] uppercase tracking-[0.24em] text-sand/80">{slide.subtitle}</div>
            <div className="font-display text-[20px] mt-0.5">{slide.label}</div>
          </div>
        </Link>
      ))}
    </div>
  );
}
