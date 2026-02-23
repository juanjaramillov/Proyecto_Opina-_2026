BEGIN;

CREATE OR REPLACE FUNCTION public.enforce_demographics_cooldown()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_changed boolean := false;
  v_last timestamptz;
BEGIN
  -- Si el perfil aún no está completo (stage < 4), permitir cambios libres (wizard)
  IF COALESCE(OLD.profile_stage, 0) < 4 THEN
    RETURN NEW;
  END IF;

  -- Detectar cambios en TODOS los campos demográficos relevantes
  IF (NEW.gender IS DISTINCT FROM OLD.gender) THEN v_changed := true; END IF;

  -- edad: soporta age_bucket y/o birth_year (según tu modelo)
  IF (NEW.age_bucket IS DISTINCT FROM OLD.age_bucket) THEN v_changed := true; END IF;
  IF (NEW.birth_year IS DISTINCT FROM OLD.birth_year) THEN v_changed := true; END IF;

  IF (NEW.region IS DISTINCT FROM OLD.region) THEN v_changed := true; END IF;
  IF (NEW.comuna IS DISTINCT FROM OLD.comuna) THEN v_changed := true; END IF;

  -- educación: soporta education y/o education_level
  IF (NEW.education IS DISTINCT FROM OLD.education) THEN v_changed := true; END IF;
  IF (NEW.education_level IS DISTINCT FROM OLD.education_level) THEN v_changed := true; END IF;

  IF (NEW.employment_status IS DISTINCT FROM OLD.employment_status) THEN v_changed := true; END IF;
  IF (NEW.income_range IS DISTINCT FROM OLD.income_range) THEN v_changed := true; END IF;
  IF (NEW.housing_type IS DISTINCT FROM OLD.housing_type) THEN v_changed := true; END IF;
  IF (NEW.purchase_behavior IS DISTINCT FROM OLD.purchase_behavior) THEN v_changed := true; END IF;
  IF (NEW.influence_level IS DISTINCT FROM OLD.influence_level) THEN v_changed := true; END IF;

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

COMMIT;
