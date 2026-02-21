-- =========================================================
-- Runtime Anonymity Alignment (Bloque X)
-- Objetivo: Anonimato real + analítica sin joins reversibles
-- =========================================================

-- 0) EXTENSION (por si no está)
create extension if not exists pgcrypto;

-- =========================================================
-- 1) SIGNAL EVENTS: anon_id + segmentación denormalizada
-- =========================================================
alter table public.signal_events
  add column if not exists anon_id text,
  add column if not exists gender text,
  add column if not exists age_bucket text,
  add column if not exists region text;

create index if not exists idx_signal_events_anon_id
  on public.signal_events(anon_id);

-- si existía user_id, lo removemos (anonimato irreversible en la tabla)
-- PRIMERO: Eliminar dependencias que bloquean el DROP
drop policy if exists "signal_events_select_own" on public.signal_events;
drop policy if exists "Allow insert for authenticated users" on public.signal_events;
drop view if exists public.signals_events cascade;

alter table public.signal_events
  drop column if exists user_id;

-- constraint vieja (si existe)
alter table public.signal_events
  drop constraint if exists signal_events_one_vote_per_instance;

-- nueva constraint: evita doble voto por instancia usando anon_id
-- ojo: requiere que battle_instance_id exista (en el modelo actual existe)
alter table public.signal_events
  add constraint signal_events_one_vote_per_instance
  unique (anon_id, battle_instance_id);

-- =========================================================
-- 2) RPC: get_or_create_anon_id (si no existe)
-- =========================================================
-- Si ya existe, esto no rompe porque es OR REPLACE.
create or replace function public.get_or_create_anon_id()
returns text
language plpgsql
security definer
as $$
declare
  v_anon_id text;
begin
  if auth.uid() is null then
    raise exception 'User not authenticated';
  end if;

  -- tabla debe existir (ya la tienes en 20260218000100)
  select ai.anon_id
    into v_anon_id
  from public.anonymous_identities ai
  where ai.user_id = auth.uid()
  limit 1;

  if v_anon_id is null then
    v_anon_id := encode(gen_random_bytes(16), 'hex');
    insert into public.anonymous_identities (user_id, anon_id)
    values (auth.uid(), v_anon_id)
    on conflict (user_id) do update set anon_id = excluded.anon_id;
  end if;

  return v_anon_id;
end;
$$;

grant execute on function public.get_or_create_anon_id() to authenticated;

-- =========================================================
-- 3) RPC: insert_signal_event (actualizado a anon_id + denormalización)
-- =========================================================
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
  v_weight numeric;
  v_tier text;
  v_completeness int;
  v_anon_id text;

  v_gender text;
  v_age_bucket text;
  v_region text;
begin
  if auth.uid() is null then
    raise exception 'User not authenticated';
  end if;

  -- 1) Resolver instancia activa (si no hay, crear una)
  select bi.id
    into v_instance_id
  from public.battle_instances bi
  where bi.battle_id = p_battle_id
    and (bi.starts_at is null or bi.starts_at <= now())
    and (bi.ends_at is null or bi.ends_at >= now())
  order by bi.created_at desc
  limit 1;

  if v_instance_id is null then
    insert into public.battle_instances (battle_id, version, starts_at)
    values (p_battle_id, 1, now())
    returning id into v_instance_id;
  end if;

  -- 2) Obtener stats del usuario (para peso)
  select us.signal_weight, up.tier, up.profile_completeness
    into v_weight, v_tier, v_completeness
  from public.user_stats us
  left join public.profiles up on up.id = auth.uid()
  where us.user_id = auth.uid()
  limit 1;

  v_weight := coalesce(v_weight, 1.0);
  v_tier := coalesce(v_tier, 'registered');
  v_completeness := coalesce(v_completeness, 0);

  -- 3) anon_id + segmentación denormalizada
  v_anon_id := public.get_or_create_anon_id();

  select p.gender, p.age_bucket, p.region
    into v_gender, v_age_bucket, v_region
  from public.profiles p
  where p.id = auth.uid()
  limit 1;

  -- 4) Insert evento
  insert into public.signal_events (
    anon_id, battle_id, battle_instance_id, option_id,
    signal_weight, user_tier, profile_completeness,
    source_type, created_at,
    gender, age_bucket, region
  )
  values (
    v_anon_id, p_battle_id, v_instance_id, p_option_id,
    v_weight, v_tier, v_completeness,
    'versus', now(),
    v_gender, v_age_bucket, v_region
  );

  -- 5) Update user_stats (snapshot básico)
  insert into public.user_stats (user_id, total_signals, weighted_score, level, signal_weight, last_signal_at)
  values (auth.uid(), 1, v_weight, 1, v_weight, now())
  on conflict (user_id) do update set
    total_signals = public.user_stats.total_signals + 1,
    weighted_score = public.user_stats.weighted_score + v_weight,
    last_signal_at = now(),
    updated_at = now();

end;
$$;

grant execute on function public.insert_signal_event(uuid, uuid) to authenticated;

-- =========================================================
-- 4) DEPTH: depth_answers_structured pasa a anon_id + segmentación
-- =========================================================
alter table public.depth_answers_structured
  add column if not exists anon_id text,
  add column if not exists gender text,
  add column if not exists age_bucket text,
  add column if not exists region text;

create index if not exists idx_depth_answers_structured_anon_id
  on public.depth_answers_structured(anon_id);

-- si existe user_id en esta tabla, la removemos
drop policy if exists "depth_structured_insert_own" on public.depth_answers_structured;
drop policy if exists "depth_structured_select_own" on public.depth_answers_structured;

alter table public.depth_answers_structured
  drop column if exists user_id;

-- =========================================================
-- 5) RPC get_depth_analytics sin JOIN: usa columnas denormalizadas
-- =========================================================
create or replace function public.get_depth_analytics(
  p_option_id uuid,
  p_gender text default null,
  p_age_bucket text default null,
  p_region text default null
)
returns table (
  question_key text,
  avg_numeric_value numeric,
  total_responses bigint
)
language sql
stable
as $$
  select
    das.question_key,
    avg(
      case
        when das.answer_value ~ '^[0-9]+$' then das.answer_value::numeric
        else null
      end
    ) as avg_numeric_value,
    count(*) as total_responses
  from public.depth_answers_structured das
  where das.option_id = p_option_id
    and (p_gender is null or das.gender = p_gender)
    and (p_age_bucket is null or das.age_bucket = p_age_bucket)
    and (p_region is null or das.region = p_region)
  group by das.question_key;
$$;

grant execute on function public.get_depth_analytics(uuid, text, text, text) to authenticated;

-- =========================================================
-- 6) NOTA: RLS / permisos (mínimo viable)
-- =========================================================
-- Mantén lectura pública SOLO por vistas agregadas.
-- Para inserts de signal_events, recomendamos usar SOLO RPC.
revoke insert on table public.signal_events from anon;
revoke insert on table public.signal_events from authenticated;
-- (insert vía function security definer)
