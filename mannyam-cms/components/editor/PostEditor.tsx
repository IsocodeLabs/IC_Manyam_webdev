"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import TipTapLink from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { checkSlugUnique, createPost, updatePost, type PostInput } from "@/app/journal/actions";
import { SeoPanel } from "@/components/seo/SeoPanel";

type EditorPost = {
  id: string;
  title: string;
  slug: string;
  content: string;
  category_id: string | null;
  status: "Draft" | "Published" | "Scheduled";
  scheduled_at: string | null;
  published_at?: string | null;
  created_at?: string | null;
  seo_meta: {
    title?: string;
    description?: string;
    canonical_url?: string;
    canonicalUrl?: string;
    og_title?: string;
    og_description?: string;
    og_image?: string;
    featuredImageUrl?: string;
  } | null;
  tagNames: string[];
} | null;

type Revision = { id: string; title: string; content: string; created_at: string; authorName: string | null };
type MediaItem = { id: string; file_url: string; alt_text: string };

function slugify(value: string) {
  return value.toLocaleLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function ToolbarButton({ active = false, children, onClick }: { active?: boolean; children: React.ReactNode; onClick: () => void }) {
  return <button type="button" onClick={onClick} className={`rounded px-2.5 py-1.5 text-sm ${active ? "bg-olive text-paper" : "bg-ivory text-olive hover:bg-gold/30"}`}>{children}</button>;
}

export function PostEditor({ post, categories, tags, media, revisions }: {
  post: EditorPost;
  categories: { id: string; name: string }[];
  tags: { id: string; name: string }[];
  media: MediaItem[];
  revisions: Revision[];
}) {
  const router = useRouter();
  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(post));
  const [slugUnique, setSlugUnique] = useState(true);
  const [categoryId, setCategoryId] = useState(post?.category_id ?? "");
  const [status, setStatus] = useState<PostInput["status"]>(post?.status ?? "Draft");
  const [scheduledAt, setScheduledAt] = useState(post?.scheduled_at?.slice(0, 16) ?? "");
  const [tagInput, setTagInput] = useState(post?.tagNames.join(", ") ?? "");
  const [seoMeta, setSeoMeta] = useState(() => ({
    title: post?.seo_meta?.title ?? "",
    description: post?.seo_meta?.description ?? "",
    canonical_url: post?.seo_meta?.canonical_url ?? post?.seo_meta?.canonicalUrl ?? "",
    og_title: post?.seo_meta?.og_title ?? "",
    og_description: post?.seo_meta?.og_description ?? "",
    og_image: post?.seo_meta?.og_image ?? post?.seo_meta?.featuredImageUrl ?? "",
  }));
  const [featuredImageUrl, setFeaturedImageUrl] = useState(post?.seo_meta?.og_image ?? post?.seo_meta?.featuredImageUrl ?? "");
  const [saveState, setSaveState] = useState("");
  const [error, setError] = useState("");
  const [showMedia, setShowMedia] = useState(false);
  const [mediaPurpose, setMediaPurpose] = useState<"content" | "featured">("content");
  const [showHistory, setShowHistory] = useState(false);
  const [isPending, startTransition] = useTransition();

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ link: false }),
      Image,
      TipTapLink.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: "Write the journal entry…" }),
    ],
    content: post?.content ?? "",
    editorProps: { attributes: { class: "prose prose-olive max-w-none min-h-[400px] p-5 focus:outline-none" } },
  });

  const knownTags = useMemo(() => tags.map((tag) => tag.name), [tags]);

  useEffect(() => {
    if (!slugTouched) setSlug(slugify(title));
  }, [title, slugTouched]);

  useEffect(() => {
    if (!slug) { setSlugUnique(true); return; }
    const timer = window.setTimeout(async () => {
      try { setSlugUnique(await checkSlugUnique(slug, post?.id)); }
      catch { setSlugUnique(false); }
    }, 450);
    return () => window.clearTimeout(timer);
  }, [slug, post?.id]);

  function getInput(nextStatus = status): PostInput {
    return {
      title,
      slug,
      content: editor?.getHTML() ?? "",
      categoryId: categoryId || null,
      tagNames: tagInput.split(",").map((tag) => tag.trim()).filter(Boolean),
      status: nextStatus,
      scheduledAt: nextStatus === "Scheduled" && scheduledAt ? new Date(scheduledAt).toISOString() : null,
      seoMeta: {
        title: seoMeta.title,
        description: seoMeta.description,
        canonical_url: seoMeta.canonical_url,
        og_title: seoMeta.og_title,
        og_description: seoMeta.og_description,
        og_image: seoMeta.og_image || featuredImageUrl, // sync featured image with og_image if fallback needed
      },
    };
  }

  async function save(nextStatus = status, silent = false) {
    if (!slugUnique) { setError("This URL is already in use"); return; }
    setSaveState("Saving...");
    setError("");
    try {
      const result = post ? await updatePost(post.id, getInput(nextStatus)) : await createPost(getInput(nextStatus));
      setStatus(nextStatus);
      setSaveState(`Saved ${new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit" }).format(new Date())}`);
      if (!post) router.replace(`/journal/${result.id}/edit`);
      else if (!silent) router.refresh();
    } catch (caught) {
      setSaveState("");
      setError(caught instanceof Error ? caught.message : "The post could not be saved.");
    }
  }

  const saveRef = useRef(save);
  saveRef.current = save;

  useEffect(() => {
    if (!post || status !== "Draft") return;
    const timer = window.setInterval(() => { void saveRef.current("Draft", true); }, 60_000);
    return () => window.clearInterval(timer);
  }, [post, status]);

  function chooseMedia(item: MediaItem) {
    if (mediaPurpose === "featured") setFeaturedImageUrl(item.file_url);
    else editor?.chain().focus().setImage({ src: item.file_url, alt: item.alt_text }).run();
    setShowMedia(false);
  }

  function restoreRevision(revision: Revision) {
    setTitle(revision.title);
    setSlugTouched(true);
    editor?.commands.setContent(revision.content);
    setShowHistory(false);
    setSaveState("Version restored locally. Save to keep it.");
  }

  return (
    <section>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div><Link href="/journal" className="text-sm text-gold hover:underline">← Back to Journal</Link><h1 className="mt-1 font-display text-4xl font-semibold">{post ? "Edit Post" : "New Post"}</h1></div>
        <div className="flex items-center gap-3 text-sm text-olive/70">{saveState && <span aria-live="polite">{saveState}</span>}{post && <Link target="_blank" href={`/journal/${post.id}/preview`} className="rounded border border-olive/20 px-3 py-2 text-olive">Preview</Link>}</div>
      </div>
      {error && <p role="alert" className="mb-4 rounded-md bg-red-50 p-3 text-red-800">{error}</p>}

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
        <div className="min-w-0 space-y-4">
          <div className="rounded-lg border border-olive/10 bg-paper p-5 shadow-sm">
            <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Enter post title" className="w-full border-0 bg-transparent font-display text-4xl font-semibold text-olive outline-none placeholder:text-olive/35" />
            <label className="mt-4 block text-sm font-medium">URL slug
              <input value={slug} onChange={(event) => { setSlugTouched(true); setSlug(slugify(event.target.value)); }} className={`mt-1 w-full rounded-md border px-3 py-2 font-mono text-sm ${slugUnique ? "border-olive/20" : "border-red-500"}`} />
            </label>
            {!slugUnique && <p className="mt-1 text-sm text-red-700">This URL is already in use</p>}
          </div>

          <div className="overflow-hidden rounded-lg border border-olive/10 bg-paper shadow-sm">
            <div className="flex flex-wrap gap-2 border-b border-olive/10 bg-cream p-3">
              <ToolbarButton active={editor?.isActive("bold")} onClick={() => editor?.chain().focus().toggleBold().run()}>Bold</ToolbarButton>
              <ToolbarButton active={editor?.isActive("italic")} onClick={() => editor?.chain().focus().toggleItalic().run()}>Italic</ToolbarButton>
              <ToolbarButton active={editor?.isActive("heading", { level: 2 })} onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}>Heading 2</ToolbarButton>
              <ToolbarButton active={editor?.isActive("heading", { level: 3 })} onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}>Heading 3</ToolbarButton>
              <ToolbarButton onClick={() => editor?.chain().focus().toggleBulletList().run()}>Bullet list</ToolbarButton>
              <ToolbarButton onClick={() => editor?.chain().focus().toggleOrderedList().run()}>Ordered list</ToolbarButton>
              <ToolbarButton onClick={() => editor?.chain().focus().toggleBlockquote().run()}>Blockquote</ToolbarButton>
              <ToolbarButton onClick={() => { const href = window.prompt("Link URL"); if (href) editor?.chain().focus().extendMarkRange("link").setLink({ href }).run(); }}>Link</ToolbarButton>
              <ToolbarButton onClick={() => { setMediaPurpose("content"); setShowMedia(true); }}>Image</ToolbarButton>
              <ToolbarButton onClick={() => editor?.chain().focus().setHorizontalRule().run()}>Horizontal rule</ToolbarButton>
            </div>
            <EditorContent editor={editor} />
          </div>
        </div>

        <aside className="space-y-4 xl:sticky xl:top-20">
          <div className="rounded-lg border border-olive/10 bg-paper p-4 shadow-sm">
            <h3 className="font-display text-lg font-semibold text-olive mb-3">SEO Metadata</h3>
            <SeoPanel
              seoMeta={seoMeta}
              onChange={setSeoMeta}
              slug={slug}
              defaultTitle={title}
              isPost={true}
              publishedAt={post?.published_at}
              createdAt={post?.created_at}
            />
          </div>
          <div className="space-y-4 rounded-lg border border-olive/10 bg-paper p-4 shadow-sm">
            <label className="block text-sm font-medium">Category<select value={categoryId} onChange={(event) => setCategoryId(event.target.value)} className="mt-1 w-full rounded border border-olive/20 px-3 py-2"><option value="">Uncategorised</option>{categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
            <label className="block text-sm font-medium">Tags<input list="known-tags" value={tagInput} onChange={(event) => setTagInput(event.target.value)} placeholder="Holi, Rajasthan" className="mt-1 w-full rounded border border-olive/20 px-3 py-2" /><datalist id="known-tags">{knownTags.map((tag) => <option key={tag} value={tag} />)}</datalist><span className="mt-1 block text-xs font-normal text-olive/60">Separate tags with commas. New tags are created on save.</span></label>
            <label className="block text-sm font-medium">Status<select value={status} onChange={(event) => setStatus(event.target.value as PostInput["status"])} className="mt-1 w-full rounded border border-olive/20 px-3 py-2"><option>Draft</option><option>Published</option><option>Scheduled</option></select></label>
            {status === "Scheduled" && <label className="block text-sm font-medium">Scheduled date and time<input type="datetime-local" value={scheduledAt} onChange={(event) => setScheduledAt(event.target.value)} className="mt-1 w-full rounded border border-olive/20 px-3 py-2" /></label>}
            <div><p className="text-sm font-medium">Featured image</p>{featuredImageUrl && <img src={featuredImageUrl} alt="Selected featured image" className="mt-2 h-28 w-full rounded object-cover" />}<button type="button" onClick={() => { setMediaPurpose("featured"); setShowMedia(true); }} className="mt-2 w-full rounded border border-olive/20 px-3 py-2 text-sm">Choose Image</button></div>
          </div>
          {post && <button type="button" onClick={() => setShowHistory(true)} className="w-full rounded-lg border border-olive/20 bg-paper px-4 py-3 text-left font-medium">View History ({revisions.length} revisions)</button>}
          <div className="grid gap-2"><button disabled={isPending} type="button" onClick={() => startTransition(() => save("Draft"))} className="rounded bg-olive/15 px-4 py-2.5 font-medium disabled:opacity-50">Save Draft</button>{status === "Scheduled" && <button disabled={isPending} type="button" onClick={() => startTransition(() => save("Scheduled"))} className="rounded bg-olive px-4 py-2.5 font-medium text-paper disabled:opacity-50">Schedule</button>}<button disabled={isPending} type="button" onClick={() => startTransition(() => save("Published"))} className="rounded bg-gold px-4 py-2.5 font-semibold disabled:opacity-50">Publish</button></div>
        </aside>
      </div>

      {showMedia && <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"><div className="max-h-[80vh] w-full max-w-3xl overflow-auto rounded-lg bg-paper p-5"><div className="mb-4 flex justify-between"><h2 className="font-display text-2xl">Choose from Media Library</h2><button onClick={() => setShowMedia(false)}>Close</button></div>{media.length ? <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{media.map((item) => <button key={item.id} onClick={() => chooseMedia(item)} className="rounded border border-olive/10 p-2 text-left"><img src={item.file_url} alt={item.alt_text} className="h-28 w-full object-cover" /><span className="mt-1 block truncate text-xs">{item.alt_text}</span></button>)}</div> : <p>No media items are available yet.</p>}</div></div>}
      {showHistory && <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex justify-end bg-black/40"><div className="h-full w-full max-w-md overflow-auto bg-paper p-6 shadow-xl"><div className="mb-5 flex justify-between"><h2 className="font-display text-2xl">Revision History</h2><button onClick={() => setShowHistory(false)}>Close</button></div>{revisions.length ? <div className="space-y-3">{revisions.map((revision, index) => <article key={revision.id} className="rounded border border-olive/10 p-4"><p className="font-medium">{new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(new Date(revision.created_at))}</p><p className="text-sm text-olive/65">{revision.authorName ?? "Unknown editor"}</p><p className="my-2 text-sm">{revision.title !== (revisions[index - 1]?.title ?? title) ? "Title changed" : "Content updated"}</p><button onClick={() => restoreRevision(revision)} className="text-sm font-semibold text-gold hover:underline">Restore this version</button></article>)}</div> : <p>No revisions have been saved yet.</p>}</div></div>}
    </section>
  );
}
