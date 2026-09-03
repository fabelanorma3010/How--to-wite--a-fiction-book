-- First / last name on the profile, and Google identity fields in the signup trigger.
--
-- The account screen (/account) lets a signed-in user edit their first name,
-- last name, email and password. Email + password live on auth.users; the names
-- live here, and are mirrored into auth user_metadata so the header greeting
-- updates without re-reading this table.
--
-- This also teaches handle_new_user() to read the fields Google returns
-- (given_name / family_name / name / picture) so "Continue with Google" fills
-- the profile row in.

alter table public.users add column if not exists first_name text;
alter table public.users add column if not exists last_name  text;

comment on column public.users.first_name is 'Given name. Editable by the user on /account.';
comment on column public.users.last_name  is 'Family name. Editable by the user on /account.';

-- Backfill the split for rows that predate these columns (seed data,
-- admin-created members): the first whitespace-delimited token is the first
-- name, whatever follows is the last name.
update public.users
set first_name = coalesce(first_name, nullif(split_part(name, ' ', 1), '')),
    last_name  = coalesce(last_name,  nullif(btrim(regexp_replace(name, '^\S+\s*', '')), ''))
where name is not null
  and (first_name is null or last_name is null);

-- Replace the trigger function from 20260901120000_auth_profiles.sql: same job,
-- now also populating first_name / last_name.
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
begin
  -- Providers that give a single display name but no split (Google's `name`,
  -- our email form's `name`): derive first/last from it.
  if v_first is null and v_full is not null then
    v_first := split_part(v_full, ' ', 1);
    v_last  := nullif(btrim(regexp_replace(v_full, '^\S+\s*', '')), '');
  end if;

  insert into public.users (id, name, email, first_name, last_name, avatar_url, agreed_to_terms_at)
  values (
    new.id,
    coalesce(
      v_full,
      nullif(btrim(concat_ws(' ', v_first, v_last)), ''),
      nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
      'Member'
    ),
    new.email,
    v_first,
    v_last,
    v_avatar,
    case when (meta ->> 'agreed_to_terms') = 'true' then now() end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

notify pgrst, 'reload schema';
