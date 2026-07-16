"use client";

import { useState } from "react";
import {
  updateSeoMeta,
  exportSeoReport,
} from "./actions";
import { calculateSeoScore, type SeoMetaValue } from "@/lib/seo/utils";

type SeoItem = {
  id: string;
  title: string;
  slug: string;
  seo_meta: SeoMetaValue | null;
};

type SeoOverviewClientProps = {
  initialPages: SeoItem[];
  initialPosts: SeoItem[];
  initialPackages: SeoItem[];
  userRole: string;
};

type ActiveTab = "pages" | "posts" | "packages";

export function SeoOverviewClient({
  initialPages,
  initialPosts,
  initialPackages,
  userRole,
}: SeoOverviewClientProps) {
  const [tab, setTab] = useState<ActiveTab>("pages");
  const [pages, setPages] = useState<SeoItem[]>(initialPages);
  const [posts, setPosts] = useState<SeoItem[]>(initialPosts);
  const [packages, setPackages] = useState<SeoItem[]>(initialPackages);

  // Filters
  const [below75Only, setBelow75Only] = useState(false);

  // Inline editing state
  // tracks which item and field is being edited
  const [editing, setEditing] = useState<{
    id: string;
    field: "title" | "description";
    value: string;
  } | null>(null);

  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);

  const isEditor = ["Admin", "Content Manager"].includes(userRole);

  // Active list selection
  const getActiveList = () => {
    if (tab === "pages") return { list: pages, set: setPages, type: "page" as const };
    if (tab === "posts") return { list: posts, set: setPosts, type: "post" as const };
    return { list: packages, set: setPackages, type: "package" as const };
  };

  const { list: activeList, set: setActiveList, type: activeType } = getActiveList();

  // Score badge formatter
  const renderScoreBadge = (score: number) => {
    if (score < 50) {
      return (
        <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700 border border-red-200">
          🔴 Poor ({score})
        </span>
      );
    }
    if (score < 75) {
      return (
        <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200">
          🟡 Needs Work ({score})
        </span>
      );
    }
    if (score < 100) {
      return (
        <span className="inline-flex items-center rounded-full bg-gold/10 px-2 py-0.5 text-xs font-semibold text-gold border border-gold/20">
          🟡 Good ({score})
        </span>
      );
    }
    return (
      <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700 border border-green-200">
        🟢 Excellent ({score})
      </span>
    );
  };

  // Process and filter active items
  const processedItems = activeList.filter((item) => {
    if (below75Only) {
      const score = calculateSeoScore(item.seo_meta);
      return score < 75;
    }
    return true;
  });

  // Save inline edits
  const handleSaveInline = async (item: SeoItem, field: "title" | "description", newValue: string) => {
    if (!isEditor) return;
    
    // If no change, just reset editing
    const currentMeta = item.seo_meta || {};
    const currentValue = currentMeta[field] || "";
    if (newValue.trim() === currentValue.trim()) {
      setEditing(null);
      return;
    }

    setSavingId(item.id);
    setError("");
    try {
      const updatedMeta = {
        ...currentMeta,
        [field]: newValue.trim(),
      };

      await updateSeoMeta(activeType, item.id, updatedMeta);

      // Update local state
      setActiveList((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, seo_meta: updatedMeta } : i))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update metadata.");
    } finally {
      setSavingId(null);
      setEditing(null);
    }
  };

  // CSV Report exporter download trigger
  const handleExportCsv = async () => {
    setExporting(true);
    setError("");
    try {
      const csvContent = await exportSeoReport();
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `seo_audit_report_${Date.now()}.csv`);
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <section className="font-sans text-olive">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl font-semibold">SEO Overview</h1>
          <p className="mt-1 text-sm text-olive/60">
            Monitor and manage search engine optimisation metadata for all pages, posts, and packages.
          </p>
        </div>
        <div className="flex gap-2.5">
          <a
            href="/seo/sitemap"
            className="rounded-lg border border-olive/20 bg-paper px-4 py-2 text-sm font-semibold text-olive hover:bg-cream transition-colors"
          >
            Sitemap Settings
          </a>
          <a
            href="/seo/robots"
            className="rounded-lg border border-olive/20 bg-paper px-4 py-2 text-sm font-semibold text-olive hover:bg-cream transition-colors"
          >
            Robots.txt Editor
          </a>
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={exporting}
            className="rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-olive hover:bg-gold/90 disabled:opacity-40 transition-colors"
          >
            {exporting ? "Generating..." : "Export SEO Report (CSV)"}
          </button>
        </div>
      </div>

      {error && (
        <div role="alert" className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-800 border border-red-200 flex justify-between">
          <span>{error}</span>
          <button onClick={() => setError("")} className="font-semibold hover:text-red-950">×</button>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6 border-b border-olive/15 flex gap-1">
        {(["pages", "posts", "packages"] as const).map((tabName) => (
          <button
            key={tabName}
            onClick={() => {
              setTab(tabName);
              setEditing(null);
            }}
            className={`px-4 py-2.5 text-sm font-semibold capitalize tracking-wide transition-all border-b-2 ${
              tab === tabName
                ? "border-gold text-olive"
                : "border-transparent text-olive/60 hover:text-olive hover:border-olive/20"
            }`}
          >
            {tabName}
          </button>
        ))}
      </div>

      {/* Controls & Filter */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setBelow75Only(!below75Only)}
          className={`rounded-lg border px-3 py-2 text-xs font-semibold transition-all ${
            below75Only
              ? "bg-amber-50 text-amber-700 border-amber-300 shadow-sm"
              : "border-olive/20 hover:bg-cream/40"
          }`}
        >
          {below75Only ? "✓ Showing score < 75 only" : "Filter: Score below 75 only"}
        </button>
        <span className="text-xs text-olive/50">
          Showing {processedItems.length} of {activeList.length} item{activeList.length !== 1 && "s"}
        </span>
      </div>

      {/* Main Table */}
      <div className="overflow-hidden rounded-xl border border-olive/10 bg-paper shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm font-sans">
            <thead className="bg-ivory text-xs uppercase tracking-wide text-olive/70 border-b border-olive/10">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3 w-[220px]">Meta Title</th>
                <th className="px-4 py-3 w-[280px]">Meta Desc</th>
                <th className="px-4 py-3">OG Image</th>
                <th className="px-4 py-3">SEO Score</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-olive/10">
              {processedItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-olive/40 italic">
                    No items found.
                  </td>
                </tr>
              ) : (
                processedItems.map((item) => {
                  const score = calculateSeoScore(item.seo_meta);
                  const meta = item.seo_meta || {};
                  
                  // Read properties supporting camelCase fallbacks
                  const metaTitleVal = meta.title || "";
                  const metaDescVal = meta.description || "";
                  const ogImageVal = meta.og_image || meta.featuredImageUrl || "";

                  const isSaving = savingId === item.id;

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-cream/10 transition-colors ${
                        isSaving ? "opacity-50 pointer-events-none" : ""
                      }`}
                    >
                      {/* Title */}
                      <td className="px-4 py-3.5 font-medium text-olive max-w-[140px] truncate" title={item.title}>
                        {item.title}
                      </td>

                      {/* Slug */}
                      <td className="px-4 py-3.5 font-mono text-xs text-olive/60 max-w-[120px] truncate" title={item.slug}>
                        {item.slug}
                      </td>

                      {/* Meta Title (Inline Edit) */}
                      <td className="px-4 py-3.5 max-w-[220px]">
                        {isEditor &&
                        editing?.id === item.id &&
                        editing?.field === "title" ? (
                          <input
                            type="text"
                            autoFocus
                            value={editing.value}
                            onChange={(e) =>
                              setEditing({ ...editing, value: e.target.value.substring(0, 80) })
                            }
                            onBlur={() => handleSaveInline(item, "title", editing.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSaveInline(item, "title", editing.value);
                              if (e.key === "Escape") setEditing(null);
                            }}
                            className="w-full rounded border border-gold px-2 py-1 text-xs outline-none bg-white font-sans text-olive"
                          />
                        ) : (
                          <div
                            onClick={() => {
                              if (isEditor) {
                                setEditing({ id: item.id, field: "title", value: metaTitleVal });
                              }
                            }}
                            className={`min-h-[24px] cursor-pointer rounded px-1.5 py-0.5 hover:bg-cream/40 break-words ${
                              !metaTitleVal ? "text-olive/30 italic" : "text-olive/80"
                            }`}
                            title={isEditor ? "Click to edit inline" : undefined}
                          >
                            {metaTitleVal || "Not set"}
                          </div>
                        )}
                      </td>

                      {/* Meta Description (Inline Edit) */}
                      <td className="px-4 py-3.5 max-w-[280px]">
                        {isEditor &&
                        editing?.id === item.id &&
                        editing?.field === "description" ? (
                          <textarea
                            rows={2}
                            autoFocus
                            value={editing.value}
                            onChange={(e) =>
                              setEditing({ ...editing, value: e.target.value.substring(0, 200) })
                            }
                            onBlur={() => handleSaveInline(item, "description", editing.value)}
                            onKeyDown={(e) => {
                              // Save on enter without shift
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleSaveInline(item, "description", editing.value);
                              }
                              if (e.key === "Escape") setEditing(null);
                            }}
                            className="w-full rounded border border-gold px-2 py-1 text-xs outline-none bg-white resize-none font-sans text-olive"
                          />
                        ) : (
                          <div
                            onClick={() => {
                              if (isEditor) {
                                setEditing({ id: item.id, field: "description", value: metaDescVal });
                              }
                            }}
                            className={`min-h-[24px] cursor-pointer rounded px-1.5 py-0.5 hover:bg-cream/40 break-words line-clamp-2 ${
                              !metaDescVal ? "text-olive/30 italic" : "text-olive/80"
                            }`}
                            title={isEditor ? "Click to edit inline" : undefined}
                          >
                            {metaDescVal || "Not set"}
                          </div>
                        )}
                      </td>

                      {/* OG Image */}
                      <td className="px-4 py-3.5">
                        {ogImageVal ? (
                          <img
                            src={ogImageVal}
                            alt="OG Preview"
                            className="h-8 w-12 rounded object-cover border border-olive/10 shadow-sm"
                          />
                        ) : (
                          <span className="text-xs text-olive/30 italic">No image</span>
                        )}
                      </td>

                      {/* SEO Score */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {renderScoreBadge(score)}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <a
                          href={
                            activeType === "page"
                              ? `/pages-cms/${item.id}/edit`
                              : activeType === "post"
                              ? `/journal/${item.id}/edit`
                              : `/packages/${item.id}/edit`
                          }
                          className="text-xs font-semibold text-gold hover:underline"
                        >
                          Full Editor →
                        </a>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
