CREATE OR REPLACE FUNCTION "public"."grant_pilot_access"("p_code" "text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public, extensions, pg_temp'
    AS $$
DECLARE
  is_valid boolean;
  curr_uid uuid;
BEGIN
  is_valid := public.validate_invitation(p_code);
  
  IF is_valid THEN
    curr_uid := auth.uid();
    IF curr_uid IS NOT NULL THEN
      UPDATE auth.users
      SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || '{"access_granted": true}'::jsonb
      WHERE id = curr_uid;
      
      -- También consumimos un uso del código si la validación lo requiere
      -- Opcionalmente podriamos dejar que el complete-profile lo consuma,
      -- la current "validate_invitation" solo verifica y no consume.
      -- Dejamos que actue como antes.
      RETURN true;
    END IF;
  END IF;

  RETURN false;
END;
$$;

ALTER FUNCTION "public"."grant_pilot_access"("p_code" "text") OWNER TO "postgres";
REVOKE ALL ON FUNCTION "public"."grant_pilot_access"("p_code" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."grant_pilot_access"("p_code" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."grant_pilot_access"("p_code" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."grant_pilot_access"("p_code" "text") TO "service_role";
