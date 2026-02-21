-- Migración: Métricas Vivas para el Hero
-- Fecha: 2026-02-19

create or replace function public.get_live_platform_stats()
returns jsonb
language plpgsql
security definer
stable
as $$
declare
  v_signals_today bigint;
  v_trending_battle text;
  v_active_segment text;
  v_total_users bigint;
begin
  -- 1. Señales hoy (usando la tabla de agregación si es posible, o directo si es poco volumen aún)
  -- Para este MVP usaremos signal_events directo para precisión máxima en tiempo real
  select count(*) into v_signals_today
  from public.signal_events
  where created_at >= date_trunc('day', now());

  -- 2. Batalla más volátil (Tendencia 24h)
  select b.title into v_trending_battle
  from public.signal_events se
  join public.battles b on b.id = se.battle_id
  where se.created_at >= now() - interval '24 hours'
  group by b.id, b.title
  order by count(*) desc
  limit 1;

  -- 3. Segmento más activo (Región)
  select region into v_active_segment
  from public.signal_events
  where created_at >= date_trunc('day', now())
    and region is not null
  group by region
  order by count(*) desc
  limit 1;

  -- 4. Usuarios Activos (Últimos 30 días)
  select count(distinct user_id) into v_total_users
  from public.user_stats
  where last_signal_at >= now() - interval '30 days';

  return jsonb_build_object(
    'signals_24h', coalesce(v_signals_today, 0),
    'trending_title', coalesce(v_trending_battle, 'Explorando Datos'),
    'active_region', coalesce(v_active_segment, 'Global'),
    'active_users', coalesce(v_total_users, 0),
    'timestamp', now()
  );
end;
$$;

grant execute on function public.get_live_platform_stats() to authenticated, anon;
