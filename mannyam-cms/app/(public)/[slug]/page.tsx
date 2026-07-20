import React from "react";
import { notFound } from "next/navigation";
import { getPageBySlug, getPublishedPages, getPublishedPackages } from "@/lib/data/public";
import { BlockRenderer, ContentBlock } from "@/components/public/blocks/BlockRenderer";
import { buildMetadata } from "@/lib/seo/buildMetadata";
import { Button } from "@/components/public/ui/Button";
import { PackageCard } from "@/components/public/ui/PackageCard";
import Link from "next/link";
import type { Metadata } from "next";
import { ClosingCta } from "@/components/public/ClosingCta";

async function RelatedJourneysSection({ pkgType }: { pkgType?: 'Festival' | 'Destination' | 'Honeymoon' | 'Wildlife' | 'Wellness' }) {
  const packages = await getPublishedPackages(pkgType, 3);
  if (!packages || packages.length === 0) return null;

  return (
    <section className="bg-cream/40 border-t border-b border-olive/10 py-16 sm:py-24 px-6 overflow-hidden mt-12 mb-12">
      <div className="max-w-[1200px] mx-auto">
        <h3 className="font-display text-[26px] md:text-[36px] mb-8 text-olive">
          Related Journeys
        </h3>
        <div className="flex overflow-x-auto gap-6 pb-4 snap-x snap-mandatory scrollbar-hide -mx-6 px-6 md:mx-0 md:px-0 md:grid md:grid-cols-3">
          {packages.map((pkg) => (
            <div key={pkg.id} className="w-[85vw] md:w-auto flex-none snap-center">
              <PackageCard pkg={pkg} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

const RESERVED_SLUGS = [
  "journeys",
  "experiences",
  "festivals",
  "destinations",
  "journal",
  "enquire",
  "login",
  "admin",
  "api",
  "dashboard",
  "leads",
  "packages",
  "pages-cms",
  "redirects",
  "seo",
  "settings",
  "auth",
  "cart",
  "checkout",
  "account",
  "access-denied",
];

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  if (RESERVED_SLUGS.includes(slug)) {
    return { title: "Page Not Found | MANNYAM" };
  }
  const page = await getPageBySlug(slug);
  if (!page) {
    return { title: "Page Not Found | MANNYAM" };
  }
  return buildMetadata({
    seoMeta: page.seo_meta,
    fallbackTitle: page.title,
    fallbackDescription: `Explore ${page.title} on MANNYAM.`,
    path: `/${slug}`,
  });
}

export async function generateStaticParams() {
  const pages = await getPublishedPages();
  return pages
    .filter((page) => !RESERVED_SLUGS.includes(page.slug))
    .map((page) => ({ slug: page.slug }));
}

import { ListingFaq } from "@/components/public/ListingFaq";

export const revalidate = 3600;

// Helper: extract data from specific block types
function getBlockByType(blocks: ContentBlock[], type: string) {
  return blocks.find((b) => b.type === type);
}

function getBreadcrumb(slug: string): { label: string; href: string } {
  if (slug.startsWith("experience-")) return { label: "Experiences", href: "/experiences" };
  if (slug.startsWith("festival-")) return { label: "Festivals", href: "/festivals" };
  if (slug.startsWith("destination-")) return { label: "Destinations", href: "/destinations" };
  return { label: "Home", href: "/" };
}

export default async function DynamicPage({ params }: PageProps) {
  const { slug } = await params;
  if (RESERVED_SLUGS.includes(slug)) {
    notFound();
  }
  const page = await getPageBySlug(slug);
  if (!page) {
    notFound();
  }

  const blocks: ContentBlock[] = Array.isArray(page.content)
    ? (page.content as unknown as ContentBlock[])
    : [];

  const heroBlock = getBlockByType(blocks, "Hero");
  const factBarBlock = getBlockByType(blocks, "Fact Bar");
  const tilesBlock = getBlockByType(blocks, "Tiles");
  const placeChipsBlock = getBlockByType(blocks, "Place Chips");
  const ctaBlock = getBlockByType(blocks, "CTA Banner");
  const faqBlock = getBlockByType(blocks, "FAQ");

  const heroData = heroBlock?.data || {};
  const breadcrumb = getBreadcrumb(slug);

  // For Category pages (experiences, festivals, destinations), use the
  // frontend.html detail layout with breadcrumb, wide image, two-column body
  const isCategoryDetail = page.type === "Category";

  if (!isCategoryDetail) {
    if (slug === "about") {
      return (
        <article className="min-h-screen bg-[#Fdf9f1]">
          <section className="w-full relative bg-[#Fdf9f1]">
            {/* The user-provided About page hero/background composition */}
            <img 
              src="/about-bg.png" 
              alt="About MANNYAM" 
              className="w-full h-auto object-cover" 
            />
          </section>
          {/* Render Our Story static content */}
          <div className="max-w-[1200px] mx-auto px-6 py-12 md:py-[54px]">
            <div className="block md:grid md:grid-cols-[1.6fr_1fr] gap-12 items-start">
              
              {/* Left Column (Main Story) */}
              <div>
                <p className="text-[17px] text-[#4a4d3b] leading-[1.7] mt-6">
                  We are a small team of planners who know India deeply and care about it greatly. We design private journeys for travellers from across Europe, the United States and beyond who want comfort and authenticity in the same breath.
                </p>
                <p className="text-[17px] text-[#4a4d3b] leading-[1.7] mt-[14px]">
                  We believe the best travel is unhurried. It leaves room for a long lunch, an unplanned conversation and a quiet morning, and it treats local communities as hosts and partners.
                </p>
                
                <h3 className="font-display text-[23px] md:text-[30px] mt-8 mb-4">What we hold to</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-[14px] md:gap-[30px] mt-[6px]">
                  <div className="border-t border-olive/10 pt-4">
                    <h4 className="font-display text-[20px] mb-2">Depth over distance</h4>
                    <p className="text-[13px] text-olive/80 leading-[1.55]">Fewer places, properly understood.</p>
                  </div>
                  <div className="border-t border-olive/10 pt-4">
                    <h4 className="font-display text-[20px] mb-2">Real, not staged</h4>
                    <p className="text-[13px] text-olive/80 leading-[1.55]">Genuine encounters, arranged with respect on both sides.</p>
                  </div>
                  <div className="border-t border-olive/10 pt-4">
                    <h4 className="font-display text-[20px] mb-2">Comfort throughout</h4>
                    <p className="text-[13px] text-olive/80 leading-[1.55]">Thoughtful stays and support whenever you need it.</p>
                  </div>
                  <div className="border-t border-olive/10 pt-4">
                    <h4 className="font-display text-[20px] mb-2">Honesty in everything</h4>
                    <p className="text-[13px] text-olive/80 leading-[1.55]">Candid advice and no surprises.</p>
                  </div>
                </div>
              </div>

              {/* Right Column (Sidebar) */}
              <aside className="mt-12 md:mt-0">
                <div className="border border-olive/10 rounded-2xl p-5 md:p-6 bg-white sticky top-[100px]">
                  <span className="font-sans text-[10.5px] tracking-[0.4em] uppercase text-[#846017] font-medium block">
                    Who we plan for
                  </span>
                  <ul className="mt-[14px] flex flex-col gap-[9px]">
                    <li className="flex gap-[10px] text-[13.5px] text-[#4a4d3b] leading-[1.4]">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[15px] h-[15px] text-gold mt-[3px] shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      Couples and honeymooners
                    </li>
                    <li className="flex gap-[10px] text-[13.5px] text-[#4a4d3b] leading-[1.4]">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[15px] h-[15px] text-gold mt-[3px] shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      Families travelling together
                    </li>
                    <li className="flex gap-[10px] text-[13.5px] text-[#4a4d3b] leading-[1.4]">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[15px] h-[15px] text-gold mt-[3px] shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      Friends and small private groups
                    </li>
                    <li className="flex gap-[10px] text-[13.5px] text-[#4a4d3b] leading-[1.4]">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[15px] h-[15px] text-gold mt-[3px] shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      Companies planning a retreat
                    </li>
                  </ul>
                  <Link href="/enquire" className="block w-full text-center mt-[16px] bg-olive hover:bg-gold text-ivory hover:text-ink px-5 py-[14px] rounded-full font-medium text-[11.5px] tracking-[0.16em] uppercase transition-colors">
                    Speak to a curator
                  </Link>
                </div>
              </aside>

            </div>
          </div>
          <ClosingCta />
        </article>
      );
    }

    // Standard/Legal/Landing pages: render blocks vertically (original behaviour)
    return (
      <article className="min-h-screen bg-ivory">
        <BlockRenderer blocks={blocks} />
        <ClosingCta />
      </article>
    );
  }

  // ─── Category Detail Layout (matches frontend.html) ──────────────────────

  return (
    <article className="min-h-screen bg-ivory font-sans text-ink">

      {/* Page Header with breadcrumb */}
      <section className="relative bg-gradient-to-b from-cream to-ivory border-b border-olive/10 pt-8 pb-10 md:pt-[120px] md:pb-16 px-6">
        <div className="max-w-[1200px] mx-auto">
          <Link href={breadcrumb.href} className="text-[10px] tracking-[0.16em] uppercase text-gold hover:text-olive transition-colors cursor-pointer">
            Home &middot; {breadcrumb.label}
          </Link>
          <h1 className="font-display text-[36px] md:text-[60px] font-medium mt-3 text-ink leading-[1.05]">
            <em className="italic">{page.title}</em>
          </h1>
          {heroData.subheadline && (
            <p className="mt-3 text-[13.5px] md:text-[16px] text-olive/70 leading-relaxed font-light max-w-[40em]">
              {heroData.subheadline}
            </p>
          )}
        </div>
      </section>

      {/* Wide arch image */}
      {heroData.backgroundImage && (
        <div className="max-w-[1200px] mx-auto px-6 -mt-4 md:mt-0">
          <div className="relative rounded-[18px] overflow-hidden aspect-[16/6] md:aspect-[24/8] mt-6 shadow-[inset_0_0_0_1px_rgba(30,35,25,.06)]">
            <img src={heroData.backgroundImage} alt={page.title} className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(26,30,18,.5),transparent_55%,rgba(26,30,18,.55))]" />
            <div className="absolute left-[18px] md:left-[34px] right-[18px] md:right-[34px] bottom-4 md:bottom-[26px] text-ivory font-display text-[21px] md:text-[28px] leading-[1.2] z-10">
              {heroData.subheadline || page.title}
            </div>
          </div>
        </div>
      )}

      {/* Two-column detail layout */}
      <div className="max-w-[1200px] mx-auto px-6 py-8 md:py-[54px]">
        <div className="block md:grid md:grid-cols-[1.6fr_1fr] md:gap-12 md:items-start">

          {/* Main content (left) */}
          <div>
            {/* Fact Bar inline */}
            {factBarBlock && (
              <div className="flex flex-wrap gap-3.5 md:gap-6 py-4 border-t border-b border-olive/10 mb-6">
                {(factBarBlock.data.facts as { label: string; value: string }[] || []).map((fact: { label: string; value: string }, i: number) => (
                  <div key={i}>
                    <div className="text-[9px] tracking-[0.2em] uppercase text-gold font-medium">{fact.label}</div>
                    <div className="font-display text-[20px] mt-0.5">{fact.value}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Lede Paragraph */}
            {heroData.subheadline && (
              <p className="text-[15px] text-olive/70 leading-[1.7] mb-8 font-light max-w-prose">
                {heroData.subheadline}
              </p>
            )}

            {/* Tiles (moments/activities) */}
            {tilesBlock && (
              <div className="mb-8">
                <h3 className="font-display text-[23px] md:text-[30px] mb-3">{tilesBlock.data.heading || "What you might do"}</h3>
                <div className="grid gap-3">
                  {(tilesBlock.data.tiles as { title: string; description: string }[] || []).map((tile: { title: string; description: string }, i: number) => (
                    <div key={i} className="flex gap-3.5 items-start bg-paper border border-olive/8 rounded-[14px] p-4 transition-all hover:border-gold/30 hover:shadow-lg hover:translate-x-[3px]">
                      <span className="font-display italic text-[21px] text-gold leading-none flex-shrink-0 w-6">{String(i + 1).padStart(2, "0")}</span>
                      <div>
                        <h4 className="font-display text-[17px]">{tile.title}</h4>
                        <p className="text-[12.5px] text-olive/65 mt-1 leading-relaxed font-light">{tile.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Place Chips */}
            {placeChipsBlock && (
              <div className="mb-8">
                <h3 className="font-display text-[23px] md:text-[30px] mb-3">{placeChipsBlock.data.heading || "Best enjoyed in"}</h3>
                <div className="flex flex-wrap gap-2">
                  {(placeChipsBlock.data.places as { name: string; region: string }[] || []).map((place: { name: string; region: string }, i: number) => (
                    <span key={i} className="inline-flex items-center gap-2 text-[12px] px-3.5 py-2.5 rounded-full border border-olive/10 bg-cream/40 hover:border-gold/40 transition-colors">
                      <b className="font-medium">{place.name}</b>
                      <span className="text-olive/50">{place.region}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar (right) */}
          <aside>
            <div className="border border-olive/10 rounded-[16px] p-5 bg-paper sticky top-[100px]">
              <span className="font-sans text-[10.5px] font-medium tracking-[0.4em] uppercase text-gold">Make it yours</span>

              {/* Sidebar facts */}
              {factBarBlock && (
                <div className="mt-3 space-y-3.5">
                  {(factBarBlock.data.facts as { label: string; value: string }[] || []).map((fact: { label: string; value: string }, i: number) => (
                    <div key={i}>
                      <div className="text-[9px] tracking-[0.2em] uppercase text-gold font-medium">{fact.label}</div>
                      <div className="font-display text-[20px] mt-0.5">{fact.value}</div>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-[13px] text-olive/65 mt-4 leading-relaxed font-light">
                Every journey is shaped around your pace and your people. Tell us what you have in mind and we will build it in.
              </p>

              <Link
                href="/enquire"
                className="block w-full text-center mt-4 font-sans text-[11.5px] font-medium tracking-[0.16em] uppercase text-ivory bg-olive hover:bg-gold hover:text-ink py-3.5 rounded-full transition-all"
              >
                {ctaBlock?.data?.buttonLabel || "Plan this journey"}
              </Link>
            </div>
          </aside>
        </div>
      </div>

      {/* Related Journeys Section */}
      {(() => {
        let pkgType: "Festival" | "Destination" | "Honeymoon" | "Wildlife" | "Wellness" | undefined;
        if (slug.startsWith("festival-")) pkgType = "Festival";
        if (slug.startsWith("destination-")) pkgType = "Destination";

        return (
          <RelatedJourneysSection pkgType={pkgType} />
        );
      })()}

      {/* FAQ Section */}
      {faqBlock ? (
        <div className="max-w-[1200px] mx-auto px-6 pb-12">
          <BlockRenderer blocks={[faqBlock]} />
        </div>
      ) : (
        <ListingFaq 
          heading="Questions, answered simply"
          subtitle={`Everything travellers ask about planning a ${page.title} trip in India, answered simply.`}
          items={[
            { question: "Which regions of India should I visit?", answer: "Favourite regions include Rajasthan, Kerala, the Himalayas, Tamil Nadu, Varanasi and the Ganges, the North-East and Gujarat. Each offers a very different India." },
            { question: "When is the best time to visit India?", answer: "Broadly, October to March suits most of the country, while the Himalayas are best May to September. Your curator will advise." },
            { question: "How many regions can I see in one trip?", answer: "For an unhurried journey we suggest one or two regions over a week or two. Fewer places, properly understood." },
            { question: "Is India safe and comfortable to travel in?", answer: "With private transport, vetted drivers, carefully chosen stays and support around the clock, India is comfortable and safe." },
            { question: "How do I plan a private India tour?", answer: "Pick a region or let the concierge suggest one, then send a note through our enquiry form. A curator replies within a day." }
          ]}
        />
      )}

      <ClosingCta />
    </article>
  );
}
