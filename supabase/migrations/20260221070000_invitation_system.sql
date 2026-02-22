-- =====================================================
-- OPINA+ V12 — FIX 14: INVITATION SYSTEM
-- =====================================================

-- 1. Crear tabla invitation_codes
CREATE TABLE IF NOT EXISTS public.invitation_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  max_uses INTEGER DEFAULT 1,
  current_uses INTEGER DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Index para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_invitation_code ON public.invitation_codes (code);

-- 2. Función para validar código
CREATE OR REPLACE FUNCTION public.validate_invitation(p_code TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  invite RECORD;
BEGIN
  SELECT *
  INTO invite
  FROM public.invitation_codes
  WHERE code = p_code;

  IF invite IS NULL THEN
    RETURN FALSE;
  END IF;

  IF invite.expires_at IS NOT NULL
     AND invite.expires_at < now() THEN
    RETURN FALSE;
  END IF;

  IF invite.current_uses >= invite.max_uses THEN
    RETURN FALSE;
  END IF;

  RETURN TRUE;
END;
$$;

-- 3. Función para consumir código
CREATE OR REPLACE FUNCTION public.consume_invitation(p_code TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.invitation_codes
  SET current_uses = current_uses + 1
  WHERE code = p_code;
END;
$$;

-- 4. Crear código demo inicial
INSERT INTO public.invitation_codes (
  code,
  max_uses,
  expires_at
)
VALUES (
  'OPINA-DEMO-001',
  100,
  now() + interval '30 days'
)
ON CONFLICT (code) DO NOTHING;
