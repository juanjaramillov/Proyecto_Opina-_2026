-- Añadir columna tier a las entidades para el emparejamiento inteligente de versus
-- tier 1: Premium/Líderes (Alta prioridad para versus)
-- tier 2: Estándar (Por defecto)
-- tier 3: Nicho/Pequeñas (Baja prioridad)

ALTER TABLE public.entities ADD COLUMN IF NOT EXISTS tier integer DEFAULT 2;

-- Índice para mejorar el rendimiento de la búsqueda de tiers en el generador
CREATE INDEX IF NOT EXISTS idx_entities_category_tier ON public.entities (type, category, tier);
