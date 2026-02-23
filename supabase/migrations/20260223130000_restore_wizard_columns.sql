-- FIX: Restore columns dropped during canonical user model migration

ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS birth_year INT,
ADD COLUMN IF NOT EXISTS employment_status TEXT,
ADD COLUMN IF NOT EXISTS income_range TEXT,
ADD COLUMN IF NOT EXISTS education_level TEXT,
ADD COLUMN IF NOT EXISTS housing_type TEXT,
ADD COLUMN IF NOT EXISTS purchase_behavior TEXT,
ADD COLUMN IF NOT EXISTS influence_level TEXT,
ADD COLUMN IF NOT EXISTS profile_stage INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS signal_weight NUMERIC DEFAULT 1.0;

-- FIX: Demographics cooldown trigger blocks initial profile wizard completion because last_demographics_update is set on signup.
-- We must ONLY enforce the cooldown if the profile_stage >= 4 (fully completed profile)
-- OR if the old values weren't NULL. Let's fix the function to check profile_stage.

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
  IF OLD.profile_stage < 4 THEN
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
