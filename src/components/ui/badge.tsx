import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {}

/**
 * Mosaic badge primitive: mono, uppercase, tinted. Status-specific colors are
 * passed in via className (see STATUS_META in src/lib/changelog-meta.ts).
 */
const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm6 px-2 py-0.5 font-mono text-[10.5px] font-medium uppercase tracking-[0.1em]",
        className,
      )}
      {...props}
    />
  ),
);
Badge.displayName = "Badge";

export { Badge };
