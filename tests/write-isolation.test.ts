import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import jwt from "jsonwebtoken";

import { DEV_TOKENS, seedApiTokens } from "../scripts/seed-auth.mjs";
import {
  ChangelogService,
  type ServiceErrorCode,
} from "@/lib/services/changelog-service";
import { resolveTenantByToken } from "@/lib/auth/api-token";
import { getServiceClient } from "@/lib/supabase/service";

/**
 * Write isolation — the Fase 2 gate (§3.1, §8 of docs/PLAN.md).
 *
 * The write boundary is ChangelogService (service_role bypasses RLS), so the
 * invariants under test are:
 *   1. a per-tenant token resolves ONLY to its own tenant;
 *   2. service writes land under the given tenant and are read-isolated;
 *   3. writes are idempotent by natural key (retries don't duplicate);
 *   4. invalid input / missing entries are rejected (Zod + not_found).
 *
 * Requires local Supabase running + tokens seeded (done in beforeAll).
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

const TEST_DATE = "2099-12-31";
const TEST_CODE = "WTEST-001";

function clientForTenant(tenantId: string): SupabaseClient {
  const token = jwt.sign(
    { role: "authenticated", sub: "00000000-0000-0000-0000-0000000000aa", tenant_id: tenantId },
    SECRET,
    { expiresIn: "1h" },
  );
  return createClient(URL, ANON, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

const svc = new ChangelogService();

const baseTicket = {
  tenantId: CONECTA,
  date: TEST_DATE,
  code: TEST_CODE,
  title: "Test change",
  summary: "A test change",
  status: "new" as const,
  categoryKey: "crm",
  whatChanged: "algo cambió",
  whyUseful: "te sirve",
  whereToFind: ["CRM", "Oportunidades"],
};

beforeAll(async () => {
  await seedApiTokens();
});

afterAll(async () => {
  // Cascade removes the test ticket too.
  await getServiceClient()
    .from("changelogs")
    .delete()
    .eq("tenant_id", CONECTA)
    .eq("date", TEST_DATE);
});

describe("write isolation (ChangelogService)", () => {
  it("a per-tenant token resolves only to its own tenant", async () => {
    const conecta = await resolveTenantByToken(DEV_TOKENS.conecta);
    const everban = await resolveTenantByToken(DEV_TOKENS.everban);

    expect(conecta?.tenantId).toBe(CONECTA);
    expect(everban?.tenantId).toBe(EVERBAN);
    expect(conecta?.tenantId).not.toBe(everban?.tenantId);

    // An unknown token grants nothing — the API would 401.
    expect(await resolveTenantByToken("ark_bogus_token")).toBeNull();
    expect(await resolveTenantByToken(null)).toBeNull();
  });

  it("createEntry + upsertTicket write only to the given tenant", async () => {
    await svc.createEntry({ tenantId: CONECTA, date: TEST_DATE, summary: "Test release" });
    const ticket = await svc.upsertTicket(baseTicket);
    expect(ticket.code).toBe(TEST_CODE);
    expect(ticket.tenantId).toBe(CONECTA);

    // Visible to Conecta's session, invisible to Everban's (RLS read isolation).
    const seenByConecta = await clientForTenant(CONECTA)
      .from("tickets")
      .select("code")
      .eq("code", TEST_CODE);
    const seenByEverban = await clientForTenant(EVERBAN)
      .from("tickets")
      .select("code")
      .eq("code", TEST_CODE);

    expect(seenByConecta.data?.some((r) => r.code === TEST_CODE)).toBe(true);
    expect(seenByEverban.data?.length ?? 0).toBe(0);
  });

  it("writes are idempotent by natural key (no duplicates on retry)", async () => {
    await svc.createEntry({ tenantId: CONECTA, date: TEST_DATE, summary: "Test release v2" });
    await svc.upsertTicket({ ...baseTicket, summary: "v2" });
    await svc.upsertTicket({ ...baseTicket, summary: "v3" });

    const db = getServiceClient();
    const entries = await db
      .from("changelogs")
      .select("id")
      .eq("tenant_id", CONECTA)
      .eq("date", TEST_DATE);
    const tickets = await db
      .from("tickets")
      .select("id, summary")
      .eq("tenant_id", CONECTA)
      .eq("code", TEST_CODE);

    expect(entries.data?.length).toBe(1);
    expect(tickets.data?.length).toBe(1);
    expect(tickets.data?.[0].summary).toBe("v3"); // last write wins
  });

  it("rejects invalid input and writes to a missing entry", async () => {
    await expect(
      svc.createEntry({ tenantId: CONECTA, date: "not-a-date", summary: "x" }),
    ).rejects.toMatchObject({ code: "validation" satisfies ServiceErrorCode });

    await expect(
      svc.upsertTicket({ ...baseTicket, status: "bogus" }),
    ).rejects.toMatchObject({ code: "validation" satisfies ServiceErrorCode });

    await expect(
      svc.upsertTicket({ ...baseTicket, date: "2097-01-01" }),
    ).rejects.toMatchObject({ code: "not_found" satisfies ServiceErrorCode });
  });
});
