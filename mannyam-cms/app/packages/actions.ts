"use server";

import { revalidatePath } from "next/cache";
import { triggerRevalidation } from "@/lib/revalidate";
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
    when?: string;
    where?: string;
  } | null;
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

  await triggerRevalidation({
    type: "package",
    slug: normaliseSlug(input.slug),
    packageType: input.type,
    isFestival: input.type === "Festival"
  });

  return { id: data.id };
}

export async function updatePackage(id: string, input: PackageInput) {
  await requireEditor();
  validateInput(input);
  const { data: current } = await supabaseAdmin.from("packages").select("slug, type").eq("id", id).single();
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

  await triggerRevalidation({
    type: "package",
    slug: normaliseSlug(input.slug),
    packageType: input.type,
    isFestival: input.type === "Festival"
  });

  if (current && (current.slug !== normaliseSlug(input.slug) || current.type !== input.type)) {
    await triggerRevalidation({
      type: "package",
      slug: current.slug,
      packageType: current.type,
      isFestival: current.type === "Festival"
    });
  }

  return { id };
}

export async function deletePackage(id: string) {
  try {
    await requireAdmin();
    const { data: current } = await supabaseAdmin.from("packages").select("slug, type").eq("id", id).single();
    const { error } = await supabaseAdmin.from("packages").delete().eq("id", id);
    if (error) throw new Error(error.message);
    revalidatePath("/packages");
    revalidatePath("/api/sitemap");

    if (current && current.slug) {
      await triggerRevalidation({
        type: "package",
        slug: current.slug,
        packageType: current.type,
        isFestival: current.type === "Festival"
      });
    }

    return { ok: true as const };
  } catch (error) {
    return { ok: false as const, error: error instanceof Error ? error.message : "Delete failed." };
  }
}

export async function savePricing(
  packageId: string,
  pricing: {
    currency: "GBP" | "USD" | "EUR" | "INR";
    base_amount: number; // minor units (pence/cents)
    deposit_amount: number | null; // minor units (pence/cents)
  }
) {
  await requireAdmin(); // Ensures role === "Admin"

  if (!packageId) throw new Error("Package ID is required.");
  if (!pricing.currency || !["GBP", "USD", "EUR", "INR"].includes(pricing.currency)) {
    throw new Error("Invalid currency code.");
  }
  if (pricing.base_amount <= 0) {
    throw new Error("Base amount must be greater than zero.");
  }
  if (pricing.deposit_amount !== null && pricing.deposit_amount < 0) {
    throw new Error("Deposit amount cannot be negative.");
  }

  // Check if pricing already exists for this package
  const { data: existing, error: checkError } = await supabaseAdmin
    .from("pricing")
    .select("id")
    .eq("package_id", packageId)
    .maybeSingle();

  if (checkError) throw new Error(checkError.message);

  let error;
  if (existing) {
    // Update existing pricing record
    const { error: updateError } = await supabaseAdmin
      .from("pricing")
      .update({
        currency: pricing.currency,
        base_amount: pricing.base_amount,
        deposit_amount: pricing.deposit_amount,
      })
      .eq("package_id", packageId);
    error = updateError;
  } else {
    // Insert new pricing record
    const { error: insertError } = await supabaseAdmin
      .from("pricing")
      .insert({
        package_id: packageId,
        currency: pricing.currency,
        base_amount: pricing.base_amount,
        deposit_amount: pricing.deposit_amount,
      });
    error = insertError;
  }

  if (error) throw new Error(error.message);

  revalidatePath("/packages");
  revalidatePath(`/packages/${packageId}/edit`);
  revalidatePath("/api/sitemap");
  return { success: true };
}
