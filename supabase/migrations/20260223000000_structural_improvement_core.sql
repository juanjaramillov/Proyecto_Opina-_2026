-- =========================================================
-- Mejora Estructural: Resultados, Rankings y Perfil (Core)
-- Fecha: 2026-02-21
-- =========================================================

BEGIN;

-- 1. Snapshot de Rankings (Estructura Analítica)
CREATE TABLE IF NOT EXISTS public.entity_rank_snapshots (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id uuid REFERENCES public.entities(id) ON DELETE CASCADE,
    category_slug text NOT NULL,
    composite_index numeric DEFAULT 0.0,
    preference_score numeric DEFAULT 0.0,
    quality_score numeric DEFAULT 0.0,
    snapshot_date timestamptz DEFAULT now(),
    segment_id text DEFAULT 'global', -- 'global', 'gen-z', 'region-13', etc.
    algorithm_version text DEFAULT 'V12-PRO'
);

CREATE INDEX IF NOT EXISTS idx_rank_snapshot_entity ON public.entity_rank_snapshots(entity_id);
CREATE INDEX IF NOT EXISTS idx_rank_snapshot_date ON public.entity_rank_snapshots(snapshot_date);
CREATE INDEX IF NOT EXISTS idx_rank_snapshot_category ON public.entity_rank_snapshots(category_slug);

-- 2. Historial de Perfil y Cooldown Demográfico
CREATE TABLE IF NOT EXISTS public.profile_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    field_changed text NOT NULL,
    old_value text,
    new_value text,
    changed_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profile_history_user ON public.profile_history(user_id);

-- Añadir columna de cooldown a profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS last_demographic_update timestamptz DEFAULT '2000-01-01';

-- 3. Funciones de Auditoría y Validación (Trigger de Cooldown)
CREATE OR REPLACE FUNCTION public.fn_validate_profile_update()
RETURNS TRIGGER AS $$
BEGIN
    -- Si se cambian campos demográficos críticos
    IF (OLD.age IS DISTINCT FROM NEW.age OR 
        OLD.gender IS DISTINCT FROM NEW.gender OR 
        OLD.commune IS DISTINCT FROM NEW.commune OR 
        OLD.education IS DISTINCT FROM NEW.education) THEN
        
        -- Validar cooldown de 30 días (solo para no-admins)
        IF OLD.last_demographic_update > (now() - interval '30 days') AND OLD.role != 'admin' THEN
            RAISE EXCEPTION 'Solo puedes actualizar tus datos demográficos cada 30 días. Próximo cambio disponible en %', 
                (OLD.last_demographic_update + interval '30 days');
        END IF;

        -- Registrar historia
        IF OLD.age IS DISTINCT FROM NEW.age THEN
            INSERT INTO public.profile_history (user_id, field_changed, old_value, new_value)
            VALUES (NEW.id, 'age', OLD.age::text, NEW.age::text);
        END IF;
        IF OLD.gender IS DISTINCT FROM NEW.gender THEN
            INSERT INTO public.profile_history (user_id, field_changed, old_value, new_value)
            VALUES (NEW.id, 'gender', OLD.gender, NEW.gender);
        END IF;
        -- Repetir para otros campos si es necesario...
        
        NEW.last_demographic_update := now();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validate_profile_update ON public.profiles;
CREATE TRIGGER trg_validate_profile_update
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE PROCEDURE public.fn_validate_profile_update();

-- 4. RPC de Análisis Avanzado (Resultados)
CREATE OR REPLACE FUNCTION public.get_advanced_results(
  p_category_slug text,
  p_gender text DEFAULT NULL,
  p_age_bucket text DEFAULT NULL,
  p_region text DEFAULT NULL
)
RETURNS TABLE (
    entity_id uuid,
    entity_name text,
    preference_rate numeric,
    avg_quality numeric,
    total_signals bigint,
    gap_score numeric
) AS $$
BEGIN
    RETURN QUERY
    WITH preference AS (
        -- Preferencia basada en Versus (module_type = 'versus')
        SELECT 
            option_id,
            COUNT(*) * 100.0 / SUM(COUNT(*)) OVER() as rate,
            COUNT(*) as votes
        FROM public.signal_events
        WHERE module_type IN ('versus', 'progressive')
        AND (p_gender IS NULL OR gender = p_gender)
        AND (p_age_bucket IS NULL OR age_bucket = p_age_bucket)
        AND (p_region IS NULL OR region = p_region)
        GROUP BY option_id
    ),
    quality AS (
        -- Calidad basada en Profundidad (module_type = 'depth' e.g. 'nota_general')
        SELECT 
            option_id,
            AVG(value_numeric) as avg_val,
            COUNT(DISTINCT signal_id) as responses
        FROM public.signal_events
        WHERE module_type = 'depth' AND context_id = 'nota_general'
        AND (p_gender IS NULL OR gender = p_gender)
        AND (p_age_bucket IS NULL OR age_bucket = p_age_bucket)
        AND (p_region IS NULL OR region = p_region)
        GROUP BY option_id
    )
    SELECT 
        e.id,
        e.name,
        COALESCE(p.rate, 0.0),
        COALESCE(q.avg_val, 0.0),
        COALESCE(p.votes, 0) + COALESCE(q.responses, 0),
        COALESCE(p.rate, 0.0) - (COALESCE(q.avg_val, 0.0) * 10.0) -- Gap: Preferencia % vs Calidad (escala 100)
    FROM public.entities e
    LEFT JOIN preference p ON e.id = p.option_id
    LEFT JOIN quality q ON e.id = q.option_id
    WHERE e.category = p_category_slug;
END;
$$ LANGUAGE plpgsql STABLE;

COMMIT;
