-- Per-bucket daily usage counters for the AI features: the Fiction Helper chat,
-- illustration image generation, and the /tools writing tools. "Bucket" is the
-- signed-in user's id, or a salted one-way hash of the caller's IP for
-- anonymous visitors — so a cap survives clearing cookies, but we never store a
-- raw IP.
--
-- Only server code touches this table: RLS is on with no policies, so the
-- anon/authenticated roles can't reach it, and the routes go through the
-- service-role key. Increments run through check_ai_limit() so the check and
-- the bump are one atomic statement.

create table if not exists public.ai_usage (
  bucket  text    not null,
  day     date    not null default current_date,
  feature text    not null,
  count   integer not null default 0,
  primary key (bucket, day, feature)
);

comment on table public.ai_usage is
  'Daily per-user / per-hashed-IP call counts for the AI features. Server-only.';

alter table public.ai_usage enable row level security;
-- Intentionally no policies — unreachable from the anon/authenticated roles.

-- Rows from earlier days are dead weight; this index makes a periodic
-- "delete from ai_usage where day < current_date" cheap if you ever add one.
create index if not exists ai_usage_day_idx on public.ai_usage (day);

-- Atomically bump today's counter for (bucket, feature) and report whether the
-- caller is still within p_limit. Keeps incrementing when over the limit, so
-- repeated over-limit calls stay a single cheap upsert and the overage is
-- visible in the table.
create or replace function public.check_ai_limit(p_bucket text, p_feature text, p_limit integer)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_count integer;
begin
  insert into public.ai_usage (bucket, day, feature, count)
  values (p_bucket, current_date, p_feature, 1)
  on conflict (bucket, day, feature)
  do update set count = public.ai_usage.count + 1
  returning count into v_count;

  return v_count <= p_limit;
end;
$$;

revoke execute on function public.check_ai_limit(text, text, integer) from public, anon, authenticated;

notify pgrst, 'reload schema';
