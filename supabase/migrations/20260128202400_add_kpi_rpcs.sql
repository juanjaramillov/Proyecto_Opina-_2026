-- =========================================================
-- KPI 1: Share of Preference
-- Devuelve: option_id ('A'|'B'), signals, share_pct
-- =========================================================
create or replace function kpi_share_of_preference(p_battle_instance_id uuid)
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
    case when se.signal_value = 1 then 'A' else 'B' end as option_id,
    count(*)::int as signals
  from signals_events se
  where se.battle_id = p_battle_instance_id
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
order by a.option_id;
$$;

grant execute on function kpi_share_of_preference(uuid) to anon, authenticated;


-- =========================================================
-- KPI 2: Trend Velocity (últimas 24h vs 24h previas)
-- Devuelve: option_id ('A'|'B'), delta_signals
-- =========================================================
create or replace function kpi_trend_velocity(p_battle_instance_id uuid)
returns table (
  option_id text,
  delta_signals integer
)
language sql
security definer
as $$
with last_24h as (
  select
    case when se.signal_value = 1 then 'A' else 'B' end as option_id,
    count(*)::int as c
  from signals_events se
  where se.battle_id = p_battle_instance_id
    and se.created_at >= now() - interval '24 hours'
  group by 1
),
prev_24h as (
  select
    case when se.signal_value = 1 then 'A' else 'B' end as option_id,
    count(*)::int as c
  from signals_events se
  where se.battle_id = p_battle_instance_id
    and se.created_at >= now() - interval '48 hours'
    and se.created_at <  now() - interval '24 hours'
  group by 1
),
base as (
  select 'A'::text as option_id
  union all
  select 'B'::text
)
select
  b.option_id,
  (coalesce(l.c,0) - coalesce(p.c,0))::int as delta_signals
from base b
left join last_24h l on l.option_id = b.option_id
left join prev_24h p on p.option_id = b.option_id
order by b.option_id;
$$;

grant execute on function kpi_trend_velocity(uuid) to anon, authenticated;


-- =========================================================
-- KPI 3: Engagement Quality (sin pesos por ahora)
-- Devuelve: option_id ('A'|'B'), weighted_signals
-- Nota: como eliminamos signal_weight, esto equivale a cantidad.
-- =========================================================
create or replace function kpi_engagement_quality(p_battle_instance_id uuid)
returns table (
  option_id text,
  weighted_signals numeric
)
language sql
security definer
as $$
select
  case when se.signal_value = 1 then 'A' else 'B' end as option_id,
  count(*)::numeric as weighted_signals
from signals_events se
where se.battle_id = p_battle_instance_id
group by 1
order by 1;
$$;

grant execute on function kpi_engagement_quality(uuid) to anon, authenticated;
