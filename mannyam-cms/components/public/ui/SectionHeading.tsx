import React from "react";

interface SectionHeadingProps {
  eyebrow?: string;
  heading: string;
  intro?: string;
  align?: "center" | "left";
  className?: string;
}

export function SectionHeading({
  eyebrow,
  heading,
  intro,
  align = "center",
  className = "",
}: SectionHeadingProps) {
  const isCenter = align === "center";

  return (
    <div
      className={`space-y-3 ${isCenter ? "text-center mx-auto max-w-3xl" : "text-left"} ${className}`}
    >
      {eyebrow && (
        <span className="font-sans text-[10px] font-bold uppercase tracking-[0.35em] text-gold block">
          {eyebrow}
        </span>
      )}
      <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-olive tracking-tight leading-tight">
        {heading}
      </h2>
      {intro && (
        <p className={`font-sans text-sm sm:text-base text-olive-soft font-light leading-relaxed ${isCenter ? "mx-auto" : ""}`}>
          {intro}
        </p>
      )}
    </div>
  );
}
