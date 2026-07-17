import { requireRole } from "@/lib/rbac/requireRole";
import { createClient } from "@/lib/supabase/server";
import { BookingDetailClient } from "./BookingDetailClient";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function BookingDetailPage({ params }: PageProps) {
  // Enforce staff RBAC
  const { role } = await requireRole(["Admin", "Marketer"]);
  const { id } = await params;

  const supabase = await createClient();

  // 1. Fetch main booking
  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", id)
    .single();

  if (bookingError || !booking) {
    return (
      <div className="p-6 max-w-3xl mx-auto text-center font-sans">
        <h2 className="text-xl font-semibold text-red-700">Booking not found</h2>
        <p className="text-sm text-olive/60 mt-2">
          The requested booking reference does not exist or you do not have permission to view it.
        </p>
        <Link
          href="/dashboard/bookings"
          className="mt-4 inline-block px-4 py-2 bg-olive text-paper rounded hover:bg-olive-2 transition-all"
        >
          Back to Bookings
        </Link>
      </div>
    );
  }

  // 2. Fetch booking items
  const { data: items } = await supabase
    .from("booking_items")
    .select("*")
    .eq("booking_id", id);

  // 3. Fetch booking notes
  const { data: notes } = await supabase
    .from("booking_notes")
    .select("*")
    .eq("booking_id", id)
    .order("created_at", { ascending: true });

  // 4. Fetch booking audit logs
  const { data: auditLogs } = await supabase
    .from("booking_audit_logs")
    .select("*")
    .eq("booking_id", id)
    .order("changed_at", { ascending: true });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <BookingDetailClient
        booking={booking}
        items={items || []}
        notes={notes || []}
        auditLogs={auditLogs || []}
        currentStaffRole={role}
      />
    </div>
  );
}
