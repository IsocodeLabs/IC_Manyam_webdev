"use client";

import { useCallback, useMemo, useState } from "react";
import { useDropzone, type FileRejection } from "react-dropzone";
import { useRouter } from "next/navigation";

import {
  uploadMediaToStorage,
  saveMediaRecord,
  deleteStorageFile,
  updateMediaMeta,
} from "./actions";
import { AltTextModal } from "@/components/media/AltTextModal";
import { MediaDetailModal } from "@/components/media/MediaDetailModal";

/* ───── Types ───── */
type MediaItem = {
  id: string;
  file_url: string;
  alt_text: string;
  caption: string | null;
  width: number | null;
  height: number | null;
  created_at: string | null;
};

type UploadingFile = {
  id: string;
  name: string;
  progress: number;
  error: string | null;
  done: boolean;
};

type PendingQueueItem = {
  fileUrl: string;
  storagePath: string;
  file: File;
};

type SortMode = "newest" | "oldest" | "name-az";
type ViewMode = "grid" | "list";

const ACCEPTED_TYPES: Record<string, string[]> = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
  "image/gif": [".gif"],
};

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_FILES = 10;

/* ───── Helpers ───── */
function extractFilename(url: string) {
  try {
    const path = new URL(url).pathname;
    const decoded = decodeURIComponent(path.split("/").pop() ?? "");
    return decoded.replace(/^\d+_/, "");
  } catch {
    return url;
  }
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "-";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(dateStr));
}

function formatDimensions(w: number | null, h: number | null) {
  if (!w || !h) return "-";
  return `${w} × ${h} px`;
}

function getImageDimensions(file: File): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    img.src = url;
  });
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export function MediaLibraryClient({
  initialMedia,
  userRole,
  initialUsageCounts,
}: {
  initialMedia: MediaItem[];
  userRole: string;
  initialUsageCounts: Record<string, number>;
}) {
  const router = useRouter();

  /* ── State ── */
  const [media, setMedia] = useState<MediaItem[]>(initialMedia);
  const [usageCounts, setUsageCounts] = useState<Record<string, number>>(initialUsageCounts);
  const [uploading, setUploading] = useState<UploadingFile[]>([]);
  const [view, setView] = useState<ViewMode>("grid");
  const [sort, setSort] = useState<SortMode>("newest");
  const [search, setSearch] = useState("");

  // Alt-text enforcement queue for uploaded files
  const [altTextQueue, setAltTextQueue] = useState<PendingQueueItem[]>([]);

  // Detail / edit modal
  const [detailItem, setDetailItem] = useState<MediaItem | null>(null);

  // Error banner
  const [error, setError] = useState("");

  /* ── Filtering & sorting ── */
  const filtered = useMemo(() => {
    let items = [...media];
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        (m) =>
          extractFilename(m.file_url).toLowerCase().includes(q) ||
          m.alt_text.toLowerCase().includes(q)
      );
    }
    items.sort((a, b) => {
      if (sort === "newest") return (b.created_at ?? "").localeCompare(a.created_at ?? "");
      if (sort === "oldest") return (a.created_at ?? "").localeCompare(b.created_at ?? "");
      return extractFilename(a.file_url).localeCompare(extractFilename(b.file_url));
    });
    return items;
  }, [media, search, sort]);

  /* ── Dropzone ── */
  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      setError("");

      if (rejectedFiles.length > 0) {
        const messages = rejectedFiles.map((r) => {
          const fileErrors = r.errors.map((e) => e.message).join(", ");
          return `${r.file.name}: ${fileErrors}`;
        });
        setError(messages.join(" | "));
      }

      if (acceptedFiles.length > MAX_FILES) {
        setError(`You can upload a maximum of ${MAX_FILES} files at once.`);
        return;
      }

      // Start uploading each file to storage
      acceptedFiles.forEach((file) => handleStorageUpload(file));
    },
    []
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: MAX_SIZE,
    maxFiles: MAX_FILES,
    multiple: true,
  });

  /* ── Upload storage logic ── */
  async function handleStorageUpload(file: File) {
    const tempId = Math.random().toString(36).substring(2, 11);
    setUploading((prev) => [
      ...prev,
      { id: tempId, name: file.name, progress: 15, error: null, done: false },
    ]);

    const progressTimer = setInterval(() => {
      setUploading((prev) =>
        prev.map((u) =>
          u.id === tempId && !u.done && u.progress < 90
            ? { ...u, progress: u.progress + Math.random() * 20 }
            : u
        )
      );
    }, 250);

    try {
      const fd = new FormData();
      fd.append("file", file);

      // Stage 1: Upload to Supabase Storage only
      const result = await uploadMediaToStorage(fd);

      clearInterval(progressTimer);
      setUploading((prev) =>
        prev.map((u) => (u.id === tempId ? { ...u, progress: 100, done: true } : u))
      );

      // Clean up progress bar after 1 second
      setTimeout(() => {
        setUploading((prev) => prev.filter((u) => u.id !== tempId));
      }, 1000);

      // Stage 2: Queue for Alt Text details entry
      setAltTextQueue((prev) => [
        ...prev,
        {
          fileUrl: result.fileUrl,
          storagePath: result.storagePath,
          file,
        },
      ]);
    } catch (err) {
      clearInterval(progressTimer);
      const msg = err instanceof Error ? err.message : "Upload failed.";
      setUploading((prev) =>
        prev.map((u) => (u.id === tempId ? { ...u, error: msg, done: true } : u))
      );
    }
  }

  /* ── Alt text modal saves ── */
  const handleSaveAltText = async (altText: string, caption: string) => {
    if (altTextQueue.length === 0) return;
    const current = altTextQueue[0];

    try {
      // Get image dimensions on client
      const dims = await getImageDimensions(current.file);

      // Save database record
      const savedItem = await saveMediaRecord(
        current.fileUrl,
        altText,
        caption,
        dims?.width ?? null,
        dims?.height ?? null
      );

      // Update state
      setMedia((prev) => [savedItem as MediaItem, ...prev]);
      setUsageCounts((prev) => ({ ...prev, [savedItem.id]: 0 }));

      // Pop queue
      setAltTextQueue((prev) => prev.slice(1));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Database save failed.");
    }
  };

  const handleCancelAltText = async () => {
    if (altTextQueue.length === 0) return;
    const current = altTextQueue[0];

    try {
      // Delete uploaded file from storage
      await deleteStorageFile(current.storagePath);
    } catch (err) {
      console.error("Cleanup error:", err);
    } finally {
      // Pop from queue anyway to clean up state
      setAltTextQueue((prev) => prev.slice(1));
    }
  };

  /* ── Metadata updates ── */
  const handleSaveMeta = async (altText: string, caption: string) => {
    if (!detailItem) return;
    await updateMediaMeta(detailItem.id, altText, caption);
    setMedia((prev) =>
      prev.map((m) =>
        m.id === detailItem.id
          ? { ...m, alt_text: altText.trim(), caption: caption.trim() || null }
          : m
      )
    );
    router.refresh();
  };

  const handleDeleteSuccess = () => {
    if (!detailItem) return;
    setMedia((prev) => prev.filter((m) => m.id !== detailItem.id));
    setUsageCounts((prev) => {
      const copy = { ...prev };
      delete copy[detailItem.id];
      return copy;
    });
    router.refresh();
  };

  const activeAltTextItem = altTextQueue[0] || null;

  /* ═══ RENDER ═══ */
  return (
    <section className="font-sans text-olive">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl font-semibold">Media Library</h1>
          <p className="mt-1 text-sm text-olive/60">
            Upload and manage images used across the website.
          </p>
        </div>
        <span className="text-sm text-olive/50">{media.length} item{media.length !== 1 && "s"}</span>
      </div>

      {error && (
        <div role="alert" className="mb-4 flex items-start gap-2 rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-800">
          <span className="shrink-0 mt-0.5">⚠️</span>
          <span>{error}</span>
          <button onClick={() => setError("")} className="ml-auto text-red-500 hover:text-red-800 font-semibold">×</button>
        </div>
      )}

      {/* ─── Upload Zone ─── */}
      <div
        {...getRootProps()}
        className={`relative mb-6 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition-all ${
          isDragActive
            ? "border-gold bg-gold/10 shadow-inner"
            : "border-gold/50 bg-ivory/60 hover:border-gold hover:bg-ivory"
        }`}
      >
        <input {...getInputProps()} />
        <div className="mb-3 text-4xl text-gold/70">
          {isDragActive ? "📥" : "🖼"}
        </div>
        <p className="text-sm font-medium text-olive/80">
          {isDragActive
            ? "Drop your images here..."
            : "Drag images here or click to select"}
        </p>
        <p className="mt-1 text-xs text-olive/50">
          JPEG, PNG, WebP, GIF — up to 10 MB each — max 10 files at once
        </p>
      </div>

      {/* ─── Upload Progress ─── */}
      {uploading.length > 0 && (
        <div className="mb-6 space-y-2">
          {uploading.map((u) => (
            <div
              key={u.id}
              className={`flex items-center gap-3 rounded-lg border p-3 text-sm ${
                u.error
                  ? "border-red-200 bg-red-50"
                  : u.done
                  ? "border-green-200 bg-green-50"
                  : "border-olive/10 bg-paper"
              }`}
            >
              <span className="shrink-0 text-xs font-mono truncate max-w-[180px]">{u.name}</span>
              <div className="flex-1">
                <div className="h-2 w-full rounded-full bg-olive/10 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      u.error ? "bg-red-400" : u.done ? "bg-green-500" : "bg-gold"
                    }`}
                    style={{ width: `${Math.min(u.progress, 100)}%` }}
                  />
                </div>
              </div>
              <span className="shrink-0 text-xs text-olive/60">
                {u.error ? "Failed" : u.done ? "Done" : `${Math.round(u.progress)}%`}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ─── Toolbar ─── */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          type="search"
          placeholder="Search by filename or alt text..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] rounded-lg border border-olive/20 bg-paper px-3 py-2 text-sm outline-none focus:border-gold placeholder:text-olive/40"
        />
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortMode)}
          className="rounded-lg border border-olive/20 bg-paper px-3 py-2 text-sm outline-none focus:border-gold"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="name-az">Name A-Z</option>
        </select>
        <div className="flex rounded-lg border border-olive/20 overflow-hidden">
          <button
            onClick={() => setView("grid")}
            className={`px-3 py-2 text-sm font-medium transition-colors ${
              view === "grid" ? "bg-gold text-olive" : "bg-paper text-olive/60 hover:bg-cream"
            }`}
            title="Grid view"
          >
            ▦
          </button>
          <button
            onClick={() => setView("list")}
            className={`px-3 py-2 text-sm font-medium transition-colors ${
              view === "list" ? "bg-gold text-olive" : "bg-paper text-olive/60 hover:bg-cream"
            }`}
            title="List view"
          >
            ☰
          </button>
        </div>
      </div>

      {/* ─── Empty State ─── */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-olive/10 bg-paper py-16 text-center">
          <span className="mb-3 text-5xl text-olive/20">🖼</span>
          <p className="text-sm text-olive/50">
            {search ? "No media items match your search." : "Your media library is empty. Upload some images to get started."}
          </p>
        </div>
      )}

      {/* ─── Grid View ─── */}
      {filtered.length > 0 && view === "grid" && (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="group relative overflow-hidden rounded-xl border border-olive/10 bg-paper shadow-sm transition-shadow hover:shadow-md cursor-pointer"
              onClick={() => setDetailItem(item)}
            >
              <div className="aspect-[4/3] w-full overflow-hidden bg-cream/40">
                <img
                  src={item.file_url}
                  alt={item.alt_text}
                  className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <div className="p-3 space-y-1">
                <p className="text-xs font-semibold text-olive truncate" title={extractFilename(item.file_url)}>
                  {extractFilename(item.file_url)}
                </p>
                <div className="flex items-center justify-between text-[11px] text-olive/50">
                  <span>{formatDimensions(item.width, item.height)}</span>
                  <span>{formatDate(item.created_at)}</span>
                </div>
              </div>
              {/* Hover overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  className="rounded-lg bg-paper/90 px-3.5 py-1.5 text-xs font-semibold text-olive hover:bg-paper shadow transition-colors"
                >
                  Edit Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── List View ─── */}
      {filtered.length > 0 && view === "list" && (
        <div className="overflow-hidden rounded-xl border border-olive/10 bg-paper shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm font-sans">
              <thead className="bg-ivory text-xs uppercase tracking-wide text-olive/70 border-b border-olive/10">
                <tr>
                  <th className="px-4 py-3 w-16">Thumb</th>
                  <th className="px-4 py-3">Filename</th>
                  <th className="px-4 py-3">Alt Text</th>
                  <th className="px-4 py-3">Dimensions</th>
                  <th className="px-4 py-3">Used On</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-olive/10">
                {filtered.map((item) => {
                  const uses = usageCounts[item.id] ?? 0;
                  return (
                    <tr key={item.id} className="hover:bg-cream/20 transition-colors">
                      <td className="px-4 py-2">
                        <button onClick={() => setDetailItem(item)} className="block">
                          <img
                            src={item.file_url}
                            alt={item.alt_text}
                            className="h-10 w-10 rounded object-cover border border-olive/10"
                            loading="lazy"
                          />
                        </button>
                      </td>
                      <td className="px-4 py-2 font-medium text-olive max-w-[180px] truncate" title={extractFilename(item.file_url)}>
                        {extractFilename(item.file_url)}
                      </td>
                      <td className="px-4 py-2 text-olive/70 max-w-[200px] truncate" title={item.alt_text}>
                        {item.alt_text}
                      </td>
                      <td className="px-4 py-2 text-olive/60 whitespace-nowrap">
                        {formatDimensions(item.width, item.height)}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        {uses === 0 ? (
                          <span className="text-xs text-olive/40 font-medium">0 uses</span>
                        ) : (
                          <button
                            onClick={() => setDetailItem(item)}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-gold hover:underline"
                          >
                            🔗 {uses} use{uses !== 1 && "s"}
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-2 text-olive/60 whitespace-nowrap">
                        {formatDate(item.created_at)}
                      </td>
                      <td className="px-4 py-2 text-right">
                        <button
                          onClick={() => setDetailItem(item)}
                          className="text-xs font-semibold text-gold hover:underline"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── Alt Text Modal (Enforcement Queue) ─── */}
      {activeAltTextItem && (
        <AltTextModal
          key={activeAltTextItem.fileUrl}
          imageUrl={activeAltTextItem.fileUrl}
          filename={activeAltTextItem.file.name}
          fileSize={activeAltTextItem.file.size}
          onSave={handleSaveAltText}
          onCancel={handleCancelAltText}
        />
      )}

      {/* ─── Image Details & Edit Modal ─── */}
      {detailItem && (
        <MediaDetailModal
          item={detailItem}
          userRole={userRole}
          onSave={handleSaveMeta}
          onDelete={handleDeleteSuccess}
          onClose={() => setDetailItem(null)}
        />
      )}
    </section>
  );
}
