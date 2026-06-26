#!/usr/bin/env node
/**
 * Arkode Centro de Novedades — CLI (Fase 2).
 *
 * The third adapter over the same tenant-scoped HTTP API. Like the MCP server,
 * it authenticates with a per-tenant token, so it can only write to that
 * tenant's portal.
 *
 *   node scripts/changelog-cli.mjs whoami --token <t>
 *   node scripts/changelog-cli.mjs create-changelog --token <t> \
 *        --date 2026-06-25 --summary "Mejoras de la semana" [--title "..."]
 *   node scripts/changelog-cli.mjs upsert-ticket --token <t> \
 *        --date 2026-06-25 --code CRM-001 --title "..." --summary "..." \
 *        --status improvement --category crm \
 *        --what-changed "..." --why-useful "..." \
 *        --where "CRM > Oportunidades" [--featured]
 *
 * Env: ARK_API_TOKEN, ARK_API_BASE_URL (default http://127.0.0.1:3000)
 */
const BASE_URL = process.env.ARK_API_BASE_URL ?? "http://127.0.0.1:3000";

function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next === undefined || next.startsWith("--")) out[key] = true;
      else out[key] = argv[++i];
    } else {
      out._.push(a);
    }
  }
  return out;
}

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

function need(value, name) {
  if (value === undefined || value === true) {
    console.error(`Missing --${name}`);
    process.exit(2);
  }
  return value;
}

const HELP = `Arkode changelog CLI

Commands:
  whoami             Show the tenant the token belongs to
  create-changelog   Create/update a dated release entry (idempotent by date)
  upsert-ticket      Add/update one user-facing change (idempotent by code)
  attach-screenshot  Attach a real capture to a ticket (--file <path> | --url <url>)

Auth: --token <t> or ARK_API_TOKEN.  Base URL: ARK_API_BASE_URL (default ${BASE_URL}).`;

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const cmd = args._[0];
  const token = args.token ?? process.env.ARK_API_TOKEN;

  if (!cmd || cmd === "help") {
    console.log(HELP);
    return;
  }

  if (cmd === "whoami") {
    const r = await api("/api/v1/whoami", need(token, "token"), null, "GET");
    console.log(JSON.stringify(r, null, 2));
    return;
  }

  if (cmd === "create-changelog") {
    const r = await api("/api/v1/changelog", need(token, "token"), {
      date: need(args.date, "date"),
      summary: need(args.summary, "summary"),
      title: typeof args.title === "string" ? args.title : undefined,
    });
    console.log(JSON.stringify(r, null, 2));
    return;
  }

  if (cmd === "upsert-ticket") {
    const r = await api("/api/v1/tickets", need(token, "token"), {
      date: need(args.date, "date"),
      code: need(args.code, "code"),
      title: need(args.title, "title"),
      summary: need(args.summary, "summary"),
      status: need(args.status, "status"),
      categoryKey: need(args.category, "category"),
      whatChanged: need(args["what-changed"], "what-changed"),
      whyUseful: need(args["why-useful"], "why-useful"),
      whereToFind:
        typeof args.where === "string"
          ? args.where.split(">").map((s) => s.trim()).filter(Boolean)
          : [],
      featured: args.featured === true || args.featured === "true",
    });
    console.log(JSON.stringify(r, null, 2));
    return;
  }

  if (cmd === "attach-screenshot") {
    const body = {
      ticketCode: need(args.ticket, "ticket"),
      caption: need(args.caption, "caption"),
    };
    if (typeof args.file === "string") {
      const { readFile } = await import("node:fs/promises");
      const bytes = await readFile(args.file);
      body.data = bytes.toString("base64");
      body.filename = args.file.split(/[\\/]/).pop();
    } else if (typeof args.url === "string") {
      body.url = args.url;
    } else {
      console.error("Provide --file <path> or --url <url>");
      process.exit(2);
    }
    if (typeof args.variant === "string") body.variant = args.variant;
    const r = await api("/api/v1/screenshots", need(token, "token"), body);
    console.log(JSON.stringify(r, null, 2));
    return;
  }

  console.error(`Unknown command "${cmd}".\n`);
  console.log(HELP);
  process.exit(2);
}

main().catch((e) => {
  console.error("Error:", e.message);
  process.exit(1);
});
