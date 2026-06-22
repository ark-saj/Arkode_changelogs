"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/* Arkode Mosaic — reveal-on-scroll (React port of mosaic-reveal.js).
   Adds `.in` when scrolled into view (IntersectionObserver, threshold 0.08),
   with a fail-safe timeout; prefers-reduced-motion shows immediately.
   Relies on the .reveal / .reveal.in CSS in globals.css. */

export function useReveal<T extends HTMLElement = HTMLElement>(): {
  ref: React.RefObject<T | null>;
  shown: boolean;
} {
  const ref = React.useRef<T>(null);
  const [shown, setShown] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce = window.matchMedia(
      "(prefers-reduced-motion:reduce)",
    ).matches;
    if (reduce) {
      setShown(true);
      return;
    }

    let done = false;
    const reveal = () => {
      if (done) return;
      done = true;
      setShown(true);
    };

    const ob = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            reveal();
            ob.disconnect();
          }
        });
      },
      { threshold: 0.08 },
    );
    ob.observe(el);

    // Fail-safe: ensure content is never stuck hidden.
    const timer = window.setTimeout(reveal, 1600);

    return () => {
      ob.disconnect();
      window.clearTimeout(timer);
    };
  }, []);

  return { ref, shown };
}

export interface RevealProps
  extends React.HTMLAttributes<HTMLElement>,
    Pick<React.AnchorHTMLAttributes<HTMLElement>, "href" | "target" | "rel"> {
  as?: React.ElementType;
  delay?: number;
}

export function Reveal({
  as,
  delay,
  className,
  style,
  children,
  ...props
}: RevealProps) {
  const Comp = (as ?? "div") as React.ElementType;
  const { ref, shown } = useReveal<HTMLElement>();
  return (
    <Comp
      ref={ref}
      className={cn("reveal", shown && "in", className)}
      style={
        delay
          ? { transitionDelay: `${delay}ms`, ...style }
          : style
      }
      {...props}
    >
      {children}
    </Comp>
  );
}
