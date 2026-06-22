"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";

import { CategoryIcon } from "@/components/changelog/category-icon";
import { PixelIcon } from "@/components/mosaic/pixel-icon";
import { MDiv } from "@/components/motion/motion-safe";
import { DUR, EASE } from "@/components/motion/variants";
import { STATUS_META, STATUS_ORDER } from "@/lib/changelog-meta";
import type { Category, TicketStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

/* Arkode Mosaic — portal sidebar (persistent filter-nav). "⌂ INICIO" row,
   mono section labels ("MÓDULOS", "TIPO DE CAMBIO"), nav items = icon + label +
   count. Active item = coral 4px left-bar (Framer layoutId="nav-active" so it
   SLIDES) + bold + faint bone bg. Toggling filters the content. "Limpiar
   filtros" ghost at the bottom. On desktop the rail collapses to an icon-only
   strip (labels/counts hide, icons stay, names move to title tooltips).
   Responsive slide-in drawer on mobile. */

export interface SidebarProps {
  categories: Category[];
  categoryCounts: Record<string, number>;
  statusCounts: Record<TicketStatus, number>;
  selectedCategories: Set<string>;
  selectedStatuses: Set<TicketStatus>;
  onToggleCategory: (key: string) => void;
  onToggleStatus: (status: TicketStatus) => void;
  onClear: () => void;
  /** Desktop icon-rail collapse. */
  collapsed: boolean;
  onToggleCollapse: () => void;
  /** Mobile drawer state. */
  open: boolean;
  onClose: () => void;
}

function NavItem({
  active,
  count,
  onClick,
  collapsed,
  icon,
  label,
}: {
  active: boolean;
  count: number;
  onClick: () => void;
  collapsed: boolean;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={label}
      title={collapsed ? label : undefined}
      className={cn(
        "group relative flex w-full items-center rounded-md9 text-left text-sm transition-colors",
        collapsed ? "justify-center px-0 py-2.5" : "gap-2.5 py-2 pl-3 pr-2.5",
        active
          ? "bg-bone font-medium text-ink"
          : "text-ink-soft hover:bg-bone/60 hover:text-ink",
      )}
    >
      {active && (
        <motion.span
          layoutId="nav-active"
          className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-coral"
          transition={{ duration: DUR.base, ease: EASE }}
        />
      )}
      <span className="shrink-0">{icon}</span>
      {!collapsed && (
        <>
          <span className="min-w-0 flex-1 truncate">{label}</span>
          <span
            className={cn(
              "shrink-0 font-mono text-[10.5px] tabular-nums tracking-[0.08em]",
              active ? "text-coral-deep" : "text-faint",
            )}
          >
            {count}
          </span>
        </>
      )}
    </button>
  );
}

function SidebarContent({
  categories,
  categoryCounts,
  statusCounts,
  selectedCategories,
  selectedStatuses,
  onToggleCategory,
  onToggleStatus,
  onClear,
  collapsed,
  onToggleCollapse,
  showCollapseToggle = false,
}: Omit<SidebarProps, "open" | "onClose"> & {
  showCollapseToggle?: boolean;
}) {
  const hasFilters =
    selectedCategories.size > 0 || selectedStatuses.size > 0;

  return (
    <nav aria-label="Filtros" className="flex h-full flex-col">
      <div
        className={cn(
          "flex-1 space-y-7 overflow-y-auto py-5",
          collapsed ? "px-2" : "px-3",
        )}
      >
        {/* Collapse toggle (desktop rail only) */}
        {showCollapseToggle && (
          <div className={cn("flex", collapsed ? "justify-center" : "justify-end")}>
            <button
              type="button"
              onClick={onToggleCollapse}
              aria-label={collapsed ? "Expandir navegación" : "Colapsar navegación"}
              title={collapsed ? "Expandir" : "Colapsar"}
              className="grid h-8 w-8 place-items-center rounded-md9 transition hover:bg-bone"
            >
              <PixelIcon
                name={collapsed ? "arrowR" : "arrowL"}
                unit={3}
                weight="fine"
                tint="#5B6577"
              />
            </button>
          </div>
        )}

        {/* Módulos */}
        <div>
          {!collapsed && (
            <p className="px-3 pb-2 font-mono text-[10.5px] uppercase tracking-[0.16em] text-mute">
              Módulos
            </p>
          )}
          <div className="space-y-0.5">
            {categories.map((cat) => (
              <NavItem
                key={cat.key}
                active={selectedCategories.has(cat.key)}
                count={categoryCounts[cat.key] ?? 0}
                onClick={() => onToggleCategory(cat.key)}
                collapsed={collapsed}
                icon={<CategoryIcon name={cat.icon} unit={4} className="shrink-0" />}
                label={cat.name}
              />
            ))}
          </div>
        </div>

        {/* Tipo de cambio */}
        <div>
          {!collapsed && (
            <p className="px-3 pb-2 font-mono text-[10.5px] uppercase tracking-[0.16em] text-mute">
              Tipo de cambio
            </p>
          )}
          <div className="space-y-0.5">
            {STATUS_ORDER.map((status) => {
              const meta = STATUS_META[status];
              return (
                <NavItem
                  key={status}
                  active={selectedStatuses.has(status)}
                  count={statusCounts[status] ?? 0}
                  onClick={() => onToggleStatus(status)}
                  collapsed={collapsed}
                  icon={
                    <span
                      className={cn(
                        "h-2 w-2 shrink-0 rounded-[2px]",
                        meta.dotClass,
                      )}
                      aria-hidden
                    />
                  }
                  label={meta.label}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Limpiar filtros */}
      <div
        className={cn(
          "border-t border-line py-3",
          collapsed ? "flex justify-center px-2" : "px-3",
        )}
      >
        <button
          type="button"
          onClick={onClear}
          disabled={!hasFilters}
          aria-label="Limpiar filtros"
          title={collapsed ? "Limpiar filtros" : undefined}
          className={cn(
            "inline-flex items-center rounded-md9 font-mono text-[11px] uppercase tracking-[0.1em] transition",
            collapsed ? "justify-center p-2" : "gap-1.5 px-2.5 py-1.5",
            hasFilters
              ? "text-mute hover:text-coral-deep"
              : "cursor-default text-faint/60",
          )}
        >
          <X className="h-3.5 w-3.5 shrink-0" />
          {!collapsed && "Limpiar filtros"}
        </button>
      </div>
    </nav>
  );
}

export function Sidebar(props: SidebarProps) {
  const { open, onClose, collapsed, onToggleCollapse, ...content } = props;
  const reduce = useReducedMotion();

  return (
    <>
      {/* Desktop: sticky rail (collapsible to an icon strip) */}
      <aside
        className={cn(
          "sticky top-[60px] hidden h-[calc(100vh-60px)] shrink-0 border-r border-line bg-canvas transition-[width] duration-300 ease-ark lg:block",
          collapsed ? "w-[68px]" : "w-[260px]",
        )}
      >
        <SidebarContent
          {...content}
          collapsed={collapsed}
          onToggleCollapse={onToggleCollapse}
          showCollapseToggle
        />
      </aside>

      {/* Mobile: slide-in drawer (always full content) */}
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[70] lg:hidden">
            <MDiv
              className="absolute inset-0 bg-ink/55"
              onClick={onClose}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: DUR.base, ease: EASE }}
            />
            <motion.aside
              className="absolute left-0 top-0 h-full w-[280px] max-w-[85vw] border-r border-line bg-canvas shadow-e3"
              initial={reduce ? { opacity: 0 } : { x: "-100%" }}
              animate={reduce ? { opacity: 1 } : { x: 0 }}
              exit={reduce ? { opacity: 0 } : { x: "-100%" }}
              transition={{ duration: DUR.slow, ease: EASE }}
            >
              <div className="flex items-center justify-between border-b border-line px-4 py-3">
                <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-mute">
                  Navegación
                </span>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Cerrar navegación"
                  className="grid h-8 w-8 place-items-center rounded-md9 border border-line-2 text-ink transition hover:bg-bone"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="h-[calc(100%-49px)]">
                <SidebarContent
                  {...content}
                  collapsed={false}
                  onToggleCollapse={onToggleCollapse}
                />
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
