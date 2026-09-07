-- Member-to-member interaction on the Community wall: comments, likes, and
-- a way to report a post or comment for review. Scope deliberately stops
-- short of direct messaging — public.messages already exists from the
-- original schema scaffold but has no UI; that's a separate, bigger decision
-- (open DMs need their own moderation story).

-- ===========================================================================
-- Tables
-- ===========================================================================

create table if not exists public.post_comments (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid not null references public.posts (id) on delete cascade,
  user_id    uuid not null references public.users (id) on delete cascade,
  body       text not null check (char_length(body) between 1 and 500),
  created_at timestamptz not null default now()
);

comment on table public.post_comments is 'Replies on a Community wall post.';

create table if not exists public.post_likes (
  post_id    uuid not null references public.posts (id) on delete cascade,
  user_id    uuid not null references public.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

comment on table public.post_likes is 'One row per member who liked a Community wall post.';

create table if not exists public.content_reports (
  id          uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.users (id) on delete cascade,
  post_id     uuid references public.posts (id) on delete cascade,
  comment_id  uuid references public.post_comments (id) on delete cascade,
  reason      text not null,
  detail      text,
  status      text not null default 'open' check (status in ('open', 'resolved')),
  created_at  timestamptz not null default now(),
  constraint content_reports_one_target check (
    (post_id is not null and comment_id is null) or
    (post_id is null and comment_id is not null)
  )
);

comment on table public.content_reports is 'Member reports of a post or comment, reviewed from /admin/reports.';

-- ===========================================================================
-- Indexes
-- ===========================================================================

create index if not exists post_comments_post_id_idx on public.post_comments (post_id, created_at);
create index if not exists post_comments_user_id_idx on public.post_comments (user_id);

create index if not exists post_likes_post_id_idx on public.post_likes (post_id);

create index if not exists content_reports_status_idx on public.content_reports (status, created_at desc);

-- ===========================================================================
-- Row Level Security
-- ===========================================================================

alter table public.post_comments   enable row level security;
alter table public.post_likes      enable row level security;
alter table public.content_reports enable row level security;

-- post_comments -------------------------------------------------------------
drop policy if exists "Comments are visible with their post" on public.post_comments;
create policy "Comments are visible with their post"
  on public.post_comments for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.posts p
      where p.id = post_comments.post_id and p.published_at is not null and p.published_at <= now()
    )
  );

drop policy if exists "Members comment as themselves" on public.post_comments;
create policy "Members comment as themselves"
  on public.post_comments for insert
  to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.posts p
      where p.id = post_comments.post_id and p.published_at is not null and p.published_at <= now()
    )
  );

drop policy if exists "Comment author or post owner can delete a comment" on public.post_comments;
create policy "Comment author or post owner can delete a comment"
  on public.post_comments for delete
  to authenticated
  using (
    (select auth.uid()) = user_id
    or (select auth.uid()) = (select p.user_id from public.posts p where p.id = post_comments.post_id)
  );

-- post_likes ------------------------------------------------------------
drop policy if exists "Like counts are public" on public.post_likes;
create policy "Like counts are public"
  on public.post_likes for select
  to anon, authenticated
  using (true);

drop policy if exists "Members like as themselves" on public.post_likes;
create policy "Members like as themselves"
  on public.post_likes for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Members remove their own like" on public.post_likes;
create policy "Members remove their own like"
  on public.post_likes for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- content_reports -----------------------------------------------------------
-- Reporters can see their own submitted reports; reviewing the full queue
-- happens from /admin/reports via the service-role client, which bypasses
-- RLS entirely, so there is deliberately no admin-facing SELECT policy here.
drop policy if exists "Reporters see their own reports" on public.content_reports;
create policy "Reporters see their own reports"
  on public.content_reports for select
  to authenticated
  using ((select auth.uid()) = reporter_id);

drop policy if exists "Members report as themselves" on public.content_reports;
create policy "Members report as themselves"
  on public.content_reports for insert
  to authenticated
  with check ((select auth.uid()) = reporter_id);

notify pgrst, 'reload schema';
