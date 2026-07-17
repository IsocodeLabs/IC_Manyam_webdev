"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/rbac/requireRole";
import { sendBookingConfirmationEmail } from "@/lib/email/notifyBookingConfirmation";

/**
 * Updates a booking's status and logs an audit trail event.
 */
export async function updateBookingStatus(
  bookingId: string,
  fromStatus: string,
  toStatus: string,
  notes?: string
) {
  // Enforce staff roles
  const { user } = await requireRole(["Admin", "Marketer"]);
  const supabase = await createClient();

  // Fetch current user name
  const { data: profile } = await supabase
    .from("users")
    .select("name")
    .eq("id", user.id)
    .single();

  const staffName = profile?.name || user.email || "Staff Member";

  // 1. Update the booking row status
  const { error: updateError } = await supabase
    .from("bookings")
    .update({ status: toStatus })
    .eq("id", bookingId);

  if (updateError) {
    throw new Error(`Failed to update booking status: ${updateError.message}`);
  }

  // 2. Insert into the booking audit logs
  const { error: auditError } = await supabase
    .from("booking_audit_logs")
    .insert({
      booking_id: bookingId,
      changed_by: user.id,
      changed_by_name: staffName,
      from_status: fromStatus,
      to_status: toStatus,
      notes: notes || `Status changed from ${fromStatus} to ${toStatus}`
    });

  if (auditError) {
    console.error("Audit log creation failed:", auditError);
  }

  // Trigger emails if transitioning from another status to Paid or Confirmed
  if ((toStatus === "Paid" || toStatus === "Confirmed") && fromStatus !== "Paid" && fromStatus !== "Confirmed") {
    try {
      await sendBookingConfirmationEmail(bookingId);
    } catch (emailError) {
      console.error("Failed to send booking confirmation email via admin action:", emailError);
    }
  }

  revalidatePath(`/dashboard/bookings`);
  revalidatePath(`/dashboard/bookings/${bookingId}`);
  return { success: true };
}

/**
 * Adds an internal booking staff note.
 */
export async function addBookingNote(bookingId: string, noteText: string) {
  // Enforce staff roles
  const { user } = await requireRole(["Admin", "Marketer"]);
  const supabase = await createClient();

  // Fetch staff name
  const { data: profile } = await supabase
    .from("users")
    .select("name")
    .eq("id", user.id)
    .single();

  const staffName = profile?.name || user.email || "Staff Member";

  const { error: noteError } = await supabase
    .from("booking_notes")
    .insert({
      booking_id: bookingId,
      note: noteText,
      created_by: user.id,
      created_by_name: staffName
    });

  if (noteError) {
    throw new Error(`Failed to insert internal note: ${noteError.message}`);
  }

  revalidatePath(`/dashboard/bookings/${bookingId}`);
  return { success: true };
}
