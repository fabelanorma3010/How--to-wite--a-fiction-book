-- A member's personal "save for later" shelf — separate from the public
-- Discover feed, and from follows (this is about books, not people).
create table if not exists public.saved_books (
  user_id    uuid not null references public.users (id) on delete cascade,
  book_id    uuid not null references public.books (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, book_id)
);

comment on table public.saved_books is 'A member''s own "save for later" shelf, private to them.';

create index if not exists saved_books_user_id_idx on public.saved_books (user_id, created_at desc);

alter table public.saved_books enable row level security;

drop policy if exists "Members see their own saved books" on public.saved_books;
create policy "Members see their own saved books"
  on public.saved_books for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Members save books as themselves" on public.saved_books;
create policy "Members save books as themselves"
  on public.saved_books for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Members remove their own saved books" on public.saved_books;
create policy "Members remove their own saved books"
  on public.saved_books for delete
  to authenticated
  using ((select auth.uid()) = user_id);

notify pgrst, 'reload schema';
