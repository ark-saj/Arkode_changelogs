import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { seedAuth } from "../scripts/seed-auth.mjs";

/**
 * Authorization for the self-service tenant logo (Fase 2, first write story).
 * Proves the governance rule: only an ADMIN of a tenant can change that tenant's
 * logo — enforced by Storage RLS + the tenants UPDATE policy. Members and admins
 * of other tenants are denied.
 *
 * Requires local Supabase running + `npm run db:seed-auth`.
 */
const URL = process.env.SUPABASE_URL ?? "http://127.0.0.1:54321";
const ANON =
  process.env.SUPABASE_ANON_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";

const CONECTA = "11111111-1111-1111-1111-111111111111";

// 1×1 transparent PNG.
const PNG = Uint8Array.from(
  atob(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  ),
  (c) => c.charCodeAt(0),
);
const logo = () => new Blob([PNG], { type: "image/png" });

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

afterAll(async () => {
  // Restore clean state: these tests mutate conecta's logo, which would
  // otherwise leave a broken image in the dev portal until the next db reset.
  const c = await signIn("admin@conecta.test", "demo12345");
  await c.from("tenants").update({ logo: null }).eq("id", CONECTA);
  await c.storage.from("tenant-logos").remove([`${CONECTA}/logo.png`]);
});

describe("tenant logo — admin-only authorization", () => {
  it("an admin can upload to their own tenant's folder", async () => {
    const c = await signIn("admin@conecta.test", "demo12345");
    const { error } = await c.storage
      .from("tenant-logos")
      .upload(`${CONECTA}/logo.png`, logo(), {
        upsert: true,
        contentType: "image/png",
      });
    expect(error).toBeNull();
  });

  it("an admin can update their own tenant's logo column", async () => {
    const c = await signIn("admin@conecta.test", "demo12345");
    const { data, error } = await c
      .from("tenants")
      .update({ logo: "http://127.0.0.1:54321/test.png" })
      .eq("id", CONECTA)
      .select("id");
    expect(error).toBeNull();
    expect(data?.length).toBe(1);
  });

  it("a member CANNOT upload a logo", async () => {
    const c = await signIn("member@conecta.test", "demo12345");
    const { error } = await c.storage
      .from("tenant-logos")
      .upload(`${CONECTA}/logo.png`, logo(), {
        upsert: true,
        contentType: "image/png",
      });
    expect(error).not.toBeNull();
  });

  it("a member CANNOT update the logo column (RLS blocks the row)", async () => {
    const c = await signIn("member@conecta.test", "demo12345");
    const { data } = await c
      .from("tenants")
      .update({ logo: "http://evil/x.png" })
      .eq("id", CONECTA)
      .select("id");
    expect(data?.length ?? 0).toBe(0);
  });

  it("an admin of another tenant CANNOT write to this tenant's folder", async () => {
    const c = await signIn("admin@everban.test", "demo12345");
    const { error } = await c.storage
      .from("tenant-logos")
      .upload(`${CONECTA}/hijack.png`, logo(), {
        upsert: true,
        contentType: "image/png",
      });
    expect(error).not.toBeNull();
  });
});
