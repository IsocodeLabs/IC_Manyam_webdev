import React from "react";
import { BlockData } from "./BlockRenderer";

export function TestimonialBlock({ data }: { data: BlockData }) {
  const { quote, authorName, authorTitle } = data;

  if (!quote) return null;

  return (
    <section className="bg-cream/20 py-16 sm:py-24 px-6 border-y border-olive/5 relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-ivory via-transparent to-transparent pointer-events-none" />
      <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10">
        
        {/* Large stylized quote mark */}
        <span className="font-display text-7xl text-gold/30 block leading-none select-none">
          “
        </span>
        
        {/* Quote */}
        <blockquote className="font-display text-2xl sm:text-3xl md:text-4xl text-olive/95 italic font-light leading-relaxed max-w-3xl mx-auto">
          {quote}
        </blockquote>
        
        {/* Author details */}
        {(authorName || authorTitle) && (
          <div className="space-y-1">
            {authorName && (
              <cite className="font-sans text-xs sm:text-sm font-semibold uppercase tracking-widest text-gold not-italic block">
                {authorName}
              </cite>
            )}
            {authorTitle && (
              <span className="font-sans text-[10px] sm:text-xs text-olive/50 font-light uppercase tracking-wider block">
                {authorTitle}
              </span>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
