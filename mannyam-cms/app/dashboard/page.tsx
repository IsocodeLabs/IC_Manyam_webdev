import React from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getSearchConsoleData } from "@/lib/analytics/searchConsole";
import type { Database } from "@/types/database.types";

type Lead = Database["public"]["Tables"]["leads"]["Row"];

export default async function DashboardPage() {
  const supabase = await createClient();

  // Get authenticated user from Supabase Auth
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null; // Layout will handle the redirect
  }

  // Get user profile details
  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return null; // Layout will handle profile missing state
  }

  // Calculate start of current month
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  // 1. Fetch exact counts from the Supabase tables for KPI cards & summaries in parallel
  const [
    pagesRes,
    postsRes,
    leadsRes,
    packagesRes,
    ga4SettingsRes,
    postsPublishedThisMonthRes,
    pagesPublishedRes,
    leadsThisMonthRes,
  ] = await Promise.all([
    supabase.from("pages").select("*", { count: "exact", head: true }),
    supabase.from("posts").select("*", { count: "exact", head: true }),
    supabase.from("leads").select("*", { count: "exact", head: true }),
    supabase.from("packages").select("*", { count: "exact", head: true }),
    supabase.from("site_settings").select("value").eq("key", "ga4_measurement_id").limit(1),
    supabase.from("posts").select("*", { count: "exact", head: true }).eq("status", "Published").gte("published_at", startOfMonth),
    supabase.from("pages").select("*", { count: "exact", head: true }).eq("status", "Published"),
    supabase.from("leads").select("*", { count: "exact", head: true }).gte("created_at", startOfMonth),
  ]);

  const totalPages = pagesRes.count || 0;
  const totalPosts = postsRes.count || 0;
  const totalLeads = leadsRes.count || 0;
  const totalPackages = packagesRes.count || 0;

  const ga4Id = ga4SettingsRes.data?.[0]?.value || "";
  const postsPublishedThisMonth = postsPublishedThisMonthRes.count || 0;
  const pagesPublished = pagesPublishedRes.count || 0;
  const leadsThisMonth = leadsThisMonthRes.count || 0;

  // 2. Fetch GSC data if both GA4 & GSC are configured
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
  let topQuery = "—";
  let topPage = "—";

  if (gscData && gscData.rows.length > 0) {
    const queriesMap = new Map<string, number>();
    const pagesMap = new Map<string, number>();

    for (const row of gscData.rows) {
      if (row.query) {
        queriesMap.set(row.query, (queriesMap.get(row.query) || 0) + row.clicks);
      }
      if (row.page) {
        pagesMap.set(row.page, (pagesMap.get(row.page) || 0) + row.clicks);
      }
    }

    let maxQueryClicks = -1;
    for (const [q, clicks] of Array.from(queriesMap.entries())) {
      if (clicks > maxQueryClicks) {
        maxQueryClicks = clicks;
        topQuery = q;
      }
    }

    let maxPageClicks = -1;
    let rawTopPage = "";
    for (const [p, clicks] of Array.from(pagesMap.entries())) {
      if (clicks > maxPageClicks) {
        maxPageClicks = clicks;
        rawTopPage = p;
      }
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

  // 2. Fetch 5 most recent posts
  const { data: postsData } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);
  const recentPosts = postsData || [];

  // 3. Fetch 5 most recent leads (restricted to Admin and Marketer roles)
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

  return (
    <div className="space-y-8">
      <section>
        <h1 className="font-display text-3xl font-semibold text-olive">
          Welcome back, {profile.name}
        </h1>
        <p className="mt-1 font-sans text-sm text-olive/60">
          Here is the latest activity across MANNYAM Studio CMS.
        </p>
      </section>

      {/* Overview Cards (KPIs) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-paper p-6 rounded-lg shadow-sm border border-ivory/50">
          <p className="font-sans text-xs font-semibold text-olive/50 uppercase tracking-wider mb-1">
            Total Pages
          </p>
          <p className="font-display text-4xl text-gold font-semibold">
            {totalPages}
          </p>
        </div>

        <div className="bg-paper p-6 rounded-lg shadow-sm border border-ivory/50">
          <p className="font-sans text-xs font-semibold text-olive/50 uppercase tracking-wider mb-1">
            Total Posts
          </p>
          <p className="font-display text-4xl text-gold font-semibold">
            {totalPosts}
          </p>
        </div>

        <div className="bg-paper p-6 rounded-lg shadow-sm border border-ivory/50">
          <p className="font-sans text-xs font-semibold text-olive/50 uppercase tracking-wider mb-1">
            Total Leads
          </p>
          <p className="font-display text-4xl text-gold font-semibold">
            {totalLeads}
          </p>
        </div>

        <div className="bg-paper p-6 rounded-lg shadow-sm border border-ivory/50">
          <p className="font-sans text-xs font-semibold text-olive/50 uppercase tracking-wider mb-1">
            Total Packages
          </p>
          <p className="font-display text-4xl text-gold font-semibold">
            {totalPackages}
          </p>
        </div>
      </div>

      {/* Analytics Overview Section */}
      <div className="bg-paper p-6 rounded-lg shadow-sm border border-ivory/50">
        <h3 className="font-display text-lg font-semibold text-olive mb-4 flex items-center gap-2">
          <span>📈</span> Analytics Overview <span className="font-sans text-xs font-normal text-olive/50">(Last 7 Days)</span>
        </h3>

        {isAnalyticsConnected && gscData ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-cream/40 p-4 rounded-md border border-ivory/40">
              <span className="text-xs text-olive/50 font-medium">Total Clicks</span>
              <p className="font-display text-2xl font-semibold text-olive mt-1">
                {gscData.totals.clicks}
              </p>
            </div>
            <div className="bg-cream/40 p-4 rounded-md border border-ivory/40">
              <span className="text-xs text-olive/50 font-medium">Avg Position</span>
              <p className="font-display text-2xl font-semibold text-olive mt-1">
                {gscData.totals.position.toFixed(1)}
              </p>
            </div>
            <div className="bg-cream/40 p-4 rounded-md border border-ivory/40 overflow-hidden">
              <span className="text-xs text-olive/50 font-medium block">Top Search Query</span>
              <p className="font-sans text-sm font-semibold text-olive mt-1 truncate" title={topQuery}>
                {topQuery}
              </p>
            </div>
            <div className="bg-cream/40 p-4 rounded-md border border-ivory/40 overflow-hidden">
              <span className="text-xs text-olive/50 font-medium block">Top Performing Page</span>
              <p className="font-sans text-sm font-semibold text-olive mt-1 truncate" title={topPage}>
                {topPage}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-cream/40 p-6 rounded-lg border border-dashed border-olive/15 text-center sm:text-left">
            <div>
              <h4 className="font-display text-base font-semibold text-olive">Connect Analytics to see performance data</h4>
              <p className="font-sans text-xs text-olive/60 mt-1">Setup Google Search Console and GA4 to view site traffic here.</p>
            </div>
            <Link
              href="/settings/analytics"
              className="rounded-md bg-gold px-5 py-2.5 font-sans text-xs font-medium text-olive hover:bg-gold/90 transition whitespace-nowrap"
            >
              Go to Settings
            </Link>
          </div>
        )}
      </div>

      {/* Content Summary Section */}
      <div className="bg-paper p-6 rounded-lg shadow-sm border border-ivory/50">
        <h3 className="font-display text-lg font-semibold text-olive mb-4">
          📊 Content &amp; Leads Summary
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="space-y-1">
            <span className="text-xs text-olive/50 font-medium block">Posts published this month</span>
            <p className="font-display text-2xl font-bold text-olive">{postsPublishedThisMonth}</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-olive/50 font-medium block">Pages published</span>
            <p className="font-display text-2xl font-bold text-olive">{pagesPublished}</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-olive/50 font-medium block">New leads this month</span>
            <p className="font-display text-2xl font-bold text-olive">{leadsThisMonth}</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-olive/50 font-medium block">Packages available</span>
            <p className="font-display text-2xl font-bold text-olive">{totalPackages}</p>
          </div>
        </div>
      </div>

      {/* Details Lists (Recent Posts & Recent Leads side-by-side) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Recent Posts Panel */}
        <div className="bg-paper p-6 rounded-lg shadow-sm border border-ivory/50 flex flex-col">
          <div className="border-b border-ivory/50 pb-4 mb-4 flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold text-olive">
              Recent Journal Posts
            </h3>
            <span className="text-[10px] font-sans text-olive/40 uppercase tracking-wider">
              Updated List
            </span>
          </div>

          <div className="flex-1 space-y-4">
            {recentPosts.length === 0 ? (
              <p className="text-sm font-sans text-olive/40 py-6 text-center">
                No articles created yet.
              </p>
            ) : (
              recentPosts.map((post) => (
                <div
                  key={post.id}
                  className="flex items-center justify-between border-b border-cream/50 pb-3 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="font-sans text-sm font-medium text-olive/80">
                      {post.title}
                    </p>
                    <p className="font-sans text-[10px] text-olive/40 mt-0.5">
                      /{post.slug}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold font-sans tracking-wide ${
                      post.status === "Published"
                        ? "bg-[#e8f4ec] text-[#3f7d4e]"
                        : post.status === "Scheduled"
                        ? "bg-amber-50 text-amber-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {post.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Leads Panel (Conditional display based on Role) */}
        {isAuthorisedForLeads ? (
          <div className="bg-paper p-6 rounded-lg shadow-sm border border-ivory/50 flex flex-col">
            <div className="border-b border-ivory/50 pb-4 mb-4 flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold text-olive">
                Recent Leads & Enquiries
              </h3>
              <span className="text-[10px] font-sans text-olive/40 uppercase tracking-wider">
                New submissions
              </span>
            </div>

            <div className="flex-1">
              {recentLeads.length === 0 ? (
                <p className="text-sm font-sans text-olive/40 py-6 text-center">
                  No leads submitted yet.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left font-sans text-xs">
                    <thead>
                      <tr className="border-b border-ivory/80 text-olive/40 font-semibold">
                        <th className="pb-2">Name</th>
                        <th className="pb-2">Source</th>
                        <th className="pb-2">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-cream/50">
                      {recentLeads.map((lead) => (
                        <tr key={lead.id} className="text-olive/80">
                          <td className="py-2.5">
                            <div>
                              <p className="font-medium">{lead.name}</p>
                              <p className="text-[10px] text-olive/40">
                                {lead.email}
                              </p>
                            </div>
                          </td>
                          <td className="py-2.5 text-olive/60">{lead.source}</td>
                          <td className="py-2.5">
                            <span
                              className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                                lead.status === "New"
                                  ? "bg-blue-50 text-blue-700"
                                  : lead.status === "Won"
                                  ? "bg-green-50 text-green-700"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {lead.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-cream/40 p-6 rounded-lg border border-dashed border-ivory/80 flex flex-col justify-center items-center text-center">
            <svg
              className="w-10 h-10 text-olive/35 mb-2"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
              />
            </svg>
            <h3 className="font-display text-base font-semibold text-olive/80">
              Leads Restricted
            </h3>
            <p className="font-sans text-xs text-olive/50 max-w-xs mt-1">
              Your account role does not have authorisation to view leads data.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
