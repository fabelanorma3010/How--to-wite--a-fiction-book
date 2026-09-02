-- Bridge Supabase Auth to public.users.
--
-- After this, every auth.users signup gets a matching public.users row
-- (public.users.id = auth.uid()), which is what the RLS policies from
-- 20260831120000_membership_community.sql assume.

alter table public.users add column if not exists agreed_to_terms_at timestamptz;

-- Insert a profile row for each new auth user. security definer so it runs
-- past RLS; search_path pinned per Supabase guidance.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.users (id, name, email, avatar_url, agreed_to_terms_at)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'name'), ''), split_part(new.email, '@', 1)),
    new.email,
    new.raw_user_meta_data ->> 'avatar_url',
    case when (new.raw_user_meta_data ->> 'agreed_to_terms') = 'true' then now() end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Keep public.users.email in step with a later email change.
create or replace function public.handle_user_email_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.users set email = new.email where id = new.id;
  return new;
end;
$$;

drop trigger if exists on_auth_user_email_change on auth.users;
create trigger on_auth_user_email_change
  after update of email on auth.users
  for each row execute function public.handle_user_email_change();

-- When an auth user is deleted, remove their profile row (posts / messages /
-- reviews / subscriptions / files cascade from public.users). Only touches
-- rows that came from Supabase Auth — seed and admin-created members that have
-- no auth.users entry are unaffected.
create or replace function public.handle_user_delete()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from public.users where id = old.id;
  return old;
end;
$$;

drop trigger if exists on_auth_user_deleted on auth.users;
create trigger on_auth_user_deleted
  after delete on auth.users
  for each row execute function public.handle_user_delete();

notify pgrst, 'reload schema';
