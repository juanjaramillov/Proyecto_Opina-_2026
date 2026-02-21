-- =========================
-- 0) EXTENSIONES (si no existen)
-- =========================
create extension if not exists pgcrypto;

-- =========================
-- 1) TABLAS “CATÁLOGO” (definen contenido)
-- =========================

-- Versus / Batallas (catálogo)
create table if not exists battles (
  id uuid primary key default gen_random_uuid(),
  slug text unique,
  title text not null,
  description text,
  category text, -- ej: "bebidas", "politica", "bancos"
  status text not null default 'active', -- active|paused|archived
  created_at timestamptz not null default now()
);

-- Opciones del versus (catálogo)
create table if not exists battle_options (
  id uuid primary key default gen_random_uuid(),
  battle_id uuid not null references battles(id) on delete cascade,
  label text not null,
  brand_id text, -- opcional: si después creas tabla brands
  image_url text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  unique (battle_id, label)
);

-- =========================
-- 2) “INSTANCIAS” (versionado + repetición)
-- =========================
-- Una battle_instance es “la edición” que corre en un período.
-- Ej: "Presidenciales Chile" (battle) puede tener instancias semanales/mensuales.

create table if not exists battle_instances (
  id uuid primary key default gen_random_uuid(),
  battle_id uuid not null references battles(id) on delete cascade,

  -- versionado + calendario
  version int not null default 1,
  starts_at timestamptz,
  ends_at timestamptz,

  -- metadatos para dashboards / experimentos
  context jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now(),
  unique (battle_id, version)
);

create index if not exists idx_battle_instances_battle_id on battle_instances(battle_id);
create index if not exists idx_battle_instances_starts_at on battle_instances(starts_at);

-- =========================
-- 3) SEÑALES (fact table)
-- =========================
-- NOTA: tu código ya inserta en signal_events.
-- Si la tabla NO existe, la creamos.
-- Si existe, la ampliamos sin romper.

create table if not exists signal_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  -- user puede ser null (anónimo). Decide esto después.
  user_id uuid references auth.users(id) on delete set null,

  -- lo que tú ya usas
  source_type text not null, -- "versus" | "review" (tu front)
  source_id text not null,   -- id externo (ej: versusId, reviewId)
  title text not null,
  choice_label text,

  -- NUEVO: normalización para histórico y dashboards
  battle_id uuid references battles(id) on delete set null,
  battle_instance_id uuid references battle_instances(id) on delete set null,
  option_id uuid references battle_options(id) on delete set null,

  -- NUEVO: peso real de la señal (gamificación / verificación)
  signal_weight numeric(10,2) not null default 1,

  -- NUEVO: “snapshot” de calidad de usuario al momento de la señal
  user_tier text not null default 'guest', -- guest|registered|verified
  profile_completeness int not null default 0, -- 0..100

  -- NUEVO: segmentación mínima (sin PII directo)
  country text,
  region text,
  city text,
  comuna text,
  age_bucket text,  -- ej: "18-24", "25-34"
  gender text,      -- ej: "male", "female", "other", "na"

  meta jsonb not null default '{}'::jsonb
);

-- Si la tabla ya existía, aseguramos columnas sin romper:
alter table signal_events add column if not exists battle_id uuid;
alter table signal_events add column if not exists battle_instance_id uuid;
alter table signal_events add column if not exists option_id uuid;
alter table signal_events add column if not exists signal_weight numeric(10,2) not null default 1;
alter table signal_events add column if not exists user_tier text not null default 'guest';
alter table signal_events add column if not exists profile_completeness int not null default 0;
alter table signal_events add column if not exists country text;
alter table signal_events add column if not exists region text;
alter table signal_events add column if not exists city text;
alter table signal_events add column if not exists comuna text;
alter table signal_events add column if not exists age_bucket text;
alter table signal_events add column if not exists gender text;
alter table signal_events add column if not exists meta jsonb not null default '{}'::jsonb;

-- FK (solo si no existían)
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'signal_events_battle_id_fkey'
  ) then
    alter table signal_events
      add constraint signal_events_battle_id_fkey
      foreign key (battle_id) references battles(id) on delete set null;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'signal_events_battle_instance_id_fkey'
  ) then
    alter table signal_events
      add constraint signal_events_battle_instance_id_fkey
      foreign key (battle_instance_id) references battle_instances(id) on delete set null;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'signal_events_option_id_fkey'
  ) then
    alter table signal_events
      add constraint signal_events_option_id_fkey
      foreign key (option_id) references battle_options(id) on delete set null;
  end if;
end $$;

create index if not exists idx_signal_events_created_at on signal_events(created_at);
create index if not exists idx_signal_events_user_id on signal_events(user_id);
create index if not exists idx_signal_events_battle_instance_id on signal_events(battle_instance_id);
create index if not exists idx_signal_events_option_id on signal_events(option_id);

-- =========================
-- 4) VISTA DE AGREGADOS (rápida para dashboards)
-- =========================
create or replace view v_signal_counts_daily as
select
  date_trunc('day', se.created_at) as day,
  se.source_type,
  se.battle_id,
  se.battle_instance_id,
  se.option_id,
  count(*) as signals,
  sum(se.signal_weight) as weighted_signals
from signal_events se
group by 1,2,3,4,5;

-- =========================
-- 5) RLS (seguro por defecto)
-- =========================
alter table battles enable row level security;
alter table battle_options enable row level security;
alter table battle_instances enable row level security;
alter table signal_events enable row level security;

-- Catálogo público (leer)
drop policy if exists "battles_select_public" on battles;
create policy "battles_select_public"
on battles for select
to anon, authenticated
using (true);

drop policy if exists "battle_options_select_public" on battle_options;
create policy "battle_options_select_public"
on battle_options for select
to anon, authenticated
using (true);

drop policy if exists "battle_instances_select_public" on battle_instances;
create policy "battle_instances_select_public"
on battle_instances for select
to anon, authenticated
using (true);

-- Señales: leer solo las propias (si estás logueado)
drop policy if exists "signal_events_select_own" on signal_events;
create policy "signal_events_select_own"
on signal_events for select
to authenticated
using (user_id = auth.uid());

-- Señales: insertar permitido (anon y auth) — por ahora.
-- Nota: esto habilita crecimiento sin fricción, pero después lo endurecemos.
drop policy if exists "signal_events_insert_public" on signal_events;
create policy "signal_events_insert_public"
on signal_events for insert
to anon, authenticated
with check (true);
