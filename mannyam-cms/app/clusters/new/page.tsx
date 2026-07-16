import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getClusterFormOptions } from "../actions";
import { ClusterEditor } from "@/components/clusters/ClusterEditor";

export const dynamic = "force-dynamic";

export default async function NewClusterPage() {
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

  if (!profile || !["Admin", "Content Manager"].includes(profile.role)) {
    redirect("/clusters?error=access_denied");
  }

  const { pillarOptions, spokeOptions } = await getClusterFormOptions();

  return (
    <ClusterEditor
      cluster={null}
      pillarOptions={pillarOptions}
      spokeOptions={spokeOptions}
      role={profile.role}
    />
  );
}
