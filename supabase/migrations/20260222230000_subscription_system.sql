-- =====================================================
-- OPINA+ V12 — FIX 29: SUBSCRIPTION & PRICING SYSTEM
-- =====================================================

-- 1. TABLA DE PLANES DE SUSCRIPCIÓN
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_name TEXT UNIQUE NOT NULL,
  monthly_price NUMERIC NOT NULL,
  request_limit INTEGER NOT NULL,
  features JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. CARGA DE PLANES INICIALES
INSERT INTO public.subscription_plans (plan_name, monthly_price, request_limit, features)
VALUES
(
  'free',
  0,
  1000,
  '{"segment_access": false, "depth_access": false}'
),
(
  'pro',
  199,
  20000,
  '{"segment_access": true, "depth_access": false}'
),
(
  'enterprise',
  999,
  100000,
  '{"segment_access": true, "depth_access": true}'
)
ON CONFLICT (plan_name) DO UPDATE 
SET monthly_price = EXCLUDED.monthly_price,
    request_limit = EXCLUDED.request_limit,
    features = EXCLUDED.features;

-- 3. MODIFICAR api_clients PARA VINCULAR PLANES
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='api_clients' AND column_name='plan_id') THEN
    ALTER TABLE public.api_clients ADD COLUMN plan_id UUID REFERENCES public.subscription_plans(id);
  END IF;
END $$;

-- Asignar el plan 'enterprise' al cliente demo existente para no romper las pruebas
UPDATE public.api_clients 
SET plan_id = (SELECT id FROM public.subscription_plans WHERE plan_name = 'enterprise')
WHERE client_name = 'Empresa Demo' AND plan_id IS NULL;

-- 4. ACTUALIZAR FUNCIÓN DE VALIDACIÓN DE API KEY (Límites Dinámicos)
CREATE OR REPLACE FUNCTION public.validate_api_key(p_key TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_client_id UUID;
  v_request_limit INTEGER;
  v_requests_used INTEGER;
  v_active BOOLEAN;
BEGIN
  -- Obtenemos datos del cliente y su plan
  SELECT ac.id, ac.requests_used, ac.active, sp.request_limit
  INTO v_client_id, v_requests_used, v_active, v_request_limit
  FROM public.api_clients ac
  LEFT JOIN public.subscription_plans sp ON ac.plan_id = sp.id
  WHERE ac.api_key = p_key;

  -- Validaciones de seguridad
  IF v_client_id IS NULL OR v_active = false THEN
    RAISE EXCEPTION 'INVALID_OR_INACTIVE_API_KEY';
  END IF;

  -- Si el cliente existe pero no tiene plan, usamos el límite de la tabla api_clients por retrocompatibilidad
  IF v_request_limit IS NULL THEN
    SELECT request_limit INTO v_request_limit FROM public.api_clients WHERE id = v_client_id;
  END IF;

  -- Validación de cuota
  IF v_requests_used >= v_request_limit THEN
    RAISE EXCEPTION 'PLAN_LIMIT_REACHED';
  END IF;

  -- Incrementar contador
  UPDATE public.api_clients
  SET requests_used = requests_used + 1
  WHERE id = v_client_id;

  RETURN v_client_id;
END;
$$;

-- 5. RPC PARA CONSULTAR EL PLAN ACTUAL
CREATE OR REPLACE FUNCTION public.get_client_plan(p_api_key TEXT)
RETURNS TABLE (
  plan_name TEXT,
  monthly_price NUMERIC,
  request_limit INTEGER,
  requests_used INTEGER,
  features JSONB
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    sp.plan_name,
    sp.monthly_price,
    sp.request_limit,
    ac.requests_used,
    sp.features
  FROM public.api_clients ac
  JOIN public.subscription_plans sp ON ac.plan_id = sp.id
  WHERE ac.api_key = p_api_key;
$$;

-- 6. PROGRAMAR RESET MENSUAL DE USO (Primer día de cada mes)
-- NOTA: Requiere pg_cron disponible en la instancia
SELECT cron.schedule(
  'reset-monthly-usage',
  '0 0 1 * *',
  'UPDATE public.api_clients SET requests_used = 0;'
);
