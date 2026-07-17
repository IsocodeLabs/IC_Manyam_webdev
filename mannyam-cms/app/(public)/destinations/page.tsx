import { getPublishedPackages } from "@/lib/data/public";
import { SectionHeading } from "@/components/public/ui/SectionHeading";
import { PackageCard } from "@/components/public/ui/PackageCard";
import { Button } from "@/components/public/ui/Button";

export const revalidate = 3600; // Time-based ISR fallback

export default async function DestinationsPage() {
  const packages = await getPublishedPackages("Destination");

  return (
    <div className="min-h-screen pb-24 font-sans bg-ivory text-ink selection:bg-gold/20">
      
      {/* Header section */}
      <section className="bg-cream/40 border-b border-olive/10 py-16 sm:py-24 px-6">
        <SectionHeading
          eyebrow="Custom Curations"
          heading="Our Destinations"
          intro="From the grand palaces of Rajasthan to the serene backwaters of Kerala, discover the stories of India."
        />
      </section>

      {/* Grid listing */}
      <section className="max-w-7xl mx-auto px-6 mt-16">
        {packages.length === 0 ? (
          <div className="bg-cream/40 border border-dashed border-olive/15 rounded-lg p-16 text-center max-w-2xl mx-auto">
            <h3 className="font-display text-xl font-medium text-olive">No destination packages scheduled currently</h3>
            <p className="font-sans text-sm text-olive/60 mt-2">
              We are currently designing new bespoke destination routes. Please contact our curators to build yours.
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
