import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Package } from "@/lib/data/public";
import { Badge } from "./Badge";

interface PackageCardProps {
  pkg: Package;
  className?: string;
}

export function PackageCard({ pkg, className = "" }: PackageCardProps) {
  // If package is a Festival, link to /festivals/[slug], else /experiences/[slug]
  const href = pkg.type === "Festival" ? `/festivals/${pkg.slug}` : `/experiences/${pkg.slug}`;

  return (
    <article
      className={`bg-cream/30 border border-olive/10 hover:border-gold/30 rounded-sm overflow-hidden flex flex-col group hover:shadow-xl hover:shadow-olive/5 transition-all duration-500 ${className}`}
    >
      {/* Elegant Arch Image Header inside Card */}
      <div className="aspect-[4/3] bg-olive/5 relative overflow-hidden">
        {pkg.featured_image_url ? (
          <Image
            src={pkg.featured_image_url}
            alt={pkg.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-olive/20 font-display italic text-base bg-olive/5">
            Bespoke Journey
          </div>
        )}
        
        {/* Type Badge absolute overlay */}
        <div className="absolute top-4 left-4">
          <Badge variant="amber" className="bg-ink/85 text-ivory border-transparent py-1 px-2.5 backdrop-blur-sm">
            {pkg.type}
          </Badge>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6 flex flex-col flex-grow justify-between space-y-6">
        <div className="space-y-2">
          <h3 className="font-display text-xl font-bold text-olive group-hover:text-gold transition-colors duration-300">
            {pkg.title}
          </h3>
          <p className="font-sans text-xs text-olive/75 line-clamp-3 font-light leading-relaxed">
            {pkg.description}
          </p>
        </div>
        
        <Link
          href={href}
          className="font-sans text-[11px] font-bold uppercase tracking-wider text-gold hover:text-olive transition-colors flex items-center gap-1.5 pt-2"
        >
          Explore Itinerary <span className="transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
        </Link>
      </div>
    </article>
  );
}
