-- FIX: Handle NULL in OLD.profile_stage for the demographic cooldown trigger.
-- In PostgreSQL, NULL < 4 evaluates to NULL (falsy), meaning the trigger was 
-- NOT bypassing the 30-day cooldown for users who had a NULL profile_stage.
-- We must use COALESCE(OLD.profile_stage, 0) < 4.

CREATE OR REPLACE FUNCTION public.enforce_demographics_cooldown()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_changed boolean := false;
  v_last timestamptz;
BEGIN
  -- Si el perfil aún no está completo (stage < 4), se permite editar libremente
  -- para que el Profile Wizard funcione por pasos.
  -- IMPORTANT: Handle NULLs, as old rows will have NULL profile_stage.
  IF COALESCE(OLD.profile_stage, 0) < 4 THEN
    RETURN NEW;
  END IF;

  -- Detectar cambio en campos demográficos
  IF (NEW.gender IS DISTINCT FROM OLD.gender) THEN v_changed := true; END IF;
  IF (NEW.age_bucket IS DISTINCT FROM OLD.age_bucket) THEN v_changed := true; END IF;
  IF (NEW.region IS DISTINCT FROM OLD.region) THEN v_changed := true; END IF;
  IF (NEW.comuna IS DISTINCT FROM OLD.comuna) THEN v_changed := true; END IF;
  IF (NEW.education IS DISTINCT FROM OLD.education) THEN v_changed := true; END IF;

  IF v_changed THEN
    v_last := COALESCE(OLD.last_demographics_update, OLD.created_at);

    IF v_last IS NOT NULL AND v_last > now() - interval '30 days' THEN
      RAISE EXCEPTION 'Demographics can only be updated every 30 days'
      USING ERRCODE = 'P0001';
    END IF;

    NEW.last_demographics_update := now();
  END IF;

  RETURN NEW;
END;
$$;
