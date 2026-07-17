import React from "react";
import Link from "next/link";
import { getPublishedPackages, type Package } from "@/lib/data/public";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/buildMetadata";

export const revalidate = 3600; // Time-based ISR fallback

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    seoMeta: null,
    fallbackTitle: "India's Great Festivals | MANNYAM Studio",
    fallbackDescription: "Immerse yourself in the extraordinary colour, devotion, and heritage of India's most iconic celebrations.",
    path: "/festivals",
  });
}

// British English spelling and season ordering helpers
const SEASONS_ORDER = ["Spring", "Summer", "Monsoon", "Autumn", "Winter"];

function getSeasonAndMonthIndex(pkg: Package) {
  const seo = (pkg.seo_meta as Record<string, string | null | undefined>) || {};
  
  if (seo.season) {
    const s = seo.season.toLowerCase();
    if (s.includes("spring")) return { name: "Spring", index: 1 };
    if (s.includes("summer")) return { name: "Summer", index: 2 };
    if (s.includes("monsoon")) return { name: "Monsoon", index: 3 };
    if (s.includes("autumn")) return { name: "Autumn", index: 4 };
    if (s.includes("winter")) return { name: "Winter", index: 5 };
  }

  // Fallback to availability date
  const avail = (Array.isArray(pkg.availability) ? pkg.availability : []) as { date?: string }[];
  const firstDate = avail[0]?.date;
  if (firstDate) {
    const date = new Date(firstDate);
    const month = date.getMonth(); // 0 = Jan, 11 = Dec
    if (month === 11 || month === 0 || month === 1) {
      return { name: "Winter", index: 5, date };
    } else if (month === 2 || month === 3) {
      return { name: "Spring", index: 1, date };
    } else if (month === 4 || month === 5) {
      return { name: "Summer", index: 2, date };
    } else if (month === 6 || month === 7 || month === 8) {
      return { name: "Monsoon", index: 3, date };
    } else {
      return { name: "Autumn", index: 4, date };
    }
  }

  return { name: "Autumn", index: 4 };
}

function getFestivalWhen(pkg: Package) {
  const seo = (pkg.seo_meta as Record<string, string | null | undefined>) || {};
  if (seo.when) return seo.when;

  // Fallback to availability date
  const avail = (Array.isArray(pkg.availability) ? pkg.availability : []) as { date?: string }[];
  const firstDate = avail[0]?.date;
  if (firstDate) {
    try {
      return new Intl.DateTimeFormat("en-GB", {
        month: "long",
        year: "numeric",
      }).format(new Date(firstDate));
    } catch {
      return "Scheduled";
    }
  }
  return "Autumn";
}

function getFestivalWhere(pkg: Package) {
  const seo = (pkg.seo_meta as Record<string, string | null | undefined>) || {};
  if (seo.where) return seo.where;
  return "India";
}

export default async function FestivalsIndexPage() {
  // Fetch only packages where type = 'Festival'
  const allPackages = await getPublishedPackages("Festival");

  // Filter and sort packages by season
  const groupedSeasons = SEASONS_ORDER.map((seasonName) => {
    const pkgs = allPackages.filter((p) => getSeasonAndMonthIndex(p).name === seasonName);
    
    // Sort packages within season by first availability date if present
    pkgs.sort((a, b) => {
      const availA = (Array.isArray(a.availability) ? a.availability : []) as { date?: string }[];
      const availB = (Array.isArray(b.availability) ? b.availability : []) as { date?: string }[];
      const dateA = availA[0]?.date;
      const dateB = availB[0]?.date;
      if (dateA && dateB) {
        return new Date(dateA).getTime() - new Date(dateB).getTime();
      }
      return 0;
    });

    return {
      name: seasonName,
      packages: pkgs,
    };
  }).filter((s) => s.packages.length > 0);

  return (
    <div className="min-h-screen pb-24 font-sans bg-ivory text-ink selection:bg-gold/20">
      
      {/* Hero Header */}
      <section className="relative bg-cream/40 border-b border-olive/10 py-20 sm:py-28 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#3a443003_1px,transparent_1px),linear-gradient(to_bottom,#3a443005_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        <div className="relative max-w-4xl mx-auto text-center space-y-6">
          <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.3em] text-gold block">
            Cultural Curations
          </span>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-olive tracking-tight leading-tight">
            India&apos;s Great Festivals
          </h1>
          <p className="font-display text-base sm:text-lg text-olive/75 italic max-w-2xl mx-auto font-light leading-relaxed">
            Witness legendary celebrations of faith, art, and community: thoughtfully curated travel programmes designed for the discerning cultural explorer.
          </p>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="max-w-6xl mx-auto px-6 mt-20 relative">
        {groupedSeasons.length === 0 ? (
          <div className="bg-cream/40 border border-dashed border-olive/15 rounded-lg p-16 text-center max-w-2xl mx-auto">
            <h3 className="font-display text-xl font-medium text-olive">No festival journeys scheduled currently</h3>
            <p className="font-sans text-sm text-olive/60 mt-2">
              We are currently curating new bespoke itineraries. Please contact our specialists to design your journey.
            </p>
            <div className="mt-6">
              <Link
                href="/enquire"
                className="inline-block font-sans text-xs font-semibold uppercase tracking-wider text-ivory bg-gold hover:bg-gold/90 px-8 py-4 rounded-sm transition-all duration-300"
              >
                Plan Your Trip
              </Link>
            </div>
          </div>
        ) : (
          <div className="relative pl-6 sm:pl-10 md:pl-16">
            {/* Main Vertical Timeline Line */}
            <div className="absolute left-[9px] sm:left-4 md:left-6 top-4 bottom-4 w-0.5 bg-gold/25" />

            <div className="space-y-16">
              {groupedSeasons.map((season) => (
                <div key={season.name} className="relative space-y-8">
                  
                  {/* Timeline Season Node */}
                  <div className="relative flex items-center -ml-6 sm:-ml-10 md:-ml-16">
                    <div className="absolute left-[9px] sm:left-4 md:left-6 w-3.5 h-3.5 rounded-full bg-gold border-4 border-ivory -translate-x-[6px] shadow-sm z-10" />
                    <div className="pl-8 sm:pl-12 md:pl-16">
                      <h2 className="font-display text-xs font-bold uppercase tracking-[0.25em] text-gold bg-cream/70 border border-gold/10 px-3.5 py-1.5 rounded-sm inline-block shadow-sm">
                        {season.name} Celebration Season
                      </h2>
                    </div>
                  </div>

                  {/* Festival Cards Group */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pl-2 sm:pl-4">
                    {season.packages.map((pkg) => {
                      const when = getFestivalWhen(pkg);
                      const where = getFestivalWhere(pkg);
                      const plainDesc = (pkg.description || "")
                        .replace(/<[^>]*>/g, "")
                        .slice(0, 160) + "...";

                      return (
                        <article
                          key={pkg.id}
                          className="bg-cream/25 border border-olive/10 hover:border-gold/30 rounded-sm overflow-hidden flex flex-col group hover:shadow-xl hover:shadow-olive/5 transition-all duration-500"
                        >
                          {/* Image */}
                          <div className="aspect-[16/10] bg-olive/5 relative overflow-hidden">
                            {pkg.featured_image_url ? (
                              <img
                                src={pkg.featured_image_url}
                                alt={pkg.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-olive/20 font-display italic text-lg bg-olive/5">
                                No Image Available
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-ink/50 via-transparent to-transparent opacity-80" />
                            <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
                              <span className="bg-ink/85 text-ivory text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 backdrop-blur-sm rounded-sm">
                                📅 {when}
                              </span>
                              <span className="bg-gold/90 text-ink text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 backdrop-blur-sm rounded-sm">
                                📍 {where}
                              </span>
                            </div>
                          </div>

                          {/* Body Content */}
                          <div className="p-6 flex flex-col flex-grow justify-between space-y-4">
                            <div className="space-y-2.5">
                              <h3 className="font-display text-xl sm:text-2xl font-bold text-olive group-hover:text-gold transition-colors duration-300">
                                {pkg.title}
                              </h3>
                              <p className="font-sans text-xs sm:text-sm text-olive/75 line-clamp-3 font-light leading-relaxed">
                                {plainDesc}
                              </p>
                            </div>
                            <Link
                              href={`/festivals/${pkg.slug}`}
                              className="font-sans text-[11px] font-bold uppercase tracking-wider text-gold hover:text-olive transition-colors flex items-center gap-1.5 pt-2"
                            >
                              Explore Journey Details &rarr;
                            </Link>
                          </div>
                        </article>
                      );
                    })}
                  </div>

                </div>
              ))}
            </div>
          </div>
        )}
      </section>

    </div>
  );
}
