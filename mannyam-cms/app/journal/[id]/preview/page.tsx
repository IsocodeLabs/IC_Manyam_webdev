import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import DOMPurify from "isomorphic-dompurify";
import { createClient } from "@/lib/supabase/server";
import { publishPost } from "@/app/journal/actions";
import type { Json } from "@/types/database.types";

function getSeo(value: Json | null) {
  if (!value || Array.isArray(value) || typeof value !== "object") return {} as Record<string, string>;
  return Object.fromEntries(Object.entries(value).filter((entry): entry is [string, string] => typeof entry[1] === "string"));
}

export default async function PreviewPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const [{ data: profile }, { data: post }] = await Promise.all([
    supabase.from("users").select("role").eq("id", user.id).single(),
    supabase.from("posts").select("id,title,content,status,scheduled_at,published_at,seo_meta,categories(name),post_tags(tags(name))").eq("id", id).single(),
  ]);
  if (!profile || !["Admin", "Content Manager"].includes(profile.role)) redirect("/dashboard?error=access_denied");
  if (!post) notFound();

  const category = Array.isArray(post.categories) ? post.categories[0]?.name : post.categories?.name;
  const tagNames = (post.post_tags ?? []).flatMap((link) => Array.isArray(link.tags) ? link.tags.map((tag) => tag.name) : link.tags?.name ? [link.tags.name] : []);
  const seo = getSeo(post.seo_meta);
  const displayDate = post.published_at ?? post.scheduled_at;
  const publishAction = publishPost.bind(null, id);

  return (
    <article className="mx-auto max-w-4xl overflow-hidden rounded-lg bg-paper shadow-sm">
      <div className="bg-gold px-5 py-3 text-center text-sm font-bold tracking-wide text-olive">
        {post.status === "Published" ? "PUBLISHED - This post is live on the website." : "PREVIEW MODE - This post is not yet live"}
      </div>
      <div className="border-b border-olive/10 bg-cream p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href={`/journal/${id}/edit`} className="rounded border border-olive/20 px-4 py-2 text-sm">Back to Editor</Link>
          {post.status !== "Published" && <form action={publishAction}><button className="rounded bg-gold px-4 py-2 text-sm font-semibold">Publish Now</button></form>}
        </div>
        <details className="mt-4 rounded border border-olive/10 bg-paper p-3 text-sm"><summary className="cursor-pointer font-semibold">SEO preview</summary><dl className="mt-2 grid gap-1"><div><dt className="font-medium">Meta title</dt><dd>{seo.title || "Not set"}</dd></div><div><dt className="font-medium">Meta description</dt><dd>{seo.description || "Not set"}</dd></div><div><dt className="font-medium">Canonical URL</dt><dd>{seo.canonicalUrl || "Not set"}</dd></div></dl></details>
      </div>
      <div className="px-6 py-12 md:px-14">
        <div className="mb-5 flex flex-wrap gap-2 text-sm">{category && <span className="rounded-full bg-olive px-3 py-1 text-paper">{category}</span>}{tagNames.map((tag) => <span key={tag} className="rounded-full bg-ivory px-3 py-1">{tag}</span>)}</div>
        <h1 className="font-display text-5xl font-semibold leading-tight">{post.title}</h1>
        {displayDate && <time className="mt-3 block text-sm text-olive/60">{new Intl.DateTimeFormat("en-GB", { dateStyle: "long" }).format(new Date(displayDate))}</time>}
        <div className="prose prose-olive mt-10 max-w-none" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content ?? "") }} />
      </div>
    </article>
  );
}
