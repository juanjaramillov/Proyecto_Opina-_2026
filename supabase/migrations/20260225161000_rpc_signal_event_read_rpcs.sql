begin;

-- =========================================================
-- RPC 1: Participation Summary (self only)
-- =========================================================
create or replace function public.get_my_participation_summary()
returns table(
  versus_count int,
  progressive_count int,
  depth_count int
)
language sql
security definer
set search_path = public, pg_temp
as $$
  select
    count(distinct signal_id) filter (where module_type = 'versus')::int      as versus_count,
    count(distinct signal_id) filter (where module_type = 'progressive')::int as progressive_count,
    count(distinct signal_id) filter (where module_type = 'depth')::int       as depth_count
  from public.signal_events
  where user_id = auth.uid();
$$;

revoke all on function public.get_my_participation_summary() from public, anon;
grant execute on function public.get_my_participation_summary() to authenticated;


-- =========================================================
-- RPC 2: Activity History (self only, unique by signal_id)
-- =========================================================
create or replace function public.get_my_activity_history(p_limit int default 20)
returns table(
  id text,
  created_at timestamptz,
  module_type text,
  option_id uuid,
  battle_id uuid
)
language sql
security definer
set search_path = public, pg_temp
as $$
  with latest as (
    select distinct on (signal_id)
      signal_id::text as id,
      created_at,
      module_type,
      option_id,
      battle_id
    from public.signal_events
    where user_id = auth.uid()
    order by signal_id, created_at desc
  )
  select *
  from latest
  order by created_at desc
  limit greatest(1, least(coalesce(p_limit, 20), 100));
$$;

revoke all on function public.get_my_activity_history(int) from public, anon;
grant execute on function public.get_my_activity_history(int) to authenticated;


-- =========================================================
-- RPC 3: Session vote counts (self only)
-- =========================================================
create or replace function public.get_session_vote_counts(p_session_id uuid)
returns table(
  option_id uuid,
  votes_count int
)
language sql
security definer
set search_path = public, pg_temp
as $$
  select
    option_id,
    count(*)::int as votes_count
  from public.signal_events
  where user_id = auth.uid()
    and session_id = p_session_id
    and option_id is not null
  group by option_id;
$$;

revoke all on function public.get_session_vote_counts(uuid) from public, anon;
grant execute on function public.get_session_vote_counts(uuid) to authenticated;


-- =========================================================
-- RPC 4: Depth distribution values (no user_id returned)
-- =========================================================
create or replace function public.get_depth_distribution_values(
  p_option_id uuid,
  p_context_id text default 'nota_general'
)
returns table(
  value_numeric numeric
)
language sql
security definer
set search_path = public, pg_temp
as $$
  select se.value_numeric
  from public.signal_events se
  where se.module_type = 'depth'
    and se.option_id = p_option_id
    and se.context_id = p_context_id
    and se.value_numeric is not null;
$$;

revoke all on function public.get_depth_distribution_values(uuid, text) from public, anon;
grant execute on function public.get_depth_distribution_values(uuid, text) to authenticated;

commit;
