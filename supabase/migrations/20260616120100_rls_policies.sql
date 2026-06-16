-- ============================================================================
--  0002 — Row Level Security (tenant isolation)
-- ----------------------------------------------------------------------------
--  Read isolation for authenticated users is enforced by RLS via the JWT claim
--  `tenant_id` (set by the company login in Fase 1).
--
--  Writes have NO policy on purpose: only the service_role (which bypasses RLS)
--  can write. The real write-isolation boundary is ChangelogService — see §3.1
--  of docs/PLAN.md. RLS is the read guard, not the write guard.
--
--  NOTE: the `anon` SELECT policies below are a TEMPORARY demo affordance so the
--  current portal (anon key, no login yet) can read. Fase 1 removes them and
--  routes every read through an authenticated, tenant-scoped session.
-- ============================================================================

-- Resolve the caller's tenant from the JWT claim set by PostgREST per request.
create or replace function public.current_tenant_id()
returns uuid
language sql
stable
as $$
  select nullif(
    current_setting('request.jwt.claims', true)::jsonb ->> 'tenant_id',
    ''
  )::uuid
$$;

-- Table-level privileges. RLS only filters rows AFTER these grants pass, so the
-- Data API roles need SELECT (read-only; writes stay with service_role).
grant usage on schema public to anon, authenticated;
grant select on all tables in schema public to anon, authenticated;
alter default privileges in schema public
  grant select on tables to anon, authenticated;

alter table public.tenants     enable row level security;
alter table public.categories  enable row level security;
alter table public.changelogs  enable row level security;
alter table public.tickets     enable row level security;
alter table public.screenshots enable row level security;

-- Tenants & categories: metadata, readable by everyone (not sensitive).
create policy "tenants readable"    on public.tenants    for select using (true);
create policy "categories readable" on public.categories for select using (true);

-- Changelogs: authenticated users see ONLY their tenant; anon sees all (demo).
create policy "changelogs by tenant (authenticated)"
  on public.changelogs for select to authenticated
  using (tenant_id = public.current_tenant_id());
create policy "changelogs demo (anon)"
  on public.changelogs for select to anon
  using (true);

-- Tickets: same tenant scoping.
create policy "tickets by tenant (authenticated)"
  on public.tickets for select to authenticated
  using (tenant_id = public.current_tenant_id());
create policy "tickets demo (anon)"
  on public.tickets for select to anon
  using (true);

-- Screenshots: same tenant scoping (tenant_id denormalized for this).
create policy "screenshots by tenant (authenticated)"
  on public.screenshots for select to authenticated
  using (tenant_id = public.current_tenant_id());
create policy "screenshots demo (anon)"
  on public.screenshots for select to anon
  using (true);
