"use client";

import { useEffect, useState } from "react";
import { getMediaUsageAction, deleteMedia } from "@/app/media/actions";

type UsageResult = {
  type: "page" | "post" | "package";
  title: string;
  id: string;
  editUrl: string;
};

type MediaItem = {
  id: string;
  file_url: string;
  alt_text: string;
  caption: string | null;
  width: number | null;
  height: number | null;
  created_at: string | null;
};

type MediaDetailModalProps = {
  item: MediaItem;
  userRole: string;
  onSave: (altText: string, caption: string) => Promise<void>;
  onDelete: () => void;
  onClose: () => void;
};

function extractFilename(url: string) {
  try {
    const path = new URL(url).pathname;
    const decoded = decodeURIComponent(path.split("/").pop() ?? "");
    return decoded.replace(/^\d+_/, "");
  } catch {
    return url;
  }
}

export function MediaDetailModal({
  item,
  userRole,
  onSave,
  onDelete,
  onClose,
}: MediaDetailModalProps) {
  const [altText, setAltText] = useState(item.alt_text);
  const [caption, setCaption] = useState(item.caption ?? "");
  
  // Usage tracking state
  const [usages, setUsages] = useState<UsageResult[]>([]);
  const [loadingUsage, setLoadingUsage] = useState(true);

  // Deletion warnings
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Copy feedback
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isEditor = ["Admin", "Content Manager"].includes(userRole);

  // Load usage information
  useEffect(() => {
    let active = true;
    async function loadUsage() {
      setLoadingUsage(true);
      try {
        const usageData = await getMediaUsageAction(item.file_url);
        if (active) {
          setUsages(usageData);
        }
      } catch (err) {
        console.error("Error loading usage:", err);
      } finally {
        if (active) {
          setLoadingUsage(false);
        }
      }
    }
    loadUsage();
    return () => {
      active = false;
    };
  }, [item.file_url]);

  // Copy to clipboard
  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(item.file_url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy URL:", err);
    }
  };

  const handleSave = async () => {
    if (!altText.trim()) {
      setError("Alt text is required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onSave(altText, caption);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    setError("");
    try {
      await deleteMedia(item.id);
      onDelete();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed.");
    } finally {
      setDeleting(false);
      setShowConfirmDelete(false);
    }
  };

  const hasUsage = usages.length > 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 font-sans text-olive"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl overflow-hidden rounded-xl bg-paper shadow-2xl border border-olive/20 flex flex-col md:flex-row max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left: Preview Image */}
        <div className="md:w-1/2 bg-cream/20 p-6 flex items-center justify-center border-b md:border-b-0 md:border-r border-olive/15 overflow-auto">
          <img
            src={item.file_url}
            alt={item.alt_text}
            className="max-h-[300px] md:max-h-[420px] w-full object-contain rounded-lg shadow-sm"
          />
        </div>

        {/* Right: Info & Fields */}
        <div className="md:w-1/2 p-6 flex flex-col justify-between overflow-y-auto max-h-[450px] md:max-h-none">
          <div className="space-y-4">
            <div className="flex justify-between items-start border-b border-olive/10 pb-3">
              <div>
                <h2 className="font-display text-xl font-semibold">Media Details</h2>
                <p className="text-xs text-olive/50 break-all truncate max-w-[260px] font-mono mt-0.5">
                  {extractFilename(item.file_url)}
                </p>
              </div>
              <button
                onClick={onClose}
                className="rounded border border-olive/20 px-2 py-1 text-xs hover:bg-cream/40"
              >
                Close
              </button>
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 p-2.5 text-xs text-red-800 border border-red-150">
                {error}
              </p>
            )}

            {/* Read-only details */}
            <div className="grid grid-cols-2 gap-3 text-xs border-b border-olive/10 pb-3">
              <div>
                <span className="font-semibold uppercase tracking-wide text-olive/50">Dimensions</span>
                <p className="mt-0.5 text-olive font-medium">
                  {item.width && item.height ? `${item.width} × ${item.height} px` : "-"}
                </p>
              </div>
              <div>
                <span className="font-semibold uppercase tracking-wide text-olive/50">Date Added</span>
                <p className="mt-0.5 text-olive font-medium">
                  {item.created_at
                    ? new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(
                        new Date(item.created_at)
                      )
                    : "-"}
                </p>
              </div>
            </div>

            {/* Copyable File URL */}
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-olive/50">File URL</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={item.file_url}
                  className="flex-1 rounded-md border border-olive/15 bg-ivory/50 px-2.5 py-1 text-xs text-olive/70 outline-none select-all font-mono"
                />
                <button
                  type="button"
                  onClick={handleCopyUrl}
                  className={`rounded border px-3 py-1 text-xs font-semibold whitespace-nowrap transition-colors ${
                    copied
                      ? "bg-green-50 text-green-700 border-green-200"
                      : "border-olive/20 hover:bg-cream/40"
                  }`}
                >
                  {copied ? "Copied!" : "Copy URL"}
                </button>
              </div>
            </div>

            {/* Editable Fields */}
            <div className="space-y-3 pt-1">
              <label className="block text-sm font-semibold">
                Alt Text <span className="text-red-500">*</span>
                <input
                  type="text"
                  value={altText}
                  onChange={(e) => setAltText(e.target.value.substring(0, 150))}
                  placeholder="Describe image for accessibility"
                  className="mt-1 w-full rounded-lg border border-olive/20 bg-cream/10 px-3 py-2 text-sm outline-none focus:border-gold"
                />
                <div className="mt-1 flex justify-between text-[10px] text-olive/50">
                  <span>Describe the image for screen readers and search engines</span>
                  <span className={altText.length >= 140 ? "text-red-600 font-semibold" : ""}>
                    {altText.length}/150
                  </span>
                </div>
              </label>

              <label className="block text-sm font-semibold">
                Caption
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value.substring(0, 200))}
                  placeholder="Optional display caption"
                  className="mt-1 w-full rounded-lg border border-olive/20 bg-cream/10 px-3 py-2 text-sm outline-none focus:border-gold"
                />
                <div className="mt-1 flex justify-end text-[10px] text-olive/50">
                  <span>{caption.length}/200</span>
                </div>
              </label>
            </div>

            {/* Used On Section */}
            <div className="border-t border-olive/10 pt-3 space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-olive/50">Used On</span>
              {loadingUsage ? (
                <div className="flex items-center gap-2 text-xs text-olive/50 py-1 italic">
                  <span className="animate-spin text-gold">⌛</span> Checking usage...
                </div>
              ) : usages.length === 0 ? (
                <p className="text-xs text-olive/60 italic py-1">Not currently used on any page</p>
              ) : (
                <div className="space-y-1 max-h-[100px] overflow-y-auto pr-1">
                  {usages.map((u) => (
                    <a
                      key={u.id}
                      href={u.editUrl}
                      className="flex items-center justify-between text-xs text-olive/80 hover:text-gold hover:underline p-1 bg-cream/10 rounded transition-colors"
                    >
                      <span className="flex items-center gap-1.5">
                        <span className="text-gold">
                          {u.type === "page" ? "📄" : u.type === "post" ? "✍️" : "🎒"}
                        </span>
                        <strong className="font-medium truncate max-w-[160px]">{u.title}</strong>
                      </span>
                      <span className="text-[10px] font-mono text-olive/50 uppercase tracking-wide">
                        {u.type}
                      </span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-olive/10 mt-4 text-sm">
            <div>
              {isEditor && (
                <button
                  type="button"
                  onClick={() => setShowConfirmDelete(true)}
                  className="text-xs font-semibold text-red-700 hover:underline"
                >
                  Delete Image
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-olive/20 px-4 py-2 hover:bg-cream/40"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || !altText.trim()}
                className="rounded-lg bg-gold px-5 py-2 font-semibold text-olive hover:bg-gold/90 disabled:opacity-40"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete confirmation alert with Usage checks */}
      {showConfirmDelete && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[60] grid place-items-center bg-black/75 p-4 font-sans text-olive"
          onClick={() => setShowConfirmDelete(false)}
        >
          <div
            className="w-full max-w-md rounded-xl bg-paper p-6 shadow-2xl border border-red-200 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display text-xl font-bold text-red-800">Confirm Deletion</h3>
            {hasUsage ? (
              <div className="space-y-2 bg-red-50 border border-red-200 rounded-lg p-3.5 text-xs text-red-800 leading-relaxed">
                <p className="font-bold">⚠️ WARNING: This image is in use!</p>
                <p>
                  This image is used on <strong>{usages.length} page(s) and/or post(s)</strong>. Deleting it will leave broken images on those public components.
                </p>
                <p className="font-medium">Are you sure you want to delete it anyway?</p>
              </div>
            ) : (
              <p className="text-sm text-olive/80">
                Are you sure you want to permanently delete this image from your Media Library? This action cannot be undone.
              </p>
            )}

            <div className="flex justify-end gap-2.5 pt-2 text-sm">
              <button
                type="button"
                onClick={() => setShowConfirmDelete(false)}
                className="rounded-lg border border-olive/20 px-4 py-2 hover:bg-cream"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-lg bg-red-600 px-5 py-2 font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? "Deleting..." : hasUsage ? "Delete Anyway" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
