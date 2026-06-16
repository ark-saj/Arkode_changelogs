-- ============================================================================
--  Seed — two fictional tenants with DISTINCT content (proves isolation).
--  Runs automatically on `supabase start` / `supabase db reset`.
--  Fixed tenant UUIDs make the isolation test deterministic.
-- ============================================================================

insert into public.tenants (id, slug, name, tagline, logo, brand) values
  ('11111111-1111-1111-1111-111111111111', 'conecta', 'Conec-ta', 'Centro de Novedades', null,
   '{"--brand":"24 94% 53%","--brand-soft":"32 95% 62%","--blob-1":"24 94% 53%","--blob-2":"32 95% 62%","--blob-3":"14 90% 58%"}'::jsonb),
  ('22222222-2222-2222-2222-222222222222', 'everban', 'Everban', 'Centro de Novedades', null,
   '{"--brand":"221 83% 60%","--brand-soft":"199 89% 60%","--blob-1":"221 83% 60%","--blob-2":"199 89% 60%","--blob-3":"262 83% 66%"}'::jsonb);

insert into public.categories (key, name, icon, sort_order) values
  ('crm',         'CRM',         'UserRound',    0),
  ('ventas',      'Ventas',      'ShoppingCart', 1),
  ('inventario',  'Inventario',  'Boxes',        2),
  ('compras',     'Compras',     'Truck',        3),
  ('rrhh',        'RRHH',        'Briefcase',    4),
  ('facturacion', 'Facturación', 'ReceiptText',  5);

-- ---------------------------------------------------------------------------
--  Conec-ta
-- ---------------------------------------------------------------------------
insert into public.changelogs (tenant_id, date, title, summary) values
  ('11111111-1111-1111-1111-111111111111', '2026-06-12', 'Mejoras en CRM y Ventas',
   'Registrá oportunidades más rápido, con menos errores y un pipeline más claro.'),
  ('11111111-1111-1111-1111-111111111111', '2026-06-05', 'Inventario más ágil',
   'Recepciones, conteos y consultas de stock más rápidas.');

insert into public.tickets
  (tenant_id, changelog_id, code, title, summary, status, category_key,
   what_changed, why_useful, where_to_find, featured,
   reactions_helped, reactions_love, reactions_suggestion, before_after, sort_order)
select '11111111-1111-1111-1111-111111111111', c.id, 'CRM-001',
  'Validación inteligente de oportunidades',
  'El sistema te avisa si falta información importante antes de guardar.',
  'new', 'crm',
  'Al crear una oportunidad, el sistema revisa que tenga los datos clave antes de permitir guardarla.',
  'Evita oportunidades incompletas que después generan retrabajo y reportes poco confiables.',
  array['CRM','Oportunidades','Crear oportunidad'], true, 32, 18, 3, null, 0
from public.changelogs c
where c.tenant_id = '11111111-1111-1111-1111-111111111111' and c.date = '2026-06-12';

insert into public.tickets
  (tenant_id, changelog_id, code, title, summary, status, category_key,
   what_changed, why_useful, where_to_find, featured,
   reactions_helped, reactions_love, reactions_suggestion, before_after, sort_order)
select '11111111-1111-1111-1111-111111111111', c.id, 'CRM-002',
  'Vista de embudo más clara',
  'Rediseñamos el tablero de oportunidades para ver tu pipeline de un vistazo.',
  'improvement', 'crm',
  'El tablero ahora muestra el monto total por etapa y resalta con color las de mayor prioridad.',
  'Identificás en segundos dónde está estancado el negocio y a qué oportunidad darle prioridad hoy.',
  array['CRM','Oportunidades'], true, 27, 41, 5,
  '{"beforeCaption":"Antes: tablero plano sin totales","afterCaption":"Después: montos y prioridad por etapa","beforeVariant":"kanban","afterVariant":"kanban","seed":22}'::jsonb,
  1
from public.changelogs c
where c.tenant_id = '11111111-1111-1111-1111-111111111111' and c.date = '2026-06-12';

insert into public.tickets
  (tenant_id, changelog_id, code, title, summary, status, category_key,
   what_changed, why_useful, where_to_find, featured,
   reactions_helped, reactions_love, reactions_suggestion, before_after, sort_order)
select '11111111-1111-1111-1111-111111111111', c.id, 'VEN-015',
  'Corrección en el cálculo de impuestos',
  'Los productos exentos ya no suman impuesto por error en el total.',
  'fix', 'ventas',
  'Corregimos el cálculo para que los productos marcados como exentos no apliquen impuesto en el total.',
  'Tus presupuestos y facturas muestran el total correcto siempre, evitando reclamos.',
  array['Ventas','Presupuestos'], false, 22, 6, 1, null, 2
from public.changelogs c
where c.tenant_id = '11111111-1111-1111-1111-111111111111' and c.date = '2026-06-12';

insert into public.tickets
  (tenant_id, changelog_id, code, title, summary, status, category_key,
   what_changed, why_useful, where_to_find, featured,
   reactions_helped, reactions_love, reactions_suggestion, before_after, sort_order)
select '11111111-1111-1111-1111-111111111111', c.id, 'INV-008',
  'Recepción por código de barras',
  'Escaneá productos al recibir mercadería y el sistema los carga solo.',
  'new', 'inventario',
  'Habilitamos la lectura de código de barras en las recepciones, desde el celular o un lector.',
  'Recibís mercadería mucho más rápido y con menos errores de carga manual.',
  array['Inventario','Recepciones'], true, 44, 30, 7, null, 0
from public.changelogs c
where c.tenant_id = '11111111-1111-1111-1111-111111111111' and c.date = '2026-06-05';

-- Conec-ta screenshots
insert into public.screenshots (tenant_id, ticket_id, caption, variant, seed, sort_order)
select '11111111-1111-1111-1111-111111111111', t.id, 'Aviso al intentar guardar sin datos clave', 'form', 11, 0
from public.tickets t
where t.tenant_id = '11111111-1111-1111-1111-111111111111' and t.code = 'CRM-001';
insert into public.screenshots (tenant_id, ticket_id, caption, variant, seed, sort_order)
select '11111111-1111-1111-1111-111111111111', t.id, 'Oportunidad completa lista para guardar', 'form', 12, 1
from public.tickets t
where t.tenant_id = '11111111-1111-1111-1111-111111111111' and t.code = 'CRM-001';
insert into public.screenshots (tenant_id, ticket_id, caption, variant, seed, sort_order)
select '11111111-1111-1111-1111-111111111111', t.id, 'Escaneo de productos al recibir', 'list', 42, 0
from public.tickets t
where t.tenant_id = '11111111-1111-1111-1111-111111111111' and t.code = 'INV-008';

-- ---------------------------------------------------------------------------
--  Everban (distinct content — used to verify isolation)
-- ---------------------------------------------------------------------------
insert into public.changelogs (tenant_id, date, title, summary) values
  ('22222222-2222-2222-2222-222222222222', '2026-06-10', 'Portal de clientes',
   'Tus clientes ahora se autogestionan y vos ganás tiempo.');

insert into public.tickets
  (tenant_id, changelog_id, code, title, summary, status, category_key,
   what_changed, why_useful, where_to_find, featured,
   reactions_helped, reactions_love, reactions_suggestion, before_after, sort_order)
select '22222222-2222-2222-2222-222222222222', c.id, 'VEN-101',
  'Portal de autogestión para clientes',
  'Los clientes consultan sus pedidos y facturas sin escribirte.',
  'new', 'ventas',
  'Habilitamos un portal donde el cliente ve el estado de sus pedidos y descarga sus facturas.',
  'Menos consultas por correo y teléfono: el cliente se autogestiona cuando quiere.',
  array['Ventas','Clientes','Portal'], true, 58, 40, 9, null, 0
from public.changelogs c
where c.tenant_id = '22222222-2222-2222-2222-222222222222' and c.date = '2026-06-10';

insert into public.tickets
  (tenant_id, changelog_id, code, title, summary, status, category_key,
   what_changed, why_useful, where_to_find, featured,
   reactions_helped, reactions_love, reactions_suggestion, before_after, sort_order)
select '22222222-2222-2222-2222-222222222222', c.id, 'FAC-050',
  'Recordatorio automático de facturas vencidas',
  'El sistema le recuerda al cliente sus facturas impagas, solo.',
  'improvement', 'facturacion',
  'Configuramos recordatorios automáticos por correo cuando una factura supera su fecha de vencimiento.',
  'Cobrás más rápido sin perseguir manualmente cada factura vencida.',
  array['Facturación','Facturas de cliente'], false, 33, 21, 4, null, 1
from public.changelogs c
where c.tenant_id = '22222222-2222-2222-2222-222222222222' and c.date = '2026-06-10';
