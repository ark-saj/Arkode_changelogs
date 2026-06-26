import { getServiceClient } from "@/lib/supabase/service";

/**
 * Ticket media storage (Fase 3). Real screenshots / clips live in the public
 * `tenant-media` bucket under a per-tenant path:  <tenant_id>/<ticket>/<file>.
 *
 * Uploads go through the service_role client; the tenant boundary is the
 * explicit `tenantId` in the path (same invariant as ChangelogService, §3.1).
 * The path is deterministic from (ticket, caption) so re-uploading the same
 * caption overwrites in place — idempotent, no orphan files.
 */

export const MEDIA_BUCKET = "tenant-media";

const EXT_BY_TYPE: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  "video/mp4": "mp4",
  "video/webm": "webm",
};

const TYPE_BY_EXT: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
  mp4: "video/mp4",
  webm: "video/webm",
  mov: "video/quicktime",
  m4v: "video/x-m4v",
};

const VIDEO_EXT = new Set(["mp4", "webm", "mov", "m4v"]);

/** A valid MIME type for an extension. Storage rejects uploads without one. */
export function contentTypeForExt(ext: string): string {
  return TYPE_BY_EXT[ext] ?? "application/octet-stream";
}

/** URL-safe slug for filenames / path segments. */
export function slugify(value: string): string {
  return (
    value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "") // strip accents
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "captura"
  );
}

export function inferExt(filename?: string, contentType?: string): string {
  if (filename) {
    const m = /\.([a-z0-9]+)$/i.exec(filename);
    if (m) return m[1].toLowerCase();
  }
  if (contentType && EXT_BY_TYPE[contentType]) return EXT_BY_TYPE[contentType];
  return "png";
}

export function kindForExt(ext: string): "image" | "video" {
  return VIDEO_EXT.has(ext) ? "video" : "image";
}

export interface UploadResult {
  url: string;
  kind: "image" | "video";
  path: string;
}

export async function uploadTicketMedia(params: {
  tenantId: string;
  ticketCode: string;
  captionSlug: string;
  ext: string;
  bytes: Uint8Array;
  contentType?: string;
}): Promise<UploadResult> {
  const { tenantId, ticketCode, captionSlug, ext, bytes, contentType } = params;
  const path = `${tenantId}/${slugify(ticketCode)}/${captionSlug}.${ext}`;
  // Always send a valid Content-Type — Storage rejects uploads without one
  // (the bundled supabase-js won't infer it from a raw byte buffer).
  const type = contentType ?? contentTypeForExt(ext);

  const db = getServiceClient();
  const { error } = await db.storage
    .from(MEDIA_BUCKET)
    .upload(path, bytes, {
      upsert: true,
      contentType: type,
      cacheControl: "3600",
    });
  if (error) throw error;

  const { data } = db.storage.from(MEDIA_BUCKET).getPublicUrl(path);
  // Cache-bust so an overwritten capture refreshes in the portal immediately.
  return { url: `${data.publicUrl}?v=${Date.now()}`, kind: kindForExt(ext), path };
}
