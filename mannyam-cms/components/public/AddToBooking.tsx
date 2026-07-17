"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Calendar, Users, Minus, Plus, ChevronDown, Check, Loader2, Info } from "lucide-react";

interface AvailabilityEntry {
  date?: string;
  spacesLeft?: number;
  status?: "Available" | "Full" | "Cancelled";
}

interface AddToBookingProps {
  packageId: string;
  slug: string;
  title: string;
  type: string;
  availability: AvailabilityEntry[];
  pricing: {
    id: string;
    currency: string;
    base_amount: number;
    deposit_amount: number | null;
  } | null;
}

export function AddToBooking({
  packageId,
  slug,
  title,
  type,
  availability,
  pricing,
}: AddToBookingProps) {
  const [travellers, setTravellers] = useState<number>(1);
  const [departureDate, setDepartureDate] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  // If there is no pricing row, show the standard enquiry/concierge CTA instead
  if (!pricing) {
    const isFestival = type === "Festival";
    const subHeading = isFestival ? "Bespoke Planning" : "Bespoke Curation";
    const heading = isFestival ? "Join This Festival" : "Begin Your Story";
    const bodyText = isFestival
      ? "Connect with a dedicated travel specialist to secure your booking or design a tailored festival itinerary."
      : "Connect with a dedicated travel specialist to custom design this journey or reserve your departure.";
    const ctaText = isFestival ? "Join This Festival" : "Enquire About This Journey";

    return (
      <div className="bg-ink text-ivory p-8 rounded-sm text-center space-y-6 shadow-md relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-olive/30 via-transparent to-transparent pointer-events-none" />
        <div className="space-y-2 relative">
          <span className="font-sans text-[9px] font-bold uppercase tracking-[0.2em] text-gold">
            {subHeading}
          </span>
          <h3 className="font-display text-2xl font-bold text-gold">
            {heading}
          </h3>
          <p className="font-sans text-xs text-ivory/70 font-light leading-relaxed">
            {bodyText}
          </p>
        </div>
        <div className="relative pt-2">
          <Link
            href={`/enquire?journey=${slug}`}
            className="w-full font-sans text-xs font-semibold uppercase tracking-wider text-ink bg-gold hover:bg-gold/90 py-3.5 rounded-sm transition-all duration-300 block hover:shadow-lg hover:shadow-gold/15 active:scale-95"
          >
            {ctaText}
          </Link>
        </div>
      </div>
    );
  }

  // Filter and sort available scheduled departures
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const availableDepartures = (availability || [])
    .filter((entry): entry is { date: string; spacesLeft?: number; status?: "Available" | "Full" | "Cancelled" } => {
      if (!entry.date) return false;
      const d = new Date(entry.date);
      const isPast = d < today;
      const isAvailable = entry.status === "Available";
      return !isPast && isAvailable;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Format currency display helper
  const formatCurrency = (amountMinor: number) => {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: pricing.currency,
    }).format(amountMinor / 100);
  };

  const unitAmount = pricing.base_amount;
  const lineAmount = unitAmount * travellers;
  const depositLineAmount = pricing.deposit_amount ? pricing.deposit_amount * travellers : null;

  const handleTravellersChange = (val: number) => {
    if (val < 1) return;
    setTravellers(val);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!departureDate) {
      setError("Please select a departure date.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          packageId,
          departureDate,
          travellers,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "An unexpected error occurred.");
      }

      setSuccess(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to add the experience to your booking.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDateLabel = (dateStr: string) => {
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

  if (success) {
    return (
      <div className="bg-cream/40 border border-gold/30 p-8 rounded-sm space-y-6 shadow-md text-center">
        <div className="mx-auto w-12 h-12 bg-gold/10 text-gold flex items-center justify-center rounded-full">
          <Check className="w-6 h-6" />
        </div>
        <div className="space-y-2">
          <h3 className="font-display text-xl font-bold text-olive">
            Journey Curated
          </h3>
          <p className="font-sans text-xs text-olive/80 leading-relaxed font-light">
            {title} has been successfully added to your itinerary for {formatDateLabel(departureDate)}: {travellers} {travellers === 1 ? "traveller" : "travellers"}.
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <Link
            href="/cart"
            className="w-full font-sans text-xs font-semibold uppercase tracking-wider text-ivory bg-olive hover:bg-olive/90 py-3.5 rounded-sm transition-all duration-300 block hover:shadow-lg hover:shadow-olive/15"
          >
            View Your Cart
          </Link>
          <button
            onClick={() => {
              setSuccess(false);
              setDepartureDate("");
              setTravellers(1);
            }}
            className="w-full font-sans text-[11px] font-bold uppercase tracking-wider text-gold hover:text-olive transition-colors py-2"
          >
            Continue Customising
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-cream/40 border border-olive/10 p-6 sm:p-8 rounded-sm space-y-6 shadow-sm">
      <div className="border-b border-olive/10 pb-4 space-y-1">
        <span className="font-sans text-[9px] font-bold uppercase tracking-[0.2em] text-gold block">
          Bespoke Journey
        </span>
        <h3 className="font-display text-2xl font-bold text-olive">
          Book Your Experience
        </h3>
        <p className="font-sans text-xs text-olive/60 font-light">
          Configure departure details for your party.
        </p>
      </div>

      <form onSubmit={handleAdd} className="space-y-5">
        {/* Date selection */}
        <div className="space-y-2">
          <label className="font-sans text-[10px] font-bold uppercase tracking-wider text-olive/80 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-gold" />
            Departure Date
          </label>
          
          {availableDepartures.length > 0 ? (
            <div className="relative">
              <select
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                className="w-full appearance-none bg-ivory/60 border border-olive/10 hover:border-gold/40 text-olive text-xs font-light rounded-sm px-4 py-3.5 pr-10 focus:outline-none focus:ring-1 focus:ring-gold/30 transition-all duration-300 font-sans cursor-pointer"
              >
                <option value="" disabled className="text-olive/50 bg-ivory">
                  Select scheduled departure
                </option>
                {availableDepartures.map((entry, idx) => (
                  <option key={idx} value={entry.date} className="text-olive bg-ivory">
                    {formatDateLabel(entry.date)} {entry.spacesLeft ? `(${entry.spacesLeft} remaining)` : ""}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-olive/60 pointer-events-none" />
            </div>
          ) : (
            <div className="relative">
              <input
                type="date"
                value={departureDate}
                min={today.toISOString().split("T")[0]}
                onChange={(e) => setDepartureDate(e.target.value)}
                className="w-full bg-ivory/60 border border-olive/10 hover:border-gold/40 text-olive text-xs font-light rounded-sm px-4 py-3 focus:outline-none focus:ring-1 focus:ring-gold/30 transition-all duration-300 font-sans cursor-pointer"
              />
            </div>
          )}
        </div>

        {/* Travellers count */}
        <div className="space-y-2">
          <label className="font-sans text-[10px] font-bold uppercase tracking-wider text-olive/80 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-gold" />
            Travellers
          </label>
          <div className="flex items-center justify-between bg-ivory/60 border border-olive/10 rounded-sm px-4 py-2">
            <span className="font-sans text-xs text-olive font-light">
              {travellers} {travellers === 1 ? "traveller" : "travellers"}
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleTravellersChange(travellers - 1)}
                disabled={travellers <= 1}
                className="w-7 h-7 flex items-center justify-center rounded-full border border-olive/10 hover:border-gold/50 text-olive/70 hover:text-olive disabled:opacity-30 disabled:pointer-events-none transition-all duration-200"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleTravellersChange(travellers + 1)}
                className="w-7 h-7 flex items-center justify-center rounded-full border border-olive/10 hover:border-gold/50 text-olive/70 hover:text-olive transition-all duration-200"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Real-time Pricing Summary */}
        <div className="bg-ivory/40 p-4 border border-olive/5 rounded-sm space-y-2.5">
          <div className="flex justify-between text-xs font-sans text-olive/70 font-light">
            <span>Rate per traveller:</span>
            <span>{formatCurrency(unitAmount)}</span>
          </div>
          <div className="flex justify-between text-sm font-sans font-semibold text-olive border-t border-olive/5 pt-2.5">
            <span>Estimated Total:</span>
            <span>{formatCurrency(lineAmount)}</span>
          </div>
          {depositLineAmount && (
            <div className="flex justify-between text-[11px] font-sans text-gold border-t border-olive/5 border-dashed pt-2">
              <span className="flex items-center gap-1">
                <Info className="w-3 h-3" /> Optional deposit today:
              </span>
              <span>{formatCurrency(depositLineAmount)}</span>
            </div>
          )}
        </div>

        {error && (
          <p className="font-sans text-xs text-red-600 font-light bg-red-50/50 border border-red-200/40 p-3 rounded-sm leading-relaxed">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full font-sans text-xs font-semibold uppercase tracking-wider text-ink bg-gold hover:bg-gold/90 py-3.5 rounded-sm transition-all duration-300 flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-gold/15 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-ink" />
              Securing Your Booking...
            </>
          ) : (
            "Add to Booking"
          )}
        </button>
      </form>
    </div>
  );
}
