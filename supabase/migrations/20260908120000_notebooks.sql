-- One story notebook per member, so a signed-in user's draft follows them
-- between devices instead of living only in one browser's localStorage.
-- Strictly private — unlike posts/books/profiles, nothing here is ever
-- meant to be public, so there is no anon/authenticated-other-users policy
-- at all, only owner access.

create table if not exists public.notebooks (
  user_id    uuid primary key references public.users (id) on delete cascade,
  content    text not null default '',
  updated_at timestamptz not null default now()
);

comment on table public.notebooks is 'A member''s Story Notebook draft, synced from localStorage when signed in.';

alter table public.notebooks enable row level security;

drop policy if exists "Members read their own notebook" on public.notebooks;
create policy "Members read their own notebook"
  on public.notebooks for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Members create their own notebook" on public.notebooks;
create policy "Members create their own notebook"
  on public.notebooks for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Members update their own notebook" on public.notebooks;
create policy "Members update their own notebook"
  on public.notebooks for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

notify pgrst, 'reload schema';
