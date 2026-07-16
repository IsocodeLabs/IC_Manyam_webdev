import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageEditor } from "@/components/editor/PageEditor";
import type { Json } from "@/types/database.types";

function asSeoMeta(value: Json | null) {
  if (!value || Array.isArray(value) || typeof value !== "object") return null;
  const record = value as Record<string, Json | undefined>;
  return {
    title: typeof record.title === "string" ? record.title : "",
    description: typeof record.description === "string" ? record.description : "",
    canonicalUrl: typeof record.canonicalUrl === "string" ? record.canonicalUrl : "",
    featuredImageUrl: typeof record.featuredImageUrl === "string" ? record.featuredImageUrl : "",
  };
}

export default async function EditPageCms({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, { data: page }, { data: media }] = await Promise.all([
    supabase.from("users").select("role").eq("id", user.id).single(),
    supabase
      .from("pages")
      .select("id,title,slug,type,status,content,seo_meta")
      .eq("id", id)
      .single(),
    supabase.from("media").select("id,file_url,alt_text").order("created_at", { ascending: false }),
  ]);

  if (!profile || !["Admin", "Content Manager"].includes(profile.role)) {
    redirect("/dashboard?error=access_denied");
  }

  if (!page) notFound();

  const editorPage = {
    id: page.id,
    title: page.title,
    slug: page.slug,
    type: page.type as "Landing" | "Category" | "Standard" | "Form" | "Legal",
    status: page.status as "Draft" | "Published",
    content: page.content,
    seo_meta: asSeoMeta(page.seo_meta),
  };

  const mediaList = (media ?? []).map((item) => ({
    id: item.id,
    file_url: item.file_url ?? "",
    alt_text: item.alt_text ?? "",
  }));

  return <PageEditor page={editorPage} media={mediaList} />;
}
