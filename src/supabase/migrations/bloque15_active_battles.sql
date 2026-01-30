-- ============================================================
-- RPC: get_active_battles
-- Retorna todas las batallas activas con su categoría y opciones
-- ============================================================

CREATE OR REPLACE FUNCTION get_active_battles()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_agg(
        json_build_object(
            'id', b.id,
            'slug', b.slug,
            'title', b.title,
            'description', b.description,
            'created_at', b.created_at,
            'category', json_build_object(
                'slug', c.slug,
                'name', c.name,
                'emoji', c.emoji,
                'cover_url', c.cover_url
            ),
            'options', (
                SELECT json_agg(
                    json_build_object(
                        'id', o.id,
                        'label', o.label,
                        'image_url', o.image_url
                    ) ORDER BY o.sort_order ASC
                )
                FROM battle_options o
                WHERE o.battle_id = b.id
            )
        ) ORDER BY b.created_at DESC
    ) INTO result
    FROM battles b
    LEFT JOIN categories c ON b.category_id = c.id
    WHERE b.status = 'active'
    AND b.is_public = true;

    RETURN result;
END;
$$ LANGUAGE plpgsql;
