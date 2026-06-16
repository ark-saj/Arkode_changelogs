-- ============================================================================
--  0003 — Auth ↔ tenant membership + RLS by authenticated user
-- ----------------------------------------------------------------------------
--  Fase 1: real logins. A user belongs to one (or more) tenants via
--  `tenant_users`. RLS now resolves the caller's tenant from auth.uid() — no
--  custom JWT hook needed. The earlier claim-based path is kept so the
--  forged-JWT isolation test (Fase 0.5) still passes.
--
--  The temporary `anon` read policies are removed: every read now goes through
--  an authenticated, tenant-scoped session.
-- ============================================================================

create table public.tenant_users (
  user_id    uuid not null references auth.users(id) on delete cascade,
  tenant_id  uuid not null references public.tenants(id) on delete cascade,
  role       text not null default 'member',
  created_at timestamptz not null default now(),
  primary key (user_id, tenant_id)
);

alter table public.tenant_users enable row level security;
grant select on public.tenant_users to authenticated;

-- A user can see only their own memberships.
create policy "own memberships"
  on public.tenant_users for select to authenticated
  using (user_id = auth.uid());

-- SECURITY DEFINER so the policy subquery can read tenant_users without
-- recursing through its own RLS.
create or replace function public.auth_tenant_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select tenant_id from public.tenant_users where user_id = auth.uid()
$$;

-- ---- Extend read policies: claim path (test) OR membership path (real users)
drop policy "changelogs by tenant (authenticated)" on public.changelogs;
create policy "changelogs by tenant (authenticated)"
  on public.changelogs for select to authenticated
  using (
    tenant_id = public.current_tenant_id()
    or tenant_id in (select public.auth_tenant_ids())
  );

drop policy "tickets by tenant (authenticated)" on public.tickets;
create policy "tickets by tenant (authenticated)"
  on public.tickets for select to authenticated
  using (
    tenant_id = public.current_tenant_id()
    or tenant_id in (select public.auth_tenant_ids())
  );

drop policy "screenshots by tenant (authenticated)" on public.screenshots;
create policy "screenshots by tenant (authenticated)"
  on public.screenshots for select to authenticated
  using (
    tenant_id = public.current_tenant_id()
    or tenant_id in (select public.auth_tenant_ids())
  );

-- ---- Remove the temporary demo anon read access (login is required now)
drop policy "changelogs demo (anon)"  on public.changelogs;
drop policy "tickets demo (anon)"      on public.tickets;
drop policy "screenshots demo (anon)"  on public.screenshots;

-- service_role (used by the admin/seed scripts and the future write service)
-- needs table privileges — bypassing RLS does not grant table access.
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;
