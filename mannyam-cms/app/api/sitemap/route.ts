import "server-only";

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mannyam.in";

/** Priority map for page types */
function getPagePriority(type: string): string {
  switch (type) {
    case "Landing":
      return "0.9";
    case "Category":
      return "0.8";
    case "Standard":
    case "Form":
    case "Legal":
    default:
      return "0.6";
  }
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toIsoDate(dateString: string | null): string {
  if (!dateString) return new Date().toISOString().split("T")[0];
  try {
    return new Date(dateString).toISOString().split("T")[0];
  } catch {
    return new Date().toISOString().split("T")[0];
  }
}

export async function GET() {
  const [
    { data: pages },
    { data: posts },
    { data: packages },
  ] = await Promise.all([
    supabaseAdmin
      .from("pages")
      .select("id, slug, type, updated_at")
      .eq("status", "Published"),
    supabaseAdmin
      .from("posts")
      .select("id, slug, published_at")
      .eq("status", "Published"),
    supabaseAdmin
      .from("packages")
      .select("id, slug, created_at"),
  ]);

  const urls: string[] = [];

  // Pages
  for (const page of pages ?? []) {
    urls.push(`  <url>
    <loc>${escapeXml(`${SITE_URL}/${page.slug}`)}</loc>
    <lastmod>${toIsoDate(page.updated_at)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${getPagePriority(page.type)}</priority>
  </url>`);
  }

  // Posts
  for (const post of posts ?? []) {
    urls.push(`  <url>
    <loc>${escapeXml(`${SITE_URL}/journal/${post.slug}`)}</loc>
    <lastmod>${toIsoDate(post.published_at)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`);
  }

  // Packages
  for (const pkg of packages ?? []) {
    urls.push(`  <url>
    <loc>${escapeXml(`${SITE_URL}/packages/${pkg.slug}`)}</loc>
    <lastmod>${toIsoDate(pkg.created_at)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600",
    },
  });
}
