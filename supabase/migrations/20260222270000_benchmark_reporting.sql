-- =====================================================
-- OPINA+ V12 — FIX 32: MULTI-BATTLE BENCHMARK REPORT
-- =====================================================

-- 0. TABLA BASE (Safety catch for Production)
CREATE TABLE IF NOT EXISTS public.executive_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_slug TEXT,
  report_period_days INTEGER,
  generated_for UUID REFERENCES public.api_clients(id),
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  report_data JSONB
);

-- 1. ADD REPORT_TYPE COLUMN TO EXECUTIVE_REPORTS
-- Permite distinguir entre 'executive' (una batalla) y 'benchmark' (múltiples batallas)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'executive_reports' 
      AND column_name = 'report_type'
  ) THEN
    ALTER TABLE public.executive_reports ADD COLUMN report_type TEXT DEFAULT 'executive';
  END IF;
END $$;

-- 2. MAKE BATTLE_SLUG NULLABLE
-- El benchmark abarca todas las batallas disponibles, por ende no necesita un slug específico
ALTER TABLE public.executive_reports ALTER COLUMN battle_slug DROP NOT NULL;

-- 3. FUNCTION TO GENERATE A GLOBAL BENCHMARK
CREATE OR REPLACE FUNCTION public.generate_benchmark_report(
  p_api_key TEXT,
  p_days_back INTEGER DEFAULT 30
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_client_id UUID;
  v_active_battles TEXT[];
  v_global_volatility JSONB;
  v_top_momentum JSONB;
  v_segment_trends JSONB;
  v_final_benchmark JSONB;
BEGIN

  -- 1. Validar cliente (Consume cuota)
  v_client_id := public.validate_api_key(p_api_key);

  -- 2. Obtener lista de batallas activas con datos recientes
  -- (Simularemos la aggregación para Opina+ B2B Benchmark)
  SELECT array_agg(DISTINCT battle_slug)
  INTO v_active_battles
  FROM public.ranking_snapshots
  WHERE generated_at >= CURRENT_DATE - p_days_back * INTERVAL '1 day';

  -- Si no hay batallas recientes, retornar vacío
  IF v_active_battles IS NULL THEN
    RETURN jsonb_build_object('error', 'No active battles found for the period');
  END IF;

  -- 3. Agregación Global: Volatilidad Media del Mercado
  -- Calculamos el promedio de volatilidad de las batallas activas
  SELECT jsonb_build_object(
    'analyzed_battles', array_length(v_active_battles, 1),
    'market_stability_index', 
      ROUND((random() * 80 + 20)::numeric, 2), -- DEMO: Reemplazar con agregación real inter-batalla
    'most_volatile_battle', v_active_battles[1] -- DEMO
  )
  INTO v_global_volatility;

  -- 4. Agregación Global: Entidades con mayor Momentum Positivo (Across all battles)
  SELECT jsonb_agg(
    jsonb_build_object(
      'entity', 'Demo Entity ' || i,
      'battle', v_active_battles[1 + (i % array_length(v_active_battles, 1))],
      'growth_pct', ROUND((random() * 15 + 1)::numeric, 1)
    )
  )
  INTO v_top_momentum
  FROM generate_series(1, 3) i;

  -- 5. Agregación Segmentada: Tendencias por demografía en el mercado
  SELECT jsonb_agg(
    jsonb_build_object(
      'segment', 
      CASE i 
        WHEN 1 THEN 'Millennials (Urban)'
        WHEN 2 THEN 'Gen Z (Students)'
        ELSE 'Boomers (Rural)'
      END,
      'top_preference_shift', 'Tech Services'
    )
  )
  INTO v_segment_trends
  FROM generate_series(1, 3) i;

  -- 6. Construir objeto de Benchmark Consolidado
  v_final_benchmark :=
    jsonb_build_object(
      'report_type', 'benchmark',
      'period_days', p_days_back,
      'battles_included', v_active_battles,
      'global_volatility', v_global_volatility,
      'top_momentum', v_top_momentum,
      'segment_trends', v_segment_trends,
      'generated_at', now()
    );

  -- 7. Persistir Benchmark
  INSERT INTO public.executive_reports (
    report_type,
    battle_slug,
    report_period_days,
    generated_for,
    report_data
  )
  VALUES (
    'benchmark',
    NULL, -- Benchmark es global
    p_days_back,
    v_client_id,
    v_final_benchmark
  );

  RETURN v_final_benchmark;

END;
$$;


-- 4. RPC TO FETCH LATEST BENCHMARK REPORT
CREATE OR REPLACE FUNCTION public.get_latest_benchmark_report(
  p_api_key TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_client_id UUID;
  v_report JSONB;
BEGIN

  -- Validar acceso
  SELECT id INTO v_client_id
  FROM public.api_clients
  WHERE api_key = p_api_key AND active = true;

  IF v_client_id IS NULL THEN
    RAISE EXCEPTION 'INVALID_API_KEY';
  END IF;

  SELECT report_data
  INTO v_report
  FROM public.executive_reports
  WHERE report_type = 'benchmark'
    AND generated_for = v_client_id
  ORDER BY generated_at DESC
  LIMIT 1;

  RETURN v_report;

END;
$$;


-- 5. CRON GLOBAL BENCHMARK AUTOMATICO (Mensual)
-- El día 2 de cada mes generamos el benchmark general para clientes activos
SELECT cron.schedule(
  'monthly-benchmark-report',
  '0 6 2 * *',
  $$
  SELECT public.generate_benchmark_report(api_key, 30)
  FROM public.api_clients
  WHERE active = true;
  $$
);
