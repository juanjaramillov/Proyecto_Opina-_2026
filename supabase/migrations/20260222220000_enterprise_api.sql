-- =====================================================
-- OPINA+ V12 — FIX 28: ENTERPRISE INTELLIGENCE API
-- =====================================================

-- 1. TABLA API CLIENTS
CREATE TABLE IF NOT EXISTS public.api_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name TEXT NOT NULL,
  api_key TEXT UNIQUE NOT NULL,
  request_limit INTEGER DEFAULT 10000,
  requests_used INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_api_key
ON public.api_clients (api_key);

-- 2. LOG DE CONSUMO
CREATE TABLE IF NOT EXISTS public.api_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.api_clients(id),
  endpoint TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_api_usage
ON public.api_usage_logs (client_id, created_at DESC);

-- 3. FUNCION VALIDAR API KEY
CREATE OR REPLACE FUNCTION public.validate_api_key(p_key TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_client_id UUID;
  v_limit_reached BOOLEAN;
BEGIN
  SELECT id,
         (requests_used >= request_limit)
  INTO v_client_id, v_limit_reached
  FROM public.api_clients
  WHERE api_key = p_key
    AND active = true;

  IF v_client_id IS NULL THEN
    RAISE EXCEPTION 'INVALID_API_KEY';
  END IF;

  IF v_limit_reached THEN
    RAISE EXCEPTION 'API_LIMIT_REACHED';
  END IF;

  UPDATE public.api_clients
  SET requests_used = requests_used + 1
  WHERE id = v_client_id;

  RETURN v_client_id;
END;
$$;

-- 4. WRAPPER RPC PROTEGIDO (Incluye labels de opciones para utilidad B2B)
CREATE OR REPLACE FUNCTION public.api_get_ranking(
  p_api_key TEXT,
  p_battle_slug TEXT
)
RETURNS TABLE (
  option_id UUID,
  option_label TEXT,
  total_weight NUMERIC,
  rank_position INTEGER,
  snapshot_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_client_id UUID;
  v_latest_ts TIMESTAMP WITH TIME ZONE;
BEGIN
  -- 1. Validar llave y cuota
  v_client_id := public.validate_api_key(p_api_key);

  -- 2. Registrar consumo
  INSERT INTO public.api_usage_logs (
    client_id,
    endpoint
  )
  VALUES (
    v_client_id,
    'api_get_ranking'
  );

  -- 3. Obtener timestamp del snapshot más reciente para esta batalla
  SELECT MAX(rs.snapshot_at) INTO v_latest_ts
  FROM public.ranking_snapshots rs
  WHERE rs.battle_slug = p_battle_slug;

  -- 4. Retornar ranking
  RETURN QUERY
  SELECT 
    rs.option_id,
    bo.label AS option_label,
    rs.total_weight,
    rs.rank_position,
    rs.snapshot_at
  FROM public.ranking_snapshots rs
  JOIN public.battle_options bo ON bo.id = rs.option_id
  WHERE rs.battle_slug = p_battle_slug
    AND rs.snapshot_at = v_latest_ts
  ORDER BY rs.rank_position ASC;
END;
$$;

-- 5. GENERAR API KEY DE DEMOSTRACIÓN (Para Empresa Demo)
INSERT INTO public.api_clients (
  client_name,
  api_key,
  request_limit
)
VALUES (
  'Empresa Demo',
  'demo_enterprise_key_2026_opina_plus', -- Ejemplo descriptivo para demo
  50000
) ON CONFLICT (api_key) DO NOTHING;
