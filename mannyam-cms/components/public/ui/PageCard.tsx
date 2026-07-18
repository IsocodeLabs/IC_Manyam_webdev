import React from "react";
import Link from "next/link";
import { Page } from "@/lib/data/public";

interface PageCardProps {
  page: Page;
  className?: string;
}

/**
 * Extracts the hero background image URL from a page's content blocks.
 */
function getHeroImage(content: unknown): string | null {
  if (!content || !Array.isArray(content)) return null;
  const heroBlock = content.find(
    (block: { type?: string }) => block?.type === "Hero"
  );
  return heroBlock?.data?.backgroundImage || null;
}

/**
 * Extracts the hero subheadline for use as the card description.
 */
function getHeroSubheadline(content: unknown): string {
  if (!content || !Array.isArray(content)) return "";
  const heroBlock = content.find(
    (block: { type?: string }) => block?.type === "Hero"
  );
  return heroBlock?.data?.subheadline || "";
}

export function PageCard({ page, className = "" }: PageCardProps) {
  const heroImage = getHeroImage(page.content);
  const subtitle = getHeroSubheadline(page.content);

  return (
    <article
      className={`bg-cream/30 border border-olive/10 hover:border-gold/30 rounded-sm overflow-hidden flex flex-col group hover:shadow-xl hover:shadow-olive/5 transition-all duration-500 ${className}`}
    >
      {/* Image */}
      <div className="aspect-[4/3] bg-olive/5 relative overflow-hidden">
        {heroImage ? (
          <img
            src={heroImage}
            alt={page.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-olive/20 font-display italic text-base bg-olive/5">
            {page.title}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-grow justify-between space-y-4">
        <div className="space-y-2">
          <h3 className="font-display text-xl font-bold text-olive group-hover:text-gold transition-colors duration-300">
            {page.title}
          </h3>
          {subtitle && (
            <p className="font-sans text-xs text-olive/75 line-clamp-3 font-light leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>

        <Link
          href={`/${page.slug}`}
          className="font-sans text-[11px] font-bold uppercase tracking-wider text-gold hover:text-olive transition-colors flex items-center gap-1.5 pt-2"
        >
          Explore{" "}
          <span className="transition-transform duration-300 group-hover:translate-x-1">
            &rarr;
          </span>
        </Link>
      </div>
    </article>
  );
}
