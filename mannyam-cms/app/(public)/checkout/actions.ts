"use server";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { razorpay } from "@/lib/commerce/razorpay";
import { clearCart } from "@/lib/commerce/cart";
import { createClient } from "@/lib/supabase/server";


export async function verifyAndGetBookingStatus(bookingId: string, paymentId?: string): Promise<{ success: boolean; booking?: any; error?: string }> {
  try {
    // 1. Fetch current booking status using any casting to bypass outdated static typings
    const { data: booking, error } = await (supabaseAdmin as any)
      .from("bookings")
      .select(`
        *,
        booking_items (
          id,
          package_title,
          departure_date,
          travellers,
          unit_amount,
          line_amount
        )
      `)
      .eq("id", bookingId)
      .maybeSingle();

    if (error || !booking) {
      return { success: false, error: "Booking not found" };
    }

    // 2. If booking is already paid, or is confirmed with no new payment details, return immediately
    if (booking.status === "Paid" || (booking.status === "Confirmed" && (!paymentId || booking.razorpay_payment_id === paymentId))) {
      // Clear cart on successful booking confirmation
      await clearCart();
      return { success: true, booking };
    }

    // 3. Fallback verification: if paymentId is provided, query Razorpay directly
    if (paymentId && (booking.status === "Pending" || (booking.status === "Confirmed" && booking.razorpay_payment_id !== paymentId))) {
      try {
        const payment = await razorpay.payments.fetch(paymentId);
        
        if (payment && payment.status === "captured") {
          let finalStatus = booking.status;
          let amountPaid = booking.amount_paid;

          if (booking.status === "Pending") {
            finalStatus = booking.payment_type === "deposit" ? "Confirmed" : "Paid";
            amountPaid = Number(payment.amount); // in minor units
          } else if (booking.status === "Confirmed") {
            finalStatus = "Paid";
            amountPaid = booking.total_amount; // fully paid now
          }

          const { data: updatedBooking } = await (supabaseAdmin as any)
            .from("bookings")
            .update({
              status: finalStatus,
              amount_paid: amountPaid,
              razorpay_payment_id: paymentId,
            })
            .eq("id", bookingId)
            .select(`
              *,
              booking_items (
                id,
                package_title,
                departure_date,
                travellers,
                unit_amount,
                line_amount
              )
            `)
            .single();

          if (updatedBooking) {
            // Clear cart on successful booking confirmation
            await clearCart();
            return { success: true, booking: updatedBooking };
          }
        }
      } catch (rzpErr) {
        console.error("Error fetching payment status from Razorpay:", rzpErr);
      }
    }

    return { success: true, booking };
  } catch (err) {
    console.error("Error verifying booking status:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function registerGuestAccountAction(
  bookingId: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    // 1. Fetch booking to get guest information
    const { data: booking, error: bookingError } = await (supabaseAdmin as any)
      .from("bookings")
      .select("*")
      .eq("id", bookingId)
      .maybeSingle();

    if (bookingError || !booking) {
      return { success: false, error: "Booking reference not found" };
    }

    if (booking.customer_id) {
      return { success: false, error: "This booking is already linked to an account" };
    }

    const email = booking.contact_email;
    const name = booking.contact_name;

    if (!email || !name) {
      return { success: false, error: "Booking guest details are incomplete" };
    }

    // 2. Register user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: "customer",
          name,
        },
      },
    });

    if (authError) {
      return { success: false, error: authError.message };
    }

    const userId = authData.user?.id;
    if (!userId) {
      return { success: false, error: "Failed to retrieve registered user ID" };
    }

    // 3. Link customer ID to booking
    const { error: updateError } = await (supabaseAdmin as any)
      .from("bookings")
      .update({ customer_id: userId })
      .eq("id", bookingId);

    if (updateError) {
      console.error("Error linking booking to new customer:", updateError);
      return { success: false, error: "Account created but failed to link your booking." };
    }

    // Attempt automatic login
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { success: true };
  } catch (err: any) {
    console.error("Guest registration failed:", err);
    return { success: false, error: err.message || "An unexpected error occurred" };
  }
}


