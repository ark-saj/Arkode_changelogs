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
    <form
      action={formAction}
      className="rounded-3xl glass glass-highlight p-6 sm:p-8"
    >
      <input type="hidden" name="tenant" value={tenantSlug} />

      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
        {/* current / preview */}
        <div className="grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-2xl border border-border/60 bg-muted/40">
          {shown ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={shown}
              alt={`Logo de ${tenantName}`}
              className="h-full w-full object-contain p-2"
            />
          ) : (
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-brand to-brand-soft text-white">
              <Sparkles className="h-6 w-6" />
            </span>
          )}
        </div>

        {/* picker */}
        <div className="min-w-0 flex-1">
          <label
            htmlFor="logo"
            className="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-border bg-muted/30 px-4 py-3 text-sm transition hover:border-brand/50"
          >
            <ImageUp className="h-5 w-5 shrink-0 text-brand" />
            <span className="min-w-0 flex-1 truncate text-muted-foreground">
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
          <p className="mt-2 text-xs text-muted-foreground/80">
            Se mostrará junto al nombre de {tenantName} en el encabezado del portal.
          </p>
        </div>
      </div>

      {state.message && (
        <p
          className={
            "mt-5 flex items-center gap-2 rounded-xl border px-3 py-2 text-sm " +
            (state.ok
              ? "border-status-new/40 bg-status-new/10 text-foreground"
              : "border-status-fix/40 bg-status-fix/10 text-foreground")
          }
        >
          {state.ok ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-status-new" />
          ) : (
            <TriangleAlert className="h-4 w-4 shrink-0 text-status-fix" />
          )}
          {state.message}
        </p>
      )}

      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-brand px-6 text-sm font-medium text-brand-foreground shadow-glow transition hover:brightness-110 active:scale-[0.98] disabled:opacity-70"
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
