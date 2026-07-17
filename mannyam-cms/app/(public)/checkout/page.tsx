import { getComputedCart } from "@/lib/commerce/cart";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { CheckoutFormClient } from "@/components/commerce/CheckoutFormClient";
import Link from "next/link";

export const metadata = {
  title: "Secure Checkout | MANNYAM",
  description: "Securely finalize your premium bespoke journey reservation and plan your ultimate escape.",
};

export default async function CheckoutPage() {
  const cart = await getComputedCart();

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20 px-4 space-y-6">
        <span className="font-sans text-[11px] font-bold uppercase tracking-widest text-gold block">
          Empty Basket
        </span>
        <h1 className="font-display text-4xl font-bold text-olive">
          Your Booking Basket is Empty
        </h1>
        <p className="font-sans text-xs text-olive/60 font-light max-w-md mx-auto leading-relaxed">
          Before checkout can proceed, select one of our curated journeys or experiences to begin your reservation.
        </p>
        <div className="pt-4">
          <Link
            href="/experiences"
            className="inline-block font-sans text-[11px] font-bold uppercase tracking-widest text-cream bg-olive hover:bg-olive/90 px-8 py-3.5 rounded-sm transition-colors"
          >
            Explore Experiences
          </Link>
        </div>
      </div>
    );
  }

  // Fetch deposit capabilities for cart packageIds bypassing RLS securely
  const packageIds = cart.items.map((item) => item.packageId);
  const { data: pricingRows } = await supabaseAdmin
    .from("pricing")
    .select("package_id, deposit_amount, base_amount")
    .in("package_id", packageIds);

  const pricingDetails = (pricingRows || []).map((row) => ({
    packageId: row.package_id,
    depositAmount: row.deposit_amount,
    baseAmount: row.base_amount,
  }));

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header Eyecatcher */}
      <div className="text-center space-y-3">
        <span className="font-sans text-[10px] font-bold uppercase tracking-[0.25em] text-gold block">
          Bespoke Curations
        </span>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-olive">
          Finalise Your Journey
        </h1>
        <p className="font-sans text-xs text-olive/60 font-light max-w-lg mx-auto leading-relaxed">
          Secure your premium travel arrangements using our secure checkout terminal. All details are encrypted and verified server-side.
        </p>
      </div>

      {/* Interactive Form Component */}
      <CheckoutFormClient cart={cart} pricingDetails={pricingDetails} />
    </main>
  );
}
