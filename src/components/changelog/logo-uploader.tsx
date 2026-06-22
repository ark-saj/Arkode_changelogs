"use client";

import * as React from "react";
import { useActionState } from "react";
import {
  CheckCircle2,
  ImageUp,
  Loader2,
  Sparkles,
  TriangleAlert,
  UploadCloud,
} from "lucide-react";

import {
  updateTenantLogo,
  type LogoUploadState,
} from "@/lib/actions/tenant-branding";

const INITIAL: LogoUploadState = { ok: false, message: "" };

export function LogoUploader({
  tenantSlug,
  tenantName,
  currentLogo,
}: {
  tenantSlug: string;
  tenantName: string;
  currentLogo?: string;
}) {
  const [state, formAction, pending] = useActionState(updateTenantLogo, INITIAL);
  const [preview, setPreview] = React.useState<string | null>(null);
  const [fileName, setFileName] = React.useState<string | null>(null);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setFileName(file?.name ?? null);
    setPreview(file ? URL.createObjectURL(file) : null);
  }

  // After a successful save, the server-revalidated currentLogo wins.
  const shown = preview ?? currentLogo ?? null;

  return (
    <form action={formAction} className="card p-6 sm:p-8">
      <input type="hidden" name="tenant" value={tenantSlug} />

      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
        {/* current / preview */}
        <div className="grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-lg14 border border-line bg-bone">
          {shown ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={shown}
              alt={`Logo de ${tenantName}`}
              className="h-full w-full object-contain p-2"
            />
          ) : (
            <span className="grid h-12 w-12 place-items-center rounded-md9 bg-ink text-white">
              <Sparkles className="h-6 w-6" />
            </span>
          )}
        </div>

        {/* picker */}
        <div className="min-w-0 flex-1">
          <label
            htmlFor="logo"
            className="flex cursor-pointer items-center gap-3 rounded-md9 border border-dashed border-line-2 bg-canvas px-4 py-3 text-sm transition hover:border-coral/60"
          >
            <ImageUp className="h-5 w-5 shrink-0 text-coral-deep" />
            <span className="min-w-0 flex-1 truncate text-mute">
              {fileName ?? "Elegí una imagen (PNG, JPG o WebP, máx 2 MB)"}
            </span>
          </label>
          <input
            id="logo"
            name="logo"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={onFileChange}
            className="sr-only"
          />
          <p className="mt-2 text-xs text-faint">
            Se mostrará junto al nombre de {tenantName} en el encabezado del portal.
          </p>
        </div>
      </div>

      {state.message && (
        <p
          className={
            "mt-5 flex items-center gap-2 rounded-md9 border px-3 py-2 text-sm text-ink " +
            (state.ok
              ? "border-green/40 bg-green/10"
              : "border-crimson/40 bg-crimson/10")
          }
        >
          {state.ok ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-green" />
          ) : (
            <TriangleAlert className="h-4 w-4 shrink-0 text-crimson" />
          )}
          {state.message}
        </p>
      )}

      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="btn btn-coral disabled:opacity-70"
        >
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <UploadCloud className="h-4 w-4" />
          )}
          {pending ? "Guardando…" : "Guardar logo"}
        </button>
      </div>
    </form>
  );
}
