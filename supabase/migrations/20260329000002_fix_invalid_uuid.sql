-- Fix for "invalid input syntax for type uuid: 'unknown'" in refresh_analytics_depth_rollup
-- This is caused by COALESCE(cat, 'unknown') where cat is a UUID.
-- The column attribute_category in analytics_daily_depth_rollup is TEXT.
-- Proper cast is COALESCE(cat::text, 'unknown')

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
  SELECT entity_id, COALESCE(cat::text, 'unknown'), s_date, COALESCE(mean_score,0), total_resp
  FROM daily_stats
  ON CONFLICT (entity_id, attribute_category, summary_date) DO UPDATE SET
    depth_score = EXCLUDED.depth_score, responses_count = EXCLUDED.responses_count;
    
  GET DIAGNOSTICS v_rows = ROW_COUNT;
  UPDATE analytics_rollup_runs SET finished_at = now(), status = 'success', rows_affected = v_rows WHERE id = v_run_id;
  RETURN v_rows;
END;
$$;
