-- ==============================================================================
-- 20260217170000_fix_get_active_battles.sql
-- OBJETIVO: Devolver contexto completo (opciones + imágenes) en el HUB.
-- ==============================================================================

BEGIN;

-- Dropear firmas previas para asegurar consistencia
DROP FUNCTION IF EXISTS public.get_active_battles();

CREATE OR REPLACE FUNCTION public.get_active_battles()
RETURNS TABLE (
    id uuid,
    slug text,
    title text,
    description text,
    created_at timestamptz,
    category jsonb,
    options jsonb
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        b.id,
        b.slug,
        b.title,
        b.description,
        b.created_at,
        -- Mapeo simple de categoría (si el campo es texto, lo convertimos a objeto para el front)
        jsonb_build_object(
            'slug', b.category,
            'name', b.category,
            'emoji', '🎯',
            'cover_url', NULL
        ) AS category,
        -- Agregación de opciones con sus imágenes corregidas
        (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'id', bo.id,
                    'label', bo.label,
                    'image_url', bo.image_url
                ) ORDER BY bo.sort_order
            )
            FROM public.battle_options bo
            WHERE bo.battle_id = b.id
        ) AS options
    FROM public.battles b
    WHERE b.status = 'active'
    ORDER BY b.created_at DESC NULLS LAST;
END;
$$;

-- Permisos de ejecución
GRANT EXECUTE ON FUNCTION public.get_active_battles() TO anon, authenticated;

COMMIT;
