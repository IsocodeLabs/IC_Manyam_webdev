"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { deletePost } from "@/app/journal/actions";

type PostRow = {
  id: string;
  title: string;
  category_id: string | null;
  categoryName: string | null;
  status: "Draft" | "Published" | "Scheduled";
  scheduled_at: string | null;
  published_at: string | null;
  created_at: string;
};

const PAGE_SIZE = 20;

function formatDate(value: string | null) {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function JournalTable({
  posts,
  categories,
}: {
  posts: PostRow[];
  categories: { id: string; name: string }[];
}) {
  const [status, setStatus] = useState("All");
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortAscending, setSortAscending] = useState(true);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const result = posts.filter((post) =>
      (status === "All" || post.status === status) &&
      (category === "All" || post.category_id === category) &&
      post.title.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase())
    );
    return result.sort((a, b) =>
      sortAscending ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title)
    );
  }, [posts, status, category, search, sortAscending]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function resetPage() {
    setPage(1);
    setMessage("");
  }

  function handleDelete(id: string, title: string) {
    if (!window.confirm(`Delete “${title}”? This action cannot be undone.`)) return;
    startTransition(async () => {
      const result = await deletePost(id);
      if (!result.ok) setMessage(result.error ?? "The journal entry could not be deleted.");
    });
  }

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-gold">Content</p>
          <h1 className="font-display text-4xl font-semibold text-olive">Journal</h1>
          <p className="mt-1 text-sm text-olive/70">Create, schedule and publish journal entries.</p>
        </div>
        <Link href="/journal/new" className="rounded-md bg-gold px-5 py-2.5 font-medium text-olive hover:bg-gold/90">
          New Post
        </Link>
      </div>

      <div className="mb-5 grid gap-3 rounded-lg border border-olive/10 bg-paper p-4 md:grid-cols-3">
        <label className="text-sm font-medium">Status
          <select value={status} onChange={(event) => { setStatus(event.target.value); resetPage(); }} className="mt-1 w-full rounded-md border border-olive/20 bg-white px-3 py-2">
            {['All', 'Draft', 'Published', 'Scheduled'].map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
        <label className="text-sm font-medium">Category
          <select value={category} onChange={(event) => { setCategory(event.target.value); resetPage(); }} className="mt-1 w-full rounded-md border border-olive/20 bg-white px-3 py-2">
            <option value="All">All categories</option>
            {categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </label>
        <label className="text-sm font-medium">Search
          <input value={search} onChange={(event) => { setSearch(event.target.value); resetPage(); }} placeholder="Search by title" className="mt-1 w-full rounded-md border border-olive/20 bg-white px-3 py-2" />
        </label>
      </div>

      {message && <p role="alert" className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-800">{message}</p>}

      {posts.length === 0 ? (
        <div className="rounded-lg border border-dashed border-olive/20 bg-paper p-12 text-center">
          <p className="font-display text-2xl">No journal entries yet. Create your first one.</p>
          <Link href="/journal/new" className="mt-5 inline-block rounded-md bg-gold px-5 py-2.5 font-medium">Create Post</Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-olive/10 bg-paper shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-ivory text-xs uppercase tracking-wide text-olive/70">
                <tr>
                  <th className="px-4 py-3"><button onClick={() => setSortAscending((value) => !value)}>Title {sortAscending ? "↑" : "↓"}</button></th>
                  <th className="px-4 py-3">Category</th><th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Scheduled Date</th><th className="px-4 py-3">Published Date</th>
                  <th className="px-4 py-3">Last Updated</th><th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-olive/10">
                {visible.map((post) => (
                  <tr key={post.id} className="hover:bg-cream/60">
                    <td className="px-4 py-4 font-medium">{post.title}</td>
                    <td className="px-4 py-4">{post.categoryName ?? "Uncategorised"}</td>
                    <td className="px-4 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${post.status === 'Published' ? 'bg-green-700 text-white' : post.status === 'Scheduled' ? 'bg-gold text-olive' : 'bg-ivory text-olive'}`}>{post.status}</span></td>
                    <td className="px-4 py-4 whitespace-nowrap">{formatDate(post.scheduled_at)}</td>
                    <td className="px-4 py-4 whitespace-nowrap">{formatDate(post.published_at)}</td>
                    <td className="px-4 py-4 whitespace-nowrap">{formatDate(post.created_at)}</td>
                    <td className="px-4 py-4 whitespace-nowrap"><Link href={`/journal/${post.id}/edit`} className="mr-3 font-medium text-gold hover:underline">Edit</Link><button disabled={isPending} onClick={() => handleDelete(post.id, post.title)} className="font-medium text-red-700 hover:underline disabled:opacity-50">Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && <p className="p-8 text-center text-olive/70">No journal entries match these filters.</p>}
          <div className="flex items-center justify-between border-t border-olive/10 px-4 py-3 text-sm">
            <span>Page {currentPage} of {pageCount}</span>
            <div className="space-x-2"><button disabled={currentPage === 1} onClick={() => setPage((value) => value - 1)} className="rounded border border-olive/20 px-3 py-1.5 disabled:opacity-40">Previous</button><button disabled={currentPage === pageCount} onClick={() => setPage((value) => value + 1)} className="rounded border border-olive/20 px-3 py-1.5 disabled:opacity-40">Next</button></div>
          </div>
        </div>
      )}
    </section>
  );
}
