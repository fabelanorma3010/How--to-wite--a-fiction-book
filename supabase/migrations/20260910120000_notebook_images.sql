-- Reference pictures a member attaches to their Story Notebook (mood boards,
-- character sketches, panel references). Private, like the notebook itself —
-- one row per image, served via signed URLs from a private bucket, never a
-- public one.

create table if not exists public.notebook_images (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.users (id) on delete cascade,
  path       text not null,
  created_at timestamptz not null default now()
);

comment on table public.notebook_images is 'A member''s Story Notebook reference pictures. Strictly private, like public.notebooks.';

create index if not exists notebook_images_user_id_idx on public.notebook_images (user_id);

alter table public.notebook_images enable row level security;

drop policy if exists "Members read their own notebook images" on public.notebook_images;
create policy "Members read their own notebook images"
  on public.notebook_images for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Members add their own notebook images" on public.notebook_images;
create policy "Members add their own notebook images"
  on public.notebook_images for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Members delete their own notebook images" on public.notebook_images;
create policy "Members delete their own notebook images"
  on public.notebook_images for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- ===========================================================================
-- Storage: private bucket, path <user id>/<filename> — read via signed URLs
-- ===========================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'notebook-images', 'notebook-images', false, 5242880,
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do update set
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Members read their own notebook image files" on storage.objects;
create policy "Members read their own notebook image files"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'notebook-images' and (select auth.uid()::text) = (storage.foldername(name))[1]);

drop policy if exists "Members upload their own notebook image files" on storage.objects;
create policy "Members upload their own notebook image files"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'notebook-images' and (select auth.uid()::text) = (storage.foldername(name))[1]);

drop policy if exists "Members delete their own notebook image files" on storage.objects;
create policy "Members delete their own notebook image files"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'notebook-images' and (select auth.uid()::text) = (storage.foldername(name))[1]);

notify pgrst, 'reload schema';
