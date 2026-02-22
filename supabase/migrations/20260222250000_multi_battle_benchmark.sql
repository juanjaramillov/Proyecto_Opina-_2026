-- =====================================================
-- OPINA+ V12 — FIX 32: MULTI-BATTLE BENCHMARK REPORT
-- =====================================================

-- 1. EXTENDER TABLA executive_reports
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='executive_reports' AND column_name='report_type') THEN
    ALTER TABLE public.executive_reports ADD COLUMN report_type TEXT DEFAULT 'battle';
  END IF;
END $$;

-- Modificar battle_slug para que permita nulos (en caso de reportes benchmark que cruzan toda la plataforma)
ALTER TABLE public.executive_reports ALTER COLUMN battle_slug DROP NOT NULL;

-- 2. FUNCIÓN GENERAR DATASET BENCHMARK MULTI-BATALLA
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
  v_movers JSONB;
  v_volatility JSONB;
  v_polarization JSONB;
  v_early_signals JSONB;
  v_final_report JSONB;
BEGIN

  -- 1. Validar cliente y cuota
  v_client_id := public.validate_api_key(p_api_key);

  -- 2. Top Movers: batallas con mayor cambio absoluto agregado (tendencia del mercado)
  WITH battle_changes AS (
    SELECT
      b.slug AS battle_slug,
      b.title AS battle_title,
      SUM(ABS(tc.variation)) AS total_change
    FROM public.battles b
    JOIN LATERAL public.get_temporal_comparison(b.slug, p_days_back) tc ON true
    WHERE b.status = 'active'
    GROUP BY b.slug, b.title
    ORDER BY total_change DESC
    LIMIT 10
  )
  SELECT jsonb_agg(row_to_json(t))
  INTO v_movers
  FROM battle_changes t;

  -- 3. Top Volatility
  WITH battle_volatility AS (
    SELECT
      b.slug AS battle_slug,
      b.title AS battle_title,
      (public.get_battle_volatility(b.slug, p_days_back)).*
    FROM public.battles b
    WHERE b.status = 'active'
  )
  SELECT jsonb_agg(row_to_json(v))
  INTO v_volatility
  FROM (
    SELECT battle_slug, battle_title, volatility_index, classification
    FROM battle_volatility
    ORDER BY volatility_index DESC
    LIMIT 10
  ) v;

  -- 4. Top Polarization (Batallas más competitivas)
  WITH battle_polarization AS (
    SELECT
      b.slug AS battle_slug,
      b.title AS battle_title,
      (public.get_polarization_index(b.slug)).*
    FROM public.battles b
    WHERE b.status = 'active'
  )
  SELECT jsonb_agg(row_to_json(p))
  INTO v_polarization
  FROM (
    SELECT battle_slug, battle_title, polarization_index, classification, top_share, second_share
    FROM battle_polarization
    ORDER BY polarization_index ASC -- Menor índice = Mayor competencia (más polarizado)
    LIMIT 10
  ) p;

  -- 5. Early Signals (6h Momentum) a nivel plataforma
  WITH early AS (
    SELECT
      b.slug AS battle_slug,
      b.title AS battle_title,
      es.option_id,
      es.option_label,
      es.momentum_ratio,
      es.classification
    FROM public.battles b
    JOIN LATERAL public.detect_early_signal(b.slug, 6) es ON true
    WHERE b.status = 'active'
      AND es.classification = 'emerging'
    ORDER BY es.momentum_ratio DESC
    LIMIT 20
  )
  SELECT jsonb_agg(row_to_json(e))
  INTO v_early_signals
  FROM early e;

  -- 6. Construir objeto de reporte consolidado
  v_final_report :=
    jsonb_build_object(
      'type', 'benchmark',
      'period_days', p_days_back,
      'top_movers', COALESCE(v_movers, '[]'::jsonb),
      'top_volatility', COALESCE(v_volatility, '[]'::jsonb),
      'top_polarization', COALESCE(v_polarization, '[]'::jsonb),
      'early_signals', COALESCE(v_early_signals, '[]'::jsonb),
      'generated_at', now()
    );

  -- 7. Persistir Benchmark
  INSERT INTO public.executive_reports (
    battle_slug,
    report_period_days,
    generated_for,
    report_type,
    report_data
  )
  VALUES (
    NULL, -- null para reportes multiplataforma
    p_days_back,
    v_client_id,
    'benchmark',
    v_final_report
  );

  RETURN v_final_report;

END;
$$;

-- 3. RPC OBTENER ULTIMO BENCHMARK
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

  v_client_id := public.validate_api_key(p_api_key);

  SELECT report_data
  INTO v_report
  FROM public.executive_reports
  WHERE generated_for = v_client_id
    AND report_type = 'benchmark'
  ORDER BY generated_at DESC
  LIMIT 1;

  RETURN v_report;

END;
$$;

-- 4. CRON MENSUAL
-- Generar Benchmark multiplataforma a las 07:00 del primer día del mes para clientes activos
SELECT cron.schedule(
  'monthly-benchmark-report',
  '0 7 1 * *',
  $$
  SELECT public.generate_benchmark_report(api_key, 30)
  FROM public.api_clients
  WHERE active = true;
  $$
);
