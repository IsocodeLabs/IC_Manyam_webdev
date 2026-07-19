import React from "react";
import { notFound } from "next/navigation";
import { getPageBySlug, getPublishedPages, getPublishedPackages } from "@/lib/data/public";
import { BlockRenderer, ContentBlock } from "@/components/public/blocks/BlockRenderer";
import { buildMetadata } from "@/lib/seo/buildMetadata";
import { Button } from "@/components/public/ui/Button";
import { PackageCard } from "@/components/public/ui/PackageCard";
import Link from "next/link";
import type { Metadata } from "next";

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
    // Standard/Legal/Landing pages: render blocks vertically (original behaviour)
    return (
      <article className="min-h-screen bg-ivory">
        <BlockRenderer blocks={blocks} />
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
      {faqBlock && (
        <div className="max-w-[1200px] mx-auto px-6 pb-12">
          <BlockRenderer blocks={[faqBlock]} />
        </div>
      )}

      {/* Closing CTA */}
      <section className="relative py-20 md:py-28 text-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroData.backgroundImage || "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=75"} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-[radial-gradient(120%_130%_at_50%_0%,rgba(74,82,55,.8),rgba(44,49,32,.92))]" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto px-6 text-ivory">
          <span className="font-sans text-[10.5px] font-medium tracking-[0.4em] uppercase text-sand">Begin</span>
          <h2 className="font-display text-[34px] md:text-[60px] font-medium mt-3 leading-tight">
            Ready to write<br/>your <em className="italic text-gold">India</em>?
          </h2>
          <p className="font-sans text-[13.5px] md:text-[16px] text-ivory/75 mt-3.5 leading-relaxed font-light">
            One short note is all it takes. Tell us what stirs you, and a curator will shape the first outline within a day.
          </p>
          <div className="mt-6">
            <Button href="/enquire" variant="amber">Plan my journey</Button>
          </div>
          <p className="font-display italic text-[19px] text-ivory/60 mt-4">Free to start, and no obligation.</p>
        </div>
      </section>

    </article>
  );
}
