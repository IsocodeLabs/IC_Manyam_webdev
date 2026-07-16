import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import DOMPurify from "isomorphic-dompurify";
import { createClient } from "@/lib/supabase/server";
import { publishPage } from "@/app/pages-cms/actions";
import type { Json } from "@/types/database.types";

type BlockData = {
  headline?: string;
  subheadline?: string;
  backgroundImage?: string;
  ctaText?: string;
  ctaLink?: string;
  content?: string;
  features?: { icon?: string; title?: string; description?: string }[];
  fileUrl?: string;
  altText?: string;
  caption?: string;
  body?: string;
  buttonLabel?: string;
  buttonLink?: string;
  quote?: string;
  authorName?: string;
  authorTitle?: string;
};

type PreviewBlock = {
  id: string;
  type: "Hero" | "Text Block" | "Feature Grid" | "Image Block" | "CTA Banner" | "Testimonial" | "Concierge Contact";
  data: BlockData;
};

function getSeo(value: Json | null) {
  if (!value || Array.isArray(value) || typeof value !== "object") return {} as Record<string, string>;
  return Object.fromEntries(
    Object.entries(value).filter((entry): entry is [string, string] => typeof entry[1] === "string")
  );
}

export default async function PreviewPageCms({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, { data: page }] = await Promise.all([
    supabase.from("users").select("role").eq("id", user.id).single(),
    supabase.from("pages").select("id,title,slug,type,status,content,seo_meta").eq("id", id).single(),
  ]);

  if (!profile || !["Admin", "Content Manager"].includes(profile.role)) {
    redirect("/dashboard?error=access_denied");
  }

  if (!page) notFound();

  const seo = getSeo(page.seo_meta);
  const blocks = (Array.isArray(page.content) ? page.content : []) as PreviewBlock[];
  const publishAction = publishPage.bind(null, id);

  return (
    <article className="mx-auto max-w-5xl overflow-hidden rounded-lg bg-paper shadow-sm font-sans text-olive">
      {/* Gold Status Banner */}
      <div className="bg-gold px-5 py-3 text-center text-sm font-bold tracking-wide text-olive">
        {page.status === "Published"
          ? "PUBLISHED - This page is live on the website."
          : "PREVIEW MODE - This page is not yet live"}
      </div>

      {/* Editor Control bar */}
      <div className="border-b border-olive/10 bg-cream p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href={`/pages-cms/${id}/edit`} className="rounded border border-olive/20 px-4 py-2 text-sm bg-white hover:bg-cream transition-colors">
            Back to Editor
          </Link>
          {page.status !== "Published" && (
            <form action={publishAction}>
              <button className="rounded bg-gold px-5 py-2 text-sm font-semibold text-olive hover:bg-[#ba8838] transition-colors">
                Publish Now
              </button>
            </form>
          )}
        </div>
        <details className="mt-4 rounded border border-olive/10 bg-paper p-3 text-sm">
          <summary className="cursor-pointer font-semibold">SEO Preview</summary>
          <dl className="mt-2 grid gap-1.5 text-xs text-olive/80">
            <div>
              <dt className="font-semibold uppercase tracking-wider text-olive/60">Meta Title</dt>
              <dd className="mt-0.5 font-medium">{seo.title || "Not set"}</dd>
            </div>
            <div>
              <dt className="font-semibold uppercase tracking-wider text-olive/60">Meta Description</dt>
              <dd className="mt-0.5 font-medium">{seo.description || "Not set"}</dd>
            </div>
            <div>
              <dt className="font-semibold uppercase tracking-wider text-olive/60">Canonical URL</dt>
              <dd className="mt-0.5 font-mono">{seo.canonicalUrl || "Not set"}</dd>
            </div>
          </dl>
        </details>
      </div>

      {/* Page Title & Type Info */}
      <div className="bg-cream/20 px-6 py-6 border-b border-olive/10 md:px-14">
        <span className="font-sans text-xs font-semibold uppercase tracking-widest text-gold bg-olive/10 px-2.5 py-1 rounded">
          {page.type} Page
        </span>
        <h1 className="font-display text-4xl md:text-5xl font-semibold leading-tight mt-3">{page.title}</h1>
        <p className="text-xs font-mono text-olive/65 mt-1">/{page.slug}</p>
      </div>

      {/* CONTENT BLOCKS RENDER ENGINE */}
      <div className="divide-y divide-olive/10">
        {blocks.length === 0 ? (
          <div className="py-20 text-center text-olive/60">
            This page has no content blocks.
          </div>
        ) : (
          blocks.map((block, idx) => {
            const data = block.data || {};
            return (
              <div key={block.id || idx} className="py-12 px-6 md:px-14">
                
                {/* HERO BLOCK */}
                {block.type === "Hero" && (
                  <section
                    className="relative overflow-hidden rounded-lg bg-olive/5 p-8 md:p-16 text-center border border-olive/10"
                    style={
                      data.backgroundImage
                        ? {
                            backgroundImage: `linear-gradient(rgba(238, 231, 218, 0.85), rgba(238, 231, 218, 0.85)), url(${data.backgroundImage})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }
                        : {}
                    }
                  >
                    <div className="max-w-2xl mx-auto space-y-4">
                      {data.headline && (
                        <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-olive leading-tight">
                          {data.headline}
                        </h2>
                      )}
                      {data.subheadline && (
                        <p className="text-base md:text-lg text-olive/80 font-sans max-w-lg mx-auto">
                          {data.subheadline}
                        </p>
                      )}
                      {data.ctaText && (
                        <div className="pt-2">
                          <Link
                            href={data.ctaLink || "#"}
                            className="inline-block rounded bg-gold px-6 py-3 font-semibold text-olive hover:bg-[#ba8838] transition-colors"
                          >
                            {data.ctaText}
                          </Link>
                        </div>
                      )}
                    </div>
                  </section>
                )}

                {/* TEXT BLOCK */}
                {block.type === "Text Block" && (
                  <div
                    className="prose prose-olive max-w-none font-sans"
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(data.content || "") }}
                  />
                )}

                {/* FEATURE GRID */}
                {block.type === "Feature Grid" && (
                  <section className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-3">
                      {(data.features || []).map((feature, fIdx) => (
                        <div key={fIdx} className="rounded-lg border border-olive/10 bg-cream/10 p-5 space-y-2">
                          {feature.icon && <span className="text-3xl block">{feature.icon}</span>}
                          {feature.title && <h3 className="font-display text-xl font-semibold">{feature.title}</h3>}
                          {feature.description && <p className="text-sm text-olive/75 leading-relaxed">{feature.description}</p>}
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* IMAGE BLOCK */}
                {block.type === "Image Block" && (
                  <figure className="text-center space-y-2.5">
                    {data.fileUrl ? (
                      <img
                        src={data.fileUrl}
                        alt={data.altText || "Page Image"}
                        className="mx-auto max-h-[500px] w-full rounded object-cover shadow-sm md:w-auto"
                      />
                    ) : (
                      <div className="h-48 bg-cream/20 flex items-center justify-center border border-dashed rounded text-olive/60">
                        No image chosen
                      </div>
                    )}
                    {data.caption && <figcaption className="text-xs text-olive/60 italic">{data.caption}</figcaption>}
                  </figure>
                )}

                {/* CTA BANNER */}
                {block.type === "CTA Banner" && (
                  <section className="rounded-lg bg-olive p-8 md:p-12 text-paper border border-olive/20 shadow-sm">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                      <div className="space-y-2 max-w-2xl">
                        {data.headline && (
                          <h2 className="font-display text-3xl font-bold tracking-tight">{data.headline}</h2>
                        )}
                        {data.body && <p className="text-sm text-paper/85 leading-relaxed">{data.body}</p>}
                      </div>
                      {data.buttonLabel && (
                        <Link
                          href={data.buttonLink || "#"}
                          className="whitespace-nowrap rounded bg-gold px-6 py-3 font-semibold text-olive hover:bg-[#ba8838] transition-colors"
                        >
                          {data.buttonLabel}
                        </Link>
                      )}
                    </div>
                  </section>
                )}

                {/* TESTIMONIAL */}
                {block.type === "Testimonial" && (
                  <section className="max-w-3xl mx-auto text-center space-y-4 py-4">
                    {data.quote && (
                      <blockquote className="font-display text-xl md:text-2xl text-olive/90 italic leading-relaxed">
                        &ldquo;{data.quote}&rdquo;
                      </blockquote>
                    )}
                    <div className="space-y-0.5">
                      {data.authorName && <p className="font-semibold text-sm">{data.authorName}</p>}
                      {data.authorTitle && <p className="text-xs text-olive/65 font-sans">{data.authorTitle}</p>}
                    </div>
                  </section>
                )}

                {/* CONCIERGE CONTACT */}
                {block.type === "Concierge Contact" && (
                  <section className="rounded-lg border border-gold/40 bg-cream/15 p-6 md:p-10 shadow-sm">
                    <div className="max-w-2xl mx-auto text-center space-y-6">
                      <div className="space-y-2">
                        <span className="text-gold text-xs font-semibold uppercase tracking-widest block">Concierge Desk</span>
                        <h2 className="font-display text-3xl font-semibold text-olive">Bespoke Premium Consultation</h2>
                        <p className="text-sm text-olive/75 leading-relaxed max-w-lg mx-auto">
                          Our dedicated concierge team is at your disposal to arrange tailor-made premium bookings, itinerary customisations, and exclusive reservations.
                        </p>
                      </div>
                      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                        <a href="tel:+919876543210" className="w-full sm:w-auto rounded border border-olive/20 px-5 py-2.5 text-sm font-semibold hover:bg-cream/40 transition-colors">
                          Call Concierge
                        </a>
                        <Link href="/contact" className="w-full sm:w-auto rounded bg-gold px-5 py-2.5 text-sm font-semibold text-olive hover:bg-[#ba8838] transition-colors">
                          Request Callback
                        </Link>
                      </div>
                    </div>
                  </section>
                )}

              </div>
            );
          })
        )}
      </div>
    </article>
  );
}
