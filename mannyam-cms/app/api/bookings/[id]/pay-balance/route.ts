import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
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

  // Resolve booking ID parameter
  const { id: bookingId } = await params;

  try {
    // 2. Fetch Active Booking Data and check ownership
    const { data: booking, error: bookingError } = await (supabaseAdmin as any)
      .from("bookings")
      .select("*")
      .eq("id", bookingId)
      .maybeSingle();

    if (bookingError || !booking) {
      return NextResponse.json({ error: "Booking reference not found." }, { status: 404 });
    }

    // Secure check: ensure this booking belongs to the logged-in user
    if (booking.customer_id !== user.id) {
      return NextResponse.json({ error: "Access denied. You do not own this booking." }, { status: 403 });
    }

    // 3. Ensure booking is Confirmed and payment type is deposit
    if (booking.status !== "Confirmed" || booking.payment_type !== "deposit") {
      return NextResponse.json({ error: "Only confirmed deposit bookings have an outstanding balance." }, { status: 400 });
    }

    // 4. Calculate Remaining Balance
    const remainingBalance = booking.total_amount - booking.amount_paid;
    if (remainingBalance <= 0) {
      return NextResponse.json({ error: "This booking has no outstanding balance." }, { status: 400 });
    }

    // 5. Generate Razorpay Order
    const rzpOrder = await razorpay.orders.create({
      amount: remainingBalance,
      currency: booking.currency,
      receipt: booking.id,
      notes: {
        booking_id: booking.id,
        contact_email: booking.contact_email,
        contact_name: booking.contact_name,
        payment_type: "balance",
      },
    });

    if (!rzpOrder || !rzpOrder.id) {
      return NextResponse.json({ error: "Failed to generate payment gateway order for remaining balance." }, { status: 500 });
    }

    // 6. Optionally update the order ID in the bookings table
    await (supabaseAdmin as any)
      .from("bookings")
      .update({ razorpay_order_id: rzpOrder.id })
      .eq("id", booking.id);

    return NextResponse.json({
      orderId: rzpOrder.id,
      amount: remainingBalance,
      currency: booking.currency,
      bookingId: booking.id,
    });
  } catch (error) {
    console.error("Error creating pay-balance Razorpay order:", error);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
