-- Membership / community schema for Storyburst
--
-- Tables:  users, posts, messages, reviews, subscriptions, files
-- Every child table references public.users(id).
--
-- Auth model
-- ----------
-- The Row Level Security policies below assume Supabase Auth, where
-- public.users.id is the same UUID as the signed-in user (auth.uid()).
-- Populate it on sign-up, e.g.:
--
--   insert into public.users (id, name, email)
--   values (auth.uid(), 'Ada', 'ada@example.com');
--
-- The app today authenticates against Turso with its own password hashing.
-- If you keep that, have server code talk to Supabase with the
-- SUPABASE_SERVICE_ROLE_KEY (service_role has BYPASSRLS, so these policies
-- never get in its way) and treat the policies as defense-in-depth for any
-- request that arrives with the anon / authenticated key instead.

-- ===========================================================================
-- Tables
-- ===========================================================================

create table if not exists public.users (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  email         text not null unique,
  password_hash text,
  avatar_url    text,
  bio           text,
  phone         text,
  address       text,
  created_at    timestamptz not null default now()
);

comment on table public.users is 'Customer / member account profiles.';
comment on column public.users.password_hash is
  'Only set when the app manages passwords itself. Leave null under Supabase Auth.';

create table if not exists public.posts (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.users (id) on delete cascade,
  title        text not null,
  body         text not null,
  image_url    text,
  category     text,
  tags         text[] not null default '{}',
  published_at timestamptz,
  created_at   timestamptz not null default now()
);

comment on table public.posts is 'Articles, blog posts and other user-generated content.';
comment on column public.posts.published_at is
  'Null = draft. A timestamp at or before now() means published.';

create table if not exists public.messages (
  id           uuid primary key default gen_random_uuid(),
  sender_id    uuid not null references public.users (id) on delete cascade,
  recipient_id uuid not null references public.users (id) on delete cascade,
  content      text not null,
  is_read      boolean not null default false,
  created_at   timestamptz not null default now()
);

comment on table public.messages is 'Direct messages between two members.';

create table if not exists public.reviews (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.users (id) on delete cascade,
  rating     smallint not null check (rating between 1 and 5),
  body       text,
  created_at timestamptz not null default now()
);

comment on table public.reviews is 'Member ratings and written reviews.';

create table if not exists public.subscriptions (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.users (id) on delete cascade,
  plan          text not null,
  price         numeric(10, 2) not null default 0 check (price >= 0),
  billing_cycle text not null default 'monthly'
                  check (billing_cycle in ('monthly', 'yearly')),
  start_date    date not null default current_date,
  status        text not null default 'active'
                  check (status in ('trialing', 'active', 'past_due', 'canceled', 'expired')),
  created_at    timestamptz not null default now()
);

comment on table public.subscriptions is 'Member subscription plans and billing state.';

create table if not exists public.files (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.users (id) on delete cascade,
  name       text not null,
  url        text not null,
  mime_type  text,
  created_at timestamptz not null default now()
);

comment on table public.files is 'Uploaded files and documents owned by a member.';

-- ===========================================================================
-- Indexes  (foreign keys + columns we filter / sort on)
-- ===========================================================================

-- users.email already has a unique index from the column constraint.

create index if not exists posts_user_id_idx      on public.posts (user_id);
create index if not exists posts_category_idx     on public.posts (category);
create index if not exists posts_published_at_idx on public.posts (published_at desc nulls last);
create index if not exists posts_tags_idx         on public.posts using gin (tags);

create index if not exists messages_sender_id_idx    on public.messages (sender_id);
create index if not exists messages_recipient_id_idx on public.messages (recipient_id);
create index if not exists messages_thread_idx       on public.messages (sender_id, recipient_id, created_at desc);
create index if not exists messages_unread_idx       on public.messages (recipient_id) where is_read = false;

create index if not exists reviews_user_id_idx    on public.reviews (user_id);
create index if not exists reviews_rating_idx     on public.reviews (rating);
create index if not exists reviews_created_at_idx on public.reviews (created_at desc);

create index if not exists subscriptions_user_id_idx on public.subscriptions (user_id);
create index if not exists subscriptions_status_idx  on public.subscriptions (status);

create index if not exists files_user_id_idx    on public.files (user_id);
create index if not exists files_created_at_idx on public.files (created_at desc);

-- ===========================================================================
-- Row Level Security
-- ===========================================================================

alter table public.users         enable row level security;
alter table public.posts         enable row level security;
alter table public.messages      enable row level security;
alter table public.reviews       enable row level security;
alter table public.subscriptions enable row level security;
alter table public.files         enable row level security;

-- users ---------------------------------------------------------------------
-- Sign-up / profile creation runs on the server with the service-role key,
-- so there is deliberately no INSERT policy for anon / authenticated.

drop policy if exists "Users can view their own profile" on public.users;
create policy "Users can view their own profile"
  on public.users for select
  to authenticated
  using ((select auth.uid()) = id);

drop policy if exists "Users can update their own profile" on public.users;
create policy "Users can update their own profile"
  on public.users for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- posts -------------------------------------------------------------------
drop policy if exists "Published posts are public" on public.posts;
create policy "Published posts are public"
  on public.posts for select
  to anon, authenticated
  using (published_at is not null and published_at <= now());

drop policy if exists "Authors can see their own drafts" on public.posts;
create policy "Authors can see their own drafts"
  on public.posts for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Authors can create their own posts" on public.posts;
create policy "Authors can create their own posts"
  on public.posts for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Authors can update their own posts" on public.posts;
create policy "Authors can update their own posts"
  on public.posts for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Authors can delete their own posts" on public.posts;
create policy "Authors can delete their own posts"
  on public.posts for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- messages ----------------------------------------------------------------
drop policy if exists "Participants can read their messages" on public.messages;
create policy "Participants can read their messages"
  on public.messages for select
  to authenticated
  using ((select auth.uid()) in (sender_id, recipient_id));

drop policy if exists "Members send messages as themselves" on public.messages;
create policy "Members send messages as themselves"
  on public.messages for insert
  to authenticated
  with check ((select auth.uid()) = sender_id);

drop policy if exists "Recipients can mark messages read" on public.messages;
create policy "Recipients can mark messages read"
  on public.messages for update
  to authenticated
  using ((select auth.uid()) = recipient_id)
  with check ((select auth.uid()) = recipient_id);

-- reviews ---------------------------------------------------------------
drop policy if exists "Reviews are public" on public.reviews;
create policy "Reviews are public"
  on public.reviews for select
  to anon, authenticated
  using (true);

drop policy if exists "Members write their own reviews" on public.reviews;
create policy "Members write their own reviews"
  on public.reviews for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Members update their own reviews" on public.reviews;
create policy "Members update their own reviews"
  on public.reviews for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Members delete their own reviews" on public.reviews;
create policy "Members delete their own reviews"
  on public.reviews for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- subscriptions -------------------------------------------------------
-- Writes come from the billing backend (service-role key) only.
drop policy if exists "Members can view their own subscriptions" on public.subscriptions;
create policy "Members can view their own subscriptions"
  on public.subscriptions for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- files ---------------------------------------------------------------
drop policy if exists "Members can view their own files" on public.files;
create policy "Members can view their own files"
  on public.files for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Members can add their own files" on public.files;
create policy "Members can add their own files"
  on public.files for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Members can delete their own files" on public.files;
create policy "Members can delete their own files"
  on public.files for delete
  to authenticated
  using ((select auth.uid()) = user_id);
