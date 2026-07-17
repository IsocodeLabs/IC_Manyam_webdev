import { Metadata } from "next";

export interface SeoMetaStructure {
  title?: string | null;
  description?: string | null;
  canonical_url?: string | null;
  og_title?: string | null;
  og_description?: string | null;
  og_image?: string | null;
}

interface BuildMetadataParams {
  seoMeta?: unknown;
  fallbackTitle: string;
  fallbackDescription?: string | null;
  fallbackImage?: string | null;
  path: string; // e.g., "/" or "experiences/kerala" or "journal/my-post"
  type?: "website" | "article";
}

/**
 * Builds Next.js Metadata object from CMS seo_meta JSONB and standard fallbacks.
 * Enforces British English, clean fallbacks, and absolute canonical URLs.
 */
export function buildMetadata({
  seoMeta,
  fallbackTitle,
  fallbackDescription,
  fallbackImage,
  path,
  type = "website",
}: BuildMetadataParams): Metadata {
  const meta = (seoMeta as SeoMetaStructure) || {};
  
  // Clean fallback description: strip basic markdown, replace line breaks, limit to 160 characters
  const cleanDescription = (desc: string) => {
    if (!desc) return "";
    const plain = desc
      .replace(/[#*`_\[\]]/g, "")
      .replace(/\s+/g, " ")
      .trim();
    return plain.length > 160 ? `${plain.substring(0, 157)}...` : plain;
  };

  const title = meta.title || fallbackTitle;
  const description = meta.description || cleanDescription(fallbackDescription || "");
  const image = meta.og_image || fallbackImage || "";

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mannyam.in";
  
  // Enforce canonical URL using NEXT_PUBLIC_SITE_URL or the database-provided canonical_url
  const canonicalUrl = meta.canonical_url || `${siteUrl.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: meta.og_title || title,
      description: meta.og_description || description,
      images: image ? [{ url: image }] : [],
      type,
      url: canonicalUrl,
      siteName: "MANNYAM",
    },
    twitter: {
      card: "summary_large_image",
      title: meta.og_title || title,
      description: meta.og_description || description,
      images: image ? [image] : [],
    },
  };
}
