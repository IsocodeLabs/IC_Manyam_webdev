"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

const BUCKET = "media";
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

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
    throw new Error("Access denied.");
  }
  return { supabase, user, profile };
}



/**
 * Stage 1: Upload a file to Supabase Storage only.
 * Returns public URL and storage path.
 */
export async function uploadMediaToStorage(formData: FormData) {
  await requireEditor();

  const file = formData.get("file") as File | null;
  if (!file) throw new Error("No file provided.");
  if (!ACCEPTED_TYPES.includes(file.type)) {
    throw new Error("Only image files are accepted (JPEG, PNG, WebP, GIF).");
  }
  if (file.size > MAX_SIZE) {
    throw new Error("File exceeds 10 MB limit.");
  }

  // Generate unique path
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const timestamp = Date.now();
  const safeName = file.name
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .substring(0, 60);
  const storagePath = `${timestamp}_${safeName}.${ext}`;

  // Upload to storage bucket
  const { error: uploadError } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(storagePath, file, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

  const { data: urlData } = supabaseAdmin.storage
    .from(BUCKET)
    .getPublicUrl(storagePath);

  return {
    fileUrl: urlData.publicUrl,
    storagePath,
  };
}

/**
 * Stage 2: Save the media record to public.media after user provides Alt Text.
 */
export async function saveMediaRecord(
  fileUrl: string,
  altText: string,
  caption: string,
  width: number | null,
  height: number | null
) {
  await requireEditor();

  if (!altText.trim()) throw new Error("Alt text is required.");

  const { data, error } = await supabaseAdmin
    .from("media")
    .insert({
      file_url: fileUrl,
      alt_text: altText.trim(),
      caption: caption.trim() || null,
      width,
      height,
    })
    .select("id, file_url, alt_text, caption, width, height, created_at")
    .single();

  if (error) throw new Error(`Database insert failed: ${error.message}`);

  revalidatePath("/media");
  return data;
}

/**
 * Stage 3: Delete an uploaded file from storage if the user cancels the alt text modal.
 */
export async function deleteStorageFile(storagePath: string) {
  await requireEditor();
  const { error } = await supabaseAdmin.storage.from(BUCKET).remove([storagePath]);
  if (error) throw new Error(`Cleanup failed: ${error.message}`);
  return { ok: true as const };
}

/**
 * Legacy support for one-shot uploads if needed elsewhere.
 */
export async function uploadMedia(formData: FormData) {
  const file = formData.get("file") as File | null;
  const altText = (formData.get("altText") as string) || "";
  const caption = (formData.get("caption") as string) || "";
  
  if (!file) throw new Error("No file provided.");
  const uploadResult = await uploadMediaToStorage(formData);
  return saveMediaRecord(
    uploadResult.fileUrl,
    altText || file.name,
    caption,
    null,
    null
  );
}

/**
 * Deletes media from public.media and Supabase Storage.
 */
export async function deleteMedia(id: string) {
  const { profile } = await requireEditor();
  
  // Only Admin or Content Manager can delete
  if (!["Admin", "Content Manager"].includes(profile.role)) {
    throw new Error("Access denied. Sufficient role required to delete media.");
  }

  const { data: mediaRow } = await supabaseAdmin
    .from("media")
    .select("file_url")
    .eq("id", id)
    .single();

  if (!mediaRow) throw new Error("Media not found.");

  // Delete from storage
  const url = mediaRow.file_url;
  const bucketUrlSegment = `/storage/v1/object/public/${BUCKET}/`;
  const pathIdx = url.indexOf(bucketUrlSegment);
  if (pathIdx !== -1) {
    const storagePath = decodeURIComponent(url.substring(pathIdx + bucketUrlSegment.length));
    await supabaseAdmin.storage.from(BUCKET).remove([storagePath]);
  }

  // Delete from public.media
  const { error } = await supabaseAdmin.from("media").delete().eq("id", id);
  if (error) throw new Error(`Delete failed: ${error.message}`);

  revalidatePath("/media");
  return { ok: true as const };
}

/**
 * Updates metadata fields.
 */
export async function updateMediaMeta(
  id: string,
  altText: string,
  caption: string
) {
  await requireEditor();

  if (!altText.trim()) throw new Error("Alt text is required.");

  const { error } = await supabaseAdmin
    .from("media")
    .update({
      alt_text: altText.trim(),
      caption: caption.trim() || null,
    })
    .eq("id", id);

  if (error) throw new Error(`Update failed: ${error.message}`);

  revalidatePath("/media");
  return { ok: true as const };
}

/**
 * Fetch usage details.
 */
export async function getMediaUsageAction(fileUrl: string) {
  await requireEditor();
  const { getMediaUsage } = await import("@/lib/media/getUsage");
  return getMediaUsage(fileUrl);
}

/**
 * Fetch all media items.
 */
export async function fetchMediaList() {
  await requireEditor();

  const { data, error } = await supabaseAdmin
    .from("media")
    .select("id, file_url, alt_text, caption, width, height, created_at")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}
