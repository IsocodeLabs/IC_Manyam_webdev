import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";

interface AdminShellProps {
  children: React.ReactNode;
  pathname: string;
}

function getPageTitle(path: string) {
  if (path.startsWith("/dashboard")) return "Dashboard Overview";
  if (path.startsWith("/journal")) return "Journal CMS";
  if (path.startsWith("/pages-cms")) return "Pages Manager";
  if (path.startsWith("/packages")) return "Travel Packages";
  if (path.startsWith("/media")) return "Media Library";
  if (path.startsWith("/seo")) return "SEO Settings";
  if (path.startsWith("/redirects")) return "Redirection Paths";
  if (path.startsWith("/clusters")) return "SEO Clusters Mapping";
  if (path.startsWith("/analytics")) return "System Analytics";
  if (path.startsWith("/leads")) return "Submitted Leads";
  if (path.startsWith("/settings")) return "Settings Panel";
  return "Control Panel";
}

export async function AdminShell({ children, pathname }: AdminShellProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("name, role")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-cream p-6">
        <section className="w-full max-w-lg rounded-lg border border-ivory bg-paper p-8 text-center shadow-sm">
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-gold">
            MANNYAM Studio CMS
          </p>
          <h1 className="mt-3 font-display text-3xl font-semibold text-olive">
            Account profile unavailable
          </h1>
          <p className="mt-3 font-sans text-sm leading-6 text-olive/70">
            Your sign-in is valid, but no CMS profile is linked to this account.
            Ask an administrator to check your user record before trying again.
          </p>
          <form action="/api/logout" method="POST" className="mt-6">
            <button
              type="submit"
              className="rounded-md bg-olive px-5 py-2.5 font-sans text-sm font-medium text-paper transition-colors hover:bg-gold hover:text-olive"
            >
              Sign Out
            </button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <div className="flex min-h-screen bg-cream text-olive">
      <Sidebar role={profile.role} userName={profile.name} />
      <div className="flex min-h-screen flex-1 flex-col pl-[240px]">
        <TopBar
          title={getPageTitle(pathname)}
          userName={profile.name}
          role={profile.role}
        />
        <main className="mx-auto w-full max-w-7xl flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
