"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Updates the status of a lead and logs the change in the audit log.
 * Restricted to Admin and Marketer roles.
 */
export async function updateLeadStatus(id: string, toStatus: string) {
  const supabase = await createClient();

  // 1. Get authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error("Unauthorised: Authentication required");
  }

  // 2. Fetch user profile to verify role
  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("role, name")
    .eq("id", user.id)
    .single();

  if (profileError || !profile || !["Admin", "Marketer"].includes(profile.role)) {
    throw new Error("Unauthorised: Insufficient permissions");
  }

  // 3. Fetch the previous status of the lead
  const { data: lead, error: leadError } = await supabase
    .from("leads")
    .select("status")
    .eq("id", id)
    .single();

  if (leadError || !lead) {
    throw new Error("Lead not found");
  }

  const fromStatus = lead.status;

  // 4. Update the lead status
  const { error: updateError } = await supabase
    .from("leads")
    .update({ status: toStatus as "New" | "Contacted" | "Proposal" | "Won" | "Lost" })
    .eq("id", id);

  if (updateError) {
    throw new Error(`Failed to update lead status: ${updateError.message}`);
  }

  // 5. Log status change in lead_audit_log
  const { error: logError } = await supabase
    .from("lead_audit_log")
    .insert({
      lead_id: id,
      changed_by: user.id,
      changed_by_name: profile.name,
      from_status: fromStatus,
      to_status: toStatus
    });

  if (logError) {
    console.error("Failed to log status change to audit log:", logError.message);
  }

  // 6. Revalidate cached routes
  revalidatePath("/leads");
  revalidatePath("/dashboard");

  return { success: true };
}

/**
 * Adds an internal note to a lead.
 * Restricted to Admin and Marketer roles.
 */
export async function addLeadNote(leadId: string, noteText: string) {
  const supabase = await createClient();

  // 1. Get authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error("Unauthorised: Authentication required");
  }

  // 2. Fetch user profile to verify role
  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || !profile || !["Admin", "Marketer"].includes(profile.role)) {
    throw new Error("Unauthorised: Insufficient permissions");
  }

  // 3. Insert note into lead_notes
  const { error: insertError } = await supabase
    .from("lead_notes")
    .insert({
      lead_id: leadId,
      note: noteText,
      created_by: user.id
    });

  if (insertError) {
    throw new Error(`Failed to add note: ${insertError.message}`);
  }

  // 4. Revalidate cache
  revalidatePath("/leads");

  return { success: true };
}
