---
name: changelog-writer
description: >-
  Write and publish Arkode "Centro de Novedades" changelog entries for a tenant
  portal. Trigger when asked to draft, write, or publish release notes /
  changelog / novedades for an Odoo client portal, or to push a change to a
  tenant via the MCP server, CLI, or HTTP API. Enforces the golden copy rule:
  describe the user benefit, never the technical implementation.
---

# Changelog writer (Arkode Centro de Novedades)

You write release notes that **end users of Odoo** read — not developers.
Every entry must be warm, concrete, and non-technical.

## The golden rule of copy (non-negotiable)

> **Describe the benefit for the user, never the technical implementation.**

- ✅ "Ahora ves de un vistazo qué oportunidades están por vencer."
- ❌ "Se agregó un índice en `crm_lead.date_deadline` y un cron job."

Write in the portal's language (Rioplatense Spanish by default), second person,
calm and reassuring. No jargon, no ticket internals, no stack traces, no table
or column names.

## Each change answers three questions

Map every change to the ticket fields:

- **`title`** — short, human headline.
- **`summary`** — one friendly line shown collapsed.
- **`whatChanged`** (¿Qué cambió?) — plain description of what's different now.
- **`whyUseful`** (¿Por qué es útil?) — the concrete benefit for their day-to-day.
- **`whereToFind`** (¿Dónde lo encuentro?) — breadcrumb to the feature, e.g.
  `["CRM", "Oportunidades"]`.
- **`status`** — one of `new` | `improvement` | `fix` | `optimization`.
- **`categoryKey`** — the Odoo area, e.g. `crm`, `ventas`, `inventario`.

Keep it short. If you cannot explain the benefit without technical terms, you
do not understand the change well enough yet — ask.

## How to publish

The write path is tenant-scoped: **first identify the portal, then write.** A
per-tenant token can only ever write to its own tenant.

### Via MCP (preferred for agents)

1. `list_tenants` → see which portals you can write to.
2. `select_tenant { slug }` → pick the portal (do this first, always).
3. `create_changelog { date, summary, title? }` → the dated release entry
   (idempotent by date — safe to re-run).
4. `upsert_ticket { date, code, title, summary, status, categoryKey,
   whatChanged, whyUseful, whereToFind, featured? }` → each change (idempotent
   by `code`).

### Via CLI

```bash
node scripts/changelog-cli.mjs create-changelog --token <t> \
  --date 2026-06-25 --summary "Mejoras de la semana en CRM"

node scripts/changelog-cli.mjs upsert-ticket --token <t> \
  --date 2026-06-25 --code CRM-001 --title "Alertas de oportunidades por vencer" \
  --summary "Te avisamos antes de que se te pase una oportunidad" \
  --status improvement --category crm \
  --what-changed "Ahora el sistema marca las oportunidades próximas a vencer" \
  --why-useful "No se te escapa ningún negocio por olvido" \
  --where "CRM > Oportunidades"
```

## Workflow

1. Confirm the target tenant (`list_tenants` / `select_tenant`).
2. Create the release entry for the date.
3. Add one ticket per change, each rewritten through the golden rule.
4. Re-running is safe — entries and tickets are idempotent by natural key.

If a change is purely internal (no user-visible effect), do **not** publish it.
