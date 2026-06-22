"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { PixelIcon } from "@/components/mosaic/pixel-icon";
import { DUR, EASE } from "@/components/motion/variants";
import { STATUS_META } from "@/lib/changelog-meta";
import type { Category, ChangelogData } from "@/lib/types";
import { cn } from "@/lib/utils";

/* Arkode Mosaic — ⌘K command palette. A scaleIn modal over an ink/55 scrim that
   fuzzy-filters tickets by code/title/module. ↑/↓ to move, Enter to jump (calls
   onJump with the ticket code), Esc to close. Reduced-motion = instant. */

interface PaletteResult {
  code: string;
  title: string;
  moduleName: string;
  status: keyof typeof STATUS_META;
  categoryIcon: string;
}

function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

export interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  data: ChangelogData;
  /** Called with the ticket code to scroll to + highlight it. */
  onJump: (code: string) => void;
}

export function CommandPalette({
  open,
  onClose,
  data,
  onJump,
}: CommandPaletteProps) {
  const reduce = useReducedMotion();
  const [query, setQuery] = React.useState("");
  const [activeIndex, setActiveIndex] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLUListElement>(null);

  const categoriesByKey = React.useMemo(() => {
    const map: Record<string, Category> = {};
    for (const c of data.categories) map[c.key] = c;
    return map;
  }, [data.categories]);

  const allTickets = React.useMemo<PaletteResult[]>(
    () =>
      data.entries.flatMap((e) =>
        e.tickets.map((t) => ({
          code: t.code,
          title: t.title,
          moduleName: categoriesByKey[t.categoryKey]?.name ?? "",
          status: t.status,
          categoryIcon: categoriesByKey[t.categoryKey]?.icon ?? "Boxes",
        })),
      ),
    [data.entries, categoriesByKey],
  );

  const results = React.useMemo<PaletteResult[]>(() => {
    const q = normalize(query.trim());
    if (!q) return allTickets.slice(0, 30);
    return allTickets
      .filter((t) =>
        normalize([t.code, t.title, t.moduleName].join(" ")).includes(q),
      )
      .slice(0, 30);
  }, [allTickets, query]);

  // Reset state on open; focus the input.
  React.useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
      const id = requestAnimationFrame(() => inputRef.current?.focus());
      return () => cancelAnimationFrame(id);
    }
  }, [open]);

  React.useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  // Keep the active row in view.
  React.useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const el = list.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const select = React.useCallback(
    (code: string) => {
      onClose();
      onJump(code);
    },
    [onClose, onJump],
  );

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, Math.max(results.length - 1, 0)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const r = results[activeIndex];
      if (r) select(r.code);
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-[80] flex items-start justify-center px-4 pt-[12vh]"
          role="dialog"
          aria-modal="true"
          aria-label="Buscar novedades"
        >
          <motion.div
            className="absolute inset-0 bg-ink/55"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DUR.base, ease: EASE }}
          />
          <motion.div
            className="relative w-full max-w-[560px] overflow-hidden rounded-lg14 border border-line bg-white shadow-e3"
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.97 }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.97 }}
            transition={{ duration: DUR.base, ease: EASE }}
            onKeyDown={onKeyDown}
          >
            <div className="flex items-center gap-3 border-b border-line px-4">
              <PixelIcon name="search" unit={3} tint="#6B7390" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por ticket, título o módulo…"
                aria-label="Buscar"
                className="h-12 flex-1 bg-transparent font-sans text-sm text-ink outline-none placeholder:text-faint"
              />
              <kbd className="rounded-[4px] border border-line-2 bg-bone px-1.5 py-0.5 font-mono text-[10px] leading-none text-mute">
                ESC
              </kbd>
            </div>

            {results.length === 0 ? (
              <div className="px-4 py-10 text-center font-mono text-[11px] uppercase tracking-[0.14em] text-mute">
                Sin resultados
              </div>
            ) : (
              <ul
                ref={listRef}
                role="listbox"
                className="max-h-[50vh] overflow-y-auto p-2"
              >
                {results.map((r, i) => {
                  const active = i === activeIndex;
                  const meta = STATUS_META[r.status];
                  return (
                    <li key={r.code} data-index={i} role="option" aria-selected={active}>
                      <button
                        type="button"
                        onMouseEnter={() => setActiveIndex(i)}
                        onClick={() => select(r.code)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-md9 px-3 py-2.5 text-left transition-colors",
                          active ? "bg-bone" : "hover:bg-bone/60",
                        )}
                      >
                        <span className="font-mono text-[10.5px] uppercase tracking-[0.1em] tabular-nums text-mute">
                          {r.code}
                        </span>
                        <span className="min-w-0 flex-1 truncate font-sans text-sm text-ink">
                          {r.title}
                        </span>
                        <span
                          className={cn(
                            "shrink-0 rounded-sm6 border px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.1em]",
                            meta.badgeClass,
                          )}
                        >
                          {meta.label}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}

            <div className="flex items-center gap-4 border-t border-line px-4 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-faint">
              <span className="flex items-center gap-1">
                <kbd className="rounded-[3px] border border-line-2 px-1">↑↓</kbd>
                Navegar
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded-[3px] border border-line-2 px-1">↵</kbd>
                Abrir
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
