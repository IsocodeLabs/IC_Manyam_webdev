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
    fallbackTitle: "Experiences | MANNYAM Studio",
    fallbackDescription:
      "Travel by the feeling you are after. From food walks to royal evenings, choose the kind of moments you want.",
    path: "/experiences",
  });
}

export default async function ExperiencesPage() {
  const pages = await getPublishedPagesBySlugPrefix("experience-");

  return (
    <div className="min-h-screen pb-24 font-sans bg-ivory text-ink selection:bg-gold/20">
      {/* Header */}
      <section className="bg-cream/40 border-b border-olive/10 py-16 sm:py-24 px-6">
        <SectionHeading
          eyebrow="Experiences"
          heading="Travel by the Feeling You Are After"
          intro="From food walks to royal evenings, choose the kind of moments you want, and we will weave them into a journey that is yours."
        />
      </section>

      {/* Grid */}
      <section className="max-w-7xl mx-auto px-6 mt-16">
        {pages.length === 0 ? (
          <div className="bg-cream/40 border border-dashed border-olive/15 rounded-lg p-16 text-center max-w-2xl mx-auto">
            <h3 className="font-display text-xl font-medium text-olive">
              No experiences available at this time
            </h3>
            <p className="font-sans text-sm text-olive/60 mt-2">
              We are currently curating new bespoke experiences. Please contact our specialists.
            </p>
            <div className="mt-6">
              <Button href="/enquire" variant="amber">Plan Your Trip</Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-12">
            {pages.map((page) => (
              <PageCard key={page.id} page={page} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
