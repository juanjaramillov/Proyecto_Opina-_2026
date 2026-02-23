-- FIX: Replace unsupported gen_random_bytes function with standard gen_random_uuid
-- This prevents the 42883 undefined_function error when casting a vote.

CREATE OR REPLACE FUNCTION public.get_or_create_anon_id()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_anon_id text;
BEGIN
  IF auth.uid() IS NULL THEN RETURN NULL; END IF;
  
  -- Try to get existing anon_id
  SELECT ai.anon_id INTO v_anon_id FROM public.anonymous_identities ai WHERE ai.user_id = auth.uid() LIMIT 1;
  
  -- Create if it doesn't exist
  IF v_anon_id IS NULL THEN
    -- REPLACE: encode(gen_random_bytes(16), 'hex') with standard UUID cast to text
    -- This avoids relying on pgcrypto's gen_random_bytes which isn't universally available by default
    v_anon_id := replace(gen_random_uuid()::text, '-', '');
    
    INSERT INTO public.anonymous_identities (user_id, anon_id) 
    VALUES (auth.uid(), v_anon_id) 
    ON CONFLICT DO NOTHING;
    
    -- Fetch again in case of concurrent conflict where DO NOTHING applied
    IF v_anon_id IS NULL THEN 
      SELECT ai.anon_id INTO v_anon_id FROM public.anonymous_identities ai WHERE ai.user_id = auth.uid(); 
    END IF;
  END IF;
  
  RETURN v_anon_id;
END;
$$;
