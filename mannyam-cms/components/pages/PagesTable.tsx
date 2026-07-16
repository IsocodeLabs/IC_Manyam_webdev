"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { deletePage } from "@/app/pages-cms/actions";

type PageRow = {
  id: string;
  title: string;
  slug: string;
  type: "Landing" | "Category" | "Standard" | "Form" | "Legal";
  status: "Draft" | "Published";
  updated_at: string;
};

const PAGE_SIZE = 20;

function formatDate(value: string | null) {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function PagesTable({
  pages,
  role,
}: {
  pages: PageRow[];
  role: string;
}) {
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortAscending, setSortAscending] = useState(true);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const result = pages.filter((item) =>
      (statusFilter === "All" || item.status === statusFilter) &&
      (typeFilter === "All" || item.type === typeFilter) &&
      item.title.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase())
    );
    return result.sort((a, b) =>
      sortAscending ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title)
    );
  }, [pages, statusFilter, typeFilter, search, sortAscending]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function resetPage() {
    setPage(1);
    setMessage("");
  }

  function handleDelete(id: string, title: string) {
    if (!window.confirm(`Delete page “${title}”? This action cannot be undone.`)) return;
    startTransition(async () => {
      const result = await deletePage(id);
      if (!result.ok) {
        setMessage(result.error ?? "The page could not be deleted.");
      } else {
        setMessage("");
      }
    });
  }

  return (
    <section className="font-sans">
      {/* Header section */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-gold">CMS</p>
          <h1 className="font-display text-4xl font-semibold text-olive">Pages</h1>
          <p className="mt-1 text-sm text-olive/70">Create, configure and manage block-based website pages.</p>
        </div>
        <Link href="/pages-cms/new" className="rounded-md bg-gold px-5 py-2.5 font-medium text-olive hover:bg-gold/90 transition-colors">
          New Page
        </Link>
      </div>

      {/* Filters bar */}
      <div className="mb-5 grid gap-3 rounded-lg border border-olive/10 bg-paper p-4 md:grid-cols-3">
        <label className="text-sm font-medium text-olive">Type
          <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); resetPage(); }} className="mt-1 w-full rounded-md border border-olive/20 bg-white px-3 py-2">
            <option value="All">All types</option>
            <option value="Landing">Landing</option>
            <option value="Category">Category</option>
            <option value="Standard">Standard</option>
            <option value="Form">Form</option>
            <option value="Legal">Legal</option>
          </select>
        </label>
        <label className="text-sm font-medium text-olive">Status
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); resetPage(); }} className="mt-1 w-full rounded-md border border-olive/20 bg-white px-3 py-2">
            <option value="All">All statuses</option>
            <option value="Draft">Draft</option>
            <option value="Published">Published</option>
          </select>
        </label>
        <label className="text-sm font-medium text-olive">Search
          <input value={search} onChange={(e) => { setSearch(e.target.value); resetPage(); }} placeholder="Search by title" className="mt-1 w-full rounded-md border border-olive/20 bg-white px-3 py-2" />
        </label>
      </div>

      {message && <p role="alert" className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-800">{message}</p>}

      {pages.length === 0 ? (
        <div className="rounded-lg border border-dashed border-olive/20 bg-paper p-12 text-center">
          <p className="font-display text-2xl text-olive mb-1">No pages yet. Create your first one.</p>
          <p className="text-sm text-olive/60 mb-5">Create block-based Landing, Category, or Legal pages.</p>
          <Link href="/pages-cms/new" className="inline-block rounded-md bg-gold px-5 py-2.5 font-medium text-olive hover:bg-gold/90 transition-colors">
            Create your first page
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-olive/10 bg-paper shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-ivory text-xs uppercase tracking-wide text-olive/70 border-b border-olive/10">
                <tr>
                  <th className="px-4 py-3">
                    <button type="button" onClick={() => setSortAscending((value) => !value)} className="hover:text-olive">
                      Title {sortAscending ? "↑" : "↓"}
                    </button>
                  </th>
                  <th className="px-4 py-3">Slug</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Last Updated</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-olive/10">
                {visible.map((item) => (
                  <tr key={item.id} className="hover:bg-cream/40 transition-colors">
                    <td className="px-4 py-4 font-medium text-olive">{item.title}</td>
                    <td className="px-4 py-4 font-mono text-xs text-olive/70">/{item.slug}</td>
                    <td className="px-4 py-4 text-olive">{item.type}</td>
                    <td className="px-4 py-4">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        item.status === "Published" ? "bg-green-100 text-green-800" : "bg-ivory text-olive"
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-olive/70">{formatDate(item.updated_at)}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      <Link href={`/pages-cms/${item.id}/edit`} className="mr-3 font-medium text-gold hover:underline">
                        Edit
                      </Link>
                      <Link target="_blank" href={`/pages-cms/${item.id}/preview`} className="mr-3 font-medium text-olive hover:underline">
                        Preview
                      </Link>
                      {role === "Admin" && (
                        <button
                          disabled={isPending}
                          onClick={() => handleDelete(item.id, item.title)}
                          className="font-medium text-red-700 hover:underline disabled:opacity-50"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && <p className="p-8 text-center text-olive/70">No pages match these filters.</p>}
          <div className="flex items-center justify-between border-t border-olive/10 px-4 py-3 text-sm text-olive/70">
            <span>Page {currentPage} of {pageCount}</span>
            <div className="space-x-2">
              <button disabled={currentPage === 1} onClick={() => setPage((value) => value - 1)} className="rounded border border-olive/20 px-3 py-1.5 disabled:opacity-40 hover:bg-cream/10">
                Previous
              </button>
              <button disabled={currentPage === pageCount} onClick={() => setPage((value) => value + 1)} className="rounded border border-olive/20 px-3 py-1.5 disabled:opacity-40 hover:bg-cream/10">
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
