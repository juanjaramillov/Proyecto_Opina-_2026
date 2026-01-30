-- Migración: KPIs Reales y Parche de Esquema (Tema 3)

-- 1. Schema Patch: Asegurar columnas críticas en signal_events
alter table public.signal_events
  add column if not exists battle_id uuid,
  add column if not exists battle_instance_id uuid,
  add column if not exists option_id uuid,
  add column if not exists signal_value integer default 1,
  add column if not exists signal_weight numeric default 1.0,
  add column if not exists user_tier text,
  add column if not exists profile_completeness integer default 0,
  add column if not exists meta jsonb default '{}'::jsonb,
  add column if not exists event_type text default 'vote',
  add column if not exists signal_id text,
  add column if not exists country text,
  add column if not exists city text;

create index if not exists idx_se_battle_id on public.signal_events(battle_id);
create index if not exists idx_se_created_at on public.signal_events(created_at);

-- 2. Cleanup: Eliminar funciones legacy/confusas
drop function if exists public.get_share_of_preference(text);
drop function if exists public.get_trend_velocity(text);
drop function if exists public.get_engagement_quality(text);
-- Eliminar versiones anteriores de KPIs que usaban solo instance_id si entran en conflicto
drop function if exists public.kpi_share_of_preference(uuid);
drop function if exists public.kpi_trend_velocity(uuid);
drop function if exists public.kpi_engagement_quality(uuid);

-- 3. KPI: Share of Preference (Historical + Filters)
create or replace function public.kpi_share_of_preference(
  p_battle_id uuid,
  p_start_date timestamptz default null,
  p_end_date timestamptz default null
)
returns table (
  option_id uuid,
  weighted_signals numeric,
  weighted_total numeric,
  share numeric
)
language sql
stable
as $$
  with base as (
    select
      se.option_id,
      (se.signal_value * coalesce(se.signal_weight, 1.0))::numeric as w
    from public.signal_events se
    where se.battle_id = p_battle_id
      and se.option_id is not null
      and (p_start_date is null or se.created_at >= p_start_date)
      and (p_end_date is null or se.created_at <= p_end_date)
  ),
  agg as (
    select
      option_id,
      sum(w) as weighted_signals
    from base
    group by option_id
  ),
  tot as (
    select sum(weighted_signals) as weighted_total
    from agg
  )
  select
    a.option_id,
    a.weighted_signals,
    coalesce(t.weighted_total, 0) as weighted_total,
    case when coalesce(t.weighted_total, 0) > 0 then round((a.weighted_signals / t.weighted_total) * 100, 2) else 0 end as share
  from agg a
  cross join tot t
  order by share desc;
$$;

-- 4. KPI: Trend Velocity (Historical + Filters)
create or replace function public.kpi_trend_velocity(
  p_battle_id uuid,
  p_bucket text default 'day',
  p_start_date timestamptz default null,
  p_end_date timestamptz default null
)
returns table (
  bucket_at timestamptz,
  weighted_signals numeric
)
language sql
stable
as $$
  select
    date_trunc(p_bucket, created_at) as bucket_at,
    sum((signal_value * coalesce(signal_weight, 1.0))::numeric) as weighted_signals
  from public.signal_events
  where battle_id = p_battle_id
    and (p_start_date is null or created_at >= p_start_date)
    and (p_end_date is null or created_at <= p_end_date)
  group by 1
  order by 1 asc;
$$;

-- 5. KPI: Engagement Quality (Historical + Filters)
create or replace function public.kpi_engagement_quality(
  p_battle_id uuid,
  p_start_date timestamptz default null,
  p_end_date timestamptz default null
)
returns table (
  metric_key text,
  metric_value numeric,
  metric_label text
)
language sql
stable
as $$
  with metrics as (
    select
      avg(coalesce(profile_completeness, 0)) as avg_completeness,
      avg(coalesce(signal_weight, 1.0)) as avg_weight,
      count(*) as total_events
    from public.signal_events
    where battle_id = p_battle_id
      and (p_start_date is null or created_at >= p_start_date)
      and (p_end_date is null or created_at <= p_end_date)
  )
  select 'avg_completeness'::text, round(avg_completeness, 1), 'Completitud Perfil'::text from metrics
  union all
  select 'avg_weight'::text, round(avg_weight, 2), 'Peso Promedio'::text from metrics
  union all
  select 'total_events'::text, total_events, 'Total Señales'::text from metrics;
$$;
