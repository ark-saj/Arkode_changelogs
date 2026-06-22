"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/* Arkode Mosaic — right TOC (sticky, desktop >=1200px only). Mono "EN ESTA
   PÁGINA" + the release dates / sections. Active item (driven by useScrollSpy,
   passed in via `activeId`) = coral square marker + ink text; others muted.
   Clicking smooth-scrolls to the target id. */

export interface TocItem {
  id: string;
  label: string;
}

export interface RightTocProps {
  items: TocItem[];
  activeId: string | null;
  onJump: (id: string) => void;
}

export function RightToc({ items, activeId, onJump }: RightTocProps) {
  if (items.length === 0) return null;

  return (
    <aside className="sticky top-[60px] hidden h-[calc(100vh-60px)] w-[220px] shrink-0 overflow-y-auto py-8 pl-6 [@media(min-width:1200px)]:block">
      <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-mute">
        En esta página
      </p>
      <ul className="mt-4 space-y-0.5">
        {items.map((item) => {
          const active = activeId === item.id;
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onJump(item.id)}
                aria-current={active ? "true" : undefined}
                className={cn(
                  "group flex w-full items-center gap-2.5 rounded-[4px] py-1.5 pl-1 pr-2 text-left text-[13px] transition-colors",
                  active
                    ? "text-ink"
                    : "text-mute hover:text-ink-soft",
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    "h-[7px] w-[7px] shrink-0 rounded-[1px] transition-colors",
                    active ? "bg-coral" : "bg-line-2 group-hover:bg-mute",
                  )}
                />
                <span className="truncate">{item.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
