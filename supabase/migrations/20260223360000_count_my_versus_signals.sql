BEGIN;

CREATE OR REPLACE FUNCTION public.count_my_versus_signals()
RETURNS int
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT COUNT(*)::int
  FROM public.signal_events se
  WHERE se.anon_id = public.get_or_create_anon_id()
    AND se.module_type IN ('versus','progressive');
$$;

GRANT EXECUTE ON FUNCTION public.count_my_versus_signals() TO anon, authenticated;

COMMIT;
