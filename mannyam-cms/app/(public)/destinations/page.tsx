import { getPublishedPagesBySlugPrefix } from "@/lib/data/public";
import { SectionHeading } from "@/components/public/ui/SectionHeading";
import { PageCard } from "@/components/public/ui/PageCard";
import { Button } from "@/components/public/ui/Button";
import { ListingFaq } from "@/components/public/ListingFaq";
import { ClosingCta } from "@/components/public/ClosingCta";
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

  const faqItems = [
    {
      question: "Which regions of India should I visit?",
      answer: "Favourite regions include Rajasthan, Kerala, the Himalayas, Tamil Nadu, Varanasi and the Ganges, the North-East and Gujarat. Each offers a very different India."
    },
    {
      question: "When is the best time to visit India?",
      answer: "Broadly, October to March suits most of the country, while the Himalayas are best May to September. Your curator will advise."
    },
    {
      question: "How many regions can I see in one trip?",
      answer: "For an unhurried journey we suggest one or two regions over a week or two. Fewer places, properly understood."
    },
    {
      question: "Is India safe and comfortable to travel in?",
      answer: "With private transport, vetted drivers, carefully chosen stays and support around the clock, India is comfortable and safe."
    },
    {
      question: "How do I plan a private India tour?",
      answer: "Pick a region or let the concierge suggest one, then send a note through our enquiry form. A curator replies within a day."
    }
  ];

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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-12">
            {pages.map((page) => (
              <PageCard key={page.id} page={page} />
            ))}
          </div>
        )}
      </section>

      {/* FAQ */}
      <div className="mt-24 mb-16">
        <ListingFaq 
          heading="Questions, answered simply" 
          subtitle="How private India experiences work, answered in plain language." 
          items={faqItems} 
        />
      </div>

      {/* Closing CTA */}
      <ClosingCta />
    </div>
  );
}
