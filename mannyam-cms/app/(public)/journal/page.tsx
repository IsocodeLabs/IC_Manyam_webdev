import Link from "next/link";
import { getPublishedPostsPaginated, getCategories } from "@/lib/data/public";
import { SectionHeading } from "@/components/public/ui/SectionHeading";
import { PostCard } from "@/components/public/ui/PostCard";
import { buildMetadata } from "@/lib/seo/buildMetadata";
import type { Metadata } from "next";

export const revalidate = 3600; // Time-based ISR fallback

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    seoMeta: null,
    fallbackTitle: "The Journal | MANNYAM Studio",
    fallbackDescription: "Guides, stories, and cultural dispatches from our travel specialists. Immerse yourself in the extraordinary colour, devotion, and heritage of India.",
    path: "/journal",
  });
}

type PageProps = {
  searchParams: Promise<{ page?: string }>;
};

export default async function JournalPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const currentPage = Number(resolvedParams.page) || 1;
  const limit = 12;

  const [postsData, categories] = await Promise.all([
    getPublishedPostsPaginated(currentPage, limit),
    getCategories(),
  ]);

  const { posts, totalCount } = postsData;
  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="bg-ivory min-h-screen font-sans pb-24 text-ink">
      
      {/* Header section */}
      <header className="bg-cream/40 border-b border-olive/10 py-16 px-6 text-center">
        <SectionHeading
          eyebrow="Travel Chronicles"
          heading="The Journal"
          intro="Guides, stories, and cultural dispatches from our travel specialists."
        />
      </header>

      {/* Categories Filter Tabs */}
      <section className="max-w-7xl mx-auto px-6 py-8 border-b border-olive/5">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Link
            href="/journal"
            className="px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-full bg-gold text-ivory border border-gold transition-all"
          >
            All
          </Link>
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/journal/category/${category.slug}`}
              className="px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-full bg-transparent text-olive/60 hover:text-gold border border-olive/15 hover:border-gold transition-all"
            >
              {category.name}
            </Link>
          ))}
        </div>
      </section>

      {/* Main Journal Grid */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {posts.length === 0 ? (
          <div className="bg-cream/20 border border-dashed border-olive/15 rounded-sm p-16 text-center max-w-2xl mx-auto">
            <h2 className="font-display text-xl font-medium text-olive">No dispatches found</h2>
            <p className="font-sans text-xs text-olive/65 mt-2">
              We are currently drafting new travel stories. Please check back shortly.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}

        {/* Pagination section */}
        {totalPages > 1 && (
          <nav className="flex items-center justify-center gap-4 mt-16 pt-8 border-t border-olive/10">
            {currentPage > 1 ? (
              <Link
                href={`/journal?page=${currentPage - 1}`}
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
                href={`/journal?page=${currentPage + 1}`}
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

