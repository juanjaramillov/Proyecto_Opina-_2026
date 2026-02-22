-- =====================================================
-- OPINA+ V12 — FIX 33: B2B DASHBOARD AUTH
-- =====================================================

-- 1. AÑADIR VÍNCULO CON AUTH.USERS EN API_CLIENTS
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='api_clients' AND column_name='user_id') THEN
    ALTER TABLE public.api_clients ADD COLUMN user_id UUID REFERENCES auth.users(id);
  END IF;
END $$;

-- 2. HABILITAR RLS EN API_CLIENTS
ALTER TABLE public.api_clients ENABLE ROW LEVEL SECURITY;

-- Política para que un usuario pueda ver sus propios clientes de API
DROP POLICY IF EXISTS "Users can view their own api clients" ON public.api_clients;
CREATE POLICY "Users can view their own api clients"
ON public.api_clients
FOR SELECT
USING (auth.uid() = user_id);

-- En el futuro, si hay administradores, podrán ver todos.
DROP POLICY IF EXISTS "Admins can view all api clients" ON public.api_clients;
CREATE POLICY "Admins can view all api clients"
ON public.api_clients
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.profiles
  WHERE public.profiles.id = auth.uid() AND public.profiles.role = 'admin'
));

-- 3. HABILITAR RLS EN RECORD DE REPORTES EJECUTIVOS
ALTER TABLE public.executive_reports ENABLE ROW LEVEL SECURITY;

-- Un usuario solo puede ver los reportes generados para su cliente de API.
DROP POLICY IF EXISTS "Users can view their own executive reports" ON public.executive_reports;
CREATE POLICY "Users can view their own executive reports"
ON public.executive_reports
FOR SELECT
USING (
  generated_for IN (
    SELECT id FROM public.api_clients WHERE user_id = auth.uid()
  )
);

-- Admins pueden verlo todo
DROP POLICY IF EXISTS "Admins can view all executive reports" ON public.executive_reports;
CREATE POLICY "Admins can view all executive reports"
ON public.executive_reports
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.profiles
  WHERE public.profiles.id = auth.uid() AND public.profiles.role = 'admin'
));

-- 4. HABILITAR RLS EN PLANES DE SUSCRIPCIÓN (Solo lectura pública o autenticada)
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view subscription plans" ON public.subscription_plans;
CREATE POLICY "Anyone can view subscription plans"
ON public.subscription_plans
FOR SELECT
USING (true);

-- 5. RPC PARA OBTENER EL ESTADO DEL DASHBOARD B2B
-- Devuelve un resumen del cliente API asociado al usuario activo
CREATE OR REPLACE FUNCTION public.get_b2b_dashboard_data()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_client_id UUID;
  v_client_name TEXT;
  v_api_key TEXT;
  v_requests_used INTEGER;
  v_plan_name TEXT;
  v_request_limit INTEGER;
  v_monthly_price NUMERIC;
  v_features JSONB;
BEGIN
  -- Intentar buscar al cliente API asociado al UID actual
  SELECT 
    ac.id, ac.client_name, ac.api_key, ac.requests_used,
    sp.plan_name, sp.request_limit, sp.monthly_price, sp.features
  INTO 
    v_client_id, v_client_name, v_api_key, v_requests_used,
    v_plan_name, v_request_limit, v_monthly_price, v_features
  FROM public.api_clients ac
  LEFT JOIN public.subscription_plans sp ON ac.plan_id = sp.id
  WHERE ac.user_id = auth.uid()
    AND ac.active = true
  LIMIT 1;

  -- Si no existe cliente, retornamos un JSON nulo o de error controlado (depende del frontend).
  IF v_client_id IS NULL THEN
    RETURN NULL;
  END IF;

  RETURN jsonb_build_object(
    'client_id', v_client_id,
    'client_name', v_client_name,
    'api_key', v_api_key,
    'requests_used', v_requests_used,
    'plan_name', v_plan_name,
    'request_limit', v_request_limit,
    'monthly_price', v_monthly_price,
    'features', v_features
  );
END;
$$;
