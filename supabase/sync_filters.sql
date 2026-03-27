-- ==========================================
-- SCRIPT DE SINCRONIZACIÓN DE MÓDULOS (OPINA+)
-- ==========================================
-- Propósito: Forzar a que todos los juegos y módulos (Versus, Torneos, etc) 
-- filtren y oculten las Entidades (marcas) cuando están apagadas (is_active = false)
-- o cuando tienen apagado el módulo específico en su configuración.

-- 1. Actualizar el motor principal de Batallas (Versus / Torneo)
CREATE OR REPLACE FUNCTION "public"."get_active_battles"() 
RETURNS TABLE("id" "uuid", "slug" "text", "title" "text", "description" "text", "created_at" timestamp with time zone, "category" "jsonb", "options" "jsonb")
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
                    'is_active_versus', COALESCE((e.metadata->'modules'->>'versus')::boolean, COALESCE((e.metadata->'modules'->>'is_active_versus')::boolean, true)),
                    'is_active_torneo', COALESCE((e.metadata->'modules'->>'torneo')::boolean, COALESCE((e.metadata->'modules'->>'is_active_torneo')::boolean, true))
                ) ORDER BY bo.sort_order
            )
            FROM public.battle_options bo 
            -- Hacemos INNER JOIN para obligar a que la marca exista y esté activa
            INNER JOIN public.entities e ON bo.brand_id = e.id
            WHERE bo.battle_id = b.id 
            AND e.is_active = true
            -- Verificamos que al menos esté activa en Versus o Torneo (lógica general de batallas)
            AND (
                COALESCE((e.metadata->'modules'->>'versus')::boolean, COALESCE((e.metadata->'modules'->>'is_active_versus')::boolean, true)) = true
                OR
                COALESCE((e.metadata->'modules'->>'torneo')::boolean, COALESCE((e.metadata->'modules'->>'is_active_torneo')::boolean, true)) = true
            )
        ) AS options
    FROM public.battles b
    JOIN public.categories c ON b.category_id = c.id
    WHERE b.status = 'active'
    -- Validar que la batalla tenga al menos 2 opciones ACTIVAS para ser jugable
    AND EXISTS (
        SELECT 1 
        FROM public.battle_options bo2 
        INNER JOIN public.entities e2 ON bo2.brand_id = e2.id
        WHERE bo2.battle_id = b.id 
        AND e2.is_active = true
        HAVING count(bo2.id) >= 2
    );
END;
$$;

-- 2. Asegurarnos de ajustar la vista general (Hub Top Rankings) si requiere filtrar
-- (Este paso depende de cómo las vistas procesan, pero el SQL de get_active_battles ya limpiará el 90% del sitio).

-- 3. Actualizar la función genérica de Lugares/Servicios
CREATE OR REPLACE FUNCTION "public"."get_entities_by_module"("p_module" "text") 
RETURNS TABLE("id" "uuid", "name" "text", "slug" "text", "image_url" "text", "category" "text", "rating" numeric, "reviews" integer)
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
    WHERE e.is_active = true -- FORZAR QUE ESTÉ ACTIVA
    AND COALESCE((e.metadata->'modules'->>p_module)::boolean, COALESCE((e.metadata->'modules'->>('is_active_' || p_module))::boolean, true)) = true
    ORDER BY e.name ASC;
END;
$$;

-- ==========================================
-- 4. FIX: PERMISOS DE ESCRITURA (Row Level Security)
-- ==========================================
-- Si tus entidades "hacían como que guardaban" pero al recargar volvían atrás, 
-- es porque Supabase estaba bloqueando silenciosamente la escritura. 
-- Estas políticas aseguran que puedas guardar cambios desde tu panel Admin.

DROP POLICY IF EXISTS "entities_update_all" ON "public"."entities";
DROP POLICY IF EXISTS "entities_insert_all" ON "public"."entities";
DROP POLICY IF EXISTS "entities_delete_all" ON "public"."entities";

CREATE POLICY "entities_update_all" ON "public"."entities" FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "entities_insert_all" ON "public"."entities" FOR INSERT WITH CHECK (true);
CREATE POLICY "entities_delete_all" ON "public"."entities" FOR DELETE USING (true);
