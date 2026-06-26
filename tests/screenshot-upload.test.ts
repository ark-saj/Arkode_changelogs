import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { ChangelogService } from "@/lib/services/changelog-service";
import { getServiceClient } from "@/lib/supabase/service";

/**
 * Screenshot upload (Fase 3). An agent deposits a real image through the write
 * service; it must land in THIS tenant's media folder, be publicly reachable,
 * and re-uploading the same caption must stay idempotent (one row, overwritten
 * file) — never an orphan or a cross-tenant write.
 */
const CONECTA = "11111111-1111-1111-1111-111111111111";
const TEST_DATE = "2099-12-30";
const TEST_CODE = "SHOT-001";
const CAPTION = "Pantalla de oportunidades";

// 1x1 transparent PNG.
const PNG_1x1 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";

const svc = new ChangelogService();

beforeAll(async () => {
  await svc.createEntry({ tenantId: CONECTA, date: TEST_DATE, summary: "Capturas" });
  await svc.upsertTicket({
    tenantId: CONECTA,
    date: TEST_DATE,
    code: TEST_CODE,
    title: "Cambio con captura",
    summary: "Tiene una imagen real",
    status: "new",
    categoryKey: "crm",
    whatChanged: "algo",
    whyUseful: "sirve",
    whereToFind: ["CRM"],
  });
});

afterAll(async () => {
  // Cascade removes the ticket + screenshot rows.
  await getServiceClient()
    .from("changelogs")
    .delete()
    .eq("tenant_id", CONECTA)
    .eq("date", TEST_DATE);
});

describe("screenshot upload (agent path)", () => {
  it("uploads a real file into the tenant's media folder and serves it", async () => {
    const result = await svc.attachScreenshot({
      tenantId: CONECTA,
      ticketCode: TEST_CODE,
      caption: CAPTION,
      data: PNG_1x1,
      filename: "captura.png",
      contentType: "image/png",
    });
    expect(result.updated).toBe(false);

    const db = getServiceClient();
    const { data: row } = await db
      .from("screenshots")
      .select("url, kind, tenant_id")
      .eq("id", result.id)
      .single();

    expect(row?.tenant_id).toBe(CONECTA);
    expect(row?.kind).toBe("image");
    // The public URL is scoped to this tenant's folder — the isolation boundary.
    expect(row?.url).toContain(`/tenant-media/${CONECTA}/`);

    // And it is actually served from Storage.
    const res = await fetch(row!.url as string);
    expect(res.status).toBe(200);
  });

  it("re-uploading the same caption stays idempotent (one row)", async () => {
    const again = await svc.attachScreenshot({
      tenantId: CONECTA,
      ticketCode: TEST_CODE,
      caption: CAPTION,
      data: PNG_1x1,
      filename: "captura.png",
      contentType: "image/png",
    });
    expect(again.updated).toBe(true);

    const db = getServiceClient();
    const { data: ticket } = await db
      .from("tickets")
      .select("id")
      .eq("tenant_id", CONECTA)
      .eq("code", TEST_CODE)
      .single();
    const { data: shots } = await db
      .from("screenshots")
      .select("id")
      .eq("ticket_id", ticket!.id)
      .eq("caption", CAPTION);

    expect(shots?.length).toBe(1);
  });

  it("rejects oversized inline media", async () => {
    // ~10 MB of base64 → over the 9 MB decoded cap.
    const huge = "A".repeat(10 * 1024 * 1024 * 2);
    await expect(
      svc.attachScreenshot({
        tenantId: CONECTA,
        ticketCode: TEST_CODE,
        caption: "Demasiado grande",
        data: huge,
        filename: "big.png",
        contentType: "image/png",
      }),
    ).rejects.toMatchObject({ code: "validation" });
  });
});
