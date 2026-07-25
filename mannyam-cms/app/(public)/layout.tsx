import React from "react";
import { HeaderWrapper } from "@/components/public/HeaderWrapper";
import { Footer } from "@/components/public/Footer";
import { ChatWidget } from "@/components/public/ChatWidget";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-ivory text-ink selection:bg-gold/20 font-sans antialiased overflow-x-hidden">
      <HeaderWrapper />
      <main className="flex-grow overflow-x-hidden">
        {children}
      </main>
      <Footer />
      <ChatWidget />
    </div>
  );
}
