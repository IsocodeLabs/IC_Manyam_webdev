import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const { data: setting, error } = await supabaseAdmin
    .from("site_settings")
    .select("value")
    .eq("key", "robots_txt")
    .single();

  let content = "";
  if (error || !setting) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mannyam.in";
    content = `User-agent: *
Allow: /
Disallow: /dashboard/
Disallow: /api/
Sitemap: ${siteUrl}/api/sitemap`;
  } else {
    content = setting.value;
  }

  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600",
    },
  });
}
