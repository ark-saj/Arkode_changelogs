"use client";

import { Eyebrow } from "@/components/mosaic/eyebrow";
import { PixelCard } from "@/components/mosaic/pixel-card";
import type { PixelIconName } from "@/components/mosaic/pixel-icon";
import { StatusBadge } from "@/components/changelog/status-badge";
import { MDiv } from "@/components/motion/motion-safe";
import { slideUp, staggerContainer } from "@/components/motion/variants";
import type { Category, Ticket } from "@/lib/types";

/* Map stored category icon names (legacy Lucide names) to Mosaic pixel sprites.
   Mirrors CategoryIcon's mapping; falls back to `cube`. */
const CATEGORY_SPRITE: Record<string, PixelIconName> = {
  UserRound: "user",
  ShoppingCart: "money",
  Boxes: "cube",
  Truck: "truck",
  Briefcase: "brief",
  ReceiptText: "doc",
  Factory: "factory",
  Database: "database",
};

/** "Novedades más importantes" — featured tickets as a quick-access PixelCard grid. */
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
      <Eyebrow num="01">Destacado</Eyebrow>
      <h2
        id="highlights-title"
        className="mt-2 font-sans text-2xl font-semibold tracking-tight text-ink"
      >
        Novedades más importantes
      </h2>

      <MDiv
        className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
      >
        {tickets.map((ticket) => {
          const category = categoriesByKey[ticket.categoryKey];
          const sprite = category
            ? CATEGORY_SPRITE[category.icon] ?? "cube"
            : "cube";
          return (
            <MDiv key={ticket.code} variants={slideUp} className="h-full">
              <PixelCard
                icon={sprite}
                title={ticket.title}
                href={`#t-${ticket.code}`}
                meta={
                  <span className="flex items-center gap-1.5">
                    {category && (
                      <>
                        <span className="text-coral-deep">{category.name}</span>
                        <span className="text-faint">·</span>
                      </>
                    )}
                    <span>{ticket.code}</span>
                  </span>
                }
              >
                <span className="mb-2 inline-flex">
                  <StatusBadge status={ticket.status} />
                </span>
                <span className="block line-clamp-2">{ticket.summary}</span>
              </PixelCard>
            </MDiv>
          );
        })}
      </MDiv>
    </section>
  );
}
