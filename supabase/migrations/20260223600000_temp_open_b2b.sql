BEGIN;

-- TEMPORARY: Allow anyone to use B2B functions for testing
CREATE OR REPLACE FUNCTION public.is_b2b_user()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT true;
$$;

COMMIT;
