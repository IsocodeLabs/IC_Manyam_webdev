import React from "react";
import Link from "next/link";
import { BlockData } from "./BlockRenderer";

export function HeroBlock({ data }: { data: BlockData }) {
  const { headline, subheadline, backgroundImage, ctaText, ctaLink } = data;

  if (!headline) return null;

  return (
    <section className="relative min-h-[70vh] flex items-center justify-center bg-olive overflow-hidden px-6 py-20">
      {/* Background Image with Dark Overlay */}
      {backgroundImage ? (
        <div className="absolute inset-0 z-0">
          <img
            src={backgroundImage}
            alt={headline}
            className="w-full h-full object-cover brightness-[0.6]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/40 to-ink/20" />
        </div>
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cream/20 via-olive to-ink opacity-90" />
      )}

      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem]" />

      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
        <h2 className="font-display text-4xl sm:text-6xl md:text-7xl font-bold text-ivory tracking-tight leading-[1.1] drop-shadow-sm">
          {headline}
        </h2>
        
        {subheadline && (
          <p className="font-display text-lg sm:text-xl md:text-2xl text-ivory/80 italic max-w-2xl mx-auto font-light leading-relaxed">
            {subheadline}
          </p>
        )}

        {ctaText && ctaLink && (
          <div className="pt-6">
            <Link
              href={ctaLink}
              className="inline-block font-sans text-xs font-semibold uppercase tracking-wider text-ink bg-gold hover:bg-gold/90 px-8 py-4 rounded-sm transition-all duration-300 hover:shadow-lg hover:shadow-gold/20 select-none active:scale-95"
            >
              {ctaText}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
