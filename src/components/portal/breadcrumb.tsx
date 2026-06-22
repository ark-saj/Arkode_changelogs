import * as React from "react";
import { cn } from "@/lib/utils";

/* Arkode Mosaic — breadcrumb trail (mono uppercase) with a trailing hairline
   that extends to the right edge of the content. Opens the content region,
   e.g. "INICIO › NOVEDADES". */

export interface BreadcrumbProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Ordered trail segments, e.g. ["Inicio", "Novedades"]. */
  items: string[];
}

export function Breadcrumb({ items, className, ...props }: BreadcrumbProps) {
  return (
    <div className={cn("flex items-center gap-3", className)} {...props}>
      <nav
        aria-label="Ruta"
        className="flex shrink-0 items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.14em]"
      >
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <React.Fragment key={`${item}-${i}`}>
              {i > 0 && (
                <span className="text-faint" aria-hidden>
                  ›
                </span>
              )}
              <span className={last ? "text-ink-soft" : "text-mute"}>
                {item}
              </span>
            </React.Fragment>
          );
        })}
      </nav>
      <span className="h-px flex-1 bg-line" aria-hidden />
    </div>
  );
}
