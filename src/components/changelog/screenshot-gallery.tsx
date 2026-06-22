"use client";

import * as React from "react";
import { AnimatePresence } from "framer-motion";

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { MockScreenshot } from "@/components/changelog/mock-screenshot";
import { PixelIcon } from "@/components/mosaic/pixel-icon";
import { MDiv } from "@/components/motion/motion-safe";
import { scaleIn } from "@/components/motion/variants";
import type { Screenshot } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Screenshot gallery: hairline Mosaic thumbnails with a click-to-zoom
 * lightbox (opaque #fff dialog + prev/next + keyboard navigation).
 */
export function ScreenshotGallery({
  screenshots,
}: {
  screenshots: Screenshot[];
}) {
  const [open, setOpen] = React.useState(false);
  const [index, setIndex] = React.useState(0);

  if (screenshots.length === 0) return null;

  const openAt = (i: number) => {
    setIndex(i);
    setOpen(true);
  };
  const go = (dir: 1 | -1) =>
    setIndex((i) => (i + dir + screenshots.length) % screenshots.length);

  const current = screenshots[index];

  return (
    <>
      <div
        className={cn(
          "grid gap-3",
          screenshots.length === 1 ? "grid-cols-1" : "grid-cols-2",
        )}
      >
        {screenshots.map((shot, i) => (
          <button
            key={shot.id}
            type="button"
            onClick={() => openAt(i)}
            className="group relative overflow-hidden rounded-lg14 border border-line bg-white shadow-e1 transition-all hover:-translate-y-px hover:shadow-e2 focus:outline-none focus-visible:ring-2 focus-visible:ring-coral/40"
          >
            <MockScreenshot
              variant={shot.variant}
              seed={shot.seed}
              url={shot.url}
              kind={shot.kind}
              poster={shot.poster}
              alt={shot.caption}
              className="transition-transform duration-500 group-hover:scale-[1.03]"
            />
            <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-ink/80 px-3 py-2 opacity-0 transition-opacity group-hover:opacity-100">
              <span className="block truncate text-left font-mono text-[11px] uppercase tracking-[0.1em] text-white">
                {shot.caption}
              </span>
            </span>
            <span className="pointer-events-none absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-md9 border border-line-2 bg-canvas opacity-0 transition-opacity group-hover:opacity-100">
              <PixelIcon name="search" unit={3} tint="#001C43" />
            </span>
          </button>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl">
          <DialogTitle className="pr-10 text-base">
            {current.caption}
          </DialogTitle>
          <div className="overflow-hidden rounded-lg14 border border-line shadow-e1">
            <AnimatePresence mode="wait" initial={false}>
              <MDiv
                key={current.id}
                variants={scaleIn}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <MockScreenshot
                  variant={current.variant}
                  seed={current.seed}
                  url={current.url}
                  kind={current.kind}
                  poster={current.poster}
                  alt={current.caption}
                />
              </MDiv>
            </AnimatePresence>
          </div>

          {screenshots.length > 1 && (
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => go(-1)}
                className="grid h-9 w-9 place-items-center rounded-md9 border border-line-2 bg-canvas text-ink transition hover:bg-bone focus:outline-none focus-visible:ring-2 focus-visible:ring-coral/40"
                aria-label="Anterior"
              >
                <PixelIcon name="arrowR" unit={3} tint="#001C43" className="-scale-x-100" />
              </button>
              <span className="font-mono text-xs uppercase tracking-[0.12em] tabular-nums text-mute">
                {index + 1} / {screenshots.length}
              </span>
              <button
                type="button"
                onClick={() => go(1)}
                className="grid h-9 w-9 place-items-center rounded-md9 border border-line-2 bg-canvas text-ink transition hover:bg-bone focus:outline-none focus-visible:ring-2 focus-visible:ring-coral/40"
                aria-label="Siguiente"
              >
                <PixelIcon name="arrowR" unit={3} tint="#001C43" />
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
