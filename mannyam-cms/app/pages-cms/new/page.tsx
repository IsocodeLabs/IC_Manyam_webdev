import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageEditor } from "@/components/editor/PageEditor";

export default async function NewPageCreator() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, { data: media }] = await Promise.all([
    supabase.from("users").select("role").eq("id", user.id).single(),
    supabase.from("media").select("id,file_url,alt_text").order("created_at", { ascending: false }),
  ]);

  if (!profile || !["Admin", "Content Manager"].includes(profile.role)) {
    redirect("/dashboard?error=access_denied");
  }

  const mediaList = (media ?? []).map((item) => ({
    id: item.id,
    file_url: item.file_url ?? "",
    alt_text: item.alt_text ?? "",
  }));

  return <PageEditor page={null} media={mediaList} />;
}
