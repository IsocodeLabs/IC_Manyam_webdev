"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "Admin") {
    throw new Error("Access denied. Admin role required.");
  }
  return { user };
}

export async function saveRobotsTxt(content: string) {
  const { user } = await requireAdmin();

  const { error } = await supabaseAdmin
    .from("site_settings")
    .upsert({
      key: "robots_txt",
      value: content,
      updated_at: new Date().toISOString(),
      updated_by: user.id
    });

  if (error) throw new Error(error.message);
  revalidatePath("/api/robots");
  return { success: true };
}

export async function resetRobotsTxt() {
  await requireAdmin();

  const { error } = await supabaseAdmin
    .from("site_settings")
    .delete()
    .eq("key", "robots_txt");

  if (error) throw new Error(error.message);
  revalidatePath("/api/robots");
  return { success: true };
}
