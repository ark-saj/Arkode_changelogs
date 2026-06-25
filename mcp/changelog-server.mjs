#!/usr/bin/env node
/**
 * Arkode Centro de Novedades — MCP server (Fase 2).
 *
 * A thin adapter over the tenant-scoped HTTP API. It holds one per-tenant token
 * per portal it can write to (never a global token), so the agent flow is
 * literally "first I identify the portal, then I write":
 *
 *   1. list_tenants    → which portals this server can write to
 *   2. select_tenant   → pick the active portal
 *   3. create_changelog / upsert_ticket → write to the active portal only
 *
 * Config (env):
 *   ARK_API_BASE_URL  default http://127.0.0.1:3000
 *   ARK_TOKENS        "conecta=ark_conecta_devtoken,everban=ark_everban_devtoken"
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const BASE_URL = process.env.ARK_API_BASE_URL ?? "http://127.0.0.1:3000";

function loadTokens() {
  const map = {};
  for (const pair of (process.env.ARK_TOKENS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)) {
    const i = pair.indexOf("=");
    if (i > 0) map[pair.slice(0, i).trim()] = pair.slice(i + 1).trim();
  }
  return map;
}

const TOKENS = loadTokens();
let activeSlug = Object.keys(TOKENS)[0] ?? null;

async function api(path, token, body, method = "POST") {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail = json.details ? ` ${JSON.stringify(json.details)}` : "";
    throw new Error((json.error ?? `HTTP ${res.status}`) + detail);
  }
  return json;
}

function activeToken() {
  if (!activeSlug) {
    throw new Error(
      "No tenant selected. Set ARK_TOKENS and call select_tenant first.",
    );
  }
  const token = TOKENS[activeSlug];
  if (!token) throw new Error(`No token configured for tenant "${activeSlug}".`);
  return token;
}

function ok(value) {
  return {
    content: [
      {
        type: "text",
        text: typeof value === "string" ? value : JSON.stringify(value, null, 2),
      },
    ],
  };
}

const server = new McpServer({ name: "arkode-changelog", version: "1.0.0" });

server.tool(
  "list_tenants",
  "List the tenant portals this server can write to, and which one is active.",
  {},
  async () => ok({ tenants: Object.keys(TOKENS), active: activeSlug }),
);

server.tool(
  "select_tenant",
  "Select the active tenant portal. Always call this before creating content.",
  { slug: z.string().describe('Tenant slug, e.g. "conecta".') },
  async ({ slug }) => {
    if (!TOKENS[slug]) {
      throw new Error(
        `Unknown tenant "${slug}". Available: ${Object.keys(TOKENS).join(", ") || "(none configured)"}`,
      );
    }
    activeSlug = slug;
    const who = await api("/api/v1/whoami", TOKENS[slug], null, "GET");
    return ok({ selected: slug, portal: who.tenant });
  },
);

server.tool(
  "create_changelog",
  "Create or update a dated release entry in the active portal. Idempotent by date. Copy must describe the user benefit, never the technical implementation.",
  {
    date: z.string().describe("Release date, YYYY-MM-DD."),
    summary: z
      .string()
      .describe("Short, warm, non-technical summary of the release."),
    title: z.string().optional().describe("Optional headline for the release."),
  },
  async (args) => ok(await api("/api/v1/changelog", activeToken(), args)),
);

server.tool(
  "upsert_ticket",
  "Add or update one user-facing change under a release date (the entry must exist). Idempotent by ticket code. Describe the benefit, never the implementation.",
  {
    date: z.string().describe("Release date the change belongs to."),
    code: z.string().describe('Stable code, e.g. "CRM-001".'),
    title: z.string(),
    summary: z.string().describe("One-line friendly summary."),
    status: z.enum(["new", "improvement", "fix", "optimization"]),
    categoryKey: z.string().describe('Category key, e.g. "crm".'),
    whatChanged: z.string().describe("¿Qué cambió? In plain language."),
    whyUseful: z.string().describe("¿Por qué es útil? The concrete benefit."),
    whereToFind: z
      .array(z.string())
      .describe('Breadcrumb, e.g. ["CRM","Oportunidades"].'),
    featured: z.boolean().optional().describe("Mark as a highlighted change."),
  },
  async (args) => ok(await api("/api/v1/tickets", activeToken(), args)),
);

const transport = new StdioServerTransport();
await server.connect(transport);
