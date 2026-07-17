import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSearchConsoleData } from "@/lib/analytics/searchConsole";

export const dynamic = "force-dynamic";

// Helper to format large numbers
function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "k";
  }
  return num.toString();
}

// Helper to calculate trend percentages
function calculateTrend(current: number, previous: number, isPosition = false) {
  if (previous === 0) {
    return { diff: 0, percent: "0.0%", isPositive: true };
  }

  // For rank position, lower is better
  const diff = isPosition ? previous - current : current - previous;
  const pct = (diff / previous) * 100;
  const isPositive = diff >= 0;

  return {
    diff,
    percent: `${isPositive ? "+" : ""}${pct.toFixed(1)}%`,
    isPositive,
  };
}

// Helper to parse GSC URL to pathname
function getPathnameFromUrl(url: string, siteUrl: string) {
  let path = url;
  try {
    const parsed = new URL(url);
    path = parsed.pathname;
  } catch {
    const domain = siteUrl.replace(/^sc-domain:/, "").replace(/^https?:\/\//, "");
    path = url.replace(new RegExp(`^(https?:\\/\\/)?(www\\.)?${domain}`), "");
  }

  if (!path.startsWith("/")) {
    path = "/" + path;
  }

  if (path.length > 1 && path.endsWith("/")) {
    path = path.slice(0, -1);
  }

  return path;
}

export default async function AnalyticsPage(props: {
  searchParams: Promise<{ range?: string }>;
}) {
  const searchParams = await props.searchParams;
  const range = (searchParams.range || "28d") as "7d" | "28d" | "90d";

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 1. RBAC Check: Only Admin and Marketer can view this page
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !["Admin", "Marketer"].includes(profile.role)) {
    redirect("/dashboard?error=access_denied");
  }

  // 2. Check if GSC is configured
  const siteUrl = process.env.GSC_SITE_URL || "";
  const isConfigured = !!(
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
    process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY &&
    siteUrl
  );

  let data = null;
  let errorMsg = null;

  if (isConfigured) {
    try {
      data = await getSearchConsoleData(range);
    } catch (err) {
      const error = err as Error;
      console.error("GSC API connection error:", error);
      errorMsg = error.message || "Failed to fetch Search Console data.";
    }
  }

  // Not Connected State
  if (!isConfigured) {
    return (
      <div className="space-y-6 font-sans">
        <div className="border-b border-olive/10 pb-4">
          <h1 className="font-display text-3xl font-semibold text-olive">System Analytics</h1>
          <p className="mt-1 text-sm text-olive/70">
            Monitor search impressions, search click trends, click-through rates, and query rankings.
          </p>
        </div>
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-olive/10 bg-paper p-8 text-center shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gold/10 text-gold mb-4 text-2xl">
            📡
          </div>
          <h2 className="font-display text-2xl font-semibold text-olive">Search Console is not connected</h2>
          <p className="mt-2 max-w-md font-sans text-sm text-olive/70 leading-relaxed">
            Search Console is not connected. See the setup guide in Manual Step 8-A.
          </p>
          <Link
            href="/settings/analytics"
            className="mt-6 rounded-md bg-gold px-6 py-2.5 font-sans text-sm font-medium text-olive transition-colors hover:bg-gold/90"
          >
            Go to Settings
          </Link>
        </div>
      </div>
    );
  }

  // Connection Error State
  if (errorMsg) {
    return (
      <div className="space-y-6 font-sans">
        <div className="border-b border-olive/10 pb-4">
          <h1 className="font-display text-3xl font-semibold text-olive">System Analytics</h1>
          <p className="mt-1 text-sm text-olive/70">
            Monitor search impressions, search click trends, click-through rates, and query rankings.
          </p>
        </div>
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-red-100 bg-red-50/50 p-8 text-center shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-700 mb-4 text-2xl">
            ⚠️
          </div>
          <h2 className="font-display text-2xl font-semibold text-red-800">Connection Error</h2>
          <p className="mt-2 max-w-md font-sans text-sm text-red-700 leading-relaxed">
            {errorMsg}
          </p>
          <p className="mt-1 font-sans text-xs text-red-600/80">
            Please check your credentials in `.env.local` and confirm the Google Service Account has permissions.
          </p>
          <Link
            href="/settings/analytics"
            className="mt-6 rounded-md bg-olive px-6 py-2.5 font-sans text-sm font-medium text-paper transition-colors hover:bg-olive/90"
          >
            Review Settings
          </Link>
        </div>
      </div>
    );
  }

  // Process Rows for Tables
  const rows = data?.rows || [];
  const totals = data?.totals || { clicks: 0, impressions: 0, ctr: 0, position: 0 };
  const comparisonTotals = data?.comparisonTotals || { clicks: 0, impressions: 0, ctr: 0, position: 0 };

  // 1. Aggregate Queries
  const queriesMap = new Map<string, { clicks: number; impressions: number; totalPosition: number }>();
  for (const row of rows) {
    if (!row.query) continue;
    const existing = queriesMap.get(row.query) || { clicks: 0, impressions: 0, totalPosition: 0 };
    queriesMap.set(row.query, {
      clicks: existing.clicks + row.clicks,
      impressions: existing.impressions + row.impressions,
      totalPosition: existing.totalPosition + row.position * row.impressions,
    });
  }

  const topQueries = Array.from(queriesMap.entries())
    .map(([query, stats]) => {
      const ctr = stats.impressions > 0 ? stats.clicks / stats.impressions : 0;
      const position = stats.impressions > 0 ? stats.totalPosition / stats.impressions : 0;
      return { query, clicks: stats.clicks, impressions: stats.impressions, ctr, position };
    })
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 20);

  // 2. Aggregate Pages & Resolve Editor Links
  const pagesMap = new Map<string, { clicks: number; impressions: number; totalPosition: number }>();
  for (const row of rows) {
    if (!row.page) continue;
    const existing = pagesMap.get(row.page) || { clicks: 0, impressions: 0, totalPosition: 0 };
    pagesMap.set(row.page, {
      clicks: existing.clicks + row.clicks,
      impressions: existing.impressions + row.impressions,
      totalPosition: existing.totalPosition + row.position * row.impressions,
    });
  }

  const topPagesRaw = Array.from(pagesMap.entries())
    .map(([page, stats]) => {
      const ctr = stats.impressions > 0 ? stats.clicks / stats.impressions : 0;
      const position = stats.impressions > 0 ? stats.totalPosition / stats.impressions : 0;
      return { page, clicks: stats.clicks, impressions: stats.impressions, ctr, position };
    })
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 20);

  // Extract paths and slugs to resolve edit links
  const urlsAndSlugs = topPagesRaw.map((tp) => {
    const path = getPathnameFromUrl(tp.page, siteUrl);
    let slug = "";
    let isJournal = false;

    if (path.startsWith("/journal/")) {
      slug = path.replace(/^\/journal\//, "").split("?")[0].split("#")[0];
      isJournal = true;
    } else {
      slug = path.replace(/^\//, "").split("?")[0].split("#")[0];
    }

    return { page: tp.page, path, slug, isJournal };
  });

  const journalSlugs = urlsAndSlugs.filter((u) => u.isJournal).map((u) => u.slug);
  const pageSlugs = urlsAndSlugs.filter((u) => !u.isJournal).map((u) => u.slug);

  const postsMap = new Map<string, string>();
  if (journalSlugs.length > 0) {
    const { data: postsData } = await supabase
      .from("posts")
      .select("id, slug")
      .in("slug", journalSlugs);
    postsData?.forEach((p) => {
      if (p.slug) postsMap.set(p.slug, p.id);
    });
  }

  const pagesDbMap = new Map<string, string>();
  if (pageSlugs.length > 0) {
    const querySlugs = [...pageSlugs];
    if (pageSlugs.includes("")) {
      querySlugs.push("home", "index");
    }
    const { data: pagesData } = await supabase
      .from("pages")
      .select("id, slug")
      .in("slug", querySlugs);
    pagesData?.forEach((p) => {
      if (p.slug) pagesDbMap.set(p.slug, p.id);
    });
  }

  const topPages = topPagesRaw.map((tp, idx) => {
    const urlInfo = urlsAndSlugs[idx];
    let editLink: string | null = null;

    if (urlInfo.isJournal) {
      const postId = postsMap.get(urlInfo.slug);
      if (postId) editLink = `/journal/${postId}/edit`;
    } else {
      let pageId = pagesDbMap.get(urlInfo.slug);
      if (!pageId && urlInfo.slug === "") {
        pageId = pagesDbMap.get("home") || pagesDbMap.get("index");
      }
      if (pageId) editLink = `/pages-cms/${pageId}/edit`;
    }

    return {
      ...tp,
      path: urlInfo.path,
      editLink,
    };
  });

  // Calculate trends for KPI tiles
  const clicksTrend = calculateTrend(totals.clicks, comparisonTotals.clicks);
  const impressionsTrend = calculateTrend(totals.impressions, comparisonTotals.impressions);
  const ctrTrend = calculateTrend(totals.ctr, comparisonTotals.ctr);
  const positionTrend = calculateTrend(totals.position, comparisonTotals.position, true);

  const ranges = [
    { value: "7d", label: "Last 7 days" },
    { value: "28d", label: "Last 28 days" },
    { value: "90d", label: "Last 90 days" },
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-olive/10 pb-5">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-gold">Analytics</p>
          <h1 className="font-display text-4xl font-semibold text-olive">System Analytics</h1>
          <p className="mt-1 text-sm text-olive/70">
            Organic search performance metrics loaded from Google Search Console.
          </p>
        </div>
      </div>

      {/* Date Range Selector */}
      <div className="flex gap-2 border-b border-olive/10 pb-px">
        {ranges.map((r) => {
          const isActive = range === r.value;
          return (
            <Link
              key={r.value}
              href={`?range=${r.value}`}
              className={`px-4 py-2 font-sans text-sm font-medium border-b-2 transition-all -mb-px ${
                isActive
                  ? "border-gold text-olive"
                  : "border-transparent text-olive/60 hover:text-olive hover:border-olive/20"
              }`}
            >
              {r.label}
            </Link>
          );
        })}
      </div>

      {/* KPI Tiles Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Clicks */}
        <div className="rounded-xl border border-olive/10 bg-paper p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-olive/50">Total Clicks</p>
          <h3 className="mt-2 font-display text-3xl font-bold text-olive">{formatNumber(totals.clicks)}</h3>
          <div className="mt-2 flex items-center gap-1.5">
            <span
              className={`inline-flex items-center text-xs font-semibold ${
                clicksTrend.isPositive ? "text-emerald-700" : "text-rose-700"
              }`}
            >
              {clicksTrend.isPositive ? "↑" : "↓"} {clicksTrend.percent}
            </span>
            <span className="text-[10px] text-olive/40 font-medium">vs previous period</span>
          </div>
        </div>

        {/* Total Impressions */}
        <div className="rounded-xl border border-olive/10 bg-paper p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-olive/50">Total Impressions</p>
          <h3 className="mt-2 font-display text-3xl font-bold text-olive">{formatNumber(totals.impressions)}</h3>
          <div className="mt-2 flex items-center gap-1.5">
            <span
              className={`inline-flex items-center text-xs font-semibold ${
                impressionsTrend.isPositive ? "text-emerald-700" : "text-rose-700"
              }`}
            >
              {impressionsTrend.isPositive ? "↑" : "↓"} {impressionsTrend.percent}
            </span>
            <span className="text-[10px] text-olive/40 font-medium">vs previous period</span>
          </div>
        </div>

        {/* Average CTR */}
        <div className="rounded-xl border border-olive/10 bg-paper p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-olive/50">Average CTR</p>
          <h3 className="mt-2 font-display text-3xl font-bold text-olive">
            {(totals.ctr * 100).toFixed(2)}%
          </h3>
          <div className="mt-2 flex items-center gap-1.5">
            <span
              className={`inline-flex items-center text-xs font-semibold ${
                ctrTrend.isPositive ? "text-emerald-700" : "text-rose-700"
              }`}
            >
              {ctrTrend.isPositive ? "↑" : "↓"} {ctrTrend.percent}
            </span>
            <span className="text-[10px] text-olive/40 font-medium">vs previous period</span>
          </div>
        </div>

        {/* Average Position */}
        <div className="rounded-xl border border-olive/10 bg-paper p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-olive/50">Average Position</p>
          <h3 className="mt-2 font-display text-3xl font-bold text-olive">{totals.position.toFixed(1)}</h3>
          <div className="mt-2 flex items-center gap-1.5">
            <span
              className={`inline-flex items-center text-xs font-semibold ${
                positionTrend.isPositive ? "text-emerald-700" : "text-rose-700"
              }`}
            >
              {positionTrend.isPositive ? "↑" : "↓"} {positionTrend.percent}
            </span>
            <span className="text-[10px] text-olive/40 font-medium">vs previous period</span>
          </div>
        </div>
      </div>

      {/* Tables Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Queries Table */}
        <div className="rounded-xl border border-olive/10 bg-paper shadow-sm overflow-hidden flex flex-col">
          <div className="border-b border-olive/10 bg-cream/35 px-5 py-4">
            <h2 className="font-display text-lg font-semibold text-olive">Top Queries</h2>
            <p className="text-xs text-olive/60">Top search queries driving organic impressions & clicks.</p>
          </div>
          <div className="overflow-x-auto flex-1">
            {topQueries.length === 0 ? (
              <p className="p-8 text-center text-sm text-olive/50 italic">No search query data available.</p>
            ) : (
              <table className="min-w-full text-left text-xs">
                <thead className="bg-ivory text-[10px] uppercase tracking-wider text-olive/70 font-semibold">
                  <tr>
                    <th className="px-5 py-3">Query</th>
                    <th className="px-4 py-3 text-right">Clicks</th>
                    <th className="px-4 py-3 text-right">Impressions</th>
                    <th className="px-4 py-3 text-right">CTR</th>
                    <th className="px-5 py-3 text-right">Position</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-olive/10 text-olive">
                  {topQueries.map((item, idx) => (
                    <tr key={idx} className="hover:bg-cream/40 transition">
                      <td className="px-5 py-3 font-medium whitespace-nowrap overflow-hidden max-w-[200px] truncate">
                        {item.query}
                      </td>
                      <td className="px-4 py-3 text-right font-medium">{formatNumber(item.clicks)}</td>
                      <td className="px-4 py-3 text-right text-olive/70">{formatNumber(item.impressions)}</td>
                      <td className="px-4 py-3 text-right text-olive/70">{(item.ctr * 100).toFixed(1)}%</td>
                      <td className="px-5 py-3 text-right font-medium text-gold">{item.position.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Top Pages Table */}
        <div className="rounded-xl border border-olive/10 bg-paper shadow-sm overflow-hidden flex flex-col">
          <div className="border-b border-olive/10 bg-cream/35 px-5 py-4">
            <h2 className="font-display text-lg font-semibold text-olive">Top Pages</h2>
            <p className="text-xs text-olive/60">Landing pages receiving search traffic. Click link to edit in CMS.</p>
          </div>
          <div className="overflow-x-auto flex-1">
            {topPages.length === 0 ? (
              <p className="p-8 text-center text-sm text-olive/50 italic">No page traffic data available.</p>
            ) : (
              <table className="min-w-full text-left text-xs">
                <thead className="bg-ivory text-[10px] uppercase tracking-wider text-olive/70 font-semibold">
                  <tr>
                    <th className="px-5 py-3">Page Path</th>
                    <th className="px-4 py-3 text-right">Clicks</th>
                    <th className="px-4 py-3 text-right">Impressions</th>
                    <th className="px-4 py-3 text-right">CTR</th>
                    <th className="px-5 py-3 text-right">Position</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-olive/10 text-olive">
                  {topPages.map((item, idx) => (
                    <tr key={idx} className="hover:bg-cream/40 transition">
                      <td className="px-5 py-3 font-medium max-w-[220px] truncate">
                        {item.editLink ? (
                          <Link
                            href={item.editLink}
                            className="text-gold hover:underline font-semibold block truncate"
                            title="Edit page in CMS"
                          >
                            {item.path}
                          </Link>
                        ) : (
                          <span className="text-olive/75 truncate block" title={item.page}>
                            {item.path}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-medium">{formatNumber(item.clicks)}</td>
                      <td className="px-4 py-3 text-right text-olive/70">{formatNumber(item.impressions)}</td>
                      <td className="px-4 py-3 text-right text-olive/70">{(item.ctr * 100).toFixed(1)}%</td>
                      <td className="px-5 py-3 text-right font-medium text-gold">{item.position.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
