"use client";

import { useEffect, useState } from "react";

type AltTextModalProps = {
  imageUrl: string;
  filename: string;
  fileSize: number;
  onSave: (altText: string, caption: string) => void;
  onCancel: () => void;
};

export function AltTextModal({
  imageUrl,
  filename,
  fileSize,
  onSave,
  onCancel,
}: AltTextModalProps) {
  const [altText, setAltText] = useState("");
  const [caption, setCaption] = useState("");

  // Disable escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    window.addEventListener("keydown", handleKeyDown, true);
    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
    };
  }, []);

  const isValid = altText.trim().length > 0 && altText.length <= 150;
  const isCaptionValid = caption.length <= 200;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 font-sans text-olive"
      onClick={(e) => {
        // Prevent closing by clicking backdrop
        e.stopPropagation();
      }}
    >
      <div className="w-full max-w-2xl overflow-hidden rounded-xl bg-paper shadow-2xl border border-olive/20 flex flex-col md:flex-row">
        {/* Left Side Preview */}
        <div className="md:w-1/2 bg-cream/30 p-5 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-olive/15">
          <div className="aspect-square w-full max-w-[240px] overflow-hidden rounded-lg border border-olive/15 bg-white shadow-inner flex items-center justify-center">
            <img
              src={imageUrl}
              alt="Uploaded preview"
              className="h-full w-full object-contain"
            />
          </div>
          <div className="mt-4 text-center min-w-0 w-full">
            <p className="text-xs font-semibold uppercase tracking-wider text-olive/40">File Details</p>
            <p className="mt-1 text-sm font-medium text-olive truncate" title={filename}>
              {filename}
            </p>
            <p className="text-xs text-olive/60 mt-0.5">
              {(fileSize / 1024).toFixed(0)} KB
            </p>
          </div>
        </div>

        {/* Right Side Fields */}
        <div className="md:w-1/2 p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div>
              <h2 className="font-display text-2xl font-semibold text-olive">Image Details</h2>
              {/* Warning Banner */}
              <div className="mt-2.5 rounded-lg bg-gold/10 border border-gold/30 p-3 text-xs text-[#8f621b] leading-relaxed">
                <strong>Alt text is required for all images.</strong> This improves accessibility for screen readers and boosts your SEO.
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-semibold">
                Alt Text <span className="text-red-500">*</span>
                <textarea
                  value={altText}
                  onChange={(e) => setAltText(e.target.value.substring(0, 150))}
                  placeholder="Describe the image context (e.g. 'View of Taj Mahal during sunset')"
                  rows={3}
                  className={`mt-1 w-full rounded-lg border bg-cream/10 px-3 py-2 text-sm outline-none resize-none focus:border-gold ${
                    altText.length > 150 ? "border-red-500" : "border-olive/20"
                  }`}
                />
                <div className="mt-1 flex justify-between text-[11px]">
                  <span className="text-olive/50">
                    Describe the image for screen readers and search engines
                  </span>
                  <span className={`font-semibold ${altText.length >= 140 ? "text-red-600" : "text-olive/50"}`}>
                    {altText.length}/150
                  </span>
                </div>
              </label>

              <label className="block text-sm font-semibold">
                Caption <span className="text-olive/40 text-xs font-normal">(optional)</span>
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value.substring(0, 200))}
                  placeholder="Optional caption text shown to users"
                  className={`mt-1 w-full rounded-lg border bg-cream/10 px-3 py-2 text-sm outline-none focus:border-gold ${
                    caption.length > 200 ? "border-red-500" : "border-olive/20"
                  }`}
                />
                <div className="mt-1 flex justify-end text-[11px] text-olive/50">
                  <span>{caption.length}/200</span>
                </div>
              </label>
            </div>
          </div>

          <div className="flex gap-2.5 pt-2 text-sm justify-end">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-olive/20 px-4 py-2 hover:bg-cream/40 transition-colors"
            >
              Cancel Upload
            </button>
            <button
              type="button"
              onClick={() => {
                if (isValid && isCaptionValid) {
                  onSave(altText, caption);
                }
              }}
              disabled={!isValid || !isCaptionValid}
              className="rounded-lg bg-gold px-5 py-2 font-semibold text-olive hover:bg-gold/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Save Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
