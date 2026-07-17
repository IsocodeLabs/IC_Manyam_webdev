"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { verifyAndGetBookingStatus, registerGuestAccountAction } from "@/app/(public)/checkout/actions";
import { formatCurrency } from "@/lib/commerce/format";

interface SuccessStatusClientProps {
  bookingId: string;
  paymentId?: string;
  initialBooking: any;
}

export function SuccessStatusClient({ bookingId, paymentId, initialBooking }: SuccessStatusClientProps) {
  const [booking, setBooking] = useState(initialBooking);
  const [status, setStatus] = useState<string>(initialBooking?.status || "Pending");
  const [attempts, setScriptAttempts] = useState(0);

  // Guest registration states
  const [registerChecked, setRegisterChecked] = useState(false);
  const [registerPassword, setRegisterPassword] = useState("");
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);

  const handleGuestRegister = async () => {
    if (!registerPassword || registerPassword.length < 6) {
      setRegError("Password must be at least 6 characters.");
      return;
    }
    setRegLoading(true);
    setRegError(null);

    const result = await registerGuestAccountAction(bookingId, registerPassword);
    if (result.success) {
      window.location.href = "/account";
    } else {
      setRegError(result.error || "An error occurred during registration.");
      setRegLoading(false);
    }
  };


  useEffect(() => {
    if (status === "Paid" || status === "Confirmed") return;

    const interval = setInterval(async () => {
      setScriptAttempts((prev) => {
        const next = prev + 1;
        if (next >= 10) {
          clearInterval(interval);
        }
        return next;
      });

      const result = await verifyAndGetBookingStatus(bookingId, paymentId);
      if (result.success && result.booking) {
        setBooking(result.booking);
        setStatus(result.booking.status);
        if (result.booking.status === "Paid" || result.booking.status === "Confirmed") {
          clearInterval(interval);
        }
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [bookingId, paymentId, status]);

  const pnrRef = `MNY-${bookingId.slice(0, 8).toUpperCase()}`;
  const totalPaid = booking?.amount_paid || 0;
  const balanceDue = Math.max(0, (booking?.total_amount || 0) - totalPaid);

  return (
    <div className="max-w-3xl mx-auto space-y-12 py-6">
      {/* Visual Status Indicator Card */}
      <div className="text-center space-y-4">
        {status === "Paid" || status === "Confirmed" ? (
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-olive/10 border border-olive/20 text-olive mx-auto animate-bounce">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-8 h-8">
              <path d="M20 6L9 17L4 12" />
            </svg>
          </div>
        ) : (
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber/10 border border-amber/20 text-amber mx-auto animate-pulse">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
          </div>
        )}

        <div className="space-y-2">
          <span className="font-sans text-[10px] font-bold uppercase tracking-[0.25em] text-gold block">
            {status === "Paid" || status === "Confirmed" ? "Reservation Confirmed" : "Processing Transaction"}
          </span>
          <h1 className="font-display text-4xl font-bold text-olive">
            {status === "Paid" || status === "Confirmed" ? "Your Journey is Booked" : "Verifying Payment"}
          </h1>
          <p className="font-sans text-xs text-olive/60 font-light max-w-md mx-auto leading-relaxed">
            {status === "Paid" || status === "Confirmed"
              ? "We have secured your bespoke itinerary reservation. A confirmation email and initial onboarding documents have been generated."
              : "We are awaiting confirmation from the payment gateway node. This usually takes just a few moments."}
          </p>
        </div>
      </div>

      {/* Invoice Details Card */}
      <div className="bg-ivory border border-olive/5 rounded-sm shadow-sm overflow-hidden">
        {/* Card Header */}
        <div className="bg-cream border-b border-olive/10 px-8 py-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-olive/50">
              Booking Reference
            </span>
            <span className="font-display text-lg font-bold text-olive block mt-0.5">
              {pnrRef}
            </span>
          </div>

          <div className="text-left sm:text-right">
            <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-olive/50">
              Reservation Status
            </span>
            <span
              className={`inline-block font-sans text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-sm mt-1 border ${
                status === "Paid"
                  ? "bg-olive/10 text-olive border-olive/20"
                  : status === "Confirmed"
                  ? "bg-gold/10 text-gold border-gold/20"
                  : "bg-amber/10 text-amber border-amber/20"
              }`}
            >
              {status}
            </span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-8 space-y-6">
          {/* Guest Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-olive/5 font-sans text-xs">
            <div className="space-y-1">
              <span className="font-bold text-olive/50 uppercase tracking-wider text-[9px]">
                Lead Traveller
              </span>
              <p className="text-olive font-medium">{booking?.contact_name}</p>
              <p className="text-olive/70">{booking?.contact_email}</p>
            </div>

            <div className="space-y-1">
              <span className="font-bold text-olive/50 uppercase tracking-wider text-[9px]">
                Booking Date
              </span>
              <p className="text-olive">
                {new Date(booking?.created_at).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>

          {/* Line Items */}
          <div className="space-y-4 pb-6 border-b border-olive/5">
            <span className="font-sans font-bold text-olive/50 uppercase tracking-wider text-[9px] block">
              Reserved Packages
            </span>

            {booking?.booking_items?.map((item: any) => (
              <div key={item.id} className="flex justify-between items-start text-xs font-sans">
                <div className="space-y-0.5">
                  <h4 className="font-display font-bold text-olive text-sm">{item.package_title}</h4>
                  <div className="flex gap-4 text-olive/60 font-light">
                    <span>Departure: {new Date(item.departure_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
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

          {/* Settle Summaries */}
          <div className="space-y-3 font-sans text-xs pt-2">
            <div className="flex justify-between text-olive/60">
              <span>Total Estimated Package Cost</span>
              <span>{formatCurrency(booking?.total_amount, booking?.currency)}</span>
            </div>

            <div className="flex justify-between text-olive">
              <span>Sovereign Amount Paid Now</span>
              <span className="font-semibold text-olive">
                {formatCurrency(totalPaid, booking?.currency)}
              </span>
            </div>

            {balanceDue > 0 && (
              <div className="flex justify-between text-gold border-t border-olive/5 pt-3">
                <span className="font-medium">Remaining Balance Due Later</span>
                <span className="font-bold">
                  {formatCurrency(balanceDue, booking?.currency)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Optional Guest Registration Card */}
      {!booking?.customer_id && (
        <div className="bg-paper border border-olive/10 rounded-sm p-8 shadow-sm space-y-6">
          <div className="border-b border-olive/5 pb-4">
            <h3 className="font-display text-xl font-bold text-olive">Secure Your Traveller Portal Account</h3>
            <p className="font-sans text-xs text-olive/60 font-light mt-1">
              Create a secure account with your booking details to manage payments, track outstanding balance options, and view your private itineraries.
            </p>
          </div>

          <div className="space-y-4 max-w-md">
            <div className="flex items-start gap-3">
              <input
                id="create-account-checkbox"
                type="checkbox"
                checked={registerChecked}
                onChange={(e) => setRegisterChecked(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-olive/30 text-gold focus:ring-gold"
              />
              <label htmlFor="create-account-checkbox" className="font-sans text-xs text-olive font-medium cursor-pointer">
                Yes, register my email <strong className="font-semibold">{booking?.contact_email}</strong> as a traveller member.
              </label>
            </div>

            {registerChecked && (
              <div className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <label htmlFor="reg-password" className="font-sans text-[10px] font-bold uppercase tracking-wider text-olive block">
                    Choose Password * (min 6 characters)
                  </label>
                  <input
                    id="reg-password"
                    type="password"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    placeholder="Enter secure password"
                    className="w-full bg-cream border border-olive/10 rounded-sm px-4 py-2.5 text-xs font-sans text-olive focus:outline-none focus:border-gold transition-colors"
                  />
                </div>

                {regError && (
                  <p className="text-xs text-gold font-sans">{regError}</p>
                )}

                <button
                  type="button"
                  disabled={regLoading || !registerPassword || registerPassword.length < 6}
                  onClick={handleGuestRegister}
                  className="w-full font-sans text-[10px] font-bold uppercase tracking-widest text-cream bg-gold hover:bg-gold/90 py-3 rounded-sm transition-all text-center disabled:opacity-50 cursor-pointer"
                >
                  {regLoading ? "Creating Account..." : "Save & Register Account"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <Link
          href="/"
          className="w-full sm:w-auto text-center font-sans text-[11px] font-bold uppercase tracking-widest text-cream bg-olive hover:bg-olive/90 px-8 py-3.5 rounded-sm transition-colors cursor-pointer"
        >
          Return to Atelier Home
        </Link>
        <Link
          href="/account"
          className="w-full sm:w-auto text-center font-sans text-[11px] font-bold uppercase tracking-widest text-olive border border-olive/20 hover:bg-cream px-8 py-3.5 rounded-sm transition-colors cursor-pointer"
        >
          Access Member Portal
        </Link>
      </div>
    </div>
  );
}

