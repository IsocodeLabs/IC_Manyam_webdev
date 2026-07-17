import Link from "next/link";
import { getPublishedPackages, getPublishedPosts, Post } from "@/lib/data/public";
import { SectionHeading } from "@/components/public/ui/SectionHeading";
import { PackageCard } from "@/components/public/ui/PackageCard";
import { PostCard } from "@/components/public/ui/PostCard";
import { Button } from "@/components/public/ui/Button";

import { buildMetadata } from "@/lib/seo/buildMetadata";
import { Metadata } from "next";

export const revalidate = 3600; // Time-based ISR fallback

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    seoMeta: null,
    fallbackTitle: "MANNYAM | Bespoke Journeys and Curated Travel Across India",
    fallbackDescription: "Crafting stories of heritage, culture, and nature for the discerning traveller. Discover bespoke travel itineraries and cultural chronicles by MANNYAM.",
    path: "/",
  });
}

export default async function PublicHomePage() {
  const [packages, posts] = await Promise.all([
    getPublishedPackages(undefined, 3),
    getPublishedPosts(3),
  ]);

  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "MANNYAM",
    "url": process.env.NEXT_PUBLIC_SITE_URL || "https://mannyam.in",
    "logo": `${process.env.NEXT_PUBLIC_SITE_URL || "https://mannyam.in"}/logo.png`,
    "description": "Crafting stories of heritage, culture, and nature for the discerning traveller."
  };

  return (
    <div className="space-y-24 pb-24 font-sans bg-ivory text-ink selection:bg-gold/20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
      />
      
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cream via-ivory to-cream border-b border-olive/10 overflow-hidden px-6 py-20">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#3a443005_1px,transparent_1px),linear-gradient(to_bottom,#3a443005_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <div className="relative max-w-4xl mx-auto text-center space-y-8">
          <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.3em] text-gold block">
            Bespoke Travel Design
          </span>
          <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-bold text-olive tracking-tight leading-[1.1] animate-fade-in">
            Curated Journeys Across the Subcontinent
          </h1>
          <p className="font-display text-lg sm:text-xl md:text-2xl text-olive/70 italic max-w-2xl mx-auto font-light leading-relaxed">
            Crafting stories of heritage, culture, and nature for the discerning traveller.
          </p>
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button href="/experiences" variant="gold" className="w-full sm:w-auto">
              Explore Journeys
            </Button>
            <Button href="/enquire" variant="ghost" className="w-full sm:w-auto">
              Plan Your Trip
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Packages (Journeys) Section */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <SectionHeading
            eyebrow="Curated Itineraries"
            heading="Featured Journeys"
            align="left"
          />
          <Link
            href="/experiences"
            className="font-sans text-xs font-semibold uppercase tracking-wider text-gold hover:text-olive transition-colors flex items-center gap-2 group"
          >
            View All Journeys
            <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
          </Link>
        </div>

        {packages.length === 0 ? (
          <div className="bg-cream/40 border border-dashed border-olive/15 rounded-lg p-16 text-center">
            <h3 className="font-display text-xl font-medium text-olive">No journeys scheduled at this time</h3>
            <p className="font-sans text-sm text-olive/60 mt-2">We are currently curating new bespoke itineraries. Please check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {packages.map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} />
            ))}
          </div>
        )}
      </section>

      {/* Journal Section */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <SectionHeading
            eyebrow="Travel Chronicles"
            heading="From the Journal"
            align="left"
          />
          <Link
            href="/journal"
            className="font-sans text-xs font-semibold uppercase tracking-wider text-gold hover:text-olive transition-colors flex items-center gap-2 group"
          >
            Explore the Journal
            <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
          </Link>
        </div>

        {posts.length === 0 ? (
          <div className="bg-cream/40 border border-dashed border-olive/15 rounded-lg p-16 text-center">
            <h3 className="font-display text-xl font-medium text-olive">Journal dispatches are currently being prepared</h3>
            <p className="font-sans text-sm text-olive/60 mt-2">New travel stories, guides, and cultural diaries will be published soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {posts.map((post) => (
              <PostCard key={post.id} post={post as Post & { categories: { name: string; slug: string } | null }} />
            ))}
          </div>
        )}
      </section>

      {/* Concierge Plan CTA Section */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="bg-ink text-ivory p-12 md:p-20 rounded-sm relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-olive/20 via-transparent to-transparent pointer-events-none" />
          <div className="space-y-4 max-w-xl relative">
            <span className="font-sans text-[10px] font-bold uppercase tracking-[0.25em] text-gold">
              Tailored Planning
            </span>
            <h2 className="font-display text-3xl sm:text-5xl font-bold leading-tight text-gold">
              Bespoke Itinerary Planning
            </h2>
            <p className="font-sans text-sm text-ivory/70 font-light leading-relaxed">
              Connect with a travel specialist to start designing your journey. We will curate every experience to match your unique interests and style.
            </p>
          </div>
          <div className="relative">
            <Button href="/enquire" variant="amber">
              Begin Your Story
            </Button>
          </div>
        </div>
      </section>

    </div>
  );
}
