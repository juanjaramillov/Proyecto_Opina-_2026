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
    WHERE context_id IS NOT NULL 
      AND value_text IS NOT NULL 
      AND created_at >= (now() - (p_days || ' days')::interval)
      -- Asegurar que context_id puede castearse a UUID
      AND context_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    GROUP BY context_id, DATE(created_at)
  )
  INSERT INTO analytics_daily_topic_rollup (
    topic_id, summary_date, total_signals, unique_users, total_effective_weight, 
    dominant_answer, entropy_normalized, heat_index, updated_at
  )
  SELECT 
    t_id::uuid, s_date, total_sigs, u_users, t_weight, dom_answer, entropy, heat, now()
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
