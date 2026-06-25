import { NextResponse } from "next/server";

import { ChangelogService } from "@/lib/services/changelog-service";
import { errorResponse, readJson, requireTenant } from "../_shared";

export const runtime = "nodejs";

/** Add or update one user-facing change under a release date. */
export async function POST(req: Request) {
  const tenant = await requireTenant(req);
  if (tenant instanceof NextResponse) return tenant;

  try {
    const body = await readJson(req);
    const ticket = await new ChangelogService().upsertTicket({
      ...body,
      tenantId: tenant.tenantId, // token wins — never the body
    });
    return NextResponse.json({ ok: true, ticket }, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}
