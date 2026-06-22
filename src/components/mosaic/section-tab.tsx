import * as React from "react";
import { cn } from "@/lib/utils";

/* Arkode Mosaic — folder-tab section header (the Mistral "file folder tab on a
   rule"). A mono uppercase label with a coral fill and rounded top corners,
   sitting ON a 1px coral rule that spans the full content width.
   Use for every section header. Optional `id` so it can be a scroll anchor. */

export interface SectionTabProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Optional trailing element rendered to the right of the rule (e.g. a count). */
  meta?: React.ReactNode;
}

export function SectionTab({
  className,
  children,
  meta,
  ...props
}: SectionTabProps) {
  return (
    <div className={cn("flex items-end", className)} {...props}>
      <span className="inline-flex items-center gap-2 rounded-t-sm6 bg-coral px-3 py-1.5 font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-white">
        {children}
      </span>
      <span className="h-px flex-1 self-end bg-coral" aria-hidden />
      {meta != null && (
        <span className="ml-3 shrink-0 self-end pb-1 font-mono text-[11px] uppercase tracking-[0.12em] text-mute">
          {meta}
        </span>
      )}
    </div>
  );
}
