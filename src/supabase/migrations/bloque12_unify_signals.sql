-- Migración: Unificación de tablas de eventos (signals_events -> signal_events)
-- Objetivo: Mover datos de la tabla obsoleta a la canónica y eliminar la obsoleta.

-- 1. Insertar datos legacy en signal_events
-- Asume defaults seguros para las columnas NOT NULL que no existen en signals_events
insert into public.signal_events (
  signal_id,
  event_type,
  user_id,
  created_at,
  battle_id,
  signal_weight,
  meta,
  user_tier,
  source_type,
  source_id,
  title,
  profile_completeness
)
select
  'legacy_migration' as signal_id, -- Valor placeholder para registros antiguos
  'vote' as event_type,
  user_id,
  created_at,
  battle_id,
  1.0 as signal_weight, -- Peso por defecto
  jsonb_build_object('original_signal_value', signal_value) as meta, -- Guardar valor original (+1/-1) en meta
  'unknown' as user_tier,
  'legacy' as source_type,
  'legacy_source_id' as source_id,
  'Legacy Signal' as title,
  0 as profile_completeness
from public.signals_events;

-- 2. Eliminar la tabla obsoleta
drop table if exists public.signals_events;
