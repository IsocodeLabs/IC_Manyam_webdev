import React from "react";
import Image from "next/image";
import Link from "next/link";

interface ArchCardProps {
  src: string;
  alt: string;
  label?: string;
  className?: string;
  aspectRatio?: "standard" | "wide";
  href?: string;
}

export function ArchCard({
  src,
  alt,
  label,
  className = "",
  aspectRatio = "standard",
  href,
}: ArchCardProps) {
  // Standard aspect ratio is 100/124. Wide is 100/86.
  const aspectClass = aspectRatio === "wide" ? "aspect-[100/86]" : "aspect-[100/124]";

  const content = (
    <div className={`relative group w-full ${aspectClass} overflow-hidden bg-[#e8e3d7] border border-olive/5 shadow-sm transition-all duration-500 ease-out hover:shadow-md rounded-t-[500px] rounded-b-sm ${className}`}>
      {/* Real Next.js Image optimization */}
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        priority={false}
      />
      
      {/* Subtle overlay shading for elegant depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#1a1e12]/60 via-transparent to-[#1a1e12]/10 opacity-80 transition-opacity duration-500 group-hover:opacity-90" />

      {/* Label overlay centered or bottom matching the .albl class */}
      {label && (
        <div className="absolute inset-0 flex items-end justify-center text-center p-6 z-10">
          <span className="font-display text-white text-lg sm:text-xl font-semibold tracking-wide transform transition-transform duration-500 ease-out group-hover:translate-y-[-4px]">
            {label}
          </span>
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block w-full">
        {content}
      </Link>
    );
  }

  return content;
}
