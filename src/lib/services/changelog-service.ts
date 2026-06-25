import { z } from "zod";

import { getServiceClient } from "@/lib/supabase/service";

/**
 * ChangelogService — the single write boundary for changelog content.
 *
 * Every method requires an explicit `tenantId` and validates its input with
 * Zod before touching the database. Because the underlying client uses the
 * service_role (which bypasses RLS), THIS is the tenant-isolation boundary for
 * writes — not RLS (see §3.1 of docs/PLAN.md). Writes are idempotent by natural
 * key so agent retries never duplicate:
 *   - entries  → (tenant_id, date)
 *   - tickets  → (tenant_id, code)
 *
 * Adapters (HTTP API, MCP, CLI) are thin shells over this service. They resolve
 * the tenant from a per-tenant token and pass that tenantId down — they never
 * let the caller choose an arbitrary tenant.
 */

export const TICKET_STATUSES = [
  "new",
  "improvement",
  "fix",
  "optimization",
] as const;

const SCREENSHOT_VARIANTS = [
  "form",
  "list",
  "dashboard",
  "kanban",
  "report",
] as const;

// Version-agnostic validators (regex/enums) — avoids zod method-deprecation
// churn and keeps the contract explicit.
const uuid = z
  .string()
  .regex(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    "tenantId must be a UUID",
  );
const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "date must be YYYY-MM-DD");

const EntryInput = z.object({
  tenantId: uuid,
  date: isoDate,
  title: z.string().trim().min(1).optional(),
  summary: z.string().trim().min(1, "summary is required"),
});

const TicketInput = z.object({
  tenantId: uuid,
  date: isoDate, // the release entry this ticket belongs to (must exist)
  code: z.string().trim().min(1).max(40),
  title: z.string().trim().min(1),
  summary: z.string().trim().min(1),
  status: z.enum(TICKET_STATUSES),
  categoryKey: z.string().trim().min(1),
  whatChanged: z.string().trim().min(1),
  whyUseful: z.string().trim().min(1),
  whereToFind: z.array(z.string().trim().min(1)).default([]),
  featured: z.boolean().optional(),
});

const ScreenshotInput = z.object({
  tenantId: uuid,
  ticketCode: z.string().trim().min(1),
  caption: z.string().trim().min(1),
  variant: z.enum(SCREENSHOT_VARIANTS).optional(),
  kind: z.enum(["image", "video"]).optional(),
  url: z.string().trim().min(1).optional(),
  poster: z.string().trim().min(1).optional(),
  seed: z.number().int().optional(),
});

export type EntryInputType = z.infer<typeof EntryInput>;
export type TicketInputType = z.infer<typeof TicketInput>;
export type ScreenshotInputType = z.infer<typeof ScreenshotInput>;

/* ------------------------------------------------------------------ */
/*  Errors — adapters map these to HTTP status / exit codes.          */
/* ------------------------------------------------------------------ */
export type ServiceErrorCode = "validation" | "not_found" | "conflict" | "db";

export class ServiceError extends Error {
  code: ServiceErrorCode;
  details?: unknown;
  constructor(code: ServiceErrorCode, message: string, details?: unknown) {
    super(message);
    this.name = "ServiceError";
    this.code = code;
    this.details = details;
  }
}

function parse<T>(schema: z.ZodType<T>, raw: unknown): T {
  const result = schema.safeParse(raw);
  if (!result.success) {
    throw new ServiceError(
      "validation",
      "Invalid input.",
      result.error.issues.map((i) => ({
        path: i.path.join("."),
        message: i.message,
      })),
    );
  }
  return result.data;
}

interface PgError {
  code?: string;
  message: string;
}
function dbError(error: PgError): ServiceError {
  // 23503 = FK violation (e.g. unknown category_key) → treat as not_found.
  if (error.code === "23503") {
    return new ServiceError("not_found", error.message, error);
  }
  return new ServiceError("db", error.message, error);
}

/* ------------------------------------------------------------------ */
/*  Service                                                           */
/* ------------------------------------------------------------------ */
export class ChangelogService {
  private db = getServiceClient();

  /** Create or update a dated release entry. Idempotent by (tenant_id, date). */
  async createEntry(raw: unknown) {
    const input = parse(EntryInput, raw);
    const { data, error } = await this.db
      .from("changelogs")
      .upsert(
        {
          tenant_id: input.tenantId,
          date: input.date,
          title: input.title ?? null,
          summary: input.summary,
        },
        { onConflict: "tenant_id,date" },
      )
      .select("id, date")
      .single();
    if (error) throw dbError(error);
    return {
      id: data.id as string,
      date: data.date as string,
      tenantId: input.tenantId,
    };
  }

  /** Add or update one user-facing change. Idempotent by (tenant_id, code).
   *  The release entry (by date) must already exist. */
  async upsertTicket(raw: unknown) {
    const input = parse(TicketInput, raw);

    const entry = await this.db
      .from("changelogs")
      .select("id")
      .eq("tenant_id", input.tenantId)
      .eq("date", input.date)
      .maybeSingle();
    if (entry.error) throw dbError(entry.error);
    if (!entry.data) {
      throw new ServiceError(
        "not_found",
        `No release entry exists for ${input.date}. Create the changelog first.`,
      );
    }

    const { data, error } = await this.db
      .from("tickets")
      .upsert(
        {
          tenant_id: input.tenantId,
          changelog_id: entry.data.id,
          code: input.code,
          title: input.title,
          summary: input.summary,
          status: input.status,
          category_key: input.categoryKey,
          what_changed: input.whatChanged,
          why_useful: input.whyUseful,
          where_to_find: input.whereToFind,
          featured: input.featured ?? false,
        },
        { onConflict: "tenant_id,code" },
      )
      .select("id, code")
      .single();
    if (error) throw dbError(error);
    return {
      id: data.id as string,
      code: data.code as string,
      tenantId: input.tenantId,
    };
  }

  /** Attach a screenshot to a ticket. Idempotent by (ticket, caption). */
  async attachScreenshot(raw: unknown) {
    const input = parse(ScreenshotInput, raw);

    const ticket = await this.db
      .from("tickets")
      .select("id")
      .eq("tenant_id", input.tenantId)
      .eq("code", input.ticketCode)
      .maybeSingle();
    if (ticket.error) throw dbError(ticket.error);
    if (!ticket.data) {
      throw new ServiceError(
        "not_found",
        `No ticket "${input.ticketCode}" exists for this tenant.`,
      );
    }

    const row = {
      tenant_id: input.tenantId,
      ticket_id: ticket.data.id,
      caption: input.caption,
      variant: input.variant ?? null,
      kind: input.kind ?? null,
      url: input.url ?? null,
      poster: input.poster ?? null,
      seed: input.seed ?? null,
    };

    const existing = await this.db
      .from("screenshots")
      .select("id")
      .eq("tenant_id", input.tenantId)
      .eq("ticket_id", ticket.data.id)
      .eq("caption", input.caption)
      .maybeSingle();
    if (existing.error) throw dbError(existing.error);

    if (existing.data) {
      const { data, error } = await this.db
        .from("screenshots")
        .update(row)
        .eq("id", existing.data.id)
        .select("id")
        .single();
      if (error) throw dbError(error);
      return { id: data.id as string, ticketCode: input.ticketCode, updated: true };
    }

    const { data, error } = await this.db
      .from("screenshots")
      .insert(row)
      .select("id")
      .single();
    if (error) throw dbError(error);
    return { id: data.id as string, ticketCode: input.ticketCode, updated: false };
  }
}
