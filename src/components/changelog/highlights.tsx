"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Star } from "lucide-react";

import { StatusBadge } from "@/components/changelog/status-badge";
import { CategoryIcon } from "@/components/changelog/category-icon";
import type { Category, Ticket } from "@/lib/types";

/** "Novedades más importantes" — featured tickets as a quick-access grid. */
export function Highlights({
  tickets,
  categoriesByKey,
}: {
  tickets: Ticket[];
  categoriesByKey: Record<string, Category>;
}) {
  if (tickets.length === 0) return null;

  return (
    <section aria-labelledby="highlights-title">
      <div className="mb-4 flex items-center gap-2">
        <Star className="h-4 w-4 text-brand" />
        <h2
          id="highlights-title"
          className="font-display text-lg font-semibold tracking-tight"
        >
          Novedades más importantes
        </h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tickets.map((ticket, i) => {
          const category = categoriesByKey[ticket.categoryKey];
          return (
            <motion.a
              key={ticket.code}
              href={`#t-${ticket.code}`}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.06 }}
              className="group relative flex flex-col overflow-hidden rounded-3xl glass glass-highlight p-5 transition-all hover:-translate-y-1 hover:shadow-glass-lg"
            >
              <span className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-brand/20 blur-2xl transition-opacity group-hover:opacity-100" />
              <div className="flex items-center justify-between">
                <StatusBadge status={ticket.status} />
                <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand" />
              </div>
              <h3 className="mt-3 font-display text-base font-semibold leading-snug tracking-tight">
                {ticket.title}
              </h3>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                {ticket.summary}
              </p>
              {category && (
                <span className="mt-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CategoryIcon name={category.icon} className="h-3.5 w-3.5 text-brand" />
                  {category.name}
                  <span className="mx-1 opacity-40">·</span>
                  <span className="font-mono">{ticket.code}</span>
                </span>
              )}
            </motion.a>
          );
        })}
      </div>
    </section>
  );
}
