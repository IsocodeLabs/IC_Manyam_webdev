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

export function PageCard({ page, className = "", when }: PageCardProps & { when?: string }) {
  const heroImage = getHeroImage(page.content);
  const subtitle = getHeroSubheadline(page.content);

  return (
    <Link
      href={`/${page.slug}`}
      className={`group flex flex-col gap-4 w-full cursor-pointer ${className}`}
    >
      {/* Image container: Arch shape (100:124) with hover zoom */}
      <div className="relative aspect-[100/124] rounded-[18px] overflow-hidden bg-olive/5 isolate">
        {heroImage ? (
          <img
            src={heroImage}
            alt={page.title}
            className="w-full h-full object-cover group-hover:scale-[1.07] transition-transform duration-1000 ease-out"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-olive/20 font-display italic text-base bg-olive/5">
            {page.title}
          </div>
        )}
        
        {/* Optional "When" badge (used for festivals) */}
        {when && (
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md text-ink px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm z-10">
            {when}
          </div>
        )}

        {/* Bottom text overlay on the arch image (emulating .albl) */}
        <div className="absolute bottom-0 left-0 w-full p-5 bg-gradient-to-t from-ink/60 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end">
          <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-ivory">
            Explore &rarr;
          </span>
        </div>
      </div>

      {/* Content below card */}
      <div className="flex flex-col gap-1.5 px-1">
        <h3 className="font-display text-xl font-bold text-olive group-hover:text-gold transition-colors duration-300">
          {page.title}
        </h3>
        {subtitle && (
          <p className="font-sans text-xs text-olive/75 line-clamp-2 font-light leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
    </Link>
  );
}
