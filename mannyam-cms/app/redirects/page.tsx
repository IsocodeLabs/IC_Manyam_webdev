import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RedirectsClient } from "./RedirectsClient";

export const dynamic = "force-dynamic";

export default async function RedirectsPage() {
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

  const { data: redirects } = await supabase
    .from("redirects")
    .select("*")
    .order("created_at", { ascending: false });

  const canWrite = ["Admin", "Marketer"].includes(profile.role);

  return (
    <RedirectsClient
      initialRedirects={redirects ?? []}
      canWrite={canWrite}
    />
  );
}
