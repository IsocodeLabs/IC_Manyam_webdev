import { getPublishedPackages } from "@/lib/data/public";
import { SectionHeading } from "@/components/public/ui/SectionHeading";
import { PackageCard } from "@/components/public/ui/PackageCard";
import { Button } from "@/components/public/ui/Button";
import { buildMetadata } from "@/lib/seo/buildMetadata";
import type { Metadata } from "next";

export const revalidate = 3600; // Time-based ISR fallback

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    seoMeta: null,
    fallbackTitle: "Signature Journeys | MANNYAM Studio",
    fallbackDescription:
      "Ready-made private journeys across India. Take them as they are, or reshape them with a curator until they feel entirely your own.",
    path: "/journeys",
  });
}

export default async function JourneysPage() {
  const packages = await getPublishedPackages();

  return (
    <div className="min-h-screen pb-24 font-sans bg-ivory text-ink selection:bg-gold/20">
      {/* Header section */}
      <section className="bg-cream/40 border-b border-olive/10 py-16 sm:py-24 px-6">
        <SectionHeading
          eyebrow="Signature Journeys"
          heading="Stories We Have Already Written"
          intro="Take them as they are, or treat them as a first chapter and reshape them with us until the journey feels entirely your own."
        />
      </section>

      {/* Grid listing */}
      <section className="max-w-7xl mx-auto px-6 mt-16">
        {packages.length === 0 ? (
          <div className="bg-cream/40 border border-dashed border-olive/15 rounded-lg p-16 text-center max-w-2xl mx-auto">
            <h3 className="font-display text-xl font-medium text-olive">
              No journeys scheduled at this time
            </h3>
            <p className="font-sans text-sm text-olive/60 mt-2">
              We are currently curating new bespoke itineraries. Please contact
              our specialists to design your journey.
            </p>
            <div className="mt-6">
              <Button href="/enquire" variant="amber">
                Plan Your Trip
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {packages.map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
