import React from "react";
import { BlockData } from "./BlockRenderer";

export function ImageBlock({ data }: { data: BlockData }) {
  const { fileUrl, altText, caption } = data;

  if (!fileUrl) return null;

  return (
    <section className="bg-ivory py-8 px-6">
      <div className="max-w-5xl mx-auto flex flex-col items-center">
        <div className="w-full relative overflow-hidden rounded-sm border border-olive/10 bg-olive/5">
          <img
            src={fileUrl}
            alt={altText || "MANNYAM Studio Curation"}
            className="w-full h-auto object-cover max-h-[80vh] block"
          />
        </div>
        {caption && (
          <p className="font-sans text-[11px] sm:text-xs text-olive/50 font-light mt-3 italic text-center max-w-2xl">
            {caption}
          </p>
        )}
      </div>
    </section>
  );
}
