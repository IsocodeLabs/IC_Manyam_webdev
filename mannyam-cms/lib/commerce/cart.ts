import { cookies } from "next/headers";
import { createHmac, randomUUID } from "crypto";

export interface CartItem {
  id: string; // unique item reference in the cart session
  packageId: string;
  departureDate: string;
  travellers: number;
}

const COOKIE_NAME = "mannyam_cart";
const SECRET = process.env.SUPABASE_SERVICE_ROLE_KEY || "mannyam-secure-cart-secret-key-salt-2026";

function sign(payload: string): string {
  return createHmac("sha256", SECRET).update(payload).digest("hex");
}

function verifyAndParse(cookieValue: string): CartItem[] {
  try {
    const parts = cookieValue.split(".");
    if (parts.length < 2) return [];
    
    const signature = parts.pop()!;
    const payload = parts.join(".");
    
    const expectedSignature = sign(payload);
    if (signature !== expectedSignature) {
      console.warn("Cart cookie tampering detected or secret changed.");
      return [];
    }
    
    const decoded = Buffer.from(payload, "base64").toString("utf-8");
    const items = JSON.parse(decoded);
    if (Array.isArray(items)) {
      return items;
    }
    return [];
  } catch (error) {
    console.error("Failed to parse cart cookie:", error);
    return [];
  }
}

function serialize(items: CartItem[]): string {
  const payload = Buffer.from(JSON.stringify(items)).toString("base64");
  const signature = sign(payload);
  return `${payload}.${signature}`;
}

export async function getCart(): Promise<CartItem[]> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(COOKIE_NAME);
  if (!cookie) return [];
  return verifyAndParse(cookie.value);
}

export async function saveCart(items: CartItem[]): Promise<void> {
  const cookieStore = await cookies();
  const value = serialize(items);
  cookieStore.set(COOKIE_NAME, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}

export async function addToCart(packageId: string, departureDate: string, travellers: number): Promise<CartItem[]> {
  const items = await getCart();
  
  // Check if item with same packageId and departureDate already exists
  const existingIndex = items.findIndex(
    (item) => item.packageId === packageId && item.departureDate === departureDate
  );
  
  if (existingIndex > -1) {
    items[existingIndex].travellers += travellers;
  } else {
    items.push({
      id: randomUUID(),
      packageId,
      departureDate,
      travellers,
    });
  }
  
  await saveCart(items);
  return items;
}

export async function updateCartItem(
  id: string,
  updates: { departureDate?: string; travellers?: number }
): Promise<CartItem[]> {
  const items = await getCart();
  const index = items.findIndex((item) => item.id === id);
  
  if (index > -1) {
    if (updates.departureDate !== undefined) {
      items[index].departureDate = updates.departureDate;
    }
    if (updates.travellers !== undefined) {
      items[index].travellers = updates.travellers;
    }
    await saveCart(items);
  }
  
  return items;
}

export async function removeFromCart(id: string): Promise<CartItem[]> {
  const items = await getCart();
  const filtered = items.filter((item) => item.id !== id);
  await saveCart(filtered);
  return filtered;
}

export async function clearCart(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

import { supabaseAdmin } from "@/lib/supabase/admin";

export interface ComputedCartItem {
  id: string;
  packageId: string;
  departureDate: string;
  travellers: number;
  package: {
    id: string;
    title: string;
    slug: string;
    type: string;
    featured_image_url: string | null;
  };
  currency: string;
  unitAmount: number;
  unitAmountFormatted: string;
  lineAmount: number;
  lineAmountFormatted: string;
  isCurrencyFallback?: boolean;
}

export interface ComputedCart {
  items: ComputedCartItem[];
  currency: string;
  totalAmount: number;
  totalAmountFormatted: string;
}

export async function getComputedCart(): Promise<ComputedCart> {
  const items = await getCart();
  const cookieStore = await cookies();
  const selectedCurrency = cookieStore.get("mannyam_currency")?.value || "GBP";

  if (items.length === 0) {
    return {
      items: [],
      currency: selectedCurrency,
      totalAmount: 0,
      totalAmountFormatted: new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency: selectedCurrency,
      }).format(0),
    };
  }

  const packageIds = items.map((item) => item.packageId);
  
  // Fetch packages and pricing using supabaseAdmin (bypassing RLS)
  const { data: packages, error } = await supabaseAdmin
    .from("packages")
    .select(`
      id,
      title,
      slug,
      type,
      featured_image_url,
      pricing (
        currency,
        base_amount,
        deposit_amount
      )
    `)
    .in("id", packageIds);

  if (error || !packages) {
    console.error("Error fetching packages/pricing for cart:", error);
    return {
      items: [],
      currency: selectedCurrency,
      totalAmount: 0,
      totalAmountFormatted: new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency: selectedCurrency,
      }).format(0),
    };
  }

  const resolvedItems: ComputedCartItem[] = [];

  for (const item of items) {
    const pkg = packages.find((p) => p.id === item.packageId);
    if (!pkg) continue;

    const pricingArray = pkg.pricing as unknown as {
      currency: string;
      base_amount: number;
      deposit_amount: number | null;
    }[] | null | undefined;

    // Search for pricing row with the chosen currency
    let pricing = Array.isArray(pricingArray)
      ? pricingArray.find((p) => p.currency.toUpperCase() === selectedCurrency.toUpperCase())
      : pricingArray;

    let isCurrencyFallback = false;
    if (Array.isArray(pricingArray) && !pricing && pricingArray.length > 0) {
      // Fallback to base (first available) currency
      pricing = pricingArray[0];
      isCurrencyFallback = true;
    }

    if (!pricing) {
      continue;
    }

    const currency = pricing.currency || "GBP";
    const baseAmount = pricing.base_amount || 0;
    const lineAmount = baseAmount * item.travellers;

    resolvedItems.push({
      id: item.id,
      packageId: item.packageId,
      departureDate: item.departureDate,
      travellers: item.travellers,
      package: {
        id: pkg.id,
        title: pkg.title,
        slug: pkg.slug,
        type: pkg.type,
        featured_image_url: pkg.featured_image_url,
      },
      currency,
      unitAmount: baseAmount,
      unitAmountFormatted: new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency,
      }).format(baseAmount / 100),
      lineAmount,
      lineAmountFormatted: new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency,
      }).format(lineAmount / 100),
      isCurrencyFallback,
    });
  }

  // The dominant currency should match the selectedCurrency unless the cart is entirely falls back
  const dominantCurrency = resolvedItems[0]?.currency || selectedCurrency;
  const totalAmount = resolvedItems.reduce((sum, item) => {
    // If currency matches dominant currency, accumulate
    if (item.currency === dominantCurrency) {
      return sum + item.lineAmount;
    }
    return sum;
  }, 0);

  return {
    items: resolvedItems,
    currency: dominantCurrency,
    totalAmount,
    totalAmountFormatted: new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: dominantCurrency,
    }).format(totalAmount / 100),
  };
}
