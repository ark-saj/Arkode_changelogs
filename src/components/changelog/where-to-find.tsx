"use client";

import { MDiv, MSpan } from "@/components/motion/motion-safe";
import { slideUp, staggerContainer } from "@/components/motion/variants";
import { cn } from "@/lib/utils";

/**
 * "¿Dónde lo encuentro?" — a quiet inline route the user follows inside Odoo,
 * e.g. INVENTARIO › RECEPCIONES. Mono, neutral separators, last step in ink.
 * No box, no accent: the calm Mistral breadcrumb. Stagger-in, reduced-motion-safe.
 */
export function WhereToFind({
  path,
  className,
}: {
  path: string[];
  className?: string;
}) {
  return (
    <MDiv
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.4 }}
      className={cn("flex flex-wrap items-center gap-x-2 gap-y-1", className)}
    >
      {path.map((step, i) => {
        const last = i === path.length - 1;
        return (
          <MSpan key={i} variants={slideUp} className="flex items-center gap-2">
            <span
              className={cn(
                "font-mono text-[12px] uppercase tracking-[0.08em]",
                last ? "font-medium text-ink" : "text-mute",
              )}
            >
              {step}
            </span>
            {!last && (
              <span aria-hidden className="text-faint">
                ›
              </span>
            )}
          </MSpan>
        );
      })}
    </MDiv>
  );
}
