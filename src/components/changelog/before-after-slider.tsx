"use client";

import * as React from "react";

import { MockScreenshot } from "@/components/changelog/mock-screenshot";
import { PixelIcon } from "@/components/mosaic/pixel-icon";
import type { BeforeAfter } from "@/lib/types";

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
      className="relative aspect-[16/10] w-full cursor-ew-resize select-none overflow-hidden rounded-lg14 border border-line bg-white shadow-e1"
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
          alt={data.afterCaption}
          className="h-full w-full"
        />
        <span className="absolute right-3 top-3 rounded-sm6 bg-coral px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-[0.12em] text-white shadow-e1">
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
          alt={data.beforeCaption}
          className="h-full w-full grayscale-[0.25]"
        />
        <span className="absolute left-3 top-3 rounded-sm6 bg-ink px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-[0.12em] text-white shadow-e1">
          Antes
        </span>
      </div>

      {/* handle */}
      <div
        className="absolute inset-y-0 z-10 w-0.5 bg-coral"
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
          className="absolute left-1/2 top-1/2 grid h-10 w-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-line-2 bg-white text-coral shadow-e2 transition-transform duration-150 ease-ark hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-coral/40 motion-reduce:transition-none motion-reduce:hover:scale-100 motion-reduce:active:scale-100"
        >
          <span className="flex items-center gap-px">
            <PixelIcon name="arrowR" unit={2} tint="#FF6C5D" className="-scale-x-100" />
            <PixelIcon name="arrowR" unit={2} tint="#FF6C5D" />
          </span>
        </button>
      </div>
    </div>
  );
}
