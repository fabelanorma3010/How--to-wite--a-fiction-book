-- Snapshots of a member's Story Notebook over time, so they can look back at
-- an earlier draft instead of only ever having today's overwritten copy.
-- Only for signed-in members — an anonymous notebook lives in one browser's
-- localStorage with no account to hang a history off of.

create table if not exists public.notebook_versions (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references public.users (id) on delete cascade,
  content    text not null,
  created_at timestamptz not null default now()
);

comment on table public.notebook_versions is 'Throttled snapshots of a member''s notebook, for the "roll back to an earlier draft" history feature.';

create index if not exists notebook_versions_user_id_created_at_idx
  on public.notebook_versions (user_id, created_at desc);

alter table public.notebook_versions enable row level security;

drop policy if exists "Members read their own notebook versions" on public.notebook_versions;
create policy "Members read their own notebook versions"
  on public.notebook_versions for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Members create their own notebook versions" on public.notebook_versions;
create policy "Members create their own notebook versions"
  on public.notebook_versions for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Members delete their own notebook versions" on public.notebook_versions;
create policy "Members delete their own notebook versions"
  on public.notebook_versions for delete
  to authenticated
  using ((select auth.uid()) = user_id);

notify pgrst, 'reload schema';
