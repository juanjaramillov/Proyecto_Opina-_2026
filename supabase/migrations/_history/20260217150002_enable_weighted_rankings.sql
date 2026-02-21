-- ========================================================
-- 20260217150000_enable_weighted_rankings.sql
-- Objetivo: Activar peso real en rankings y KPIs.
-- ========================================================

-- 1) VISTA: versus_results_weighted
-- Esta vista consolida los resultados de batallas usando pesos reales.
create or replace view public.versus_results_weighted as
select
    se.battle_id,
    se.option_id,
    se.choice_label,
    count(*)::bigint as signals_count,
    sum(se.signal_weight)::numeric as weighted_signals
from public.signal_events se
where se.source_type = 'versus'
group by se.battle_id, se.option_id, se.choice_label;

-- 2) AUDITORÍA / REFUERZO DE KPIs
-- Aseguramos que kpi_share_of_preference use weighted_signals para el cálculo de share_pct.
-- (Ya verificado en baseline_v8, pero lo dejamos explícito aquí para alineación CORE).

create or replace function public.kpi_share_of_preference(
  p_battle_id uuid,
  p_start_date timestamptz default null,
  p_end_date timestamptz default null
)
returns table (
  option_label text,
  option_id uuid,
  signals_count bigint,
  weighted_signals numeric,
  share_pct numeric
)
language sql
stable
as $$
  with base as (
    select
      se.choice_label as option_label,
      se.option_id,
      count(*)::bigint as signals_count,
      sum(se.signal_weight)::numeric as weighted_signals
    from public.signal_events se
    where se.battle_id = p_battle_id
      and (p_start_date is null or se.created_at >= p_start_date)
      and (p_end_date is null or se.created_at <= p_end_date)
    group by se.choice_label, se.option_id
  ),
  tot as (
    select nullif(sum(weighted_signals), 0)::numeric as total_weighted
    from base
  )
  select
    b.option_label,
    b.option_id,
    b.signals_count,
    b.weighted_signals,
    case when t.total_weighted is null then 0
         else round((b.weighted_signals / t.total_weighted) * 100, 2)
    end as share_pct
  from base b
  cross join tot t
  order by share_pct desc, signals_count desc;
$$;

-- 3) GRANTS
grant select on public.versus_results_weighted to anon, authenticated;
grant execute on function public.kpi_share_of_preference to anon, authenticated;
