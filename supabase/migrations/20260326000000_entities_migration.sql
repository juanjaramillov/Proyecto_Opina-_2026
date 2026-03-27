-- Update get_active_battles to embed module toggles in options
CREATE OR REPLACE FUNCTION "public"."get_active_battles"() RETURNS TABLE("id" "uuid", "slug" "text", "title" "text", "description" "text", "created_at" timestamp with time zone, "category" "jsonb", "options" "jsonb")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public, extensions, pg_temp'
    AS $$
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
                    'category', e.category,
                    'is_active_versus', COALESCE((e.metadata->'modules'->>'is_active_versus')::boolean, true),
                    'is_active_torneo', COALESCE((e.metadata->'modules'->>'is_active_torneo')::boolean, true)
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
        HAVING count(dd.id) < 10
    );
END;
$$;

ALTER FUNCTION "public"."get_active_battles"() OWNER TO "postgres";

-- Create get_entities_by_module generic RPC
CREATE OR REPLACE FUNCTION "public"."get_entities_by_module"("p_module" "text") RETURNS TABLE("id" "uuid", "name" "text", "slug" "text", "image_url" "text", "category" "text", "rating" numeric, "reviews" integer)
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.id, 
        e.name, 
        e.slug, 
        e.image_url, 
        e.category, 
        (e.metadata->>'rating')::numeric AS rating,
        (e.metadata->>'reviews')::integer AS reviews
    FROM public.entities e
    WHERE COALESCE((e.metadata->'modules'->>('is_active_' || p_module))::boolean, true) = true
    AND (
      -- If fetching lugares or servicios, strictly match their type or fallback safely if type is absent (though it shouldn't be for mock models)
      -- The requirement stated we just check the metadata modules block, but maybe we should ensure we don't mix up services with places if they share categories?
      -- The toggle `is_active_servicio` implies it IS a servicio.
      true
    )
    ORDER BY e.name ASC;
END;
$$;

ALTER FUNCTION "public"."get_entities_by_module"("p_module" "text") OWNER TO "postgres";
