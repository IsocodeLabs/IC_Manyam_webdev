import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AuditLogClient } from "./AuditLogClient";

export const dynamic = "force-dynamic";

export default async function AuditLogPage() {
  const supabase = await createClient();

  // 1. Authenticate user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // 2. Fetch user profile to verify role (access for Admin and Marketer roles)
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !["Admin", "Marketer"].includes(profile.role)) {
    redirect("/dashboard?error=access_denied");
  }

  // 3. Fetch all status changes logs (cast client to any for dynamic table)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: logs } = await (supabase as any).from("lead_audit_log")
    .select(`
      id,
      lead_id,
      changed_by,
      changed_by_name,
      from_status,
      to_status,
      changed_at,
      leads (
        name
      )
    `)
    .order("changed_at", { ascending: false });

  // 4. Fetch all users for filtering
  const { data: users } = await supabase
    .from("users")
    .select("id, name")
    .order("name", { ascending: true });

  return (
    <AuditLogClient
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      initialLogs={(logs as any) || []}
      users={users || []}
    />
  );
}
