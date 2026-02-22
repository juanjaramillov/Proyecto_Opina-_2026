-- =====================================================
-- OPINA+ V12 — FIX 17: ACTIVATION & RETENTION METRICS
-- =====================================================

-- 1. Crear tabla user_activity
CREATE TABLE IF NOT EXISTS public.user_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices para optimizar búsquedas temporales
CREATE INDEX IF NOT EXISTS idx_user_activity_user_time
ON public.user_activity (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_activity_type_time
ON public.user_activity (activity_type, created_at DESC);

-- 2. Modificar insert_signal_event para registrar actividad
-- Buscamos la definición actual y la extendemos
CREATE OR REPLACE FUNCTION public.insert_signal_event(
  p_battle_id uuid,
  p_option_id uuid,
  p_session_id uuid DEFAULT NULL,
  p_attribute_id uuid DEFAULT NULL
)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE 
    v_instance_id uuid; 
    v_anon_id text; 
    v_user_weight numeric;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Unauthorized'; END IF;
  
  -- 1. Obtener IDs necesarios
  v_anon_id := public.get_or_create_anon_id();
  SELECT id INTO v_instance_id FROM public.battle_instances WHERE battle_id = p_battle_id ORDER BY created_at DESC LIMIT 1;
  
  -- 2. Obtener el peso actual del usuario desde user_stats
  SELECT COALESCE(signal_weight, 1.0) INTO v_user_weight
  FROM public.user_stats
  WHERE user_id = auth.uid();

  -- 3. Insertar evento de señal
  INSERT INTO public.signal_events (
    anon_id, signal_id, battle_id, battle_instance_id, option_id, 
    entity_id, entity_type, module_type, session_id, attribute_id, signal_weight
  )
  VALUES (
    v_anon_id, gen_random_uuid(), p_battle_id, v_instance_id, p_option_id, 
    p_option_id, 'topic', 'versus', p_session_id, p_attribute_id, COALESCE(v_user_weight, 1.0)
  );

  -- 4. REGISTRAR ACTIVIDAD (NUEVO FIX 17)
  INSERT INTO public.user_activity (user_id, activity_type)
  VALUES (auth.uid(), 'signal');

  -- 5. Actualizar estadísticas del usuario
  INSERT INTO public.user_stats (user_id, total_signals, last_signal_at, level, signal_weight) 
  VALUES (auth.uid(), 1, now(), 1, COALESCE(v_user_weight, 1.0))
  ON CONFLICT (user_id) DO UPDATE SET 
    total_signals = public.user_stats.total_signals + 1, 
    last_signal_at = now();
END;
$$;

-- 3. Vista Materializada para DAU/WAU/MAU
DROP MATERIALIZED VIEW IF EXISTS public.kpi_activity;
CREATE MATERIALIZED VIEW public.kpi_activity AS
SELECT
  COUNT(DISTINCT CASE
    WHEN created_at >= now() - interval '1 day'
    THEN user_id END) AS dau,

  COUNT(DISTINCT CASE
    WHEN created_at >= now() - interval '7 days'
    THEN user_id END) AS wau,

  COUNT(DISTINCT CASE
    WHEN created_at >= now() - interval '30 days'
    THEN user_id END) AS mau
FROM public.user_activity;

-- 4. Función de Retención
CREATE OR REPLACE FUNCTION public.get_retention_metrics()
RETURNS TABLE (
  retention_day_1 NUMERIC,
  retention_day_7 NUMERIC
)
LANGUAGE sql
SECURITY DEFINER
AS $$
WITH cohort AS (
  -- Definimos el primer día de actividad por usuario
  SELECT user_id, MIN(created_at)::date AS signup_date
  FROM public.user_activity
  GROUP BY user_id
),
returns AS (
  -- Verificamos si volvieron exactamente en el día 1 o día 7
  SELECT
    c.user_id,
    MAX(CASE WHEN ua.created_at::date = c.signup_date + interval '1 day' THEN 1 ELSE 0 END) AS d1,
    MAX(CASE WHEN ua.created_at::date = c.signup_date + interval '7 days' THEN 1 ELSE 0 END) AS d7
  FROM cohort c
  JOIN public.user_activity ua ON ua.user_id = c.user_id
  GROUP BY c.user_id
)
SELECT
  COALESCE(AVG(d1), 0)::NUMERIC AS retention_day_1,
  COALESCE(AVG(d7), 0)::NUMERIC AS retention_day_7
FROM returns;
$$;

-- 5. RPC para obtener KPIs de actividad
CREATE OR REPLACE FUNCTION public.get_kpi_activity()
RETURNS TABLE (
  dau BIGINT,
  wau BIGINT,
  mau BIGINT
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT dau::BIGINT, wau::BIGINT, mau::BIGINT FROM public.kpi_activity;
$$;

-- 6. Programar refresco automático (cada 30 min)
-- Nota: Requiere pg_cron configurado en Supabase
SELECT cron.schedule(
  'refresh-kpi-activity',
  '*/30 * * * *',
  $$ REFRESH MATERIALIZED VIEW public.kpi_activity; $$
);

-- RLS para user_activity
ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view all activity" ON public.user_activity FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
