"use client";

import { X } from "lucide-react";

import { CategoryIcon } from "@/components/changelog/category-icon";
import { PixelIcon } from "@/components/mosaic/pixel-icon";
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

const LABEL =
  "mr-1 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-mute";

const CHIP_BASE =
  "inline-flex items-center gap-2 rounded-md9 border px-3 py-1.5 text-sm transition-colors";

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
        <span className={LABEL}>
          <PixelIcon name="layers" unit={3} tint="#6B7390" /> Módulos
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
                CHIP_BASE,
                active
                  ? "border-coral bg-coral text-white"
                  : "border-line-2 bg-canvas text-ink-soft hover:border-coral hover:text-coral-deep",
              )}
            >
              <CategoryIcon name={cat.icon} unit={4} />
              {cat.name}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className={LABEL}>Tipo</span>
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
                CHIP_BASE,
                "font-mono text-[11px] uppercase tracking-[0.1em]",
                active
                  ? meta.badgeClass
                  : "border-line-2 bg-canvas text-mute hover:text-ink",
              )}
            >
              <span className={cn("h-1.5 w-1.5 rounded-[1px]", meta.dotClass)} />
              {meta.label}
            </button>
          );
        })}

        {hasFilters && (
          <button
            type="button"
            onClick={onClear}
            className="ml-1 inline-flex items-center gap-1 rounded-md9 px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-mute transition hover:text-coral-deep"
          >
            <X className="h-3.5 w-3.5" />
            Limpiar filtros
          </button>
        )}
      </div>
    </div>
  );
}
