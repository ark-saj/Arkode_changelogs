// Seed demo auth users and per-tenant API tokens, mapped to tenants (local dev).
// Run after `supabase start` / `db reset`:  npm run db:seed-auth
// Also imported by the isolation tests so they are self-contained.
import { createHash } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const URL = process.env.SUPABASE_URL ?? "http://127.0.0.1:54321";
const SERVICE_ROLE =
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU";

export const DEMO_USERS = [
  { email: "admin@conecta.test", password: "demo12345", tenantSlug: "conecta", role: "admin" },
  { email: "admin@everban.test", password: "demo12345", tenantSlug: "everban", role: "admin" },
  { email: "member@conecta.test", password: "demo12345", tenantSlug: "conecta", role: "member" },
];

// Well-known LOCAL per-tenant write tokens (dev/test only). Each token can only
// write to its own tenant — that is the Fase 2 §3.1 isolation boundary.
export const DEV_TOKENS = {
  conecta: "ark_conecta_devtoken",
  everban: "ark_everban_devtoken",
};

const hashToken = (raw) => createHash("sha256").update(raw.trim()).digest("hex");

export async function seedAuth() {
  const admin = createClient(URL, SERVICE_ROLE, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  for (const u of DEMO_USERS) {
    const { data: tenant, error: tErr } = await admin
      .from("tenants")
      .select("id")
      .eq("slug", u.tenantSlug)
      .single();
    if (tErr) throw new Error(`tenant ${u.tenantSlug}: ${tErr.message}`);

    let userId;
    const { data: created, error: cErr } = await admin.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
    });
    if (cErr) {
      if (!/already|registered|exists/i.test(cErr.message)) throw cErr;
      const { data: list } = await admin.auth.admin.listUsers({ perPage: 1000 });
      userId = list.users.find((x) => x.email === u.email)?.id;
    } else {
      userId = created.user.id;
    }
    if (!userId) throw new Error(`could not resolve user id for ${u.email}`);

    const { error: mErr } = await admin
      .from("tenant_users")
      .upsert(
        { user_id: userId, tenant_id: tenant.id, role: u.role ?? "member" },
        { onConflict: "user_id,tenant_id" },
      );
    if (mErr) throw new Error(`membership ${u.email}: ${mErr.message}`);

    console.log(`✓ ${u.email} → ${u.tenantSlug} (${u.role ?? "member"})`);
  }
}

/** Upsert one dev write-token per tenant (idempotent by token_hash). */
export async function seedApiTokens() {
  const admin = createClient(URL, SERVICE_ROLE, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  for (const [slug, raw] of Object.entries(DEV_TOKENS)) {
    const { data: tenant, error: tErr } = await admin
      .from("tenants")
      .select("id")
      .eq("slug", slug)
      .single();
    if (tErr) throw new Error(`tenant ${slug}: ${tErr.message}`);

    const { error } = await admin
      .from("tenant_api_tokens")
      .upsert(
        { tenant_id: tenant.id, name: "dev", token_hash: hashToken(raw) },
        { onConflict: "token_hash" },
      );
    if (error) throw new Error(`token ${slug}: ${error.message}`);
    console.log(`✓ token "${raw}" → ${slug}`);
  }
}

// CLI entry (robust on Windows paths)
if (process.argv[1] && process.argv[1].replace(/\\/g, "/").endsWith("scripts/seed-auth.mjs")) {
  Promise.all([seedAuth(), seedApiTokens()])
    .then(() => {
      console.log("Auth + token seed complete.");
      process.exit(0);
    })
    .catch((e) => {
      console.error("Seed failed:", e.message);
      process.exit(1);
    });
}
