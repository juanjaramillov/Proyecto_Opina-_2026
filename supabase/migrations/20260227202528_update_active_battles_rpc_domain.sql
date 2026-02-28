-- Update get_active_battles to return brand_domain
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
                    'brand_domain', bo.brand_domain,
                    'category', e.category
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
        SELECT 1 
        FROM public.battle_options bo2 
        WHERE bo2.battle_id = b.id 
        HAVING count(bo2.id) >= 2
    )
    AND NOT EXISTS (
        SELECT 1 
        FROM public.battle_options bo
        LEFT JOIN public.depth_definitions dd ON bo.brand_id = dd.entity_id
        WHERE bo.battle_id = b.id
        GROUP BY bo.id
        HAVING count(dd.id) < 5
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update resolve_battle_context to return brand_domain
CREATE OR REPLACE FUNCTION public.resolve_battle_context(p_battle_slug text)
RETURNS jsonb AS $$
DECLARE
    v_battle_id uuid;
    v_title text;
    v_options jsonb;
BEGIN
    SELECT id, title INTO v_battle_id, v_title
    FROM public.battles
    WHERE slug = p_battle_slug AND status = 'active';

    IF v_battle_id IS NULL THEN
        RETURN jsonb_build_object('ok', false, 'error', 'Battle not found or inactive');
    END IF;

    SELECT jsonb_agg(
        jsonb_build_object(
            'id', id,
            'label', label,
            'image_url', image_url,
            'brand_domain', brand_domain,
            'sort_order', sort_order
        ) ORDER BY sort_order
    ) INTO v_options
    FROM public.battle_options
    WHERE battle_id = v_battle_id;

    RETURN jsonb_build_object(
        'ok', true,
        'battle_id', v_battle_id,
        'battle_slug', p_battle_slug,
        'title', v_title,
        'options', v_options
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
