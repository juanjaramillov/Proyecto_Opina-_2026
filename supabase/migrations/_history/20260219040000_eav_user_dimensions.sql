-- Migración: Modelo EAV y Segmentación Dinámica
-- Fecha: 2026-02-19

-- 1. Dimensiones de Usuario (EAV)
create table if not exists public.user_dimensions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  dimension_key text not null, -- E.g., 'education', 'industry', 'income_level'
  dimension_value text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, dimension_key)
);

-- 2. Definiciones de Segmentos (Reglas Lógicas)
create table if not exists public.segment_definitions (
  id uuid primary key default gen_random_uuid(),
  segment_key text not null unique, -- E.g., 'tech_enthusiasts'
  rule_json jsonb not null, -- Reglas para filtrar user_dimensions + profiles
  version text default '1.0.0',
  description text,
  created_at timestamptz default now()
);

-- 3. RLS y Permisos
alter table public.user_dimensions enable row level security;
alter table public.segment_definitions enable row level security;

create policy "Users can manage their own dimensions" on public.user_dimensions
  using (auth.uid() = user_id);

create policy "Segment definitions are readable by everyone" on public.segment_definitions
  for select using (true);

grant all on public.user_dimensions to authenticated;
grant select on public.segment_definitions to authenticated, anon;

-- 4. Función para actualizar el timestamp
create or replace function public.fn_update_timestamp()
returns trigger as $$
begin
  NEW.updated_at = now();
  return NEW;
end;
$$ language plpgsql;

create trigger trg_update_user_dimensions_timestamp
before update on public.user_dimensions
for each row execute function public.fn_update_timestamp();
