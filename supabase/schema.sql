-- ============================================================================
--  Changelog Visual — Supabase schema
-- ----------------------------------------------------------------------------
--  Run this in the Supabase SQL editor to enable the real backend. The app
--  auto-switches from mock data to Supabase as soon as you set
--  NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY (see README).
--
--  Shapes here match src/lib/data/supabase-repository.ts exactly.
-- ============================================================================

-- Clean slate (safe to re-run during setup) -------------------------------
drop table if exists screenshots cascade;
drop table if exists tickets cascade;
drop table if exists changelogs cascade;
drop table if exists categories cascade;

-- Categories ----------------------------------------------------------------
create table categories (
  key        text primary key,
  name       text not null,
  icon       text not null,          -- Lucide icon name, e.g. "UserRound"
  sort_order integer not null default 0
);

-- Changelog entries (dated releases) ----------------------------------------
create table changelogs (
  id         text primary key,       -- e.g. "2026-06-12"
  date       date not null,
  title      text,
  summary    text not null
);

-- Tickets (individual user-facing changes) ----------------------------------
create table tickets (
  code                 text primary key,                 -- e.g. "CRM-001"
  changelog_id         text not null references changelogs(id) on delete cascade,
  title                text not null,
  summary              text not null,
  status               text not null
    check (status in ('new', 'improvement', 'fix', 'optimization')),
  category_key         text not null references categories(key),
  what_changed         text not null,
  why_useful           text not null,
  where_to_find        text[] not null default '{}',
  featured             boolean not null default false,
  reactions_helped     integer not null default 0,
  reactions_love       integer not null default 0,
  reactions_suggestion integer not null default 0,
  before_after         jsonb,                            -- BeforeAfter | null
  sort_order           integer not null default 0
);
create index tickets_changelog_idx on tickets (changelog_id);

-- Screenshots ---------------------------------------------------------------
create table screenshots (
  id          text primary key,
  ticket_code text not null references tickets(code) on delete cascade,
  caption     text not null,
  variant     text,                  -- form | list | dashboard | kanban | report
  url         text,                  -- optional real image (Supabase Storage)
  seed        integer,
  sort_order  integer not null default 0
);
create index screenshots_ticket_idx on screenshots (ticket_code);

-- Row Level Security: public read-only access (anon key) ---------------------
alter table categories  enable row level security;
alter table changelogs  enable row level security;
alter table tickets     enable row level security;
alter table screenshots enable row level security;

create policy "public read categories"  on categories  for select using (true);
create policy "public read changelogs"  on changelogs  for select using (true);
create policy "public read tickets"     on tickets     for select using (true);
create policy "public read screenshots" on screenshots for select using (true);

-- ============================================================================
--  Sample seed (mirrors the first entry of the mock data). Extend as needed.
-- ============================================================================
insert into categories (key, name, icon, sort_order) values
  ('crm',         'CRM',         'UserRound',    0),
  ('ventas',      'Ventas',      'ShoppingCart', 1),
  ('inventario',  'Inventario',  'Boxes',        2),
  ('compras',     'Compras',     'Truck',        3),
  ('rrhh',        'RRHH',        'Briefcase',    4),
  ('facturacion', 'Facturación', 'ReceiptText',  5);

insert into changelogs (id, date, title, summary) values
  ('2026-06-12', '2026-06-12', 'Mejoras en CRM y Ventas',
   'Registrá oportunidades más rápido, con menos errores y un pipeline más claro.');

insert into tickets (
  code, changelog_id, title, summary, status, category_key,
  what_changed, why_useful, where_to_find, featured,
  reactions_helped, reactions_love, reactions_suggestion, before_after, sort_order
) values
  ('CRM-001', '2026-06-12', 'Validación inteligente de oportunidades',
   'El sistema te avisa si falta información importante antes de guardar.',
   'new', 'crm',
   'Al crear una oportunidad, el sistema revisa que tenga los datos clave (cliente, contacto y valor estimado) antes de permitir guardarla.',
   'Evita oportunidades incompletas que después generan retrabajo y reportes poco confiables.',
   array['CRM','Oportunidades','Crear oportunidad'], true,
   32, 18, 3, null, 0);

insert into screenshots (id, ticket_code, caption, variant, seed, sort_order) values
  ('crm001-1', 'CRM-001', 'Aviso al intentar guardar sin datos clave', 'form', 11, 0),
  ('crm001-2', 'CRM-001', 'Oportunidad completa lista para guardar',   'form', 12, 1);
