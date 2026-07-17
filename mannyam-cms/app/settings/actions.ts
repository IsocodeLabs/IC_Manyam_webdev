"use server";

import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function saveSiteSetting(key: string, value: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Fetch profile to verify role
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !["Admin", "Marketer"].includes(profile.role)) {
    throw new Error("Access denied. Only Admin and Marketer roles can modify these settings.");
  }

  const trimmedValue = value.trim();

  // Validate format
  if (key === "ga4_measurement_id") {
    if (trimmedValue !== "" && !/^G-[A-Z0-9]{10}$/.test(trimmedValue)) {
      throw new Error("Invalid GA4 Measurement ID format. Must match 'G-XXXXXXXXXX'.");
    }
  } else if (key === "gtm_container_id") {
    if (trimmedValue !== "" && !/^GTM-[A-Z0-9]+$/.test(trimmedValue)) {
      throw new Error("Invalid GTM Container ID format. Must match 'GTM-XXXXXXX'.");
    }
  } else {
    throw new Error("Invalid setting key.");
  }

  // Store in database using service role (bypasses RLS settings)
  const { error } = await supabaseAdmin
    .from("site_settings")
    .upsert({
      key,
      value: trimmedValue,
      updated_at: new Date().toISOString(),
      updated_by: user.id
    }, { onConflict: "key" });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/settings/analytics");
}
