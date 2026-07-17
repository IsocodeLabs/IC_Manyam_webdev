"use server";

import { supabaseAdmin } from "@/lib/supabase/admin";


import { cookies } from "next/headers";

export interface PackagePricing {
  id: string;
  package_id: string;
  currency: string;
  base_amount: number;
  deposit_amount: number | null;
}

export interface PackageWithPricing {
  id: string;
  title: string;
  slug: string;
  type: string;
  featured_image_url: string | null;
  availability: { date: string; spacesLeft: number; status: string }[];
  pricing: PackagePricing | null;
  isCurrencyFallback?: boolean;
}

/**
 * Server action to fetch all published packages along with their pricing and availability.
 * Bypasses public RLS to expose pricing details securely to the public Cart page.
 */
export async function getPackagesWithPricing(): Promise<PackageWithPricing[]> {
  try {
    const [{ data: pkgs, error: pkgsError }, { data: prices }] = await Promise.all([
      supabaseAdmin
        .from("packages")
        .select("id, title, slug, type, featured_image_url, availability"),
      supabaseAdmin
        .from("pricing")
        .select("id, package_id, currency, base_amount, deposit_amount")
    ]);

    if (pkgsError) {
      console.error("Error fetching packages for cart:", pkgsError);
      return [];
    }

    const priceMap = new Map<string, PackagePricing[]>();
    if (prices) {
      prices.forEach((p) => {
        const list = priceMap.get(p.package_id) || [];
        list.push(p as PackagePricing);
        priceMap.set(p.package_id, list);
      });
    }

    const cookieStore = await cookies();
    const selectedCurrency = cookieStore.get("mannyam_currency")?.value || "GBP";

    return (pkgs || []).map((pkg) => {
      const availabilityList = (Array.isArray(pkg.availability) ? pkg.availability : []) as {
        date: string;
        spacesLeft: number;
        status: string;
      }[];

      const pkgPrices = priceMap.get(pkg.id) || [];
      let pricing = pkgPrices.find((p) => p.currency.toUpperCase() === selectedCurrency.toUpperCase()) || null;
      let isCurrencyFallback = false;

      if (!pricing && pkgPrices.length > 0) {
        pricing = pkgPrices[0];
        isCurrencyFallback = true;
      }

      return {
        id: pkg.id,
        title: pkg.title,
        slug: pkg.slug,
        type: pkg.type,
        featured_image_url: pkg.featured_image_url,
        availability: availabilityList,
        pricing,
        isCurrencyFallback,
      };
    });
  } catch (error) {
    console.error("Failed to get packages with pricing:", error);
    return [];
  }
}

export interface DiscountValidationResult {
  success: boolean;
  message?: string;
  code?: string;
  type?: "percent" | "fixed";
  value?: number;
  discountAmount?: number;
}

/**
 * Server Action to validate a discount code against the public.discount_codes table.
 * Recalculates discount securely in minor units.
 */
export async function validateDiscountCode(
  code: string,
  subtotalAmount: number
): Promise<DiscountValidationResult> {
  if (!code || !code.trim()) {
    return { success: false, message: "Please enter a discount code." };
  }

  const cleanCode = code.trim().toUpperCase();

  try {
    // Look up active code
    const { data: discount, error } = await supabaseAdmin
      .from("discount_codes")
      .select("id, code, type, value, active, expires_at, max_uses, times_used")
      .eq("code", cleanCode)
      .maybeSingle();

    if (error) {
      console.error("Error fetching discount code:", error);
      return { success: false, message: "Error validating discount code. Please try again." };
    }

    if (!discount) {
      return { success: false, message: "Invalid discount code." };
    }

    if (!discount.active) {
      return { success: false, message: "This discount code is no longer active." };
    }

    // Check expiration date
    if (discount.expires_at) {
      const expiry = new Date(discount.expires_at);
      if (expiry < new Date()) {
        return { success: false, message: "This discount code has expired." };
      }
    }

    // Check usage limits
    if (discount.max_uses !== null && discount.times_used >= discount.max_uses) {
      return { success: false, message: "This discount code has reached its maximum usage limit." };
    }

    // Calculate discount amount securely
    let discountAmount = 0;
    if (discount.type === "percent") {
      // value represents percent (e.g. 10 = 10%)
      discountAmount = Math.round(subtotalAmount * (discount.value / 100));
    } else if (discount.type === "fixed") {
      // value is in minor units (pence/cents)
      discountAmount = discount.value;
    } else {
      return { success: false, message: "Unknown discount type." };
    }

    // Discount cannot exceed subtotal
    if (discountAmount > subtotalAmount) {
      discountAmount = subtotalAmount;
    }

    return {
      success: true,
      code: discount.code,
      type: discount.type as "percent" | "fixed",
      value: discount.value,
      discountAmount,
    };
  } catch (error) {
    console.error("Unexpected error validating discount code:", error);
    return { success: false, message: "Server error occurred. Please try again." };
  }
}
