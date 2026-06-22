-- ============================================================================
--  0005 — Screenshot media: kind + poster, and a tenant-media storage bucket
-- ----------------------------------------------------------------------------
--  Capturas now hold real Odoo media, not just mockups. A screenshot can be an
--  image or a video (GIFs are converted to muted looping MP4 before upload). We
--  store the media kind and an optional poster frame for videos, and add a
--  public bucket for the files. Writes are admin-only per tenant, mirroring the
--  logo bucket (0004). Agent/API writes will go through the service layer later.
-- ============================================================================

alter table public.screenshots
  add column if not exists kind text check (kind in ('image', 'video')),
  add column if not exists poster text;

-- Public bucket for screenshots / clips (served via public URL, like logos).
insert into storage.buckets (id, name, public)
values ('tenant-media', 'tenant-media', true)
on conflict (id) do nothing;

-- Storage policies. Path convention: "<tenant_id>/<ticket>/<file>".
create policy "tenant media public read"
  on storage.objects for select
  using (bucket_id = 'tenant-media');

create policy "tenant admins write media (insert)"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'tenant-media'
    and public.is_tenant_admin(((storage.foldername(name))[1])::uuid)
  );

create policy "tenant admins write media (update)"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'tenant-media'
    and public.is_tenant_admin(((storage.foldername(name))[1])::uuid)
  );

create policy "tenant admins write media (delete)"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'tenant-media'
    and public.is_tenant_admin(((storage.foldername(name))[1])::uuid)
  );
