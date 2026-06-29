import type { ChangelogData } from "@/lib/types";
import type { ChangelogRepository } from "@/lib/data/repository";
import { readChangelogData } from "@/lib/data/changelog-read";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/** Fallback tenant slug when the route doesn't pass one. */
const DEFAULT_TENANT_SLUG = process.env.NEXT_PUBLIC_TENANT ?? "conecta";

/**
 * Supabase-backed, tenant-scoped repository. Reads with the caller's session so
 * RLS scopes every row to their tenant (see supabase/migrations and §3.1 of
 * docs/PLAN.md). The actual read + mapping lives in `changelog-read`, shared
 * with the public embed view (which reads via the service client instead).
 */
export class SupabaseChangelogRepository implements ChangelogRepository {
  async getChangelog(tenantSlug?: string): Promise<ChangelogData> {
    const slug = tenantSlug ?? DEFAULT_TENANT_SLUG;
    const supabase = await createSupabaseServerClient();
    return readChangelogData(supabase, slug);
  }
}
