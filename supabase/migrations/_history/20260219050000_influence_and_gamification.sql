-- Migración: Sistema de Influencia y Gamificación
-- Fecha: 2026-02-19

-- 1. Definición de Niveles de Influencia
create table if not exists public.influence_levels (
  id uuid primary key default gen_random_uuid(),
  level_name text not null,
  min_signals int not null,
  min_completeness int not null,
  weight_multiplier numeric(10,2) not null,
  description text,
  badge_color text,
  created_at timestamptz default now()
);

-- Semillas de Niveles
insert into public.influence_levels (level_name, min_signals, min_completeness, weight_multiplier, description, badge_color) values
('Novato', 0, 0, 1.0, 'Iniciando el camino de la señal', '#94A3B8'),
('Analista', 25, 40, 1.2, 'Generando datos con contexto', '#6366F1'),
('Experto', 100, 70, 1.5, 'Referente de tendencias regionales', '#EC4899'),
('Oráculo', 500, 100, 2.0, 'Máxima precisión e influencia global', '#F59E0B')
on conflict do nothing;

-- 2. Vista de Poder de Señal (Transparencia para el usuario)
create or replace view public.v_user_influence_card as
with current_tier as (
  select 
    p.id as user_id,
    il.level_name,
    il.weight_multiplier,
    il.badge_color
  from public.profiles p
  join public.user_stats us on us.user_id = p.id
  cross join lateral (
    select * from public.influence_levels
    where min_signals <= us.total_signals 
      and min_completeness <= p.profile_completeness
    order by weight_multiplier desc limit 1
  ) il
)
select 
  p.id,
  p.full_name,
  us.total_signals,
  p.profile_completeness as data_quality,
  ct.level_name as tier_name,
  ct.weight_multiplier as power_score,
  ct.badge_color,
  us.last_signal_at
from public.profiles p
join public.user_stats us on us.user_id = p.id
join current_tier ct on ct.user_id = p.id;

-- 3. Permisos
grant select on public.influence_levels to authenticated, anon;
grant select on public.v_user_influence_card to authenticated;

-- 4. Trigger para actualizar el multiplicador en user_stats (Automatic)
create or replace function public.fn_sync_user_power()
returns trigger as $$
declare
  v_new_weight numeric;
begin
  select weight_multiplier into v_new_weight
  from public.influence_levels il
  where il.min_signals <= (select total_signals from public.user_stats where user_id = NEW.id)
    and il.min_completeness <= NEW.profile_completeness
  order by weight_multiplier desc limit 1;

  update public.user_stats set signal_weight = coalesce(v_new_weight, 1.0)
  where user_id = NEW.id;
  
  return NEW;
end;
$$ language plpgsql security definer;

-- Trigger sobre profiles (cuando suben completitud)
drop trigger if exists trg_sync_user_power_profile on public.profiles;
create trigger trg_sync_user_power_profile
after update of profile_completeness on public.profiles
for each row execute function public.fn_sync_user_power();
