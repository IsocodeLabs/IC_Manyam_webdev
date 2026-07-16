import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PagesTable } from "@/components/pages/PagesTable";

export default async function PagesCmsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, { data: pages, error }] = await Promise.all([
    supabase.from("users").select("role").eq("id", user.id).single(),
    supabase
      .from("pages")
      .select("id,title,slug,type,status,updated_at")
      .order("updated_at", { ascending: false }),
  ]);

  if (!profile || !["Admin", "Content Manager"].includes(profile.role)) {
    redirect("/dashboard?error=access_denied");
  }

  if (error) {
    return (
      <section className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-800 font-sans">
        <h1 className="font-display text-3xl">Pages unavailable</h1>
        <p className="mt-2 font-sans">The pages content could not be loaded. Please try again.</p>
      </section>
    );
  }

  const rows = (pages ?? []).map((page) => ({
    ...page,
    type: page.type as "Landing" | "Category" | "Standard" | "Form" | "Legal",
    status: page.status as "Draft" | "Published",
    updated_at: page.updated_at ?? new Date(0).toISOString(),
  }));

  return <PagesTable pages={rows} role={profile.role} />;
}
