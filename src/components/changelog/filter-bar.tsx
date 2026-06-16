"use client";

import { ListFilter, X } from "lucide-react";

import { CategoryIcon } from "@/components/changelog/category-icon";
import { STATUS_META, STATUS_ORDER } from "@/lib/changelog-meta";
import type { Category, TicketStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export interface FilterBarProps {
  categories: Category[];
  selectedCategories: Set<string>;
  selectedStatuses: Set<TicketStatus>;
  onToggleCategory: (key: string) => void;
  onToggleStatus: (status: TicketStatus) => void;
  onClear: () => void;
}

export function FilterBar({
  categories,
  selectedCategories,
  selectedStatuses,
  onToggleCategory,
  onToggleStatus,
  onClear,
}: FilterBarProps) {
  const hasFilters =
    selectedCategories.size > 0 || selectedStatuses.size > 0;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <ListFilter className="h-3.5 w-3.5" /> Módulos
        </span>
        {categories.map((cat) => {
          const active = selectedCategories.has(cat.key);
          return (
            <button
              key={cat.key}
              type="button"
              onClick={() => onToggleCategory(cat.key)}
              aria-pressed={active}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-all",
                active
                  ? "border-brand/50 bg-brand/15 text-brand ring-1 ring-inset ring-brand/20"
                  : "border-border/60 bg-muted/40 text-muted-foreground hover:border-brand/40 hover:text-foreground",
              )}
            >
              <CategoryIcon name={cat.icon} className="h-3.5 w-3.5" />
              {cat.name}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Tipo
        </span>
        {STATUS_ORDER.map((status) => {
          const active = selectedStatuses.has(status);
          const meta = STATUS_META[status];
          return (
            <button
              key={status}
              type="button"
              onClick={() => onToggleStatus(status)}
              aria-pressed={active}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-all",
                active
                  ? meta.badgeClass + " ring-1 ring-inset"
                  : "border-border/60 bg-muted/40 text-muted-foreground hover:text-foreground",
              )}
            >
              <span className={cn("h-1.5 w-1.5 rounded-full", meta.dotClass)} />
              {meta.label}
            </button>
          );
        })}

        {hasFilters && (
          <button
            type="button"
            onClick={onClear}
            className="ml-1 inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
            Limpiar filtros
          </button>
        )}
      </div>
    </div>
  );
}
