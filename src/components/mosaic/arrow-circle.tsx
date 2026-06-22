import * as React from "react";
import { cn } from "@/lib/utils";

/* Arkode Mosaic — arrow-circle (↗ inside a hairline circle).
   Used top-right on PixelCard and as a "go" affordance. The diagonal nudge on
   hover is handled by the parent via the `group` + `group-hover` utilities
   (set `nudgeOnGroupHover`), or pass `nudge` to force the nudged position.
   Pure CSS transform, so it is harmless under reduced motion (no Framer). */

export interface ArrowCircleProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  /** Outer diameter in px. */
  size?: number;
  /** Force the nudged (translated up-right) position. */
  nudge?: boolean;
  /** Nudge when an ancestor with `.group` is hovered (default true). */
  nudgeOnGroupHover?: boolean;
}

export function ArrowCircle({
  size = 32,
  nudge = false,
  nudgeOnGroupHover = true,
  className,
  style,
  ...props
}: ArrowCircleProps) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full border border-line-2 text-ink transition-colors",
        className,
      )}
      style={{ width: size, height: size, ...style }}
      {...props}
    >
      <svg
        width={Math.round(size * 0.45)}
        height={Math.round(size * 0.45)}
        viewBox="0 0 12 12"
        fill="none"
        className={cn(
          "transition-transform duration-200 ease-ark motion-reduce:transition-none motion-reduce:!translate-x-0 motion-reduce:!translate-y-0",
          nudge && "translate-x-[2px] -translate-y-[2px]",
          nudgeOnGroupHover &&
            "group-hover:translate-x-[2px] group-hover:-translate-y-[2px]",
        )}
      >
        <path
          d="M3 9L9 3M9 3H4M9 3V8"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="square"
          strokeLinejoin="miter"
        />
      </svg>
    </span>
  );
}
