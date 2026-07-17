import { verifyAndGetBookingStatus } from "@/app/(public)/checkout/actions";
import { SuccessStatusClient } from "@/components/commerce/SuccessStatusClient";
import Link from "next/link";

export const metadata = {
  title: "Journey Confirmed | MANNYAM",
  description: "Your luxury bespoke travel arrangements are confirmed and secured. Welcome to MANNYAM.",
};

interface SuccessPageProps {
  searchParams: Promise<{
    booking?: string;
    payment_id?: string;
  }>;
}

export default async function CheckoutSuccessPage({ searchParams }: SuccessPageProps) {
  const resolvedParams = await searchParams;
  const bookingId = resolvedParams.booking;
  const paymentId = resolvedParams.payment_id;

  if (!bookingId) {
    return (
      <div className="max-w-2xl mx-auto text-center py-24 px-4 space-y-6">
        <span className="font-sans text-[11px] font-bold uppercase tracking-widest text-gold block">
          Reference Error
        </span>
        <h1 className="font-display text-4xl font-bold text-olive">
          No Booking Reference Specified
        </h1>
        <p className="font-sans text-xs text-olive/60 font-light max-w-md mx-auto leading-relaxed">
          Please check your transaction emails or return to the main dashboard to verify your reservation details.
        </p>
        <div className="pt-4">
          <Link
            href="/"
            className="inline-block font-sans text-[11px] font-bold uppercase tracking-widest text-cream bg-olive hover:bg-olive/90 px-8 py-3.5 rounded-sm transition-colors"
          >
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  // Load and verify status immediately on server side
  const result = await verifyAndGetBookingStatus(bookingId, paymentId);

  if (!result.success || !result.booking) {
    return (
      <div className="max-w-2xl mx-auto text-center py-24 px-4 space-y-6">
        <span className="font-sans text-[11px] font-bold uppercase tracking-widest text-gold block">
          Reference Error
        </span>
        <h1 className="font-display text-4xl font-bold text-olive">
          Reservation Record Not Found
        </h1>
        <p className="font-sans text-xs text-olive/60 font-light max-w-md mx-auto leading-relaxed">
          The booking reference <strong>{bookingId}</strong> could not be located in our database securely.
        </p>
        <div className="pt-4">
          <Link
            href="/"
            className="inline-block font-sans text-[11px] font-bold uppercase tracking-widest text-cream bg-olive hover:bg-olive/90 px-8 py-3.5 rounded-sm transition-colors"
          >
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <SuccessStatusClient
        bookingId={bookingId}
        paymentId={paymentId}
        initialBooking={result.booking}
      />
    </main>
  );
}
