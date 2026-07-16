"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { deleteCluster } from "./actions";

interface ClusterRow {
  id: string;
  name: string;
  pillarTitle: string;
  spokeCount: number;
  coverage: number;
}

interface ClustersClientProps {
  initialClusters: ClusterRow[];
  canWrite: boolean;
}

export function ClustersClient({ initialClusters, canWrite }: ClustersClientProps) {
  const [clusters, setClusters] = useState<ClusterRow[]>(initialClusters);
  const [searchTerm, setSearchTerm] = useState("");
  const [isPending, startTransition] = useTransition();

  // Handle Delete Cluster
  async function handleDelete(id: string, name: string) {
    if (!canWrite) return;
    if (!window.confirm(`Are you sure you want to delete the cluster "${name}"? This action cannot be undone.`)) {
      return;
    }

    startTransition(async () => {
      try {
        await deleteCluster(id);
        setClusters(clusters.filter(c => c.id !== id));
      } catch (err) {
        alert(err instanceof Error ? err.message : "Failed to delete cluster.");
      }
    });
  }

  // Filter clusters by search query
  const filteredClusters = clusters.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.pillarTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-olive">Topic Clusters</h1>
          <p className="mt-1 text-sm text-olive/70">
            Organise journal articles and content into thematic pillars and clusters to optimise SEO structure.
          </p>
        </div>
        {canWrite && (
          <Link
            href="/clusters/new"
            className="rounded-lg bg-gold px-5 py-2.5 text-sm font-semibold text-olive shadow-sm transition hover:bg-gold/90"
          >
            New Cluster
          </Link>
        )}
      </div>

      {/* Search Input */}
      <div className="flex items-center justify-between gap-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search clusters by name or pillar..."
          className="w-full max-w-sm px-4 py-2 border border-olive/20 rounded-lg text-sm bg-paper focus:outline-none focus:border-gold font-sans"
        />
      </div>

      {/* Clusters Table */}
      <div className="rounded-lg border border-olive/10 bg-paper shadow-sm overflow-hidden font-sans">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-olive/10 bg-cream text-xs font-semibold uppercase tracking-wider text-olive/70">
                <th className="px-5 py-3.5">Cluster Name</th>
                <th className="px-5 py-3.5">Pillar Page</th>
                <th className="px-5 py-3.5">Spoke Count</th>
                <th className="px-5 py-3.5">Coverage</th>
                {canWrite && <th className="px-5 py-3.5 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredClusters.length === 0 ? (
                <tr>
                  <td colSpan={canWrite ? 5 : 4} className="px-5 py-10 text-center text-olive/50 italic">
                    {searchTerm ? "No clusters match your search query." : "No topic clusters yet. Create your first cluster."}
                  </td>
                </tr>
              ) : (
                filteredClusters.map((row) => (
                  <tr key={row.id} className="border-b border-olive/5 hover:bg-cream/40">
                    <td className="px-5 py-3.5 font-semibold text-olive">{row.name}</td>
                    <td className="px-5 py-3.5 text-olive/80">{row.pillarTitle}</td>
                    <td className="px-5 py-3.5 text-olive/70 font-mono text-xs">{row.spokeCount}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        {/* Coverage Progress Bar */}
                        <div className="w-16 bg-cream rounded-full h-2 overflow-hidden border border-olive/10">
                          <div
                            className={`h-full transition-all duration-300 ${
                              row.coverage >= 80
                                ? "bg-green-600"
                                : row.coverage >= 50
                                ? "bg-gold"
                                : "bg-amber-600"
                            }`}
                            style={{ width: `${row.coverage}%` }}
                          />
                        </div>
                        <span className="font-mono text-xs font-semibold text-olive/80">
                          {row.coverage}%
                        </span>
                      </div>
                    </td>
                    {canWrite && (
                      <td className="px-5 py-3.5 text-right space-x-3">
                        <Link
                          href={`/clusters/${row.id}/edit`}
                          className="text-xs font-semibold text-olive/80 hover:text-gold-deep transition-colors"
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => handleDelete(row.id, row.name)}
                          className="text-xs font-semibold text-red-700 hover:text-red-900 transition-colors disabled:opacity-50"
                        >
                          Delete
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
  );
}
