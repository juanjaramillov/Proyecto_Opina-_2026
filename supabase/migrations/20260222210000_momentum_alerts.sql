-- =====================================================
-- OPINA+ V12 — FIX 27: INTELLIGENCE ALERT ENGINE
-- =====================================================

-- 1. FUNCION PARA GENERAR ALERTAS DE MOMENTUM
CREATE OR REPLACE FUNCTION public.generate_momentum_alerts(
  p_battle_slug TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN
    SELECT *
    FROM detect_early_signal(p_battle_slug, 6)
    WHERE classification = 'emerging'
  LOOP
    -- Insertar alerta si no hay una alerta similar no resuelta en las últimas 24h
    IF NOT EXISTS (
      SELECT 1 FROM public.platform_alerts
      WHERE type = 'momentum'
        AND metadata->>'battle_slug' = p_battle_slug
        AND metadata->>'option_label' = rec.option_label
        AND is_read = false
        AND created_at > now() - interval '24 hours'
    ) THEN
      INSERT INTO public.platform_alerts (
        type,
        severity,
        title,
        message,
        metadata
      )
      VALUES (
        'momentum',
        'medium',
        'Tendencia Emergente: ' || rec.option_label,
        'Se detectó un momentum de ' || round(rec.momentum_ratio, 2) || 'x en las últimas 6 horas para la batalla ' || p_battle_slug || '.',
        jsonb_build_object(
          'battle_slug', p_battle_slug,
          'option_id', rec.option_id,
          'option_label', rec.option_label,
          'momentum_ratio', rec.momentum_ratio
        )
      );
    END IF;
  END LOOP;
END;
$$;

-- 2. ACTUALIZAR GENERADOR DE SNAPSHOTS PARA INTEGRAR MOMENTUM
CREATE OR REPLACE FUNCTION public.generate_ranking_snapshot()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_battle_slug text;
  v_v_score numeric;
  v_v_index numeric;
  v_v_class text;
  v_prev_class text;
BEGIN
  -- 1. Insertar snapshots de ranking
  INSERT INTO public.ranking_snapshots (
    battle_slug,
    option_id,
    total_weight,
    rank_position,
    snapshot_at
  )
  SELECT 
    b.slug as battle_slug,
    se.option_id,
    SUM(se.signal_weight) as total_weight,
    RANK() OVER (PARTITION BY b.slug ORDER BY SUM(se.signal_weight) DESC) as rank_position,
    now()
  FROM public.signal_events se
  JOIN public.battles b ON b.id = se.battle_id
  WHERE se.battle_id IS NOT NULL 
    AND se.option_id IS NOT NULL
  GROUP BY b.slug, se.option_id;

  -- 2. Procesar cada batalla activa para Volatilidad y Momentum
  FOR v_battle_slug IN SELECT DISTINCT slug FROM public.battles WHERE deleted_at IS NULL LOOP
    
    -- a) Alertas de Momentum (NUEVO FIX 27)
    PERFORM public.generate_momentum_alerts(v_battle_slug);

    -- b) Volatilidad (FIX 24)
    SELECT volatility_score, volatility_index, classification 
    INTO v_v_score, v_v_index, v_v_class
    FROM public.get_battle_volatility(v_battle_slug, 30);

    IF v_v_class IS NOT NULL THEN
      SELECT classification INTO v_prev_class
      FROM public.volatility_snapshots
      WHERE battle_slug = v_battle_slug
      ORDER BY snapshot_at DESC
      LIMIT 1;

      INSERT INTO public.volatility_snapshots (
        battle_slug,
        volatility_index,
        classification,
        snapshot_at
      ) VALUES (
        v_battle_slug,
        v_v_index,
        v_v_class,
        now()
      );

      IF v_prev_class IS NOT NULL AND v_prev_class <> v_v_class THEN
        INSERT INTO public.platform_alerts (
          type,
          severity,
          title,
          message,
          metadata
        ) VALUES (
          'volatility',
          CASE 
            WHEN v_v_class = 'volatile' AND v_prev_class = 'stable' THEN 'critical'
            WHEN v_v_class = 'volatile' THEN 'warning'
            ELSE 'info'
          END,
          'Cambio de Volatilidad: ' || v_battle_slug,
          'La batalla ha pasado de ' || v_prev_class || ' a ' || v_v_class || '.',
          jsonb_build_object(
            'battle_slug', v_battle_slug,
            'prev_class', v_prev_class,
            'new_class', v_v_class,
            'volatility_index', v_v_index
          )
        );
      END IF;
    END IF;
  END LOOP;
  
  -- 3. Limpiar snapshots antiguos
  DELETE FROM public.ranking_snapshots 
  WHERE snapshot_at < now() - interval '30 days';

  DELETE FROM public.volatility_snapshots
  WHERE snapshot_at < now() - interval '30 days';
END;
$$;

-- 3. RPC PARA RESOLVER ALERTAS
CREATE OR REPLACE FUNCTION public.mark_platform_alert_read(p_alert_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.platform_alerts
  SET is_read = true
  WHERE id = p_alert_id;
END;
$$;
