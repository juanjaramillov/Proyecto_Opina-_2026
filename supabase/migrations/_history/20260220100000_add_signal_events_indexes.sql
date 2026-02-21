-- Migración: Optimización de Performance vía Índices Compuestos
-- Fecha: 2026-02-20

-- 1. Snapshotting Base: Agilizar la agrupación por batalla y atributo
CREATE INDEX IF NOT EXISTS idx_signal_events_battle_attr 
ON public.signal_events USING btree (battle_id, attribute_id);

-- 2. Snapshotting Segmentado: Agilizar cruces para B2B
CREATE INDEX IF NOT EXISTS idx_signal_events_segment_region 
ON public.signal_events USING btree (battle_id, attribute_id, region_segment);

CREATE INDEX IF NOT EXISTS idx_signal_events_segment_gender 
ON public.signal_events USING btree (battle_id, attribute_id, gender_segment);

CREATE INDEX IF NOT EXISTS idx_signal_events_segment_age 
ON public.signal_events USING btree (battle_id, attribute_id, age_segment);

-- 3. Análisis Temporal (Momentum y Tendencias 24h/7d)
CREATE INDEX IF NOT EXISTS idx_signal_events_created_at 
ON public.signal_events USING btree (created_at DESC);

-- Opcional: Cruce fuerte temporal + atributo para la generación rápida de trends
CREATE INDEX IF NOT EXISTS idx_signal_events_attr_time 
ON public.signal_events USING btree (attribute_id, created_at DESC);

-- 4. Búsquedas rápidas de sesión analítica (Profundidad cruzada)
CREATE INDEX IF NOT EXISTS idx_signal_events_session 
ON public.signal_events USING btree (session_id);

