-- Fix P0-4: Ensure SECURITY DEFINER functions have a safe, fixed search_path
-- We set: public, extensions, pg_temp
-- We only touch schema public and only if search_path isn't already set in proconfig.

DO $$
DECLARE
  r RECORD;
  has_sp BOOLEAN;
BEGIN
  FOR r IN
    SELECT
      n.nspname AS schema_name,
      p.proname AS func_name,
      pg_get_function_identity_arguments(p.oid) AS identity_args,
      p.oid AS func_oid,
      p.proconfig AS proconfig
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.prosecdef = true
  LOOP
    SELECT EXISTS (
      SELECT 1
      FROM unnest(COALESCE(r.proconfig, ARRAY[]::text[])) cfg
      WHERE cfg LIKE 'search_path=%'
    )
    INTO has_sp;

    IF NOT has_sp THEN
      EXECUTE format(
        'ALTER FUNCTION %I.%I(%s) SET search_path = %L;',
        r.schema_name,
        r.func_name,
        r.identity_args,
        'public, extensions, pg_temp'
      );
    END IF;
  END LOOP;
END $$;
