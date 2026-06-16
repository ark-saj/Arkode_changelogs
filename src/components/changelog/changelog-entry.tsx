"use client";

import { motion } from "framer-motion";
import { Rocket } from "lucide-react";

import { TicketCard } from "@/components/changelog/ticket-card";
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
    <motion.section
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="relative pl-12 sm:pl-16"
    >
      {/* timeline node */}
      <div className="absolute left-[14px] top-1.5 sm:left-[22px]">
        <span
          className={cn(
            "relative grid h-4 w-4 place-items-center rounded-full ring-4 ring-background",
            "bg-gradient-to-br from-brand to-brand-soft",
          )}
        >
          {isLatest && (
            <span className="absolute inset-0 -z-0 rounded-full bg-brand/60 animate-pulse-ring" />
          )}
        </span>
      </div>

      {/* entry header */}
      <div className="mb-4">
        <div className="flex flex-wrap items-center gap-3">
          <time className="font-display text-lg font-semibold tracking-tight">
            {formatLongDate(entry.date)}
          </time>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
            <Rocket className="h-3.5 w-3.5" />
            {pluralize(count, "cambio implementado", "cambios implementados")}
          </span>
          {isLatest && (
            <span className="rounded-full bg-status-new/15 px-2.5 py-0.5 text-xs font-medium text-status-new">
              {relativeLabel(entry.date)}
            </span>
          )}
        </div>
        {entry.title && (
          <h3 className="mt-1 text-sm font-medium text-foreground/90">
            {entry.title}
          </h3>
        )}
        <p className="mt-0.5 text-sm text-muted-foreground">{entry.summary}</p>
      </div>

      {/* tickets */}
      <div className="space-y-3">
        {entry.tickets.map((ticket) => (
          <TicketCard
            key={ticket.code}
            ticket={ticket}
            category={categoriesByKey[ticket.categoryKey]}
          />
        ))}
      </div>
    </motion.section>
  );
}
