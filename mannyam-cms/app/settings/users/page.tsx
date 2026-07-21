import React from "react";
import { requireRole } from "@/lib/rbac/requireRole";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { updateUserRole } from "./actions";

export const dynamic = "force-dynamic";

export default async function UsersSettingsPage() {
  await requireRole(["Admin"]);

  const supabase = getSupabaseAdmin() as any;
  const { data: users, error } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching users:", error);
  }

  return (
    <div className="space-y-6 font-sans max-w-5xl mx-auto">
      <div className="border-b border-olive/10 pb-4 flex justify-between items-end">
        <div>
          <h1 className="font-display text-3xl font-semibold text-olive">Users & Team</h1>
          <p className="mt-1 text-sm text-olive/70">
            Manage system access and assign roles to your team members and customers.
          </p>
        </div>
        <span className="px-3 py-1 bg-olive/5 text-olive text-[10px] font-bold uppercase tracking-wider rounded-sm border border-olive/10">
          Total Users: {users?.length || 0}
        </span>
      </div>

      <div className="bg-paper border border-olive/10 rounded-sm shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-cream/40 border-b border-olive/10">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-olive/50">User Details</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-olive/50">Current Role</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-olive/50 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-olive/5">
              {users?.map((u: any) => (
                <tr key={u.id} className="hover:bg-cream/10 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-display font-medium text-olive text-sm">
                        {u.name || "Unnamed User"}
                      </span>
                      <span className="font-sans text-xs text-olive/60 font-light">
                        {u.email}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-sm border ${
                      u.role === "Admin" ? "bg-olive/10 text-olive border-olive/20" :
                      u.role === "Content Manager" ? "bg-gold/10 text-gold border-gold/20" :
                      "bg-amber/10 text-amber-700 border-amber-200"
                    }`}>
                      {u.role || "Customer"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <form
                      action={async (formData: FormData) => {
                        "use server";
                        const newRole = formData.get("role")?.toString();
                        if (newRole) {
                          await updateUserRole(u.id, newRole);
                        }
                      }}
                      className="flex items-center justify-end gap-2"
                    >
                      <select
                        name="role"
                        defaultValue={u.role || "Customer"}
                        className="bg-cream border border-olive/10 rounded-sm px-2 py-1.5 text-xs font-sans text-olive focus:outline-none focus:border-gold transition-colors"
                      >
                        <option value="Customer">Customer</option>
                        <option value="Content Manager">Content Manager</option>
                        <option value="Admin">Admin</option>
                      </select>
                      <button
                        type="submit"
                        className="font-sans text-[10px] font-bold uppercase tracking-widest text-cream bg-olive hover:bg-olive/90 px-3 py-1.5 rounded-sm transition-all"
                      >
                        Update
                      </button>
                    </form>
                  </td>
                </tr>
              ))}

              {(!users || users.length === 0) && (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-xs text-olive/50 italic">
                    No users found in the system.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
