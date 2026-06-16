import type { ChangelogEntry, ChangelogStats } from "@/lib/types";

/** Derive dashboard KPIs from the raw entries so numbers always match content. */
export function computeStats(entries: ChangelogEntry[]): ChangelogStats {
  const tickets = entries.flatMap((e) => e.tickets);
  const stats: ChangelogStats = {
    totalTickets: tickets.length,
    improvements: 0,
    fixes: 0,
    newFeatures: 0,
    optimizations: 0,
    lastUpdate: null,
  };

  for (const t of tickets) {
    if (t.status === "improvement") stats.improvements++;
    else if (t.status === "fix") stats.fixes++;
    else if (t.status === "new") stats.newFeatures++;
    else if (t.status === "optimization") stats.optimizations++;
  }

  for (const e of entries) {
    if (!stats.lastUpdate || e.date > stats.lastUpdate) stats.lastUpdate = e.date;
  }

  return stats;
}

/** Newest first — entries by date desc. */
export function sortEntriesDesc(entries: ChangelogEntry[]): ChangelogEntry[] {
  return [...entries].sort((a, b) => (a.date < b.date ? 1 : -1));
}
