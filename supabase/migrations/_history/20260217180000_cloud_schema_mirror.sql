-- ==========================================
-- Cloud Schema Mirror (Bloque 9)
-- Sincronización proactiva con el estado real de Supabase
-- ==========================================

-- 1) Asegurar tabla profiles (con campos de segmentación detectados)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  updated_at timestamp with time zone default now(),
  username text unique,
  full_name text,
  avatar_url text,
  age int,
  gender text,
  commune text,
  education text,
  occupation text,
  income text,
  civil_status text,
  household_size text,
  interest text,
  shopping_preference text,
  brand_affinity text,
  social_media text,
  politics_interest text,
  voting_frequency text,
  points int default 0,
  role text default 'user',
  -- Campos de negocio (integración Opina+)
  tier text default 'guest',
  profile_completeness int default 0,
  has_ci boolean default false,
  display_name text
);

-- 2) Asegurar tabla user_stats
create table if not exists public.user_stats (
  user_id uuid primary key references auth.users(id) on delete cascade,
  total_signals bigint default 0,
  weighted_score numeric default 0,
  level int default 1,
  signal_weight numeric default 1,
  last_signal_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 3) Infraestructura de Encuestas (Surveys)
create table if not exists public.surveys (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text,
  icon_name text,
  category text,
  is_active boolean default true,
  points_reward int default 10,
  created_at timestamp with time zone default now()
);

create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  survey_id uuid references public.surveys(id) on delete cascade,
  slug text,
  type text not null, -- 'choice', 'numeric', etc
  label text not null,
  min_val int,
  max_val int,
  options jsonb,
  created_at timestamp with time zone default now()
);

create table if not exists public.survey_responses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  survey_id uuid references public.surveys(id) on delete cascade,
  answers jsonb,
  anon_id text,
  question_id uuid,
  option_id uuid,
  created_at timestamp with time zone default now()
);

-- 4) Infraestructura de Entidades y Señales
create table if not exists public.entities (
  id uuid primary key default gen_random_uuid(),
  type text not null, -- 'brand', 'person', 'topic'
  name text not null,
  slug text unique not null,
  category text,
  created_at timestamp with time zone default now()
);

create table if not exists public.signal_entities (
  signal_id uuid references public.signals(id) on delete cascade,
  entity_id uuid references public.entities(id) on delete cascade,
  role text, -- 'primary', 'secondary'
  primary key (signal_id, entity_id)
);

-- 5) Battle Instances (Runtime Context)
create table if not exists public.battle_instances (
  id uuid primary key default gen_random_uuid(),
  battle_id uuid references public.battles(id) on delete cascade,
  version int default 1,
  starts_at timestamp with time zone,
  ends_at timestamp with time zone,
  context jsonb,
  created_at timestamp with time zone default now()
);

-- 6) Vistas de Analítica Detectadas
create or replace view public.v_signal_counts_daily as
select 
  date_trunc('day', created_at) as day,
  source_type,
  battle_id,
  battle_instance_id,
  option_id,
  count(*) as signals,
  sum(signal_weight) as weighted_signals
from public.signal_events
group by 1, 2, 3, 4, 5;

create or replace view public.v_trending_signals_24h as
select 
  signal_id,
  count(*) as answers_24h,
  max(created_at) as last_activity_at
from public.signal_events
where created_at > now() - interval '24 hours'
group by 1;

-- 7) Transición de user_profiles a profiles (si es necesario)
do $$
begin
  if exists (select 1 from pg_tables where tablename = 'user_profiles') then
    -- Intentar mover datos si profiles está vacío
    insert into public.profiles (id, tier, profile_completeness, has_ci, display_name)
    select user_id, tier, profile_completeness, has_ci, display_name
    from public.user_profiles
    on conflict (id) do update set
      tier = excluded.tier,
      profile_completeness = excluded.profile_completeness,
      has_ci = excluded.has_ci,
      display_name = excluded.display_name;
      
    -- No borramos user_profiles aún por seguridad, pero marcamos como redundante.
  end if;
end $$;
