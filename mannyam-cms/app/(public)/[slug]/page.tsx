import React from "react";
import { notFound } from "next/navigation";
import { getPageBySlug, getPublishedPages } from "@/lib/data/public";
import { BlockRenderer, ContentBlock } from "@/components/public/blocks/BlockRenderer";
import { buildMetadata } from "@/lib/seo/buildMetadata";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const RESERVED_SLUGS = [
  "journeys",
  "experiences",
  "festivals",
  "destinations",
  "journal",
  "enquire",
  "login",
  "admin",
  "api",
  "dashboard",
  "leads",
  "packages",
  "pages-cms",
  "redirects",
  "seo",
  "settings",
  "auth",
];

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  if (RESERVED_SLUGS.includes(slug)) {
    return { title: "Page Not Found | MANNYAM" };
  }
  const page = await getPageBySlug(slug);

  if (!page) {
    return { title: "Page Not Found | MANNYAM" };
  }

  return buildMetadata({
    seoMeta: page.seo_meta,
    fallbackTitle: page.title,
    fallbackDescription: `Explore ${page.title} on MANNYAM.`,
    path: `/${slug}`,
  });
}

export async function generateStaticParams() {
  const pages = await getPublishedPages();
  return pages
    .filter((page) => !RESERVED_SLUGS.includes(page.slug))
    .map((page) => ({ slug: page.slug }));
}

export const revalidate = 3600; // Time-based ISR fallback

export default async function DynamicPage({ params }: PageProps) {
  const { slug } = await params;
  if (RESERVED_SLUGS.includes(slug)) {
    notFound();
  }
  const page = await getPageBySlug(slug);

  if (!page) {
    notFound();
  }

  // Parse the content blocks from the JSONB field
  const blocks: ContentBlock[] = Array.isArray(page.content)
    ? (page.content as unknown as ContentBlock[])
    : [];

  return (
    <article className="min-h-screen bg-ivory">
      {/* Page header (only for non-Landing pages that have no Hero block) */}
      {page.type !== "Landing" && (
        <header className="bg-cream/40 border-b border-olive/10 py-12 sm:py-16 px-6">
          <div className="max-w-4xl mx-auto text-center space-y-3">
            <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.3em] text-gold block">
              {page.type}
            </span>
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-olive tracking-tight leading-tight">
              {page.title}
            </h1>
          </div>
        </header>
      )}

      {/* Render all content blocks */}
      <BlockRenderer blocks={blocks} />
    </article>
  );
}
