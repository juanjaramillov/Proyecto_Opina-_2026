-- =========================================================
-- Fix get_active_battles to properly filter options
-- 1) Require at least 5 depth definitions (not 6)
-- 2) Require at least 2 battle options to exist
-- =========================================================

CREATE OR REPLACE FUNCTION public.get_active_battles()
RETURNS TABLE (
    id uuid,
    slug text,
    title text,
    description text,
    created_at timestamptz,
    category jsonb,
    options jsonb
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        b.id, b.slug, b.title, b.description, b.created_at,
        jsonb_build_object('slug', c.slug, 'name', c.name, 'emoji', c.emoji) AS category,
        (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'id', bo.id, 
                    'label', bo.label, 
                    'image_url', bo.image_url,
                    'category', e.category -- Newly added to group options in frontend
                ) ORDER BY bo.sort_order
            )
            FROM public.battle_options bo 
            LEFT JOIN public.entities e ON bo.brand_id = e.id
            WHERE bo.battle_id = b.id
        ) AS options
    FROM public.battles b
    JOIN public.categories c ON b.category_id = c.id
    WHERE b.status = 'active'
    AND EXISTS (
        -- MUST HAVE AT LEAST 2 OPTIONS
        SELECT 1 
        FROM public.battle_options bo2 
        WHERE bo2.battle_id = b.id 
        HAVING count(bo2.id) >= 2
    )
    AND NOT EXISTS (
        -- MUST HAVE AT LEAST 5 DEPTH QUESTIONS PER OPTION
        SELECT 1 
        FROM public.battle_options bo
        LEFT JOIN public.depth_definitions dd ON bo.brand_id = dd.entity_id
        WHERE bo.battle_id = b.id
        GROUP BY bo.id
        HAVING count(dd.id) < 5
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
