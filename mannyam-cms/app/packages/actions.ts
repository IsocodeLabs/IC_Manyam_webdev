"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export type PackageInput = {
  title: string;
  slug: string;
  type: "Festival" | "Destination" | "Honeymoon" | "Wildlife" | "Wellness";
  description: string;
  featuredImageUrl: string | null;
  itinerary: { dayNumber: number; title: string; description: string }[];
  availability: { date: string; spacesLeft: number; status: "Available" | "Full" | "Cancelled" }[];
  seoMeta?: {
    title: string;
    description: string;
    canonical_url: string;
    og_title: string;
    og_description: string;
    og_image: string;
  } | null;
};

async function requireEditor() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("You must be signed in.");
  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (!profile || !["Admin", "Content Manager"].includes(profile.role)) throw new Error("Access denied.");
  return { supabase, user, profile };
}

async function requireAdmin() {
  const { supabase, user, profile } = await requireEditor();
  if (profile.role !== "Admin") throw new Error("Access denied. Admin role required.");
  return { supabase, user };
}

function normaliseSlug(value: string) {
  return value.toLocaleLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function validateInput(input: PackageInput) {
  if (!input.title.trim()) throw new Error("A title is required.");
  if (!normaliseSlug(input.slug)) throw new Error("A valid URL slug is required.");
  if (!["Festival", "Destination", "Honeymoon", "Wildlife", "Wellness"].includes(input.type)) {
    throw new Error("Invalid package type.");
  }
}

export async function checkSlugUnique(slug: string, excludeId?: string) {
  await requireEditor();
  let query = supabaseAdmin.from("packages").select("id", { count: "exact", head: true }).eq("slug", normaliseSlug(slug));
  if (excludeId) query = query.neq("id", excludeId);
  const { count, error } = await query;
  if (error) throw new Error(error.message);
  return (count ?? 0) === 0;
}

export async function createPackage(input: PackageInput) {
  await requireEditor();
  validateInput(input);
  const { data, error } = await supabaseAdmin.from("packages").insert({
    title: input.title.trim(),
    slug: normaliseSlug(input.slug),
    type: input.type,
    description: input.description,
    featured_image_url: input.featuredImageUrl,
    itinerary: input.itinerary,
    availability: input.availability,
    seo_meta: input.seoMeta || {},
  }).select("id").single();

  if (error) throw new Error(error.code === "23505" ? "This URL is already in use" : error.message);
  revalidatePath("/packages");
  revalidatePath("/api/sitemap");
  return { id: data.id };
}

export async function updatePackage(id: string, input: PackageInput) {
  await requireEditor();
  validateInput(input);
  const { error } = await supabaseAdmin.from("packages").update({
    title: input.title.trim(),
    slug: normaliseSlug(input.slug),
    type: input.type,
    description: input.description,
    featured_image_url: input.featuredImageUrl,
    itinerary: input.itinerary,
    availability: input.availability,
    seo_meta: input.seoMeta,
  }).eq("id", id);

  if (error) throw new Error(error.code === "23505" ? "This URL is already in use" : error.message);
  revalidatePath("/packages");
  revalidatePath(`/packages/${id}/edit`);
  revalidatePath("/api/sitemap");
  return { id };
}

export async function deletePackage(id: string) {
  try {
    await requireAdmin();
    const { error } = await supabaseAdmin.from("packages").delete().eq("id", id);
    if (error) throw new Error(error.message);
    revalidatePath("/packages");
    revalidatePath("/api/sitemap");
    return { ok: true as const };
  } catch (error) {
    return { ok: false as const, error: error instanceof Error ? error.message : "Delete failed." };
  }
}
