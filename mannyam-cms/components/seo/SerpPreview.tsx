"use client";

import React from "react";

type SerpPreviewProps = {
  title: string;
  description: string;
  slug: string;
  defaultTitle?: string;
  isPost?: boolean;
};

export function SerpPreview({
  title,
  description,
  slug,
  defaultTitle = "Untitled Page",
  isPost = false,
}: SerpPreviewProps) {
  // Truncate helper
  const truncate = (text: string, maxLen: number) => {
    if (text.length <= maxLen) return text;
    return text.substring(0, maxLen).trim() + "...";
  };

  // Resolve title display
  const displayTitle = title.trim() || defaultTitle;
  const isFallbackTitle = !title.trim();

  // Resolve description display
  const displayDescription = description.trim() || "No description provided";
  const isFallbackDescription = !description.trim();

  // Resolve slug/url display path
  const slugPath = slug ? slug : "page-slug";
  const urlDisplay = isPost
    ? `mannyam.in › journal › ${slugPath}`
    : `mannyam.in › ${slugPath}`;

  return (
    <div className="rounded-lg border border-olive/15 bg-white p-4 font-sans shadow-sm select-none">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-olive/45">Google Search Preview</p>
      
      <div className="space-y-1 bg-white p-1">
        {/* Title Link */}
        <h4
          style={{
            color: "#1a0dab",
            fontFamily: "Arial, sans-serif",
            fontSize: "18px",
            lineHeight: "1.2",
            fontWeight: "normal",
            textDecoration: "none",
          }}
          className={`truncate ${isFallbackTitle ? "opacity-55" : ""}`}
        >
          {truncate(displayTitle, 60)}
        </h4>

        {/* URL Line */}
        <p
          style={{
            color: "#006621",
            fontFamily: "Arial, sans-serif",
            fontSize: "14px",
            lineHeight: "1.3",
            whiteSpace: "nowrap",
          }}
          className="truncate"
        >
          {urlDisplay}
        </p>

        {/* Description Snippet */}
        <p
          style={{
            color: "#545454",
            fontFamily: "Arial, sans-serif",
            fontSize: "14px",
            lineHeight: "1.4",
          }}
          className={isFallbackDescription ? "italic opacity-55" : ""}
        >
          {truncate(displayDescription, 160)}
        </p>
      </div>
    </div>
  );
}
