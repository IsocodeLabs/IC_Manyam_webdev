import { supabaseAdmin } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  // Query GA4 and GTM keys directly using the admin database connection
  const { data: settings, error } = await supabaseAdmin
    .from("site_settings")
    .select("key, value")
    .in("key", ["ga4_measurement_id", "gtm_container_id"]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const ga4 = settings?.find((s) => s.key === "ga4_measurement_id")?.value || null;
  const gtm = settings?.find((s) => s.key === "gtm_container_id")?.value || null;

  return NextResponse.json({
    ga4MeasurementId: ga4,
    gtmContainerId: gtm,
  });
}
