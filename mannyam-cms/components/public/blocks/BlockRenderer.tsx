import React from "react";
import { HeroBlock } from "./HeroBlock";
import { FeatureGridBlock } from "./FeatureGridBlock";
import { TextBlock } from "./TextBlock";
import { ImageBlock } from "./ImageBlock";
import { CtaBannerBlock } from "./CtaBannerBlock";
import { TestimonialBlock } from "./TestimonialBlock";
import { ConciergeContactBlock } from "./ConciergeContactBlock";

export type BlockType = 
  | "Hero"
  | "Text Block"
  | "Feature Grid"
  | "Image Block"
  | "CTA Banner"
  | "Testimonial"
  | "Concierge Contact";

export interface BlockData {
  headline?: string;
  subheadline?: string;
  backgroundImage?: string;
  ctaText?: string;
  ctaLink?: string;
  content?: string;
  features?: { icon?: string; title?: string; description?: string }[];
  fileUrl?: string;
  altText?: string;
  caption?: string;
  body?: string;
  buttonLabel?: string;
  buttonLink?: string;
  quote?: string;
  authorName?: string;
  authorTitle?: string;
}

export interface ContentBlock {
  id: string;
  type: BlockType;
  data: BlockData;
}

interface BlockRendererProps {
  blocks: ContentBlock[] | unknown;
}

export function BlockRenderer({ blocks }: BlockRendererProps) {
  if (!blocks || !Array.isArray(blocks)) {
    return null;
  }

  return (
    <div className="w-full flex flex-col">
      {blocks.map((block: ContentBlock) => {
        if (!block || !block.type || !block.data) {
          return null;
        }

        switch (block.type) {
          case "Hero":
            return <HeroBlock key={block.id} data={block.data} />;
          case "Feature Grid":
            return <FeatureGridBlock key={block.id} data={block.data} />;
          case "Text Block":
            return <TextBlock key={block.id} data={block.data} />;
          case "Image Block":
            return <ImageBlock key={block.id} data={block.data} />;
          case "CTA Banner":
            return <CtaBannerBlock key={block.id} data={block.data} />;
          case "Testimonial":
            return <TestimonialBlock key={block.id} data={block.data} />;
          case "Concierge Contact":
            return <ConciergeContactBlock key={block.id} data={block.data} />;
          default:
            // Fail-safe: render nothing for unknown block types
            return null;
        }
      })}
    </div>
  );
}
