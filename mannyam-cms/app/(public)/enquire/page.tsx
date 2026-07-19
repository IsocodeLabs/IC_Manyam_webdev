import React from "react";
import { ConciergeForm } from "@/components/public/ConciergeForm";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CtaSection } from "@/components/public/CtaSection";

export const revalidate = 0; // Ensure fresh server-side renders

export const metadata: Metadata = {
  title: "Tell us your story | MANNYAM Studio",
  description: "Share a little about who you are and what stirs you. Within a day, a curator will write back with a first outline.",
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
    <div className="min-h-screen font-sans bg-ivory text-ink selection:bg-gold/20">
      
      {/* Header section */}
      <section className="bg-cream/40 border-b border-olive/10 pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <nav className="font-sans text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-gold/70 flex justify-center gap-3">
            <Link href="/" className="hover:text-gold transition-colors">Home</Link>
            <span>/</span>
            <span className="text-gold">Enquire</span>
          </nav>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-olive tracking-tight leading-tight">
            Tell us your story
          </h1>
          <p className="font-display text-base sm:text-lg text-olive/75 italic max-w-2xl mx-auto font-light leading-relaxed">
            Share a little about who you are and what stirs you. Within one working day, a curator will write back with a first outline. No cost, and no obligation.
          </p>
        </div>
      </section>

      {/* Arch image */}
      <section className="relative -mt-8 flex justify-center px-6 z-10">
        <div className="relative w-full max-w-lg aspect-[4/5] sm:aspect-[16/9] rounded-t-full overflow-hidden shadow-xl border-4 border-ivory">
          <Image
            src="https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=2076&auto=format&fit=crop"
            alt="Honeymoon couple overlooking Taj Mahal"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-olive/80 via-olive/20 to-transparent flex items-end justify-center pb-8 px-4">
            <h2 className="font-display text-xl sm:text-2xl text-ivory text-center font-bold text-balance drop-shadow-md">
              Your first outline arrives within a day
            </h2>
          </div>
        </div>
      </section>

      {/* Main Form Section */}
      <section className="max-w-7xl mx-auto px-6 py-16 sm:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          
          {/* Left Columns - Form Card */}
          <div className="lg:col-span-2 bg-paper border border-olive/10 p-8 sm:p-12 rounded-sm shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold/40 via-gold to-gold/40"></div>
            <h3 className="font-display text-2xl text-olive font-bold mb-8">Begin your journey</h3>
            <ConciergeForm journey={journey} sourcePage="/enquire" />
          </div>

          {/* Right Column - Sidebar Notes */}
          <aside className="space-y-6 lg:sticky lg:top-32">
            
            {/* Checklist Card */}
            <div className="bg-cream/40 border border-olive/10 p-8 rounded-sm space-y-6 shadow-sm text-olive">
              <h3 className="font-display text-xl font-bold border-b border-olive/10 pb-4">
                What happens next
              </h3>
              
              <ul className="space-y-6">
                <li className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-gold/15 text-gold flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">1</div>
                  <div>
                    <h4 className="font-bold text-sm mb-1">A real curator reads your story</h4>
                    <p className="text-xs text-olive/75 font-light leading-relaxed">No automated replies. One of our specialists will personally review your details.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-gold/15 text-gold flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">2</div>
                  <div>
                    <h4 className="font-bold text-sm mb-1">You receive a tailored sketch</h4>
                    <p className="text-xs text-olive/75 font-light leading-relaxed">Within 24 hours, expect an initial itinerary sketch reflecting your pace and interests.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-gold/15 text-gold flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">3</div>
                  <div>
                    <h4 className="font-bold text-sm mb-1">We refine it together</h4>
                    <p className="text-xs text-olive/75 font-light leading-relaxed">We hop on a call or email to tweak the details until the journey is unmistakably yours.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-gold/15 text-gold flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">4</div>
                  <div>
                    <h4 className="font-bold text-sm mb-1">You travel seamlessly</h4>
                    <p className="text-xs text-olive/75 font-light leading-relaxed">Everything is handled. Your only job is to immerse yourself in the experience.</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Quick Sketch CTA */}
            <div className="bg-olive text-ivory p-8 rounded-sm space-y-4 shadow-sm text-center">
              <h4 className="font-display text-lg font-bold">
                Prefer a quick sketch?
              </h4>
              <p className="text-xs text-ivory/70 font-light mb-4">
                Let us build a rapid itinerary outline for you on WhatsApp.
              </p>
              <a href="https://wa.me/message/XXXXXX" target="_blank" rel="noopener noreferrer" className="inline-block border border-gold/50 text-gold hover:bg-gold hover:text-ivory px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-colors w-full">
                Ask the concierge
              </a>
            </div>

          </aside>

        </div>
      </section>

      {/* Dark Closing CTA Section */}
      <CtaSection />
    </div>
  );
}
