import { getPublishedPagesBySlugPrefix } from "@/lib/data/public";
import { SectionHeading } from "@/components/public/ui/SectionHeading";
import { PageCard } from "@/components/public/ui/PageCard";
import { Button } from "@/components/public/ui/Button";
import { buildMetadata } from "@/lib/seo/buildMetadata";
import type { Metadata } from "next";
import { ListingFaq } from "@/components/public/ListingFaq";
import { ClosingCta } from "@/components/public/ClosingCta";

const festivalFaqs = [
  {
    question: "Which festivals can I plan a trip around in India?",
    answer: "We arrange private journeys around Holi, Diwali, Dussehra, Durga Puja, Navratri, Ganesh Chaturthi, harvest festivals and year-round celebration shows."
  },
  {
    question: "When do India's main festivals take place?",
    answer: "Holi in March, Diwali and Dussehra in October-November, Navratri in October, Ganesh Chaturthi from August, harvest festivals in January and August. Dates shift each year."
  },
  {
    question: "Is it safe to attend Indian festivals as a foreign visitor?",
    answer: "Yes. We arrange trusted local hosts and calm, safe vantage points so you enjoy the celebration in comfort."
  },
  {
    question: "How early should I book a festival journey?",
    answer: "Festival dates draw crowds and the best stays fill early. We recommend planning several months in advance."
  },
  {
    question: "Can a festival be part of a longer India journey?",
    answer: "Absolutely. We pair the festival with palaces, backwaters or wildlife so the celebration becomes the heart of a longer trip."
  }
];

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    seoMeta: null,
    fallbackTitle: "Festivals of India | MANNYAM Studio",
    fallbackDescription:
      "India's festivals are its culture at full volume. Choose a celebration, and we will plan the journey around it.",
    path: "/festivals",
  });
}

export default async function FestivalsPage() {
  const pages = await getPublishedPagesBySlugPrefix("festival-");

  return (
    <div className="min-h-screen pb-24 font-sans bg-ivory text-ink selection:bg-gold/20">
      {/* Header */}
      <section className="bg-cream/40 border-b border-olive/10 py-16 sm:py-24 px-6">
        <SectionHeading
          eyebrow="Festival Journeys"
          heading="Festivals of India"
          intro="India's festivals are its culture at full volume. Choose a celebration, and we will plan the journey around it, city by city."
        />
      </section>

      {/* Grid */}
      <section className="max-w-7xl mx-auto px-6 mt-16">
        {pages.length === 0 ? (
          <div className="bg-cream/40 border border-dashed border-olive/15 rounded-lg p-16 text-center max-w-2xl mx-auto">
            <h3 className="font-display text-xl font-medium text-olive">
              No festival journeys available at this time
            </h3>
            <p className="font-sans text-sm text-olive/60 mt-2">
              We are currently curating new festival programmes. Please contact our specialists.
            </p>
            <div className="mt-6">
              <Button href="/enquire" variant="amber">Plan Your Trip</Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-12">
            {pages.map((page) => {
              let whenStr = undefined;
              if (Array.isArray(page.content)) {
                const factBlock = page.content.find(
                  (b: any) => b?.type === "FactBar"
                ) as any;
                if (factBlock?.data?.facts) {
                  const whenFact = factBlock.data.facts.find(
                    (f: any) => f.label?.toLowerCase() === "when"
                  );
                  if (whenFact) whenStr = whenFact.value;
                }
              }
              return <PageCard key={page.id} page={page} when={whenStr} />;
            })}
          </div>
        )}
      </section>

      <ListingFaq
        heading="Questions, answered simply"
        subtitle="How private India experiences work, answered in plain language."
        items={festivalFaqs}
      />

      <ClosingCta />
    </div>
  );
}
