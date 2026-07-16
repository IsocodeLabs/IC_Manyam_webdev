"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { calculateSeoScore, type SeoMetaValue } from "@/lib/seo/utils";

export type ContentType = "page" | "post" | "package";

async function requireEditor() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("You must be signed in.");
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();
  if (!profile || !["Admin", "Content Manager"].includes(profile.role)) {
    throw new Error("Access denied.");
  }
  return { supabase, user };
}

/**
 * Updates only the seo_meta column of a specific content row.
 */
export async function updateSeoMeta(
  type: ContentType,
  id: string,
  seoMeta: SeoMetaValue
) {
  await requireEditor();

  const tableMap: Record<ContentType, "pages" | "posts" | "packages"> = {
    page: "pages",
    post: "posts",
    package: "packages",
  };

  const table = tableMap[type];
  if (!table) throw new Error("Invalid content type.");

  const { error } = await supabaseAdmin
    .from(table)
    .update({ seo_meta: seoMeta })
    .eq("id", id);

  if (error) {
    throw new Error(`Failed to update metadata: ${error.message}`);
  }

  revalidatePath("/seo");
  revalidatePath("/journal");
  revalidatePath("/pages-cms");
  revalidatePath("/packages");
  return { ok: true as const };
}

/**
 * Helper to escape fields for CSV format
 */
function escapeCsvValue(val: string | number | null | undefined): string {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

/**
 * Generates and returns a CSV string for the SEO audit report.
 */
export async function exportSeoReport(): Promise<string> {
  await requireEditor();

  // Fetch all content
  const [pagesResult, postsResult, packagesResult] = await Promise.all([
    supabaseAdmin.from("pages").select("title, slug, seo_meta"),
    supabaseAdmin.from("posts").select("title, slug, seo_meta"),
    supabaseAdmin.from("packages").select("title, slug, seo_meta"),
  ]);

  const rows = [
    ["Type", "Title", "Slug", "Meta Title", "Meta Description", "SEO Score"].join(",")
  ];

  // Process pages
  if (pagesResult.data) {
    for (const page of pagesResult.data) {
      const meta = (page.seo_meta as SeoMetaValue) || {};
      const score = calculateSeoScore(meta);
      rows.push([
        escapeCsvValue("Page"),
        escapeCsvValue(page.title),
        escapeCsvValue(page.slug),
        escapeCsvValue(meta.title || ""),
        escapeCsvValue(meta.description || ""),
        escapeCsvValue(score)
      ].join(","));
    }
  }

  // Process posts
  if (postsResult.data) {
    for (const post of postsResult.data) {
      const meta = (post.seo_meta as SeoMetaValue) || {};
      const score = calculateSeoScore(meta);
      rows.push([
        escapeCsvValue("Post"),
        escapeCsvValue(post.title),
        escapeCsvValue(post.slug),
        escapeCsvValue(meta.title || ""),
        escapeCsvValue(meta.description || ""),
        escapeCsvValue(score)
      ].join(","));
    }
  }

  // Process packages
  if (packagesResult.data) {
    for (const pkg of packagesResult.data) {
      const meta = (pkg.seo_meta as SeoMetaValue) || {};
      const score = calculateSeoScore(meta);
      rows.push([
        escapeCsvValue("Package"),
        escapeCsvValue(pkg.title),
        escapeCsvValue(pkg.slug),
        escapeCsvValue(meta.title || ""),
        escapeCsvValue(meta.description || ""),
        escapeCsvValue(score)
      ].join(","));
    }
  }

  return rows.join("\n");
}
