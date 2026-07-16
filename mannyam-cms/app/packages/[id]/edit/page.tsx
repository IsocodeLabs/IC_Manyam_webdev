import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PackageEditor } from "@/components/editor/PackageEditor";

export default async function EditPackagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, { data: pkg }, { data: media }] = await Promise.all([
    supabase.from("users").select("role").eq("id", user.id).single(),
    supabase
      .from("packages")
      .select("id,title,slug,type,description,featured_image_url,itinerary,availability,seo_meta")
      .eq("id", id)
      .single(),
    supabase.from("media").select("id,file_url,alt_text").order("created_at", { ascending: false }),
  ]);

  if (!profile || !["Admin", "Content Manager"].includes(profile.role)) {
    redirect("/dashboard?error=access_denied");
  }

  if (!pkg) notFound();

  const editorPackage = {
    id: pkg.id,
    title: pkg.title,
    slug: pkg.slug,
    type: pkg.type as "Festival" | "Destination" | "Honeymoon" | "Wildlife" | "Wellness",
    description: pkg.description ?? "",
    featured_image_url: pkg.featured_image_url,
    itinerary: pkg.itinerary,
    availability: pkg.availability,
    seo_meta: pkg.seo_meta,
  };

  const mediaList = (media ?? []).map((item) => ({
    id: item.id,
    file_url: item.file_url ?? "",
    alt_text: item.alt_text ?? "",
  }));

  return <PackageEditor pkg={editorPackage} media={mediaList} />;
}
