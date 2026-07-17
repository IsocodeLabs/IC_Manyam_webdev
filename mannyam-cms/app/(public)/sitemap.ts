import { MetadataRoute } from "next";
import { supabaseAdmin } from "@/lib/supabase/admin";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [
    { data: pages },
    { data: posts },
    { data: packages },
  ] = await Promise.all([
    supabaseAdmin
      .from("pages")
      .select("slug, type, updated_at")
      .eq("status", "Published"),
    supabaseAdmin
      .from("posts")
      .select("slug, published_at")
      .eq("status", "Published"),
    supabaseAdmin
      .from("packages")
      .select("slug, created_at"),
  ]);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mannyam.in";
  const sitemapEntries: MetadataRoute.Sitemap = [];

  // Home Page entry
  sitemapEntries.push({
    url: `${siteUrl}/`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 1.0,
  });

  // Experiences Landing
  sitemapEntries.push({
    url: `${siteUrl}/experiences`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.9,
  });

  // Festivals Landing
  sitemapEntries.push({
    url: `${siteUrl}/festivals`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.9,
  });

  // Journal Landing
  sitemapEntries.push({
    url: `${siteUrl}/journal`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  });

  // Custom CMS Pages
  for (const page of pages ?? []) {
    if (page.slug && page.slug !== "/") {
      sitemapEntries.push({
        url: `${siteUrl}/${page.slug}`,
        lastModified: page.updated_at ? new Date(page.updated_at) : new Date(),
        changeFrequency: "weekly",
        priority: page.type === "Landing" ? 0.9 : page.type === "Category" ? 0.8 : 0.6,
      });
    }
  }

  // Journal Posts
  for (const post of posts ?? []) {
    if (post.slug) {
      sitemapEntries.push({
        url: `${siteUrl}/journal/${post.slug}`,
        lastModified: post.published_at ? new Date(post.published_at) : new Date(),
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  }

  // Packages (Experiences)
  for (const pkg of packages ?? []) {
    if (pkg.slug) {
      sitemapEntries.push({
        url: `${siteUrl}/experiences/${pkg.slug}`,
        lastModified: pkg.created_at ? new Date(pkg.created_at) : new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }
  }

  return sitemapEntries;
}
