-- Books a member has written and uploaded to their own profile, with one
-- optional "favorite" pick highlighted on /u/[username]. book_type reuses the
-- same comic/manga/cartoon/childrens vocabulary as the rest of the app
-- (src/data/bookTypes.ts, the community wall).

create table if not exists public.books (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.users (id) on delete cascade,
  title       text not null,
  description text,
  book_type   text check (book_type in ('comic', 'manga', 'cartoon', 'childrens')),
  cover_url   text,
  file_url    text,
  is_favorite boolean not null default false,
  created_at  timestamptz not null default now()
);

comment on table public.books is 'Books a member has written and uploaded to their profile.';

create index if not exists books_user_id_idx on public.books (user_id);

alter table public.books enable row level security;

-- A book is visible to anyone if its owner's profile is public, and always
-- visible to its own owner (so you can preview your shelf before going public).
drop policy if exists "Books are visible with a public profile, or to their owner" on public.books;
create policy "Books are visible with a public profile, or to their owner"
  on public.books for select
  to anon, authenticated
  using (
    (select auth.uid()) = user_id
    or exists (select 1 from public.users u where u.id = books.user_id and u.is_public = true)
  );

drop policy if exists "Members add their own books" on public.books;
create policy "Members add their own books"
  on public.books for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Members update their own books" on public.books;
create policy "Members update their own books"
  on public.books for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Members delete their own books" on public.books;
create policy "Members delete their own books"
  on public.books for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- Only one favorite per member: marking a book favorite clears any previous
-- favorite of the same user first, so the "pick a favorite" toggle in the UI
-- is a single write with no read-then-write race.
create or replace function public.enforce_single_favorite_book()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.is_favorite then
    update public.books set is_favorite = false
    where user_id = new.user_id and id <> new.id and is_favorite = true;
  end if;
  return new;
end;
$$;

drop trigger if exists enforce_single_favorite_book on public.books;
create trigger enforce_single_favorite_book
  before insert or update of is_favorite on public.books
  for each row
  when (new.is_favorite = true)
  execute function public.enforce_single_favorite_book();

-- ===========================================================================
-- Storage: cover images + book files, one bucket, path <user id>/cover-*
-- and <user id>/book-*
-- ===========================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'books', 'books', true, 52428800,
  array['image/png', 'image/jpeg', 'image/webp', 'application/pdf', 'application/epub+zip']
)
on conflict (id) do update set
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Book files are publicly accessible" on storage.objects;
create policy "Book files are publicly accessible"
  on storage.objects for select
  to public
  using (bucket_id = 'books');

drop policy if exists "Users can upload their own book files" on storage.objects;
create policy "Users can upload their own book files"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'books' and (select auth.uid()::text) = (storage.foldername(name))[1]);

drop policy if exists "Users can replace their own book files" on storage.objects;
create policy "Users can replace their own book files"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'books' and (select auth.uid()::text) = (storage.foldername(name))[1]);

drop policy if exists "Users can delete their own book files" on storage.objects;
create policy "Users can delete their own book files"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'books' and (select auth.uid()::text) = (storage.foldername(name))[1]);

notify pgrst, 'reload schema';
