"use client";

import React, { useState } from "react";
import Script from "next/script";
import { formatCurrency } from "@/lib/commerce/format";
import { customerLogoutAction } from "./actions";

interface BookingItem {
  id: string;
  package_id: string;
  package_title: string;
  departure_date: string;
  travellers: number;
  unit_amount: number;
  line_amount: number;
}

interface Booking {
  id: string;
  status: string;

  currency: string;
  total_amount: number;
  amount_paid: number;
  payment_type: string;
  contact_name: string;
  contact_email: string;
  notes: string;
  created_at: string;
  booking_items: BookingItem[];
}

interface MyJourneysClientProps {
  profile: {
    name: string;
    email: string;
    phone?: string | null;
    country?: string | null;
  } | null;
  bookings: Booking[];
}

export function MyJourneysClient({ profile, bookings }: MyJourneysClientProps) {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handlePayBalance = async (booking: Booking) => {
    const bookingId = booking.id;
    setErrorMessage(null);
    setLoadingMap((prev) => ({ ...prev, [bookingId]: true }));

    if (!scriptLoaded) {
      setErrorMessage("Payment gateway is loading. Please try again in a moment.");
      setLoadingMap((prev) => ({ ...prev, [bookingId]: false }));
      return;
    }

    try {
      // Call the pay-balance initialization endpoint
      const res = await fetch(`/api/bookings/${bookingId}/pay-balance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Failed to initialize balance payment.");
        setLoadingMap((prev) => ({ ...prev, [bookingId]: false }));
        return;
      }

      // Launch Razorpay Modal
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_placeholder",
        amount: data.amount,
        currency: data.currency,
        name: "MANNYAM",
        description: "Bespoke Journey Outstanding Balance",
        order_id: data.orderId,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        handler: async function (response: any) {
          // Redirect to checkout success page which will confirm and update status
          window.location.href = `/checkout/success?booking=${bookingId}&payment_id=${response.razorpay_payment_id}`;
        },
        prefill: {
          name: booking.contact_name,
          email: booking.contact_email,
        },
        theme: {
          color: "#b1832f",
        },
        modal: {
          ondismiss: function () {
            setLoadingMap((prev) => ({ ...prev, [bookingId]: false }));
          },
        },
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Balance payment error:", err);
      setErrorMessage("An error occurred launching the payment gateway.");
      setLoadingMap((prev) => ({ ...prev, [bookingId]: false }));
    }
  };

  return (
    <div className="space-y-12">
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => setScriptLoaded(true)}
        onError={() => console.error("Razorpay script failed to load.")}
      />

      {/* Hero Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-olive/10 pb-6 gap-6">
        <div>
          <span className="font-sans text-[10px] font-bold uppercase tracking-[0.25em] text-gold block mb-1">
            Private Member Portal
          </span>
          <h1 className="font-display text-4xl font-bold text-olive">
            Welcome, {profile?.name || "Traveller"}
          </h1>
          <p className="font-sans text-xs text-olive/60 font-light mt-1">
            Review your bespoke itineraries and settle any outstanding balance options securely.
          </p>
        </div>

        <button
          onClick={async () => {
            await customerLogoutAction();
          }}
          className="self-start font-sans text-[10px] font-bold uppercase tracking-widest text-olive border border-olive/20 hover:border-gold hover:text-gold px-5 py-2.5 rounded-sm transition-all cursor-pointer"
        >
          Sign Out
        </button>
      </div>

      {errorMessage && (
        <div className="p-4 bg-amber/10 border border-amber/20 text-amber text-xs rounded-sm font-sans">
          {errorMessage}
        </div>
      )}

      {/* Grid of Profile & Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Side: Active Bookings */}
        <div className="lg:col-span-8 space-y-8">
          <h2 className="font-display text-2xl font-bold text-olive border-b border-olive/5 pb-2">
            Your Private Journeys
          </h2>

          {bookings.length === 0 ? (
            <div className="bg-paper border border-olive/5 rounded-sm p-12 text-center space-y-4 shadow-sm">
              <p className="font-sans text-xs text-olive/60 font-light leading-relaxed max-w-md mx-auto">
                You have no active journey bookings recorded. Explore our curated destinations and experiences to begin planning your first bespoke luxury journey.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {bookings.map((booking) => {
                const pnrRef = `MNY-${booking.id.slice(0, 8).toUpperCase()}`;
                const remaining = Math.max(0, booking.total_amount - booking.amount_paid);

                return (
                  <div
                    key={booking.id}
                    className="bg-paper border border-olive/10 rounded-sm shadow-sm overflow-hidden"
                  >
                    {/* Card Header */}
                    <div className="bg-cream/40 px-6 py-4 border-b border-olive/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <span className="font-sans text-[9px] font-bold uppercase tracking-wider text-olive/50">
                          Booking Reference
                        </span>
                        <span className="font-display text-md font-bold text-olive block">
                          {pnrRef}
                        </span>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="font-sans text-xs text-olive/60 font-light hidden sm:inline">
                          Booked: {new Date(booking.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                        <span
                          className={`font-sans text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-sm border ${
                            booking.status === "Paid"
                              ? "bg-olive/10 text-olive border-olive/20"
                              : booking.status === "Confirmed"
                              ? "bg-gold/10 text-gold border-gold/20"
                              : "bg-amber/10 text-amber border-amber/20"
                          }`}
                        >
                          {booking.status}
                        </span>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-6 space-y-6">
                      {/* Booking Items */}
                      <div className="space-y-4">
                        {booking.booking_items?.map((item) => (
                          <div key={item.id} className="flex justify-between items-start text-xs font-sans">
                            <div className="space-y-0.5">
                              <h4 className="font-display font-bold text-olive text-sm leading-tight">
                                {item.package_title}
                              </h4>
                              <div className="flex gap-4 text-olive/60 font-light text-[11px]">
                                <span>
                                  Departure:{" "}
                                  {new Date(item.departure_date).toLocaleDateString("en-GB", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  })}
                                </span>
                                <span>•</span>
                                <span>Travellers: {item.travellers}</span>
                              </div>
                            </div>
                            <span className="text-olive font-semibold">
                              {formatCurrency(item.line_amount, booking.currency)}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Payment Overview */}
                      <div className="pt-4 border-t border-olive/5 grid grid-cols-1 sm:grid-cols-3 gap-4 font-sans text-xs">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-olive/40 block">
                            Total Journey Price
                          </span>
                          <span className="text-olive font-medium">
                            {formatCurrency(booking.total_amount, booking.currency)}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-olive/40 block">
                            Total Paid To Date
                          </span>
                          <span className="text-olive font-medium">
                            {formatCurrency(booking.amount_paid, booking.currency)}
                          </span>
                        </div>

                        <div className="space-y-1 sm:text-right">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gold block">
                            Outstanding Balance
                          </span>
                          <span className={`font-bold ${remaining > 0 ? "text-gold text-sm" : "text-olive"}`}>
                            {remaining > 0 ? formatCurrency(remaining, booking.currency) : "Fully Settled"}
                          </span>
                        </div>
                      </div>

                      {/* Pay Balance CTA Button */}
                      {booking.status === "Confirmed" && booking.payment_type === "deposit" && remaining > 0 && (
                        <div className="pt-4 border-t border-olive/5 flex justify-end">
                          <button
                            onClick={() => handlePayBalance(booking)}
                            disabled={loadingMap[booking.id]}
                            className="w-full sm:w-auto font-sans text-[11px] font-bold uppercase tracking-widest text-cream bg-gold hover:bg-gold/90 px-6 py-3 rounded-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                          >
                            {loadingMap[booking.id] ? "Initializing..." : "Pay Remaining Balance"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Side: Profile Summary Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-cream/40 p-6 rounded-sm border border-olive/10 shadow-sm space-y-6">
            <h3 className="font-display text-lg font-bold text-olive border-b border-olive/10 pb-2">
              Traveller Profile
            </h3>

            <div className="space-y-4 font-sans text-xs">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-olive/50 block">
                  Name
                </span>
                <p className="text-olive font-medium">{profile?.name || "Not set"}</p>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-olive/50 block">
                  Email Address
                </span>
                <p className="text-olive font-medium">{profile?.email || "Not set"}</p>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-olive/50 block">
                  Phone Number
                </span>
                <p className="text-olive font-medium">{profile?.phone || "Not set"}</p>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-olive/50 block">
                  Country of Residence
                </span>
                <p className="text-olive font-medium">{profile?.country || "United Kingdom"}</p>
              </div>
            </div>
          </div>

          <div className="bg-ink text-ivory p-6 rounded-sm space-y-3 relative overflow-hidden shadow-sm">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-olive/20 via-transparent to-transparent pointer-events-none" />
            <h4 className="font-display text-md font-bold text-gold">Concierge Service</h4>
            <p className="font-sans text-[10px] text-ivory/60 leading-relaxed font-light">
              Our travel specialists are on-hand to make modifications to your itinerary. Please contact our main desk or reach out via AI Concierge.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
