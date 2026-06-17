"use server";

import { revalidatePath } from "next/cache";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface LogoUploadState {
  ok: boolean;
  message: string;
}

const ACCEPTED = ["image/png", "image/jpeg", "image/webp"];
const MAX_BYTES = 2 * 1024 * 1024; // 2 MB

/**
 * Update a tenant's logo (admin only). Authorization is enforced by RLS:
 *  - Storage policies allow writing only to the caller's own tenant folder.
 *  - The `tenants` UPDATE policy allows only admins of that tenant.
 * A non-admin caller simply gets a permission error from the DB.
 */
export async function updateTenantLogo(
  _prev: LogoUploadState,
  formData: FormData,
): Promise<LogoUploadState> {
  const slug = String(formData.get("tenant") ?? "");
  const file = formData.get("logo");

  if (!slug) return { ok: false, message: "Falta la empresa." };
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: "Elegí una imagen." };
  }
  if (!ACCEPTED.includes(file.type)) {
    return { ok: false, message: "Formato no soportado (usá PNG, JPG o WebP)." };
  }
  if (file.size > MAX_BYTES) {
    return { ok: false, message: "La imagen supera los 2 MB." };
  }

  const supabase = await createSupabaseServerClient();

  const { data: tenant } = await supabase
    .from("tenants")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (!tenant) return { ok: false, message: "Empresa no encontrada." };

  const ext =
    file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const path = `${tenant.id}/logo.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("tenant-logos")
    .upload(path, file, { upsert: true, contentType: file.type, cacheControl: "0" });
  if (uploadError) {
    return { ok: false, message: "No tenés permiso para cambiar el logo, o falló la subida." };
  }

  const { data: pub } = supabase.storage.from("tenant-logos").getPublicUrl(path);
  // Cache-bust so the header reflects the new image immediately.
  const url = `${pub.publicUrl}?v=${Date.now()}`;

  const { error: updateError } = await supabase
    .from("tenants")
    .update({ logo: url })
    .eq("id", tenant.id);
  if (updateError) {
    return { ok: false, message: "No se pudo guardar el logo." };
  }

  revalidatePath(`/${slug}`, "layout");
  return { ok: true, message: "Logo actualizado." };
}
