-- Migración: Versionamiento de Señales y Agregaciones
-- Fecha: 2026-02-19

-- 1. Actualización de signal_events para Inmutabilidad
alter table public.signal_events 
  add column if not exists algorithm_version text default '1.0.0',
  add column if not exists computed_weight numeric(10,2),
  add column if not exists influence_level_snapshot text;

-- 2. Tabla de Agregaciones Horarias (Performance B2B)
create table if not exists public.signal_hourly_aggs (
  id uuid primary key default gen_random_uuid(),
  battle_id uuid references public.battles(id) on delete cascade,
  battle_instance_id uuid references public.battle_instances(id) on delete cascade,
  option_id uuid references public.battle_options(id) on delete cascade,
  
  -- Segmentación
  gender text,
  age_bucket text,
  region text,
  
  hour_bucket timestamptz not null,
  signals_count bigint default 0,
  weighted_sum numeric default 0,
  
  unique(battle_id, battle_instance_id, option_id, gender, age_bucket, region, hour_bucket)
);

create index if not exists idx_sha_lookup on public.signal_hourly_aggs(battle_id, hour_bucket);

-- 3. Función de Trigger para Agregación Automática
create or replace function public.fn_sync_signal_aggs()
returns trigger as $$
begin
  insert into public.signal_hourly_aggs (
    battle_id, battle_instance_id, option_id,
    gender, age_bucket, region,
    hour_bucket, signals_count, weighted_sum
  )
  values (
    NEW.battle_id, NEW.battle_instance_id, NEW.option_id,
    NEW.gender, NEW.age_bucket, NEW.region,
    date_trunc('hour', NEW.created_at), 1, NEW.signal_weight
  )
  on conflict (battle_id, battle_instance_id, option_id, gender, age_bucket, region, hour_bucket)
  do update set
    signals_count = public.signal_hourly_aggs.signals_count + 1,
    weighted_sum = public.signal_hourly_aggs.weighted_sum + NEW.signal_weight;
  
  return NEW;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_sync_signal_aggs on public.signal_events;
create trigger trg_sync_signal_aggs
after insert on public.signal_events
for each row execute function public.fn_sync_signal_aggs();

-- 4. Actualización del RPC insert_signal_event
create or replace function public.insert_signal_event(
  p_battle_id uuid,
  p_option_id uuid
)
returns void
language plpgsql
security definer
as $$
declare
  v_instance_id uuid;
  v_anon_id text;
  v_weight numeric;
  v_tier text;
  v_completeness int;
  v_gender text;
  v_age text;
  v_region text;
  v_algo_v text := '1.1.0'; -- Nueva versión con inmutabilidad
begin
  if auth.uid() is null then raise exception 'Unauthorized'; end if;
  v_anon_id := public.get_or_create_anon_id();

  -- Resolver instancia activa
  select id into v_instance_id from public.battle_instances 
  where battle_id = p_battle_id order by created_at desc limit 1;

  -- Snapshot del perfil
  select p.gender, p.age_bucket, p.region, p.tier, p.profile_completeness, coalesce(us.signal_weight, 1.0)
  into v_gender, v_age, v_region, v_tier, v_completeness, v_weight
  from public.profiles p
  left join public.user_stats us on us.user_id = p.id
  where p.id = auth.uid() limit 1;

  insert into public.signal_events (
    anon_id, battle_id, battle_instance_id, option_id, 
    signal_weight, computed_weight, algorithm_version,
    influence_level_snapshot, user_tier, profile_completeness,
    gender, age_bucket, region, created_at
  )
  values (
    v_anon_id, p_battle_id, v_instance_id, p_option_id,
    v_weight, v_weight, v_algo_v,
    v_tier, v_tier, v_completeness,
    v_gender, v_age, v_region, now()
  );

  -- Actualizar stats
  insert into public.user_stats (user_id, total_signals, last_signal_at)
  values (auth.uid(), 1, now())
  on conflict (user_id) do update set 
    total_signals = public.user_stats.total_signals + 1,
    last_signal_at = now();
end;
$$;
