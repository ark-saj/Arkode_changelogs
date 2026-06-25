-- ============================================================================
--  0006 — Write layer + per-tenant API tokens (Fase 2)
-- ----------------------------------------------------------------------------
--  The agent/API write path lives behind ChangelogService, which uses the
--  Supabase service_role (bypasses RLS by design). Per §3.1 of docs/PLAN.md the
--  real write-isolation boundary is therefore the SERVICE (tenantId mandatory),
--  not RLS. This migration adds the two things that path needs:
--
--   1. Entry idempotency: one release per tenant per date, so the service can
--      upsert by (tenant_id, date). Tickets already have (tenant_id, code).
--   2. Per-tenant API tokens (not one global service token) so a leaked token
--      only ever writes to a single tenant — bounding the blast radius.
-- ============================================================================

create extension if not exists pgcrypto with schema extensions;

-- 1. Entry idempotency key.
alter table public.changelogs
  add constraint changelogs_tenant_date_key unique (tenant_id, date);

-- 2. Per-tenant API tokens. Only the SHA-256 hash is stored; the raw token is
--    shown once at creation time. service_role reads these to resolve a token
--    to its tenant; humans (authenticated/anon) never can — RLS is on with no
--    policy, so the table is invisible to everyone except service_role.
create table public.tenant_api_tokens (
  id         uuid primary key default gen_random_uuid(),
  tenant_id  uuid not null references public.tenants(id) on delete cascade,
  name       text not null default 'default',
  token_hash text not null unique,            -- hex sha256 of the raw token
  revoked    boolean not null default false,
  created_at timestamptz not null default now()
);
create index tenant_api_tokens_tenant_idx on public.tenant_api_tokens (tenant_id);

alter table public.tenant_api_tokens enable row level security;
-- (no policies on purpose: tokens are service_role-only)

-- service_role needs table privileges on this NEW table (the blanket grant in
-- 0003 only covered tables that existed then).
grant all on public.tenant_api_tokens to service_role;
