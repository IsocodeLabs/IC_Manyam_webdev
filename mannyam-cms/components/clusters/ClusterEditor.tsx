"use client";

import React, { useState, useEffect, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  createCluster,
  updateCluster,
  addInternalLink,
  removeInternalLink,
  checkSpokeLinkToPillar,
  type SpokeInput
} from "@/app/clusters/actions";
import { getLinkRecommendations, type Recommendation } from "@/lib/clusters/getLinkRecommendations";

// Type definitions matching actions
type SpokeItem = {
  id: string;
  title: string;
  slug: string;
  type: "Page" | "Post" | "Package";
  content?: unknown;
};

type OptionItem = {
  id: string;
  title: string;
  slug: string;
  type: "Page" | "Post" | "Package";
};

type InternalLinkRow = {
  id: string;
  source_id: string;
  target_id: string;
  anchor_text: string;
  created_at: string | null;
  src_title?: string;
  tgt_title?: string;
};

type ClusterData = {
  id: string;
  name: string;
  pillar_page_id: string;
  spokes: SpokeItem[];
  internalLinks: InternalLinkRow[];
};

type ClusterEditorProps = {
  cluster: ClusterData | null; // null for Create Mode
  pillarOptions: OptionItem[];
  spokeOptions: OptionItem[];
  role: string;
};

export function ClusterEditor({
  cluster,
  pillarOptions,
  spokeOptions,
  role,
}: ClusterEditorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const isEditMode = !!cluster;
  const canWrite = ["Admin", "Content Manager"].includes(role);

  // Tabs: "editor" | "links"
  const [activeTab, setActiveTab] = useState<"editor" | "links">("editor");

  // Core Form State
  const [name, setName] = useState(cluster?.name || "");
  const [pillarId, setPillarId] = useState(cluster?.pillar_page_id || "");
  const [selectedSpokes, setSelectedSpokes] = useState<SpokeItem[]>(cluster?.spokes || []);
  const [internalLinks, setInternalLinks] = useState<InternalLinkRow[]>(cluster?.internalLinks || []);

  // UI state
  const [isSpokeModalOpen, setIsSpokeModalOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [spokeSearch, setSpokeSearch] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Add Link Modal Form state
  const [linkSource, setLinkSource] = useState("");
  const [linkTarget, setLinkTarget] = useState("");
  const [linkAnchor, setLinkAnchor] = useState("");
  const [linkError, setLinkError] = useState("");

  // link audit status: maps spokeId to boolean (true = linked, false = no link)
  const [spokeLinks, setSpokeLinks] = useState<Record<string, boolean>>({});

  // Dismissed recommendations list (persists during the session)
  const [dismissedRecs, setDismissedRecs] = useState<string[]>([]);

  // Get active pillar details
  const pillarDetails = useMemo(() => {
    return pillarOptions.find((p) => p.id === pillarId);
  }, [pillarId, pillarOptions]);

  // 1. Audit link status on load / spoke list change
  useEffect(() => {
    if (!pillarDetails) {
      setSpokeLinks({});
      return;
    }

    const auditSpokes = async () => {
      const results: Record<string, boolean> = {};
      for (const spoke of selectedSpokes) {
        // A spoke is considered linked if a record exists in internalLinks OR if the content check returns true
        const inDb = internalLinks.some(
          (il) => il.source_id === spoke.id && il.target_id === pillarId
        );
        if (inDb) {
          results[spoke.id] = true;
        } else {
          try {
            const hasLink = await checkSpokeLinkToPillar(spoke.id, spoke.type, pillarDetails.slug);
            results[spoke.id] = hasLink;
          } catch {
            results[spoke.id] = false;
          }
        }
      }
      setSpokeLinks(results);
    };

    auditSpokes();
  }, [selectedSpokes, pillarId, pillarDetails, internalLinks]);

  // 2. Generate Recommendations (only in Edit Mode, when we have spoke content)
  const recommendations = useMemo(() => {
    if (!isEditMode || !pillarDetails) return [];
    
    // Spokes with content available
    const spokesWithContent = selectedSpokes.map((s) => ({
      id: s.id,
      title: s.title,
      content: s.content || "",
    }));

    const recs = getLinkRecommendations(
      pillarDetails.title,
      pillarDetails.slug,
      spokesWithContent,
      internalLinks,
      pillarId
    );

    // Filter out dismissed ones
    return recs.filter((r) => !dismissedRecs.includes(`${r.spokeId}-${r.keywordFound}`));
  }, [isEditMode, pillarDetails, selectedSpokes, internalLinks, pillarId, dismissedRecs]);

  // Spoke selection options (exclude already selected and exclude the pillar page itself)
  const availableSpokeOptions = useMemo(() => {
    return spokeOptions.filter((opt) => {
      const isAlreadySelected = selectedSpokes.some((s) => s.id === opt.id);
      const isPillar = opt.id === pillarId;
      return !isAlreadySelected && !isPillar;
    });
  }, [spokeOptions, selectedSpokes, pillarId]);

  // Filtered Spoke selector modal list
  const filteredModalOptions = useMemo(() => {
    return availableSpokeOptions.filter((opt) =>
      opt.title.toLowerCase().includes(spokeSearch.toLowerCase()) ||
      opt.slug.toLowerCase().includes(spokeSearch.toLowerCase())
    );
  }, [availableSpokeOptions, spokeSearch]);

  // Add Spoke Handler
  function handleAddSpoke(item: OptionItem) {
    if (item.id === pillarId) {
      alert("Error: You cannot add the pillar page as a spoke.");
      return;
    }
    setSelectedSpokes([...selectedSpokes, item]);
    setIsSpokeModalOpen(false);
    setSpokeSearch("");
  }

  // Remove Spoke Handler
  function handleRemoveSpoke(id: string) {
    setSelectedSpokes(selectedSpokes.filter((s) => s.id !== id));
  }

  // Save Cluster (Insert / Update)
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canWrite) return;
    setErrorMsg("");

    const cleanName = name.trim();
    if (!cleanName) {
      setErrorMsg("Cluster Name is required.");
      return;
    }
    if (!pillarId) {
      setErrorMsg("Pillar Page is required.");
      return;
    }

    const spokesInput: SpokeInput[] = selectedSpokes.map((s) => ({
      id: s.id,
      type: s.type,
    }));

    startTransition(async () => {
      try {
        if (isEditMode && cluster) {
          await updateCluster(cluster.id, cleanName, pillarId, spokesInput);
        } else {
          await createCluster(cleanName, pillarId, spokesInput);
        }
        router.push("/clusters");
        router.refresh();
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : "Failed to save cluster.");
      }
    });
  }

  // Add Internal Link
  async function handleAddLinkSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canWrite) return;
    setLinkError("");

    if (!linkSource) {
      setLinkError("Source page is required.");
      return;
    }
    if (!linkTarget) {
      setLinkError("Target page is required.");
      return;
    }
    if (!linkAnchor.trim()) {
      setLinkError("Anchor Text is required.");
      return;
    }

    startTransition(async () => {
      try {
        const result = await addInternalLink(linkSource, linkTarget, linkAnchor);
        // Add locally to update UI instantly before page reloads
        const srcItem = spokeOptions.find((o) => o.id === linkSource) || pillarOptions.find((o) => o.id === linkSource);
        const tgtItem = spokeOptions.find((o) => o.id === linkTarget);
        
        const newRow: InternalLinkRow = {
          id: result.id,
          source_id: linkSource,
          target_id: linkTarget,
          anchor_text: linkAnchor.trim(),
          created_at: new Date().toISOString(),
          src_title: srcItem?.title || "Unknown",
          tgt_title: tgtItem?.title || "Unknown"
        };
        setInternalLinks([...internalLinks, newRow]);
        
        setIsLinkModalOpen(false);
        setLinkSource("");
        setLinkTarget("");
        setLinkAnchor("");
      } catch (err) {
        setLinkError(err instanceof Error ? err.message : "Failed to add internal link.");
      }
    });
  }

  // Remove Internal Link
  async function handleRemoveLink(id: string) {
    if (!canWrite) return;
    if (!window.confirm("Are you sure you want to remove this internal link?")) return;

    startTransition(async () => {
      try {
        await removeInternalLink(id);
        setInternalLinks(internalLinks.filter((il) => il.id !== id));
      } catch (err) {
        alert(err instanceof Error ? err.message : "Failed to remove internal link.");
      }
    });
  }

  // Pre-fill modal from a Suggested Link recommendation
  function handleAcceptRecommendation(rec: Recommendation) {
    setLinkSource(rec.spokeId);
    setLinkTarget(pillarId);
    setLinkAnchor(rec.suggestedAnchorText);
    setLinkError("");
    setIsLinkModalOpen(true);
  }

  // Dismiss Recommendation
  function handleDismissRecommendation(rec: Recommendation) {
    setDismissedRecs([...dismissedRecs, `${rec.spokeId}-${rec.keywordFound}`]);
  }

  // Options for internal link source (Only Pages or Posts inside this cluster: Pillar + Spokes of type Page/Post)
  const linkSourceOptions = useMemo(() => {
    const options: OptionItem[] = [];
    if (pillarDetails) {
      options.push(pillarDetails);
    }
    selectedSpokes.forEach((spoke) => {
      if (spoke.type === "Page" || spoke.type === "Post") {
        options.push(spoke);
      }
    });
    return options;
  }, [pillarDetails, selectedSpokes]);

  // Options for internal link target (Pillar + any Spokes in this cluster)
  const linkTargetOptions = useMemo(() => {
    const options: OptionItem[] = [];
    if (pillarDetails) {
      options.push(pillarDetails);
    }
    selectedSpokes.forEach((spoke) => {
      options.push(spoke);
    });
    return options;
  }, [pillarDetails, selectedSpokes]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-olive/10 pb-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-olive">
            {isEditMode ? `Edit Cluster: ${cluster?.name}` : "Create Topic Cluster"}
          </h1>
          <p className="mt-1 text-sm text-olive/70">
            Define high-intent content pillars and map them to supporting hub-and-spoke details.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => router.push("/clusters")}
            className="rounded-lg border border-olive/20 px-4 py-2 text-sm font-medium text-olive hover:bg-cream"
          >
            Back to List
          </button>
        </div>
      </div>

      {/* Tabs */}
      {isEditMode && (
        <div className="flex border-b border-olive/15">
          <button
            type="button"
            onClick={() => setActiveTab("editor")}
            className={`px-5 py-2.5 font-sans text-sm font-semibold border-b-2 transition-all ${
              activeTab === "editor"
                ? "border-gold text-gold"
                : "border-transparent text-olive/60 hover:text-olive hover:border-olive/25"
            }`}
          >
            Cluster Editor
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("links")}
            className={`px-5 py-2.5 font-sans text-sm font-semibold border-b-2 transition-all ${
              activeTab === "links"
                ? "border-gold text-gold"
                : "border-transparent text-olive/60 hover:text-olive hover:border-olive/25"
            }`}
          >
            Internal Links ({internalLinks.length})
          </button>
        </div>
      )}

      {activeTab === "editor" ? (
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Main Form Fields */}
          <form onSubmit={handleSubmit} className="space-y-6 lg:col-span-7">
            {errorMsg && (
              <div className="rounded bg-red-50 border border-red-200 p-3 text-xs text-red-800">
                {errorMsg}
              </div>
            )}

            <div className="rounded-lg border border-olive/10 bg-paper p-5 shadow-sm space-y-4">
              {/* Cluster Name */}
              <label className="block text-sm font-semibold text-olive">
                Cluster Name
                <input
                  type="text"
                  required
                  disabled={!canWrite || isPending}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. India Festival Tours"
                  className="mt-1.5 w-full rounded border border-olive/20 px-3 py-2 bg-cream/10 text-sm font-sans"
                />
              </label>

              {/* Pillar Page Selector */}
              <label className="block text-sm font-semibold text-olive">
                Pillar Page (the main high-intent page for this cluster)
                <select
                  required
                  disabled={!canWrite || isPending}
                  value={pillarId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setPillarId(id);
                    // Disallow the new pillar from being in the spokes list
                    setSelectedSpokes(selectedSpokes.filter((s) => s.id !== id));
                  }}
                  className="mt-1.5 w-full rounded border border-olive/20 px-3 py-2 bg-cream/10 text-sm font-sans"
                >
                  <option value="">-- Select Pillar Page (Page or Post) --</option>
                  {pillarOptions.map((p) => (
                    <option key={p.id} value={p.id}>
                      [{p.type}] {p.title} ({p.slug})
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {/* Spokes Selection */}
            <div className="rounded-lg border border-olive/10 bg-paper p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-olive/10 pb-2">
                <h2 className="font-display text-xl font-semibold text-olive">Spoke Pages</h2>
                {canWrite && (
                  <button
                    type="button"
                    onClick={() => {
                      if (!pillarId) {
                        alert("Please select a Pillar Page first.");
                        return;
                      }
                      setIsSpokeModalOpen(true);
                    }}
                    className="rounded border border-gold text-gold hover:bg-gold hover:text-olive px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors"
                  >
                    Add Spoke
                  </button>
                )}
              </div>

              {selectedSpokes.length === 0 ? (
                <p className="text-sm text-olive/60 italic py-2">
                  No spoke pages configured yet. Click &quot;Add Spoke&quot; to link pages.
                </p>
              ) : (
                <div className="divide-y divide-olive/10">
                  {selectedSpokes.map((spoke) => {
                    const isLinked = spokeLinks[spoke.id] !== false;
                    return (
                      <div key={spoke.id} className="flex items-center justify-between py-3">
                        <div className="space-y-1 pr-4">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold uppercase tracking-wider text-olive/50 bg-cream px-1.5 py-0.5 rounded">
                              {spoke.type}
                            </span>
                            <span className="text-sm font-semibold text-olive">{spoke.title}</span>
                          </div>
                          <p className="text-xs text-olive/60 font-mono">/{spoke.slug}</p>
                          
                          {/* Linking Warning */}
                          {!isLinked && pillarDetails && (
                            <p className="text-[11px] font-medium text-amber-600">
                              ⚠️ No link to pillar detected. Add a link to /{pillarDetails.slug} in this page.
                            </p>
                          )}
                        </div>
                        {canWrite && (
                          <button
                            type="button"
                            onClick={() => handleRemoveSpoke(spoke.id)}
                            className="text-xs font-semibold text-red-700 hover:text-red-900"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Recommendations Section */}
            {isEditMode && recommendations.length > 0 && (
              <div className="rounded-lg border border-olive/10 bg-paper p-5 shadow-sm space-y-4">
                <h2 className="font-display text-xl font-semibold text-olive border-b border-olive/10 pb-2">
                  Suggested Links (Keyword-based Link Engine)
                </h2>
                <div className="grid gap-3">
                  {recommendations.map((rec) => (
                    <div
                      key={`${rec.spokeId}-${rec.keywordFound}`}
                      className="rounded border border-gold/20 bg-cream/15 p-4 flex flex-col md:flex-row md:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <p className="text-sm text-olive">
                          In <strong className="font-semibold">{rec.spokeTitle}</strong>: add a link on
                          &quot;<span className="italic font-medium">{rec.suggestedAnchorText}</span>&quot;
                          pointing to <strong className="font-mono text-xs">/{rec.pillarSlug}</strong>
                        </p>
                        <p className="text-[10px] text-olive/45">
                          Found keyword match (Frequency: {rec.frequency})
                        </p>
                      </div>
                      <div className="flex gap-2 self-start md:self-center">
                        <button
                          type="button"
                          onClick={() => handleAcceptRecommendation(rec)}
                          className="rounded bg-gold text-olive px-3 py-1 text-xs font-semibold hover:bg-gold/90 transition-colors"
                        >
                          Add This Link
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDismissRecommendation(rec)}
                          className="rounded border border-olive/20 text-olive/60 px-3 py-1 text-xs font-medium hover:bg-cream transition-colors"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions Footer */}
            {canWrite && (
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-lg bg-gold px-6 py-2.5 text-sm font-semibold text-olive shadow-sm hover:bg-gold/90 disabled:opacity-50"
                >
                  {isPending ? "Saving..." : isEditMode ? "Save Changes" : "Create Cluster"}
                </button>
              </div>
            )}
          </form>

          {/* Visual Diagram Column */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-lg border border-olive/10 bg-paper p-5 shadow-sm space-y-4">
              <h2 className="font-display text-xl font-semibold text-olive border-b border-olive/10 pb-2">
                Hub & Spoke Visualization
              </h2>
              
              {selectedSpokes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-olive/20 rounded-lg bg-cream/10">
                  <div className="h-16 w-16 rounded-full bg-gold/10 flex items-center justify-center mb-3">
                    <span className="text-gold text-lg">💡</span>
                  </div>
                  <p className="text-sm font-semibold text-olive">No spokes added yet</p>
                  <p className="text-xs text-olive/50 mt-1 max-w-[200px]">
                    Add spoke pages to visualize the topic cluster.
                  </p>
                </div>
              ) : (
                <div className="w-full overflow-hidden">
                  <svg
                    width="100%"
                    height="360"
                    viewBox="0 0 600 400"
                    className="mx-auto border border-olive/10 rounded-lg bg-cream/10"
                  >
                    {/* SVG Connector Lines */}
                    {selectedSpokes.map((spoke, idx) => {
                      const theta = (idx * 2 * Math.PI) / selectedSpokes.length;
                      const sx = 300 + 160 * Math.cos(theta);
                      const sy = 200 + 160 * Math.sin(theta);
                      return (
                        <line
                          key={spoke.id}
                          x1="300"
                          y1="200"
                          x2={sx}
                          y2={sy}
                          stroke="#ba8838"
                          strokeWidth="2"
                          strokeDasharray="4 2"
                        />
                      );
                    })}

                    {/* Center Node (Pillar Page) */}
                    <foreignObject x="240" y="140" width="120" height="120">
                      <div className="flex h-full w-full items-center justify-center rounded-full bg-gold text-paper p-3 text-center text-xs font-semibold shadow-md font-sans">
                        <span className="line-clamp-3">
                          {pillarDetails ? pillarDetails.title : "Pillar Page"}
                        </span>
                      </div>
                    </foreignObject>

                    {/* Spoke Nodes */}
                    {selectedSpokes.map((spoke, idx) => {
                      const theta = (idx * 2 * Math.PI) / selectedSpokes.length;
                      const sx = 300 + 160 * Math.cos(theta);
                      const sy = 200 + 160 * Math.sin(theta);
                      return (
                        <foreignObject
                          key={spoke.id}
                          x={sx - 70}
                          y={sy - 25}
                          width="140"
                          height="50"
                        >
                          <div className="flex h-full w-full items-center justify-center rounded-md bg-olive text-paper px-2 py-1 text-center text-[10px] font-medium shadow-sm font-sans line-clamp-2 leading-tight">
                            {spoke.title}
                          </div>
                        </foreignObject>
                      );
                    })}
                  </svg>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        // Tab 2: Internal Links Manager
        <div className="space-y-6">
          <div className="rounded-lg border border-olive/10 bg-paper p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-olive/10 pb-2">
              <h2 className="font-display text-xl font-semibold text-olive">Internal Links</h2>
              {canWrite && (
                <button
                  type="button"
                  onClick={() => {
                    setLinkSource("");
                    setLinkTarget("");
                    setLinkAnchor("");
                    setLinkError("");
                    setIsLinkModalOpen(true);
                  }}
                  className="rounded bg-gold text-olive px-4 py-2 text-xs font-semibold uppercase tracking-wider hover:bg-gold/90 transition-colors"
                >
                  Add Link
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-olive/10 bg-cream text-xs font-semibold uppercase tracking-wider text-olive/70">
                    <th className="px-4 py-3">Source Page</th>
                    <th className="px-4 py-3">Anchor Text</th>
                    <th className="px-4 py-3">Target Page</th>
                    {canWrite && <th className="px-4 py-3 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-olive/5">
                  {internalLinks.length === 0 ? (
                    <tr>
                      <td colSpan={canWrite ? 4 : 3} className="px-4 py-8 text-center text-olive/50 italic">
                        No internal links mapped inside this cluster yet. Click &quot;Add Link&quot; above to connect pages.
                      </td>
                    </tr>
                  ) : (
                    internalLinks.map((link) => (
                      <tr key={link.id} className="hover:bg-cream/20">
                        <td className="px-4 py-3 font-medium text-olive">{link.src_title}</td>
                        <td className="px-4 py-3 text-olive font-mono text-xs">
                          &quot;<span className="italic font-sans text-sm font-semibold">{link.anchor_text}</span>&quot;
                        </td>
                        <td className="px-4 py-3 text-olive/80">{link.tgt_title}</td>
                        {canWrite && (
                          <td className="px-4 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleRemoveLink(link.id)}
                              className="text-xs font-semibold text-red-700 hover:text-red-900"
                            >
                              Remove
                            </button>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SPOKE SELECTION MODAL */}
      {isSpokeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-paper border border-olive/10 rounded-xl shadow-2xl overflow-hidden font-sans">
            <div className="border-b border-olive/10 px-6 py-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-olive">Select Spoke Content</h2>
              <button
                type="button"
                onClick={() => {
                  setIsSpokeModalOpen(false);
                  setSpokeSearch("");
                }}
                className="text-olive/50 hover:text-olive focus:outline-none"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <input
                type="text"
                value={spokeSearch}
                onChange={(e) => setSpokeSearch(e.target.value)}
                placeholder="Search by title or slug..."
                className="w-full px-3 py-2 border border-olive/20 rounded-lg text-sm bg-cream/10 focus:outline-none focus:border-gold"
              />
              <div className="max-h-60 overflow-y-auto divide-y divide-olive/10 pr-2">
                {filteredModalOptions.length === 0 ? (
                  <p className="text-sm text-olive/50 italic text-center py-6">No matching pages available.</p>
                ) : (
                  filteredModalOptions.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleAddSpoke(opt)}
                      className="w-full text-left py-2.5 px-2 hover:bg-cream/40 rounded flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-olive/50 bg-cream px-1.5 py-0.5 rounded">
                            {opt.type}
                          </span>
                          <span className="text-sm font-medium text-olive">{opt.title}</span>
                        </div>
                        <p className="text-xs text-olive/45 font-mono">/{opt.slug}</p>
                      </div>
                      <span className="text-xs text-gold font-bold">Select ➔</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD LINK MODAL */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-paper border border-olive/10 rounded-xl shadow-2xl overflow-hidden font-sans">
            <div className="border-b border-olive/10 px-6 py-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-olive">Add Internal Link</h2>
              <button
                type="button"
                onClick={() => setIsLinkModalOpen(false)}
                className="text-olive/50 hover:text-olive focus:outline-none"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddLinkSubmit} className="p-6 space-y-4">
              {linkError && (
                <div className="rounded bg-red-50 border border-red-200 p-2.5 text-xs text-red-800">
                  {linkError}
                </div>
              )}

              {/* Source Page */}
              <div>
                <label className="block text-sm font-semibold text-olive mb-1">Source Page</label>
                <select
                  required
                  value={linkSource}
                  onChange={(e) => setLinkSource(e.target.value)}
                  className="w-full px-3 py-2 border border-olive/20 rounded-lg text-sm bg-cream/10 focus:outline-none focus:border-gold"
                >
                  <option value="">-- Select Source Page/Post --</option>
                  {linkSourceOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      [{opt.type}] {opt.title} (/{opt.slug})
                    </option>
                  ))}
                </select>
              </div>

              {/* Target Page */}
              <div>
                <label className="block text-sm font-semibold text-olive mb-1">Target Page</label>
                <select
                  required
                  value={linkTarget}
                  onChange={(e) => setLinkTarget(e.target.value)}
                  className="w-full px-3 py-2 border border-olive/20 rounded-lg text-sm bg-cream/10 focus:outline-none focus:border-gold"
                >
                  <option value="">-- Select Target Page/Post/Package --</option>
                  {linkTargetOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      [{opt.type}] {opt.title} (/{opt.slug})
                    </option>
                  ))}
                </select>
              </div>

              {/* Anchor Text */}
              <div>
                <label className="block text-sm font-semibold text-olive mb-1">Anchor Text</label>
                <input
                  type="text"
                  required
                  value={linkAnchor}
                  onChange={(e) => setLinkAnchor(e.target.value)}
                  placeholder="e.g. festival tours"
                  className="w-full px-3 py-2 border border-olive/20 rounded-lg text-sm bg-cream/10 focus:outline-none focus:border-gold"
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex justify-end gap-2 pt-4 border-t border-olive/10">
                <button
                  type="button"
                  onClick={() => setIsLinkModalOpen(false)}
                  className="px-4 py-2 border border-olive/20 rounded-lg text-xs font-medium text-olive hover:bg-cream"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 bg-gold text-olive rounded-lg text-xs font-bold hover:bg-gold/90"
                >
                  {isPending ? "Adding..." : "Save Link"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
