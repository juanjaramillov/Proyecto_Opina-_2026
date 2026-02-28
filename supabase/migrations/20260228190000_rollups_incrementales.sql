-- Rollups incrementales para evitar full table scans en rankings/snapshots
-- Estrategia:
-- 1) Guardamos un watermark de "último evento procesado"
-- 2) Cada ejecución agrega/actualiza rollups por hora y segmento
-- 3) Los snapshots se generan desde rollups (rápido)

begin;

-- 0) Estado (watermark)
create table if not exists public.rollup_state (
  id text primary key default 'signal_events' ,
  last_event_ts timestamptz not null default '1970-01-01'::timestamptz,
  updated_at timestamptz not null default now()
);

insert into public.rollup_state (id) values ('signal_events')
on conflict (id) do nothing;

-- 1) Rollup por hora + segmento base
create table if not exists public.signal_rollups_hourly (
  bucket_ts timestamptz not null,                  -- truncado a la hora
  module_type text not null,                       
  battle_id uuid null,
  option_id uuid null,

  -- Segmentos (valores estables extraídos de signal_events)
  region text null,
  gender text null,
  age_bucket text null,

  signals_count bigint not null default 0,
  weight_sum numeric not null default 0,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  primary key (bucket_ts, module_type, battle_id, option_id, region, gender, age_bucket)
);

create index if not exists idx_rollups_hourly_bucket on public.signal_rollups_hourly (bucket_ts desc);
create index if not exists idx_rollups_hourly_module on public.signal_rollups_hourly (module_type);

-- 2) Función incremental: procesa solo eventos nuevos desde watermark
create or replace function public.rollup_signal_events_incremental(p_max_lag_minutes int default 2)
returns void
language plpgsql
as $$
declare
  v_from timestamptz;
  v_to timestamptz;
begin
  select last_event_ts into v_from
  from public.rollup_state
  where id = 'signal_events';

  v_to := now() - make_interval(mins => p_max_lag_minutes);

  if v_to <= v_from then
    return;
  end if;

  insert into public.signal_rollups_hourly (
    bucket_ts,
    module_type,
    battle_id,
    option_id,
    region,
    gender,
    age_bucket,
    signals_count,
    weight_sum,
    updated_at
  )
  select
    date_trunc('hour', se.created_at) as bucket_ts,
    se.module_type,
    se.battle_id,
    se.option_id,
    se.region,
    se.gender,
    se.age_bucket,
    count(*)::bigint as signals_count,
    coalesce(sum(se.signal_weight),0)::numeric as weight_sum,
    now() as updated_at
  from public.signal_events se
  where se.created_at > v_from
    and se.created_at <= v_to
  group by 1,2,3,4,5,6,7
  on conflict (bucket_ts, module_type, battle_id, option_id, region, gender, age_bucket)
  do update set
    signals_count = public.signal_rollups_hourly.signals_count + excluded.signals_count,
    weight_sum = public.signal_rollups_hourly.weight_sum + excluded.weight_sum,
    updated_at = now();

  update public.rollup_state
  set last_event_ts = v_to,
      updated_at = now()
  where id = 'signal_events';
end;
$$;

-- 3) Reemplazo de snapshots: generar desde rollups (rápido) adaptado al schema real
create or replace function public.refresh_public_rank_snapshots_from_rollups(p_window_days int default 30)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_bucket timestamptz;
  v_lock boolean;
begin
  v_bucket := date_trunc('hour', now()) - (extract(hour from now())::int % 3) * interval '1 hour';

  v_lock := pg_try_advisory_lock(hashtext('refresh_public_rank_snapshots_3h_v2'));
  if v_lock is not true then
    return;
  end if;

  delete from public.public_rank_snapshots
  where snapshot_bucket = v_bucket;

  -- Para aislar los datos dentro de la ventana de tiempo (ej. últimos 30 días)
  create temp table tmp_window_rollups as
  select *
  from public.signal_rollups_hourly
  where bucket_ts >= now() - (p_window_days || ' days')::interval;

  -- 1. GLOBAL
  insert into public.public_rank_snapshots (
    snapshot_bucket, module_type, battle_id, option_id, score, signals_count, segment, segment_hash
  )
  select
    v_bucket,
    module_type,
    battle_id,
    option_id,
    coalesce(sum(weight_sum), 0)::numeric,
    coalesce(sum(signals_count), 0)::int,
    '{}'::jsonb,
    'global'
  from tmp_window_rollups
  where battle_id is not null and option_id is not null
  group by module_type, battle_id, option_id;

  -- 2. GENDER
  insert into public.public_rank_snapshots (
    snapshot_bucket, module_type, battle_id, option_id, score, signals_count, segment, segment_hash
  )
  select
    v_bucket,
    module_type,
    battle_id,
    option_id,
    coalesce(sum(weight_sum), 0)::numeric,
    coalesce(sum(signals_count), 0)::int,
    jsonb_build_object('gender', gender),
    'gender:' || coalesce(gender,'unknown')
  from tmp_window_rollups
  where battle_id is not null and option_id is not null
  group by module_type, battle_id, option_id, gender;

  -- 3. REGION
  insert into public.public_rank_snapshots (
    snapshot_bucket, module_type, battle_id, option_id, score, signals_count, segment, segment_hash
  )
  select
    v_bucket,
    module_type,
    battle_id,
    option_id,
    coalesce(sum(weight_sum), 0)::numeric,
    coalesce(sum(signals_count), 0)::int,
    jsonb_build_object('region', region),
    'region:' || coalesce(region,'unknown')
  from tmp_window_rollups
  where battle_id is not null and option_id is not null
  group by module_type, battle_id, option_id, region;

  -- 4. GENDER + REGION
  insert into public.public_rank_snapshots (
    snapshot_bucket, module_type, battle_id, option_id, score, signals_count, segment, segment_hash
  )
  select
    v_bucket,
    module_type,
    battle_id,
    option_id,
    coalesce(sum(weight_sum), 0)::numeric,
    coalesce(sum(signals_count), 0)::int,
    jsonb_build_object('gender', gender, 'region', region),
    'gender:' || coalesce(gender,'unknown') || '|region:' || coalesce(region,'unknown')
  from tmp_window_rollups
  where battle_id is not null and option_id is not null
  group by module_type, battle_id, option_id, gender, region;

  drop table tmp_window_rollups;
  perform pg_advisory_unlock(hashtext('refresh_public_rank_snapshots_3h_v2'));
end;
$$;

-- 4) Cron: ejecutar rollup frecuente + snapshot cada 3h
select
  cron.schedule(
    'rollup_signal_events_5m',
    '*/5 * * * *',
    $$select public.rollup_signal_events_incremental(2);$$
  )
where not exists (
  select 1 from cron.job where jobname = 'rollup_signal_events_5m'
);

select
  cron.schedule(
    'refresh_public_rank_snapshots_3h_from_rollups',
    '0 */3 * * *',
    $$select public.refresh_public_rank_snapshots_from_rollups(30);$$
  )
where not exists (
  select 1 from cron.job where jobname = 'refresh_public_rank_snapshots_3h_from_rollups'
);

commit;
