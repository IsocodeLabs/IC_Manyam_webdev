import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Post } from "@/lib/data/public";
import { Badge } from "./Badge";

interface PostCardProps {
  post: Post & {
    categories?: {
      name: string;
      slug: string;
    } | null;
  };
  className?: string;
}

function getExcerpt(htmlContent: string | null): string {
  if (!htmlContent) return "";
  const stripped = htmlContent.replace(/<[^>]*>/g, "");
  const trimmed = stripped.trim().replace(/\s+/g, " ");
  if (trimmed.length <= 160) return trimmed;
  return trimmed.slice(0, 160) + "...";
}

export function PostCard({ post, className = "" }: PostCardProps) {
  const categoryName = post.categories && !Array.isArray(post.categories)
    ? post.categories.name
    : "Travelogue";

  const seoMeta = (post.seo_meta as Record<string, string | null | undefined>) || {};
  const featuredImage = seoMeta.og_image || seoMeta.featuredImageUrl || "";

  const formattedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Recently Published";

  return (
    <article
      className={`bg-cream/15 border border-olive/5 hover:border-gold/20 rounded-sm overflow-hidden flex flex-col group hover:shadow-xl hover:shadow-olive/5 transition-all duration-500 ${className}`}
    >
      {/* Post Image Container */}
      <div className="aspect-[16/9] bg-olive/5 relative overflow-hidden">
        {featuredImage ? (
          <Image
            src={featuredImage}
            alt={post.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-olive/20 font-display italic text-base bg-olive/5">
            Travel dispatch
          </div>
        )}
        <div className="absolute top-4 left-4">
          <Badge variant="gray" className="bg-ink/80 text-ivory border-transparent">
            {categoryName}
          </Badge>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-8 flex flex-col flex-grow justify-between space-y-6">
        <div className="space-y-3">
          <div className="text-[10px] text-olive/45 font-semibold uppercase tracking-wider">
            {formattedDate}
          </div>
          <h2 className="font-display text-2xl font-bold text-olive group-hover:text-gold transition-colors duration-300">
            {post.title}
          </h2>
          <p className="font-sans text-xs text-olive/75 leading-relaxed font-light line-clamp-3">
            {getExcerpt(post.content)}
          </p>
        </div>
        
        <div className="pt-2">
          <Link
            href={`/journal/${post.slug}`}
            className="font-sans text-[11px] font-bold uppercase tracking-wider text-gold hover:text-olive transition-colors flex items-center gap-1.5"
          >
            Read Story <span className="transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
