import type { Metadata } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import { GoogleTranslate } from "@/components/public/GoogleTranslate";
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
    icon: [
      { url: "/logo-icon.png", type: "image/png" }
    ],
    apple: "/logo-icon.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-GB" className={`${cormorantGaramond.variable} ${jost.variable}`}>
      <body className="font-sans bg-bg text-ink min-h-screen antialiased overflow-x-hidden">
        <GoogleTranslate />
        {children}
      </body>
    </html>
  );
}
