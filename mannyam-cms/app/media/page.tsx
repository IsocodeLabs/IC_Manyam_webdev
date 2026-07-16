import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { MediaLibraryClient } from "./MediaLibraryClient";

export default async function MediaPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !["Admin", "Content Manager"].includes(profile.role)) {
    redirect("/dashboard?error=access_denied");
  }

  const { data: media } = await supabase
    .from("media")
    .select("id, file_url, alt_text, caption, width, height, created_at")
    .order("created_at", { ascending: false });

  const [pagesResult, postsResult, packagesResult] = await Promise.all([
    supabase.from("pages").select("content"),
    supabase.from("posts").select("content"),
    supabase.from("packages").select("featured_image_url"),
  ]);

  const usageCounts: Record<string, number> = {};
  const mediaList = media ?? [];
  const pagesList = pagesResult.data ?? [];
  const postsList = postsResult.data ?? [];
  const packagesList = packagesResult.data ?? [];

  for (const item of mediaList) {
    const url = item.file_url;
    let count = 0;

    // Check pages content JSONB
    for (const page of pagesList) {
      if (page.content && JSON.stringify(page.content).includes(url)) {
        count++;
      }
    }

    // Check posts content text
    for (const post of postsList) {
      if (post.content && post.content.includes(url)) {
        count++;
      }
    }

    // Check packages featured image
    for (const pkg of packagesList) {
      if (pkg.featured_image_url === url) {
        count++;
      }
    }

    usageCounts[item.id] = count;
  }

  return (
    <MediaLibraryClient
      initialMedia={mediaList}
      userRole={profile.role}
      initialUsageCounts={usageCounts}
    />
  );
}
