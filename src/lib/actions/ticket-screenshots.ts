"use server";

import { revalidatePath } from "next/cache";

import { isTenantAdmin } from "@/lib/data/tenant-context";
import { ChangelogService } from "@/lib/services/changelog-service";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface ScreenshotUploadState {
  ok: boolean;
  message: string;
}

const ACCEPTED = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
];
const MAX_BYTES = 9 * 1024 * 1024; // 9 MB

/**
 * Attach a real screenshot/clip to a ticket from the admin UI (Fase 3).
 *
 * Authorization is enforced here (admins of this tenant only) and the bytes go
 * through ChangelogService — the same write boundary the agent API uses, so the
 * file always lands in this tenant's media folder.
 */
export async function uploadTicketScreenshot(
  _prev: ScreenshotUploadState,
  formData: FormData,
): Promise<ScreenshotUploadState> {
  const slug = String(formData.get("tenant") ?? "");
  const ticketCode = String(formData.get("ticketCode") ?? "");
  const caption = String(formData.get("caption") ?? "").trim();
  const file = formData.get("file");

  if (!slug) return { ok: false, message: "Falta la empresa." };
  if (!ticketCode) return { ok: false, message: "Elegí un cambio." };
  if (!caption) return { ok: false, message: "Escribí un epígrafe para la captura." };
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: "Elegí una imagen o un video." };
  }
  if (!ACCEPTED.includes(file.type)) {
    return { ok: false, message: "Formato no soportado (PNG, JPG, WebP, GIF, MP4 o WebM)." };
  }
  if (file.size > MAX_BYTES) {
    return { ok: false, message: "El archivo supera los 9 MB." };
  }

  // Admins only.
  if (!(await isTenantAdmin(slug))) {
    return { ok: false, message: "No tenés permiso para agregar capturas." };
  }

  const supabase = await createSupabaseServerClient();
  const { data: tenant } = await supabase
    .from("tenants")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (!tenant) return { ok: false, message: "Empresa no encontrada." };

  const bytes = Buffer.from(await file.arrayBuffer());

  try {
    await new ChangelogService().attachScreenshot({
      tenantId: tenant.id,
      ticketCode,
      caption,
      data: bytes.toString("base64"),
      filename: file.name,
      contentType: file.type,
    });
  } catch {
    return { ok: false, message: "No se pudo subir la captura. Probá de nuevo." };
  }

  revalidatePath(`/${slug}`, "layout");
  return { ok: true, message: "Captura agregada al cambio." };
}
