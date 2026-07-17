import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedPostsPaginated, getCategories, getCategoryBySlug } from "@/lib/data/public";

export const revalidate = 3600; // Time-based ISR fallback

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
};

function getExcerpt(htmlContent: string | null): string {
  if (!htmlContent) return "";
  const stripped = htmlContent.replace(/<[^>]*>/g, "");
  const trimmed = stripped.trim().replace(/\s+/g, " ");
  if (trimmed.length <= 160) return trimmed;
  return trimmed.slice(0, 160) + "...";
}

export default async function CategoryJournalPage({ params, searchParams }: PageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const { slug } = resolvedParams;

  const currentCategory = await getCategoryBySlug(slug);
  if (!currentCategory) {
    notFound();
  }

  const currentPage = Number(resolvedSearchParams.page) || 1;
  const limit = 12;

  const [postsData, categories] = await Promise.all([
    getPublishedPostsPaginated(currentPage, limit, slug),
    getCategories(),
  ]);

  const { posts, totalCount } = postsData;
  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="bg-ivory min-h-screen font-sans pb-24 text-ink">
      
      {/* Header section */}
      <header className="bg-cream/40 border-b border-olive/10 py-16 px-6 text-center">
        <div className="max-w-4xl mx-auto space-y-4">
          <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.25em] text-gold">
            Journal Category
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-olive">
            {currentCategory.name}
          </h1>
          <p className="font-display text-base text-olive/75 italic max-w-xl mx-auto font-light leading-relaxed">
            Curated travel dispatches, guides, and stories in {currentCategory.name}.
          </p>
        </div>
      </header>

      {/* Categories Filter Tabs */}
      <section className="max-w-7xl mx-auto px-6 py-8 border-b border-olive/5">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Link
            href="/journal"
            className="px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-full bg-transparent text-olive/60 hover:text-gold border border-olive/15 hover:border-gold transition-all"
          >
            All
          </Link>
          {categories.map((category) => {
            const isSelected = category.slug === slug;
            return (
              <Link
                key={category.id}
                href={`/journal/category/${category.slug}`}
                className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-full transition-all ${
                  isSelected
                    ? "bg-gold text-ivory border border-gold"
                    : "bg-transparent text-olive/60 hover:text-gold border border-olive/15 hover:border-gold"
                }`}
              >
                {category.name}
              </Link>
            );
          })}
        </div>
      </section>

      {/* Main Journal Grid */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {posts.length === 0 ? (
          <div className="bg-cream/20 border border-dashed border-olive/15 rounded-sm p-16 text-center max-w-2xl mx-auto">
            <h2 className="font-display text-xl font-medium text-olive">No dispatches found</h2>
            <p className="font-sans text-xs text-olive/65 mt-2">
              We are currently drafting travel stories for this category. Please check back shortly.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {posts.map((post) => {
              const categoryName = post.categories && !Array.isArray(post.categories)
                ? (post.categories as { name: string }).name
                : currentCategory.name;

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
                  key={post.id}
                  className="bg-cream/15 border border-olive/5 hover:border-gold/20 rounded-sm overflow-hidden flex flex-col group hover:shadow-xl hover:shadow-olive/5 transition-all duration-500"
                >
                  <div className="aspect-[16/9] bg-olive/5 relative overflow-hidden">
                    {featuredImage ? (
                      <img
                        src={featuredImage}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-olive/20 font-display italic text-lg bg-olive/5">
                        No Image Available
                      </div>
                    )}
                    <span className="absolute top-4 left-4 bg-ink/80 text-ivory text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 backdrop-blur-sm rounded-sm">
                      {categoryName}
                    </span>
                  </div>

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
                        Read Story &rarr;
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Pagination section */}
        {totalPages > 1 && (
          <nav className="flex items-center justify-center gap-4 mt-16 pt-8 border-t border-olive/10">
            {currentPage > 1 ? (
              <Link
                href={`/journal/category/${slug}?page=${currentPage - 1}`}
                className="px-4 py-2 border border-olive/15 hover:border-gold text-olive hover:text-gold text-xs font-semibold uppercase tracking-wider rounded-sm transition-colors"
              >
                Previous
              </Link>
            ) : (
              <span className="px-4 py-2 border border-olive/5 text-olive/20 text-xs font-semibold uppercase tracking-wider rounded-sm cursor-not-allowed">
                Previous
              </span>
            )}

            <span className="text-xs text-olive/50 font-light">
              Page {currentPage} of {totalPages}
            </span>

            {currentPage < totalPages ? (
              <Link
                href={`/journal/category/${slug}?page=${currentPage + 1}`}
                className="px-4 py-2 border border-olive/15 hover:border-gold text-olive hover:text-gold text-xs font-semibold uppercase tracking-wider rounded-sm transition-colors"
              >
                Next
              </Link>
            ) : (
              <span className="px-4 py-2 border border-olive/5 text-olive/20 text-xs font-semibold uppercase tracking-wider rounded-sm cursor-not-allowed">
                Next
              </span>
            )}
          </nav>
        )}
      </main>

    </div>
  );
}
