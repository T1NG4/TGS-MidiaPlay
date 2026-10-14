-- Catálogo de vídeos + bucket para o telão do VRChat.
-- Rode no SQL Editor do Supabase ou via CLI: supabase db push

create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  storage_path text not null unique,
  size_bytes bigint not null check (size_bytes >= 0),
  mime text not null default 'video/mp4',
  created_at timestamptz not null default now(),
  owner_id uuid not null references auth.users (id) on delete cascade
);

create index if not exists videos_owner_created_idx
  on public.videos (owner_id, created_at desc);

alter table public.videos enable row level security;

drop policy if exists "videos_select_unlisted" on public.videos;
create policy "videos_select_unlisted"
  on public.videos
  for select
  using (true);

drop policy if exists "videos_insert_own" on public.videos;
create policy "videos_insert_own"
  on public.videos
  for insert
  to authenticated
  with check (auth.uid() = owner_id);

drop policy if exists "videos_delete_own" on public.videos;
create policy "videos_delete_own"
  on public.videos
  for delete
  to authenticated
  using (auth.uid() = owner_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'videos',
  'videos',
  true,
  21474836480,
  array['video/mp4', 'video/webm', 'video/quicktime', 'video/x-matroska']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "videos_storage_insert_own" on storage.objects;
create policy "videos_storage_insert_own"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'videos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "videos_storage_update_own" on storage.objects;
create policy "videos_storage_update_own"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'videos'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'videos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "videos_storage_delete_own" on storage.objects;
create policy "videos_storage_delete_own"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'videos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "videos_storage_select_own" on storage.objects;
create policy "videos_storage_select_own"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'videos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
