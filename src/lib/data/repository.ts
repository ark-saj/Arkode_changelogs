import type { ChangelogData } from "@/lib/types";
import { MockChangelogRepository } from "@/lib/data/mock-repository";

/**
 * The single contract every data source implements. Add methods here and both
 * the mock and Supabase repositories must satisfy them — the compiler enforces it.
 */
export interface ChangelogRepository {
  /** Everything the landing page needs: entries (sorted), categories, stats. */
  getChangelog(): Promise<ChangelogData>;
}

/** True when real Supabase credentials are present in the environment. */
export function hasSupabaseCredentials(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

let cached: ChangelogRepository | null = null;

/**
 * Data-layer factory. Auto-selects the backend:
 *  - Supabase, when NEXT_PUBLIC_SUPABASE_URL + ANON_KEY are set.
 *  - Mock, otherwise (default — zero config, works in the demo and on Railway).
 *
 * Components depend on the interface, never on a concrete implementation, so
 * switching backends is a configuration change, not a code change.
 */
export function getRepository(): ChangelogRepository {
  if (cached) return cached;

  if (hasSupabaseCredentials()) {
    // Lazy require so supabase-js is only loaded when actually configured.
    const { SupabaseChangelogRepository } =
      require("@/lib/data/supabase-repository") as typeof import("@/lib/data/supabase-repository");
    cached = new SupabaseChangelogRepository();
  } else {
    cached = new MockChangelogRepository();
  }

  return cached;
}

/** Which backend is active — handy for a small banner in the UI. */
export function activeDataSource(): "supabase" | "mock" {
  return hasSupabaseCredentials() ? "supabase" : "mock";
}
