-- =========================================================
-- Advanced Weighting and Auditability Refinement
-- Fecha: 2026-02-21
-- Objetivo: Implementar formula de pesos avanzada y versionamiento de algoritmos.
-- =========================================================

-- 1. Actualizar el trigger de enriquecimiento con la nueva formula
CREATE OR REPLACE FUNCTION public.fn_enrich_signal_event()
RETURNS trigger AS $$
DECLARE
  v_gender text; 
  v_age text; 
  v_region text; 
  v_tier text; 
  v_comp int; 
  v_base_weight numeric;
  v_final_weight numeric;
  v_algo_version text := '1.2.0'; -- Versión con formula de completitud
BEGIN
  -- 1. Snapshot del Perfil del Usuario
  SELECT 
    p.gender, 
    p.age_bucket, 
    p.region, 
    COALESCE(p.tier, 'guest'), 
    COALESCE(p.profile_completeness, 0)
  INTO v_gender, v_age, v_region, v_tier, v_comp
  FROM public.profiles p
  WHERE p.id = auth.uid() LIMIT 1;

  -- 2. Determinar Peso Base según Tier
  -- guest=1.0, registered=1.2, verified_basic=1.5, verified_full_ci=2.0
  CASE v_tier
    WHEN 'verified_full_ci' THEN v_base_weight := 2.0;
    WHEN 'verified_basic'   THEN v_base_weight := 1.5;
    WHEN 'registered'       THEN v_base_weight := 1.2;
    ELSE v_base_weight := 1.0; -- guest
  END CASE;

  -- 3. Calcular Peso Final (Bonus por completitud de perfil)
  -- Formula: Base * (1 + (Completeness / 100))
  -- Ejemplo: un usuario 'verified_basic' (1.5) con 50% perfil -> 1.5 * (1 + 0.5) = 2.25
  v_final_weight := v_base_weight * (1 + (v_comp::numeric / 100.0));

  -- 4. Asignar Snapshots Inmutables
  NEW.gender := COALESCE(NEW.gender, v_gender);
  NEW.age_bucket := COALESCE(NEW.age_bucket, v_age);
  NEW.region := COALESCE(NEW.region, v_region);
  NEW.user_tier := v_tier;
  NEW.profile_completeness := v_comp;
  NEW.signal_weight := v_final_weight;
  NEW.computed_weight := v_final_weight;
  NEW.influence_level_snapshot := v_tier;
  NEW.algorithm_version := v_algo_version;
  
  -- 5. Vincular user_id para auditoría interna si está disponible
  IF auth.uid() IS NOT NULL THEN
    NEW.user_id := auth.uid();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- El trigger ya existe desde el baseline, la función se actualiza automáticamente.

-- 2. Asegurar que las columnas existan (por si el baseline falló o se modificó)
ALTER TABLE public.signal_events 
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS algorithm_version text DEFAULT '1.2.0';

COMMIT;
