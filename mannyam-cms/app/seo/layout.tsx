import React from "react";
import { headers } from "next/headers";
import { AdminShell } from "@/components/layout/AdminShell";

export default async function SeoLayout({ children }: { children: React.ReactNode }) {
  const headerList = await headers();
  const pathname = headerList.get("x-pathname") || "/seo";
  return <AdminShell pathname={pathname}>{children}</AdminShell>;
}
