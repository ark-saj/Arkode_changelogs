import type { ChangelogData } from "@/lib/types";
import type { ChangelogRepository } from "@/lib/data/repository";
import { CATEGORIES, ENTRIES } from "@/lib/data/mock-data";
import { computeStats, sortEntriesDesc } from "@/lib/data/compute-stats";

/** In-memory repository backed by static mock content. Single-tenant. */
export class MockChangelogRepository implements ChangelogRepository {
  // tenantSlug is ignored — mock mode serves the same content for any slug.
  async getChangelog(_tenantSlug?: string): Promise<ChangelogData> {
    const entries = sortEntriesDesc(ENTRIES);
    return {
      entries,
      categories: CATEGORIES,
      stats: computeStats(entries),
    };
  }
}
