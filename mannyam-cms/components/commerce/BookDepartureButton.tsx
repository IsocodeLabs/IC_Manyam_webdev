"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";

interface Props {
  packageId: string;
  departureDate: string;
  disabled: boolean;
}

export function BookDepartureButton({ packageId, departureDate, disabled }: Props) {
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          packageId,
          departureDate,
          travellers: 1,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add departure to booking.");
      }

      router.push("/cart");
      router.refresh();
    } catch (e) {
      console.error("Failed to add journey to cart:", e);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleAddToCart}
      disabled={disabled || isAdding}
      className="font-sans text-[10px] font-bold uppercase tracking-wider text-gold hover:text-olive transition-colors disabled:opacity-35 disabled:cursor-not-allowed select-none flex items-center gap-1"
    >
      {isAdding ? (
        <Loader2 className="w-3 h-3 animate-spin text-gold" />
      ) : null}
      Book Now &rarr;
    </button>
  );
}
