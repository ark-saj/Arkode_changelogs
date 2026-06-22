"use client";

import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PixelIcon } from "@/components/mosaic/pixel-icon";

export function SearchBar({
  value,
  onChange,
  resultCount,
}: {
  value: string;
  onChange: (value: string) => void;
  resultCount?: number;
}) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
        <PixelIcon name="search" unit={3} tint="#6B7390" />
      </span>
      <Input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Buscar por ticket, módulo o palabra clave…"
        aria-label="Buscar novedades"
        className="h-12 pl-11 pr-24"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Limpiar búsqueda"
          className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-2"
        >
          {typeof resultCount === "number" && (
            <span className="font-mono text-[11px] uppercase tracking-[0.1em] tabular-nums text-mute">
              {resultCount}
            </span>
          )}
          <span className="grid h-6 w-6 place-items-center rounded-md9 border border-line-2 bg-canvas text-mute transition hover:border-coral hover:text-coral-deep">
            <X className="h-3.5 w-3.5" />
          </span>
        </button>
      )}
    </div>
  );
}
