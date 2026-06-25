import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client. BYPASSES RLS by design — it is the engine
 * behind the write layer (ChangelogService) and token resolution.
 *
 * Security: this must NEVER be imported into client code. The service-role key
 * lives in a server-only env var (no NEXT_PUBLIC_ prefix), so it is never
 * bundled to the browser. The write-isolation boundary is ChangelogService,
 * which always scopes by an explicit `tenantId` — not RLS (see §3.1 of
 * docs/PLAN.md).
 */

// Well-known LOCAL Supabase defaults (the public demo keys, identical to
// scripts/seed-auth.mjs). Production MUST set SUPABASE_SERVICE_ROLE_KEY.
const LOCAL_URL = "http://127.0.0.1:54321";
const LOCAL_SERVICE_ROLE =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU";

let cached: SupabaseClient | null = null;

export function getServiceClient(): SupabaseClient {
  if (cached) return cached;
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ??
    process.env.SUPABASE_URL ??
    LOCAL_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? LOCAL_SERVICE_ROLE;
  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
