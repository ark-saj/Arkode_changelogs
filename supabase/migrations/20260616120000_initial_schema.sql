-- ============================================================================
--  0001 — Initial schema (multi-tenant)
-- ----------------------------------------------------------------------------
--  Tenancy from day one: every changelog / ticket / screenshot belongs to a
--  tenant. Natural keys (changelog date, ticket "CRM-001" code) are NOT globally
--  unique anymore — two companies can both have a "CRM-001" — so rows use uuid
--  surrogate PKs and uniqueness is scoped per tenant.
-- ============================================================================

-- Tenants (companies). Carries branding so Fase 1 can drop NEXT_PUBLIC_BRAND.
create table public.tenants (
  id         uuid primary key default gen_random_uuid(),
  slug       text unique not null,           -- routing key, e.g. "conecta"
  name       text not null,
  tagline    text not null default 'Centro de Novedades',
  logo       text,                            -- path/URL to wordmark (optional)
  brand      jsonb not null default '{}'::jsonb, -- CSS var overrides (optional)
  created_at timestamptz not null default now()
);

-- Categories are global (Odoo modules are the same across companies).
create table public.categories (
  key        text primary key,
  name       text not null,
  icon       text not null,
  sort_order integer not null default 0
);

-- Dated releases, scoped to a tenant.
create table public.changelogs (
  id         uuid primary key default gen_random_uuid(),
  tenant_id  uuid not null references public.tenants(id) on delete cascade,
  date       date not null,
  title      text,
  summary    text not null,
  created_at timestamptz not null default now()
);
create index changelogs_tenant_date_idx on public.changelogs (tenant_id, date desc);

-- Individual user-facing changes.
create table public.tickets (
  id                   uuid primary key default gen_random_uuid(),
  tenant_id            uuid not null references public.tenants(id) on delete cascade,
  changelog_id         uuid not null references public.changelogs(id) on delete cascade,
  code                 text not null,                  -- "CRM-001" (unique per tenant)
  title                text not null,
  summary              text not null,
  status               text not null
    check (status in ('new', 'improvement', 'fix', 'optimization')),
  category_key         text not null references public.categories(key),
  what_changed         text not null,
  why_useful           text not null,
  where_to_find        text[] not null default '{}',
  featured             boolean not null default false,
  reactions_helped     integer not null default 0,
  reactions_love       integer not null default 0,
  reactions_suggestion integer not null default 0,
  before_after         jsonb,
  sort_order           integer not null default 0,
  unique (tenant_id, code)
);
create index tickets_changelog_idx on public.tickets (changelog_id, sort_order);

-- Screenshots. tenant_id is denormalized for simple, fast RLS.
create table public.screenshots (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references public.tenants(id) on delete cascade,
  ticket_id   uuid not null references public.tickets(id) on delete cascade,
  caption     text not null,
  variant     text,
  url         text,
  seed        integer,
  sort_order  integer not null default 0
);
create index screenshots_ticket_idx on public.screenshots (ticket_id, sort_order);
