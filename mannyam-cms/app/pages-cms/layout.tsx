import React from "react";
import { headers } from "next/headers";
import { AdminShell } from "@/components/layout/AdminShell";

export default async function PagesCmsLayout({ children }: { children: React.ReactNode }) {
  const headerList = await headers();
  const pathname = headerList.get("x-pathname") || "/pages-cms";
  return <AdminShell pathname={pathname}>{children}</AdminShell>;
}
