import { requireRole } from "@/lib/rbac/requireRole";
import { createClient } from "@/lib/supabase/server";
import { BookingsClient } from "./BookingsClient";

export const dynamic = "force-dynamic";

export default async function BookingsPage() {
  // Enforce staff RBAC
  await requireRole(["Admin", "Marketer"]);

  const supabase = await createClient();

  // Fetch all bookings along with their snapshot items
  const { data: bookings, error } = await supabase
    .from("bookings")
    .select(`
      *,
      booking_items (*)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching bookings:", error);
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <BookingsClient initialBookings={bookings || []} />
    </div>
  );
}
