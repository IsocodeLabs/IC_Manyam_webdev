import React from "react";
import DOMPurify from "isomorphic-dompurify";
import { BlockData } from "./BlockRenderer";

export function TextBlock({ data }: { data: BlockData }) {
  const { content } = data;

  if (!content) return null;

  const cleanHtml = DOMPurify.sanitize(content);

  return (
    <section className="bg-ivory py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div
          dangerouslySetInnerHTML={{ __html: cleanHtml }}
          className="prose prose-olive max-w-none text-olive/80 font-sans font-light text-sm sm:text-base leading-relaxed space-y-4
            prose-headings:font-display prose-headings:text-olive prose-headings:font-bold
            prose-p:mb-6 prose-a:text-gold prose-a:underline hover:prose-a:text-olive prose-a:transition-colors
            prose-strong:font-bold prose-strong:text-olive"
        />
      </div>
    </section>
  );
}
