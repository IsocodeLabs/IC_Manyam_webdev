"use client";

import { useEffect, useState } from "react";
import { SerpPreview } from "./SerpPreview";
import { createClient } from "@/lib/supabase/client";

type SeoMeta = {
  title: string;
  description: string;
  canonical_url: string;
  og_title: string;
  og_description: string;
  og_image: string;
};

type SeoPanelProps = {
  seoMeta: SeoMeta;
  onChange: (meta: SeoMeta) => void;
  slug: string;
  defaultTitle: string;
  isPost?: boolean;
  isPackage?: boolean;
  publishedAt?: string | null;
  createdAt?: string | null;
  description?: string | null;
  packageType?: string | null;
  featuredImageUrl?: string | null;
};

type MediaItem = { id: string; file_url: string; alt_text: string };

export function SeoPanel({
  seoMeta,
  onChange,
  slug,
  defaultTitle,
  isPost = false,
  isPackage = false,
  publishedAt = null,
  createdAt = null,
  description = null,
  packageType = null,
  featuredImageUrl = null,
}: SeoPanelProps) {
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [urlError, setUrlError] = useState("");

  // Load media library list for Open Graph image picker
  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("media")
      .select("id, file_url, alt_text")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) {
          setMediaList(data);
        }
      });
  }, []);

  const updateField = (field: keyof SeoMeta, value: string) => {
    onChange({
      ...seoMeta,
      [field]: value,
    });
  };

  // Canonical URL blur validation
  const handleUrlBlur = () => {
    const url = seoMeta.canonical_url.trim();
    if (!url) {
      setUrlError("");
      return;
    }
    try {
      new URL(url);
      setUrlError("");
    } catch {
      setUrlError("Please enter a valid absolute URL (e.g. https://example.com)");
    }
  };

  // Meta Title Counter color logic
  const getTitleCounterColor = (len: number) => {
    if (len < 51) return "text-green-600";
    if (len < 60) return "text-amber-500 font-medium";
    return "text-red-600 font-bold animate-pulse";
  };

  // Meta Description Counter color logic
  const getDescCounterColor = (len: number) => {
    if (len < 141) return "text-green-600";
    if (len < 160) return "text-amber-500 font-medium";
    return "text-red-600 font-bold animate-pulse";
  };

  return (
    <div className="space-y-4 font-sans text-olive text-sm">
      {/* Meta Title */}
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <label className="text-xs font-semibold uppercase tracking-wider text-olive/80">
            Page Title (SEO)
          </label>
          <span className={`text-[10px] ${getTitleCounterColor(seoMeta.title.length)}`}>
            {seoMeta.title.length} / 60
          </span>
        </div>
        <input
          type="text"
          value={seoMeta.title}
          onChange={(e) => updateField("title", e.target.value.substring(0, 80))}
          placeholder="SEO optimized title"
          className={`w-full rounded-md border bg-cream/10 px-3 py-2 text-sm outline-none focus:border-gold ${
            seoMeta.title.length >= 60 ? "border-amber-400 bg-amber-50/5" : "border-olive/20"
          }`}
        />
        {seoMeta.title.length >= 60 && (
          <p className="text-[10px] text-amber-600 font-medium leading-normal">
            ⚠️ Title may be truncated in search results
          </p>
        )}
      </div>

      {/* Meta Description */}
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <label className="text-xs font-semibold uppercase tracking-wider text-olive/80">
            Meta Description
          </label>
          <span className={`text-[10px] ${getDescCounterColor(seoMeta.description.length)}`}>
            {seoMeta.description.length} / 160
          </span>
        </div>
        <textarea
          rows={3}
          value={seoMeta.description}
          onChange={(e) => updateField("description", e.target.value.substring(0, 200))}
          placeholder="Describe this page for search snippets..."
          className={`w-full rounded-md border bg-cream/10 px-3 py-2 text-sm outline-none resize-none focus:border-gold ${
            seoMeta.description.length >= 160 ? "border-amber-400 bg-amber-50/5" : "border-olive/20"
          }`}
        />
        {seoMeta.description.length >= 160 && (
          <p className="text-[10px] text-amber-600 font-medium leading-normal">
            ⚠️ Description may be truncated in search results
          </p>
        )}
      </div>

      {/* Canonical URL */}
      <div className="space-y-1">
        <label className="block text-xs font-semibold uppercase tracking-wider text-olive/80">
          Canonical URL
        </label>
        <input
          type="text"
          value={seoMeta.canonical_url}
          onChange={(e) => updateField("canonical_url", e.target.value)}
          onBlur={handleUrlBlur}
          placeholder="https://mannyam.in/page-slug"
          className={`w-full rounded-md border bg-cream/10 px-3 py-2 text-sm outline-none focus:border-gold font-mono text-xs ${
            urlError ? "border-red-500 bg-red-50/5" : "border-olive/20"
          }`}
        />
        {urlError && <p className="text-[10px] text-red-600 font-medium">{urlError}</p>}
      </div>

      {/* Collapsible Open Graph Section */}
      <details className="group border border-olive/10 rounded-lg overflow-hidden bg-cream/5">
        <summary className="flex items-center justify-between p-3 cursor-pointer select-none font-semibold text-xs uppercase tracking-wider text-olive/70 hover:bg-cream/15 transition-colors">
          <span>Open Graph Settings</span>
          <span className="text-olive/50 group-open:rotate-180 transition-transform duration-200">
            ▼
          </span>
        </summary>

        <div className="p-3 border-t border-olive/10 space-y-4 bg-cream/5">
          <p className="text-[10px] text-olive/50 leading-relaxed">
            Used when the page is shared on social media (Facebook, Twitter, LinkedIn).
          </p>

          {/* OG Title */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs font-medium">OG Title</label>
              <span className={`text-[10px] ${getTitleCounterColor(seoMeta.og_title.length)}`}>
                {seoMeta.og_title.length} / 60
              </span>
            </div>
            <input
              type="text"
              value={seoMeta.og_title}
              onChange={(e) => updateField("og_title", e.target.value.substring(0, 80))}
              placeholder="Social media title card"
              className="w-full rounded-md border border-olive/20 bg-cream/10 px-3 py-2 text-sm outline-none focus:border-gold"
            />
          </div>

          {/* OG Description */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs font-medium">OG Description</label>
              <span className={`text-[10px] ${getDescCounterColor(seoMeta.og_description.length)}`}>
                {seoMeta.og_description.length} / 160
              </span>
            </div>
            <textarea
              rows={2}
              value={seoMeta.og_description}
              onChange={(e) => updateField("og_description", e.target.value.substring(0, 200))}
              placeholder="Social media share snippet..."
              className="w-full rounded-md border border-olive/20 bg-cream/10 px-3 py-2 text-sm outline-none resize-none focus:border-gold"
            />
          </div>

          {/* OG Image Picker */}
          <div className="space-y-2">
            <label className="block text-xs font-medium">OG Image</label>
            {seoMeta.og_image && (
              <div className="relative aspect-video w-full overflow-hidden rounded-md border border-olive/10 bg-white">
                <img
                  src={seoMeta.og_image}
                  alt="Open Graph Preview"
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            <button
              type="button"
              onClick={() => setShowMediaModal(true)}
              className="w-full rounded border border-olive/20 px-3 py-2 text-xs font-medium hover:bg-cream/40 transition-colors"
            >
              {seoMeta.og_image ? "Change Image" : "Choose OG Image"}
            </button>
          </div>
        </div>
      </details>

      {/* Live SERP Preview */}
      <SerpPreview
        title={seoMeta.title}
        description={seoMeta.description}
        slug={slug}
        defaultTitle={defaultTitle}
        isPost={isPost}
      />

      {/* JSON-LD Schema Preview */}
      {(() => {
        let jsonLdObject: object | null = null;
        if (isPost) {
          jsonLdObject = {
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": seoMeta.title || defaultTitle,
            "description": seoMeta.description || "",
            "datePublished": publishedAt || "",
            "dateModified": createdAt || "",
            "publisher": {
              "@type": "Organization",
              "name": "MANNYAM",
              "url": "https://mannyam.in"
            }
          };
        } else if (isPackage) {
          jsonLdObject = {
            "@context": "https://schema.org",
            "@type": "TouristTrip",
            "name": seoMeta.title || defaultTitle,
            "description": description || "",
            "touristType": packageType || "",
            "image": featuredImageUrl || ""
          };
        }

        if (!jsonLdObject) return null;

        const handleCopy = () => {
          navigator.clipboard.writeText(JSON.stringify(jsonLdObject, null, 2));
          alert("JSON-LD schema copied to clipboard!");
        };

        return (
          <details className="group border border-olive/10 rounded-lg overflow-hidden bg-cream/5">
            <summary className="flex items-center justify-between p-3 cursor-pointer select-none font-semibold text-xs uppercase tracking-wider text-olive/70 hover:bg-cream/15 transition-colors">
              <span>JSON-LD Schema Preview</span>
              <span className="text-olive/50 group-open:rotate-180 transition-transform duration-200">
                ▼
              </span>
            </summary>
            <div className="p-3 border-t border-olive/10 bg-cream/10 space-y-2">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] text-olive/50 font-mono">application/ld+json</span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="rounded border border-olive/20 px-2 py-0.5 text-[10px] font-medium hover:bg-cream/40 transition-colors"
                >
                  Copy JSON-LD
                </button>
              </div>
              <pre className="overflow-x-auto rounded border border-olive/10 bg-black/5 p-2 text-[10px] font-mono leading-relaxed text-olive max-h-48 overflow-y-auto">
                <code>{JSON.stringify(jsonLdObject, null, 2)}</code>
              </pre>
            </div>
          </details>
        );
      })()}

      {/* Media Picker Modal */}
      {showMediaModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4 font-sans"
        >
          <div className="max-h-[80vh] w-full max-w-3xl overflow-auto rounded-lg bg-paper p-5 shadow-xl border border-olive/20">
            <div className="mb-4 flex justify-between items-center border-b border-olive/10 pb-3">
              <h2 className="font-display text-2xl text-olive font-semibold">
                Select Open Graph Image
              </h2>
              <button
                onClick={() => setShowMediaModal(false)}
                className="rounded border border-olive/20 px-3 py-1 text-xs hover:bg-cream"
              >
                Close
              </button>
            </div>
            {mediaList.length ? (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {mediaList.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      updateField("og_image", item.file_url);
                      setShowMediaModal(false);
                    }}
                    className="rounded border border-olive/10 p-2 text-left bg-cream/10 hover:border-gold/60 transition-colors"
                  >
                    <img
                      src={item.file_url}
                      alt={item.alt_text}
                      className="h-24 w-full object-cover rounded"
                    />
                    <span className="mt-1.5 block truncate text-xs text-olive">
                      {item.alt_text}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-olive/60">No media items are available yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
