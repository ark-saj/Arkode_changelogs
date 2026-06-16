"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";

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
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
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
            <span className="text-xs tabular-nums text-muted-foreground">
              {resultCount}
            </span>
          )}
          <span className="grid h-6 w-6 place-items-center rounded-full bg-muted text-muted-foreground transition hover:text-foreground">
            <X className="h-3.5 w-3.5" />
          </span>
        </button>
      )}
    </div>
  );
}
