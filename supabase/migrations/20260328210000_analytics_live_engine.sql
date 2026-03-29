-- ==============================================================================
-- Opina+ V14 | Canonical Analytics Live Engine
-- Date: 2026-03-28
-- Description: Core rollups para Actualidad y rutinas de actualización periódica.
-- ==============================================================================

-- 1. Rollup Diario de Análisis para Actualidad (Topics/News)
CREATE TABLE IF NOT EXISTS public.analytics_daily_topic_rollup (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL, -- Asume referencia a actualidad_topics o content unificado
  summary_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_signals INT NOT NULL DEFAULT 0,
  unique_users INT NOT NULL DEFAULT 0,
  total_effective_weight NUMERIC(10,4) NOT NULL DEFAULT 0,
  dominant_answer TEXT,
  dominant_answer_share NUMERIC(5,2) DEFAULT 0,
  entropy_normalized NUMERIC(5,4) DEFAULT 0,
  fragmentation_label TEXT,
  reaction_latency_minutes INT DEFAULT 0,
  heat_index NUMERIC(10,4) DEFAULT 0,
  resonance_index NUMERIC(10,4) DEFAULT 0,
  polarization_index NUMERIC(10,4) DEFAULT 0,
  linked_entities_count INT DEFAULT 0,
  linked_contexts_count INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(topic_id, summary_date)
);

ALTER TABLE public.analytics_daily_topic_rollup ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for authenticated topic rollups" ON public.analytics_daily_topic_rollup
  FOR SELECT TO authenticated USING (true);

-- 2. Audit Tab de corridas de los Rollups
CREATE TABLE IF NOT EXISTS public.analytics_rollup_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rollup_name TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'running', -- running, success, failed
  rows_affected INT DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.analytics_rollup_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for authenticated rollup runs" ON public.analytics_rollup_runs
  FOR SELECT TO authenticated USING (true);


-- ==============================================================
-- 3. REFRESH JOBS CANÓNICOS
-- ==============================================================

-- Refresh: Entity Rollup
CREATE OR REPLACE FUNCTION refresh_analytics_entity_rollup(p_days INT DEFAULT 90)
RETURNS INT LANGUAGE plpgsql AS $$
DECLARE
  v_rows_affected INT := 0;
  v_run_id UUID;
BEGIN
  INSERT INTO analytics_rollup_runs(rollup_name, status) VALUES ('entity_rollup', 'running') RETURNING id INTO v_run_id;
  
  -- Upsert agrupando desde signal_events las battles. (Ejemplo usando signal_types de victorias y derrotas)
  -- NOTA: Se asume que signal_events tiene un signal_type_id = 1 (win) y 2 (loss).
  -- A los fines del motor base:
  WITH daily_stats AS (
    SELECT 
      entity_id,
      DATE(created_at) as s_date,
      count(*) as total_b,
      sum(case when value_numeric = 1 THEN 1 ELSE 0 END) as w,
      sum(case when value_numeric = 0 THEN 1 ELSE 0 END) as l,
      sum(effective_weight) as w_pref
    FROM signal_events
    WHERE created_at >= (now() - (p_days || ' days')::interval)
      AND entity_id IS NOT NULL
      AND value_numeric IS NOT NULL 
    GROUP BY entity_id, DATE(created_at)
  )
  INSERT INTO analytics_daily_entity_rollup (entity_id, summary_date, total_battles, wins, losses, preference_share, momentum, created_at)
  SELECT 
    entity_id, 
    s_date,
    total_b,
    w,
    l,
    CASE WHEN total_b > 0 THEN ROUND((w::numeric / total_b::numeric) * 100, 2) ELSE 0 END as pref,
    0, -- momentum a calcular en pass 2
    now()
  FROM daily_stats
  ON CONFLICT (entity_id, summary_date) DO UPDATE SET 
    total_battles = EXCLUDED.total_battles,
    wins = EXCLUDED.wins,
    losses = EXCLUDED.losses,
    preference_share = EXCLUDED.preference_share,
    momentum = EXCLUDED.momentum;
    
  GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
  
  UPDATE analytics_rollup_runs 
  SET finished_at = now(), status = 'success', rows_affected = v_rows_affected 
  WHERE id = v_run_id;

  RETURN v_rows_affected;
EXCEPTION WHEN OTHERS THEN
  UPDATE analytics_rollup_runs 
  SET finished_at = now(), status = 'failed', error_message = SQLERRM 
  WHERE id = v_run_id;
  RETURN 0;
END;
$$;


-- Refresh: Segment Rollup (Demo simplificada basada en el ledger)
CREATE OR REPLACE FUNCTION refresh_analytics_segment_rollup(p_days INT DEFAULT 90)
RETURNS INT LANGUAGE plpgsql AS $$
DECLARE v_rows INT := 0; v_run_id UUID;
BEGIN
  INSERT INTO analytics_rollup_runs(rollup_name, status) VALUES ('segment_rollup', 'running') RETURNING id INTO v_run_id;
  
  -- Para mantener corto el rollup, usamos un placeholder query que extrae segmentos
  -- En un entorno real se extraería age_bucket o country de las señales
  WITH daily_stats AS (
    SELECT 
      entity_id,
      'age_bucket' as seg_type,
      COALESCE(age_bucket, 'unknown') as seg_val,
      DATE(created_at) as s_date,
      count(*) as total_b,
      sum(case when value_numeric = 1 THEN 1 ELSE 0 END) as w
    FROM signal_events
    WHERE created_at >= (now() - (p_days || ' days')::interval) AND entity_id IS NOT NULL AND age_bucket IS NOT NULL
    GROUP BY entity_id, age_bucket, DATE(created_at)
  )
  INSERT INTO analytics_daily_segment_rollup (entity_id, segment_type, segment_value, summary_date, total_battles, wins, preference_share)
  SELECT entity_id, seg_type, seg_val, s_date, total_b, w, 
         CASE WHEN total_b > 0 THEN ROUND((w::numeric / total_b::numeric) * 100, 2) ELSE 0 END
  FROM daily_stats
  ON CONFLICT (entity_id, segment_type, segment_value, summary_date) DO UPDATE SET
    total_battles = EXCLUDED.total_battles, wins = EXCLUDED.wins, preference_share = EXCLUDED.preference_share;
    
  GET DIAGNOSTICS v_rows = ROW_COUNT;
  UPDATE analytics_rollup_runs SET finished_at = now(), status = 'success', rows_affected = v_rows WHERE id = v_run_id;
  RETURN v_rows;
END;
$$;


-- Refresh: Depth Rollup
CREATE OR REPLACE FUNCTION refresh_analytics_depth_rollup(p_days INT DEFAULT 90)
RETURNS INT LANGUAGE plpgsql AS $$
DECLARE v_rows INT := 0; v_run_id UUID;
BEGIN
  INSERT INTO analytics_rollup_runs(rollup_name, status) VALUES ('depth_rollup', 'running') RETURNING id INTO v_run_id;
  
  WITH daily_stats AS (
    SELECT 
      entity_id,
      attribute_id as cat,
      DATE(created_at) as s_date,
      count(*) as total_resp,
      avg(value_numeric) as mean_score
    FROM signal_events
    WHERE attribute_id IS NOT NULL AND created_at >= (now() - (p_days || ' days')::interval)
    GROUP BY entity_id, attribute_id, DATE(created_at)
  )
  INSERT INTO analytics_daily_depth_rollup (entity_id, attribute_category, summary_date, depth_score, responses_count)
  SELECT entity_id, COALESCE(cat, 'unknown'), s_date, COALESCE(mean_score,0), total_resp
  FROM daily_stats
  ON CONFLICT (entity_id, attribute_category, summary_date) DO UPDATE SET
    depth_score = EXCLUDED.depth_score, responses_count = EXCLUDED.responses_count;
    
  GET DIAGNOSTICS v_rows = ROW_COUNT;
  UPDATE analytics_rollup_runs SET finished_at = now(), status = 'success', rows_affected = v_rows WHERE id = v_run_id;
  RETURN v_rows;
END;
$$;


-- Refresh: Topic Rollup (Actualidad)
CREATE OR REPLACE FUNCTION refresh_analytics_topic_rollup(p_days INT DEFAULT 90)
RETURNS INT LANGUAGE plpgsql AS $$
DECLARE v_rows INT := 0; v_run_id UUID;
BEGIN
  INSERT INTO analytics_rollup_runs(rollup_name, status) VALUES ('topic_rollup', 'running') RETURNING id INTO v_run_id;
  
  -- Agrupar señales por context_id (asumiendo que context_id = topic_id en noticias)
  WITH daily_topic AS (
    SELECT 
      context_id as t_id,
      DATE(created_at) as s_date,
      count(*) as total_sigs,
      count(distinct anon_id) as u_users,
      sum(effective_weight) as t_weight,
      mode() WITHIN GROUP (ORDER BY value_text) as dom_answer,
      -- Entropy logic se calcula usualmente via array de probs, acá marcamos 0 para simular hasta integrar la SQL externa
      0.5::numeric as entropy,
      -- heat basico
      count(*) * sum(effective_weight) / 100.0 as heat
    FROM signal_events
    WHERE context_id IS NOT NULL AND value_text IS NOT NULL AND created_at >= (now() - (p_days || ' days')::interval)
    GROUP BY context_id, DATE(created_at)
  )
  INSERT INTO analytics_daily_topic_rollup (
    topic_id, summary_date, total_signals, unique_users, total_effective_weight, 
    dominant_answer, entropy_normalized, heat_index, updated_at
  )
  SELECT t_id, s_date, total_sigs, u_users, t_weight, dom_answer, entropy, heat, now()
  FROM daily_topic
  ON CONFLICT (topic_id, summary_date) DO UPDATE SET
    total_signals = EXCLUDED.total_signals,
    unique_users = EXCLUDED.unique_users,
    total_effective_weight = EXCLUDED.total_effective_weight,
    dominant_answer = EXCLUDED.dominant_answer,
    entropy_normalized = EXCLUDED.entropy_normalized,
    heat_index = EXCLUDED.heat_index,
    updated_at = EXCLUDED.updated_at;
    
  GET DIAGNOSTICS v_rows = ROW_COUNT;
  UPDATE analytics_rollup_runs SET finished_at = now(), status = 'success', rows_affected = v_rows WHERE id = v_run_id;
  RETURN v_rows;
END;
$$;


-- Master Orchestrator
CREATE OR REPLACE FUNCTION refresh_analytics_all_rollups(p_days INT DEFAULT 90)
RETURNS JSONB LANGUAGE plpgsql AS $$
DECLARE 
  r_entity INT; r_seg INT; r_depth INT; r_topic INT;
BEGIN
  r_entity := refresh_analytics_entity_rollup(p_days);
  r_seg := refresh_analytics_segment_rollup(p_days);
  r_depth := refresh_analytics_depth_rollup(p_days);
  r_topic := refresh_analytics_topic_rollup(p_days);
  
  RETURN jsonb_build_object(
    'entity_rollup_rows', r_entity,
    'segment_rollup_rows', r_seg,
    'depth_rollup_rows', r_depth,
    'topic_rollup_rows', r_topic,
    'status', 'success',
    'timestamp', now()
  );
END;
$$;
