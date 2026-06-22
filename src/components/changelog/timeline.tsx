"use client";

import { AnimatePresence } from "framer-motion";
import { ChangelogEntryNode } from "@/components/changelog/changelog-entry";
import { EmptyState } from "@/components/changelog/empty-state";
import { MDiv } from "@/components/motion/motion-safe";
import { slideUp, staggerContainer } from "@/components/motion/variants";
import type { Category, ChangelogEntry } from "@/lib/types";

/**
 * Vertical timeline with a 1px hairline rail. Entries are assumed to be
 * pre-sorted (newest first); the first one is flagged as the latest release.
 * Each release is wrapped so a filter change reflows + staggers smoothly
 * (AnimatePresence + layout), and each node carries a stable `id="rel-<date>"`
 * anchor for the TOC / scroll-spy.
 */
export function Timeline({
  entries,
  categoriesByKey,
}: {
  entries: ChangelogEntry[];
  categoriesByKey: Record<string, Category>;
}) {
  if (entries.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="relative">
      {/* hairline rail */}
      <div
        aria-hidden
        className="absolute left-[19px] top-2 h-full w-px bg-line sm:left-[27px]"
      />
      <MDiv
        className="space-y-12"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {entries.map((entry, i) => (
            <MDiv
              key={entry.id}
              layout
              variants={slideUp}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <ChangelogEntryNode
                entry={entry}
                categoriesByKey={categoriesByKey}
                isLatest={i === 0}
              />
            </MDiv>
          ))}
        </AnimatePresence>
      </MDiv>
    </div>
  );
}
