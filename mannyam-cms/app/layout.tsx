import type { Metadata } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import { headers } from "next/headers";
import { AdminShell } from "@/components/layout/AdminShell";
import "./globals.css";

const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant-garamond",
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const jost = Jost({
  subsets: ["latin"],
  variable: "--font-jost",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "MANNYAM Studio CMS",
  description: "Custom admin panel for MANNYAM Studio, supporting content categorisation and custom layouts.",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

const protectedSiblingRoutes = [
  "/pages-cms",
  "/packages",
  "/media",
  "/seo",
  "/redirects",
  "/clusters",
  "/analytics",
  "/leads",
  "/settings",
];

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headerList = await headers();
  const pathname = headerList.get("x-pathname") || "/";
  const needsAdminShell = protectedSiblingRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
  const content = needsAdminShell ? (
    <AdminShell pathname={pathname}>{children}</AdminShell>
  ) : (
    children
  );

  return (
    <html lang="en-GB" className={`${cormorantGaramond.variable} ${jost.variable}`}>
      <body className="font-sans bg-cream text-olive min-h-screen antialiased">
        {content}
      </body>
    </html>
  );
}
