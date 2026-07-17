"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/commerce/format";
import { 
  type PackageWithPricing, 
  validateDiscountCode, 
  type DiscountValidationResult 
} from "./actions";

interface CartRawItem {
  packageId: string;
  departureDate: string;
  travellers: number;
}

interface CartItemWithDetails {
  packageId: string;
  departureDate: string;
  travellers: number;
  packageTitle: string;
  packageSlug: string;
  featuredImageUrl: string | null;
  baseAmount: number;
  currency: string;
  spacesLeft: number;
  availableDates: string[];
  isCurrencyFallback: boolean;
}

interface Props {
  initialPackages: PackageWithPricing[];
}

export function CartPageClient({ initialPackages }: Props) {
  const [cartItems, setCartItems] = useState<CartRawItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<DiscountValidationResult | null>(null);
  const [discountError, setDiscountError] = useState("");
  const [isPending, startTransition] = useTransition();

  // 1. Hydrate cart from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("mannyam-cart");
      if (stored) {
        const parsed = JSON.parse(stored) as CartRawItem[];
        if (Array.isArray(parsed)) {
          setCartItems(parsed);
        }
      }
    } catch (e) {
      console.error("Failed to read cart from localStorage:", e);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // 2. Helper to write cart back to localStorage and update state
  const updateCart = (newCart: CartRawItem[]) => {
    setCartItems(newCart);
    try {
      localStorage.setItem("mannyam-cart", JSON.stringify(newCart));
    } catch (e) {
      console.error("Failed to write cart to localStorage:", e);
    }
  };

  // 3. Match raw items to actual database package records
  const itemsWithDetails: CartItemWithDetails[] = cartItems
    .map((item) => {
      const pkg = initialPackages.find((p) => p.id === item.packageId);
      if (!pkg) return null;

      // Filter available dates that are in the future
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const futureDates = pkg.availability
        .filter((a) => {
          if (!a.date) return false;
          const d = new Date(a.date);
          return d >= today && a.status === "Available";
        })
        .map((a) => a.date);

      const currentDepartureAvailability = pkg.availability.find(
        (a) => a.date === item.departureDate
      );
      const spacesLeft = currentDepartureAvailability?.spacesLeft ?? 10;

      // Base pricing fallback
      const baseAmount = pkg.pricing?.base_amount ?? 0;
      const currency = pkg.pricing?.currency ?? "GBP";

      return {
        packageId: item.packageId,
        departureDate: item.departureDate,
        travellers: item.travellers,
        packageTitle: pkg.title,
        packageSlug: pkg.slug,
        featuredImageUrl: pkg.featured_image_url,
        baseAmount,
        currency,
        spacesLeft,
        availableDates: futureDates,
        isCurrencyFallback: !!pkg.isCurrencyFallback,
      };
    })
    .filter((item): item is CartItemWithDetails => item !== null);

  // 4. Cart Action handlers
  const handleRemove = (packageId: string, departureDate: string) => {
    const updated = cartItems.filter(
      (item) => !(item.packageId === packageId && item.departureDate === departureDate)
    );
    updateCart(updated);
  };

  const handleUpdateTravellers = (
    packageId: string,
    departureDate: string,
    newCount: number,
    maxSpaces: number
  ) => {
    const count = Math.max(1, Math.min(maxSpaces, newCount));
    const updated = cartItems.map((item) => {
      if (item.packageId === packageId && item.departureDate === departureDate) {
        return { ...item, travellers: count };
      }
      return item;
    });
    updateCart(updated);
  };

  const handleUpdateDate = (
    packageId: string,
    oldDate: string,
    newDate: string
  ) => {
    const updated = cartItems.map((item) => {
      if (item.packageId === packageId && item.departureDate === oldDate) {
        return { ...item, departureDate: newDate };
      }
      return item;
    });
    updateCart(updated);
  };

  // 5. Calculations
  const subtotal = itemsWithDetails.reduce((sum, item) => {
    return sum + item.baseAmount * item.travellers;
  }, 0);

  // Determine cart currency (fallback to GBP)
  const cartCurrency = itemsWithDetails[0]?.currency ?? "GBP";

  // Recompute or adjust secure discount based on current subtotal
  let discountAmount = 0;
  if (appliedDiscount && appliedDiscount.success) {
    if (appliedDiscount.type === "percent") {
      discountAmount = Math.round(subtotal * ((appliedDiscount.value || 0) / 100));
    } else if (appliedDiscount.type === "fixed") {
      discountAmount = appliedDiscount.value || 0;
    }
    // Cannot exceed subtotal
    if (discountAmount > subtotal) {
      discountAmount = subtotal;
    }
  }

  const grandTotal = Math.max(0, subtotal - discountAmount);

  // 6. Discount application
  const handleApplyDiscount = () => {
    setDiscountError("");
    if (!discountCode.trim()) {
      setDiscountError("Please enter a code");
      return;
    }

    startTransition(async () => {
      const res = await validateDiscountCode(discountCode, subtotal);
      if (res.success) {
        setAppliedDiscount(res);
        setDiscountCode("");
      } else {
        setDiscountError(res.message || "Invalid discount code");
      }
    });
  };

  const handleRemoveDiscount = () => {
    setAppliedDiscount(null);
    setDiscountError("");
  };

  const formatDateString = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      return new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date(dateStr));
    } catch {
      return dateStr;
    }
  };

  // 7. Loading/Hydration State
  if (!isHydrated) {
    return (
      <div className="max-w-7xl mx-auto px-6 text-center py-20">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-gold border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
        <p className="mt-4 font-sans text-sm text-olive/60 font-light">Loading your itinerary cart...</p>
      </div>
    );
  }

  // 8. Empty Cart State
  if (itemsWithDetails.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-6 text-center py-16 sm:py-24 space-y-8 bg-paper border border-olive/10 rounded-sm shadow-sm">
        <div className="w-16 h-16 mx-auto bg-cream rounded-full flex items-center justify-center text-olive/40">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-8 h-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
        </div>
        <div className="space-y-3">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-olive">
            Your Cart is Empty
          </h1>
          <p className="font-sans text-sm text-olive/75 font-light max-w-sm mx-auto leading-relaxed">
            You have not added any journeys to your cart yet. Explore our bespoke itineraries to begin your story.
          </p>
        </div>
        <div className="pt-4">
          <Link
            href="/experiences"
            className="inline-block font-sans text-xs font-semibold uppercase tracking-wider text-ivory bg-gold hover:bg-gold/90 px-8 py-4 rounded-sm transition-all duration-300 shadow-md hover:shadow-gold/15 active:scale-95"
          >
            Explore Experiences
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6">
      {/* Page Title */}
      <div className="border-b border-olive/10 pb-8 mb-12">
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-olive tracking-tight">
          Your Curated Journeys
        </h1>
        <p className="font-sans text-xs sm:text-sm text-olive/60 uppercase tracking-widest mt-2 font-light">
          Review your selected programmes and adjust details before checkout
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        {/* Left Column: Cart Items */}
        <div className="lg:col-span-2 space-y-6">
          {itemsWithDetails.map((item) => (
            <div
              key={`${item.packageId}-${item.departureDate}`}
              className="bg-paper border border-olive/10 rounded-sm p-5 sm:p-6 flex flex-col sm:flex-row gap-6 hover:shadow-md hover:shadow-olive/5 transition-all duration-300 relative"
            >
              {/* Image */}
              <div className="w-full sm:w-36 h-36 bg-cream rounded-sm overflow-hidden flex-shrink-0">
                {item.featuredImageUrl ? (
                  <img
                    src={item.featuredImageUrl}
                    alt={item.packageTitle}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-olive/20 font-display italic text-sm">
                    No Image
                  </div>
                )}
              </div>

              {/* Details & Controls */}
              <div className="flex-grow flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <Link
                        href={`/experiences/${item.packageSlug}`}
                        className="font-display text-xl sm:text-2xl font-bold text-olive hover:text-gold transition-colors"
                      >
                        {item.packageTitle}
                      </Link>
                      {item.isCurrencyFallback && (
                        <p className="font-sans text-[10px] text-gold font-semibold uppercase tracking-wider flex items-center gap-1">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3 flex-shrink-0">
                            <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          Pricing only available in original currency {item.currency}
                        </p>
                      )}
                    </div>
                    <span className="font-sans text-sm sm:text-base font-semibold text-olive whitespace-nowrap">
                      {formatCurrency(item.baseAmount, item.currency)}
                    </span>
                  </div>

                  {/* Departure Date Selection */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs">
                    <span className="font-sans text-olive/60 font-medium uppercase tracking-wider">
                      Departure Date:
                    </span>
                    {item.availableDates.length > 1 ? (
                      <div className="relative inline-block">
                        <select
                          value={item.departureDate}
                          onChange={(e) =>
                            handleUpdateDate(item.packageId, item.departureDate, e.target.value)
                          }
                          className="font-sans text-xs font-semibold text-gold bg-cream/50 hover:bg-cream border border-olive/10 hover:border-gold/30 rounded px-2.5 py-1.5 outline-none appearance-none pr-8 cursor-pointer"
                        >
                          {item.availableDates.map((d) => (
                            <option key={d} value={d}>
                              {formatDateString(d)}
                            </option>
                          ))}
                        </select>
                        <span className="absolute inset-y-0 right-2.5 flex items-center pointer-events-none text-gold">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-3 h-3">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                          </svg>
                        </span>
                      </div>
                    ) : (
                      <span className="font-sans font-semibold text-olive">
                        {formatDateString(item.departureDate)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom Row: Quantity Counter & Remove action */}
                <div className="flex items-center justify-between pt-2 border-t border-olive/5">
                  <div className="flex items-center gap-3">
                    <span className="font-sans text-xs text-olive/60 font-medium uppercase tracking-wider">
                      travellers:
                    </span>
                    <div className="flex items-center border border-olive/15 rounded bg-cream/30">
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateTravellers(
                            item.packageId,
                            item.departureDate,
                            item.travellers - 1,
                            item.spacesLeft
                          )
                        }
                        className="px-2.5 py-1 text-olive/60 hover:text-olive hover:bg-cream transition-colors text-sm font-bold"
                        disabled={item.travellers <= 1}
                      >
                        &minus;
                      </button>
                      <span className="px-3 py-1 font-sans text-xs font-semibold text-olive border-x border-olive/10 select-none">
                        {item.travellers}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateTravellers(
                            item.packageId,
                            item.departureDate,
                            item.travellers + 1,
                            item.spacesLeft
                          )
                        }
                        className="px-2.5 py-1 text-olive/60 hover:text-olive hover:bg-cream transition-colors text-sm font-bold"
                        disabled={item.travellers >= item.spacesLeft}
                      >
                        &#43;
                      </button>
                    </div>
                    {item.travellers >= item.spacesLeft && (
                      <span className="font-sans text-[10px] text-gold font-medium uppercase tracking-wider">
                        Max spaces reached
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemove(item.packageId, item.departureDate)}
                    className="font-sans text-xs font-semibold text-red-700/80 hover:text-red-700 hover:underline transition-colors flex items-center gap-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-3.5 h-3.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: Order Summary */}
        <aside className="lg:sticky lg:top-32 space-y-6">
          <div className="bg-paper border border-olive/15 rounded-sm p-6 space-y-6 shadow-sm">
            <h2 className="font-display text-2xl font-bold text-olive border-b border-olive/10 pb-3">
              Summary
            </h2>

            {/* Price lines */}
            <div className="space-y-4 text-sm font-sans border-b border-olive/10 pb-5">
              <div className="flex justify-between items-center">
                <span className="text-olive/70 font-light">Subtotal</span>
                <span className="font-semibold text-olive">
                  {formatCurrency(subtotal, cartCurrency)}
                </span>
              </div>

              {appliedDiscount && appliedDiscount.success && (
                <div className="flex justify-between items-center bg-green-50/50 border border-green-200/40 p-2.5 rounded text-xs">
                  <div className="space-y-1">
                    <span className="font-semibold text-green-800 block">
                      Code: {appliedDiscount.code}
                    </span>
                    <button
                      type="button"
                      onClick={handleRemoveDiscount}
                      className="text-[10px] text-green-700/80 hover:text-green-800 hover:underline"
                    >
                      Remove code
                    </button>
                  </div>
                  <span className="font-semibold text-green-800 text-sm">
                    &minus; {formatCurrency(discountAmount, cartCurrency)}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center text-base pt-2 font-semibold">
                <span className="text-olive">Grand Total</span>
                <span className="text-gold text-lg">
                  {formatCurrency(grandTotal, cartCurrency)}
                </span>
              </div>
            </div>

            {/* Promo Code Input */}
            <div className="space-y-2 text-xs">
              <label htmlFor="discount" className="block font-sans font-semibold uppercase tracking-wider text-olive/60">
                Discount Code
              </label>
              <div className="flex gap-2">
                <input
                  id="discount"
                  type="text"
                  placeholder="e.g. TRAVEL10"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                  className="flex-grow rounded border border-olive/20 px-3 py-2.5 bg-cream/10 text-sm font-sans placeholder:text-olive/30 outline-none focus:border-gold"
                  disabled={isPending}
                />
                <button
                  type="button"
                  onClick={handleApplyDiscount}
                  className="rounded bg-olive hover:bg-ink text-ivory px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors duration-200 disabled:opacity-50"
                  disabled={isPending || !discountCode.trim()}
                >
                  {isPending ? "Applying..." : "Apply"}
                </button>
              </div>
              {discountError && (
                <p className="text-red-700 text-xs mt-1.5 font-sans font-medium" role="alert">
                  {discountError}
                </p>
              )}
            </div>

            {/* Checkout CTA */}
            <div className="pt-2">
              <Link
                href={`/checkout${appliedDiscount?.code ? `?code=${appliedDiscount.code}` : ""}`}
                className="w-full text-center font-sans text-xs font-semibold uppercase tracking-wider text-ivory bg-gold hover:bg-gold/95 py-4 rounded-sm transition-all duration-300 block hover:shadow-lg hover:shadow-gold/10 active:scale-95"
              >
                Proceed to Checkout
              </Link>
            </div>

            {/* Trust badge */}
            <div className="flex justify-center items-center gap-1.5 text-[10px] text-olive/50 font-sans uppercase tracking-wider text-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
              Secure Checkout &amp; Flexible Terms
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
