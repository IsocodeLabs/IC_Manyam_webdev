import React from "react";
import { createClient } from "@/lib/supabase/server";
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

  // 1. Fetch exact counts from the Supabase tables for KPI cards
  const [pagesRes, postsRes, leadsRes, packagesRes] = await Promise.all([
    supabase.from("pages").select("*", { count: "exact", head: true }),
    supabase.from("posts").select("*", { count: "exact", head: true }),
    supabase.from("leads").select("*", { count: "exact", head: true }),
    supabase.from("packages").select("*", { count: "exact", head: true }),
  ]);

  const totalPages = pagesRes.count || 0;
  const totalPosts = postsRes.count || 0;
  const totalLeads = leadsRes.count || 0;
  const totalPackages = packagesRes.count || 0;

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
