import { supabaseAdmin } from "@/lib/supabase/admin";

export type UsageResult = {
  type: "page" | "post" | "package";
  title: string;
  id: string;
  editUrl: string;
};

/**
 * Searches the pages, posts, and packages tables to find references to a fileUrl.
 * - Pages: searches content JSONB as text
 * - Posts: searches content text
 * - Packages: searches featured_image_url
 */
export async function getMediaUsage(fileUrl: string): Promise<UsageResult[]> {
  const results: UsageResult[] = [];

  try {
    // 1. Query pages
    const { data: pages, error: pagesError } = await supabaseAdmin
      .from("pages")
      .select("id, title, content");

    if (!pagesError && pages) {
      for (const page of pages) {
        if (page.content && JSON.stringify(page.content).includes(fileUrl)) {
          results.push({
            type: "page",
            title: page.title,
            id: page.id,
            editUrl: `/pages-cms/${page.id}/edit`,
          });
        }
      }
    }

    // 2. Query posts
    const { data: posts, error: postsError } = await supabaseAdmin
      .from("posts")
      .select("id, title")
      .ilike("content", `%${fileUrl}%`);

    if (!postsError && posts) {
      for (const post of posts) {
        results.push({
          type: "post",
          title: post.title,
          id: post.id,
          editUrl: `/journal/${post.id}/edit`,
        });
      }
    }

    // 3. Query packages
    const { data: packages, error: packagesError } = await supabaseAdmin
      .from("packages")
      .select("id, title")
      .eq("featured_image_url", fileUrl);

    if (!packagesError && packages) {
      for (const pkg of packages) {
        results.push({
          type: "package",
          title: pkg.title,
          id: pkg.id,
          editUrl: `/packages/${pkg.id}/edit`,
        });
      }
    }
  } catch (error) {
    console.error("Error checking media usage:", error);
  }

  return results;
}
