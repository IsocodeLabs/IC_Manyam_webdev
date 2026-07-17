"use client";

import React, { useState } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/commerce/format";

interface BookingItem {
  id: string;
  booking_id: string;
  package_id: string | null;
  package_title: string;
  departure_date: string | null;
  travellers: number;
  unit_amount: number;
  line_amount: number;
}

interface Booking {
  id: string;
  customer_id: string | null;
  status: string;
  currency: string;
  total_amount: number;
  amount_paid: number;
  refund_amount: number;
  payment_type: "deposit" | "full" | null;
  contact_name: string | null;
  contact_email: string | null;
  notes: string | null;
  created_at: string | null;
  booking_items?: BookingItem[];
}

interface BookingsClientProps {
  initialBookings: Booking[];
}

export function BookingsClient({ initialBookings }: BookingsClientProps) {
  // Filters State
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortOption, setSortOption] = useState<string>("newest");

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 15;

  // Filter Logic
  const filteredBookings = initialBookings.filter((booking) => {
    // 1. Status Filter
    if (statusFilter !== "All") {
      if (statusFilter === "Refunded" && booking.status === "Refunded") {
        // Matches Refunded
      } else if (statusFilter === "Partially Refunded" && booking.refund_amount > 0 && booking.status === "Partially Refunded") {
        // Matches Partially Refunded
      } else if (booking.status !== statusFilter) {
        return false;
      }
    }

    // 2. Date Filters
    if (booking.created_at) {
      const bookingTime = new Date(booking.created_at).getTime();
      if (fromDate) {
        const start = new Date(fromDate).setHours(0, 0, 0, 0);
        if (bookingTime < start) return false;
      }
      if (toDate) {
        const end = new Date(toDate).setHours(23, 59, 59, 999);
        if (bookingTime > end) return false;
      }
    }

    // 3. Search (Reference, Name, Email)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const refMatch = booking.id.toLowerCase().includes(query) || 
                       booking.id.substring(0, 8).toLowerCase().includes(query);
      const nameMatch = booking.contact_name?.toLowerCase().includes(query);
      const emailMatch = booking.contact_email?.toLowerCase().includes(query);
      const packageMatch = booking.booking_items?.some((item) =>
        item.package_title.toLowerCase().includes(query)
      );

      if (!refMatch && !nameMatch && !emailMatch && !packageMatch) {
        return false;
      }
    }

    return true;
  });

  // Sort Logic
  const sortedBookings = [...filteredBookings].sort((a, b) => {
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
    if (sortOption === "highest") {
      return b.total_amount - a.total_amount;
    }
    if (sortOption === "lowest") {
      return a.total_amount - b.total_amount;
    }
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedBookings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBookings = sortedBookings.slice(startIndex, startIndex + itemsPerPage);

  // Status Badge Class Selector
  const getStatusBadgeClass = (status: string, refundAmount: number) => {
    if (refundAmount > 0 && status === "Partially Refunded") {
      return "bg-indigo-50 text-indigo-700 border border-indigo-200/60";
    }
    switch (status) {
      case "Pending":
        return "bg-amber-50 text-amber-700 border border-amber-200/60";
      case "Confirmed":
        return "bg-blue-50 text-blue-700 border border-blue-200/60";
      case "Paid":
        return "bg-green-50 text-green-700 border border-green-200/60";
      case "Cancelled":
        return "bg-red-50 text-red-700 border border-red-200/60";
      case "Refunded":
        return "bg-purple-50 text-purple-700 border border-purple-200/60";
      default:
        return "bg-gray-50 text-gray-600 border border-gray-100";
    }
  };

  // CSV Export Handler
  const handleExportCSV = () => {
    const headers = [
      "Booking Reference",
      "Customer Name",
      "Customer Email",
      "Packages",
      "Status",
      "Currency",
      "Total Amount (Major)",
      "Amount Paid (Major)",
      "Refund Amount (Major)",
      "Created At"
    ];

    const rows = sortedBookings.map((booking) => {
      const packagesStr = booking.booking_items
        ?.map((item) => `${item.package_title} (x${item.travellers})`)
        .join(" | ") || "";
      
      return [
        booking.id.substring(0, 8).toUpperCase(),
        booking.contact_name || "",
        booking.contact_email || "",
        packagesStr.replace(/"/g, '""'),
        booking.status,
        booking.currency,
        (booking.total_amount / 100).toFixed(2),
        (booking.amount_paid / 100).toFixed(2),
        (booking.refund_amount / 100).toFixed(2),
        booking.created_at ? new Date(booking.created_at).toLocaleString("en-GB") : ""
      ];
    });

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.map((cell) => `"${cell}"`).join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `mannyam_bookings_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header section with heading and CSV export */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-ivory pb-4">
        <div>
          <h1 className="font-display text-4xl font-semibold text-olive">Bookings</h1>
          <p className="font-sans text-sm text-olive/60 mt-1">
            Manage customer journeys, control status pipelines, and process refunds.
          </p>
        </div>
        <div>
          <button
            onClick={handleExportCSV}
            disabled={sortedBookings.length === 0}
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
            Export CSV ({sortedBookings.length})
          </button>
        </div>
      </div>

      {/* Filter and Search controls */}
      <div className="bg-paper p-5 rounded-xl border border-ivory/60 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-[10px] font-semibold text-olive/50 uppercase tracking-wider mb-1">
              Search Reference, Customer, or Package
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
                placeholder="Search reference, name, email or package title..."
                className="w-full pl-9 pr-4 py-2 border border-ivory rounded-lg text-sm bg-cream/10 text-olive focus:outline-none focus:border-gold font-sans placeholder-olive/35"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-olive/50 uppercase tracking-wider mb-1">
              Status Filter
            </label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-ivory rounded-lg text-sm bg-cream/10 text-olive focus:outline-none focus:border-gold font-sans font-medium"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Paid">Paid</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Refunded">Refunded</option>
              <option value="Partially Refunded">Partially Refunded</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-olive/50 uppercase tracking-wider mb-1">
              Sort By
            </label>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="w-full px-3 py-2 border border-ivory rounded-lg text-sm bg-cream/10 text-olive focus:outline-none focus:border-gold font-sans font-medium"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="highest">Highest total</option>
              <option value="lowest">Lowest total</option>
            </select>
          </div>
        </div>

        {/* Date range row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-cream pt-4">
          <div>
            <label className="block text-[10px] font-semibold text-olive/50 uppercase tracking-wider mb-1">
              Date From
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-ivory rounded-lg text-sm bg-cream/10 text-olive focus:outline-none focus:border-gold font-sans placeholder-olive/35"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-olive/50 uppercase tracking-wider mb-1">
              Date To
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => {
                setToDate(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-ivory rounded-lg text-sm bg-cream/10 text-olive focus:outline-none focus:border-gold font-sans placeholder-olive/35"
            />
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-paper rounded-xl border border-ivory/60 shadow-sm overflow-hidden">
        {paginatedBookings.length === 0 ? (
          <div className="p-12 text-center text-olive/50 font-sans text-sm">
            No bookings found matching the selected criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-sans text-sm">
              <thead>
                <tr className="bg-olive text-paper text-xs uppercase tracking-wider font-semibold">
                  <th className="px-6 py-4">Reference</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Package(s)</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Total</th>
                  <th className="px-6 py-4 text-right">Paid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream text-olive">
                {paginatedBookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className="hover:bg-cream/20 transition-all duration-150 cursor-pointer"
                  >
                    <td className="px-6 py-4 font-mono text-xs font-semibold text-gold">
                      <Link
                        href={`/dashboard/bookings/${booking.id}`}
                        className="hover:underline hover:text-gold-2 block py-1"
                      >
                        #{booking.id.substring(0, 8).toUpperCase()}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold">{booking.contact_name || "Guest Traveller"}</div>
                      <div className="text-xs text-olive/60 mt-0.5">{booking.contact_email}</div>
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate">
                      {booking.booking_items?.map((item, idx) => (
                        <div key={item.id} className="text-xs font-medium">
                          {idx > 0 && <span className="text-olive/30 mr-1">|</span>}
                          {item.package_title} <span className="text-olive/50 font-normal">(x{item.travellers})</span>
                        </div>
                      )) || <span className="text-olive/40 italic">No packages</span>}
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-olive/70">
                      {booking.created_at ? new Date(booking.created_at).toLocaleDateString("en-GB") : "N/A"}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadgeClass(booking.status, booking.refund_amount)}`}>
                        {booking.refund_amount > 0 && booking.status === "Partially Refunded" ? "Partially Refunded" : booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-semibold">
                      {formatCurrency(booking.total_amount, booking.currency)}
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-olive/80">
                      <div className={booking.amount_paid >= booking.total_amount ? "text-green-700 font-semibold" : ""}>
                        {formatCurrency(booking.amount_paid, booking.currency)}
                      </div>
                      {booking.refund_amount > 0 && (
                        <div className="text-[10px] text-red-600 mt-0.5">
                          Refunded: {formatCurrency(booking.refund_amount, booking.currency)}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination bar */}
        {totalPages > 1 && (
          <div className="p-4 bg-cream/10 border-t border-cream flex items-center justify-between font-sans text-sm">
            <span className="text-xs text-olive/60">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, sortedBookings.length)} of {sortedBookings.length} bookings
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 border border-ivory rounded hover:bg-cream/40 disabled:opacity-40 transition text-xs font-medium"
              >
                Previous
              </button>
              <span className="px-3 py-1.5 text-xs text-olive font-semibold self-center">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 border border-ivory rounded hover:bg-cream/40 disabled:opacity-40 transition text-xs font-medium"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
