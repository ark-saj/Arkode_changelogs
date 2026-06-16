"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { MockScreenshot } from "@/components/changelog/mock-screenshot";
import type { Screenshot } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Premium screenshot gallery: rounded glass thumbnails with a click-to-zoom
 * lightbox (modal + prev/next + keyboard navigation).
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
            className="group relative overflow-hidden rounded-2xl border border-border/60 shadow-glass transition-all hover:-translate-y-0.5 hover:shadow-glass-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
          >
            <MockScreenshot
              variant={shot.variant}
              seed={shot.seed}
              url={shot.url}
              className="transition-transform duration-500 group-hover:scale-[1.04]"
            />
            <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <span className="pointer-events-none absolute bottom-2 left-3 right-9 truncate text-left text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
              {shot.caption}
            </span>
            <span className="pointer-events-none absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-slate-950/50 text-white opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">
              <Maximize2 className="h-3.5 w-3.5" />
            </span>
          </button>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl">
          <DialogTitle className="pr-10 text-base">
            {current.caption}
          </DialogTitle>
          <div className="overflow-hidden rounded-2xl border border-border/60 shadow-glass-lg">
            <MockScreenshot
              variant={current.variant}
              seed={current.seed}
              url={current.url}
            />
          </div>

          {screenshots.length > 1 && (
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => go(-1)}
                className="grid h-9 w-9 place-items-center rounded-full glass transition hover:scale-105"
                aria-label="Anterior"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm tabular-nums text-muted-foreground">
                {index + 1} / {screenshots.length}
              </span>
              <button
                type="button"
                onClick={() => go(1)}
                className="grid h-9 w-9 place-items-center rounded-full glass transition hover:scale-105"
                aria-label="Siguiente"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
