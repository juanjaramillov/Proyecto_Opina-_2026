-- =========================================================
-- Opina+ V12: Stable Schema Maestro
-- Objetivo: Consolidar todas las mejoras de anonimato, 
--           segmentación y analítica en un solo bloque estable.
-- =========================

-- 0) EXTENSIONES
create extension if not exists pgcrypto;

-- =========================================================
-- 1) TABLAS CORE (SI NO EXISTEN)
-- =========================================================

-- Identidades Anónimas (Mapeo Irreversible)
create table if not exists public.anonymous_identities (
  user_id uuid primary key references auth.users(id) on delete cascade,
  anon_id text unique not null,
  created_at timestamptz not null default now()
);

-- Eventos de Señales (Fact Table Principal)
create table if not exists public.signal_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  anon_id text not null, -- NO user_id (Anonimato Irreversible)
  
  -- Contexto
  source_type text not null default 'versus',
  battle_id uuid references public.battles(id) on delete set null,
  battle_instance_id uuid references public.battle_instances(id) on delete set null,
  option_id uuid references public.battle_options(id) on delete set null,
  
  -- Valores
  signal_weight numeric(10,2) not null default 1,
  
  -- Segmentación Denormalizada (Snapshot)
  gender text,
  age_bucket text,
  region text,
  country text default 'CL',
  
  -- Metadata
  user_tier text default 'guest',
  profile_completeness int default 0,
  meta jsonb not null default '{}'::jsonb
);

-- Respuestas de Profundidad
create table if not exists public.depth_answers_structured (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  anon_id text not null,
  option_id uuid not null references public.battle_options(id) on delete cascade,
  question_key text not null,
  answer_value text not null,
  
  -- Segmentación Denormalizada
  gender text,
  age_bucket text,
  region text
);

-- Logs de Estado Personal (Mood, Economy, etc.)
create table if not exists public.user_state_logs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  anon_id text not null,
  
  mood_score int,
  economic_score int,
  job_score int,
  happiness_score int,
  
  -- Segmentación Denormalizada
  gender text,
  age_bucket text,
  region text
);

-- =========================================================
-- 2) INDEXACIÓN (PERFORMANCE)
-- =========================================================
create index if not exists idx_se_anon on public.signal_events(anon_id);
create index if not exists idx_se_battle on public.signal_events(battle_id, created_at);
create index if not exists idx_se_segment on public.signal_events(gender, age_bucket, region);

create index if not exists idx_depth_anon on public.depth_answers_structured(anon_id);
create index if not exists idx_depth_option_key on public.depth_answers_structured(option_id, question_key);

create index if not exists idx_state_anon on public.user_state_logs(anon_id);
create index if not exists idx_state_segment on public.user_state_logs(gender, age_bucket, region);

-- =========================================================
-- 3) RPCs: IDENTIDAD Y ESCRITURA SEGURA
-- =========================================================

-- Obtener o crear ID anónimo
create or replace function public.get_or_create_anon_id()
returns text
language plpgsql
security definer
as $$
declare
  v_anon_id text;
begin
  if auth.uid() is null then return null; end if;

  select ai.anon_id into v_anon_id
  from public.anonymous_identities ai
  where ai.user_id = auth.uid() limit 1;

  if v_anon_id is null then
    v_anon_id := encode(gen_random_bytes(16), 'hex');
    insert into public.anonymous_identities (user_id, anon_id)
    values (auth.uid(), v_anon_id)
    on conflict (user_id) do nothing;
    
    -- Re-fetch en caso de carrera o conflict
    if v_anon_id is null then
       select ai.anon_id into v_anon_id from public.anonymous_identities ai where ai.user_id = auth.uid();
    end if;
  end if;

  return v_anon_id;
end;
$$;

-- Inserción Segura de Señales
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
    signal_weight, user_tier, profile_completeness,
    gender, age_bucket, region, created_at
  )
  values (
    v_anon_id, p_battle_id, v_instance_id, p_option_id,
    v_weight, v_tier, v_completeness,
    v_gender, v_age, v_region, now()
  );

  -- Actualizar stats (simple increment)
  insert into public.user_stats (user_id, total_signals, last_signal_at)
  values (auth.uid(), 1, now())
  on conflict (user_id) do update set 
    total_signals = public.user_stats.total_signals + 1,
    last_signal_at = now();
end;
$$;

-- Inserción de Profundidad (JSONB Support)
create or replace function public.insert_depth_answers(
  p_option_id uuid,
  p_answers jsonb
)
returns void
language plpgsql
security definer
as $$
declare
  v_anon_id text;
  v_gender text;
  v_age text;
  v_region text;
  v_answer record;
begin
  if auth.uid() is null then raise exception 'Unauthorized'; end if;
  v_anon_id := public.get_or_create_anon_id();

  select p.gender, p.age_bucket, p.region into v_gender, v_age, v_region
  from public.profiles p where p.id = auth.uid() limit 1;

  for v_answer in select * from jsonb_to_recordset(p_answers) as x(question_key text, answer_value text)
  loop
    insert into public.depth_answers_structured (
      anon_id, option_id, question_key, answer_value,
      gender, age_bucket, region, created_at
    )
    values (
      v_anon_id, p_option_id, v_answer.question_key, v_answer.answer_value,
      v_gender, v_age, v_region, now()
    );
  end loop;
end;
$$;

-- Inserción de Estado Personal
create or replace function public.insert_user_state(
  p_mood_score int, p_economic_score int, p_job_score int, p_happiness_score int
)
returns void
language plpgsql
security definer
as $$
declare
  v_anon_id text;
  v_gender text; v_age text; v_region text;
begin
  v_anon_id := public.get_or_create_anon_id();
  select gender, age_bucket, region into v_gender, v_age, v_region
  from public.profiles where id = auth.uid() limit 1;

  insert into public.user_state_logs (
    anon_id, mood_score, economic_score, job_score, happiness_score,
    gender, age_bucket, region, created_at
  )
  values (
    v_anon_id, p_mood_score, p_economic_score, p_job_score, p_happiness_score,
    v_gender, v_age, v_region, now()
  );
end;
$$;

-- =========================================================
-- 4) RPCs: ANALÍTICA Y KEY PERFORMANCE INDICATORS
-- =========================================================

-- KPI: Share of Preference (Real-time)
create or replace function public.kpi_share_of_preference(
  p_battle_id uuid,
  p_start_date timestamptz default null,
  p_end_date timestamptz default null
)
returns table (
  option_id uuid,
  option_label text,
  signals_count bigint,
  weighted_signals numeric,
  share_pct numeric
)
language sql stable as $$
with agg as (
  select 
    se.option_id,
    count(*) as c,
    sum(se.signal_weight) as w
  from public.signal_events se
  where se.battle_id = p_battle_id
    and (p_start_date is null or se.created_at >= p_start_date)
    and (p_end_date is null or se.created_at <= p_end_date)
  group by se.option_id
),
tot as (select sum(w) as total from agg)
select 
  bo.id,
  bo.label,
  coalesce(agg.c, 0),
  coalesce(agg.w, 0),
  case when tot.total > 0 then round((coalesce(agg.w, 0) / tot.total) * 100, 2) else 0 end
from public.battle_options bo
left join agg on agg.option_id = bo.id
cross join tot
where bo.battle_id = p_battle_id
order by bo.sort_order;
$$;

-- KPI: Trend Velocity (Velocity of Signals)
create or replace function public.kpi_trend_velocity(
  p_battle_id uuid,
  p_bucket text default 'hour',
  p_start_date timestamptz default null,
  p_end_date timestamptz default null
)
returns table (
  time_bucket timestamp,
  option_id uuid,
  signals_delta bigint
)
language sql stable as $$
  select 
    date_trunc(p_bucket, se.created_at) as t,
    se.option_id,
    count(*)
  from public.signal_events se
  where se.battle_id = p_battle_id
    and (p_start_date is null or se.created_at >= p_start_date)
    and (p_end_date is null or se.created_at <= p_end_date)
  group by 1, 2
  order by 1 desc, 2;
$$;

-- Depth Analytics: Global
create or replace function public.get_depth_analytics(
  p_option_id uuid,
  p_gender text default null, p_age_bucket text default null, p_region text default null
)
returns table (question_key text, avg_value numeric, total_responses bigint)
language sql stable as $$
  select 
    question_key,
    avg(case when answer_value ~ '^[0-9]+$' then answer_value::numeric else null end),
    count(*)
  from public.depth_answers_structured
  where option_id = p_option_id
    and (p_gender is null or gender = p_gender)
    and (p_age_bucket is null or age_bucket = p_age_bucket)
    and (p_region is null or region = p_region)
  group by question_key;
$$;

-- Depth Comparison: Head-to-Head
create or replace function public.get_depth_comparison(
  p_option_a uuid, p_option_b uuid,
  p_gender text default null, p_age_bucket text default null, p_region text default null
)
returns table (option_id uuid, question_key text, avg_value numeric, total_responses bigint)
language sql stable as $$
  select 
    option_id, question_key,
    avg(case when answer_value ~ '^[0-9]+$' then answer_value::numeric else null end),
    count(*)
  from public.depth_answers_structured
  where option_id in (p_option_a, p_option_b)
    and (p_gender is null or gender = p_gender)
    and (p_age_bucket is null or age_bucket = p_age_bucket)
    and (p_region is null or region = p_region)
  group by 1, 2;
$$;

-- Depth Trend: Temporal Evolution
create or replace function public.get_depth_trend(
  p_option_id uuid, p_question_key text, p_bucket text default 'day',
  p_gender text default null, p_age_bucket text default null, p_region text default null
)
returns table (time_bucket timestamp, avg_value numeric, total_responses bigint)
language sql stable as $$
  select 
    date_trunc(p_bucket, created_at) as t,
    avg(case when answer_value ~ '^[0-9]+$' then answer_value::numeric else null end),
    count(*)
  from public.depth_answers_structured
  where option_id = p_option_id and question_key = p_question_key
    and (p_gender is null or gender = p_gender)
    and (p_age_bucket is null or age_bucket = p_age_bucket)
    and (p_region is null or region = p_region)
  group by 1
  order by 1 desc;
$$;

-- State Engine: Benchmarks (Me vs World)
create or replace function public.get_state_benchmarks()
returns jsonb language plpgsql security definer stable as $$
declare
  v_ugent text; v_uage text; v_ureg text; v_res jsonb;
begin
  select gender, age_bucket, region into v_ugent, v_uage, v_ureg
  from public.profiles where id = auth.uid() limit 1;

  with global_avg as (
    select avg(mood_score)::numeric(10,2) as m, avg(economic_score)::numeric(10,2) as e,
           avg(job_score)::numeric(10,2) as j, avg(happiness_score)::numeric(10,2) as h, count(*)::int as n
    from public.user_state_logs
  ),
  segment_avg as (
    select avg(mood_score)::numeric(10,2) as m, avg(economic_score)::numeric(10,2) as e,
           avg(job_score)::numeric(10,2) as j, avg(happiness_score)::numeric(10,2) as h, count(*)::int as n
    from public.user_state_logs where gender = v_ugent and age_bucket = v_uage and region = v_ureg
  )
  select jsonb_build_object(
    'country', (select row_to_json(global_avg.*) from global_avg),
    'segment', (select row_to_json(segment_avg.*) from segment_avg),
    'meta', jsonb_build_object('gender', v_ugent, 'age', v_uage, 'region', v_ureg)
  ) into v_res;
  return v_res;
end;
$$;

-- =========================================================
-- 5) SEGURIDAD Y PERMISOS
-- =========================
alter table public.signal_events enable row level security;
alter table public.depth_answers_structured enable row level security;
alter table public.user_state_logs enable row level security;

-- Solo lectura de lo propio (anónimo pero linkeado por anon_id)
create policy "Read own pulses" on public.signal_events for select 
using (anon_id = public.get_or_create_anon_id());

create policy "Read own depth" on public.depth_answers_structured for select 
using (anon_id = public.get_or_create_anon_id());

create policy "Read own state" on public.user_state_logs for select 
using (anon_id = public.get_or_create_anon_id());

-- Permisos de ejecución
grant execute on all functions in schema public to authenticated;
grant select on all tables in schema public to authenticated;
grant select on all tables in schema public to anon;

-- Revocar inserts directos (Forzar RPCs para seguridad de anon_id)
revoke insert on public.signal_events from authenticated, anon;
revoke insert on public.depth_answers_structured from authenticated, anon;
revoke insert on public.user_state_logs from authenticated, anon;

-- =========================================================
-- FIN DE MASTER SCHEMA V12
-- =========================================================
