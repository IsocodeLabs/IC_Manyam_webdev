import { getPackagesWithPricing } from "./actions";
import { CartPageClient } from "./CartPageClient";

export const revalidate = 0; // Ensure fresh price/availability checks on load

export const metadata = {
  title: "Your Cart | MANNYAM",
  description: "Review your curated travel experiences and proceed to booking.",
};

export default async function CartPage() {
  // Fetch latest packages, pricing, and availability server-side
  const packages = await getPackagesWithPricing();

  return (
    <div className="min-h-screen bg-ivory py-16 sm:py-24">
      <CartPageClient initialPackages={packages} />
    </div>
  );
}
