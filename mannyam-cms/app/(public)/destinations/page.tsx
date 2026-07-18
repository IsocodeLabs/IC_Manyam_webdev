import { getPublishedPagesBySlugPrefix } from "@/lib/data/public";
import { SectionHeading } from "@/components/public/ui/SectionHeading";
import { PageCard } from "@/components/public/ui/PageCard";
import { Button } from "@/components/public/ui/Button";
import { buildMetadata } from "@/lib/seo/buildMetadata";
import type { Metadata } from "next";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    seoMeta: null,
    fallbackTitle: "Destinations | MANNYAM Studio",
    fallbackDescription:
      "A different India in every direction. Choose where to begin, and we will pair it with the right experiences.",
    path: "/destinations",
  });
}

export default async function DestinationsPage() {
  const pages = await getPublishedPagesBySlugPrefix("destination-");

  return (
    <div className="min-h-screen pb-24 font-sans bg-ivory text-ink selection:bg-gold/20">
      {/* Header */}
      <section className="bg-cream/40 border-b border-olive/10 py-16 sm:py-24 px-6">
        <SectionHeading
          eyebrow="Destinations"
          heading="Choose Where to Begin"
          intro="A different India in every direction. Pick a region, and we will pair it with the experiences and pace that suit you best."
        />
      </section>

      {/* Grid */}
      <section className="max-w-7xl mx-auto px-6 mt-16">
        {pages.length === 0 ? (
          <div className="bg-cream/40 border border-dashed border-olive/15 rounded-lg p-16 text-center max-w-2xl mx-auto">
            <h3 className="font-display text-xl font-medium text-olive">
              No destinations available at this time
            </h3>
            <p className="font-sans text-sm text-olive/60 mt-2">
              We are currently designing new bespoke routes. Please contact our curators.
            </p>
            <div className="mt-6">
              <Button href="/enquire" variant="amber">Plan Your Trip</Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {pages.map((page) => (
              <PageCard key={page.id} page={page} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
