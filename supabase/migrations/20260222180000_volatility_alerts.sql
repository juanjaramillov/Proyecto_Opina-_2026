-- =====================================================
-- OPINA+ V12 — FIX 24: VOLATILITY ALERT SYSTEM
-- =====================================================

-- 1. TABLA DE HISTORIAL DE VOLATILIDAD
CREATE TABLE IF NOT EXISTS public.volatility_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_slug text NOT NULL,
  volatility_index numeric(15,2) NOT NULL,
  classification text NOT NULL,
  snapshot_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_volatility_history
ON public.volatility_snapshots (battle_slug, snapshot_at DESC);

-- 2. TABLA DE ALERTAS DE PLATAFORMA
CREATE TABLE IF NOT EXISTS public.platform_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL, -- 'volatility', 'fraud', 'system'
  severity text NOT NULL, -- 'info', 'warning', 'critical'
  title text NOT NULL,
  message text NOT NULL,
  metadata jsonb DEFAULT '{}',
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_platform_alerts_unread
ON public.platform_alerts (is_read) WHERE is_read = false;

-- 3. ACTUALIZAR GENERADOR DE SNAPSHOTS PARA INTEGRAR VOLATILIDAD
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
  -- 1. Insertar snapshots de ranking (Lógica FIX 06)
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

  -- 2. Calcular y procesar volatilidad por cada batalla activa
  FOR v_battle_slug IN SELECT DISTINCT slug FROM public.battles WHERE deleted_at IS NULL LOOP
    
    -- Obtener métricas de volatilidad (usando la función de FIX 22)
    SELECT volatility_score, volatility_index, classification 
    INTO v_v_score, v_v_index, v_v_class
    FROM public.get_battle_volatility(v_battle_slug, 30);

    IF v_v_class IS NOT NULL THEN
      -- Obtener clasificación anterior
      SELECT classification INTO v_prev_class
      FROM public.volatility_snapshots
      WHERE battle_slug = v_battle_slug
      ORDER BY snapshot_at DESC
      LIMIT 1;

      -- Insertar snapshot de volatilidad
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

      -- Detectar cambio de estado para alerta
      -- 'stable' -> 'moderate' (info)
      -- 'moderate' -> 'volatile' (warning)
      -- 'stable' -> 'volatile' (critical)
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
  
  -- 3. Limpiar snapshots antiguos (Lógica FIX 06 extendida a 30 días para comparativas)
  DELETE FROM public.ranking_snapshots 
  WHERE snapshot_at < now() - interval '30 days';

  DELETE FROM public.volatility_snapshots
  WHERE snapshot_at < now() - interval '30 days';
END;
$$;

-- 4. RPC PARA OBTENER ALERTAS
CREATE OR REPLACE FUNCTION public.get_platform_alerts(p_limit integer DEFAULT 10)
RETURNS SETOF public.platform_alerts
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM public.platform_alerts
  ORDER BY is_read ASC, created_at DESC
  LIMIT p_limit;
$$;
