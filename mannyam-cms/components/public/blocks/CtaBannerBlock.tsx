import React from "react";
import Link from "next/link";
import { BlockData } from "./BlockRenderer";

export function CtaBannerBlock({ data }: { data: BlockData }) {
  const { headline, body, buttonLabel, buttonLink } = data;

  if (!headline) return null;

  return (
    <section className="bg-ivory py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-ink text-ivory p-10 md:p-16 rounded-sm relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-10 shadow-md">
          {/* Subtle gradient pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-olive/35 via-transparent to-transparent pointer-events-none" />
          
          <div className="space-y-4 max-w-2xl relative z-10 text-left">
            <h3 className="font-display text-3xl sm:text-4xl font-bold leading-tight text-gold">
              {headline}
            </h3>
            {body && (
              <p className="font-sans text-xs sm:text-sm text-ivory/70 font-light leading-relaxed">
                {body}
              </p>
            )}
          </div>
          
          {buttonLabel && buttonLink && (
            <div className="relative z-10 w-full md:w-auto text-center shrink-0">
              <Link
                href={buttonLink}
                className="w-full md:w-auto inline-block font-sans text-xs font-semibold uppercase tracking-wider text-ink bg-gold hover:bg-gold/90 px-8 py-4 rounded-sm transition-all duration-300 hover:shadow-lg hover:shadow-gold/20 whitespace-nowrap active:scale-95"
              >
                {buttonLabel}
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
