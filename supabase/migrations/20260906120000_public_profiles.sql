-- Public creator profiles: a username-addressed page at /u/<username> showing
-- bio, social links, and avatar — separate from the private account fields
-- (email, phone, address, role) which stay owner-only.
--
-- Design:
--   * New columns on public.users: username (unique slug), bio already
--     existed, website/instagram/tiktok/youtube/twitter links, is_public.
--   * handle_new_user() now also assigns a starter username so every new
--     signup has a working profile URL immediately; existing rows are
--     backfilled the same way. Users can change it later from /account.
--   * A new view, public_profile_cards, exposes only the public-safe columns
--     and only for rows with is_public = true — this is intentionally a
--     SEPARATE view from public_profiles (added for the community wall in
--     20260901130000), so toggling "public profile" off does not also change
--     how someone's name shows up on their own community posts.
--   * A Storage bucket ('avatars', public-read) with per-user-folder write
--     policies, so a signed-in user can upload their own avatar directly from
--     the browser (path convention: <user id>/<filename>).

-- ===========================================================================
-- Columns
-- ===========================================================================

alter table public.users add column if not exists username      text;
alter table public.users add column if not exists website_url   text;
alter table public.users add column if not exists instagram_url text;
alter table public.users add column if not exists tiktok_url    text;
alter table public.users add column if not exists youtube_url   text;
alter table public.users add column if not exists twitter_url   text;
alter table public.users add column if not exists is_public     boolean not null default true;

create unique index if not exists users_username_key on public.users (lower(username));

comment on column public.users.username is 'URL slug for /u/<username>. Unique (case-insensitive). Editable from /account.';
comment on column public.users.is_public is 'Whether /u/<username> is visible to others. Community posts are unaffected by this.';

-- ===========================================================================
-- Username generation — used for both new signups and the backfill below
-- ===========================================================================

create or replace function public.generate_username(base text, uid uuid)
returns text
language sql
security definer
set search_path = ''
as $$
  select trim(both '-' from regexp_replace(lower(coalesce(nullif(trim(base), ''), 'user')), '[^a-z0-9]+', '-', 'g'))
         || '-' || substr(replace(uid::text, '-', ''), 1, 6)
$$;

update public.users
set username = public.generate_username(name, id)
where username is null;

-- ===========================================================================
-- Sign-up trigger: now also assigns a starter username
-- ===========================================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  meta     jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  v_first  text  := nullif(btrim(coalesce(meta ->> 'first_name', meta ->> 'given_name', '')), '');
  v_last   text  := nullif(btrim(coalesce(meta ->> 'last_name',  meta ->> 'family_name', '')), '');
  v_full   text  := nullif(btrim(coalesce(meta ->> 'name', meta ->> 'full_name', '')), '');
  v_avatar text  := nullif(btrim(coalesce(meta ->> 'avatar_url', meta ->> 'picture', '')), '');
  v_name   text;
begin
  if v_first is null and v_full is not null then
    v_first := split_part(v_full, ' ', 1);
    v_last  := nullif(btrim(regexp_replace(v_full, '^\S+\s*', '')), '');
  end if;

  v_name := coalesce(
    v_full,
    nullif(btrim(concat_ws(' ', v_first, v_last)), ''),
    nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
    'Member'
  );

  insert into public.users (id, name, email, first_name, last_name, avatar_url, agreed_to_terms_at, username)
  values (
    new.id,
    v_name,
    new.email,
    v_first,
    v_last,
    v_avatar,
    case when (meta ->> 'agreed_to_terms') = 'true' then now() end,
    public.generate_username(v_name, new.id)
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

-- ===========================================================================
-- Public-safe view for /u/<username> — deliberately separate from
-- public_profiles (name + avatar only, used by the community wall).
-- ===========================================================================

create or replace view public.public_profile_cards
  with (security_invoker = false)
  as
  select
    id, username, name, first_name, last_name, avatar_url, bio,
    website_url, instagram_url, tiktok_url, youtube_url, twitter_url,
    created_at
  from public.users
  where is_public = true and username is not null;

grant select on public.public_profile_cards to anon, authenticated;

-- ===========================================================================
-- Storage: avatar uploads
-- ===========================================================================

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists "Avatar images are publicly accessible" on storage.objects;
create policy "Avatar images are publicly accessible"
  on storage.objects for select
  to public
  using (bucket_id = 'avatars');

drop policy if exists "Users can upload their own avatar" on storage.objects;
create policy "Users can upload their own avatar"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'avatars' and (select auth.uid()::text) = (storage.foldername(name))[1]);

drop policy if exists "Users can replace their own avatar" on storage.objects;
create policy "Users can replace their own avatar"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'avatars' and (select auth.uid()::text) = (storage.foldername(name))[1]);

drop policy if exists "Users can delete their own avatar" on storage.objects;
create policy "Users can delete their own avatar"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'avatars' and (select auth.uid()::text) = (storage.foldername(name))[1]);

notify pgrst, 'reload schema';
