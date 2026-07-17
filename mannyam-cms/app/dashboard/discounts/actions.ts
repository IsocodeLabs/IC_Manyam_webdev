"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/rbac/requireRole";

interface DiscountCodeInput {
  code: string;
  type: "percent" | "fixed";
  value: number; // For percent, e.g. 10. For fixed, major units which we convert to minor on save.
  active: boolean;
  expires_at: string | null;
  max_uses: number | null;
}

export async function createDiscountCode(input: DiscountCodeInput) {
  // Strict check: Only Admin and Marketers can manage discount codes
  await requireRole(["Admin", "Marketer"]);
  const supabase = await createClient();

  const formattedCode = input.code.trim().toUpperCase();
  if (!formattedCode) {
    throw new Error("Discount code string is required.");
  }

  // Convert major units to minor units (cents/pence) for fixed discount type
  const dbValue = input.type === "fixed" ? Math.round(input.value * 100) : input.value;

  const { error } = await supabase
    .from("discount_codes")
    .insert({
      code: formattedCode,
      type: input.type,
      value: dbValue,
      active: input.active,
      expires_at: input.expires_at ? new Date(input.expires_at).toISOString() : null,
      max_uses: input.max_uses || null,
      times_used: 0
    });

  if (error) {
    if (error.code === "23505") {
      throw new Error(`The code "${formattedCode}" already exists.`);
    }
    throw new Error(`Failed to create discount code: ${error.message}`);
  }

  revalidatePath("/dashboard/discounts");
  return { success: true };
}

export async function updateDiscountCode(id: string, input: Partial<DiscountCodeInput>) {
  await requireRole(["Admin", "Marketer"]);
  const supabase = await createClient();

  const updatePayload: Record<string, unknown> = {};

  if (input.code !== undefined) updatePayload.code = input.code.trim().toUpperCase();
  if (input.type !== undefined) updatePayload.type = input.type;
  if (input.value !== undefined) {
    // Convert major units to minor if type is fixed
    const targetType = input.type || "percent"; // Use existing or updated type
    updatePayload.value = targetType === "fixed" ? Math.round(input.value * 100) : input.value;
  }
  if (input.active !== undefined) updatePayload.active = input.active;
  if (input.expires_at !== undefined) {
    updatePayload.expires_at = input.expires_at ? new Date(input.expires_at).toISOString() : null;
  }
  if (input.max_uses !== undefined) updatePayload.max_uses = input.max_uses || null;

  const { error } = await supabase
    .from("discount_codes")
    .update(updatePayload as any)
    .eq("id", id);

  if (error) {
    if (error.code === "23505") {
      throw new Error("This code name is already in use by another discount.");
    }
    throw new Error(`Failed to update discount code: ${error.message}`);
  }

  revalidatePath("/dashboard/discounts");
  return { success: true };
}

export async function deleteDiscountCode(id: string) {
  // Only Admin can delete discount codes to safeguard purchase records integrity
  await requireRole(["Admin"]);
  const supabase = await createClient();

  const { error } = await supabase
    .from("discount_codes")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(`Failed to delete discount code: ${error.message}`);
  }

  revalidatePath("/dashboard/discounts");
  return { success: true };
}
