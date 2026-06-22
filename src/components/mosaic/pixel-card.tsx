"use client";

import * as React from "react";
import Link from "next/link";

import { ArrowCircle } from "@/components/mosaic/arrow-circle";
import { PixelIcon, type PixelIconName } from "@/components/mosaic/pixel-icon";
import { cn } from "@/lib/utils";

/* Arkode Mosaic — pixel-logo card (the Mistral "pixel-logo card").
   Bordered (--line) rounded (r-lg) white card. Pixel icon top-left in a soft
   bone tile, ArrowCircle top-right, bold title, muted description, optional
   hairline + mono footer meta. Hover: lift (y -2px) + e2 + arrow nudge — all
   pure CSS transitions, so it is reduced-motion-safe (no Framer transforms).
   If `href` is set the whole card is a link. */

export interface PixelCardProps {
  icon: PixelIconName;
  title: string;
  href?: string;
  /** Mono footer meta (rendered after a hairline divider when present). */
  meta?: React.ReactNode;
  /** Description / body. */
  children?: React.ReactNode;
  /** Tint for the pixel icon (PAL key or hex); defaults to the sprite palette. */
  iconTint?: string;
  className?: string;
}

export function PixelCard({
  icon,
  title,
  href,
  meta,
  children,
  iconTint,
  className,
}: PixelCardProps) {
  const inner = (
    <>
      <div className="flex items-start justify-between gap-4">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-md9 bg-bone">
          <PixelIcon name={icon} unit={4} tint={iconTint} />
        </span>
        <ArrowCircle />
      </div>

      <h3 className="mt-4 font-sans text-base font-semibold leading-snug tracking-[-0.02em] text-ink">
        {title}
      </h3>

      {children != null && (
        <div className="mt-1.5 font-sans text-sm leading-relaxed text-mute">
          {children}
        </div>
      )}

      {meta != null && (
        <div className="mt-4 border-t border-line pt-3 font-mono text-[11px] uppercase tracking-[0.12em] text-mute">
          {meta}
        </div>
      )}
    </>
  );

  const cardClass = cn(
    "group flex h-full flex-col rounded-lg14 border border-line bg-white p-5 shadow-e1 transition-[transform,box-shadow] duration-200 ease-ark hover:-translate-y-0.5 hover:shadow-e2 motion-reduce:transition-none motion-reduce:hover:translate-y-0",
    className,
  );

  if (href) {
    return (
      <Link href={href} className={cardClass}>
        {inner}
      </Link>
    );
  }

  return <div className={cardClass}>{inner}</div>;
}
