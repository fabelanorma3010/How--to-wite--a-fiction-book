-- Phase 1 of turning the Digital Library from a static mockup into a real
-- reading destination: chapters (an ordered set of page images) under a
-- book, and a follow relationship between members. Progress tracking,
-- shelves, and offline downloads are a deliberately separate phase 2 —
-- they need real usage against phase 1 first.

-- ===========================================================================
-- Tables
-- ===========================================================================

create table if not exists public.book_chapters (
  id             uuid primary key default gen_random_uuid(),
  book_id        uuid not null references public.books (id) on delete cascade,
  chapter_number integer not null check (chapter_number > 0),
  title          text,
  pages          text[] not null default '{}',
  published_at   timestamptz not null default now(),
  created_at     timestamptz not null default now(),
  unique (book_id, chapter_number)
);

comment on table public.book_chapters is
  'An ordered set of page image URLs under a book. chapter_number orders chapters within a book.';

create table if not exists public.follows (
  follower_id uuid not null references public.users (id) on delete cascade,
  followed_id uuid not null references public.users (id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (follower_id, followed_id),
  constraint follows_not_self check (follower_id <> followed_id)
);

comment on table public.follows is 'follower_id follows followed_id. Public, like a follower count on any social app.';

-- ===========================================================================
-- Indexes
-- ===========================================================================

create index if not exists book_chapters_book_id_idx on public.book_chapters (book_id, chapter_number);

create index if not exists follows_followed_id_idx on public.follows (followed_id);

-- ===========================================================================
-- Row Level Security
-- ===========================================================================

alter table public.book_chapters enable row level security;
alter table public.follows       enable row level security;

-- book_chapters ---------------------------------------------------------
-- Same visibility rule as public.books itself: visible to the owner always,
-- or to anyone once the owner's profile is public.
drop policy if exists "Chapters are visible with their book" on public.book_chapters;
create policy "Chapters are visible with their book"
  on public.book_chapters for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.books b
      where b.id = book_chapters.book_id
      and (
        (select auth.uid()) = b.user_id
        or exists (select 1 from public.users u where u.id = b.user_id and u.is_public = true)
      )
    )
  );

drop policy if exists "Book owners add their own chapters" on public.book_chapters;
create policy "Book owners add their own chapters"
  on public.book_chapters for insert
  to authenticated
  with check (
    exists (select 1 from public.books b where b.id = book_chapters.book_id and b.user_id = (select auth.uid()))
  );

drop policy if exists "Book owners update their own chapters" on public.book_chapters;
create policy "Book owners update their own chapters"
  on public.book_chapters for update
  to authenticated
  using (exists (select 1 from public.books b where b.id = book_chapters.book_id and b.user_id = (select auth.uid())))
  with check (exists (select 1 from public.books b where b.id = book_chapters.book_id and b.user_id = (select auth.uid())));

drop policy if exists "Book owners delete their own chapters" on public.book_chapters;
create policy "Book owners delete their own chapters"
  on public.book_chapters for delete
  to authenticated
  using (exists (select 1 from public.books b where b.id = book_chapters.book_id and b.user_id = (select auth.uid())));

-- follows -----------------------------------------------------------------
drop policy if exists "Follows are public" on public.follows;
create policy "Follows are public"
  on public.follows for select
  to anon, authenticated
  using (true);

drop policy if exists "Members follow as themselves" on public.follows;
create policy "Members follow as themselves"
  on public.follows for insert
  to authenticated
  with check ((select auth.uid()) = follower_id);

drop policy if exists "Members unfollow as themselves" on public.follows;
create policy "Members unfollow as themselves"
  on public.follows for delete
  to authenticated
  using ((select auth.uid()) = follower_id);

notify pgrst, 'reload schema';
