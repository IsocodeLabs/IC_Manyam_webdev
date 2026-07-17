import { MetadataRoute } from "next";
import { supabaseAdmin } from "@/lib/supabase/admin";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const { data: setting } = await supabaseAdmin
    .from("site_settings")
    .select("value")
    .eq("key", "robots_txt")
    .single();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mannyam.in";

  if (setting?.value) {
    const lines = setting.value.split("\n");
    const rules: {
      userAgent: string | string[];
      allow?: string | string[];
      disallow?: string | string[];
    }[] = [];
    let currentAgent = "*";
    let currentAllow: string[] = [];
    let currentDisallow: string[] = [];

    for (const line of lines) {
      const cleanLine = line.trim();
      if (!cleanLine || cleanLine.startsWith("#")) continue;
      const parts = cleanLine.split(":");
      if (parts.length < 2) continue;
      const key = parts[0].trim().toLowerCase();
      const val = parts.slice(1).join(":").trim();

      if (key === "user-agent") {
        if (currentAllow.length > 0 || currentDisallow.length > 0) {
          rules.push({
            userAgent: currentAgent,
            allow: currentAllow.length > 0 ? currentAllow : undefined,
            disallow: currentDisallow.length > 0 ? currentDisallow : undefined,
          });
          currentAllow = [];
          currentDisallow = [];
        }
        currentAgent = val;
      } else if (key === "allow") {
        currentAllow.push(val);
      } else if (key === "disallow") {
        currentDisallow.push(val);
      }
    }
    
    if (currentAgent) {
      rules.push({
        userAgent: currentAgent,
        allow: currentAllow.length > 0 ? currentAllow : undefined,
        disallow: currentDisallow.length > 0 ? currentDisallow : undefined,
      });
    }

    return {
      rules: rules.length > 0 ? rules : {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard/", "/api/"],
      },
      sitemap: `${siteUrl}/sitemap.xml`,
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard/", "/api/"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
