"use client";

import React from "react";
import { BlockData } from "./BlockRenderer";
import { ConciergeForm } from "../ConciergeForm";

export function ConciergeContactBlock({ data: _data }: { data: BlockData }) {
  return (
    <section className="bg-cream/40 py-16 sm:py-24 px-6 border-t border-olive/10" id="enquire-section">
      <div className="max-w-xl mx-auto space-y-8 bg-paper p-8 sm:p-12 rounded-sm border border-olive/10 shadow-sm relative">
        <div className="text-center space-y-3">
          <span className="font-sans text-[10px] font-bold uppercase tracking-[0.25em] text-gold block">
            Bespoke Travel Planning
          </span>
          <h2 className="font-display text-3xl font-bold text-olive">
            Plan Your Journey
          </h2>
          <p className="font-sans text-xs sm:text-sm text-olive/60 font-light leading-relaxed max-w-sm mx-auto">
            Please share your details below and a curation specialist will connect with you to design your custom itinerary.
          </p>
        </div>

        <ConciergeForm />
      </div>
    </section>
  );
}
