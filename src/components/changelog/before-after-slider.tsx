"use client";

import * as React from "react";
import { MoveHorizontal } from "lucide-react";

import { MockScreenshot } from "@/components/changelog/mock-screenshot";
import type { BeforeAfter } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Interactive before/after comparison. Drag the handle (or use the arrow keys)
 * to wipe between the two states. Works with generated mockups or real images.
 */
export function BeforeAfterSlider({ data }: { data: BeforeAfter }) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [pos, setPos] = React.useState(50);
  const [dragging, setDragging] = React.useState(false);

  const updateFromClientX = React.useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.min(100, Math.max(0, pct)));
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    updateFromClientX(e.clientX);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (dragging) updateFromClientX(e.clientX);
  };
  const stop = () => setDragging(false);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") setPos((p) => Math.max(0, p - 4));
    if (e.key === "ArrowRight") setPos((p) => Math.min(100, p + 4));
  };

  return (
    <div
      ref={containerRef}
      className="relative aspect-[16/10] w-full cursor-ew-resize select-none overflow-hidden rounded-2xl border border-border/60 shadow-glass"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={stop}
      onPointerLeave={stop}
    >
      {/* AFTER (base layer, right side) */}
      <div className="absolute inset-0">
        <MockScreenshot
          variant={data.afterVariant}
          seed={(data.seed ?? 1) + 100}
          url={data.afterUrl}
          className="h-full w-full"
        />
        <span className="absolute right-3 top-3 rounded-full bg-status-new/90 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white shadow">
          Después
        </span>
      </div>

      {/* BEFORE (clipped overlay, left side) */}
      <div
        className="absolute inset-0"
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
      >
        <MockScreenshot
          variant={data.beforeVariant}
          seed={data.seed ?? 1}
          url={data.beforeUrl}
          className="h-full w-full grayscale-[0.25]"
        />
        <span className="absolute left-3 top-3 rounded-full bg-slate-900/80 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white shadow">
          Antes
        </span>
      </div>

      {/* handle */}
      <div
        className="absolute inset-y-0 z-10 w-0.5 bg-white/90 shadow-[0_0_10px_rgba(0,0,0,0.4)]"
        style={{ left: `${pos}%` }}
      >
        <button
          type="button"
          aria-label="Comparar antes y después"
          aria-valuenow={Math.round(pos)}
          aria-valuemin={0}
          aria-valuemax={100}
          role="slider"
          onKeyDown={onKeyDown}
          className="absolute left-1/2 top-1/2 grid h-10 w-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-slate-800 shadow-glass-lg ring-2 ring-brand/40 focus:outline-none focus-visible:ring-4"
        >
          <MoveHorizontal className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
