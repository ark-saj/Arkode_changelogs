import { describe, expect, it } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import jwt from "jsonwebtoken";

/**
 * Tenant isolation — the non-negotiable Fase 0.5 gate (see §8 of docs/PLAN.md).
 *
 * Forges an `authenticated` JWT carrying a `tenant_id` claim (exactly what the
 * Fase 1 login will issue) and asserts, through PostgREST + RLS, that one tenant
 * can never read another tenant's rows.
 *
 * Requires local Supabase running: `npx supabase start`. Values default to the
 * well-known local credentials; override via env if needed.
 */
const URL = process.env.SUPABASE_URL ?? "http://127.0.0.1:54321";
const ANON =
  process.env.SUPABASE_ANON_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";
const SECRET =
  process.env.SUPABASE_JWT_SECRET ??
  "super-secret-jwt-token-with-at-least-32-characters-long";

const CONECTA = "11111111-1111-1111-1111-111111111111";
const EVERBAN = "22222222-2222-2222-2222-222222222222";

function clientForTenant(tenantId: string): SupabaseClient {
  const token = jwt.sign(
    {
      role: "authenticated",
      sub: "00000000-0000-0000-0000-0000000000aa",
      tenant_id: tenantId,
    },
    SECRET,
    { expiresIn: "1h" },
  );
  return createClient(URL, ANON, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

describe("tenant isolation (RLS)", () => {
  it("a tenant reads only its own changelogs", async () => {
    const { data, error } = await clientForTenant(CONECTA)
      .from("changelogs")
      .select("tenant_id");
    expect(error).toBeNull();
    expect(data && data.length).toBeGreaterThan(0);
    expect(data!.every((r) => r.tenant_id === CONECTA)).toBe(true);
  });

  it("a tenant cannot read another tenant's changelogs", async () => {
    const { data, error } = await clientForTenant(EVERBAN)
      .from("changelogs")
      .select("tenant_id");
    expect(error).toBeNull();
    expect(data!.some((r) => r.tenant_id === CONECTA)).toBe(false);
    expect(data!.every((r) => r.tenant_id === EVERBAN)).toBe(true);
  });

  it("ticket rows (and codes) never leak across tenants", async () => {
    const a = await clientForTenant(CONECTA).from("tickets").select("code,tenant_id");
    const b = await clientForTenant(EVERBAN).from("tickets").select("code,tenant_id");
    expect(a.data!.every((r) => r.tenant_id === CONECTA)).toBe(true);
    expect(b.data!.every((r) => r.tenant_id === EVERBAN)).toBe(true);

    const conectaCodes = new Set(a.data!.map((r) => r.code));
    expect(b.data!.some((r) => conectaCodes.has(r.code))).toBe(false);
  });

  it("screenshots are isolated too", async () => {
    const a = await clientForTenant(CONECTA)
      .from("screenshots")
      .select("tenant_id");
    expect(a.data!.every((r) => r.tenant_id === CONECTA)).toBe(true);
  });
});
