-- =========================================================
-- FIX P1.5: Enriquecimiento Safe y Migración Final users.user_id
-- =========================================================

-- Reemplazando fn_enrich_signal_event asegurando uso de users.user_id
-- y previniendo caídas totales de INSERT (No-blocking return NEW).

CREATE OR REPLACE FUNCTION public.fn_enrich_signal_event()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_gender text;
  v_age text;
  v_region text;
  v_commune text;
  v_completion int;
  v_weight numeric;

  -- Verification / trust
  v_verified boolean;
  v_trust numeric;

  -- Algorithm
  v_algo_id uuid;
  v_half_life int;
  v_verify_mult numeric;
  v_recency numeric;
  v_verif_factor numeric;

  -- Entity mapping
  v_entity_id uuid;
  v_entity_type text;
BEGIN
  -- Bloque seguro no-bloqueante
  BEGIN
    -- 1) Resolver entity_id desde option_id si viene vacío o mal seteado
    IF NEW.option_id IS NOT NULL THEN
      v_entity_id := public.resolve_entity_id(NEW.option_id);
      IF v_entity_id IS NOT NULL THEN
        SELECT e.type INTO v_entity_type FROM public.entities e WHERE e.id = v_entity_id LIMIT 1;
        NEW.entity_id := COALESCE(NEW.entity_id, v_entity_id);
        IF NEW.entity_id = NEW.option_id THEN
          NEW.entity_id := v_entity_id;
        END IF;
        NEW.entity_type := COALESCE(NEW.entity_type, v_entity_type);
      END IF;
    END IF;

    -- 2) Algoritmo activo
    SELECT id, recency_half_life_days, verification_multiplier
    INTO v_algo_id, v_half_life, v_verify_mult
    FROM public.algorithm_versions
    WHERE is_active = true
    LIMIT 1;

    IF v_uid IS NOT NULL THEN
      -- 3) Traer segmento + peso desde user_profiles (schema real del repo)
      SELECT
        up.gender,
        up.age_bucket,
        up.region,
        up.comuna,
        COALESCE(up.profile_stage, 0),
        COALESCE(up.signal_weight, 1.0)
      INTO
        v_gender, v_age, v_region, v_commune, v_completion, v_weight
      FROM public.user_profiles up
      WHERE up.user_id = v_uid
      LIMIT 1;

      -- Extraer verification de users con la pk user_id
      SELECT COALESCE(u.is_identity_verified, false) INTO v_verified
      FROM public.users u
      WHERE u.user_id = v_uid
      LIMIT 1;

      SELECT COALESCE(us.trust_score, 1.0) INTO v_trust
      FROM public.user_stats us
      WHERE us.user_id = v_uid
      LIMIT 1;

      -- 4) Completar NEW solo si no vienen en null y hay backups
      NEW.user_id := v_uid;
      NEW.gender := COALESCE(NEW.gender, v_gender);
      NEW.age_bucket := COALESCE(NEW.age_bucket, v_age);
      NEW.region := COALESCE(NEW.region, v_region);
      NEW.commune := COALESCE(NEW.commune, v_commune);

      NEW.profile_completeness := COALESCE(NEW.profile_completeness, v_completion);
      NEW.signal_weight := COALESCE(NEW.signal_weight, v_weight);
      NEW.algorithm_version_id := COALESCE(NEW.algorithm_version_id, v_algo_id);

      -- 5) OpinaScore
      v_recency := public.calculate_recency_factor(NEW.created_at, COALESCE(v_half_life, 7));
      v_verif_factor := CASE WHEN COALESCE(v_verified, false) THEN COALESCE(v_verify_mult, 1.3) ELSE 1.0 END;

      NEW.computed_weight := COALESCE(NEW.computed_weight, (NEW.signal_weight * v_verif_factor * COALESCE(v_trust, 1.0)));
      NEW.opinascore := COALESCE(NEW.opinascore, (NEW.signal_weight * v_recency * v_verif_factor * COALESCE(v_trust, 1.0)));
    END IF;

  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'fn_enrich_signal_event non-blocking catch: %', SQLERRM;
  END;
  -- Siempre retornamos NEW
  RETURN NEW;
END;
$$;
