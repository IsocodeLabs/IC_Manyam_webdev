import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SitemapClient } from "./SitemapClient";

export const dynamic = "force-dynamic";

export default async function SitemapPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !["Admin", "Content Manager"].includes(profile.role)) {
    redirect("/dashboard?error=access_denied");
  }

  // Get the latest updated content timestamp as "last regenerated" hint
  const [{ data: latestPage }, { data: latestPost }, { data: latestPkg }] = await Promise.all([
    supabase
      .from("pages")
      .select("updated_at")
      .eq("status", "Published")
      .order("updated_at", { ascending: false })
      .limit(1)
      .single(),
    supabase
      .from("posts")
      .select("published_at")
      .eq("status", "Published")
      .order("published_at", { ascending: false })
      .limit(1)
      .single(),
    supabase
      .from("packages")
      .select("created_at")
      .order("created_at", { ascending: false })
      .limit(1)
      .single(),
  ]);

  const timestamps = [
    latestPage?.updated_at,
    latestPost?.published_at,
    latestPkg?.created_at,
  ]
    .filter(Boolean)
    .map((t) => new Date(t!).getTime());

  const lastContentUpdate = timestamps.length > 0
    ? new Date(Math.max(...timestamps)).toISOString()
    : null;

  return <SitemapClient lastContentUpdate={lastContentUpdate} />;
}
