-- =========================================================
-- State Engine: Denormalization & Benchmarks (Bloque 2A)
-- Objetivo: Permitir comparativas Yo vs. Segmento vs. País
-- =========================================================

-- 1) Mejorar user_state_logs con segmentación denormalizada
alter table public.user_state_logs
  add column if not exists gender text,
  add column if not exists age_bucket text,
  add column if not exists region text;

create index if not exists idx_user_state_logs_segmentation
  on public.user_state_logs(gender, age_bucket, region);

-- 2) RPC: insert_user_state (Secure Ingestion)
create or replace function public.insert_user_state(
  p_mood_score int,
  p_economic_score int,
  p_job_score int,
  p_happiness_score int
)
returns void
language plpgsql
security definer
as $$
declare
  v_anon_id text;
  v_gender text;
  v_age_bucket text;
  v_region text;
begin
  if auth.uid() is null then
    raise exception 'User not authenticated';
  end if;

  v_anon_id := public.get_or_create_anon_id();

  select p.gender, p.age_bucket, p.region
    into v_gender, v_age_bucket, v_region
  from public.profiles p
  where p.id = auth.uid()
  limit 1;

  insert into public.user_state_logs (
    anon_id, mood_score, economic_score, job_score, happiness_score,
    gender, age_bucket, region, created_at
  )
  values (
    v_anon_id, p_mood_score, p_economic_score, p_job_score, p_happiness_score,
    v_gender, v_age_bucket, v_region, now()
  );
end;
$$;

grant execute on function public.insert_user_state(int, int, int, int) to authenticated;

-- 3) RPC: get_state_benchmarks (The core of State Engine)
create or replace function public.get_state_benchmarks()
returns jsonb
language plpgsql
security definer
stable
as $$
declare
  v_user_gender text;
  v_user_age_bucket text;
  v_user_region text;
  v_result jsonb;
begin
  if auth.uid() is null then
    raise exception 'User not authenticated';
  end if;

  -- 1. Obtener segmentación del usuario actual
  select p.gender, p.age_bucket, p.region
    into v_user_gender, v_user_age_bucket, v_user_region
  from public.profiles p
  where p.id = auth.uid()
  limit 1;

  -- 2. Calcular benchmarks (Global vs Segmento)
  with global_avg as (
    select
      avg(mood_score)::numeric(10,2) as mood,
      avg(economic_score)::numeric(10,2) as economic,
      avg(job_score)::numeric(10,2) as job,
      avg(happiness_score)::numeric(10,2) as happiness,
      count(*)::int as total_n
    from public.user_state_logs
  ),
  segment_avg as (
    select
      avg(mood_score)::numeric(10,2) as mood,
      avg(economic_score)::numeric(10,2) as economic,
      avg(job_score)::numeric(10,2) as job,
      avg(happiness_score)::numeric(10,2) as happiness,
      count(*)::int as segment_n
    from public.user_state_logs
    where gender = v_user_gender
      and age_bucket = v_user_age_bucket
      and region = v_user_region
  )
  select jsonb_build_object(
    'country', (select row_to_json(global_avg.*) from global_avg),
    'segment', (select row_to_json(segment_avg.*) from segment_avg),
    'user_segment_meta', jsonb_build_object(
      'gender', v_user_gender,
      'age_bucket', v_user_age_bucket,
      'region', v_user_region
    )
  ) into v_result;

  return v_result;
end;
$$;

grant execute on function public.get_state_benchmarks() to authenticated;

-- Revocar inserts directos
revoke insert on table public.user_state_logs from anon;
revoke insert on table public.user_state_logs from authenticated;
