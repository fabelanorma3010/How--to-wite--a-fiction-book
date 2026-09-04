-- Widen public.users.role to also carry the pricing-tier values (Supporter,
-- Studio) alongside the existing member/admin values, so an admin can tag a
-- member's plan from the same dropdown that grants admin access.
--
-- 'member' keeps its stored value and stays the default — the admin UI just
-- labels it "Free" — so existing rows need no data migration, only the
-- allowed-values list changes. The protect_user_role() trigger from
-- 20260904120000_user_roles.sql is unaffected: it guards every role value
-- the same way, not just 'admin'.

alter table public.users drop constraint if exists users_role_check;
alter table public.users add constraint users_role_check
  check (role in ('member', 'supporter', 'studio', 'admin'));

notify pgrst, 'reload schema';
