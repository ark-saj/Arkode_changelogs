import { beforeAll, describe, expect, it } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { seedAuth } from "../scripts/seed-auth.mjs";

/**
 * Real-auth tenant isolation (Fase 1). Logs in as each tenant's user through
 * Supabase Auth and asserts, via PostgREST + RLS (membership path), that a user
 * only ever reads their own tenant's data. Complements the forged-claim test.
 *
 * Requires local Supabase running: `npx supabase start`.
 */
const URL = process.env.SUPABASE_URL ?? "http://127.0.0.1:54321";
const ANON =
  process.env.SUPABASE_ANON_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";

const CONECTA = "11111111-1111-1111-1111-111111111111";
const EVERBAN = "22222222-2222-2222-2222-222222222222";

async function signIn(email: string, password: string): Promise<SupabaseClient> {
  const client = createClient(URL, ANON, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw new Error(`sign-in ${email}: ${error.message}`);
  return client;
}

beforeAll(async () => {
  await seedAuth();
});

describe("real-auth tenant isolation", () => {
  it("a logged-in user reads only their tenant's changelogs", async () => {
    const conecta = await signIn("admin@conecta.test", "demo12345");
    const { data, error } = await conecta.from("changelogs").select("tenant_id");
    expect(error).toBeNull();
    expect(data && data.length).toBeGreaterThan(0);
    expect(data!.every((r) => r.tenant_id === CONECTA)).toBe(true);
  });

  it("a logged-in user cannot read another tenant's data", async () => {
    const everban = await signIn("admin@everban.test", "demo12345");
    const { data } = await everban.from("tickets").select("tenant_id");
    expect(data!.some((r) => r.tenant_id === CONECTA)).toBe(false);
    expect(data!.every((r) => r.tenant_id === EVERBAN)).toBe(true);
  });
});
