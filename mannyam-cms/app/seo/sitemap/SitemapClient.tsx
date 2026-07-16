"use client";

import { useEffect, useState, useTransition } from "react";
import { revalidateSitemap } from "./actions";

interface SitemapEntry {
  loc: string;
  lastmod: string;
  changefreq: string;
  priority: string;
}

export function SitemapClient({ lastContentUpdate }: { lastContentUpdate: string | null }) {
  const [entries, setEntries] = useState<SitemapEntry[]>([]);
  const [rawXml, setRawXml] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const [revalidatedAt, setRevalidatedAt] = useState<string | null>(null);

  async function fetchSitemap() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/sitemap", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const xml = await res.text();
      setRawXml(xml);

      // Parse <url> entries from XML
      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, "application/xml");
      const urlNodes = doc.querySelectorAll("url");
      const parsed: SitemapEntry[] = [];
      urlNodes.forEach((node) => {
        parsed.push({
          loc: node.querySelector("loc")?.textContent ?? "",
          lastmod: node.querySelector("lastmod")?.textContent ?? "",
          changefreq: node.querySelector("changefreq")?.textContent ?? "",
          priority: node.querySelector("priority")?.textContent ?? "",
        });
      });
      setEntries(parsed);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load sitemap");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSitemap();
  }, []);

  function handleForceRegenerate() {
    startTransition(async () => {
      try {
        const result = await revalidateSitemap();
        setRevalidatedAt(result.revalidatedAt);
        await fetchSitemap();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Revalidation failed");
      }
    });
  }

  const formattedLastUpdate = lastContentUpdate
    ? new Intl.DateTimeFormat("en-GB", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(lastContentUpdate))
    : "No published content";

  const formattedRevalidatedAt = revalidatedAt
    ? new Intl.DateTimeFormat("en-GB", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(revalidatedAt))
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-semibold text-olive">Sitemap Settings</h1>
        <p className="mt-1 text-sm text-olive/70">
          Manage and preview your auto-generated sitemap.xml for search engine indexing.
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-olive/10 bg-paper p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-olive/60">Total URLs</p>
          <p className="mt-1 font-display text-2xl font-bold text-olive">
            {loading ? "..." : entries.length}
          </p>
        </div>
        <div className="rounded-lg border border-olive/10 bg-paper p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-olive/60">
            Latest Content Update
          </p>
          <p className="mt-1 text-sm font-medium text-olive">{formattedLastUpdate}</p>
        </div>
        <div className="rounded-lg border border-olive/10 bg-paper p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-olive/60">
            Last Regenerated
          </p>
          <p className="mt-1 text-sm font-medium text-olive">
            {formattedRevalidatedAt ?? "On last deploy or content change"}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleForceRegenerate}
          disabled={isPending}
          className="rounded-lg bg-gold px-5 py-2.5 text-sm font-semibold text-olive shadow-sm transition hover:bg-gold/90 disabled:opacity-50"
        >
          {isPending ? "Regenerating..." : "Force Regenerate"}
        </button>
        <a
          href="/api/sitemap"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg border border-olive/20 bg-paper px-5 py-2.5 text-sm font-medium text-olive shadow-sm transition hover:bg-cream"
        >
          View Raw XML
        </a>
        <a
          href="https://search.google.com/search-console/sitemaps"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg border border-olive/20 bg-paper px-5 py-2.5 text-sm font-medium text-olive shadow-sm transition hover:bg-cream"
        >
          Submit to Google Search Console
        </a>
      </div>

      {/* Google Submission Instructions */}
      <div className="rounded-lg border border-gold/30 bg-gold/5 p-4">
        <p className="text-sm font-medium text-olive">How to submit your sitemap to Google:</p>
        <ol className="mt-2 list-inside list-decimal space-y-1 text-sm text-olive/80">
          <li>Click &quot;Submit to Google Search Console&quot; above</li>
          <li>Select your property (mannyam.in)</li>
          <li>
            Enter the sitemap URL:{" "}
            <code className="rounded bg-olive/10 px-1.5 py-0.5 text-xs font-mono">
              https://mannyam.in/api/sitemap
            </code>
          </li>
          <li>Click &quot;Submit&quot; and wait for Google to process it</li>
        </ol>
      </div>

      {/* Error State */}
      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* Live Preview Table */}
      <div className="rounded-lg border border-olive/10 bg-paper shadow-sm">
        <div className="border-b border-olive/10 px-5 py-3">
          <h2 className="font-display text-lg font-semibold text-olive">
            Sitemap Preview ({entries.length} URLs)
          </h2>
        </div>
        {loading ? (
          <div className="px-5 py-10 text-center text-sm text-olive/50">Loading sitemap...</div>
        ) : entries.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-olive/50">
            No published content found. Publish pages, posts, or packages to populate the sitemap.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-olive/10 bg-cream text-xs font-semibold uppercase tracking-wider text-olive/70">
                  <th className="px-5 py-3">URL</th>
                  <th className="px-5 py-3">Last Modified</th>
                  <th className="px-5 py-3">Frequency</th>
                  <th className="px-5 py-3">Priority</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, idx) => (
                  <tr key={idx} className="border-b border-olive/5 hover:bg-cream/50">
                    <td className="px-5 py-3">
                      <a
                        href={entry.loc}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gold-deep underline decoration-gold/30 hover:decoration-gold"
                      >
                        {entry.loc.replace(/^https?:\/\/[^/]+/, "")}
                      </a>
                    </td>
                    <td className="px-5 py-3 text-olive/70">{entry.lastmod}</td>
                    <td className="px-5 py-3 text-olive/70">{entry.changefreq}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          parseFloat(entry.priority) >= 0.9
                            ? "bg-green-100 text-green-800"
                            : parseFloat(entry.priority) >= 0.8
                              ? "bg-blue-100 text-blue-800"
                              : parseFloat(entry.priority) >= 0.7
                                ? "bg-amber-100 text-amber-800"
                                : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {entry.priority}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Raw XML Preview */}
      {rawXml && (
        <details className="rounded-lg border border-olive/10 bg-paper shadow-sm">
          <summary className="cursor-pointer px-5 py-3 text-sm font-semibold text-olive hover:bg-cream/50">
            View Raw XML Source
          </summary>
          <pre className="max-h-96 overflow-auto border-t border-olive/10 bg-cream/30 px-5 py-4 font-mono text-xs leading-relaxed text-olive/80">
            {rawXml}
          </pre>
        </details>
      )}
    </div>
  );
}
