import { NextResponse } from "next/server";

import { ServiceError } from "@/lib/services/changelog-service";
import {
  bearerFrom,
  resolveTenantByToken,
  type TokenTenant,
} from "@/lib/auth/api-token";

/**
 * Shared plumbing for the tenant-scoped write API (Fase 2).
 *
 * Every route resolves the tenant from the bearer token and ALWAYS uses that
 * tenantId — the request body can never choose a tenant. That is the write
 * isolation boundary (§3.1): a tenant-A token simply cannot address tenant B.
 */

export async function requireTenant(
  req: Request,
): Promise<TokenTenant | NextResponse> {
  const tenant = await resolveTenantByToken(bearerFrom(req));
  if (!tenant) {
    return NextResponse.json(
      { error: "Invalid or missing API token." },
      { status: 401 },
    );
  }
  return tenant;
}

export function errorResponse(err: unknown): NextResponse {
  if (err instanceof ServiceError) {
    const status =
      err.code === "validation"
        ? 422
        : err.code === "not_found"
          ? 404
          : err.code === "conflict"
            ? 409
            : 500;
    return NextResponse.json(
      { error: err.message, code: err.code, details: err.details },
      { status },
    );
  }
  // Unexpected: log the full context server-side, return a generic message.
  console.error("[api/v1] unexpected error:", err);
  return NextResponse.json({ error: "Internal error." }, { status: 500 });
}

export async function readJson(req: Request): Promise<Record<string, unknown>> {
  try {
    const body = await req.json();
    return body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}
