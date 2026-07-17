"use client";

import React, { useState } from "react";
import Link from "next/link";

interface AuditLogEntry {
  id: string;
  lead_id: string;
  changed_by: string | null;
  changed_by_name: string | null;
  from_status: string | null;
  to_status: string;
  changed_at: string | null;
  leads: {
    name: string;
  } | null;
}

interface UserSummary {
  id: string;
  name: string;
}

interface AuditLogClientProps {
  initialLogs: AuditLogEntry[];
  users: UserSummary[];
}

export function AuditLogClient({ initialLogs, users }: AuditLogClientProps) {
  const [selectedUser, setSelectedUser] = useState<string>("All");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  // Filters logic
  const filteredLogs = initialLogs.filter((log) => {
    // 1. User Filter
    if (selectedUser !== "All" && log.changed_by !== selectedUser) {
      return false;
    }

    // 2. Date Filter
    if (log.changed_at) {
      const logTime = new Date(log.changed_at).getTime();
      if (fromDate) {
        const start = new Date(fromDate).getTime();
        if (logTime < start) return false;
      }
      if (toDate) {
        const end = new Date(toDate).setHours(23, 59, 59, 999);
        if (logTime > end) return false;
      }
    }

    return true;
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-ivory pb-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-olive">Status Audit Log</h1>
          <p className="text-sm text-olive/60 mt-1">
            Review status transition history across all tourism leads.
          </p>
        </div>
        <div>
          <Link
            href="/leads"
            className="px-4 py-2 border border-olive text-olive hover:bg-cream transition rounded-lg text-sm font-semibold inline-flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to Inbox
          </Link>
        </div>
      </div>

      {/* Filter panel */}
      <div className="bg-paper p-4 rounded-xl border border-ivory/60 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-[10px] font-semibold text-olive/50 uppercase tracking-wider mb-1">
            Filter by User
          </label>
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="w-full px-3 py-2 border border-ivory rounded-lg text-sm bg-cream/20 text-olive focus:outline-none focus:border-gold"
          >
            <option value="All">All users</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-olive/50 uppercase tracking-wider mb-1">
            From Date
          </label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="w-full px-3 py-1.5 border border-ivory rounded-lg text-xs bg-cream/20 text-olive focus:outline-none focus:border-gold"
          />
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-olive/50 uppercase tracking-wider mb-1">
            To Date
          </label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="w-full px-3 py-1.5 border border-ivory rounded-lg text-xs bg-cream/20 text-olive focus:outline-none focus:border-gold"
          />
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-paper rounded-xl border border-ivory/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-ivory bg-cream/20 text-olive/40 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Lead Name</th>
                <th className="py-3 px-4">Changed By</th>
                <th className="py-3 px-4 text-center">From Status</th>
                <th className="py-3 px-4 text-center">To Status</th>
                <th className="py-3 px-4 text-right">Date &amp; Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-olive/40 text-sm">
                    No status audit records found matching selection.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-cream/10 transition">
                    <td className="py-3.5 px-4 font-medium text-olive">
                      {log.leads?.name || <span className="text-olive/35 italic">Deleted Lead</span>}
                    </td>
                    <td className="py-3.5 px-4 text-olive/75">{log.changed_by_name || "System"}</td>
                    <td className="py-3.5 px-4 text-center text-olive/50">
                      {log.from_status ? (
                        <span className="px-2 py-0.5 rounded-full bg-cream text-olive/60 font-semibold uppercase text-[9px] border border-ivory">
                          {log.from_status}
                        </span>
                      ) : (
                        <span className="italic text-olive/35">None</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-gold/10 text-gold-deep font-bold uppercase text-[9px] border border-gold/25">
                        {log.to_status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right text-olive/40">
                      {log.changed_at
                        ? new Date(log.changed_at).toLocaleString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "-"}
                    </td>
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
