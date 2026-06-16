import type { ChangelogData } from "@/lib/types";
import type { ChangelogRepository } from "@/lib/data/repository";
import { CATEGORIES, ENTRIES } from "@/lib/data/mock-data";
import { computeStats, sortEntriesDesc } from "@/lib/data/compute-stats";

/** In-memory repository backed by static mock content. The default backend. */
export class MockChangelogRepository implements ChangelogRepository {
  async getChangelog(): Promise<ChangelogData> {
    const entries = sortEntriesDesc(ENTRIES);
    return {
      entries,
      categories: CATEGORIES,
      stats: computeStats(entries),
    };
  }
}
