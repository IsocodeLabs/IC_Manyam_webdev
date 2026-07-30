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
  if (path.startsWith("/dashboard/journal")) return "Journal";
  if (path.startsWith("/dashboard/bookings")) return "Bookings";
  if (path.startsWith("/dashboard/discounts")) return "Discounts";
  if (path.startsWith("/dashboard")) return "Overview";
  if (path.startsWith("/pages-cms")) return "Pages";
  if (path.startsWith("/packages")) return "Packages";
  if (path.startsWith("/media")) return "Media library";
  if (path.startsWith("/seo")) return "SEO and technical";
  if (path.startsWith("/redirects")) return "Redirects";
  if (path.startsWith("/clusters")) return "Clusters";
  if (path.startsWith("/analytics")) return "Analytics";
  if (path.startsWith("/leads")) return "Leads inbox";
  if (path.startsWith("/settings")) return "Settings";
  return "MANNYAM Studio";
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
      <main className="flex min-h-screen items-center justify-center p-6" style={{ background: "var(--bg)" }}>
        <section className="w-full max-w-lg rounded-[16px] border bg-paper p-8 text-center" style={{ borderColor: "var(--line)" }}>
          <p className="eyebrow">MANNYAM Studio CMS</p>
          <h1 className="mt-3 font-display text-3xl font-semibold text-olive">
            Account profile unavailable
          </h1>
          <p className="mt-3 font-sans text-sm leading-6 text-[#6f7261]">
            Your sign-in is valid, but no CMS profile is linked to this account.
            Ask an administrator to check your user record before trying again.
          </p>
          <form action="/api/logout" method="POST" className="mt-6">
            <button
              type="submit"
              className="btn btn-primary"
            >
              Sign Out
            </button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <div className="flex min-h-screen" style={{ background: "var(--bg)" }}>
      <Sidebar role={profile.role} userName={profile.name} />
      <div className="flex min-h-screen flex-1 flex-col pl-[250px]">
        <TopBar
          title={getPageTitle(pathname)}
          userName={profile.name}
          role={profile.role}
        />
        <main className="flex-1 overflow-y-auto">
          <div className="px-[22px] py-[22px] max-w-[1180px] w-full mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
