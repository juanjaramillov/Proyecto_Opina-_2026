-- ==============================================================================
-- UNIFICATION MIGRATION
-- 1. Rename conflicting table (signals_events -> signals_events_backup)
-- 2. Update RPCs to read from the correct table (signal_events)
-- 3. Update RPC signatures to match signalService.ts calls (p_battle_id instead of instance)
-- ==============================================================================

-- 1. Backup logic (safeguard)
-- If signals_events exists, rename it.
do $$
begin
  if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'signals_events') then
    alter table signals_events rename to signals_events_backup;
  end if;
end $$;


-- =========================================================
-- KPI 1: Share of Preference
-- Updated to read from signal_events
-- Updated signature to match Service calls
-- =========================================================
create or replace function kpi_share_of_preference(
  p_battle_id uuid,
  p_start_date timestamptz default null,
  p_end_date timestamptz default null
)
returns table (
  option_id text,
  signals integer,
  share_pct numeric
)
language sql
security definer
as $$
with agg as (
  select
    se.option_id::text as option_id,
    count(*)::int as signals
  from signal_events se
  where se.battle_id = p_battle_id
    and (p_start_date is null or se.created_at >= p_start_date)
    and (p_end_date is null or se.created_at <= p_end_date)
    and se.option_id is not null -- ignore votes without explicit option (e.g. malformed)
  group by 1
),
tot as (
  select coalesce(sum(signals),0) as total
  from agg
)
select
  a.option_id,
  a.signals,
  case when t.total = 0 then 0 else round((a.signals::numeric / t.total::numeric) * 100, 2) end as share_pct
from agg a
cross join tot t
order by a.signals desc;
$$;

grant execute on function kpi_share_of_preference(uuid, timestamptz, timestamptz) to anon, authenticated;


-- =========================================================
-- KPI 2: Trend Velocity
-- Updated to read from signal_events
-- =========================================================
create or replace function kpi_trend_velocity(
  p_battle_id uuid,
  p_bucket text default 'day', -- unused in this simple logic but kept for signature
  p_start_date timestamptz default null,
  p_end_date timestamptz default null
)
returns table (
  option_id text,
  delta_signals integer
)
language sql
security definer
as $$
with last_24h as (
  select
    se.option_id::text as option_id,
    count(*)::int as c
  from signal_events se
  where se.battle_id = p_battle_id
    and se.created_at >= now() - interval '24 hours'
    and se.option_id is not null
  group by 1
),
prev_24h as (
  select
    se.option_id::text as option_id,
    count(*)::int as c
  from signal_events se
  where se.battle_id = p_battle_id
    and se.created_at >= now() - interval '48 hours'
    and se.created_at <  now() - interval '24 hours'
    and se.option_id is not null
  group by 1
),
base as (
  -- We need all options active in the last 48h
  select option_id from last_24h
  union
  select option_id from prev_24h
)
select
  b.option_id,
  (coalesce(l.c,0) - coalesce(p.c,0))::int as delta_signals
from base b
left join last_24h l on l.option_id = b.option_id
left join prev_24h p on p.option_id = b.option_id
order by b.option_id;
$$;

grant execute on function kpi_trend_velocity(uuid, text, timestamptz, timestamptz) to anon, authenticated;


-- =========================================================
-- KPI 3: Engagement Quality
-- Updated to read from signal_events
-- Using sum(signal_weight) since it exists in signal_events
-- =========================================================
create or replace function kpi_engagement_quality(
  p_battle_id uuid,
  p_start_date timestamptz default null,
  p_end_date timestamptz default null
)
returns table (
  option_id text,
  weighted_signals numeric
)
language sql
security definer
as $$
select
  se.option_id::text as option_id,
  coalesce(sum(se.signal_weight), count(*))::numeric as weighted_signals
from signal_events se
where se.battle_id = p_battle_id
  and (p_start_date is null or se.created_at >= p_start_date)
  and (p_end_date is null or se.created_at <= p_end_date)
  and se.option_id is not null
group by 1
order by weighted_signals desc;
$$;

grant execute on function kpi_engagement_quality(uuid, timestamptz, timestamptz) to anon, authenticated;
