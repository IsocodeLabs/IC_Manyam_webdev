"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { detectCircularRedirect, type RedirectItem } from "@/lib/redirects/detectCircular";

async function requireEditor() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("You must be signed in.");
  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (!profile || !["Admin", "Content Manager", "Marketer"].includes(profile.role)) {
    throw new Error("Access denied.");
  }
  return { supabase, user, profile };
}

async function requireWritePermission() {
  const { supabase, user, profile } = await requireEditor();
  if (!["Admin", "Marketer"].includes(profile.role)) {
    throw new Error("Access denied. Admin or Marketer role required.");
  }
  return { supabase, user, profile };
}

function validateRedirectPaths(fromPath: string, toPath: string) {
  const cleanFrom = fromPath.trim();
  const cleanTo = toPath.trim();

  if (!cleanFrom) throw new Error("From Path is required.");
  if (!cleanTo) throw new Error("To Path is required.");
  
  if (!cleanFrom.startsWith("/")) {
    throw new Error("From Path must start with a slash (/).");
  }
  
  const isExternal = cleanTo.startsWith("http://") || cleanTo.startsWith("https://");
  if (!cleanTo.startsWith("/") && !isExternal) {
    throw new Error("To Path must start with a slash (/) or be a valid external URL.");
  }

  if (cleanFrom.toLowerCase() === cleanTo.toLowerCase()) {
    throw new Error("From Path and To Path cannot be the same.");
  }
}

export async function createRedirect(fromPath: string, toPath: string, statusCode: 301 | 302) {
  await requireWritePermission();
  validateRedirectPaths(fromPath, toPath);

  const cleanFrom = fromPath.trim();
  const cleanTo = toPath.trim();

  // Check unique from_path
  const { data: existing } = await supabaseAdmin
    .from("redirects")
    .select("id")
    .eq("from_path", cleanFrom)
    .maybeSingle();

  if (existing) {
    throw new Error("This From Path is already in use.");
  }

  // Fetch all redirects to perform circular checks
  const { data: allRedirects } = await supabaseAdmin
    .from("redirects")
    .select("id, from_path, to_path");

  const checkResult = detectCircularRedirect(
    cleanFrom,
    cleanTo,
    (allRedirects ?? []) as RedirectItem[]
  );

  if (checkResult.isCircular) {
    throw new Error(`Circular redirect detected: ${checkResult.chain.join(" -> ")}`);
  }

  const { data, error } = await supabaseAdmin
    .from("redirects")
    .insert({
      from_path: cleanFrom,
      to_path: cleanTo,
      status_code: statusCode
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  revalidatePath("/redirects");
  return { id: data.id };
}

export async function updateRedirect(id: string, fromPath: string, toPath: string, statusCode: 301 | 302) {
  await requireWritePermission();
  validateRedirectPaths(fromPath, toPath);

  const cleanFrom = fromPath.trim();
  const cleanTo = toPath.trim();

  // Check unique from_path excluding current ID
  const { data: existing } = await supabaseAdmin
    .from("redirects")
    .select("id")
    .eq("from_path", cleanFrom)
    .neq("id", id)
    .maybeSingle();

  if (existing) {
    throw new Error("This From Path is already in use.");
  }

  // Fetch all redirects to perform circular checks
  const { data: allRedirects } = await supabaseAdmin
    .from("redirects")
    .select("id, from_path, to_path");

  const checkResult = detectCircularRedirect(
    cleanFrom,
    cleanTo,
    (allRedirects ?? []) as RedirectItem[],
    id
  );

  if (checkResult.isCircular) {
    throw new Error(`Circular redirect detected: ${checkResult.chain.join(" -> ")}`);
  }

  const { error } = await supabaseAdmin
    .from("redirects")
    .update({
      from_path: cleanFrom,
      to_path: cleanTo,
      status_code: statusCode
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/redirects");
  return { id };
}

export async function deleteRedirect(id: string) {
  await requireWritePermission();

  const { error } = await supabaseAdmin
    .from("redirects")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/redirects");
  return { success: true };
}
