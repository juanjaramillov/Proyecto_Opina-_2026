-- =========================================================
-- COMMERCIAL STATUS FLAGS
-- Habilita el filtro "qué se vende a clientes B2B".
-- Default seguro: pending_review (opt-in).
--
-- Decisión Juan 2026-04-27 (sesión rediseño /intelligence):
--   * No se vende data política
--   * No se vende data de actualidad (current_topics queda fuera)
--   * Se vende toda categoría brand_service / product
--   * Override por entidad puntual disponible (escándalos, etc.)
-- =========================================================

-- 1. Enum de estados comerciales
CREATE TYPE public.commercial_status_t AS ENUM (
  'sellable',         -- explícitamente vendible al producto B2B
  'restricted',       -- explícitamente NO vendible (político, sensible, en crisis)
  'pending_review'    -- esperando decisión de admin (default seguro)
);

-- 2. Columna en categories (default seguro = pending_review)
ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS commercial_status public.commercial_status_t
  NOT NULL DEFAULT 'pending_review';

COMMENT ON COLUMN public.categories.commercial_status IS
  'Si la categoría puede exponerse al producto B2B. Default pending_review (opt-in seguro). Cambiar vía admin_set_commercial_status.';

-- 3. Columna en entities (nullable = hereda de la categoría)
ALTER TABLE public.entities
  ADD COLUMN IF NOT EXISTS commercial_status public.commercial_status_t
  DEFAULT NULL;

COMMENT ON COLUMN public.entities.commercial_status IS
  'Override puntual sobre la categoría (ej. marca en crisis). NULL = hereda de la categoría. Cambiar vía admin_set_commercial_status.';

-- 4. Índices para queries de filtrado eficientes
CREATE INDEX IF NOT EXISTS idx_categories_commercial_status
  ON public.categories(commercial_status);

CREATE INDEX IF NOT EXISTS idx_entities_commercial_status
  ON public.entities(commercial_status)
  WHERE commercial_status IS NOT NULL;

-- 5. Función helper: ¿esta entidad es vendible al producto B2B?
-- Resuelve: override de entidad > estado de categoría > pending_review.
CREATE OR REPLACE FUNCTION public.is_entity_commercially_sellable(p_entity_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT COALESCE(
    -- 1° override por entidad si existe
    (SELECT e.commercial_status
       FROM public.entities e
      WHERE e.id = p_entity_id),
    -- 2° fallback al estado de la categoría (entities.category = categories.slug)
    (SELECT c.commercial_status
       FROM public.entities e
       JOIN public.categories c ON c.slug = e.category
      WHERE e.id = p_entity_id),
    -- 3° default seguro
    'pending_review'::public.commercial_status_t
  ) = 'sellable'::public.commercial_status_t;
$$;

COMMENT ON FUNCTION public.is_entity_commercially_sellable(uuid) IS
  'TRUE si la entidad puede exponerse al producto B2B. Resuelve override de entidad > categoría > pending_review.';

GRANT EXECUTE ON FUNCTION public.is_entity_commercially_sellable(uuid)
  TO anon, authenticated;

-- 6. Refrescar PostgREST schema cache (memoria proyecto:
-- feedback_supabase_notify_pgrst_after_alter_function)
NOTIFY pgrst, 'reload schema';
