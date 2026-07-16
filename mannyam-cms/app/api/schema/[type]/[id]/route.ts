import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { generateArticleSchema, generateTourSchema } from "@/lib/seo/generateJsonLd";
import { type Database } from "@/types/database.types";

type PostRow = Database["public"]["Tables"]["posts"]["Row"];
type PackageRow = Database["public"]["Tables"]["packages"]["Row"];

export async function GET(
  request: Request,
  { params }: { params: Promise<{ type: string; id: string }> }
) {
  const { type, id } = await params;

  if (type === "post") {
    // Validate UUID format before querying
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return new NextResponse("Post not found", { status: 404 });
    }

    const { data: post, error } = await supabaseAdmin
      .from("posts")
      .select("id, title, slug, seo_meta, published_at, created_at")
      .eq("id", id)
      .single();

    if (error || !post) {
      return new NextResponse("Post not found", { status: 404 });
    }

    const schema = generateArticleSchema(post as PostRow);
    return NextResponse.json(schema);
  }

  if (type === "package") {
    // Validate UUID format before querying
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return new NextResponse("Package not found", { status: 404 });
    }

    const { data: pkg, error } = await supabaseAdmin
      .from("packages")
      .select("id, title, slug, type, description, featured_image_url, itinerary, availability, seo_meta")
      .eq("id", id)
      .single();

    if (error || !pkg) {
      return new NextResponse("Package not found", { status: 404 });
    }

    const schema = generateTourSchema(pkg as PackageRow);
    return NextResponse.json(schema);
  }

  return new NextResponse("Not Found", { status: 404 });
}
