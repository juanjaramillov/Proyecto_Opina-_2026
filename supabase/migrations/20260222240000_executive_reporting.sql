-- =====================================================
-- OPINA+ V12 — FIX 30: EXECUTIVE REPORTING ENGINE
-- =====================================================

-- 1. TABLA REPORTES
CREATE TABLE IF NOT EXISTS public.executive_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_slug TEXT,
  report_period_days INTEGER,
  generated_for UUID REFERENCES public.api_clients(id),
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  report_data JSONB
);

CREATE INDEX IF NOT EXISTS idx_exec_reports
ON public.executive_reports (battle_slug, generated_at DESC);

-- 2. FUNCION GENERAR DATASET EJECUTIVO
CREATE OR REPLACE FUNCTION public.generate_executive_report(
  p_api_key TEXT,
  p_battle_slug TEXT,
  p_days_back INTEGER DEFAULT 30
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_client_id UUID;
  v_ranking_data JSONB;
  v_volatility_data JSONB;
  v_polarization_data JSONB;
  v_influence_data JSONB;
  v_final_report JSONB;
BEGIN

  -- 1. Validar cliente y descontar cuota
  v_client_id := public.validate_api_key(p_api_key);

  -- 2. Recopilar datos de rankings temporales (FIX 21)
  SELECT jsonb_agg(row_to_json(t))
  INTO v_ranking_data
  FROM public.get_temporal_comparison(p_battle_slug, p_days_back) t;

  -- 3. Recopilar datos de volatilidad (FIX 22)
  SELECT row_to_json(v)
  INTO v_volatility_data
  FROM public.get_battle_volatility(p_battle_slug, p_days_back) v;

  -- 4. Recopilar datos de polarización (FIX 23)
  SELECT row_to_json(p)
  INTO v_polarization_data
  FROM public.get_polarization_index(p_battle_slug) p;

  -- 5. Recopilar datos de influencia de segmentos (FIX 25)
  -- Nota: Usamos 7 días para influencia como estándar
  SELECT jsonb_agg(row_to_json(i))
  INTO v_influence_data
  FROM public.get_segment_influence(p_battle_slug, 7) i;

  -- 6. Construir objeto consolidado
  v_final_report :=
    jsonb_build_object(
      'battle', p_battle_slug,
      'period_days', p_days_back,
      'ranking', v_ranking_data,
      'volatility', v_volatility_data,
      'polarization', v_polarization_data,
      'segment_influence', v_influence_data,
      'generated_at', now()
    );

  -- 7. Persistir reporte
  INSERT INTO public.executive_reports (
    battle_slug,
    report_period_days,
    generated_for,
    report_data
  )
  VALUES (
    p_battle_slug,
    p_days_back,
    v_client_id,
    v_final_report
  );

  RETURN v_final_report;

END;
$$;

-- 3. RPC OBTENER ULTIMO REPORTE
CREATE OR REPLACE FUNCTION public.get_latest_executive_report(
  p_api_key TEXT,
  p_battle_slug TEXT
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
  WHERE battle_slug = p_battle_slug
    AND generated_for = v_client_id
  ORDER BY generated_at DESC
  LIMIT 1;

  RETURN v_report;

END;
$$;

-- 4. CRON REPORTE MENSUAL AUTOMATICO
-- Genera un reporte de 30 días para todos los clientes activos el día 1 de cada mes
-- Importante: Requiere que existan snapshots previos suficientes
SELECT cron.schedule(
  'monthly-executive-report',
  '0 6 1 * *',
  $$
  SELECT public.generate_executive_report(
    api_key,
    'netflix-vs-disney', -- Ejemplo, se podría parametrizar o iterar batallas activas
    30
  )
  FROM public.api_clients
  WHERE active = true;
  $$
);
