import React from "react";
import { ConciergeForm } from "@/components/public/ConciergeForm";
import type { Metadata } from "next";

export const revalidate = 0; // Ensure fresh server-side renders

export const metadata: Metadata = {
  title: "Plan Your Journey | MANNYAM Studio",
  description: "Share a little about who you are and what stirs you. Within a day, a curator will write back with a first outline. No cost, and no obligation.",
  alternates: {
    canonical: "https://mannyam.in/enquire",
  },
};

interface EnquirePageProps {
  searchParams: Promise<{ journey?: string }>;
}

export default async function EnquirePage({ searchParams }: EnquirePageProps) {
  const resolvedParams = await searchParams;
  const journey = resolvedParams.journey || "";

  return (
    <div className="min-h-screen pb-24 font-sans bg-ivory text-ink selection:bg-gold/20">
      
      {/* Header section */}
      <section className="bg-cream/40 border-b border-olive/10 py-16 sm:py-24 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.3em] text-gold block">
            Plan My Journey
          </span>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-olive tracking-tight leading-tight">
            Tell us your story
          </h1>
          <p className="font-display text-base sm:text-lg text-olive/75 italic max-w-2xl mx-auto font-light leading-relaxed">
            Share a little about who you are and what stirs you. Within one working day, a curator will write back with a first outline. No cost, and no obligation.
          </p>
        </div>
      </section>

      {/* Main Form Section */}
      <section className="max-w-7xl mx-auto px-6 mt-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          
          {/* Left Columns - Reusable Form */}
          <div className="lg:col-span-2 bg-paper border border-olive/10 p-8 sm:p-10 rounded-sm shadow-sm">
            <ConciergeForm journey={journey} sourcePage="/enquire" />
          </div>

          {/* Right Column - Sidebar Notes */}
          <aside className="space-y-6 lg:sticky lg:top-32">
            
            {/* Outline Card */}
            <div className="bg-cream/40 border border-olive/10 p-6 rounded-sm space-y-4 shadow-sm text-olive">
              <h3 className="font-display text-lg font-bold">
                Your first outline arrives within a day
              </h3>
              <p className="font-sans text-xs text-olive/75 leading-relaxed font-light">
                Our curators design bespoke itineraries tailored entirely to your interests, pace, and travel style. Every trip is hand-crafted from scratch.
              </p>
            </div>

            {/* Inclusions info */}
            <div className="bg-cream/20 border border-olive/5 p-6 rounded-sm space-y-4 text-olive">
              <h4 className="font-sans text-[10px] font-bold uppercase tracking-wider text-gold">
                The Curators Promise
              </h4>
              <ul className="space-y-2 text-xs font-light text-olive/80">
                <li className="flex items-start gap-2">
                  <span className="text-gold font-bold">✓</span>
                  <span>Bespoke route design and hotel selection</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gold font-bold">✓</span>
                  <span>Expert local guides and private logistics</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gold font-bold">✓</span>
                  <span>Authentic cultural interactions and special access</span>
                </li>
              </ul>
            </div>

          </aside>

        </div>
      </section>

    </div>
  );
}
