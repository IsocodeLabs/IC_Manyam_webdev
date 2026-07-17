"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/commerce/format";
import { updateBookingStatus, addBookingNote } from "../actions";

interface BookingItem {
  id: string;
  package_title: string;
  departure_date: string | null;
  travellers: number;
  unit_amount: number;
  line_amount: number;
}

interface BookingNote {
  id: string;
  note: string;
  created_at: string | null;
  created_by_name: string | null;
}

interface BookingAuditLog {
  id: string;
  from_status: string | null;
  to_status: string;
  notes: string | null;
  changed_by_name: string | null;
  changed_at: string | null;
}

interface Booking {
  id: string;
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
  razorpay_order_id?: string | null;
  razorpay_payment_id?: string | null;
  razorpay_signature?: string | null;
}

interface BookingDetailClientProps {
  booking: Booking;
  items: BookingItem[];
  notes: BookingNote[];
  auditLogs: BookingAuditLog[];
  currentStaffRole: "Admin" | "Marketer" | "Content Manager";
}

export function BookingDetailClient({
  booking,
  items,
  notes,
  auditLogs,
  currentStaffRole,
}: BookingDetailClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Status Change State
  const [targetStatus, setTargetStatus] = useState<string>("");
  const [statusNotes, setStatusNotes] = useState<string>("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);

  // New Note State
  const [newNoteText, setNewNoteText] = useState<string>("");
  const [isAddingNote, setIsAddingNote] = useState<boolean>(false);

  // Refund Modal State
  const [showRefundModal, setShowRefundModal] = useState<boolean>(false);
  const [refundAmountInput, setRefundAmountInput] = useState<string>("");
  const [isProcessingRefund, setIsRefundProcessing] = useState<boolean>(false);

  // Handlers
  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetStatus) return;

    setIsUpdatingStatus(true);
    startTransition(async () => {
      try {
        await updateBookingStatus(booking.id, booking.status, targetStatus, statusNotes.trim());
        setTargetStatus("");
        setStatusNotes("");
        router.refresh();
        alert("Status updated successfully.");
      } catch (err: unknown) {
        const error = err as Error;
        alert(error.message || "Failed to update status.");
      } finally {
        setIsUpdatingStatus(false);
      }
    });
  };

  const handleAddNoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    setIsAddingNote(true);
    try {
      await addBookingNote(booking.id, newNoteText.trim());
      setNewNoteText("");
      router.refresh();
    } catch (err: unknown) {
      const error = err as Error;
      alert(error.message || "Failed to save note.");
    } finally {
      setIsAddingNote(false);
    }
  };

  const handleRefundSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountVal = parseFloat(refundAmountInput);
    if (isNaN(amountVal) || amountVal <= 0) {
      alert("Please enter a valid refund amount.");
      return;
    }

    // Convert major units to minor units (cents/pence/paise)
    const minorAmount = Math.round(amountVal * 100);
    const maxRefundable = booking.amount_paid - booking.refund_amount;

    if (minorAmount > maxRefundable) {
      alert(`Refund amount exceeds remaining paid balance of ${formatCurrency(maxRefundable, booking.currency)}.`);
      return;
    }

    setIsRefundProcessing(true);
    try {
      const res = await fetch(`/api/bookings/${booking.id}/refund`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: minorAmount }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to process refund.");
      }

      alert("Refund processed successfully via Razorpay.");
      setShowRefundModal(false);
      setRefundAmountInput("");
      router.refresh();
    } catch (err: unknown) {
      const error = err as Error;
      alert(error.message || "Refund failed.");
    } finally {
      setIsRefundProcessing(false);
    }
  };

  // Status List available for transition
  const statuses = ["Pending", "Confirmed", "Paid", "Cancelled"];

  // Colors for Badges
  const getStatusBadgeClass = (status: string, refundAmount: number) => {
    if (refundAmount > 0 && status === "Partially Refunded") {
      return "bg-indigo-50 text-indigo-700 border-indigo-200";
    }
    switch (status) {
      case "Pending":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Confirmed":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Paid":
        return "bg-green-50 text-green-700 border-green-200";
      case "Cancelled":
        return "bg-red-50 text-red-700 border-red-200";
      case "Refunded":
        return "bg-purple-50 text-purple-700 border-purple-200";
      default:
        return "bg-gray-50 text-gray-600 border-gray-200";
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Breadcrumb Navigation */}
      <div className="flex items-center justify-between border-b border-ivory pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-olive/50">
            <Link href="/dashboard/bookings" className="hover:text-gold transition">
              Bookings
            </Link>
            <span>/</span>
            <span className="text-olive">Detail</span>
          </div>
          <h1 className="font-display text-4xl font-semibold text-olive mt-1">
            Booking #{booking.id.substring(0, 8).toUpperCase()}
          </h1>
        </div>

        {/* Admin Refund Trigger & Links */}
        <div className="flex gap-3">
          {currentStaffRole === "Admin" && booking.amount_paid > booking.refund_amount && (
            <button
              onClick={() => setShowRefundModal(true)}
              className="px-4 py-2 border border-red-200 hover:border-red-300 text-red-700 bg-red-50/50 hover:bg-red-50 transition rounded-lg font-sans text-sm font-semibold flex items-center gap-2 shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
              </svg>
              Issue Refund
            </button>
          )}

          <a
            href={`/api/bookings/${booking.id}/invoice`}
            className="px-4 py-2 bg-olive hover:bg-olive/90 text-cream transition rounded-lg font-sans text-sm font-semibold flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download Invoice
          </a>

          <Link
            href="/dashboard/bookings"
            className="px-4 py-2 border border-ivory hover:bg-cream/40 transition rounded-lg font-sans text-sm font-medium text-olive flex items-center gap-2"
          >
            Back to List
          </Link>
        </div>
      </div>

      {/* Grid Layout: Main info Left, Actions Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* LEFT TWO-THIRDS: Summary, Items, Timelines */}
        <div className="lg:col-span-2 space-y-8">
          {/* Card 1: Customer Contact Summary */}
          <div className="bg-paper p-6 rounded-xl border border-ivory/60 shadow-sm space-y-4">
            <h2 className="font-display text-2xl font-semibold text-olive border-b border-cream pb-2">
              Traveller Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div>
                <p className="text-[10px] font-bold text-olive/40 uppercase tracking-wider">Full Name</p>
                <p className="font-semibold text-olive mt-0.5 text-base">{booking.contact_name || "Guest Traveller"}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-olive/40 uppercase tracking-wider">Email Address</p>
                <p className="font-semibold text-olive mt-0.5 text-base hover:text-gold transition">
                  <a href={`mailto:${booking.contact_email}`}>{booking.contact_email}</a>
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-olive/40 uppercase tracking-wider">Created At</p>
                <p className="font-medium text-olive mt-0.5">
                  {booking.created_at ? new Date(booking.created_at).toLocaleString("en-GB") : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-olive/40 uppercase tracking-wider">Payment Structure</p>
                <p className="font-semibold mt-0.5 text-gold uppercase tracking-wider text-xs">
                  {booking.payment_type === "deposit" ? "Deposit Balance" : "Full Amount Paid"}
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: Line Items Table */}
          <div className="bg-paper rounded-xl border border-ivory/60 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-cream">
              <h2 className="font-display text-2xl font-semibold text-olive">Journey Packages</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse font-sans text-sm">
                <thead>
                  <tr className="bg-cream/40 text-olive text-xs uppercase tracking-wider font-semibold">
                    <th className="px-6 py-3">Package Title</th>
                    <th className="px-6 py-3">Departure Date</th>
                    <th className="px-6 py-3 text-center">Travellers</th>
                    <th className="px-6 py-3 text-right">Unit Price</th>
                    <th className="px-6 py-3 text-right">Line Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-cream/10 transition">
                      <td className="px-6 py-4 font-semibold text-olive">{item.package_title}</td>
                      <td className="px-6 py-4 text-xs font-semibold text-olive/70">
                        {item.departure_date ? new Date(item.departure_date).toLocaleDateString("en-GB") : "Open date"}
                      </td>
                      <td className="px-6 py-4 text-center font-medium">{item.travellers}</td>
                      <td className="px-6 py-4 text-right">{formatCurrency(item.unit_amount, booking.currency)}</td>
                      <td className="px-6 py-4 text-right font-semibold">{formatCurrency(item.line_amount, booking.currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total Pricing Calculations Recap */}
            <div className="p-6 bg-cream/20 border-t border-cream grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-xs text-olive/60">
                Prices and refunds are stored securely in minor subunits server-side.
              </div>
              <div className="space-y-2 text-sm text-right">
                <div className="flex justify-between md:justify-end md:gap-8 text-olive/70">
                  <span>Grand Subtotal:</span>
                  <span className="font-medium">{formatCurrency(booking.total_amount, booking.currency)}</span>
                </div>
                <div className="flex justify-between md:justify-end md:gap-8 text-green-700">
                  <span>Total Paid to Date:</span>
                  <span className="font-semibold">{formatCurrency(booking.amount_paid, booking.currency)}</span>
                </div>
                {booking.refund_amount > 0 && (
                  <div className="flex justify-between md:justify-end md:gap-8 text-red-600 font-medium">
                    <span>Refunded Amount:</span>
                    <span>-{formatCurrency(booking.refund_amount, booking.currency)}</span>
                  </div>
                )}
                <div className="flex justify-between md:justify-end md:gap-8 text-olive font-bold border-t border-cream pt-2 text-lg">
                  <span>Outstanding Balance:</span>
                  <span className="text-gold">
                    {formatCurrency(Math.max(0, booking.total_amount - booking.amount_paid), booking.currency)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Chronological Audit Trail Timeline */}
          <div className="bg-paper p-6 rounded-xl border border-ivory/60 shadow-sm space-y-4">
            <h2 className="font-display text-2xl font-semibold text-olive border-b border-cream pb-2">
              Status Pipeline Audit Logs
            </h2>
            {auditLogs.length === 0 ? (
              <p className="text-xs italic text-olive/50 font-sans">No status changes have been logged yet for this booking.</p>
            ) : (
              <div className="space-y-4 relative pl-4 before:absolute before:left-1 before:top-2 before:bottom-2 before:w-0.5 before:bg-cream">
                {auditLogs.map((log) => (
                  <div key={log.id} className="relative text-xs font-sans space-y-1">
                    <span className="absolute -left-[17px] top-1.5 w-2.5 h-2.5 rounded-full bg-gold border-2 border-paper"></span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-olive">{log.changed_by_name || "System"}</span>
                      <span className="text-olive/40">changed status to</span>
                      <span className="px-2 py-0.5 rounded bg-cream font-semibold text-olive uppercase tracking-wider text-[10px]">
                        {log.to_status}
                      </span>
                      <span className="text-olive/40 ml-auto font-medium">
                        {log.changed_at ? new Date(log.changed_at).toLocaleString("en-GB") : "N/A"}
                      </span>
                    </div>
                    {log.notes && <p className="text-olive/70 italic bg-cream/10 p-2 rounded border border-cream/40 mt-1">{log.notes}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT ONE-THIRD: Controls, Notes, Razorpay Reference Link */}
        <div className="space-y-8">
          {/* Status Badge Recap */}
          <div className="bg-paper p-6 rounded-xl border border-ivory/60 shadow-sm space-y-4">
            <p className="text-[10px] font-bold text-olive/40 uppercase tracking-wider">Current Pipeline Status</p>
            <div className={`px-4 py-3 rounded-lg border text-center font-display text-2xl font-bold tracking-wide ${getStatusBadgeClass(booking.status, booking.refund_amount)}`}>
              {booking.refund_amount > 0 && booking.status === "Partially Refunded" ? "Partially Refunded" : booking.status}
            </div>
          </div>

          {/* Status Pipeline Form controls */}
          <div className="bg-paper p-6 rounded-xl border border-ivory/60 shadow-sm space-y-4">
            <h3 className="font-display text-xl font-semibold text-olive border-b border-cream pb-2">
              Update Booking Status
            </h3>
            <form onSubmit={handleStatusSubmit} className="space-y-4 font-sans text-sm">
              <div>
                <label className="block text-[10px] font-bold text-olive/50 uppercase tracking-wider mb-1">
                  Target Status State
                </label>
                <select
                  value={targetStatus}
                  onChange={(e) => setTargetStatus(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-ivory rounded bg-cream/10 focus:outline-none focus:border-gold"
                >
                  <option value="">-- Choose Status --</option>
                  {statuses.map((s) => (
                    <option key={s} value={s} disabled={s === booking.status}>
                      {s}
                    </option>
                  ))}
                  <option value="Partially Refunded" disabled={booking.status === "Partially Refunded"}>
                    Partially Refunded
                  </option>
                  <option value="Refunded" disabled={booking.status === "Refunded"}>
                    Refunded
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-olive/50 uppercase tracking-wider mb-1">
                  Status Change Notes
                </label>
                <textarea
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  placeholder="Describe status transition context, or client correspondence details..."
                  className="w-full px-3 py-2 border border-ivory rounded bg-cream/10 focus:outline-none focus:border-gold h-20 text-xs resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={!targetStatus || isUpdatingStatus}
                className="w-full py-2 bg-olive hover:bg-olive-2 disabled:bg-olive/40 text-paper transition rounded font-semibold text-xs uppercase tracking-wider"
              >
                {isUpdatingStatus ? "Updating Pipeline..." : "Commit Status Change"}
              </button>
            </form>
          </div>

          {/* Razorpay Tracking Reference Dashboard Link */}
          {(booking.razorpay_order_id || booking.razorpay_payment_id) && (
            <div className="bg-paper p-6 rounded-xl border border-ivory/60 shadow-sm space-y-4">
              <h3 className="font-display text-xl font-semibold text-olive border-b border-cream pb-2">
                Razorpay Test References
              </h3>
              <div className="space-y-3 text-xs font-sans">
                {booking.razorpay_order_id && (
                  <div>
                    <p className="text-[9px] font-bold text-olive/40 uppercase tracking-wider">Razorpay Order ID</p>
                    <a
                      href={`https://dashboard.razorpay.com/app/orders/${booking.razorpay_order_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-gold font-semibold hover:underline flex items-center gap-1 mt-0.5"
                    >
                      {booking.razorpay_order_id}
                      <svg className="w-3 h-3 inline" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                )}
                {booking.razorpay_payment_id && (
                  <div>
                    <p className="text-[9px] font-bold text-olive/40 uppercase tracking-wider">Razorpay Payment ID</p>
                    <a
                      href={`https://dashboard.razorpay.com/app/payments/${booking.razorpay_payment_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-gold font-semibold hover:underline flex items-center gap-1 mt-0.5"
                    >
                      {booking.razorpay_payment_id}
                      <svg className="w-3 h-3 inline" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Internal Staff Notes thread box */}
          <div className="bg-paper p-6 rounded-xl border border-ivory/60 shadow-sm space-y-4">
            <h3 className="font-display text-xl font-semibold text-olive border-b border-cream pb-2">
              Internal Staff Notes
            </h3>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {notes.length === 0 ? (
                <p className="text-xs italic text-olive/40">No internal notes yet. Enter comments below to document this booking.</p>
              ) : (
                notes.map((n) => (
                  <div key={n.id} className="p-3 bg-cream/25 rounded border border-cream text-xs space-y-1">
                    <div className="flex items-center justify-between text-olive/55 font-semibold text-[10px]">
                      <span>{n.created_by_name || "System"}</span>
                      <span>{n.created_at ? new Date(n.created_at).toLocaleString("en-GB") : "N/A"}</span>
                    </div>
                    <p className="text-olive/85 whitespace-pre-wrap">{n.note}</p>
                  </div>
                ))
              )}
            </div>

            {/* Notes Append Form */}
            <form onSubmit={handleAddNoteSubmit} className="space-y-3 font-sans">
              <textarea
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                placeholder="Write message, notes, or customer updates..."
                required
                className="w-full px-3 py-2 border border-ivory rounded bg-cream/10 text-xs h-20 resize-none focus:outline-none focus:border-gold"
              />
              <button
                type="submit"
                disabled={isAddingNote || !newNoteText.trim()}
                className="w-full py-2 bg-olive hover:bg-olive-2 disabled:bg-olive/40 text-paper transition rounded font-semibold text-xs uppercase tracking-wider"
              >
                {isAddingNote ? "Saving Note..." : "Add Note"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* MODAL WINDOW: Issue Razorpay Refund Confirmation Dialog */}
      {showRefundModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-paper max-w-md w-full rounded-xl border border-ivory/60 shadow-lg p-6 space-y-6 animate-fadeIn font-sans">
            <div>
              <h2 className="font-display text-3xl font-semibold text-red-800">Issue Refund</h2>
              <p className="text-xs text-olive/60 mt-1">
                Creates a Razorpay sandbox refund against the active payment transaction.
              </p>
            </div>

            <div className="p-3 bg-red-50 text-red-800 rounded border border-red-100 text-xs space-y-2">
              <h4 className="font-bold flex items-center gap-1.5 uppercase tracking-wide">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                High-Impact Action
              </h4>
              <p>
                Refund transactions are processed directly on Razorpay&apos;s API and <strong>cannot be undone</strong>. Please verify details before confirming.
              </p>
            </div>

            <form onSubmit={handleRefundSubmit} className="space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold text-olive/50 uppercase tracking-wider">
                  <label htmlFor="refundAmount">Refund Amount ({booking.currency})</label>
                  <span>
                    Max: {formatCurrency(booking.amount_paid - booking.refund_amount, booking.currency)}
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-olive/40 font-mono text-sm">
                    {booking.currency === "GBP" ? "£" : booking.currency === "EUR" ? "€" : booking.currency === "INR" ? "₹" : "$"}
                  </span>
                  <input
                    id="refundAmount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={refundAmountInput}
                    onChange={(e) => setRefundAmountInput(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-2 border border-ivory rounded bg-cream/10 text-olive focus:outline-none focus:border-red-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowRefundModal(false);
                    setRefundAmountInput("");
                  }}
                  className="px-4 py-2 border border-ivory rounded hover:bg-cream/40 transition text-xs font-semibold text-olive"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessingRefund}
                  className="px-4 py-2 bg-red-700 hover:bg-red-800 disabled:bg-red-700/40 text-paper transition rounded font-semibold text-xs uppercase tracking-wider"
                >
                  {isProcessingRefund ? "Processing..." : "Confirm Refund"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
