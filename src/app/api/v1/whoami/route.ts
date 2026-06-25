import { NextResponse } from "next/server";

import { requireTenant } from "../_shared";

export const runtime = "nodejs";

/** Returns the tenant the bearer token belongs to — handy to verify a token. */
export async function GET(req: Request) {
  const tenant = await requireTenant(req);
  if (tenant instanceof NextResponse) return tenant;
  return NextResponse.json({
    tenant: { id: tenant.tenantId, slug: tenant.slug, name: tenant.name },
  });
}
