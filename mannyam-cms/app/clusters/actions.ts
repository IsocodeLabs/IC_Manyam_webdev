"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export type SpokeInput = {
  id: string;
  type: "Page" | "Post" | "Package";
};

// Authentication checking helper
async function requireEditor() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("You must be signed in.");
  
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();
    
  if (!profile || !["Admin", "Content Manager"].includes(profile.role)) {
    throw new Error("Access denied. Admin or Content Manager role required.");
  }
  return { supabase, user, profile };
}

// 1. Fetch Pages, Posts, and Packages options for Pillar & Spoke dropdowns
export async function getClusterFormOptions() {
  await requireEditor();

  const [
    { data: pages },
    { data: posts },
    { data: packages }
  ] = await Promise.all([
    supabaseAdmin
      .from("pages")
      .select("id, title, slug, status")
      .eq("status", "Published")
      .order("title", { ascending: true }),
    supabaseAdmin
      .from("posts")
      .select("id, title, slug, status")
      .eq("status", "Published")
      .order("title", { ascending: true }),
    supabaseAdmin
      .from("packages")
      .select("id, title, slug")
      .order("title", { ascending: true })
  ]);

  const pillarOptions = [
    ...(pages || []).map(p => ({ id: p.id, title: p.title, slug: p.slug, type: "Page" as const })),
    ...(posts || []).map(p => ({ id: p.id, title: p.title, slug: p.slug, type: "Post" as const }))
  ];

  const spokeOptions = [
    ...pillarOptions,
    ...(packages || []).map(p => ({ id: p.id, title: p.title, slug: p.slug, type: "Package" as const }))
  ];

  return { pillarOptions, spokeOptions };
}

// 2. Create Topic Cluster
export async function createCluster(
  name: string,
  pillarPageId: string,
  spokes: SpokeInput[]
) {
  await requireEditor();

  if (!name.trim()) throw new Error("Cluster Name is required.");
  if (!pillarPageId) throw new Error("Pillar Page is required.");

  // Check uniqueness of cluster name
  const { data: existing } = await supabaseAdmin
    .from("clusters")
    .select("id")
    .eq("name", name.trim())
    .maybeSingle();

  if (existing) {
    throw new Error(`A cluster named "${name.trim()}" already exists.`);
  }

  // Insert Cluster row
  const { data: cluster, error: clusterError } = await supabaseAdmin
    .from("clusters")
    .insert({
      name: name.trim(),
      pillar_page_id: pillarPageId
    })
    .select("id")
    .single();

  if (clusterError || !cluster) {
    throw new Error(clusterError?.message || "Failed to create cluster.");
  }

  // Insert Spoke items
  if (spokes.length > 0) {
    const itemsToInsert = spokes.map((spoke) => ({
      cluster_id: cluster.id,
      page_id: spoke.type === "Page" ? spoke.id : null,
      post_id: spoke.type === "Post" ? spoke.id : null,
      package_id: spoke.type === "Package" ? spoke.id : null
    }));

    const { error: itemsError } = await supabaseAdmin
      .from("cluster_items")
      .insert(itemsToInsert);

    if (itemsError) {
      // Rollback cluster creation if items fail
      await supabaseAdmin.from("clusters").delete().eq("id", cluster.id);
      throw new Error(itemsError.message);
    }
  }

  revalidatePath("/clusters");
  return { id: cluster.id };
}

// 3. Update Topic Cluster
export async function updateCluster(
  id: string,
  name: string,
  pillarPageId: string,
  spokes: SpokeInput[]
) {
  await requireEditor();

  if (!name.trim()) throw new Error("Cluster Name is required.");
  if (!pillarPageId) throw new Error("Pillar Page is required.");

  // Check unique name excluding current ID
  const { data: existing } = await supabaseAdmin
    .from("clusters")
    .select("id")
    .eq("name", name.trim())
    .neq("id", id)
    .maybeSingle();

  if (existing) {
    throw new Error(`A cluster named "${name.trim()}" already exists.`);
  }

  // Update Cluster row
  const { error: clusterError } = await supabaseAdmin
    .from("clusters")
    .update({
      name: name.trim(),
      pillar_page_id: pillarPageId
    })
    .eq("id", id);

  if (clusterError) throw new Error(clusterError.message);

  // Clear existing items and insert the new list
  const { error: deleteError } = await supabaseAdmin
    .from("cluster_items")
    .delete()
    .eq("cluster_id", id);

  if (deleteError) throw new Error(deleteError.message);

  if (spokes.length > 0) {
    const itemsToInsert = spokes.map((spoke) => ({
      cluster_id: id,
      page_id: spoke.type === "Page" ? spoke.id : null,
      post_id: spoke.type === "Post" ? spoke.id : null,
      package_id: spoke.type === "Package" ? spoke.id : null
    }));

    const { error: itemsError } = await supabaseAdmin
      .from("cluster_items")
      .insert(itemsToInsert);

    if (itemsError) throw new Error(itemsError.message);
  }

  revalidatePath("/clusters");
  return { id };
}

// 4. Delete Topic Cluster
export async function deleteCluster(id: string) {
  await requireEditor();

  const { error } = await supabaseAdmin
    .from("clusters")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/clusters");
  return { success: true };
}

// 5. Add Internal Link
export async function addInternalLink(
  sourceId: string,
  targetId: string,
  anchorText: string
) {
  await requireEditor();

  if (!sourceId) throw new Error("Source Page/Post is required.");
  if (!targetId) throw new Error("Target Page/Post/Package is required.");
  if (!anchorText.trim()) throw new Error("Anchor Text is required.");

  const { data, error } = await supabaseAdmin
    .from("internal_links")
    .insert({
      source_id: sourceId,
      target_id: targetId,
      anchor_text: anchorText.trim()
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  revalidatePath("/clusters");
  return { id: data.id };
}

// 6. Remove Internal Link
export async function removeInternalLink(id: string) {
  await requireEditor();

  const { error } = await supabaseAdmin
    .from("internal_links")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/clusters");
  return { success: true };
}

// 7. Check if Spoke page contains a link pointing to /[pillarSlug]
export async function checkSpokeLinkToPillar(
  spokeId: string,
  spokeType: "Page" | "Post" | "Package",
  pillarSlug: string
): Promise<boolean> {
  await requireEditor();

  let content: unknown = null;

  if (spokeType === "Page") {
    const { data } = await supabaseAdmin.from("pages").select("content").eq("id", spokeId).single();
    if (data) content = data.content;
  } else if (spokeType === "Post") {
    const { data } = await supabaseAdmin.from("posts").select("content").eq("id", spokeId).single();
    if (data) content = data.content;
  } else if (spokeType === "Package") {
    const { data } = await supabaseAdmin.from("packages").select("description").eq("id", spokeId).single();
    if (data) content = data.description;
  }

  if (!content) return false;

  const contentStr = typeof content === "object" ? JSON.stringify(content) : String(content);
  const escapedSlug = pillarSlug.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
  // Match link patterns like: "/india-festival-tours" or "mannyam.in/india-festival-tours"
  const regex = new RegExp(
    `(?:href=["']|\\(|["']|\\/)(?:https?:\\/\\/mannyam\\.in)?\\/${escapedSlug}(?:["']|\\)|\\?|#|\\s|$)`,
    "i"
  );
  return regex.test(contentStr);
}
