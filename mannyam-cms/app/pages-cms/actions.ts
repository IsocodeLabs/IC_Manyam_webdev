"use server";

import { revalidatePath } from "next/cache";
import { triggerRevalidation } from "@/lib/revalidate";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { Json } from "@/types/database.types";

export type PageInput = {
  title: string;
  slug: string;
  type: "Landing" | "Category" | "Standard" | "Form" | "Legal";
  status: "Draft" | "Published";
  content: Json;
  seoMeta: {
    title: string;
    description: string;
    canonical_url: string;
    og_title: string;
    og_description: string;
    og_image: string;
  };
};

import { requireRole } from "@/lib/rbac/requireRole";

async function requireEditor() {
  const { user, role } = await requireRole(["Admin", "Content Manager"]);
  const supabase = await createClient();
  return { supabase, user, role };
}

async function requireAdmin() {
  const { user } = await requireRole(["Admin"]);
  const supabase = await createClient();
  return { supabase, user };
}

function normaliseSlug(value: string) {
  return value.toLocaleLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function validateInput(input: PageInput) {
  if (!input.title.trim()) throw new Error("A title is required.");
  if (!normaliseSlug(input.slug)) throw new Error("A valid URL slug is required.");
  if (!["Landing", "Category", "Standard", "Form", "Legal"].includes(input.type)) throw new Error("Invalid page type.");
  if (!["Draft", "Published"].includes(input.status)) throw new Error("Invalid status.");
}

export async function checkSlugUnique(slug: string, excludeId?: string) {
  await requireEditor();
  let query = supabaseAdmin.from("pages").select("id", { count: "exact", head: true }).eq("slug", normaliseSlug(slug));
  if (excludeId) query = query.neq("id", excludeId);
  const { count, error } = await query;
  if (error) throw new Error(error.message);
  return (count ?? 0) === 0;
}

export async function createPage(input: PageInput) {
  await requireEditor();
  validateInput(input);
  const { data, error } = await supabaseAdmin.from("pages").insert({
    title: input.title.trim(),
    slug: normaliseSlug(input.slug),
    type: input.type,
    status: input.status,
    content: input.content,
    seo_meta: input.seoMeta
  }).select("id").single();

  if (error) throw new Error(error.code === "23505" ? "This URL is already in use" : error.message);
  revalidatePath("/pages-cms");
  revalidatePath("/api/sitemap");

  if (input.status === "Published") {
    await triggerRevalidation({ type: "page", slug: normaliseSlug(input.slug) });
  }

  return { id: data.id };
}

export async function updatePage(id: string, input: PageInput) {
  await requireEditor();
  validateInput(input);
  const { data: current } = await supabaseAdmin.from("pages").select("slug, status").eq("id", id).single();
  const { error } = await supabaseAdmin.from("pages").update({
    title: input.title.trim(),
    slug: normaliseSlug(input.slug),
    type: input.type,
    status: input.status,
    content: input.content,
    seo_meta: input.seoMeta
  }).eq("id", id);

  if (error) throw new Error(error.code === "23505" ? "This URL is already in use" : error.message);
  revalidatePath("/pages-cms");
  revalidatePath(`/pages-cms/${id}/edit`);
  revalidatePath("/api/sitemap");

  if (input.status === "Published") {
    await triggerRevalidation({ type: "page", slug: normaliseSlug(input.slug) });
    if (current && current.status === "Published" && current.slug && current.slug !== normaliseSlug(input.slug)) {
      await triggerRevalidation({ type: "page", slug: current.slug });
    }
  }

  return { id };
}

export async function deletePage(id: string) {
  try {
    await requireAdmin();
    const { data: current } = await supabaseAdmin.from("pages").select("slug, status").eq("id", id).single();
    const { error } = await supabaseAdmin.from("pages").delete().eq("id", id);
    if (error) throw new Error(error.message);
    revalidatePath("/pages-cms");
    revalidatePath("/api/sitemap");

    if (current && current.status === "Published" && current.slug) {
      await triggerRevalidation({ type: "page", slug: current.slug });
    }

    return { ok: true as const };
  } catch (error) {
    return { ok: false as const, error: error instanceof Error ? error.message : "Delete failed." };
  }
}

export async function publishPage(id: string) {
  await requireEditor();
  const { data: current } = await supabaseAdmin.from("pages").select("slug").eq("id", id).single();
  const { error } = await supabaseAdmin.from("pages").update({ status: "Published" }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/pages-cms");
  revalidatePath(`/pages-cms/${id}/preview`);
  revalidatePath("/api/sitemap");

  if (current?.slug) {
    await triggerRevalidation({ type: "page", slug: current.slug });
  }
}

