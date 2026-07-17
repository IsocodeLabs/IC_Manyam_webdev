import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { razorpay } from "@/lib/commerce/razorpay";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: Request, { params }: RouteParams) {
  const supabase = await createClient();

  // 1. Enforce Authentication
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Fetch User Profile & Enforce Strict Admin RBAC
  const { data: profile } = await supabase
    .from("users")
    .select("role, name")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "Admin") {
    return NextResponse.json({ error: "Access denied. Only Admins can initiate refunds." }, { status: 403 });
  }

  // Resolve booking ID parameter
  const { id: bookingId } = await params;

  try {
    // 3. Parse and Validate Refund Amount
    const { amount } = await req.json();
    if (typeof amount !== "number" || amount <= 0) {
      return NextResponse.json({ error: "Invalid refund amount requested." }, { status: 400 });
    }

    // 4. Fetch Active Booking Data
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", bookingId)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json({ error: "Booking reference not found." }, { status: 404 });
    }

    const { amount_paid, refund_amount: currentRefunded, razorpay_payment_id, status: currentStatus } = booking;

    if (!razorpay_payment_id) {
      return NextResponse.json({ error: "No processed payment ID found for this booking." }, { status: 400 });
    }

    // Compute remaining refundable amount
    const remainingRefundable = amount_paid - currentRefunded;
    if (amount > remainingRefundable) {
      return NextResponse.json({
        error: `Requested refund of ${amount / 100} exceeds the remaining refundable paid balance of ${remainingRefundable / 100}.`
      }, { status: 400 });
    }

    // 5. Fire Refund Request on Razorpay API Gateway
    const refund = await razorpay.payments.refund(razorpay_payment_id, { amount });

    if (!refund || !refund.id) {
      return NextResponse.json({ error: "Failed to create refund on Razorpay." }, { status: 500 });
    }

    // 6. Update Database State
    const nextRefundAmount = currentRefunded + amount;
    const nextStatus = nextRefundAmount >= amount_paid ? "Refunded" : "Partially Refunded";

    const { error: updateError } = await supabase
      .from("bookings")
      .update({
        refund_amount: nextRefundAmount,
        status: nextStatus
      })
      .eq("id", bookingId);

    if (updateError) {
      return NextResponse.json({ error: `Database update failed: ${updateError.message}` }, { status: 500 });
    }

    // 7. Insert Audit Trail Entry
    const { error: auditError } = await supabase
      .from("booking_audit_logs")
      .insert({
        booking_id: bookingId,
        changed_by: user.id,
        changed_by_name: profile.name || user.email || "Admin",
        from_status: currentStatus,
        to_status: nextStatus,
        notes: `Processed a ${nextStatus === "Refunded" ? "full" : "partial"} refund of ${(amount / 100).toFixed(2)} ${booking.currency}. Razorpay Refund ID: ${refund.id}`
      });

    if (auditError) {
      console.error("Audit log insertion failed:", auditError);
    }

    return NextResponse.json({
      success: true,
      refundId: refund.id,
      amount: refund.amount,
      status: nextStatus
    });

  } catch (err: unknown) {
    const error = err as Error;
    console.error("Refund processing error:", error);
    return NextResponse.json({ error: error.message || "An unexpected error occurred during refund processing." }, { status: 500 });
  }
}
