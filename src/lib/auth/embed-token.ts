import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Read-only embed tokens (Fase 4 — Odoo embed PoC).
 *
 * A signed, stateless token that authorizes showing ONE tenant's changelog in a
 * public, chrome-less embed view (e.g. inside an Odoo iframe). It carries only
 * the tenant slug and an HMAC — no DB lookup, stable for a long-lived iframe.
 *
 * Scope is read-only by construction: the embed route only reads. This is NOT a
 * write credential and must never be confused with the per-tenant API tokens.
 * Revocation = rotate EMBED_TOKEN_SECRET (acceptable for a PoC).
 */

// Local dev fallback. Production MUST set EMBED_TOKEN_SECRET.
const DEV_SECRET = "arkode-local-embed-secret-change-in-prod";

function secret(): string {
  return process.env.EMBED_TOKEN_SECRET ?? DEV_SECRET;
}

function b64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function sign(payload: string): string {
  return b64url(createHmac("sha256", secret()).update(payload).digest());
}

/** Mint an embed token for a tenant slug. */
export function signEmbedToken(slug: string): string {
  const payload = b64url(slug);
  return `${payload}.${sign(payload)}`;
}

/** Verify a token; returns the tenant slug it authorizes, or null. */
export function verifyEmbedToken(token: string | null | undefined): string | null {
  if (!token) return null;
  const dot = token.indexOf(".");
  if (dot <= 0) return null;

  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = sign(payload);

  // Timing-safe compare of equal-length buffers.
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const slug = Buffer.from(
      payload.replace(/-/g, "+").replace(/_/g, "/"),
      "base64",
    ).toString("utf8");
    return slug || null;
  } catch {
    return null;
  }
}
