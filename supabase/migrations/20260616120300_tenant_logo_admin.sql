-- ============================================================================
--  0004 — Self-service tenant logo (admin-only) + Storage
-- ----------------------------------------------------------------------------
--  Fase 2 (first write story). A tenant's `admin` can change their company's
--  logo; `member`s cannot. The logo is a single field on the tenant row, so the
--  governance question is "who may edit it" — answered by the role, enforced by
--  RLS here (human, session-based writes). Agent/API writes will go through the
--  service layer (§3.1) later.
-- ============================================================================

-- Is the current user an admin of `target` tenant? SECURITY DEFINER to read
-- tenant_users without tripping its own RLS.
create or replace function public.is_tenant_admin(target uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.tenant_users
    where user_id = auth.uid() and tenant_id = target and role = 'admin'
  )
$$;

-- Admins may update only their tenant's branding fields (not id/slug).
grant update (name, tagline, logo, brand) on public.tenants to authenticated;
create policy "tenant admins update branding"
  on public.tenants for update to authenticated
  using (public.is_tenant_admin(id))
  with check (public.is_tenant_admin(id));

-- Public bucket for logos (header logos are not sensitive; served via public URL).
insert into storage.buckets (id, name, public)
values ('tenant-logos', 'tenant-logos', true)
on conflict (id) do nothing;

-- Storage policies. Path convention: "<tenant_id>/logo.<ext>".
create policy "tenant logos public read"
  on storage.objects for select
  using (bucket_id = 'tenant-logos');

create policy "tenant admins write logos (insert)"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'tenant-logos'
    and public.is_tenant_admin(((storage.foldername(name))[1])::uuid)
  );

create policy "tenant admins write logos (update)"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'tenant-logos'
    and public.is_tenant_admin(((storage.foldername(name))[1])::uuid)
  );

create policy "tenant admins write logos (delete)"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'tenant-logos'
    and public.is_tenant_admin(((storage.foldername(name))[1])::uuid)
  );
