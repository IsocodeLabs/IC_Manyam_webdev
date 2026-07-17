import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch profile to verify role
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = profile?.role || "Content Manager";

  const showUsers = role === "Admin";
  const showAnalytics = ["Admin", "Marketer"].includes(role);

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="border-b border-olive/10 pb-4">
        <h1 className="font-display text-3xl font-semibold text-olive">Settings Hub</h1>
        <p className="mt-1 text-sm text-olive/70">
          Configure application settings, roles, integrations, and operational parameters.
        </p>
      </div>

      {/* Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {showAnalytics && (
          <Link
            href="/settings/analytics"
            className="group rounded-xl border border-olive/10 bg-paper p-5 shadow-sm hover:border-gold transition duration-200 block space-y-2"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl group-hover:scale-110 transition-transform duration-200">📊</span>
              <h2 className="font-display text-lg font-semibold text-olive group-hover:text-gold transition">
                Analytics Integration
              </h2>
            </div>
            <p className="text-xs text-olive/60 leading-relaxed">
              Configure Google Analytics 4 and Tag Manager. Export snippets and verify event connection channels.
            </p>
          </Link>
        )}

        {showUsers && (
          <Link
            href="/settings/users"
            className="group rounded-xl border border-olive/10 bg-paper p-5 shadow-sm hover:border-gold transition duration-200 block space-y-2"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl group-hover:scale-110 transition-transform duration-200">👥</span>
              <h2 className="font-display text-lg font-semibold text-olive group-hover:text-gold transition">
                Users & Team
              </h2>
            </div>
            <p className="text-xs text-olive/60 leading-relaxed">
              Manage system access permissions, team invites, and edit roles for administrators and editors.
            </p>
          </Link>
        )}

        {!showAnalytics && !showUsers && (
          <div className="rounded-lg border border-gold/15 bg-cream/20 p-5 text-center text-xs text-olive/60 italic sm:col-span-2">
            No configuration options available for your current role.
          </div>
        )}
      </div>
    </div>
  );
}
