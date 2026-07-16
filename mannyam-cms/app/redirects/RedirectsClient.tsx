"use client";

import { useState, useTransition, useEffect, useCallback } from "react";
import { createRedirect, updateRedirect, deleteRedirect } from "./actions";
import { detectCircularRedirect, type RedirectItem } from "@/lib/redirects/detectCircular";

interface RedirectRow {
  id: string;
  from_path: string;
  to_path: string;
  status_code: 301 | 302;
  created_at: string | null;
}

interface RedirectsClientProps {
  initialRedirects: RedirectRow[];
  canWrite: boolean;
}

export function RedirectsClient({ initialRedirects, canWrite }: RedirectsClientProps) {
  const [redirects, setRedirects] = useState<RedirectRow[]>(initialRedirects);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  
  // Form fields
  const [fromPath, setFromPath] = useState("");
  const [toPath, setToPath] = useState("");
  const [statusCode, setStatusCode] = useState<301 | 302>(301);

  // Warnings/errors state
  const [conflictWarning, setConflictWarning] = useState<{ type: "error" | "warning"; message: string } | null>(null);
  const [modalError, setModalError] = useState("");
  const [isPending, startTransition] = useTransition();

  // Search filter
  const [searchTerm, setSearchTerm] = useState("");

  // Sync state when props change
  useEffect(() => {
    setRedirects(initialRedirects);
  }, [initialRedirects]);

  // Run circular validation checks
  const performConflictCheck = useCallback((
    from: string,
    to: string,
    id: string | null
  ): { isValid: boolean; type?: "error" | "warning"; message?: string } => {
    if (!from.trim() || !to.trim()) {
      return { isValid: true };
    }

    if (!from.trim().startsWith("/")) {
      return { isValid: false, type: "error", message: "From Path must start with a slash (/)." };
    }

    // Circular Redirect Checks
    const checkList: RedirectItem[] = redirects.map(r => ({ id: r.id, from_path: r.from_path, to_path: r.to_path }));
    const result = detectCircularRedirect(from, to, checkList, id ?? undefined);

    if (result.isCircular) {
      return {
        isValid: false,
        type: "error",
        message: `Circular redirect detected: ${result.chain.join(" -> ")}`
      };
    }

    if (result.isTooDeep) {
      return {
        isValid: false,
        type: "error",
        message: "Infinite redirect loop or chain length exceeded 20 hops."
      };
    }

    // Warn if chain is more than 5 hops (length > 6 including fromPath)
    if (result.chain.length > 6) {
      return {
        isValid: true,
        type: "warning",
        message: "Redirect chain is more than 5 hops deep. This may slow down users."
      };
    }

    return { isValid: true };
  }, [redirects]);

  // Validate on input changes
  useEffect(() => {
    const check = performConflictCheck(fromPath, toPath, editId);
    if (check.type && check.message) {
      setConflictWarning({ type: check.type, message: check.message });
    } else {
      setConflictWarning(null);
    }
  }, [fromPath, toPath, editId, performConflictCheck]);

  function handleOpenAdd() {
    setEditId(null);
    setFromPath("");
    setToPath("");
    setStatusCode(301);
    setConflictWarning(null);
    setModalError("");
    setIsModalOpen(true);
  }

  function handleOpenEdit(row: RedirectRow) {
    setEditId(row.id);
    setFromPath(row.from_path);
    setToPath(row.to_path);
    setStatusCode(row.status_code);
    setConflictWarning(null);
    setModalError("");
    setIsModalOpen(true);
  }

  function handleCloseModal() {
    setIsModalOpen(false);
  }

  function handleCheckConflictsBtn() {
    const check = performConflictCheck(fromPath, toPath, editId);
    if (check.isValid && (!check.type || check.type === "warning")) {
      alert(check.message ? `Warning: ${check.message}` : "No conflicts or circular loops detected.");
    } else if (check.message) {
      alert(`Conflict Error: ${check.message}`);
    }
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!canWrite) return;

    setModalError("");

    const check = performConflictCheck(fromPath, toPath, editId);
    if (!check.isValid) {
      setModalError(check.message ?? "Validation failed.");
      return;
    }

    startTransition(async () => {
      try {
        if (editId) {
          await updateRedirect(editId, fromPath, toPath, statusCode);
        } else {
          await createRedirect(fromPath, toPath, statusCode);
        }
        setIsModalOpen(false);
        // Force refresh table state locally (usually page revalidation triggers this, but local update makes it instant)
        window.location.reload();
      } catch (err) {
        setModalError(err instanceof Error ? err.message : "Failed to save redirect.");
      }
    });
  }

  function handleDelete(id: string, from: string) {
    if (!canWrite) return;
    if (window.confirm(`Are you sure you want to delete the redirect from '${from}'?`)) {
      startTransition(async () => {
        try {
          await deleteRedirect(id);
          window.location.reload();
        } catch (err) {
          alert(err instanceof Error ? err.message : "Delete failed.");
        }
      });
    }
  }

  const filteredRedirects = redirects.filter(r =>
    r.from_path.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.to_path.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-olive">Redirect Manager</h1>
          <p className="mt-1 text-sm text-olive/70">
            Set up 301 (Permanent) and 302 (Temporary) redirects. Built-in loops detection protects your site SEO.
          </p>
        </div>
        {canWrite && (
          <button
            type="button"
            onClick={handleOpenAdd}
            className="rounded-lg bg-gold px-5 py-2.5 text-sm font-semibold text-olive shadow-sm transition hover:bg-gold/90"
          >
            Add Redirect
          </button>
        )}
      </div>

      {/* Filter and Search */}
      <div className="flex items-center justify-between gap-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search redirects by path..."
          className="w-full max-w-sm px-4 py-2 border border-olive/20 rounded-lg text-sm bg-paper focus:outline-none focus:border-gold"
        />
      </div>

      {/* Redirects Table */}
      <div className="rounded-lg border border-olive/10 bg-paper shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-olive/10 bg-cream text-xs font-semibold uppercase tracking-wider text-olive/70">
                <th className="px-5 py-3.5">From Path</th>
                <th className="px-5 py-3.5">To Path</th>
                <th className="px-5 py-3.5">Type</th>
                <th className="px-5 py-3.5">Created</th>
                {canWrite && <th className="px-5 py-3.5 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredRedirects.length === 0 ? (
                <tr>
                  <td colSpan={canWrite ? 5 : 4} className="px-5 py-10 text-center text-olive/50">
                    {searchTerm ? "No redirects match your search." : "No redirects set up yet."}
                  </td>
                </tr>
              ) : (
                filteredRedirects.map((row) => (
                  <tr key={row.id} className="border-b border-olive/5 hover:bg-cream/40">
                    <td className="px-5 py-3 font-mono text-xs text-olive/90">{row.from_path}</td>
                    <td className="px-5 py-3 font-mono text-xs text-olive/70 truncate max-w-xs">{row.to_path}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-block rounded px-2 py-0.5 text-xs font-bold ${
                          row.status_code === 301
                            ? "bg-green-100 text-green-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {row.status_code}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-olive/60">
                      {row.created_at
                        ? new Intl.DateTimeFormat("en-GB").format(new Date(row.created_at))
                        : "-"}
                    </td>
                    {canWrite && (
                      <td className="px-5 py-3 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(row)}
                          className="text-xs font-semibold text-olive/80 hover:text-gold-deep transition"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(row.id, row.from_path)}
                          className="text-xs font-semibold text-red-700 hover:text-red-900 transition"
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

      {/* Redirect Edit/Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-paper border border-olive/10 rounded-xl shadow-2xl overflow-hidden">
            <div className="border-b border-olive/10 px-6 py-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-olive">
                {editId ? "Edit Redirect" : "Add Redirect"}
              </h2>
              <button
                type="button"
                onClick={handleCloseModal}
                className="text-olive/50 hover:text-olive focus:outline-none"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              {/* From Path */}
              <div>
                <label className="block text-sm font-semibold text-olive mb-1">
                  From Path
                </label>
                <input
                  type="text"
                  required
                  value={fromPath}
                  onChange={(e) => setFromPath(e.target.value)}
                  placeholder="/old-path-name"
                  className="w-full px-3 py-2 border border-olive/20 rounded-lg text-sm bg-cream/10 focus:outline-none focus:border-gold font-mono"
                />
                <p className="mt-1 text-xs text-olive/50">Must start with a slash (/).</p>
              </div>

              {/* To Path */}
              <div>
                <label className="block text-sm font-semibold text-olive mb-1">
                  To Path
                </label>
                <input
                  type="text"
                  required
                  value={toPath}
                  onChange={(e) => setToPath(e.target.value)}
                  placeholder="/new-path-name or https://..."
                  className="w-full px-3 py-2 border border-olive/20 rounded-lg text-sm bg-cream/10 focus:outline-none focus:border-gold font-mono"
                />
                <p className="mt-1 text-xs text-olive/50">Must start with a slash (/) or be an external URL.</p>
              </div>

              {/* Status Code */}
              <div>
                <label className="block text-sm font-semibold text-olive mb-2">
                  Redirect Type
                </label>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 text-sm text-olive cursor-pointer">
                    <input
                      type="radio"
                      name="statusCode"
                      checked={statusCode === 301}
                      onChange={() => setStatusCode(301)}
                      className="accent-gold h-4 w-4"
                    />
                    <span>301 Permanent</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm text-olive cursor-pointer">
                    <input
                      type="radio"
                      name="statusCode"
                      checked={statusCode === 302}
                      onChange={() => setStatusCode(302)}
                      className="accent-gold h-4 w-4"
                    />
                    <span>302 Temporary</span>
                  </label>
                </div>
              </div>

              {/* Conflict Warnings */}
              {conflictWarning && (
                <div
                  className={`rounded p-3 text-xs font-medium border ${
                    conflictWarning.type === "error"
                      ? "bg-red-50 border-red-200 text-red-800"
                      : "bg-amber-50 border-amber-200 text-amber-800"
                  }`}
                >
                  {conflictWarning.message}
                </div>
              )}

              {/* Save Errors */}
              {modalError && (
                <div className="rounded bg-red-50 border border-red-200 p-3 text-xs text-red-800">
                  {modalError}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-olive/10">
                <button
                  type="button"
                  onClick={handleCheckConflictsBtn}
                  className="text-xs font-semibold text-gold-deep hover:underline focus:outline-none"
                >
                  Check for Conflicts
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 border border-olive/20 rounded-lg text-xs font-medium text-olive hover:bg-cream"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPending || (conflictWarning !== null && conflictWarning.type === "error")}
                    className="px-4 py-2 bg-gold text-olive rounded-lg text-xs font-bold hover:bg-gold/90 disabled:opacity-50"
                  >
                    {isPending ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
