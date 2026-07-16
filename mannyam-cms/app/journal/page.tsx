import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { JournalTable } from "@/components/journal/JournalTable";

export default async function JournalPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, { data: posts, error }, { data: categories }] = await Promise.all([
    supabase.from("users").select("role").eq("id", user.id).single(),
    supabase
      .from("posts")
      .select("id,title,category_id,status,scheduled_at,published_at,created_at,categories(name)")
      .order("created_at", { ascending: false }),
    supabase.from("categories").select("id,name").order("name"),
  ]);

  if (!profile || !["Admin", "Content Manager"].includes(profile.role)) {
    redirect("/dashboard?error=access_denied");
  }

  if (error) {
    return (
      <section className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-800">
        <h1 className="font-display text-3xl">Journal unavailable</h1>
        <p className="mt-2">The journal entries could not be loaded. Please try again.</p>
      </section>
    );
  }

  const rows = (posts ?? []).map((post) => ({
    ...post,
    created_at: post.created_at ?? new Date(0).toISOString(),
    categoryName: Array.isArray(post.categories)
      ? post.categories[0]?.name ?? null
      : post.categories?.name ?? null,
  }));

  return <JournalTable posts={rows} categories={categories ?? []} />;
}
