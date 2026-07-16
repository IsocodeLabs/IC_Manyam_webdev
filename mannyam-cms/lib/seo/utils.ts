export type SeoMetaValue = {
  title?: string | null;
  description?: string | null;
  canonical_url?: string | null;
  canonicalUrl?: string | null;
  og_title?: string | null;
  og_description?: string | null;
  og_image?: string | null;
  featuredImageUrl?: string | null;
};

/**
 * Calculates an SEO score from 0 to 100 based on standard guidelines:
 * - Meta Title: 10-60 characters (+25 points)
 * - Meta Description: 50-160 characters (+25 points)
 * - OG Image set (+25 points)
 * - Canonical URL set (+25 points)
 */
export function calculateSeoScore(seoMeta: SeoMetaValue | null | undefined): number {
  let score = 0;
  if (!seoMeta) return score;

  const title = seoMeta.title || "";
  if (title.trim() && title.length >= 10 && title.length <= 60) {
    score += 25;
  }

  const desc = seoMeta.description || "";
  if (desc.trim() && desc.length >= 50 && desc.length <= 160) {
    score += 25;
  }

  const ogImg = seoMeta.og_image || seoMeta.featuredImageUrl || "";
  if (ogImg.trim()) {
    score += 25;
  }

  const canonical = seoMeta.canonical_url || seoMeta.canonicalUrl || "";
  if (canonical.trim()) {
    score += 25;
  }

  return score;
}
