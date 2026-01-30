-- ============================================================
-- OPINA+ HOTFIX: Unificación + Patch de Schema + KPIs reales
-- Fuente de verdad: public.signal_events (singular)
-- Compatibilidad: public.signals_events (view)
-- ============================================================

-- -----------------------------
-- 0) Extensiones
-- -----------------------------
create extension if not exists pgcrypto;

-- -----------------------------
-- 1) Patch battles (para calzar con src/types/database.types.ts)
--    (tu ZIP trae una battles legacy con option_a/option_b)
-- -----------------------------
alter table public.battles
  add column if not exists slug text,
  add column if not exists description text,
  add column if not exists category_id uuid,
  add column if not exists status text,
  add column if not exists is_public boolean,
  add column if not exists created_at timestamptz,
  add column if not exists starts_at timestamptz,
  add column if not exists ends_at timestamptz;

-- Defaults seguros (solo si vienen nulos)
update public.battles
set
  created_at = coalesce(created_at, now()),
  status = coalesce(status, 'active'),
  is_public = coalesce(is_public, true),
  slug = coalesce(slug, 'battle-' || left(id::text, 8))
where true;

-- slug único (si no existe constraint)
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'battles_slug_unique'
  ) then
    begin
      alter table public.battles add constraint battles_slug_unique unique (slug);
    exception when others then
      -- si hay duplicados, no rompemos aquí; se corrige después.
      null;
    end;
  end if;
end $$;

-- -----------------------------
-- 2) Asegurar battle_instances (si tu DB no la tiene)
-- -----------------------------
create table if not exists public.battle_instances (
  id uuid primary key default gen_random_uuid(),
  battle_id uuid not null references public.battles(id) on delete cascade,
  version int not null default 1,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_bi_battle_id on public.battle_instances(battle_id);

-- -----------------------------
-- 3) Asegurar battle_options (mínimo para KPIs reales)
-- -----------------------------
create table if not exists public.battle_options (
  id uuid primary key default gen_random_uuid(),
  battle_id uuid not null references public.battles(id) on delete cascade,
  label text not null,
  image_url text,
  sort_order int not null default 0
);

create index if not exists idx_bo_battle_id on public.battle_options(battle_id);

-- -----------------------------
-- 4) Patch signal_events (columnas que tu frontend usa)
-- -----------------------------
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
  add column if not exists city text,

  add column if not exists source_type text,
  add column if not exists source_id text;

-- Indices
create index if not exists idx_se_battle_id on public.signal_events(battle_id);
create index if not exists idx_se_created_at on public.signal_events(created_at);
create index if not exists idx_se_signal_id on public.signal_events(signal_id);

-- -----------------------------
-- 5) UNIFICACIÓN: signals_events (plural legacy) -> signal_events (singular)
--    Copia SOLO columnas comunes para no romper por esquemas distintos
--    Luego renombra la tabla legacy y crea VIEW signals_events apuntando a signal_events
-- -----------------------------
do $$
declare
  cols text;
  inserted_count bigint;
  backup_name text := 'signals_events_backup_' || to_char(now(), 'YYYYMMDD_HH24MISS');
begin
  if to_regclass('public.signals_events') is null then
    -- Nada que unificar, pero igual dejamos la view si no existe
    if to_regclass('public.signals_events') is null then
      begin
        execute 'create or replace view public.signals_events as select * from public.signal_events';
      exception when others then
        null;
      end;
    end if;
    return;
  end if;

  -- columnas comunes
  select string_agg(quote_ident(c.column_name), ', ' order by c.ordinal_position)
  into cols
  from information_schema.columns c
  where c.table_schema='public'
    and c.table_name='signal_events'
    and exists (
      select 1
      from information_schema.columns c2
      where c2.table_schema='public'
        and c2.table_name='signals_events'
        and c2.column_name = c.column_name
    );

  if cols is not null and length(cols) > 0 then
    execute format(
      'insert into public.signal_events (%s) select %s from public.signals_events',
      cols, cols
    );
    get diagnostics inserted_count = row_count;
    raise notice 'Filas copiadas desde signals_events -> signal_events: %', inserted_count;
  else
    raise notice 'No se copiaron filas: no hay columnas comunes suficientes.';
  end if;

  -- renombrar legacy a backup
  execute format('alter table public.signals_events rename to %I', backup_name);
  raise notice 'Tabla legacy renombrada a: %', backup_name;

  -- crear view compatibilidad
  execute 'create or replace view public.signals_events as select * from public.signal_events';
  raise notice 'Vista public.signals_events creada apuntando a public.signal_events.';
end $$;

-- -----------------------------
-- 6) Limpieza: eliminar KPIs viejos/confusos (del ZIP)
-- -----------------------------
drop function if exists public.get_share_of_preference(text);
drop function if exists public.get_trend_velocity(text);
drop function if exists public.get_engagement_quality(text);

drop function if exists public.kpi_share_of_preference(uuid);
drop function if exists public.kpi_trend_velocity(uuid);
drop function if exists public.kpi_engagement_quality(uuid);

-- -----------------------------
-- 7) KPIs REALES (battle_id + filtros por fecha)
-- -----------------------------
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
    select option_id, sum(w) as weighted_sig
    from base
    group by option_id
  ),
  tot as (
    select coalesce(sum(weighted_sig),0) as total
    from agg
  )
  select
    a.option_id,
    a.weighted_sig as weighted_signals,
    t.total as weighted_total,
    case when t.total = 0 then 0 else round((a.weighted_sig / t.total) * 100, 2) end as share
  from agg a
  cross join tot t
  order by share desc;
$$;

create or replace function public.kpi_trend_velocity(
  p_battle_id uuid
)
returns table (
  option_id uuid,
  delta_weighted_signals numeric
)
language sql
stable
as $$
  with last_24h as (
    select
      se.option_id,
      sum((se.signal_value * coalesce(se.signal_weight,1.0))::numeric) as w
    from public.signal_events se
    where se.battle_id = p_battle_id
      and se.option_id is not null
      and se.created_at >= now() - interval '24 hours'
    group by se.option_id
  ),
  prev_24h as (
    select
      se.option_id,
      sum((se.signal_value * coalesce(se.signal_weight,1.0))::numeric) as w
    from public.signal_events se
    where se.battle_id = p_battle_id
      and se.option_id is not null
      and se.created_at >= now() - interval '48 hours'
      and se.created_at <  now() - interval '24 hours'
    group by se.option_id
  )
  select
    coalesce(l.option_id, p.option_id) as option_id,
    (coalesce(l.w,0) - coalesce(p.w,0)) as delta_weighted_signals
  from last_24h l
  full outer join prev_24h p on p.option_id = l.option_id
  order by delta_weighted_signals desc;
$$;

create or replace function public.kpi_engagement_quality(
  p_battle_id uuid
)
returns table (
  option_id uuid,
  weighted_signals numeric
)
language sql
stable
as $$
  select
    se.option_id,
    sum((se.signal_value * coalesce(se.signal_weight,1.0))::numeric) as weighted_signals
  from public.signal_events se
  where se.battle_id = p_battle_id
    and se.option_id is not null
  group by se.option_id
  order by weighted_signals desc;
$$;

grant execute on function public.kpi_share_of_preference(uuid, timestamptz, timestamptz) to anon, authenticated;
grant execute on function public.kpi_trend_velocity(uuid) to anon, authenticated;
grant execute on function public.kpi_engagement_quality(uuid) to anon, authenticated;
