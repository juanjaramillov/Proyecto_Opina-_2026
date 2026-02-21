-- FIX V7 — señal_events completo + vista + KPIs por battle_instance_id

-- 1) Parchear tabla signal_events (agrega columnas base si faltan)
do $$
begin
  -- 1.1) Si NO existe la tabla, créala completa (caso limpio)
  if not exists (
    select 1 from information_schema.tables
    where table_schema='public' and table_name='signal_events'
  ) then
    create table public.signal_events (
      id uuid primary key default gen_random_uuid(),
      created_at timestamptz not null default now(),
      user_id uuid references auth.users(id) on delete set null,

      source_type text not null,
      source_id text not null,
      title text not null,
      choice_label text,

      battle_id uuid references public.battles(id) on delete set null,
      battle_instance_id uuid references public.battle_instances(id) on delete set null,
      option_id uuid references public.battle_options(id) on delete set null,

      signal_weight numeric(10,2) not null default 1,
      user_tier text not null default 'guest',
      profile_completeness int not null default 0,

      country text,
      region text,
      city text,
      comuna text,
      age_bucket text,
      gender text,

      meta jsonb not null default '{}'::jsonb
    );
  end if;
end $$;

-- 1.2) Si la tabla ya existía, agrega TODO lo que pueda faltar (incluye columnas “base”)
alter table public.signal_events add column if not exists created_at timestamptz;
alter table public.signal_events add column if not exists user_id uuid;

alter table public.signal_events add column if not exists source_type text;
alter table public.signal_events add column if not exists source_id text;
alter table public.signal_events add column if not exists title text;
alter table public.signal_events add column if not exists choice_label text;

alter table public.signal_events add column if not exists battle_id uuid;
alter table public.signal_events add column if not exists battle_instance_id uuid;
alter table public.signal_events add column if not exists option_id uuid;

alter table public.signal_events add column if not exists signal_weight numeric(10,2);
alter table public.signal_events add column if not exists user_tier text;
alter table public.signal_events add column if not exists profile_completeness int;

alter table public.signal_events add column if not exists country text;
alter table public.signal_events add column if not exists region text;
alter table public.signal_events add column if not exists city text;
alter table public.signal_events add column if not exists comuna text;
alter table public.signal_events add column if not exists age_bucket text;
alter table public.signal_events add column if not exists gender text;

alter table public.signal_events add column if not exists meta jsonb;

-- 1.3) Backfill seguro (solo donde está null)
update public.signal_events
set created_at = now()
where created_at is null;

update public.signal_events
set signal_weight = 1
where signal_weight is null;

update public.signal_events
set user_tier = 'guest'
where user_tier is null;

update public.signal_events
set profile_completeness = 0
where profile_completeness is null;

update public.signal_events
set meta = '{}'::jsonb
where meta is null;

-- 1.4) Defaults (para que inserts nuevos no rompan)
alter table public.signal_events alter column created_at set default now();
alter table public.signal_events alter column signal_weight set default 1;
alter table public.signal_events alter column user_tier set default 'guest';
alter table public.signal_events alter column profile_completeness set default 0;
alter table public.signal_events alter column meta set default '{}'::jsonb;

-- 1.5) NOT NULL (solo si ya hay datos; hacemos esto “tolerante”)
-- Si tienes filas históricas sin source_type/source_id/title, esto fallaría.
-- Primero deja correr el producto y luego lo endurecemos con un job de limpieza.


-- 2) Recrear vista que te estaba fallando (v_signal_counts_daily)
create or replace view public.v_signal_counts_daily as
select
  date_trunc('day', se.created_at) as day,
  se.source_type,
  se.battle_id,
  se.battle_instance_id,
  se.option_id,
  count(*) as signals,
  sum(se.signal_weight) as weighted_signals
from public.signal_events se
group by 1,2,3,4,5;


-- 3) KPIs por battle_instance_id (para calzar con signalService.ts)

drop function if exists public.get_share_of_preference(uuid);
create function public.get_share_of_preference(input_battle_instance uuid)
returns table (
  option_id uuid,
  signals bigint,
  share_pct numeric
)
language sql
as $$
  select
    se.option_id,
    count(*) as signals,
    round(100.0 * count(*) / nullif(sum(count(*)) over (), 0), 2) as share_pct
  from public.signal_events se
  where se.battle_instance_id = input_battle_instance
  group by se.option_id
  order by share_pct desc;
$$;

drop function if exists public.get_trend_velocity(uuid);
create function public.get_trend_velocity(input_battle_instance uuid)
returns table (
  option_id uuid,
  delta_signals bigint
)
language sql
as $$
  with daily as (
    select
      date_trunc('day', se.created_at) as day,
      se.option_id,
      count(*) as signals
    from public.signal_events se
    where se.battle_instance_id = input_battle_instance
    group by 1,2
  )
  select
    option_id,
    (max(signals) - min(signals)) as delta_signals
  from daily
  group by option_id
  order by delta_signals desc;
$$;

drop function if exists public.get_engagement_quality(uuid);
create function public.get_engagement_quality(input_battle_instance uuid)
returns table (
  option_id uuid,
  weighted_signals numeric
)
language sql
as $$
  select
    se.option_id,
    sum(se.signal_weight) as weighted_signals
  from public.signal_events se
  where se.battle_instance_id = input_battle_instance
  group by se.option_id
  order by weighted_signals desc;
$$;

grant execute on function public.get_share_of_preference(uuid) to anon, authenticated;
grant execute on function public.get_trend_velocity(uuid) to anon, authenticated;
grant execute on function public.get_engagement_quality(uuid) to anon, authenticated;

-- 4) Validación rápida (si esto corre, ya saliste del hoyo)
-- select column_name from information_schema.columns where table_schema='public' and table_name='signal_events' order by ordinal_position;
-- select * from public.v_signal_counts_daily limit 5;
