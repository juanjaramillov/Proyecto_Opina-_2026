-- ================================
-- Opina+ Baseline DB V8 (ÚNICO)
-- Fuente de verdad: public.signal_events (singular)
-- Compatibilidad: public.signals_events (VIEW)
-- RPCs estables: resolve_battle_context, get_active_battles, KPIs
-- ================================

begin;

-- 0) Extensiones útiles (si ya existen, no pasa nada)
create extension if not exists pgcrypto;

-- 1) Tabla fuente de verdad
create table if not exists public.signal_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  -- Identidad de la señal (core)
  signal_id uuid null,                     -- puede ser null si guardas por signal_key (legacy)
  signal_key text null,                    -- alternativa cuando no hay signal_id
  signal_type text not null default 'core', -- 'core' | 'dynamic' | 'versus'
  scale_type text not null default 'choice',

  -- payload
  answer_value text null,
  payload jsonb not null default '{}'::jsonb,

  -- usuario / calidad de dato
  user_id uuid null,
  user_tier text not null default 'guest',            -- 'guest' | 'registered' | 'verified'
  profile_completeness int not null default 0,        -- 0..100
  signal_weight numeric(10,2) not null default 1.00,  -- peso final

  -- contexto versus / battles
  battle_id uuid null,
  battle_instance_id uuid null,
  option_id uuid null,
  option_label text null,

  -- tracking
  source_type text not null default 'app',  -- 'app' | 'demo' | 'admin' | ...
  client_meta jsonb not null default '{}'::jsonb
);

-- 2) Constraints mínimas (sin romper datos existentes)
--    Evita el loop: si no hay signal_id, debes tener signal_key.
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'signal_events_requires_signal_ref'
  ) then
    alter table public.signal_events
      add constraint signal_events_requires_signal_ref
      check (
        signal_id is not null
        or (signal_key is not null and length(trim(signal_key)) > 0)
      );
  end if;
end $$;

-- 3) Índices recomendados (rendimiento KPIs / tendencias)
create index if not exists idx_signal_events_created_at on public.signal_events (created_at desc);
create index if not exists idx_signal_events_battle_id on public.signal_events (battle_id);
create index if not exists idx_signal_events_user_id on public.signal_events (user_id);
create index if not exists idx_signal_events_signal_key on public.signal_events (signal_key);

-- 4) VIEW de compatibilidad (plural) para código viejo
--    Si existe tabla signals_events vieja: NO la borramos acá para no perder datos sin backup.
--    Creamos/actualizamos la view si NO hay objeto con ese nombre o si ya era view.
do $$
declare
  obj_kind text;
begin
  select c.relkind into obj_kind
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public' and c.relname = 'signals_events';

  -- relkind: 'v' view, 'r' table
  if obj_kind is null then
    execute 'create view public.signals_events as select * from public.signal_events;';
  elsif obj_kind = 'v' then
    execute 'create or replace view public.signals_events as select * from public.signal_events;';
  else
    -- Si era tabla, no la pisamos. Se deja como legacy.
    -- (Luego hacemos migración de datos controlada.)
    null;
  end if;
end $$;

-- 5) Dropear firmas duplicadas de RPCs (para evitar "best candidate function")
drop function if exists public.resolve_battle_context(text);
drop function if exists public.get_active_battles();

drop function if exists public.kpi_share_of_preference(uuid);
drop function if exists public.kpi_share_of_preference(uuid, timestamptz, timestamptz);
drop function if exists public.kpi_share_of_preference(uuid, date, date);

drop function if exists public.kpi_trend_velocity(uuid);
drop function if exists public.kpi_trend_velocity(uuid, text);
drop function if exists public.kpi_trend_velocity(uuid, text, timestamptz, timestamptz);
drop function if exists public.kpi_trend_velocity(uuid, text, date, date);

drop function if exists public.kpi_engagement_quality(uuid);
drop function if exists public.kpi_engagement_quality(uuid, timestamptz, timestamptz);
drop function if exists public.kpi_engagement_quality(uuid, date, date);

-- 6) RPC: resolve_battle_context (estable)
--    Nota: ajusta nombres de tabla/columnas si tus battles están en otro esquema.
--    Si tu tabla se llama public.battles y tiene slug, id, is_active -> calza.
create or replace function public.resolve_battle_context(p_battle_slug text)
returns table (
  battle_id uuid,
  battle_slug text
)
language sql
stable
as $$
  select b.id as battle_id, b.slug as battle_slug
  from public.battles b
  where b.slug = p_battle_slug
  limit 1;
$$;

-- 7) RPC: get_active_battles (estable)
create or replace function public.get_active_battles()
returns table (
  id uuid,
  slug text,
  title text,
  is_active boolean
)
language sql
stable
as $$
  select b.id, b.slug, b.title, b.is_active
  from public.battles b
  where b.is_active = true
  order by b.created_at desc nulls last;
$$;

-- 8) KPI: Share of preference (estable)
--    Devuelve share_pct por opción (por label o por option_id)
create or replace function public.kpi_share_of_preference(
  p_battle_id uuid,
  p_start_date timestamptz,
  p_end_date timestamptz
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
      se.option_label,
      se.option_id,
      count(*)::bigint as signals_count,
      sum(se.signal_weight)::numeric as weighted_signals
    from public.signal_events se
    where se.battle_id = p_battle_id
      and se.created_at >= p_start_date
      and se.created_at <= p_end_date
    group by se.option_label, se.option_id
  ),
  tot as (
    select nullif(sum(weighted_signals),0)::numeric as total_weighted
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

-- 9) KPI: Trend velocity (estable)
--    bucket: 'hour' | 'day' | 'week'
create or replace function public.kpi_trend_velocity(
  p_battle_id uuid,
  p_bucket text,
  p_start_date timestamptz,
  p_end_date timestamptz
)
returns table (
  bucket_start timestamptz,
  option_label text,
  option_id uuid,
  weighted_signals numeric
)
language plpgsql
stable
as $$
declare
  bucket_interval text;
begin
  bucket_interval := case lower(p_bucket)
    when 'hour' then '1 hour'
    when 'day' then '1 day'
    when 'week' then '1 week'
    else '1 day'
  end;

  return query
  execute format($f$
    select
      date_trunc(%L, se.created_at) as bucket_start,
      se.option_label,
      se.option_id,
      sum(se.signal_weight)::numeric as weighted_signals
    from public.signal_events se
    where se.battle_id = %L
      and se.created_at >= %L::timestamptz
      and se.created_at <= %L::timestamptz
    group by 1, se.option_label, se.option_id
    order by 1 asc
  $f$, lower(p_bucket), p_battle_id::text, p_start_date::text, p_end_date::text);

end;
$$;

-- 10) KPI: Engagement quality (estable)
create or replace function public.kpi_engagement_quality(
  p_battle_id uuid,
  p_start_date timestamptz,
  p_end_date timestamptz
)
returns table (
  total_signals bigint,
  weighted_total numeric,
  verified_share_pct numeric,
  avg_profile_completeness numeric
)
language sql
stable
as $$
  with base as (
    select
      count(*)::bigint as total_signals,
      sum(se.signal_weight)::numeric as weighted_total,
      avg(se.profile_completeness)::numeric as avg_profile_completeness,
      sum(case when se.user_tier = 'verified' then se.signal_weight else 0 end)::numeric as verified_weighted
    from public.signal_events se
    where se.battle_id = p_battle_id
      and se.created_at >= p_start_date
      and se.created_at <= p_end_date
  )
  select
    b.total_signals,
    coalesce(b.weighted_total,0) as weighted_total,
    case when coalesce(b.weighted_total,0) = 0 then 0
         else round((coalesce(b.verified_weighted,0) / b.weighted_total) * 100, 2)
    end as verified_share_pct,
    round(coalesce(b.avg_profile_completeness,0), 2) as avg_profile_completeness
  from base b;
$$;

commit;
