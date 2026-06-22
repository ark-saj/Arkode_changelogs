import * as React from "react";
import { cn } from "@/lib/utils";

/* Arkode Mosaic — section wrapper with tone.
   canvas = warm page bg, bone = warm surface, ink = navy + grain overlay
   + light text. Uses the .sec / .sec.bone / .sec.ink classes from globals
   (grain ::after via /grain.svg, mix-blend overlay, opacity .5). */

export type SectionTone = "canvas" | "bone" | "ink";

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  tone?: SectionTone;
}

export function Section({
  tone = "canvas",
  className,
  children,
  ...props
}: SectionProps) {
  return (
    <section
      className={cn("sec", tone === "bone" && "bone", tone === "ink" && "ink", className)}
      {...props}
    >
      {children}
    </section>
  );
}
