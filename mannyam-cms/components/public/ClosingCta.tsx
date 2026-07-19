import React from "react";
import Image from "next/image";
import { Button } from "./ui/Button";

export function ClosingCta() {
  return (
    <section className="relative w-full overflow-hidden text-center py-24 md:py-32 flex flex-col items-center justify-center">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=75&w=1200&auto=format&fit=crop"
          alt="Taj Mahal"
          fill
          sizes="100vw"
          className="object-cover"
        />
        {/* Dark radial gradient overlay */}
        <div 
          className="absolute inset-0"
          style={{ background: 'radial-gradient(120% 130% at 50% 0%, rgba(74,82,55,.8), rgba(44,49,32,.92))' }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-2xl mx-auto px-6 flex flex-col items-center">
        <span className="font-sans text-[9px] font-bold uppercase tracking-[0.24em] text-sand block mb-4 md:mb-6">
          Begin
        </span>
        <h2 className="font-display text-[34px] md:text-[60px] text-ivory mb-6 leading-tight">
          Ready to write your <em className="text-gold italic font-medium">India?</em>
        </h2>
        <p className="font-sans text-[15px] text-ivory/80 font-light mb-10 max-w-lg mx-auto leading-relaxed">
          One short note is all it takes. Tell us what stirs you, and a curator will shape the first outline within a day.
        </p>
        
        <Button variant="amber" href="/enquire" className="mb-6">
          Plan my journey
        </Button>
        
        <p className="font-display italic text-ivory/60 text-lg">
          Free to start, and no obligation.
        </p>
      </div>
    </section>
  );
}
