"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createDiscountCode, updateDiscountCode, deleteDiscountCode } from "./actions";
import { formatCurrency } from "@/lib/commerce/format";

interface DiscountCode {
  id: string;
  code: string;
  type: string; // 'percent' | 'fixed'
  value: number; // minor units for 'fixed'
  active: boolean;
  expires_at: string | null;
  max_uses: number | null;
  times_used: number;
  created_at: string | null;
}

interface DiscountsClientProps {
  initialDiscounts: DiscountCode[];
  currentStaffRole: "Admin" | "Marketer" | "Content Manager";
}

export function DiscountsClient({ initialDiscounts, currentStaffRole }: DiscountsClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Dialog Forms state
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Inputs State
  const [code, setCode] = useState<string>("");
  const [type, setType] = useState<"percent" | "fixed">("percent");
  const [value, setValue] = useState<string>("");
  const [active, setActive] = useState<boolean>(true);
  const [expiresAt, setExpiresAt] = useState<string>("");
  const [maxUses, setMaxUses] = useState<string>("");

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Reset form helper
  const resetForm = () => {
    setCode("");
    setType("percent");
    setValue("");
    setActive(true);
    setExpiresAt("");
    setMaxUses("");
    setEditingId(null);
  };

  // Open Add Dialog
  const handleOpenAdd = () => {
    resetForm();
    setIsOpen(true);
  };

  // Open Edit Dialog
  const handleOpenEdit = (discount: DiscountCode) => {
    setCode(discount.code);
    setType(discount.type as "percent" | "fixed");
    // Convert fixed minor units value to major units for user input
    setValue(discount.type === "fixed" ? (discount.value / 100).toString() : discount.value.toString());
    setActive(discount.active);
    setExpiresAt(discount.expires_at ? new Date(discount.expires_at).toISOString().substring(0, 16) : "");
    setMaxUses(discount.max_uses ? discount.max_uses.toString() : "");
    setEditingId(discount.id);
    setIsOpen(true);
  };

  // Form submit handler (Creates or updates discount code)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedValue = parseFloat(value);
    if (isNaN(parsedValue) || parsedValue <= 0) {
      alert("Please enter a valid positive discount rate or amount.");
      return;
    }

    if (type === "percent" && parsedValue > 100) {
      alert("Percentage discount value cannot exceed 100%.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        code: code.trim(),
        type,
        value: parsedValue,
        active,
        expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
        max_uses: maxUses ? parseInt(maxUses) : null
      };

      if (editingId) {
        // Update existing discount
        const res = await updateDiscountCode(editingId, payload);
        if (res.success) {
          alert("Discount code updated successfully.");
        }
      } else {
        // Create new discount
        const res = await createDiscountCode(payload);
        if (res.success) {
          alert("Discount code created successfully.");
        }
      }

      setIsOpen(false);
      resetForm();
      router.refresh();
    } catch (err: unknown) {
      const error = err as Error;
      alert(error.message || "Failed to save discount code.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fast inline toggle for Active/Inactive status
  const handleToggleActive = (discount: DiscountCode) => {
    startTransition(async () => {
      try {
        await updateDiscountCode(discount.id, { active: !discount.active });
        router.refresh();
      } catch (err: unknown) {
        const error = err as Error;
        alert(error.message || "Failed to toggle status.");
      }
    });
  };

  // Delete handler (restricted to Admin role)
  const handleDelete = async (id: string, codeName: string) => {
    if (currentStaffRole !== "Admin") {
      alert("Permission denied. Only Admins can delete discount codes.");
      return;
    }

    if (!confirm(`Are you sure you want to permanently delete the discount code "${codeName}"? This cannot be undone.`)) {
      return;
    }

    try {
      const res = await deleteDiscountCode(id);
      if (res.success) {
        alert("Discount code deleted successfully.");
        router.refresh();
      }
    } catch (err: unknown) {
      const error = err as Error;
      alert(error.message || "Failed to delete discount code.");
    }
  };

  // Check if a code is expired
  const isExpired = (expiresAtStr: string | null) => {
    if (!expiresAtStr) return false;
    return new Date(expiresAtStr) < new Date();
  };

  return (
    <div className="space-y-6">
      {/* Header and Add button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-ivory pb-4">
        <div>
          <h1 className="font-display text-4xl font-semibold text-olive">Discount Codes</h1>
          <p className="font-sans text-sm text-olive/60 mt-1">
            Manage public campaigns, promotional offers, and checkout vouchers.
          </p>
        </div>
        <div>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-olive text-paper hover:bg-olive-2 transition rounded-lg font-sans text-sm flex items-center gap-2 shadow-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add New Discount
          </button>
        </div>
      </div>

      {/* Discount Codes Table List */}
      <div className="bg-paper rounded-xl border border-ivory/60 shadow-sm overflow-hidden">
        {initialDiscounts.length === 0 ? (
          <div className="p-12 text-center text-olive/50 font-sans text-sm">
            No discount codes configured yet. Click "Add New Discount" above to begin.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-sans text-sm">
              <thead>
                <tr className="bg-olive text-paper text-xs uppercase tracking-wider font-semibold">
                  <th className="px-6 py-4">Promo Code</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Reduction Value</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4">Times Used / Max Limit</th>
                  <th className="px-6 py-4">Expires At</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream text-olive">
                {initialDiscounts.map((discount) => {
                  const expired = isExpired(discount.expires_at);
                  const maxLimitReached = discount.max_uses !== null && discount.times_used >= discount.max_uses;

                  return (
                    <tr key={discount.id} className="hover:bg-cream/10 transition">
                      <td className="px-6 py-4 font-mono font-bold text-gold tracking-wider text-base">
                        {discount.code}
                      </td>
                      <td className="px-6 py-4 font-semibold uppercase text-xs tracking-wider text-olive/60">
                        {discount.type === "percent" ? "Percentage" : "Fixed Amount"}
                      </td>
                      <td className="px-6 py-4 font-semibold text-base">
                        {discount.type === "percent" ? (
                          `${discount.value}%`
                        ) : (
                          formatCurrency(discount.value, "GBP") // default to display as GBP for convenience
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleToggleActive(discount)}
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border transition ${
                            discount.active && !expired && !maxLimitReached
                              ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                              : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                          }`}
                        >
                          {expired ? (
                            "Expired"
                          ) : maxLimitReached ? (
                            "Sold Out"
                          ) : discount.active ? (
                            "Active"
                          ) : (
                            "Inactive"
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 font-medium">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-olive">{discount.times_used}</span>
                          <span className="text-olive/30">/</span>
                          <span className="text-olive/60">{discount.max_uses !== null ? discount.max_uses : "∞"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-olive/70">
                        {discount.expires_at ? (
                          <span className={expired ? "text-red-600 font-bold" : ""}>
                            {new Date(discount.expires_at).toLocaleString("en-GB")}
                          </span>
                        ) : (
                          <span className="text-olive/30 italic">No expiry</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEdit(discount)}
                          className="px-2.5 py-1.5 border border-ivory hover:bg-cream/40 transition rounded text-xs font-semibold"
                        >
                          Edit
                        </button>
                        {currentStaffRole === "Admin" && (
                          <button
                            onClick={() => handleDelete(discount.id, discount.code)}
                            className="px-2.5 py-1.5 border border-red-100 bg-red-50/20 hover:bg-red-50 text-red-700 transition rounded text-xs font-semibold"
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL DIALOG: Discount Code Form (Add or Edit) */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-paper max-w-md w-full rounded-xl border border-ivory/60 shadow-lg p-6 space-y-6 animate-fadeIn font-sans">
            <div>
              <h2 className="font-display text-3xl font-semibold text-olive">
                {editingId ? "Edit Discount" : "Create Discount"}
              </h2>
              <p className="text-xs text-olive/60 mt-1">
                Configure promotional codes applied dynamically at public booking checkouts.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div className="grid grid-cols-1 gap-4">
                {/* Code field */}
                <div>
                  <label htmlFor="code" className="block text-[10px] font-bold text-olive/50 uppercase tracking-wider mb-1">
                    Promo Code (Uppercase, e.g. JOURNEY20)
                  </label>
                  <input
                    id="code"
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="JOURNEY10"
                    disabled={editingId !== null}
                    className="w-full px-3 py-2 border border-ivory rounded bg-cream/10 text-olive font-mono font-bold tracking-wider focus:outline-none focus:border-gold disabled:bg-olive/5 disabled:opacity-60"
                  />
                </div>

                {/* Grid Type / Value */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="type" className="block text-[10px] font-bold text-olive/50 uppercase tracking-wider mb-1">
                      Discount Type
                    </label>
                    <select
                      id="type"
                      value={type}
                      onChange={(e) => setType(e.target.value as "percent" | "fixed")}
                      className="w-full px-3 py-2 border border-ivory rounded bg-cream/10 text-olive focus:outline-none focus:border-gold font-medium"
                    >
                      <option value="percent">Percentage (%)</option>
                      <option value="fixed">Fixed Amount</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="value" className="block text-[10px] font-bold text-olive/50 uppercase tracking-wider mb-1">
                      {type === "percent" ? "Reduction Percentage" : "Reduction Amount (Major)"}
                    </label>
                    <input
                      id="value"
                      type="number"
                      step={type === "percent" ? "1" : "0.01"}
                      min="0.01"
                      required
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      placeholder={type === "percent" ? "10" : "50.00"}
                      className="w-full px-3 py-2 border border-ivory rounded bg-cream/10 text-olive focus:outline-none focus:border-gold font-mono"
                    />
                  </div>
                </div>

                {/* Max Uses */}
                <div>
                  <label htmlFor="maxUses" className="block text-[10px] font-bold text-olive/50 uppercase tracking-wider mb-1">
                    Maximum Uses Limit (Optional)
                  </label>
                  <input
                    id="maxUses"
                    type="number"
                    min="1"
                    value={maxUses}
                    onChange={(e) => setMaxUses(e.target.value)}
                    placeholder="Unlimited"
                    className="w-full px-3 py-2 border border-ivory rounded bg-cream/10 text-olive focus:outline-none focus:border-gold"
                  />
                </div>

                {/* Expiry Date */}
                <div>
                  <label htmlFor="expiresAt" className="block text-[10px] font-bold text-olive/50 uppercase tracking-wider mb-1">
                    Expiry Date and Time (Optional)
                  </label>
                  <input
                    id="expiresAt"
                    type="datetime-local"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="w-full px-3 py-2 border border-ivory rounded bg-cream/10 text-olive focus:outline-none focus:border-gold"
                  />
                </div>

                {/* Active Checkbox */}
                <div className="flex items-center gap-2 pt-2">
                  <input
                    id="active"
                    type="checkbox"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                    className="w-4 h-4 rounded border-ivory text-olive focus:ring-gold accent-olive"
                  />
                  <label htmlFor="active" className="text-xs font-semibold text-olive uppercase tracking-wider select-none cursor-pointer">
                    Code is Active and Usable
                  </label>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 justify-end pt-4 border-t border-cream">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 border border-ivory rounded hover:bg-cream/40 transition text-xs font-semibold text-olive"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-olive hover:bg-olive-2 disabled:bg-olive/40 text-paper transition rounded font-semibold text-xs uppercase tracking-wider"
                >
                  {isSubmitting ? "Saving..." : "Save Discount"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
