import React from "react";
import { headers } from "next/headers";
import { AdminShell } from "@/components/layout/AdminShell";

export default async function LeadsLayout({ children }: { children: React.ReactNode }) {
  const headerList = await headers();
  const pathname = headerList.get("x-pathname") || "/leads";
  return <AdminShell pathname={pathname}>{children}</AdminShell>;
}
