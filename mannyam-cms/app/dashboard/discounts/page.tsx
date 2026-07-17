import { requireRole } from "@/lib/rbac/requireRole";
import { createClient } from "@/lib/supabase/server";
import { DiscountsClient } from "./DiscountsClient";

export const dynamic = "force-dynamic";

export default async function DiscountsPage() {
  // Enforce staff RBAC
  const { role } = await requireRole(["Admin", "Marketer"]);

  const supabase = await createClient();

  // Fetch all discount codes
  const { data: discountCodes, error } = await supabase
    .from("discount_codes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching discount codes:", error);
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <DiscountsClient initialDiscounts={discountCodes || []} currentStaffRole={role} />
    </div>
  );
}
