"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { BlockTipTapEditor } from "./BlockTipTapEditor";
import { checkSlugUnique, createPage, updatePage, type PageInput } from "@/app/pages-cms/actions";
import { SeoPanel } from "@/components/seo/SeoPanel";

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

type EditorPage = {
  id: string;
  title: string;
  slug: string;
  type: "Landing" | "Category" | "Standard" | "Form" | "Legal";
  status: "Draft" | "Published";
  content: unknown;
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
} | null;

type MediaItem = { id: string; file_url: string; alt_text: string };

type ContentBlock = {
  id: string;
  type: "Hero" | "Text Block" | "Feature Grid" | "Image Block" | "CTA Banner" | "Testimonial" | "Concierge Contact";
  data: BlockData;
};

function slugify(value: string) {
  return value.toLocaleLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// DRAGGABLE BLOCK WRAPPER
function SortableBlockItem({
  block,
  onDelete,
  onUpdateData,
  onOpenMediaPicker,
}: {
  block: ContentBlock;
  onDelete: () => void;
  onUpdateData: (data: BlockData) => void;
  onOpenMediaPicker: (field: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative rounded-lg border border-olive/15 bg-paper p-5 shadow-sm">
      {/* Top Bar for Dragging and Delete */}
      <div className="mb-4 flex items-center justify-between border-b border-olive/10 pb-2">
        <div className="flex items-center gap-2">
          {/* Drag Handle */}
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="cursor-grab rounded p-1.5 text-olive/45 hover:bg-olive/5 hover:text-olive focus:outline-none"
            title="Drag to reorder"
          >
            ☰
          </button>
          <span className="font-sans text-xs font-semibold uppercase tracking-wider text-olive/60 bg-cream px-2 py-0.5 rounded">
            {block.type}
          </span>
        </div>
        <button
          type="button"
          onClick={onDelete}
          className="rounded px-2.5 py-1 text-xs font-sans font-medium text-red-700 hover:bg-red-50"
        >
          Delete Block
        </button>
      </div>

      {/* BLOCK FIELDS CONFIGURATION */}
      <div className="space-y-4 font-sans text-sm text-olive">
        {block.type === "Hero" && (
          <div className="grid gap-3">
            <label className="block text-xs font-semibold uppercase tracking-wide">Headline
              <input
                type="text"
                value={block.data.headline || ""}
                onChange={(e) => onUpdateData({ ...block.data, headline: e.target.value })}
                placeholder="Enter hero headline"
                className="mt-1 w-full rounded border border-olive/20 px-3 py-2 bg-cream/10"
              />
            </label>
            <label className="block text-xs font-semibold uppercase tracking-wide">Subheadline
              <input
                type="text"
                value={block.data.subheadline || ""}
                onChange={(e) => onUpdateData({ ...block.data, subheadline: e.target.value })}
                placeholder="Enter subheadline"
                className="mt-1 w-full rounded border border-olive/20 px-3 py-2 bg-cream/10"
              />
            </label>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide">Background Image</p>
              {block.data.backgroundImage && (
                <img src={block.data.backgroundImage} alt="Background preview" className="mt-2 h-20 w-44 rounded object-cover" />
              )}
              <button
                type="button"
                onClick={() => onOpenMediaPicker("backgroundImage")}
                className="mt-2 rounded border border-olive/20 px-3 py-1.5 text-xs hover:bg-cream/40"
              >
                Choose Background Image
              </button>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="block text-xs font-semibold uppercase tracking-wide">Button Label
                <input
                  type="text"
                  value={block.data.ctaText || ""}
                  onChange={(e) => onUpdateData({ ...block.data, ctaText: e.target.value })}
                  placeholder="Enquire Now"
                  className="mt-1 w-full rounded border border-olive/20 px-3 py-2 bg-cream/10"
                />
              </label>
              <label className="block text-xs font-semibold uppercase tracking-wide">Button Link
                <input
                  type="text"
                  value={block.data.ctaLink || ""}
                  onChange={(e) => onUpdateData({ ...block.data, ctaLink: e.target.value })}
                  placeholder="/contact"
                  className="mt-1 w-full rounded border border-olive/20 px-3 py-2 bg-cream/10"
                />
              </label>
            </div>
          </div>
        )}

        {block.type === "Text Block" && (
          <BlockTipTapEditor
            content={block.data.content || ""}
            onChange={(html) => onUpdateData({ ...block.data, content: html })}
          />
        )}

        {block.type === "Feature Grid" && (
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide">Features Grid (Up to 6 cards)</p>
            <div className="grid gap-4 md:grid-cols-2">
              {(block.data.features || []).map((feature, idx) => (
                <div key={idx} className="rounded border border-olive/10 bg-cream/20 p-3 relative">
                  <button
                    type="button"
                    onClick={() => {
                      const updated = [...(block.data.features || [])];
                      updated.splice(idx, 1);
                      onUpdateData({ ...block.data, features: updated });
                    }}
                    className="absolute top-2 right-2 text-xs text-red-700 hover:underline"
                  >
                    Remove
                  </button>
                  <div className="grid gap-2">
                    <label className="block text-xs font-medium">Icon (Emoji)
                      <input
                        type="text"
                        value={feature.icon || ""}
                        onChange={(e) => {
                          const updated = [...(block.data.features || [])];
                          updated[idx] = { ...feature, icon: e.target.value };
                          onUpdateData({ ...block.data, features: updated });
                        }}
                        placeholder="✨"
                        className="mt-1 w-full rounded border border-olive/20 px-2.5 py-1.5"
                      />
                    </label>
                    <label className="block text-xs font-medium">Title
                      <input
                        type="text"
                        value={feature.title || ""}
                        onChange={(e) => {
                          const updated = [...(block.data.features || [])];
                          updated[idx] = { ...feature, title: e.target.value };
                          onUpdateData({ ...block.data, features: updated });
                        }}
                        placeholder="Enter feature title"
                        className="mt-1 w-full rounded border border-olive/20 px-2.5 py-1.5"
                      />
                    </label>
                    <label className="block text-xs font-medium">Description
                      <textarea
                        value={feature.description || ""}
                        onChange={(e) => {
                          const updated = [...(block.data.features || [])];
                          updated[idx] = { ...feature, description: e.target.value };
                          onUpdateData({ ...block.data, features: updated });
                        }}
                        placeholder="Enter feature details"
                        className="mt-1 w-full rounded border border-olive/20 px-2.5 py-1.5 min-h-16"
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>
            {(!block.data.features || block.data.features.length < 6) && (
              <button
                type="button"
                onClick={() => {
                  const currentFeatures = block.data.features || [];
                  onUpdateData({
                    ...block.data,
                    features: [...currentFeatures, { icon: "", title: "", description: "" }],
                  });
                }}
                className="mt-2 rounded border border-olive/30 px-3 py-1.5 text-xs hover:bg-cream/40"
              >
                + Add Feature Card
              </button>
            )}
          </div>
        )}

        {block.type === "Image Block" && (
          <div className="grid gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide">Image File</p>
              {block.data.fileUrl && (
                <img src={block.data.fileUrl} alt="Preview" className="mt-2 h-24 w-44 rounded object-cover" />
              )}
              <button
                type="button"
                onClick={() => onOpenMediaPicker("fileUrl")}
                className="mt-2 rounded border border-olive/20 px-3 py-1.5 text-xs hover:bg-cream/40"
              >
                Choose Image
              </button>
            </div>
            <label className="block text-xs font-semibold uppercase tracking-wide">Alt Text (Required)
              <input
                type="text"
                required
                value={block.data.altText || ""}
                onChange={(e) => onUpdateData({ ...block.data, altText: e.target.value })}
                placeholder="Describe this image for screen readers"
                className="mt-1 w-full rounded border border-olive/20 px-3 py-2 bg-cream/10"
              />
            </label>
            <label className="block text-xs font-semibold uppercase tracking-wide">Caption
              <input
                type="text"
                value={block.data.caption || ""}
                onChange={(e) => onUpdateData({ ...block.data, caption: e.target.value })}
                placeholder="Optional image caption"
                className="mt-1 w-full rounded border border-olive/20 px-3 py-2 bg-cream/10"
              />
            </label>
          </div>
        )}

        {block.type === "CTA Banner" && (
          <div className="grid gap-3">
            <label className="block text-xs font-semibold uppercase tracking-wide">Headline
              <input
                type="text"
                value={block.data.headline || ""}
                onChange={(e) => onUpdateData({ ...block.data, headline: e.target.value })}
                placeholder="Enter banner headline"
                className="mt-1 w-full rounded border border-olive/20 px-3 py-2 bg-cream/10"
              />
            </label>
            <label className="block text-xs font-semibold uppercase tracking-wide">Body Text
              <textarea
                value={block.data.body || ""}
                onChange={(e) => onUpdateData({ ...block.data, body: e.target.value })}
                placeholder="Enter description text"
                className="mt-1 w-full rounded border border-olive/20 px-3 py-2 bg-cream/10 min-h-20"
              />
            </label>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="block text-xs font-semibold uppercase tracking-wide">Button Label
                <input
                  type="text"
                  value={block.data.buttonLabel || ""}
                  onChange={(e) => onUpdateData({ ...block.data, buttonLabel: e.target.value })}
                  placeholder="Get Started"
                  className="mt-1 w-full rounded border border-olive/20 px-3 py-2 bg-cream/10"
                />
              </label>
              <label className="block text-xs font-semibold uppercase tracking-wide">Button Link
                <input
                  type="text"
                  value={block.data.buttonLink || ""}
                  onChange={(e) => onUpdateData({ ...block.data, buttonLink: e.target.value })}
                  placeholder="/pricing"
                  className="mt-1 w-full rounded border border-olive/20 px-3 py-2 bg-cream/10"
                />
              </label>
            </div>
          </div>
        )}

        {block.type === "Testimonial" && (
          <div className="grid gap-3">
            <label className="block text-xs font-semibold uppercase tracking-wide">Quote
              <textarea
                value={block.data.quote || ""}
                onChange={(e) => onUpdateData({ ...block.data, quote: e.target.value })}
                placeholder="Enter user quote"
                className="mt-1 w-full rounded border border-olive/20 px-3 py-2 bg-cream/10 min-h-20"
              />
            </label>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="block text-xs font-semibold uppercase tracking-wide">Author Name
                <input
                  type="text"
                  value={block.data.authorName || ""}
                  onChange={(e) => onUpdateData({ ...block.data, authorName: e.target.value })}
                  placeholder="E.g. Sarah Jenkins"
                  className="mt-1 w-full rounded border border-olive/20 px-3 py-2 bg-cream/10"
                />
              </label>
              <label className="block text-xs font-semibold uppercase tracking-wide">Author Title
                <input
                  type="text"
                  value={block.data.authorTitle || ""}
                  onChange={(e) => onUpdateData({ ...block.data, authorTitle: e.target.value })}
                  placeholder="E.g. Marketing Director"
                  className="mt-1 w-full rounded border border-olive/20 px-3 py-2 bg-cream/10"
                />
              </label>
            </div>
          </div>
        )}

        {block.type === "Concierge Contact" && (
          <div className="bg-cream/40 p-4 rounded-md text-olive/80 border border-olive/10 flex items-center justify-between">
            <div>
              <p className="font-semibold">Concierge Contact Block</p>
              <p className="text-xs text-olive/60 mt-1">This block will render the preset premium enquiry form on the page.</p>
            </div>
            <span className="text-xl">📞</span>
          </div>
        )}
      </div>
    </div>
  );
}

// MAIN PAGE EDITOR COMPONENT
export function PageEditor({ page, media }: { page: EditorPage; media: MediaItem[] }) {
  const router = useRouter();
  const [title, setTitle] = useState(page?.title ?? "");
  const [slug, setSlug] = useState(page?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(page));
  const [slugUnique, setSlugUnique] = useState(true);
  const [type, setType] = useState<PageInput["type"]>(page?.type ?? "Landing");
  const [status, setStatus] = useState<PageInput["status"]>(page?.status ?? "Draft");
  
  // SEO states
  const [seoMeta, setSeoMeta] = useState(() => ({
    title: page?.seo_meta?.title ?? "",
    description: page?.seo_meta?.description ?? "",
    canonical_url: page?.seo_meta?.canonical_url ?? page?.seo_meta?.canonicalUrl ?? "",
    og_title: page?.seo_meta?.og_title ?? "",
    og_description: page?.seo_meta?.og_description ?? "",
    og_image: page?.seo_meta?.og_image ?? page?.seo_meta?.featuredImageUrl ?? "",
  }));
  const [featuredImageUrl, setFeaturedImageUrl] = useState(page?.seo_meta?.og_image ?? page?.seo_meta?.featuredImageUrl ?? "");

  // Content Blocks state
  const [blocks, setBlocks] = useState<ContentBlock[]>(() => {
    const rawBlocks = (Array.isArray(page?.content) ? page.content : []) as {
      id?: string;
      type: ContentBlock["type"];
      data?: BlockData;
    }[];
    return rawBlocks.map((b) => ({
      id: b.id || Math.random().toString(36).substring(2, 11),
      type: b.type,
      data: b.data || {},
    }));
  });

  const [saveState, setSaveState] = useState("");
  const [error, setError] = useState("");

  // Media Picker Dialog controls
  const [showMedia, setShowMedia] = useState(false);
  const [mediaPickerTarget, setMediaPickerTarget] = useState<{ blockId: string; field: string } | "featured" | null>(null);

  const [isPending, startTransition] = useTransition();

  // Sensors for Drag and Drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Auto-slugify title
  useEffect(() => {
    if (!slugTouched) setSlug(slugify(title));
  }, [title, slugTouched]);

  // Check unique slug (450ms debounce)
  useEffect(() => {
    if (!slug) { setSlugUnique(true); return; }
    const timer = window.setTimeout(async () => {
      try {
        setSlugUnique(await checkSlugUnique(slug, page?.id));
      } catch {
        setSlugUnique(false);
      }
    }, 450);
    return () => window.clearTimeout(timer);
  }, [slug, page?.id]);

  // Construct current input object
  function getInput(nextStatus = status): PageInput {
    return {
      title,
      slug,
      type,
      status: nextStatus,
      content: blocks.map((b) => ({
        id: b.id,
        type: b.type,
        data: b.data,
      })),
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

  // Save changes
  async function save(nextStatus = status, silent = false) {
    if (!slugUnique) { setError("This URL is already in use"); return; }
    
    // Validate alt text is present on any Image Blocks
    const imageBlockMissingAlt = blocks.some(b => b.type === "Image Block" && !b.data.altText?.trim());
    if (imageBlockMissingAlt) {
      setError("Alt text is required for all Image Blocks.");
      return;
    }

    setSaveState("Saving...");
    setError("");
    try {
      const result = page ? await updatePage(page.id, getInput(nextStatus)) : await createPage(getInput(nextStatus));
      setStatus(nextStatus);
      setSaveState(`Saved ${new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit" }).format(new Date())}`);
      if (!page) router.replace(`/pages-cms/${result.id}/edit`);
      else if (!silent) router.refresh();
    } catch (caught) {
      setSaveState("");
      setError(caught instanceof Error ? caught.message : "The page could not be saved.");
    }
  }

  // Autosave Drafts every 60 seconds
  const saveRef = useRef(save);
  saveRef.current = save;
  useEffect(() => {
    if (!page || status !== "Draft") return;
    const timer = window.setInterval(() => { void saveRef.current("Draft", true); }, 60_000);
    return () => window.clearInterval(timer);
  }, [page, status]);

  // Handle Drag End event
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setBlocks((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  // Add a new content block
  function addBlock(blockType: ContentBlock["type"]) {
    let initialData = {};
    if (blockType === "Hero") {
      initialData = { headline: "", subheadline: "", backgroundImage: "", ctaText: "", ctaLink: "" };
    } else if (blockType === "Text Block") {
      initialData = { content: "" };
    } else if (blockType === "Feature Grid") {
      initialData = { features: [] };
    } else if (blockType === "Image Block") {
      initialData = { fileUrl: "", altText: "", caption: "" };
    } else if (blockType === "CTA Banner") {
      initialData = { headline: "", body: "", buttonLabel: "", buttonLink: "" };
    } else if (blockType === "Testimonial") {
      initialData = { quote: "", authorName: "", authorTitle: "" };
    } else if (blockType === "Concierge Contact") {
      initialData = {};
    }

    const newBlock: ContentBlock = {
      id: Math.random().toString(36).substr(2, 9),
      type: blockType,
      data: initialData,
    };
    setBlocks((prev) => [...prev, newBlock]);
  }

  // Open Media Selection picker
  function triggerMediaPicker(blockId: string, field: string) {
    setMediaPickerTarget({ blockId, field });
    setShowMedia(true);
  }

  // Handle image selected from media library
  function chooseMedia(item: MediaItem) {
    if (mediaPickerTarget === "featured") {
      setFeaturedImageUrl(item.file_url);
    } else if (mediaPickerTarget && typeof mediaPickerTarget === "object") {
      const { blockId, field } = mediaPickerTarget;
      setBlocks((prev) =>
        prev.map((b) => (b.id === blockId ? { ...b, data: { ...b.data, [field]: item.file_url } } : b))
      );
    }
    setShowMedia(false);
    setMediaPickerTarget(null);
  }

  return (
    <section>
      {/* Header bar */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/pages-cms" className="text-sm text-gold hover:underline">← Back to Pages</Link>
          <h1 className="mt-1 font-display text-4xl font-semibold">{page ? "Edit Page" : "New Page"}</h1>
        </div>
        <div className="flex items-center gap-3 text-sm text-olive/70">
          {saveState && <span aria-live="polite">{saveState}</span>}
          {page && (
            <Link target="_blank" href={`/pages-cms/${page.id}/preview`} className="rounded border border-olive/20 px-3 py-2 text-olive">
              Preview
            </Link>
          )}
        </div>
      </div>

      {error && <p role="alert" className="mb-4 rounded-md bg-red-50 p-3 text-red-800 font-sans text-sm">{error}</p>}

      {/* Editor Main body */}
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
        
        {/* Left Scrollable panel */}
        <div className="min-w-0 space-y-4">
          
          {/* Base properties */}
          <div className="rounded-lg border border-olive/10 bg-paper p-5 shadow-sm space-y-4">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter page title"
              className="w-full border-0 bg-transparent font-display text-4xl font-semibold text-olive outline-none placeholder:text-olive/35"
            />
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm font-medium">URL slug
                <input
                  value={slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    setSlug(slugify(e.target.value));
                  }}
                  className={`mt-1 w-full rounded-md border px-3 py-2 font-mono text-sm ${
                    slugUnique ? "border-olive/20" : "border-red-500"
                  }`}
                />
                {!slugUnique && <p className="mt-1 text-xs text-red-700">This URL is already in use</p>}
              </label>
              <label className="block text-sm font-medium">Page Type
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as PageInput["type"])}
                  className="mt-1 w-full rounded-md border border-olive/20 px-3 py-2 bg-cream/10 text-sm font-sans"
                >
                  <option value="Landing">Landing</option>
                  <option value="Category">Category</option>
                  <option value="Standard">Standard</option>
                  <option value="Form">Form</option>
                  <option value="Legal">Legal</option>
                </select>
              </label>
            </div>
          </div>

          {/* Draggable Blocks Container */}
          <div className="space-y-4">
            <h2 className="font-display text-2xl text-olive font-semibold">Content Blocks</h2>
            
            {blocks.length === 0 ? (
              <div className="rounded-lg border-2 border-dashed border-olive/20 p-10 text-center font-sans text-olive/60">
                No blocks added yet. Click &quot;Add Block&quot; below to construct your page.
              </div>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-4">
                    {blocks.map((block) => (
                      <SortableBlockItem
                        key={block.id}
                        block={block}
                        onDelete={() => setBlocks((prev) => prev.filter((b) => b.id !== block.id))}
                        onUpdateData={(newData) =>
                          setBlocks((prev) => prev.map((b) => (b.id === block.id ? { ...b, data: newData } : b)))
                        }
                        onOpenMediaPicker={(field) => triggerMediaPicker(block.id, field)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}

            {/* Block Picker bar */}
            <div className="flex flex-wrap items-center gap-2 rounded-lg border border-olive/10 bg-cream/30 p-4">
              <span className="font-sans text-xs font-semibold uppercase tracking-wider text-olive/65 mr-2">Add Block:</span>
              <button type="button" onClick={() => addBlock("Hero")} className="rounded bg-olive/10 hover:bg-olive/20 px-3 py-1.5 text-xs font-sans font-medium text-olive transition-colors">+ Hero</button>
              <button type="button" onClick={() => addBlock("Text Block")} className="rounded bg-olive/10 hover:bg-olive/20 px-3 py-1.5 text-xs font-sans font-medium text-olive transition-colors">+ Text Block</button>
              <button type="button" onClick={() => addBlock("Feature Grid")} className="rounded bg-olive/10 hover:bg-olive/20 px-3 py-1.5 text-xs font-sans font-medium text-olive transition-colors">+ Feature Grid</button>
              <button type="button" onClick={() => addBlock("Image Block")} className="rounded bg-olive/10 hover:bg-olive/20 px-3 py-1.5 text-xs font-sans font-medium text-olive transition-colors">+ Image Block</button>
              <button type="button" onClick={() => addBlock("CTA Banner")} className="rounded bg-olive/10 hover:bg-olive/20 px-3 py-1.5 text-xs font-sans font-medium text-olive transition-colors">+ CTA Banner</button>
              <button type="button" onClick={() => addBlock("Testimonial")} className="rounded bg-olive/10 hover:bg-olive/20 px-3 py-1.5 text-xs font-sans font-medium text-olive transition-colors">+ Testimonial</button>
              <button type="button" onClick={() => addBlock("Concierge Contact")} className="rounded bg-olive/10 hover:bg-olive/20 px-3 py-1.5 text-xs font-sans font-medium text-olive transition-colors">+ Contact Section</button>
            </div>
          </div>
        </div>

        {/* Right Sticky Sidebar panel */}
        <aside className="space-y-4 xl:sticky xl:top-20">
          
          <div className="rounded-lg border border-olive/10 bg-paper p-4 shadow-sm">
            <h3 className="font-display text-lg font-semibold text-olive mb-3">SEO Metadata</h3>
            <SeoPanel
              seoMeta={seoMeta}
              onChange={setSeoMeta}
              slug={slug}
              defaultTitle={title}
              isPost={false}
            />
          </div>

          {/* Status & Featured image */}
          <div className="space-y-4 rounded-lg border border-olive/10 bg-paper p-4 shadow-sm font-sans text-sm">
            <label className="block text-xs font-semibold uppercase tracking-wider text-olive/80">Status
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as PageInput["status"])}
                className="mt-1 w-full rounded border border-olive/20 px-3 py-2 bg-cream/10"
              >
                <option value="Draft">Draft</option>
                <option value="Published">Published</option>
              </select>
            </label>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-olive/80">Featured Image</p>
              {featuredImageUrl && (
                <img src={featuredImageUrl} alt="Featured preview" className="mt-2 h-28 w-full rounded object-cover" />
              )}
              <button
                type="button"
                onClick={() => {
                  setMediaPickerTarget("featured");
                  setShowMedia(true);
                }}
                className="mt-2 w-full rounded border border-olive/20 px-3 py-2 text-xs font-medium hover:bg-cream/40"
              >
                Choose Image
              </button>
            </div>
          </div>

          {/* Save/Publish triggers */}
          <div className="grid gap-2 font-sans text-sm">
            <button
              disabled={isPending}
              type="button"
              onClick={() => startTransition(() => save("Draft"))}
              className="rounded bg-olive/15 px-4 py-2.5 font-semibold text-olive hover:bg-olive/20 disabled:opacity-50 transition-colors"
            >
              Save Draft
            </button>
            <button
              disabled={isPending}
              type="button"
              onClick={() => startTransition(() => save("Published"))}
              className="rounded bg-gold px-4 py-2.5 font-semibold text-olive hover:bg-[#ba8838] disabled:opacity-50 transition-colors"
            >
              Publish
            </button>
          </div>
        </aside>
      </div>

      {/* Media library dialog */}
      {showMedia && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4 font-sans">
          <div className="max-h-[80vh] w-full max-w-3xl overflow-auto rounded-lg bg-paper p-5 shadow-xl border border-olive/20">
            <div className="mb-4 flex justify-between items-center border-b border-olive/10 pb-3">
              <h2 className="font-display text-2xl text-olive font-semibold">Choose from Media Library</h2>
              <button onClick={() => setShowMedia(false)} className="rounded border border-olive/20 px-3 py-1 text-xs hover:bg-cream">
                Close
              </button>
            </div>
            {media.length ? (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {media.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => chooseMedia(item)}
                    className="rounded border border-olive/10 p-2 text-left bg-cream/10 hover:border-gold/60 transition-colors"
                  >
                    <img src={item.file_url} alt={item.alt_text} className="h-24 w-full object-cover rounded" />
                    <span className="mt-1.5 block truncate text-xs text-olive">{item.alt_text}</span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-olive/60">No media items are available yet.</p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
