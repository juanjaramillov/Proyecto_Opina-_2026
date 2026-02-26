BEGIN;

DO $$
DECLARE r record;
BEGIN
  -- Grant para todas las variantes de validate_invitation
  FOR r IN
    SELECT n.nspname, p.proname, pg_get_function_identity_arguments(p.oid) AS args
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname = 'validate_invitation'
  LOOP
    EXECUTE format('GRANT EXECUTE ON FUNCTION %I.%I(%s) TO anon, authenticated;', r.nspname, r.proname, r.args);
  END LOOP;

  -- Grant para todas las variantes de consume_invitation
  FOR r IN
    SELECT n.nspname, p.proname, pg_get_function_identity_arguments(p.oid) AS args
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname = 'consume_invitation'
  LOOP
    EXECUTE format('GRANT EXECUTE ON FUNCTION %I.%I(%s) TO anon, authenticated;', r.nspname, r.proname, r.args);
  END LOOP;
END $$;

-- Forzar reload del schema cache de PostgREST (importante para que deje de dar 401)
NOTIFY pgrst, 'reload schema';

COMMIT;
