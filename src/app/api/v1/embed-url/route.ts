import { NextResponse } from "next/server";

import { signEmbedToken } from "@/lib/auth/embed-token";
import { requireTenant } from "../_shared";

export const runtime = "nodejs";

/**
 * Mint a public embed URL for the token's tenant (Fase 4). The caller proves
 * tenant ownership with their write token; we return a read-only embed link
 * (signed token) that can be dropped into an Odoo iframe.
 */
export async function GET(req: Request) {
  const tenant = await requireTenant(req);
  if (tenant instanceof NextResponse) return tenant;

  const base = process.env.APP_PUBLIC_URL ?? new URL(req.url).origin;
  const token = signEmbedToken(tenant.slug);
  const url = `${base}/embed/${tenant.slug}?token=${encodeURIComponent(token)}`;

  return NextResponse.json({ tenant: tenant.slug, url, token });
}
