import { describe, expect, it } from "vitest";

import { signEmbedToken, verifyEmbedToken } from "@/lib/auth/embed-token";
import { readChangelogData } from "@/lib/data/changelog-read";
import { getServiceClient } from "@/lib/supabase/service";

/**
 * Embed access (Fase 4). The signed token is the only thing authorizing the
 * public embed view, so it must round-trip exactly, reject tampering, and name
 * one specific tenant. The read it gates returns only that tenant's data.
 */
describe("embed token", () => {
  it("round-trips a slug", () => {
    const token = signEmbedToken("conecta");
    expect(verifyEmbedToken(token)).toBe("conecta");
  });

  it("distinguishes tenants (a conecta token is not an everban token)", () => {
    expect(verifyEmbedToken(signEmbedToken("everban"))).toBe("everban");
    expect(verifyEmbedToken(signEmbedToken("conecta"))).not.toBe("everban");
  });

  it("rejects tampering and garbage", () => {
    const token = signEmbedToken("conecta");
    const tampered = token.slice(0, -2) + (token.endsWith("aa") ? "bb" : "aa");
    expect(verifyEmbedToken(tampered)).toBeNull();
    expect(verifyEmbedToken("conecta.not-a-signature")).toBeNull();
    expect(verifyEmbedToken("")).toBeNull();
    expect(verifyEmbedToken(null)).toBeNull();
    expect(verifyEmbedToken(undefined)).toBeNull();
  });
});

describe("embed read (service client, no session)", () => {
  it("returns only the requested tenant's changelog", async () => {
    const data = await readChangelogData(getServiceClient(), "conecta");
    expect(data.tenant?.slug).toBe("conecta");
    expect(data.entries.length).toBeGreaterThan(0);
  });

  it("returns an empty payload for an unknown tenant", async () => {
    const data = await readChangelogData(getServiceClient(), "no-such-tenant");
    expect(data.tenant).toBeNull();
    expect(data.entries).toEqual([]);
  });
});
