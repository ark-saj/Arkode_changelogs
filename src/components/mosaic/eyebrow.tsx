import * as React from "react";
import { cn } from "@/lib/utils";

/* Arkode Mosaic — mono uppercase eyebrow label with optional coral-deep number.
   Renders `00 · Foundations` style labels. Uses the .eyebrow class from globals. */

export interface EyebrowProps extends React.HTMLAttributes<HTMLSpanElement> {
  num?: string | number;
}

export function Eyebrow({ num, className, children, ...props }: EyebrowProps) {
  return (
    <span className={cn("eyebrow", className)} {...props}>
      {num != null && <span className="num">{num}</span>}
      {num != null && <span aria-hidden>·</span>}
      {children}
    </span>
  );
}
