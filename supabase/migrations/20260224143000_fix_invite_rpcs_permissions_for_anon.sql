BEGIN;

-- 1) validate_invitation => permitir anon
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'validate_invitation'
  ) THEN
    NULL;
  END IF;
END$$;

REVOKE ALL ON FUNCTION public.validate_invitation(text) FROM public;
GRANT EXECUTE ON FUNCTION public.validate_invitation(text) TO anon, authenticated;


-- 2) consume_invitation => permitir anon
REVOKE ALL ON FUNCTION public.consume_invitation(text) FROM public;
GRANT EXECUTE ON FUNCTION public.consume_invitation(text) TO anon, authenticated;

COMMIT;
