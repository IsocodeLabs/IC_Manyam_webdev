import React from "react";
import Link from "next/link";
import {
  Inbox,
  CircleDot,
  CheckCircle2,
  Link2,
  TrendingUp,
  Plus,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getSearchConsoleData } from "@/lib/analytics/searchConsole";
import type { Database } from "@/types/database.types";

type Lead = Database["public"]["Tables"]["leads"]["Row"];

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) return null;

  // Calculate start of current month
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  // Fetch counts in parallel
  const [
    pagesRes,
    postsRes,
    leadsRes,
    packagesRes,
    ga4SettingsRes,
    postsPublishedThisMonthRes,
    pagesPublishedRes,
    leadsThisMonthRes,
    newLeadsRes,
    wonLeadsRes,
  ] = await Promise.all([
    supabase.from("pages").select("*", { count: "exact", head: true }),
    supabase.from("posts").select("*", { count: "exact", head: true }),
    supabase.from("leads").select("*", { count: "exact", head: true }),
    supabase.from("packages").select("*", { count: "exact", head: true }),
    supabase.from("site_settings").select("value").eq("key", "ga4_measurement_id").limit(1),
    supabase.from("posts").select("*", { count: "exact", head: true }).eq("status", "Published").gte("published_at", startOfMonth),
    supabase.from("pages").select("*", { count: "exact", head: true }).eq("status", "Published"),
    supabase.from("leads").select("*", { count: "exact", head: true }).gte("created_at", startOfMonth),
    supabase.from("leads").select("*", { count: "exact", head: true }).eq("status", "New"),
    supabase.from("leads").select("*", { count: "exact", head: true }).eq("status", "Won"),
  ]);

  const totalPages = pagesRes.count || 0;
  const totalPosts = postsRes.count || 0;
  const totalLeads = leadsRes.count || 0;
  const totalPackages = packagesRes.count || 0;
  const postsPublishedThisMonth = postsPublishedThisMonthRes.count || 0;
  const pagesPublished = pagesPublishedRes.count || 0;
  const leadsThisMonth = leadsThisMonthRes.count || 0;
  const newLeads = newLeadsRes.count || 0;
  const wonLeads = wonLeadsRes.count || 0;

  const ga4Id = ga4SettingsRes.data?.[0]?.value || "";
  const gscEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const gscPrivateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
  const gscSiteUrl = process.env.GSC_SITE_URL || "";
  const isGscConfigured = !!(gscEmail && gscPrivateKey && gscSiteUrl);
  const isAnalyticsConnected = !!(ga4Id && isGscConfigured);

  let gscData = null;
  if (isAnalyticsConnected) {
    try {
      gscData = await getSearchConsoleData("7d");
    } catch (err) {
      console.error("Dashboard failed to fetch Search Console data:", err);
    }
  }

  // Parse GSC top values
  let topQuery = "\u2014";
  let topPage = "\u2014";

  if (gscData && gscData.rows.length > 0) {
    const queriesMap = new Map<string, number>();
    const pagesMap = new Map<string, number>();

    for (const row of gscData.rows) {
      if (row.query) queriesMap.set(row.query, (queriesMap.get(row.query) || 0) + row.clicks);
      if (row.page) pagesMap.set(row.page, (pagesMap.get(row.page) || 0) + row.clicks);
    }

    let maxQueryClicks = -1;
    for (const [q, clicks] of Array.from(queriesMap.entries())) {
      if (clicks > maxQueryClicks) { maxQueryClicks = clicks; topQuery = q; }
    }

    let maxPageClicks = -1;
    let rawTopPage = "";
    for (const [p, clicks] of Array.from(pagesMap.entries())) {
      if (clicks > maxPageClicks) { maxPageClicks = clicks; rawTopPage = p; }
    }

    if (rawTopPage) {
      try {
        const parsed = new URL(rawTopPage);
        topPage = parsed.pathname;
      } catch {
        const domain = gscSiteUrl.replace(/^sc-domain:/, "").replace(/^https?:\/\//, "");
        topPage = rawTopPage.replace(new RegExp(`^(https?:\\/\\/)?(www\\.)?${domain}`), "");
      }
      if (!topPage.startsWith("/")) topPage = "/" + topPage;
      if (topPage.length > 1 && topPage.endsWith("/")) topPage = topPage.slice(0, -1);
    }
  }

  // Fetch recent posts and leads
  const { data: postsData } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);
  const recentPosts = postsData || [];

  const isAuthorisedForLeads = profile.role === "Admin" || profile.role === "Marketer";
  let recentLeads: Lead[] = [];
  if (isAuthorisedForLeads) {
    const { data: leadsData } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5);
    recentLeads = leadsData || [];
  }

  // Conversion rate
  const convRate = totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 100) : 0;

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex items-end justify-between gap-4 flex-wrap mb-[18px]">
        <div>
          <p className="text-[11px] tracking-[0.02em] text-[#8b8d76] mb-[5px]">Workspace</p>
          <h1 className="font-display text-[30px] font-semibold text-ink leading-[1.12]">
            Good day, {profile.name}. Here is your growth at a glance.
          </h1>
        </div>
        <div className="flex gap-[9px]">
          <Link
            href="/leads"
            className="btn flex items-center gap-[7px]"
          >
            <Inbox className="w-[15px] h-[15px]" />
            View leads
          </Link>
          <Link
            href="/dashboard/journal/new"
            className="btn btn-primary flex items-center gap-[7px]"
          >
            <Plus className="w-[15px] h-[15px]" />
            New journal post
          </Link>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-[14px]">
        <div className="kpi-card">
          <div className="flex items-center gap-[7px] text-[11px] tracking-[0.04em] text-[#6f7261]">
            <Inbox className="w-[14px] h-[14px] text-gold-deep" />
            Total enquiries
          </div>
          <p className="font-display font-semibold text-[34px] mt-[6px] leading-none text-ink">
            {totalLeads}
          </p>
          <p className="text-[11px] mt-[7px] flex items-center gap-[5px] text-ok">
            <TrendingUp className="w-3 h-3" />
            {leadsThisMonth} this month
          </p>
        </div>

        <div className="kpi-card">
          <div className="flex items-center gap-[7px] text-[11px] tracking-[0.04em] text-[#6f7261]">
            <CircleDot className="w-[14px] h-[14px] text-gold-deep" />
            New, awaiting reply
          </div>
          <p className="font-display font-semibold text-[34px] mt-[6px] leading-none text-ink">
            {newLeads}
          </p>
          <p className="text-[11px] mt-[7px] flex items-center gap-[5px] text-ok">
            <TrendingUp className="w-3 h-3" />
            {newLeads} to action today
          </p>
        </div>

        <div className="kpi-card">
          <div className="flex items-center gap-[7px] text-[11px] tracking-[0.04em] text-[#6f7261]">
            <CheckCircle2 className="w-[14px] h-[14px] text-gold-deep" />
            Won this quarter
          </div>
          <p className="font-display font-semibold text-[34px] mt-[6px] leading-none text-ink">
            {wonLeads}
          </p>
          <p className="text-[11px] mt-[7px] flex items-center gap-[5px] text-ok">
            <TrendingUp className="w-3 h-3" />
            {convRate}% conversion
          </p>
        </div>

        <div className="kpi-card">
          <div className="flex items-center gap-[7px] text-[11px] tracking-[0.04em] text-[#6f7261]">
            <Link2 className="w-[14px] h-[14px] text-gold-deep" />
            Published pages
          </div>
          <p className="font-display font-semibold text-[34px] mt-[6px] leading-none text-ink">
            {pagesPublished}
          </p>
          <p className="text-[11px] mt-[7px] flex items-center gap-[5px] text-ok">
            <TrendingUp className="w-3 h-3" />
            {postsPublishedThisMonth} posts this month
          </p>
        </div>
      </div>

      {/* Two-column grid: Analytics + content summary */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-4 mt-4">
        {/* Analytics panel */}
        <div className="panel">
          <div className="flex items-center justify-between mb-[14px]">
            <h3 className="font-display text-[18px] font-semibold text-ink">
              Analytics overview
            </h3>
            <Link href="/analytics" className="text-[11.5px] text-gold-deep hover:underline">
              Full analytics
            </Link>
          </div>

          {isAnalyticsConnected && gscData ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-cream rounded-[9px] border border-line-2 p-3">
                <span className="text-[10.5px] text-[#8b8d76] font-medium">Total clicks</span>
                <p className="font-display text-[22px] font-semibold text-ink mt-1">
                  {gscData.totals.clicks.toLocaleString()}
                </p>
              </div>
              <div className="bg-cream rounded-[9px] border border-line-2 p-3">
                <span className="text-[10.5px] text-[#8b8d76] font-medium">Avg position</span>
                <p className="font-display text-[22px] font-semibold text-ink mt-1">
                  {gscData.totals.position.toFixed(1)}
                </p>
              </div>
              <div className="bg-cream rounded-[9px] border border-line-2 p-3 overflow-hidden">
                <span className="text-[10.5px] text-[#8b8d76] font-medium block">Top query</span>
                <p className="font-sans text-[13px] font-medium text-ink mt-1 truncate" title={topQuery}>
                  {topQuery}
                </p>
              </div>
              <div className="bg-cream rounded-[9px] border border-line-2 p-3 overflow-hidden">
                <span className="text-[10.5px] text-[#8b8d76] font-medium block">Top page</span>
                <p className="font-mono text-[12px] text-info mt-1 truncate" title={topPage}>
                  {topPage}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center bg-cream rounded-[11px] border border-dashed border-line-gold">
              <p className="font-display text-[15px] font-semibold text-ink">
                Connect analytics to see performance data
              </p>
              <p className="text-[12px] text-[#6f7261] mt-1">
                Set up Google Search Console and GA4 in Settings to see traffic here.
              </p>
              <Link href="/settings" className="btn btn-primary mt-4">
                Go to Settings
              </Link>
            </div>
          )}
        </div>

        {/* Content summary panel */}
        <div className="panel">
          <div className="flex items-center justify-between mb-[14px]">
            <h3 className="font-display text-[18px] font-semibold text-ink">
              Content at a glance
            </h3>
          </div>
          <div className="space-y-[9px]">
            <div className="flex items-center justify-between text-[12.5px]">
              <span className="text-[#6f7261]">Pages published</span>
              <span className="font-medium text-ink">{pagesPublished}</span>
            </div>
            <div className="flex items-center justify-between text-[12.5px]">
              <span className="text-[#6f7261]">Journal posts</span>
              <span className="font-medium text-ink">{totalPosts}</span>
            </div>
            <div className="flex items-center justify-between text-[12.5px]">
              <span className="text-[#6f7261]">Posts this month</span>
              <span className="font-medium text-ink">{postsPublishedThisMonth}</span>
            </div>
            <div className="flex items-center justify-between text-[12.5px]">
              <span className="text-[#6f7261]">Packages available</span>
              <span className="font-medium text-ink">{totalPackages}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom grid: Recent posts + Recent leads */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        {/* Recent posts */}
        <div className="panel">
          <div className="flex items-center justify-between mb-[14px]">
            <h3 className="font-display text-[18px] font-semibold text-ink">
              Recent journal posts
            </h3>
            <Link href="/dashboard/journal" className="text-[11.5px] text-gold-deep hover:underline">
              See all
            </Link>
          </div>

          {recentPosts.length === 0 ? (
            <p className="text-[13px] text-[#8b8d76] py-6 text-center">
              No articles created yet.
            </p>
          ) : (
            <table className="w-full border-collapse text-[13px]">
              <tbody>
                {recentPosts.map((post) => (
                  <tr
                    key={post.id}
                    className="border-b border-line-2 last:border-0 hover:bg-cream transition-[0.12s]"
                  >
                    <td className="py-3 pr-3">
                      <div className="font-medium text-ink">{post.title}</div>
                      <div className="text-[11.5px] text-[#8b8d76]">
                        /journal/{post.slug}
                      </div>
                    </td>
                    <td className="py-3 text-right">
                      <span
                        className={`pill ${
                          post.status === "Published"
                            ? "pill-published"
                            : post.status === "Scheduled"
                            ? "pill-scheduled"
                            : "pill-draft"
                        }`}
                      >
                        <span className="dot" />
                        {post.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Recent leads */}
        {isAuthorisedForLeads ? (
          <div className="panel">
            <div className="flex items-center justify-between mb-[14px]">
              <h3 className="font-display text-[18px] font-semibold text-ink">
                Recent enquiries
              </h3>
              <Link href="/leads" className="text-[11.5px] text-gold-deep hover:underline">
                See all
              </Link>
            </div>

            {recentLeads.length === 0 ? (
              <p className="text-[13px] text-[#8b8d76] py-6 text-center">
                No leads submitted yet.
              </p>
            ) : (
              <table className="w-full border-collapse text-[13px]">
                <tbody>
                  {recentLeads.map((lead) => (
                    <tr
                      key={lead.id}
                      className="border-b border-line-2 last:border-0 hover:bg-cream transition-[0.12s] cursor-pointer"
                    >
                      <td className="py-3 pr-3">
                        <div className="font-medium text-ink">{lead.name}</div>
                        <div className="text-[11.5px] text-[#8b8d76]">
                          {lead.source} &middot;{" "}
                          <span className="font-mono text-info">{lead.source_page}</span>
                        </div>
                      </td>
                      <td className="py-3 text-right">
                        <span
                          className={`pill ${
                            lead.status === "New"
                              ? "pill-new"
                              : lead.status === "Won"
                              ? "pill-won"
                              : lead.status === "Contacted"
                              ? "pill-contacted"
                              : lead.status === "Proposal"
                              ? "pill-proposal"
                              : lead.status === "Lost"
                              ? "pill-lost"
                              : "pill-draft"
                          }`}
                        >
                          <span className="dot" />
                          {lead.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ) : (
          <div className="panel flex flex-col items-center justify-center py-10 text-center">
            <svg className="w-[34px] h-[34px] text-[rgba(186,136,56,0.5)] mb-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <rect x="5" y="11" width="14" height="9" rx="2" />
              <path d="M8 11V8a4 4 0 0 1 8 0v3" />
            </svg>
            <h3 className="font-display text-[15px] font-semibold text-ink">
              Not available for the {profile.role} role
            </h3>
            <p className="text-[12px] text-[#6f7261] mt-1 max-w-[280px]">
              Switch to an Admin or Marketer account to view lead data.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
