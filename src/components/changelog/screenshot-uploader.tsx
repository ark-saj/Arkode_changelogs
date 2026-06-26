"use client";

import * as React from "react";
import { useActionState } from "react";
import {
  CheckCircle2,
  ImageUp,
  Loader2,
  TriangleAlert,
  UploadCloud,
} from "lucide-react";

import {
  uploadTicketScreenshot,
  type ScreenshotUploadState,
} from "@/lib/actions/ticket-screenshots";

const INITIAL: ScreenshotUploadState = { ok: false, message: "" };

export interface TicketOption {
  code: string;
  title: string;
}

export function ScreenshotUploader({
  tenantSlug,
  tickets,
}: {
  tenantSlug: string;
  tickets: TicketOption[];
}) {
  const [state, formAction, pending] = useActionState(
    uploadTicketScreenshot,
    INITIAL,
  );
  const [preview, setPreview] = React.useState<string | null>(null);
  const [fileName, setFileName] = React.useState<string | null>(null);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setFileName(file?.name ?? null);
    setPreview(file && file.type.startsWith("image/") ? URL.createObjectURL(file) : null);
  }

  if (tickets.length === 0) {
    return (
      <p className="card p-6 text-sm text-mute">
        Todavía no hay cambios cargados. Creá un changelog primero y después
        sumás las capturas.
      </p>
    );
  }

  return (
    <form action={formAction} className="card p-6 sm:p-8">
      <input type="hidden" name="tenant" value={tenantSlug} />

      <div className="grid gap-5 sm:grid-cols-2">
        {/* ticket picker */}
        <div>
          <label
            htmlFor="ticketCode"
            className="mb-1.5 block text-sm font-medium text-ink-soft"
          >
            Cambio
          </label>
          <select
            id="ticketCode"
            name="ticketCode"
            required
            defaultValue=""
            className="h-12 w-full rounded-md9 border border-line-2 bg-canvas px-3 text-sm text-ink outline-none transition-shadow focus-visible:border-coral focus-visible:shadow-[0_0_0_3px_rgba(255,108,93,0.14)]"
          >
            <option value="" disabled>
              Elegí el cambio…
            </option>
            {tickets.map((t) => (
              <option key={t.code} value={t.code}>
                {t.code} — {t.title}
              </option>
            ))}
          </select>
        </div>

        {/* caption */}
        <div>
          <label
            htmlFor="caption"
            className="mb-1.5 block text-sm font-medium text-ink-soft"
          >
            Epígrafe
          </label>
          <input
            id="caption"
            name="caption"
            required
            maxLength={120}
            placeholder="Qué muestra la captura"
            className="h-12 w-full rounded-md9 border border-line-2 bg-canvas px-3 text-sm text-ink outline-none transition-shadow placeholder:text-faint focus-visible:border-coral focus-visible:shadow-[0_0_0_3px_rgba(255,108,93,0.14)]"
          />
        </div>
      </div>

      {/* file picker */}
      <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="grid h-24 w-32 shrink-0 place-items-center overflow-hidden rounded-lg14 border border-line bg-bone">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Vista previa" className="h-full w-full object-cover" />
          ) : (
            <ImageUp className="h-7 w-7 text-mute" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <label
            htmlFor="file"
            className="flex cursor-pointer items-center gap-3 rounded-md9 border border-dashed border-line-2 bg-canvas px-4 py-3 text-sm transition hover:border-coral/60"
          >
            <UploadCloud className="h-5 w-5 shrink-0 text-coral-deep" />
            <span className="min-w-0 flex-1 truncate text-mute">
              {fileName ?? "Imagen o video (PNG, JPG, WebP, GIF, MP4, máx 9 MB)"}
            </span>
          </label>
          <input
            id="file"
            name="file"
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif,video/mp4,video/webm"
            onChange={onFileChange}
            className="sr-only"
          />
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
          {pending ? "Subiendo…" : "Agregar captura"}
        </button>
      </div>
    </form>
  );
}
