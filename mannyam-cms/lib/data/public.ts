import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

async function createPublicClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export type Page = Database["public"]["Tables"]["pages"]["Row"];
export type Post = Database["public"]["Tables"]["posts"]["Row"];
export type Package = Database["public"]["Tables"]["packages"]["Row"];

export async function getPublishedPages(type?: 'Landing' | 'Category' | 'Standard' | 'Form' | 'Legal') {
  const supabase = await createPublicClient();
  let query = supabase
    .from("pages")
    .select("*")
    .eq("status", "Published");
  
  if (type) {
    query = query.eq("type", type);
  }
  
  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) {
    console.error("Error fetching published pages:", error);
  }
  return data || [];
}

export async function getPublishedPosts(limit?: number, categorySlug?: string) {
  const supabase = await createPublicClient();
  
  let query;
  if (categorySlug) {
    query = supabase
      .from("posts")
      .select("*, categories!inner(*)")
      .eq("status", "Published")
      .eq("categories.slug", categorySlug);
  } else {
    query = supabase
      .from("posts")
      .select("*, categories(*)")
      .eq("status", "Published");
  }
  
  query = query.order("published_at", { ascending: false });
  
  if (limit) {
    query = query.limit(limit);
  }
  
  const { data, error } = await query;
  if (error) {
    console.error("Error fetching published posts:", error);
  }
  return data || [];
}

export async function getPublishedPackages(
  type?: 'Festival' | 'Destination' | 'Honeymoon' | 'Wildlife' | 'Wellness',
  limit?: number
) {
  const supabase = await createPublicClient();
  let query = supabase
    .from("packages")
    .select("*");
  
  if (type) {
    query = query.eq("type", type);
  }
  
  query = query.order("created_at", { ascending: false });
  
  if (limit) {
    query = query.limit(limit);
  }
  
  const { data, error } = await query;
  if (error) {
    console.error("Error fetching published packages:", error);
  }
  return data || [];
}

export async function getPackageBySlug(slug: string) {
  const supabase = await createPublicClient();
  const { data, error } = await supabase
    .from("packages")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  
  if (error) {
    console.error(`Error fetching package by slug ${slug}:`, error);
  }
  return data || null;
}

export async function getPostBySlug(slug: string) {
  const supabase = await createPublicClient();
  const { data, error } = await supabase
    .from("posts")
    .select("*, categories(*), post_tags(tags(*))")
    .eq("slug", slug)
    .eq("status", "Published")
    .maybeSingle();
  
  if (error) {
    console.error(`Error fetching post by slug ${slug}:`, error);
  }
  return data || null;
}

export async function getPublishedPostsPaginated(
  page: number = 1,
  limit: number = 12,
  categorySlug?: string
) {
  const supabase = await createPublicClient();
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query;
  if (categorySlug) {
    query = supabase
      .from("posts")
      .select("*, categories!inner(*), post_tags(tags(*))", { count: "exact" })
      .eq("status", "Published")
      .eq("categories.slug", categorySlug);
  } else {
    query = supabase
      .from("posts")
      .select("*, categories(*), post_tags(tags(*))", { count: "exact" })
      .eq("status", "Published");
  }

  query = query
    .order("published_at", { ascending: false })
    .range(from, to);

  const { data, error, count } = await query;
  if (error) {
    console.error("Error fetching published posts paginated:", error);
  }
  return {
    posts: data || [],
    totalCount: count || 0,
  };
}

export async function getCategories() {
  const supabase = await createPublicClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });
  
  if (error) {
    console.error("Error fetching categories:", error);
  }
  return data || [];
}

export async function getCategoryBySlug(slug: string) {
  const supabase = await createPublicClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  
  if (error) {
    console.error(`Error fetching category by slug ${slug}:`, error);
  }
  return data || null;
}

export async function getRelatedPosts(postId: string, categoryId: string, limit = 3) {
  const supabase = await createPublicClient();
  const { data, error } = await supabase
    .from("posts")
    .select("*, categories(*), post_tags(tags(*))")
    .eq("status", "Published")
    .eq("category_id", categoryId)
    .neq("id", postId)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching related posts:", error);
  }
  return data || [];
}

export async function getPageBySlug(slug: string) {
  const supabase = await createPublicClient();
  const { data, error } = await supabase
    .from("pages")
    .select("*")
    .eq("slug", slug)
    .eq("status", "Published")
    .maybeSingle();
  
  if (error) {
    console.error(`Error fetching page by slug ${slug}:`, error);
  }
  return data || null;
}

/**
 * Fetch published pages whose slug starts with a given prefix.
 * Used by listing pages to show category pages (experience-*, festival-*, destination-*).
 */
export async function getPublishedPagesBySlugPrefix(prefix: string) {
  const supabase = await createPublicClient();
  const { data, error } = await supabase
    .from("pages")
    .select("*")
    .eq("status", "Published")
    .like("slug", `${prefix}%`)
    .order("created_at", { ascending: true });

  if (error) {
    console.error(`Error fetching pages with prefix ${prefix}:`, error);
  }
  return data || [];
}
