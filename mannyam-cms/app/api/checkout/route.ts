import { NextResponse } from "next/server";
import { getComputedCart } from "@/lib/commerce/cart";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendBookingConfirmationEmail } from "@/lib/email/notifyBookingConfirmation";
import { createClient } from "@/lib/supabase/server";
import { razorpay } from "@/lib/commerce/razorpay";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      contactName,
      contactEmail,
      contactPhone,
      contactCountry,
      paymentType = "full", // 'full' or 'deposit'
      notes = "",
      discountCode = "",
    } = body;

    // 1. Basic validation
    if (!contactName || !contactEmail) {
      return NextResponse.json(
        { error: "Contact name and email are required" },
        { status: 400 }
      );
    }

    // 2. Fetch computed cart
    const cart = await getComputedCart();
    if (!cart.items || cart.items.length === 0) {
      return NextResponse.json(
        { error: "Booking basket is empty" },
        { status: 400 }
      );
    }

    // 3. Check for authenticated user to link customer
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let customerId: string | null = null;

    if (user) {
      customerId = user.id;

      // Ensure customer row exists
      const { data: customer } = await (supabaseAdmin as any)
        .from("customers")
        .select("id")
        .eq("id", customerId)
        .maybeSingle();

      if (!customer) {
        const { error: customerError } = await (supabaseAdmin as any)
          .from("customers")
          .insert({
            id: customerId,
            name: contactName,
            email: contactEmail,
            phone: contactPhone,
            country: contactCountry,
          });

        if (customerError) {
          console.error("Error creating customer record:", customerError);
        }
      } else {
        // Optionally update customer details
        await (supabaseAdmin as any)
          .from("customers")
          .update({
            name: contactName,
            phone: contactPhone,
            country: contactCountry,
          })
          .eq("id", customerId);
      }
    }

    // 4. Calculate Subtotal, Discounts, and Deposit totals
    const subtotal = cart.totalAmount; // in minor units
    let discountAmount = 0;

    // Process discount code
    if (discountCode) {
      const { data: discount, error: discountError } = await (supabaseAdmin as any)
        .from("discount_codes")
        .select("*")
        .eq("code", discountCode.toUpperCase())
        .eq("active", true)
        .maybeSingle();

      if (!discountError && discount) {
        const now = new Date();
        const expiresAt = discount.expires_at ? new Date(discount.expires_at) : null;
        const isNotExpired = !expiresAt || expiresAt > now;
        const hasUsesLeft = discount.max_uses === null || discount.times_used < discount.max_uses;

        if (isNotExpired && hasUsesLeft) {
          if (discount.type === "percent") {
            discountAmount = Math.floor((subtotal * discount.value) / 100);
          } else if (discount.type === "fixed") {
            discountAmount = discount.value; // expected in minor units
          }
          // Cap discount to subtotal
          discountAmount = Math.min(discountAmount, subtotal);
        }
      }
    }

    const finalTotal = subtotal - discountAmount;

    // Calculate charge amount (full vs deposit)
    let chargeAmount = finalTotal;

    if (paymentType === "deposit") {
      let totalDepositAmount = 0;
      
      // Look up pricing for each item in the cart to calculate total required deposits
      for (const item of cart.items) {
        const { data: pricing } = await (supabaseAdmin as any)
          .from("pricing")
          .select("deposit_amount, base_amount")
          .eq("package_id", item.packageId)
          .maybeSingle();

        if (pricing) {
          if (pricing.deposit_amount !== null && pricing.deposit_amount !== undefined) {
            totalDepositAmount += pricing.deposit_amount * item.travellers;
          } else {
            // Fall back to full price for this package if no deposit config exists
            totalDepositAmount += pricing.base_amount * item.travellers;
          }
        } else {
          totalDepositAmount += item.unitAmount * item.travellers;
        }
      }

      // Deduct discount from deposit, cap to >= 0 and ensure it does not exceed finalTotal
      chargeAmount = Math.max(0, totalDepositAmount - discountAmount);
      chargeAmount = Math.min(chargeAmount, finalTotal);
    }

    // Razorpay expects chargeAmount > 0 (if final total with coupon becomes 0, charge 0, but Razorpay won't accept 0-value order)
    const razorpayChargeAmount = chargeAmount > 0 ? chargeAmount : 0;

    // 5. Create Booking row (Pending)
    const { data: booking, error: bookingError } = await (supabaseAdmin as any)
      .from("bookings")
      .insert({
        customer_id: customerId,
        status: "Pending",
        currency: cart.currency,
        total_amount: finalTotal,
        amount_paid: 0,
        payment_type: paymentType,
        contact_name: contactName,
        contact_email: contactEmail,
        notes: notes,
      })
      .select("id")
      .single();

    if (bookingError || !booking) {
      console.error("Error creating booking:", bookingError);
      return NextResponse.json(
        { error: "Failed to create booking reservation" },
        { status: 500 }
      );
    }

    // 6. Create Booking Items snapshots
    const bookingItemsToInsert = cart.items.map((item) => ({
      booking_id: booking.id,
      package_id: item.packageId,
      package_title: item.package.title,
      departure_date: item.departureDate,
      travellers: item.travellers,
      unit_amount: item.unitAmount,
      line_amount: item.lineAmount,
    }));

    const { error: itemsError } = await (supabaseAdmin as any)
      .from("booking_items")
      .insert(bookingItemsToInsert);

    if (itemsError) {
      console.error("Error creating booking items snapshot:", itemsError);
      // Clean up orphaned booking
      await (supabaseAdmin as any).from("bookings").delete().eq("id", booking.id);
      return NextResponse.json(
        { error: "Failed to snapshot booking items" },
        { status: 500 }
      );
    }

    // 7. Generate Razorpay Order
    let orderId = "";
    if (razorpayChargeAmount > 0) {
      try {
        const rzpOrder = await razorpay.orders.create({
          amount: razorpayChargeAmount,
          currency: cart.currency,
          receipt: booking.id,
          notes: {
            booking_id: booking.id,
            contact_email: contactEmail,
            contact_name: contactName,
          },
        });
        orderId = rzpOrder.id;

        // Store order ID on booking row
        await (supabaseAdmin as any)
          .from("bookings")
          .update({ razorpay_order_id: orderId })
          .eq("id", booking.id);
      } catch (rzpError) {
        console.error("Error creating Razorpay Order:", rzpError);
        // Clean up items and booking
        await (supabaseAdmin as any).from("booking_items").delete().eq("booking_id", booking.id);
        await (supabaseAdmin as any).from("bookings").delete().eq("id", booking.id);
        return NextResponse.json(
          { error: "Failed to generate payment gateway order" },
          { status: 500 }
        );
      }
    } else {
      // Free booking (e.g. 100% discount code coupon) - no payment order required
      // Set booking status to Paid directly since amount is 0
      await (supabaseAdmin as any)
        .from("bookings")
        .update({ status: "Paid", amount_paid: 0 })
        .eq("id", booking.id);

      try {
        await sendBookingConfirmationEmail(booking.id);
      } catch (emailError) {
        console.error("Failed to send booking confirmation email:", emailError);
      }
    }

    // 8. Return response
    return NextResponse.json({
      orderId,
      amount: razorpayChargeAmount,
      currency: cart.currency,
      bookingId: booking.id,
    });
  } catch (error) {
    console.error("Critical error in checkout endpoint:", error);
    return NextResponse.json(
      { error: "A server error occurred during checkout" },
      { status: 500 }
    );
  }
}
