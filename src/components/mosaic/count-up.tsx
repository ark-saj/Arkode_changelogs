"use client";

import * as React from "react";
import { useReveal } from "./reveal";

/* Arkode Mosaic — count-up KPI animation.
   Cubic ease-out count from 0 to `to` over ~1.1s when revealed.
   prefers-reduced-motion jumps straight to the final value. */

const DURATION = 1100;

export interface CountUpProps extends React.HTMLAttributes<HTMLSpanElement> {
  to: number;
  suffix?: string;
  prefix?: string;
}

export function CountUp({
  to,
  suffix = "",
  prefix = "",
  ...props
}: CountUpProps) {
  const { ref, shown } = useReveal<HTMLSpanElement>();
  const [value, setValue] = React.useState(0);

  React.useEffect(() => {
    if (!shown) return;

    const reduce = window.matchMedia(
      "(prefers-reduced-motion:reduce)",
    ).matches;
    if (reduce) {
      setValue(to);
      return;
    }

    let raf = 0;
    let start = 0;
    const step = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min(1, (ts - start) / DURATION);
      const eased = 1 - Math.pow(1 - p, 3); // cubic ease-out
      setValue(to * eased);
      if (p < 1) raf = requestAnimationFrame(step);
      else setValue(to);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [shown, to]);

  const display = Number.isInteger(to)
    ? Math.round(value).toString()
    : value.toFixed(1);

  return (
    <span ref={ref} {...props}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}
