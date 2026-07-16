import { type Database } from "@/types/database.types";

type PostRow = Database["public"]["Tables"]["posts"]["Row"];
type PackageRow = Database["public"]["Tables"]["packages"]["Row"];

export type SeoMetaStructure = {
  title?: string | null;
  description?: string | null;
  canonical_url?: string | null;
  og_title?: string | null;
  og_description?: string | null;
  og_image?: string | null;
};

/**
 * Generates JSON-LD Article schema for a Post.
 */
export function generateArticleSchema(post: PostRow): object {
  const seoMeta = (post.seo_meta as SeoMetaStructure) || {};
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "description": seoMeta.description || "",
    "datePublished": post.published_at || "",
    "dateModified": post.created_at || "",
    "publisher": {
      "@type": "Organization",
      "name": "MANNYAM",
      "url": "https://mannyam.in"
    }
  };
}

/**
 * Generates JSON-LD TouristTrip schema for a Tour Package.
 */
export function generateTourSchema(pkg: PackageRow): object {
  return {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    "name": pkg.title,
    "description": pkg.description || "",
    "touristType": pkg.type,
    "image": pkg.featured_image_url || ""
  };
}
