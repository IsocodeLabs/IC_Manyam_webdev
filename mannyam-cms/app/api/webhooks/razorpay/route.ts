import { NextResponse } from "next/server";
import { createHmac } from "crypto";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendBookingConfirmationEmail } from "@/lib/email/notifyBookingConfirmation";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-razorpay-signature") || "";

    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) {
      console.error("RAZORPAY_WEBHOOK_SECRET is not configured.");
      return NextResponse.json({ error: "Webhook secret missing" }, { status: 500 });
    }

    // 1. Verify Signature
    const expectedSignature = createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");

    if (signature !== expectedSignature) {
      console.warn("Invalid Razorpay webhook signature detected.");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // 2. Parse Payload
    const payload = JSON.parse(rawBody);
    const event = payload.event;
    console.log(`Processing Razorpay Webhook Event: ${event}`);

    // 3. Extract Order/Payment details
    const paymentEntity = payload.payload?.payment?.entity;
    const orderId = paymentEntity?.order_id || payload.payload?.order?.entity?.id;

    if (!orderId) {
      console.warn("No order id found in Razorpay webhook payload.");
      return NextResponse.json({ received: true });
    }

    // 4. Retrieve matching Booking using any casting
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: booking, error: bookingError } = await (supabaseAdmin as any)
      .from("bookings")
      .select("*")
      .eq("razorpay_order_id", orderId)
      .maybeSingle();

    if (bookingError || !booking) {
      console.warn(`Booking not found for Razorpay order: ${orderId}`);
      return NextResponse.json({ received: true });
    }

    // 5. Check Idempotency
    if (booking.status === "Paid" || booking.status === "Confirmed") {
      console.log(`Booking ${booking.id} is already in state: ${booking.status}. Skipping.`);
      return NextResponse.json({ received: true, message: "Already processed" });
    }

    // 6. Handle Captured Payment
    if (event === "payment.captured") {
      const amountPaid = paymentEntity?.amount || booking.total_amount;
      const paymentId = paymentEntity?.id || "";

      const finalStatus = booking.payment_type === "deposit" ? "Confirmed" : "Paid";

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: updateError } = await (supabaseAdmin as any)
        .from("bookings")
        .update({
          status: finalStatus,
          amount_paid: amountPaid,
          razorpay_payment_id: paymentId,
          razorpay_signature: signature,
        })
        .eq("id", booking.id);

      if (updateError) {
        console.error(`Failed to update booking ${booking.id}:`, updateError);
        return NextResponse.json({ error: "Database update failure" }, { status: 500 });
      }

      console.log(`Booking ${booking.id} successfully updated to status: ${finalStatus}`);
      try {
        await sendBookingConfirmationEmail(booking.id);
      } catch (emailError) {
        console.error("Failed to send booking confirmation email:", emailError);
      }
    } else if (event === "payment.failed") {
      const reason = paymentEntity?.error_description || "Payment failed";
      console.warn(`Payment failed for booking ${booking.id}. Reason: ${reason}`);

      const auditNotes = booking.notes 
        ? `${booking.notes}\n[Payment Failed]: ${reason}`
        : `[Payment Failed]: ${reason}`;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabaseAdmin as any)
        .from("bookings")
        .update({ notes: auditNotes })
        .eq("id", booking.id);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing Razorpay webhook:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
