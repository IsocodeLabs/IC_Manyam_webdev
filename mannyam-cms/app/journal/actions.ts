"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export type PostInput = {
  title: string;
  slug: string;
  content: string;
  categoryId: string | null;
  tagNames: string[];
  status: "Draft" | "Published" | "Scheduled";
  scheduledAt: string | null;
  seoMeta: {
    title: string;
    description: string;
    canonical_url: string;
    og_title: string;
    og_description: string;
    og_image: string;
  };
};

async function requireEditor() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("You must be signed in.");
  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (!profile || !["Admin", "Content Manager"].includes(profile.role)) throw new Error("Access denied.");
  return { supabase, user };
}

function normaliseSlug(value: string) {
  return value.toLocaleLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function validateInput(input: PostInput) {
  if (!input.title.trim()) throw new Error("A title is required.");
  if (!normaliseSlug(input.slug)) throw new Error("A valid URL slug is required.");
  if (input.status === "Scheduled" && (!input.scheduledAt || new Date(input.scheduledAt) <= new Date())) {
    throw new Error("Scheduled posts need a future publication date.");
  }
}

async function syncTags(postId: string, tagNames: string[]) {
  const uniqueNames = Array.from(new Set(tagNames.map((name) => name.trim()).filter(Boolean)));
  const tagIds: string[] = [];
  for (const name of uniqueNames) {
    const slug = normaliseSlug(name);
    const { data, error } = await supabaseAdmin.from("tags").upsert({ name, slug }, { onConflict: "slug" }).select("id").single();
    if (error) throw new Error(error.message);
    tagIds.push(data.id);
  }
  const { error: deleteError } = await supabaseAdmin.from("post_tags").delete().eq("post_id", postId);
  if (deleteError) throw new Error(deleteError.message);
  if (tagIds.length) {
    const { error } = await supabaseAdmin.from("post_tags").insert(tagIds.map((tagId) => ({ post_id: postId, tag_id: tagId })));
    if (error) throw new Error(error.message);
  }
}

export async function deletePost(id: string) {
  try {
    await requireEditor();
    const { error } = await supabaseAdmin.from("posts").delete().eq("id", id);
    if (error) throw new Error(error.message);
    revalidatePath("/journal");
    revalidatePath("/api/sitemap");
    return { ok: true as const };
  } catch (error) {
    return { ok: false as const, error: error instanceof Error ? error.message : "Delete failed." };
  }
}

export async function checkSlugUnique(slug: string, excludeId?: string) {
  await requireEditor();
  let query = supabaseAdmin.from("posts").select("id", { count: "exact", head: true }).eq("slug", normaliseSlug(slug));
  if (excludeId) query = query.neq("id", excludeId);
  const { count, error } = await query;
  if (error) throw new Error(error.message);
  return (count ?? 0) === 0;
}

export async function createPost(input: PostInput) {
  await requireEditor();
  validateInput(input);
  const publishedAt = input.status === "Published" ? new Date().toISOString() : null;
  const { data, error } = await supabaseAdmin.from("posts").insert({ title: input.title.trim(), slug: normaliseSlug(input.slug), content: input.content, category_id: input.categoryId, status: input.status, scheduled_at: input.status === "Scheduled" ? input.scheduledAt : null, published_at: publishedAt, seo_meta: input.seoMeta }).select("id").single();
  if (error) throw new Error(error.code === "23505" ? "This URL is already in use" : error.message);
  await syncTags(data.id, input.tagNames);
  revalidatePath("/journal");
  revalidatePath("/api/sitemap");
  return { id: data.id };
}

export async function updatePost(id: string, input: PostInput) {
  await requireEditor();
  validateInput(input);
  const { data: current } = await supabaseAdmin.from("posts").select("published_at").eq("id", id).single();
  const publishedAt = input.status === "Published" ? current?.published_at ?? new Date().toISOString() : null;
  const { error } = await supabaseAdmin.from("posts").update({ title: input.title.trim(), slug: normaliseSlug(input.slug), content: input.content, category_id: input.categoryId, status: input.status, scheduled_at: input.status === "Scheduled" ? input.scheduledAt : null, published_at: publishedAt, seo_meta: input.seoMeta }).eq("id", id);
  if (error) throw new Error(error.code === "23505" ? "This URL is already in use" : error.message);
  await syncTags(id, input.tagNames);
  revalidatePath("/journal");
  revalidatePath(`/journal/${id}/edit`);
  revalidatePath(`/journal/${id}/preview`);
  revalidatePath("/api/sitemap");
  return { id };
}

export async function publishPost(id: string) {
  await requireEditor();
  const { error } = await supabaseAdmin.from("posts").update({ status: "Published", published_at: new Date().toISOString(), scheduled_at: null }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/journal");
  revalidatePath(`/journal/${id}/preview`);
  revalidatePath("/api/sitemap");
}
