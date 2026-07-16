import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PostEditor } from "@/components/editor/PostEditor";
import type { Json } from "@/types/database.types";

function asSeoMeta(value: Json | null) {
  if (!value || Array.isArray(value) || typeof value !== "object") return null;
  const record = value as Record<string, Json | undefined>;
  return {
    title: typeof record.title === "string" ? record.title : "",
    description: typeof record.description === "string" ? record.description : "",
    canonicalUrl: typeof record.canonicalUrl === "string" ? record.canonicalUrl : "",
    featuredImageUrl: typeof record.featuredImageUrl === "string" ? record.featuredImageUrl : "",
  };
}

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const [{ data: profile }, { data: post }, { data: categories }, { data: tags }, { data: media }, { data: revisions }] = await Promise.all([
    supabase.from("users").select("role").eq("id", user.id).single(),
    supabase.from("posts").select("id,title,slug,content,category_id,status,scheduled_at,published_at,created_at,seo_meta,post_tags(tags(name))").eq("id", id).single(),
    supabase.from("categories").select("id,name").order("name"),
    supabase.from("tags").select("id,name").order("name"),
    supabase.from("media").select("id,file_url,alt_text").order("created_at", { ascending: false }),
    supabase.from("post_revisions").select("id,title,content,created_at,saved_by,users(name)").eq("post_id", id).order("created_at", { ascending: false }),
  ]);
  if (!profile || !["Admin", "Content Manager"].includes(profile.role)) redirect("/dashboard?error=access_denied");
  if (!post) notFound();

  const tagNames = (post.post_tags ?? []).flatMap((link) => {
    const related = link.tags;
    if (Array.isArray(related)) return related.map((tag) => tag.name);
    return related?.name ? [related.name] : [];
  });
  const revisionRows = (revisions ?? []).map((revision) => ({
    id: revision.id,
    title: revision.title,
    content: revision.content,
    created_at: revision.created_at ?? new Date(0).toISOString(),
    authorName: Array.isArray(revision.users) ? revision.users[0]?.name ?? null : revision.users?.name ?? null,
  }));

  return <PostEditor post={{ ...post, content: post.content ?? "", seo_meta: asSeoMeta(post.seo_meta), tagNames, published_at: post.published_at, created_at: post.created_at }} categories={categories ?? []} tags={tags ?? []} media={media ?? []} revisions={revisionRows} />;
}
