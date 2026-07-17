import Link from "next/link";
import { notFound } from "next/navigation";
import DOMPurify from "isomorphic-dompurify";
import { getPostBySlug, getPublishedPosts, getRelatedPosts } from "@/lib/data/public";
import { generateArticleSchema } from "@/lib/seo/generateJsonLd";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/buildMetadata";

export const revalidate = 3600; // Time-based ISR fallback

type PageProps = {
  params: Promise<{ slug: string }>;
};

type SeoMeta = {
  title?: string;
  description?: string;
  canonical_url?: string;
  og_title?: string;
  og_description?: string;
  og_image?: string;
  featuredImageUrl?: string;
};

type TagRelation = {
  tags: {
    name: string;
  } | {
    name: string;
  }[] | null;
};

function getReadingTime(htmlContent: string | null): number {
  if (!htmlContent) return 1;
  const stripped = htmlContent.replace(/<[^>]*>/g, "");
  const wordCount = stripped.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / 200));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const post = await getPostBySlug(resolvedParams.slug);
  if (!post) return {};

  const seoMeta = (post.seo_meta as SeoMeta) || {};
  const featuredImage = seoMeta.og_image || seoMeta.featuredImageUrl || "";

  return buildMetadata({
    seoMeta,
    fallbackTitle: `${post.title} | MANNYAM Journal`,
    fallbackDescription: post.content ? post.content.replace(/<[^>]*>/g, "") : "",
    fallbackImage: featuredImage,
    path: `/journal/${post.slug}`,
    type: "article",
  });
}

export async function generateStaticParams() {
  const posts = await getPublishedPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function JournalPostPage({ params }: PageProps) {
  const resolvedParams = await params;
  const post = await getPostBySlug(resolvedParams.slug);

  if (!post) {
    notFound();
  }

  const categoryName = post.categories && !Array.isArray(post.categories)
    ? (post.categories as { name: string }).name
    : "Travelogue";

  const categoryId = post.category_id || "";

  const [relatedPosts, cleanHtml] = await Promise.all([
    categoryId ? getRelatedPosts(post.id, categoryId, 3) : Promise.resolve([]),
    DOMPurify.sanitize(post.content || ""),
  ]);

  const readingTime = getReadingTime(post.content);

  const formattedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Recently Published";

  const seoMeta = (post.seo_meta as SeoMeta) || {};
  const featuredImage = seoMeta.og_image || seoMeta.featuredImageUrl || "";

  // Extract tags robustly
  const tagsList: string[] = [];
  if (post.post_tags) {
    const rawTags = post.post_tags as unknown as TagRelation[] | TagRelation | null;
    const links = Array.isArray(rawTags) ? rawTags : rawTags ? [rawTags] : [];
    for (const link of links) {
      if (link.tags) {
        if (Array.isArray(link.tags)) {
          for (const t of link.tags) {
            if (t && t.name) tagsList.push(t.name);
          }
        } else if (link.tags.name) {
          tagsList.push(link.tags.name);
        }
      }
    }
  }

  // Generate JSON-LD schema
  const articleJsonLd = generateArticleSchema(post as unknown as Parameters<typeof generateArticleSchema>[0]);

  return (
    <div className="bg-ivory min-h-screen font-sans pb-24 text-ink">
      {/* Inject JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      <article className="max-w-4xl mx-auto px-6 pt-12 space-y-10">
        
        {/* Breadcrumb and Category Badge */}
        <div className="flex items-center gap-3 text-xs">
          <Link href="/journal" className="text-olive/50 hover:text-gold transition-colors font-light">
            Journal
          </Link>
          <span className="text-olive/20">&bull;</span>
          {post.category_id && post.categories && !Array.isArray(post.categories) ? (
            <Link
              href={`/journal/category/${(post.categories as { slug: string }).slug}`}
              className="bg-gold/10 text-gold px-2.5 py-1 rounded-sm uppercase tracking-wider font-bold text-[9px]"
            >
              {categoryName}
            </Link>
          ) : (
            <span className="bg-gold/10 text-gold px-2.5 py-1 rounded-sm uppercase tracking-wider font-bold text-[9px]">
              {categoryName}
            </span>
          )}
        </div>

        {/* Heading & Meta details */}
        <div className="space-y-6">
          <h1 className="font-display text-3xl sm:text-5xl font-bold text-olive leading-tight tracking-tight">
            {post.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-6 text-xs text-olive/55 font-light pt-2 border-y border-olive/10 py-4">
            <div>
              Published: <time className="font-semibold text-olive/80">{formattedDate}</time>
            </div>
            <span className="hidden sm:inline text-olive/20">|</span>
            <div>
              Reading time: <span className="font-semibold text-olive/80">{readingTime} min read</span>
            </div>
          </div>
        </div>

        {/* Featured Image */}
        {featuredImage && (
          <div className="aspect-[21/9] bg-olive/5 relative overflow-hidden rounded-sm border border-olive/10">
            <img
              src={featuredImage}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Article Body */}
        <main
          className="prose prose-olive max-w-none text-olive/85 leading-relaxed font-sans text-base sm:text-lg font-light pt-4
            prose-headings:font-display prose-headings:text-olive prose-headings:font-bold
            prose-p:mb-6 prose-a:text-gold prose-a:underline hover:prose-a:text-olive prose-a:transition-colors
            prose-strong:font-bold prose-strong:text-olive
            prose-img:rounded-sm prose-img:border prose-img:border-olive/10"
          dangerouslySetInnerHTML={{ __html: cleanHtml }}
        />

        {/* Tags */}
        {tagsList.length > 0 && (
          <div className="pt-8 border-t border-olive/10 space-y-3">
            <h4 className="text-[10px] uppercase tracking-wider font-bold text-olive/50">Tags</h4>
            <div className="flex flex-wrap gap-2">
              {tagsList.map((tag, idx) => (
                <Link
                  key={idx}
                  href="/journal"
                  className="px-3 py-1.5 bg-cream/30 hover:bg-gold/15 text-olive/75 hover:text-gold text-[10px] font-semibold uppercase tracking-wider rounded-sm transition-all border border-olive/10 hover:border-gold/30"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          </div>
        )}

      </article>

      {/* Related Posts Section */}
      {relatedPosts.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 mt-24 pt-16 border-t border-olive/15">
          <div className="space-y-2 mb-12">
            <span className="font-sans text-[10px] font-bold uppercase tracking-[0.25em] text-gold block">
              Related Chronicles
            </span>
            <h3 className="font-display text-2xl sm:text-3xl font-bold text-olive">
              Recommended Reading
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {relatedPosts.map((rPost) => {
              const rCategoryName = rPost.categories && !Array.isArray(rPost.categories)
                ? (rPost.categories as { name: string }).name
                : categoryName;

              const rSeoMeta = (rPost.seo_meta as SeoMeta) || {};
              const rFeaturedImage = rSeoMeta.og_image || rSeoMeta.featuredImageUrl || "";

              const rFormattedDate = rPost.published_at
                ? new Date(rPost.published_at).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : "Recently Published";

              return (
                <article
                  key={rPost.id}
                  className="bg-cream/15 border border-olive/5 hover:border-gold/20 rounded-sm overflow-hidden flex flex-col group hover:shadow-lg hover:shadow-olive/5 transition-all duration-300"
                >
                  <div className="aspect-[16/10] bg-olive/5 relative overflow-hidden">
                    {rFeaturedImage ? (
                      <img
                        src={rFeaturedImage}
                        alt={rPost.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-olive/20 font-display italic text-base bg-olive/5">
                        No Image Available
                      </div>
                    )}
                    <span className="absolute top-3 left-3 bg-ink/80 text-ivory text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 backdrop-blur-sm rounded-sm">
                      {rCategoryName}
                    </span>
                  </div>

                  <div className="p-6 flex flex-col flex-grow justify-between space-y-4">
                    <div className="space-y-2">
                      <time className="text-[9px] text-olive/40 font-semibold uppercase tracking-wider block">
                        {rFormattedDate}
                      </time>
                      <h4 className="font-display text-lg font-bold text-olive group-hover:text-gold transition-colors duration-300 line-clamp-2">
                        {rPost.title}
                      </h4>
                    </div>
                    <div>
                      <Link
                        href={`/journal/${rPost.slug}`}
                        className="font-sans text-[10px] font-bold uppercase tracking-wider text-gold hover:text-olive transition-colors flex items-center gap-1.5"
                      >
                        Read Story &rarr;
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

    </div>
  );
}
