-- Migración: Vinculación de Profundidad Configurable
-- Fecha: 2026-02-19

-- 1. Tipos de Disparo (Triggers)
do $$ 
begin
  if not exists (select 1 from pg_type where typname = 'depth_trigger_mode') then
    create type public.depth_trigger_mode as enum ('immediate', 'batch_end', 'optional', 'premium_only');
  end if;
end $$;

-- 2. Tabla de Vinculación
create table if not exists public.option_depth_link (
  id uuid primary key default gen_random_uuid(),
  option_id uuid not null references public.battle_options(id) on delete cascade,
  survey_key text not null default 'default_master', -- Identificador lógico de la encuesta
  is_required boolean default false,
  trigger_mode public.depth_trigger_mode default 'immediate',
  
  -- Para monetización/B2B
  client_id uuid, -- Opcional: Para trackear qué cliente es dueño de esta profundidad
  
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(option_id)
);

-- 3. RLS y Permisos
alter table public.option_depth_link enable row level security;

create policy "Depth links are public" on public.option_depth_link
  for select using (true);

grant select on public.option_depth_link to authenticated, anon;

-- 4. View para resolución fácil en el Frontend
create or replace view public.v_option_depth_config as
select 
  odl.option_id,
  odl.survey_key,
  odl.is_required,
  odl.trigger_mode,
  bo.label as option_label,
  bo.battle_id
from public.option_depth_link odl
join public.battle_options bo on bo.id = odl.option_id;

grant select on public.v_option_depth_config to authenticated, anon;
