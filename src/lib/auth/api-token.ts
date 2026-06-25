import { createHash } from "node:crypto";

import { getServiceClient } from "@/lib/supabase/service";

/**
 * Per-tenant API token resolution (Fase 2, §3.1).
 *
 * Agents authenticate to the write API with a bearer token that belongs to ONE
 * tenant. We store only the SHA-256 hash; resolving a token returns its tenant
 * (or null). The HTTP API then passes that tenantId to ChangelogService, so a
 * token can only ever write to its own tenant — the isolation invariant.
 */

export function hashToken(raw: string): string {
  return createHash("sha256").update(raw.trim()).digest("hex");
}

export interface TokenTenant {
  tenantId: string;
  slug: string;
  name: string;
}

export async function resolveTenantByToken(
  raw: string | null | undefined,
): Promise<TokenTenant | null> {
  if (!raw || !raw.trim()) return null;

  const db = getServiceClient();
  const { data, error } = await db
    .from("tenant_api_tokens")
    .select("tenant_id, tenants(slug, name)")
    .eq("token_hash", hashToken(raw))
    .eq("revoked", false)
    .maybeSingle();
  if (error || !data) return null;

  // PostgREST embeds the FK target; with a single FK it is an object.
  const tenant = data.tenants as unknown as { slug: string; name: string } | null;
  if (!tenant) return null;
  return {
    tenantId: data.tenant_id as string,
    slug: tenant.slug,
    name: tenant.name,
  };
}

/** Pull the bearer token out of an `Authorization: Bearer <token>` header. */
export function bearerFrom(req: Request): string | null {
  const header = req.headers.get("authorization") ?? "";
  const match = /^Bearer\s+(.+)$/i.exec(header);
  return match ? match[1].trim() : null;
}
