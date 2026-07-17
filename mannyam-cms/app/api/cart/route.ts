import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { addToCart, updateCartItem, removeFromCart, clearCart } from "@/lib/commerce/cart";
import { getComputedCart } from "@/lib/commerce/cart";

// GET: Returns the full cart with server-computed pricing
export async function GET() {
  try {
    const computedCart = await getComputedCart();
    return NextResponse.json(computedCart);
  } catch (error) {
    console.error("GET /api/cart error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve the cart details." },
      { status: 500 }
    );
  }
}

const postSchema = z.object({
  packageId: z.string().uuid("Invalid package ID format."),
  departureDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid departure date format. Must be YYYY-MM-DD."),
  travellers: z.number().int().positive("There must be at least one traveller."),
});

// POST: Add an item to the cart
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = postSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }
    
    const { packageId, departureDate, travellers } = result.data;
    await addToCart(packageId, departureDate, travellers);
    
    const computedCart = await getComputedCart();
    return NextResponse.json({
      message: "Item added to the booking successfully.",
      cart: computedCart,
    });
  } catch (error) {
    console.error("POST /api/cart error:", error);
    return NextResponse.json(
      { error: "Failed to add the item to your booking." },
      { status: 500 }
    );
  }
}

const patchSchema = z.object({
  id: z.string().uuid("Invalid cart item ID."),
  departureDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format. Must be YYYY-MM-DD.").optional(),
  travellers: z.number().int().positive("There must be at least one traveller.").optional(),
});

// PATCH: Update travellers or departure date for a cart item
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const result = patchSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }
    
    const { id, departureDate, travellers } = result.data;
    
    if (!departureDate && !travellers) {
      return NextResponse.json(
        { error: "Please provide either a new departure date or travellers count to update." },
        { status: 400 }
      );
    }
    
    await updateCartItem(id, { departureDate, travellers });
    
    const computedCart = await getComputedCart();
    return NextResponse.json({
      message: "Booking updated successfully.",
      cart: computedCart,
    });
  } catch (error) {
    console.error("PATCH /api/cart error:", error);
    return NextResponse.json(
      { error: "Failed to update your booking details." },
      { status: 500 }
    );
  }
}

// DELETE: Remove an item or clear the entire cart
export async function DELETE(request: NextRequest) {
  try {
    // Try to get item ID from query parameters or JSON body
    const { searchParams } = new URL(request.url);
    let id = searchParams.get("id");
    
    if (!id) {
      try {
        const body = await request.json();
        if (body && typeof body === "object" && "id" in body) {
          id = String(body.id);
        }
      } catch {
        // No body or invalid JSON is acceptable, means we clear the whole cart
      }
    }
    
    if (id) {
      const uuidSchema = z.string().uuid("Invalid cart item ID format.");
      const result = uuidSchema.safeParse(id);
      if (!result.success) {
        return NextResponse.json(
          { error: result.error.issues[0].message },
          { status: 400 }
        );
      }
      
      await removeFromCart(id);
      const computedCart = await getComputedCart();
      return NextResponse.json({
        message: "Item removed from the booking successfully.",
        cart: computedCart,
      });
    } else {
      await clearCart();
      return NextResponse.json({
        message: "Your booking cart has been cleared.",
        cart: {
          items: [],
          currency: "GBP",
          totalAmount: 0,
          totalAmountFormatted: "£0.00",
        },
      });
    }
  } catch (error) {
    console.error("DELETE /api/cart error:", error);
    return NextResponse.json(
      { error: "Failed to remove the booking items." },
      { status: 500 }
    );
  }
}
