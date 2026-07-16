"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/** Force-regenerate the sitemap by revalidating the cached route. */
export async function revalidateSitemap() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !["Admin", "Content Manager"].includes(profile.role)) {
    throw new Error("Insufficient permissions");
  }

  revalidatePath("/api/sitemap");
  return { success: true, revalidatedAt: new Date().toISOString() };
}
