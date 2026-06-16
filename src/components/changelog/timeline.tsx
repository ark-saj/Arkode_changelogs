import { ChangelogEntryNode } from "@/components/changelog/changelog-entry";
import { EmptyState } from "@/components/changelog/empty-state";
import type { Category, ChangelogEntry } from "@/lib/types";

/**
 * Vertical timeline with a translucent central rail. Entries are assumed to be
 * pre-sorted (newest first); the first one is flagged as the latest release.
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
      {/* translucent rail */}
      <div
        aria-hidden
        className="absolute left-[21px] top-2 h-full w-px bg-gradient-to-b from-brand/50 via-border to-transparent sm:left-[29px]"
      />
      <div className="space-y-12">
        {entries.map((entry, i) => (
          <ChangelogEntryNode
            key={entry.id}
            entry={entry}
            categoriesByKey={categoriesByKey}
            isLatest={i === 0}
          />
        ))}
      </div>
    </div>
  );
}
