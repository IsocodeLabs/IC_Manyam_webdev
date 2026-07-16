import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PostEditor } from "@/components/editor/PostEditor";

export default async function NewPostPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const [{ data: profile }, { data: categories }, { data: tags }, { data: media }] = await Promise.all([
    supabase.from("users").select("role").eq("id", user.id).single(),
    supabase.from("categories").select("id,name").order("name"),
    supabase.from("tags").select("id,name").order("name"),
    supabase.from("media").select("id,file_url,alt_text").order("created_at", { ascending: false }),
  ]);
  if (!profile || !["Admin", "Content Manager"].includes(profile.role)) redirect("/dashboard?error=access_denied");
  return <PostEditor post={null} categories={categories ?? []} tags={tags ?? []} media={media ?? []} revisions={[]} />;
}
