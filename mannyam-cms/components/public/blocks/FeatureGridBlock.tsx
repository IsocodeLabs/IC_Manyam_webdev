import React from "react";
import { BlockData } from "./BlockRenderer";

export function FeatureGridBlock({ data }: { data: BlockData }) {
  const { features } = data;

  if (!features || !Array.isArray(features) || features.length === 0) {
    return null;
  }

  // Determine grid layout dynamically based on features length
  let gridCols = "grid-cols-1 md:grid-cols-3";
  if (features.length === 1) {
    gridCols = "grid-cols-1 max-w-xl mx-auto";
  } else if (features.length === 2) {
    gridCols = "grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto";
  } else if (features.length === 4) {
    gridCols = "grid-cols-1 md:grid-cols-2 lg:grid-cols-4";
  }

  return (
    <section className="bg-ivory py-16 sm:py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className={`grid gap-8 ${gridCols}`}>
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="bg-cream/30 border border-olive/10 hover:border-gold/30 rounded-sm p-8 space-y-4 hover:shadow-lg hover:shadow-olive/5 transition-all duration-300 flex flex-col justify-start"
            >
              {/* Icon/Emoji */}
              {feature.icon && (
                <span className="text-3xl select-none block" role="img" aria-label="Feature icon">
                  {feature.icon}
                </span>
              )}
              
              {/* Title */}
              {feature.title && (
                <h3 className="font-display text-xl font-bold text-olive">
                  {feature.title}
                </h3>
              )}

              {/* Description */}
              {feature.description && (
                <p className="font-sans text-xs sm:text-sm text-olive/75 font-light leading-relaxed">
                  {feature.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
