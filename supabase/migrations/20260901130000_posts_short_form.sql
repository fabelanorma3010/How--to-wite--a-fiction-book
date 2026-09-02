-- Let posts carry the community wall's short-form entries (no title), and add
-- a safe public view for author display names.

alter table public.posts alter column title drop not null;

-- Author name / avatar for public feeds. security_invoker = false so it reads
-- past public.users' RLS, but it only ever exposes these three columns —
-- never email, phone, or address.
create or replace view public.public_profiles
  with (security_invoker = false)
  as select id, name, avatar_url from public.users;

grant select on public.public_profiles to anon, authenticated;

notify pgrst, 'reload schema';
