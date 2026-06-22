"use client";

import * as React from "react";

import { MSpan } from "@/components/motion/motion-safe";
import { REACTION_META } from "@/lib/changelog-meta";
import type { ReactionCounts } from "@/lib/types";
import { cn } from "@/lib/utils";

type ReactionKey = keyof ReactionCounts;

/**
 * Lightweight reactions. Persisted in localStorage per ticket (no backend in the
 * demo). Counts update optimistically; toggling off subtracts the user's vote.
 */
export function Reactions({
  ticketCode,
  counts,
}: {
  ticketCode: string;
  counts: ReactionCounts;
}) {
  const storageKey = `changelog:reactions:${ticketCode}`;
  const [active, setActive] = React.useState<Record<string, boolean>>({});

  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) setActive(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, [storageKey]);

  const toggle = (key: ReactionKey) => {
    setActive((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {REACTION_META.map(({ key, icon: Icon, label }) => {
        const isActive = Boolean(active[key]);
        const value = counts[key] + (isActive ? 1 : 0);
        return (
          <button
            key={key}
            type="button"
            onClick={() => toggle(key)}
            aria-pressed={isActive}
            className={cn(
              "inline-flex items-center gap-2 rounded-md9 border px-3 py-1.5 text-sm transition-colors",
              isActive
                ? "border-coral bg-coral/[0.12] text-coral-deep"
                : "border-line-2 bg-canvas text-ink-soft hover:border-coral/40 hover:text-coral-deep",
            )}
          >
            <MSpan
              key={`${key}-${isActive}`}
              initial={{ scale: 0.6 }}
              animate={{ scale: isActive ? [1, 1.35, 1] : 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 15 }}
              className="leading-none"
            >
              <Icon
                className={cn(
                  "h-4 w-4 transition-colors",
                  isActive && "fill-current",
                )}
              />
            </MSpan>
            <span className="hidden sm:inline">{label}</span>
            <span className="font-mono text-xs tabular-nums">{value}</span>
          </button>
        );
      })}
    </div>
  );
}
