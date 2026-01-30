-- KPI 1: Share of Preference (SoP)
create or replace function get_share_of_preference(input_versus_id text)
returns table (
  choice_label text,
  signals bigint,
  share_pct numeric
)
language sql
as $$
  select
    choice_label,
    count(*) as signals,
    round(100.0 * count(*) / sum(count(*)) over (), 2) as share_pct
  from signal_events
  where source_type = 'versus'
    and source_id = input_versus_id
  group by choice_label
  order by share_pct desc;
$$;

-- KPI 2: Trend Velocity (Delta)
create or replace function get_trend_velocity(input_versus_id text)
returns table (
  choice_label text,
  delta_signals bigint
)
language sql
as $$
  with daily as (
    select
      date_trunc('day', created_at) as day,
      choice_label,
      count(*) as signals
    from signal_events
    where source_type = 'versus'
      and source_id = input_versus_id
    group by day, choice_label
  )
  select
    choice_label,
    max(signals) - min(signals) as delta_signals
  from daily
  group by choice_label
  order by delta_signals desc;
$$;

-- KPI 3: Engagement Quality Index (EQI)
create or replace function get_engagement_quality(input_versus_id text)
returns table (
  choice_label text,
  weighted_signals numeric
)
language sql
as $$
  select
    se.choice_label,
    sum(
      case up.tier
        when 'verified_full_ci' then 2
        when 'verified_basic' then 1
        else 0.5
      end
    ) as weighted_signals
  from signal_events se
  left join user_profiles up on up.user_id = se.user_id
  where se.source_type = 'versus'
    and se.source_id = input_versus_id
  group by se.choice_label
  order by weighted_signals desc;
$$;
