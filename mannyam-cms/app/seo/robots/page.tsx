import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RobotsClient } from "./RobotsClient";

export const dynamic = "force-dynamic";

export default async function RobotsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !["Admin", "Content Manager", "Marketer"].includes(profile.role)) {
    redirect("/dashboard?error=access_denied");
  }

  const { data: setting } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "robots_txt")
    .single();

  const isAdmin = profile.role === "Admin";
  const initialValue = setting?.value ?? null;

  return <RobotsClient isAdmin={isAdmin} initialValue={initialValue} />;
}
