-- ====================================================================
-- OPINA+ V12 — FIX 30: VERSUS MOMENTUM & ALGORITHMIC FEEDBACK RPC
-- ====================================================================

-- RPC definition to get the current momentum and validation context 
-- after a user votes in a Versus battle.

CREATE OR REPLACE FUNCTION public.get_battle_momentum(p_battle_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSONB;
  v_opt_a_id UUID;
  v_opt_b_id UUID;
  v_opt_a_total BIGINT := 0;
  v_opt_b_total BIGINT := 0;
  v_opt_a_24h BIGINT := 0;
  v_opt_b_24h BIGINT := 0;
  v_total_battle BIGINT := 0;
  v_total_24h BIGINT := 0;
  v_pct_a NUMERIC := 0;
  v_pct_b NUMERIC := 0;
  v_variant_a NUMERIC := 0;
  v_variant_b NUMERIC := 0;
  v_options RECORD;
BEGIN
  -- Obtain the two options for the battle (assumes a standard 1v1 battle)
  -- If more options exist, we take the primary two to maintain 1v1 UX momentum.
  SELECT array_agg(id) INTO v_options FROM (
    SELECT id FROM public.battle_options WHERE battle_id = p_battle_id ORDER BY sort_order LIMIT 2
  ) as sub;

  IF v_options IS NOT NULL AND array_length(v_options.array_agg, 1) >= 2 THEN
    v_opt_a_id := v_options.array_agg[1];
    v_opt_b_id := v_options.array_agg[2];

    -- Total signals per option
    SELECT COUNT(*) INTO v_opt_a_total FROM public.signal_events WHERE option_id = v_opt_a_id;
    SELECT COUNT(*) INTO v_opt_b_total FROM public.signal_events WHERE option_id = v_opt_b_id;

    -- Signals in the last 24h per option
    SELECT COUNT(*) INTO v_opt_a_24h FROM public.signal_events 
    WHERE option_id = v_opt_a_id AND created_at >= (now() - interval '24 hours');
    SELECT COUNT(*) INTO v_opt_b_24h FROM public.signal_events 
    WHERE option_id = v_opt_b_id AND created_at >= (now() - interval '24 hours');

    -- Calculations
    v_total_battle := v_opt_a_total + v_opt_b_total;
    v_total_24h := v_opt_a_24h + v_opt_b_24h;

    IF v_total_battle > 0 THEN
      v_pct_a := ROUND((v_opt_a_total::NUMERIC / v_total_battle) * 100, 1);
      v_pct_b := ROUND((v_opt_b_total::NUMERIC / v_total_battle) * 100, 1);
    ELSE
      v_pct_a := 50.0;
      v_pct_b := 50.0;
    END IF;

    -- Variant calculation (mocking a "momentum" percentage based on 24h flow vs historic flow)
    IF v_total_24h > 0 THEN
      v_variant_a := ROUND(((v_opt_a_24h::NUMERIC / v_total_24h) * 100) - v_pct_a, 1);
      v_variant_b := ROUND(((v_opt_b_24h::NUMERIC / v_total_24h) * 100) - v_pct_b, 1);
    END IF;
  ELSE
    -- Fallback if not exactly 2 options
    v_pct_a := 50.0; v_pct_b := 50.0;
  END IF;

  v_result := jsonb_build_object(
    'total_signals', v_total_battle,
    'options', jsonb_build_array(
       jsonb_build_object('id', v_opt_a_id, 'percentage', v_pct_a, 'variant_24h', v_variant_a, 'total', v_opt_a_total),
       jsonb_build_object('id', v_opt_b_id, 'percentage', v_pct_b, 'variant_24h', v_variant_b, 'total', v_opt_b_total)
    )
  );

  RETURN v_result;
END;
$$;
