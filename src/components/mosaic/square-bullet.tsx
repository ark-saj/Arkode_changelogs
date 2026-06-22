import * as React from "react";
import { cn } from "@/lib/utils";

/* Arkode Mosaic — list markers.
   <SquareBullet/> : a coral filled square (not a dot) for unordered list items.
   <StepNumber n/> : a mono coral number for ordered steps.
   Use in ticket detail (¿Qué cambió? etc.) and any structured list. */

export interface SquareBulletProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  /** Square edge length in px. */
  size?: number;
}

export function SquareBullet({
  size = 7,
  className,
  style,
  ...props
}: SquareBulletProps) {
  return (
    <span
      aria-hidden
      className={cn("inline-block shrink-0 rounded-[1px] bg-coral", className)}
      style={{ width: size, height: size, ...style }}
      {...props}
    />
  );
}

export interface StepNumberProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  n: number;
}

export function StepNumber({ n, className, ...props }: StepNumberProps) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex min-w-[1.4em] justify-end font-mono text-[13px] font-medium tabular-nums tracking-[0.04em] text-coral-deep",
        className,
      )}
      {...props}
    >
      {n}.
    </span>
  );
}
