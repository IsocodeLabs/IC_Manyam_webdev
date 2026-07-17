"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateLeadStatus, addLeadNote } from "./actions";
import { Database } from "@/types/database.types";

type Lead = Database["public"]["Tables"]["leads"]["Row"];

interface NoteWithUser {
  id: string;
  lead_id: string;
  note: string;
  created_at: string | null;
  created_by: string | null;
  users: {
    name: string;
  } | null;
}

interface AuditLog {
  id: string;
  lead_id: string;
  changed_by: string | null;
  changed_by_name: string | null;
  from_status: string | null;
  to_status: string;
  changed_at: string | null;
}

interface LeadsClientProps {
  initialLeads: Lead[];
  initialNotes: NoteWithUser[];
  initialAuditLogs: AuditLog[];
}

export function LeadsClient({
  initialLeads,
  initialNotes,
  initialAuditLogs,
}: LeadsClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Detail Panel Active Lead State
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(
    initialLeads.length > 0 ? initialLeads[0].id : null
  );

  // Filters State
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [sourceFilter, setSourceFilter] = useState<string>("All");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Sort State
  const [sortOption, setSortOption] = useState<string>("newest");

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 25;

  // New Note Input State
  const [noteText, setNoteText] = useState<string>("");
  const [isSavingNote, setIsSavingNote] = useState<boolean>(false);

  // Accordions State
  const [showActivityLog, setShowActivityLog] = useState<boolean>(false);

  // Find currently selected lead
  const selectedLead = initialLeads.find((l) => l.id === selectedLeadId);
  const selectedNotes = initialNotes.filter((n) => n.lead_id === selectedLeadId);
  const selectedAuditLogs = initialAuditLogs.filter((a) => a.lead_id === selectedLeadId);

  // Filter logic
  const filteredLeads = initialLeads.filter((lead) => {
    // 1. Status Filter
    if (statusFilter !== "All" && lead.status !== statusFilter) return false;

    // 2. Source Filter
    if (sourceFilter !== "All" && lead.source !== sourceFilter) return false;

    // 3. Date Filters
    if (lead.created_at) {
      const leadDate = new Date(lead.created_at).getTime();
      if (fromDate) {
        const start = new Date(fromDate).getTime();
        if (leadDate < start) return false;
      }
      if (toDate) {
        // Set end date to end of the day (23:59:59)
        const end = new Date(toDate).setHours(23, 59, 59, 999);
        if (leadDate > end) return false;
      }
    }

    // 4. Search Filter (searches name and email)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const nameMatch = lead.name.toLowerCase().includes(query);
      const emailMatch = lead.email.toLowerCase().includes(query);
      if (!nameMatch && !emailMatch) return false;
    }

    return true;
  });

  // Sort logic
  const sortedLeads = [...filteredLeads].sort((a, b) => {
    if (sortOption === "newest") {
      const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
      const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
      return bTime - aTime;
    }
    if (sortOption === "oldest") {
      const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
      const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
      return aTime - bTime;
    }
    if (sortOption === "name-az") {
      return a.name.localeCompare(b.name);
    }
    return 0;
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedLeads.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLeads = sortedLeads.slice(startIndex, startIndex + itemsPerPage);

  // Export CSV Action
  const handleExportCSV = () => {
    const headers = ["Name", "Email", "Source", "Source Page", "Status", "Message", "Date"];
    const rows = filteredLeads.map((lead) => [
      lead.name.replace(/"/g, '""'),
      lead.email.replace(/"/g, '""'),
      lead.source,
      lead.source_page,
      lead.status,
      (lead.message || "").replace(/"/g, '""').replace(/\n/g, " "),
      lead.created_at ? new Date(lead.created_at).toLocaleString("en-GB") : "",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.map((cell) => `"${cell}"`).join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `mannyam_leads_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Update Status Server Action Trigger
  const handleStatusChange = (newStatus: string) => {
    if (!selectedLeadId) return;
    startTransition(async () => {
      try {
        await updateLeadStatus(selectedLeadId, newStatus);
        router.refresh();
      } catch (err: unknown) {
        const error = err as Error;
        alert(error.message || "Failed to update status");
      }
    });
  };

  // Add Note Server Action Trigger
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeadId || !noteText.trim()) return;

    setIsSavingNote(true);
    try {
      await addLeadNote(selectedLeadId, noteText.trim());
      setNoteText("");
      router.refresh();
    } catch (err: unknown) {
      const error = err as Error;
      alert(error.message || "Failed to save note");
    } finally {
      setIsSavingNote(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  // Status badges styling mapping
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "New":
        return "bg-blue-50 text-blue-700 border border-blue-200/60";
      case "Contacted":
        return "bg-amber-50 text-amber-700 border border-amber-200/60";
      case "Proposal":
        return "bg-yellow-50 text-yellow-700 border border-yellow-200/60";
      case "Won":
        return "bg-green-50 text-green-700 border border-green-200/60";
      case "Lost":
        return "bg-gray-100 text-gray-500 border border-gray-200/60";
      default:
        return "bg-gray-50 text-gray-600 border border-gray-100";
    }
  };

  const pipelineStages = ["New", "Contacted", "Proposal", "Won", "Lost"];

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-ivory pb-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-olive">Leads Inbox</h1>
          <p className="font-sans text-sm text-olive/60 mt-1">
            Track and process enquiries from mannyam.in contact form and AI chatbot.
          </p>
        </div>
        <div>
          <button
            onClick={handleExportCSV}
            disabled={filteredLeads.length === 0}
            className="px-4 py-2 bg-olive text-paper hover:bg-olive-2 disabled:bg-olive/40 transition rounded-lg font-sans text-sm flex items-center gap-2 shadow-sm font-medium"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Export CSV ({filteredLeads.length})
          </button>
        </div>
      </div>

      {/* Main Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-8 items-start">
        {/* Left Side: Inbox List & Filter Bar (60%) */}
        <div className="lg:col-span-6 space-y-4">
          {/* Filters Bar */}
          <div className="bg-paper p-4 rounded-xl border border-ivory/60 shadow-sm space-y-4">
            {/* Search & Sort Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-semibold text-olive/50 uppercase tracking-wider mb-1">
                  Search
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-olive/40">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Search name or email..."
                    className="w-full pl-9 pr-4 py-2 border border-ivory rounded-lg text-sm bg-cream/20 text-olive focus:outline-none focus:border-gold font-sans placeholder-olive/35"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-olive/50 uppercase tracking-wider mb-1">
                  Sort
                </label>
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="w-full px-3 py-2 border border-ivory rounded-lg text-sm bg-cream/20 text-olive focus:outline-none focus:border-gold font-sans font-medium"
                >
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                  <option value="name-az">Name A-Z</option>
                </select>
              </div>
            </div>

            {/* Badges Filters Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-cream pt-4">
              <div>
                <label className="block text-[10px] font-semibold text-olive/50 uppercase tracking-wider mb-1">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 border border-ivory rounded-lg text-sm bg-cream/20 text-olive focus:outline-none focus:border-gold font-sans"
                >
                  <option value="All">All statuses</option>
                  {pipelineStages.map((stage) => (
                    <option key={stage} value={stage}>
                      {stage}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-olive/50 uppercase tracking-wider mb-1">
                  Source
                </label>
                <select
                  value={sourceFilter}
                  onChange={(e) => {
                    setSourceFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 border border-ivory rounded-lg text-sm bg-cream/20 text-olive focus:outline-none focus:border-gold font-sans"
                >
                  <option value="All">All sources</option>
                  <option value="Contact Form">Contact Form</option>
                  <option value="AI Chat">AI Chat</option>
                </select>
              </div>
            </div>

            {/* Date Filters Row */}
            <div className="grid grid-cols-2 gap-4 border-t border-cream pt-4">
              <div>
                <label className="block text-[10px] font-semibold text-olive/50 uppercase tracking-wider mb-1">
                  From Date
                </label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => {
                    setFromDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-1.5 border border-ivory rounded-lg text-xs bg-cream/20 text-olive focus:outline-none focus:border-gold font-sans"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-olive/50 uppercase tracking-wider mb-1">
                  To Date
                </label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => {
                    setToDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-1.5 border border-ivory rounded-lg text-xs bg-cream/20 text-olive focus:outline-none focus:border-gold font-sans"
                />
              </div>
            </div>
          </div>

          {/* Table list */}
          <div className="bg-paper rounded-xl border border-ivory/60 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-sans text-xs">
                <thead>
                  <tr className="border-b border-ivory bg-cream/20 text-olive/40 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Name &amp; Email</th>
                    <th className="py-3 px-4">Source</th>
                    <th className="py-3 px-4">Source Page</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream">
                  {paginatedLeads.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-olive/40 text-sm">
                        No leads match the specified criteria.
                      </td>
                    </tr>
                  ) : (
                    paginatedLeads.map((lead) => {
                      const isNew = lead.status === "New";
                      const isSelected = lead.id === selectedLeadId;
                      return (
                        <tr
                          key={lead.id}
                          onClick={() => setSelectedLeadId(lead.id)}
                          className={`cursor-pointer transition hover:bg-cream/30 ${
                            isSelected ? "bg-cream/40" : ""
                          } ${
                            isNew ? "border-l-4 border-l-blue-500 pl-3 font-semibold" : ""
                          }`}
                        >
                          <td className="py-3.5 px-4">
                            <div>
                              <p className={`text-olive ${isNew ? "font-bold text-olive-2" : "text-olive/80"}`}>
                                {lead.name}
                              </p>
                              <p className="text-[10px] text-olive/40 mt-0.5">{lead.email}</p>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-olive/60">{lead.source}</td>
                          <td className="py-3.5 px-4 text-olive/50 max-w-[120px] truncate" title={lead.source_page}>
                            {lead.source_page}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold inline-block leading-none uppercase tracking-wider ${getStatusBadgeClass(lead.status)}`}>
                              {lead.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right text-olive/40">
                            {lead.created_at
                              ? new Date(lead.created_at).toLocaleDateString("en-GB", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "2-digit",
                                })
                              : "-"}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Row */}
            {totalPages > 1 && (
              <div className="border-t border-ivory p-4 flex items-center justify-between bg-cream/10">
                <span className="text-xs text-olive/50">
                  Showing page {currentPage} of {totalPages} ({filteredLeads.length} total filtered)
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-ivory text-xs bg-paper rounded-lg hover:bg-cream/20 disabled:opacity-40 transition font-medium"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-ivory text-xs bg-paper rounded-lg hover:bg-cream/20 disabled:opacity-40 transition font-medium"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Details Sticky Panel (40%) */}
        <div className="lg:col-span-4 lg:sticky lg:top-6 space-y-6">
          {!selectedLead ? (
            <div className="bg-paper p-8 rounded-xl border border-ivory/60 shadow-sm text-center py-20 text-olive/40 font-sans">
              <svg className="w-12 h-12 mx-auto text-olive/20 mb-3" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z" />
              </svg>
              Select a lead row from the list to preview details and notes.
            </div>
          ) : (
            <div className="bg-paper rounded-xl border border-ivory/60 shadow-sm overflow-hidden flex flex-col font-sans">
              {/* Stepper Pipeline */}
              <div className="bg-cream/15 p-4 border-b border-ivory/60 space-y-3">
                <p className="text-[10px] font-semibold text-olive/50 uppercase tracking-wider">
                  Lead Status Stepper
                </p>
                <div className="flex items-center justify-between gap-1">
                  {pipelineStages.map((stage, idx) => {
                    const isActive = selectedLead.status === stage;
                    return (
                      <React.Fragment key={stage}>
                        <button
                          onClick={() => handleStatusChange(stage)}
                          disabled={isPending}
                          className={`text-[9px] font-bold px-2 py-1 rounded transition duration-200 uppercase tracking-wide leading-none ${
                            isActive
                              ? "bg-gold text-paper font-bold shadow-sm"
                              : "bg-cream/40 text-olive/50 hover:bg-cream/80"
                          }`}
                        >
                          {stage}
                        </button>
                        {idx < pipelineStages.length - 1 && (
                          <div className="h-[2px] flex-1 bg-ivory" />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>

                {/* Quick actions wrapper */}
                <div className="flex gap-2 pt-1.5">
                  <button
                    onClick={() => handleStatusChange("Won")}
                    disabled={isPending || selectedLead.status === "Won"}
                    className="flex-1 py-1.5 bg-ok text-paper text-xs font-semibold rounded hover:opacity-90 disabled:opacity-30 transition shadow-sm"
                  >
                    Mark as Won
                  </button>
                  <button
                    onClick={() => handleStatusChange("Lost")}
                    disabled={isPending || selectedLead.status === "Lost"}
                    className="flex-1 py-1.5 bg-bad text-paper text-xs font-semibold rounded hover:opacity-90 disabled:opacity-30 transition shadow-sm"
                  >
                    Mark as Lost
                  </button>
                </div>
              </div>

              {/* Detail fields card */}
              <div className="p-5 space-y-4 border-b border-ivory/50">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-display text-xl font-bold text-olive">{selectedLead.name}</h3>
                    <button
                      onClick={() => copyToClipboard(selectedLead.email)}
                      className="text-xs text-gold font-medium mt-1 inline-flex items-center gap-1 hover:underline"
                    >
                      {selectedLead.email}
                      <svg className="w-3.5 h-3.5 text-gold/60" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                      </svg>
                    </button>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wide inline-block leading-none ${getStatusBadgeClass(selectedLead.status)}`}>
                    {selectedLead.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs bg-cream/15 p-3 rounded-lg border border-cream/50">
                  <div>
                    <p className="text-[10px] font-semibold text-olive/40 uppercase tracking-wider">Source</p>
                    <p className="font-medium text-olive/80 mt-0.5">{selectedLead.source}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-olive/40 uppercase tracking-wider">Submitted On</p>
                    <p className="font-medium text-olive/80 mt-0.5">
                      {selectedLead.created_at
                        ? new Date(selectedLead.created_at).toLocaleString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "-"}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] font-semibold text-olive/40 uppercase tracking-wider">Source Page</p>
                    <a
                      href={`${process.env.NEXT_PUBLIC_SITE_URL || "https://mannyam.in"}${selectedLead.source_page}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gold font-medium mt-0.5 flex items-center gap-1 hover:underline truncate max-w-xs"
                    >
                      {selectedLead.source_page}
                      <svg className="w-3 h-3 text-gold/75 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                      </svg>
                    </a>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] font-semibold text-olive/40 uppercase tracking-wider">Message</p>
                  <div className="bg-cream/5 p-3 rounded-lg border border-cream/30 text-xs text-olive/80 whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto">
                    {selectedLead.message || (
                      <span className="text-olive/35 italic">No message provided.</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Notes form & List */}
              <div className="p-5 space-y-4">
                <h4 className="font-display text-md font-semibold text-olive">Internal Notes</h4>

                <form onSubmit={handleAddNote} className="space-y-2">
                  <textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Type an internal note about this enquiry..."
                    rows={2}
                    className="w-full px-3 py-2 border border-ivory rounded-lg text-xs bg-cream/5 text-olive focus:outline-none focus:border-gold font-sans placeholder-olive/35 resize-none"
                    required
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isSavingNote || !noteText.trim()}
                      className="px-3 py-1.5 bg-olive text-paper text-xs font-semibold rounded hover:bg-olive-2 disabled:bg-olive/40 transition shadow-sm"
                    >
                      {isSavingNote ? "Saving..." : "Add Note"}
                    </button>
                  </div>
                </form>

                {/* Notes List */}
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {selectedNotes.length === 0 ? (
                    <p className="text-xs text-olive/35 italic text-center py-4">No notes added yet.</p>
                  ) : (
                    selectedNotes.map((note) => (
                      <div key={note.id} className="bg-cream/10 p-2.5 rounded-lg border border-cream/50 text-[11px] relative">
                        <div className="flex justify-between items-center text-olive/40 mb-1 font-sans text-[10px]">
                          <span className="font-semibold">{note.users?.name || "System User"}</span>
                          <span>
                            {note.created_at
                              ? new Date(note.created_at).toLocaleString("en-GB", {
                                  day: "2-digit",
                                  month: "short",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : ""}
                          </span>
                        </div>
                        <p className="text-olive/80 leading-relaxed font-sans">{note.note}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Activity Log Accordion (Prompt 9-3 feature) */}
              <div className="border-t border-ivory/50">
                <button
                  type="button"
                  onClick={() => setShowActivityLog(!showActivityLog)}
                  className="w-full px-5 py-3 flex items-center justify-between text-left text-xs font-semibold text-olive/60 bg-cream/5 hover:bg-cream/10 transition"
                >
                  <span>Show Activity Log ({selectedAuditLogs.length})</span>
                  <svg
                    className={`w-4 h-4 text-olive/40 transition-transform ${showActivityLog ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>

                {showActivityLog && (
                  <div className="p-5 bg-cream/10 border-t border-ivory/50 space-y-4 max-h-48 overflow-y-auto">
                    {selectedAuditLogs.length === 0 ? (
                      <p className="text-xs text-olive/35 italic text-center py-2">No activity events logged.</p>
                    ) : (
                      <div className="space-y-3 relative pl-3 border-l border-gold/25 ml-1">
                        {selectedAuditLogs.map((log) => (
                          <div key={log.id} className="relative text-[10px] leading-relaxed text-olive/75">
                            {/* Dot on timeline */}
                            <span className="absolute -left-[16px] top-1 w-2.5 h-2.5 rounded-full bg-gold border border-paper" />
                            <div className="font-semibold text-[9px] text-olive/40">
                              {log.changed_at ? new Date(log.changed_at).toLocaleString("en-GB") : ""}
                            </div>
                            <p className="font-sans mt-0.5">
                              <span className="font-semibold text-olive">{log.changed_by_name || "System"}</span>{" "}
                              changed status from <span className="font-medium text-olive">{log.from_status || "None"}</span> to{" "}
                              <span className="font-medium text-olive">{log.to_status}</span>.
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
