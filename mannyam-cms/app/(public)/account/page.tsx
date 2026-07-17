import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/commerce/format";
import { customerLogoutAction } from "./actions";

export const dynamic = "force-dynamic";

interface BookingItemRow {
  id: string;
  booking_id: string;
  package_id: string | null;
  package_title: string;
  departure_date: string | null;
  travellers: number;
  unit_amount: number;
  line_amount: number;
}

export default async function AccountPage() {
  const supabase = await createClient();

  // 1. Authenticate user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/account/login");
  }

  // 2. Fetch customer profile info
  const name = user.user_metadata?.name || "Valued Traveller";
  const email = user.email || "";

  // 3. Fetch bookings for this user
  const { data: bookings, error: bookingsError } = await supabase
    .from("bookings")
    .select("*")
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false });

  if (bookingsError) {
    console.error("Error fetching customer bookings:", bookingsError);
  }

  // 4. Fetch booking items for all retrieved bookings
  const bookingIds = bookings?.map((b) => b.id) || [];
  const bookingItemsMap: Record<string, BookingItemRow[]> = {};

  if (bookingIds.length > 0) {
    const { data: items, error: itemsError } = await supabase
      .from("booking_items")
      .select("*")
      .in("booking_id", bookingIds);

    if (items && !itemsError) {
      items.forEach((item) => {
        if (!bookingItemsMap[item.booking_id]) {
          bookingItemsMap[item.booking_id] = [];
        }
        bookingItemsMap[item.booking_id].push(item as BookingItemRow);
      });
    }
  }

  // Color helper for booking status badges
  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-amber-50 text-amber-800 border-amber-200/50";
      case "Confirmed":
        return "bg-blue-50 text-blue-800 border-blue-200/50";
      case "Paid":
        return "bg-green-50 text-green-800 border-green-200/50";
      case "Cancelled":
        return "bg-red-50 text-red-800 border-red-200/50";
      default:
        return "bg-gray-50 text-gray-800 border-gray-200/50";
    }
  };

  return (
    <div className="min-h-screen bg-cream/10 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* Portal Header Area */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-olive/10 pb-8 gap-6">
          <div>
            <span className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-gold block mb-1">
              MANNYAM Bespoke Journeys
            </span>
            <h1 className="font-display text-4xl text-olive font-medium tracking-wide">
              Traveller Dashboard
            </h1>
            <p className="font-sans text-sm text-olive/60 mt-1 font-light">
              Welcome back, {name}. Review your active reservations and invoices.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-olive/50 font-sans font-light hidden sm:inline">
              Signed in as: <strong className="font-medium text-olive/80">{email}</strong>
            </span>
            <form action={customerLogoutAction}>
              <button
                type="submit"
                className="px-4 py-2 bg-olive/10 hover:bg-olive/20 text-olive text-xs font-semibold tracking-wider uppercase rounded-sm transition cursor-pointer"
              >
                Sign Out
              </button>
            </form>
          </div>
        </div>

        {/* Content Section */}
        <div className="space-y-6">
          <h2 className="font-display text-2xl text-olive font-medium">
            Your Bespoke Journeys
          </h2>

          {!bookings || bookings.length === 0 ? (
            /* Empty State */
            <div className="bg-paper p-12 text-center rounded-sm border border-olive/10 shadow-xs max-w-2xl mx-auto space-y-6">
              <div className="w-16 h-16 bg-cream/50 rounded-full flex items-center justify-center mx-auto text-gold text-2xl">
                ✈️
              </div>
              <div className="space-y-2">
                <h3 className="font-display text-xl text-olive font-medium">
                  No Active Journeys Found
                </h3>
                <p className="font-sans text-sm text-olive/60 font-light leading-relaxed max-w-md mx-auto">
                  Your travel itinerary is currently empty. Explore our hand-crafted, premium packages to plan your next extraordinary escape.
                </p>
              </div>
              <div>
                <Link
                  href="/destinations"
                  className="inline-block px-6 py-3 bg-olive text-cream text-xs font-bold uppercase tracking-widest rounded-sm shadow-xs hover:bg-olive/90 transition"
                >
                  Explore Destinations
                </Link>
              </div>
            </div>
          ) : (
            /* Bookings List */
            <div className="space-y-8">
              {bookings.map((booking) => {
                const items = bookingItemsMap[booking.id] || [];
                const remainingBalance = booking.total_amount - booking.amount_paid;

                return (
                  <div
                    key={booking.id}
                    className="bg-paper rounded-sm border border-olive/10 shadow-xs overflow-hidden divide-y divide-olive/5"
                  >
                    {/* Booking Card Header */}
                    <div className="p-6 bg-cream/10 flex flex-wrap items-center justify-between gap-4">
                      <div className="space-y-1">
                        <span className="font-sans text-[10px] font-semibold text-olive/50 uppercase tracking-wider block">
                          Booking Reference
                        </span>
                        <span className="font-mono text-sm font-semibold text-olive uppercase">
                          {booking.id}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="font-sans text-[10px] font-semibold text-olive/50 uppercase tracking-wider block mr-1 sm:text-right">
                          Status
                        </span>
                        <span
                          className={`px-3 py-1 text-[11px] font-semibold uppercase tracking-wider rounded-full border ${getStatusBadgeStyle(
                            booking.status
                          )}`}
                        >
                          {booking.status}
                        </span>
                      </div>
                    </div>

                    {/* Booking Card Items */}
                    <div className="p-6 space-y-4">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-olive/5 pb-4 last:border-0 last:pb-0 gap-3"
                        >
                          <div className="space-y-1">
                            <h4 className="font-sans font-semibold text-olive text-sm">
                              {item.package_title}
                            </h4>
                            {item.departure_date && (
                              <p className="font-sans text-xs text-olive/60 font-light">
                                Departure Date: {new Date(item.departure_date).toLocaleDateString("en-GB", {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                })}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-8 text-right sm:text-right">
                            <div className="space-y-0.5">
                              <span className="font-sans text-[10px] font-light text-olive/40 uppercase tracking-wider block">
                                Travellers
                              </span>
                              <span className="font-sans text-sm text-olive/80 font-medium">
                                {item.travellers}
                              </span>
                            </div>
                            <div className="space-y-0.5">
                              <span className="font-sans text-[10px] font-light text-olive/40 uppercase tracking-wider block">
                                Price
                              </span>
                              <span className="font-sans text-sm text-olive font-semibold">
                                {formatCurrency(item.line_amount, booking.currency)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Booking Card Footer (Financial Breakdown and Action Button) */}
                    <div className="p-6 bg-cream/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                      <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
                        <div className="space-y-1">
                          <span className="font-sans text-[10px] font-light text-olive/50 uppercase tracking-wider block">
                            Total Reservation Value
                          </span>
                          <span className="font-sans text-lg font-bold text-olive">
                            {formatCurrency(booking.total_amount, booking.currency)}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <span className="font-sans text-[10px] font-light text-olive/50 uppercase tracking-wider block">
                            Amount Paid
                          </span>
                          <span className="font-sans text-lg font-bold text-emerald-800">
                            {formatCurrency(booking.amount_paid, booking.currency)}
                          </span>
                        </div>
                        {remainingBalance > 0 && (
                          <div className="space-y-1">
                            <span className="font-sans text-[10px] font-light text-olive/50 uppercase tracking-wider block">
                              Balance Outstanding
                            </span>
                            <span className="font-sans text-lg font-bold text-amber-800">
                              {formatCurrency(remainingBalance, booking.currency)}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex justify-end">
                        <a
                          href={`/api/bookings/${booking.id}/invoice`}
                          className="px-5 py-3 bg-olive hover:bg-olive/90 text-cream text-[11px] font-bold uppercase tracking-widest rounded-sm shadow-xs transition inline-flex items-center gap-2 cursor-pointer"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                            />
                          </svg>
                          Download Invoice
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
