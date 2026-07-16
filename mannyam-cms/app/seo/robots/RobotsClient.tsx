"use client";

import { useState, useTransition } from "react";
import { saveRobotsTxt, resetRobotsTxt } from "./actions";

interface RobotsClientProps {
  isAdmin: boolean;
  initialValue: string | null;
}

export function RobotsClient({ isAdmin, initialValue }: RobotsClientProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mannyam.in";
  const defaultText = `User-agent: *
Allow: /
Disallow: /dashboard/
Disallow: /api/
Sitemap: ${siteUrl}/api/sitemap`;

  const [content, setContent] = useState(initialValue ?? defaultText);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const isModified = content !== (initialValue ?? defaultText);

  function handleSave() {
    if (!isAdmin) return;
    setMessage("");
    setError("");
    startTransition(async () => {
      try {
        await saveRobotsTxt(content);
        setMessage("Robots.txt updated successfully.");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save changes.");
      }
    });
  }

  function handleReset() {
    if (!isAdmin) return;
    setMessage("");
    setError("");
    if (window.confirm("Are you sure you want to reset robots.txt to default settings?")) {
      startTransition(async () => {
        try {
          await resetRobotsTxt();
          setContent(defaultText);
          setMessage("Robots.txt restored to defaults.");
        } catch (err) {
          setError(err instanceof Error ? err.message : "Failed to reset.");
        }
      });
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-semibold text-olive">Robots.txt Editor</h1>
        <p className="mt-1 text-sm text-olive/70">
          Configure search engine crawler rules. Changes take effect immediately at the public endpoint.
        </p>
      </div>

      {/* Editor Box */}
      <div className="rounded-lg border border-olive/10 bg-paper p-6 shadow-sm space-y-4">
        <div>
          <label className="block text-sm font-semibold text-olive mb-1">
            Rules (text format)
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={!isAdmin || isPending}
            rows={10}
            className="w-full font-mono text-sm p-4 border border-olive/20 rounded-lg bg-cream/20 focus:outline-none focus:border-gold disabled:opacity-75 disabled:bg-cream/10"
            placeholder="User-agent: *..."
          />
        </div>

        {/* Status Indicators */}
        <div className="flex items-center justify-between text-xs text-olive/60 font-mono">
          <span>Characters: {content.length}</span>
          {!isAdmin && (
            <span className="text-red-700 font-semibold uppercase tracking-wide">
              Read-Only: Admin access required to make edits
            </span>
          )}
        </div>

        {/* Feedback Messages */}
        {message && (
          <div className="rounded bg-green-50 border border-green-200 p-3 text-sm text-green-800">
            {message}
          </div>
        )}
        {error && (
          <div className="rounded bg-red-50 border border-red-200 p-3 text-sm text-red-800">
            {error}
          </div>
        )}

        {/* Control Row */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          {isAdmin && (
            <>
              <button
                type="button"
                onClick={handleSave}
                disabled={isPending || !isModified}
                className="rounded-lg bg-gold px-5 py-2.5 text-sm font-semibold text-olive shadow-sm transition hover:bg-gold/90 disabled:opacity-50"
              >
                {isPending ? "Saving..." : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={handleReset}
                disabled={isPending}
                className="rounded-lg border border-olive/20 bg-paper px-5 py-2.5 text-sm font-medium text-olive shadow-sm transition hover:bg-cream disabled:opacity-50"
              >
                Reset to Default
              </button>
            </>
          )}
          <a
            href="/api/robots"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-olive/20 bg-paper px-5 py-2.5 text-sm font-medium text-olive shadow-sm transition hover:bg-cream"
          >
            Preview Live robots.txt
          </a>
        </div>
      </div>

      {/* Guide Info */}
      <div className="rounded-lg border border-olive/10 bg-cream/30 p-5 space-y-2">
        <h3 className="font-display text-md font-semibold text-olive">Common Rules Reference</h3>
        <ul className="list-disc list-inside space-y-1 text-xs text-olive/80">
          <li><code className="bg-olive/10 px-1 py-0.5 rounded font-mono">User-agent: *</code> applies rules to all search crawlers.</li>
          <li><code className="bg-olive/10 px-1 py-0.5 rounded font-mono">Disallow: /path/</code> blocks crawlers from index matching URLs starting with that prefix.</li>
          <li><code className="bg-olive/10 px-1 py-0.5 rounded font-mono">Sitemap: URL</code> helps search engines locate your sitemap XML directly.</li>
        </ul>
      </div>
    </div>
  );
}
