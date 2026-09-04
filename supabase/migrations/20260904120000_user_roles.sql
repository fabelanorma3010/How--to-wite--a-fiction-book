-- Per-user role, editable from /admin/members, as a second (additive) path to
-- admin access alongside the ADMIN_EMAILS env var. Whichever grants access —
-- either is sufficient.
--
-- Security: without a guard, the existing "Users can update their own profile"
-- RLS policy would let any signed-in user grant themselves admin by calling
-- supabase.from('users').update({ role: 'admin' }) directly from the browser.
-- The trigger below blocks exactly that one path — a request whose JWT role
-- claim is 'authenticated' (i.e. RLS-scoped self-service). Everything else is
-- left alone: the admin panel's service-role client (auth.role() =
-- 'service_role'), and direct SQL — the dashboard SQL editor, `supabase db
-- push`, migrations — runs with no JWT at all (auth.role() is null there),
-- so it's unaffected. Self-service updates that happen to include `role`
-- (they shouldn't, but defence in depth) silently keep the old value instead
-- of erroring, so an unrelated profile edit never fails because of this.

alter table public.users add column if not exists role text not null default 'member';

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'users_role_check') then
    alter table public.users add constraint users_role_check check (role in ('member', 'admin'));
  end if;
end $$;

comment on column public.users.role is
  'Access level: ''member'' (default) or ''admin''. Only settable via the service-role client — see protect_user_role().';

create or replace function public.protect_user_role()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.role is distinct from old.role and (select auth.role()) = 'authenticated' then
    new.role := old.role;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_user_role on public.users;
create trigger protect_user_role
  before update of role on public.users
  for each row execute function public.protect_user_role();

notify pgrst, 'reload schema';
