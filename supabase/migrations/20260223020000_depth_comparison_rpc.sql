-- ====================================================================
-- OPINA+ V12 — FIX 31: DEPTH COMPARISON RPC FOR IMMEDIATE FEEDBACK
-- ====================================================================

-- RPC definition to get the immediate analytical comparison 
-- (Global vs Segment vs Own) after submitting a depth question (like NPS).

CREATE OR REPLACE FUNCTION public.get_depth_immediate_comparison(
  p_question_id TEXT, 
  p_segment_filter TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSONB;
  v_global_avg NUMERIC := 0;
  v_segment_avg NUMERIC := 0;
  v_total_answers BIGINT := 0;
  v_segment_answers BIGINT := 0;
  v_promoters BIGINT := 0;
  v_passives BIGINT := 0;
  v_detractors BIGINT := 0;
  v_is_nps BOOLEAN := FALSE;
BEGIN
  -- Assuming depth answers are tracked. For Opina+ architecture, they are usually signals with specific option classes, 
  -- but since it's depth, it's either in user_state_logs or we compute it via signal_events linked to the insight question.
  -- Here we query `signal_events` where `option_id` acts as the numeric score if it's an NPS scale (0-10), 
  -- or we rely on a simplified aggregate if it's text. 

  -- For this MVP feedback, we will aggregate all signals that share this question context.
  -- Opina V12 uses the 'option_id' field in signal_events to store the chosen ID from InsightPack.
  -- If those IDs are numeric strings ('0', '1', ..., '10'), we can average them.

  SELECT 
    COUNT(*), 
    COALESCE(AVG(NULLIF(regexp_replace(option_id, '[^\d.]', '', 'g'), '')::NUMERIC), 0)
  INTO v_total_answers, v_global_avg
  FROM public.signal_events 
  WHERE source_id = p_question_id;

  -- Detection if it's NPS (0-10 options)
  SELECT 
    COUNT(*) FILTER (WHERE NULLIF(regexp_replace(option_id, '[^\d.]', '', 'g'), '')::NUMERIC >= 9) as promoters,
    COUNT(*) FILTER (WHERE NULLIF(regexp_replace(option_id, '[^\d.]', '', 'g'), '')::NUMERIC BETWEEN 7 AND 8) as passives,
    COUNT(*) FILTER (WHERE NULLIF(regexp_replace(option_id, '[^\d.]', '', 'g'), '')::NUMERIC <= 6) as detractors
  INTO v_promoters, v_passives, v_detractors
  FROM public.signal_events 
  WHERE source_id = p_question_id;

  IF (v_promoters + v_passives + v_detractors) > 0 THEN
      v_is_nps := TRUE;
  END IF;

  -- Segment aggregation (If filter provided, e.g. "age_bucket:25-34")
  IF p_segment_filter IS NOT NULL THEN
     -- Example of simple matching using metadata_segment JSONB column
     SELECT 
       COUNT(*), 
       COALESCE(AVG(NULLIF(regexp_replace(option_id, '[^\d.]', '', 'g'), '')::NUMERIC), 0)
     INTO v_segment_answers, v_segment_avg
     FROM public.signal_events 
     WHERE source_id = p_question_id 
     AND metadata_segment::TEXT LIKE '%' || p_segment_filter || '%';
  ELSE
     v_segment_avg := v_global_avg;
  END IF;

  v_result := jsonb_build_object(
    'global_avg', ROUND(v_global_avg, 1),
    'segment_avg', ROUND(v_segment_avg, 1),
    'total_signals', v_total_answers,
    'is_nps', v_is_nps,
    'distribution', jsonb_build_object(
      'promoters', v_promoters,
      'passives', v_passives,
      'detractors', v_detractors
    )
  );

  RETURN v_result;
END;
$$;
