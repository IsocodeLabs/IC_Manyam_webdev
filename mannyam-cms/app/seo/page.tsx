import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SeoOverviewClient } from "./SeoOverviewClient";
import { type SeoMetaValue } from "@/lib/seo/utils";

export const dynamic = "force-dynamic";

type SeoItem = {
  id: string;
  title: string;
  slug: string;
  seo_meta: SeoMetaValue | null;
};

export default async function SeoOverviewPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch profile to verify role
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !["Admin", "Content Manager", "Marketer"].includes(profile.role)) {
    redirect("/dashboard?error=access_denied");
  }

  // Fetch Pages & Posts
  const [pagesResult, postsResult] = await Promise.all([
    supabase
      .from("pages")
      .select("id, title, slug, seo_meta")
      .order("created_at", { ascending: false }),
    supabase
      .from("posts")
      .select("id, title, slug, seo_meta")
      .order("created_at", { ascending: false }),
  ]);

  // Fetch Packages with fallback handling in case seo_meta column is missing
  let packages: SeoItem[] = [];
  const { data: pkgsData, error: pkgsError } = await supabase
    .from("packages")
    .select("id, title, slug, seo_meta")
    .order("created_at", { ascending: false });

  if (pkgsError && pkgsError.code === "42703") {
    // column packages.seo_meta does not exist error
    const { data: fallbackData } = await supabase
      .from("packages")
      .select("id, title, slug")
      .order("created_at", { ascending: false });
    packages = (fallbackData ?? []).map((item) => ({
      id: item.id,
      title: item.title,
      slug: item.slug,
      seo_meta: {},
    }));
  } else {
    packages = (pkgsData ?? []).map((item) => ({
      id: item.id,
      title: item.title,
      slug: item.slug,
      seo_meta: item.seo_meta as SeoMetaValue | null,
    }));
  }

  const pages = (pagesResult.data ?? []).map((item) => ({
    id: item.id,
    title: item.title,
    slug: item.slug,
    seo_meta: item.seo_meta as SeoMetaValue | null,
  }));

  const posts = (postsResult.data ?? []).map((item) => ({
    id: item.id,
    title: item.title,
    slug: item.slug,
    seo_meta: item.seo_meta as SeoMetaValue | null,
  }));

  return (
    <SeoOverviewClient
      initialPages={pages}
      initialPosts={posts}
      initialPackages={packages}
      userRole={profile.role}
    />
  );
}
