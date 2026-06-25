import { NextResponse } from "next/server";

import { ChangelogService } from "@/lib/services/changelog-service";
import { errorResponse, readJson, requireTenant } from "../_shared";

export const runtime = "nodejs";

/** Create or update a dated release entry for the token's tenant. */
export async function POST(req: Request) {
  const tenant = await requireTenant(req);
  if (tenant instanceof NextResponse) return tenant;

  try {
    const body = await readJson(req);
    const entry = await new ChangelogService().createEntry({
      ...body,
      tenantId: tenant.tenantId, // token wins — never the body
    });
    return NextResponse.json({ ok: true, entry }, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}
