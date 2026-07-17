import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AnalyticsSettingsClient } from "./AnalyticsSettingsClient";

export const dynamic = "force-dynamic";

export default async function AnalyticsSettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch profile to verify role
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !["Admin", "Marketer"].includes(profile.role)) {
    redirect("/dashboard?error=access_denied");
  }

  // Fetch current GA4 and GTM settings
  const { data: settings } = await supabase
    .from("site_settings")
    .select("key, value")
    .in("key", ["ga4_measurement_id", "gtm_container_id"]);

  const initialGa4Id = settings?.find((s) => s.key === "ga4_measurement_id")?.value || "";
  const initialGtmId = settings?.find((s) => s.key === "gtm_container_id")?.value || "";

  return (
    <AnalyticsSettingsClient
      initialGa4Id={initialGa4Id}
      initialGtmId={initialGtmId}
    />
  );
}
