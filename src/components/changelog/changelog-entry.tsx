"use client";

import { AnimatePresence } from "framer-motion";
import { TicketCard } from "@/components/changelog/ticket-card";
import { MDiv } from "@/components/motion/motion-safe";
import { SectionTab } from "@/components/mosaic/section-tab";
import { slideUp, staggerContainer } from "@/components/motion/variants";
import { formatLongDate, pluralize, relativeLabel } from "@/lib/format";
import type { Category, ChangelogEntry } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ChangelogEntryNode({
  entry,
  categoriesByKey,
  isLatest = false,
}: {
  entry: ChangelogEntry;
  categoriesByKey: Record<string, Category>;
  isLatest?: boolean;
}) {
  const count = entry.tickets.length;

  return (
    <section id={`rel-${entry.date}`} className="relative scroll-mt-24 pl-12 sm:pl-16">
      {/* date node on the rail — coral dot for the latest entry only */}
      <div className="absolute left-[14px] top-[7px] sm:left-[22px]">
        <span
          className={cn(
            "block h-2.5 w-2.5 rounded-full ring-4 ring-canvas",
            isLatest ? "bg-coral" : "bg-line-2",
          )}
        />
      </div>

      {/* entry header — folder-tab date over the coral rule */}
      <div className="mb-5">
        <SectionTab
          meta={pluralize(count, "cambio", "cambios")}
        >
          {formatLongDate(entry.date)}
        </SectionTab>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-mute">
            {pluralize(count, "cambio implementado", "cambios implementados")}
          </span>
          {isLatest && (
            <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-coral-deep">
              {relativeLabel(entry.date)}
            </span>
          )}
        </div>
        {entry.title && (
          <h3 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-ink">
            {entry.title}
          </h3>
        )}
        <p className="mt-1 text-sm leading-relaxed text-mute">{entry.summary}</p>
      </div>

      {/* tickets — stagger in; layout so they reflow smoothly */}
      <MDiv
        className="space-y-3"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-40px" }}
      >
        <AnimatePresence initial={false}>
          {entry.tickets.map((ticket) => (
            <MDiv key={ticket.code} layout variants={slideUp} exit="hidden">
              <TicketCard
                ticket={ticket}
                category={categoriesByKey[ticket.categoryKey]}
              />
            </MDiv>
          ))}
        </AnimatePresence>
      </MDiv>
    </section>
  );
}
