-- =====================================================================
-- 20260427000000_seed_battles_from_entities.sql
-- Resuelve el bug de /signals "Sin señales activas":
--   La tabla public.battles estaba vacía, mientras que public.entities ya
--   tenía 611 marcas con depth_definitions. El seed.sql legacy usaba
--   nombres de categoría humanos (e.g. 'Comida Rápida') que no matchean
--   con los slugs reales en kebab-case (e.g. 'fast-food').
--
-- Estrategia: generar batallas dinámicamente desde el catálogo real de
-- categories + entities, respetando los filtros estrictos de la RPC
-- public.get_active_battles():
--   1) status = 'active'
--   2) >= 2 battle_options
--   3) cada option apunta a entity con >= 10 depth_definitions
--
-- Ejecutar de nuevo es seguro (ON CONFLICT). También se expone una RPC
-- admin_seed_battles_from_entities() para regenerar bajo demanda cuando
-- aparezcan nuevas categorías o entities.
-- =====================================================================

BEGIN;

-- ---------------------------------------------------------------------
-- 1) BATTLES: una por categoría con >= 2 entities aptas
--    slug determinístico: 'versus-' + categories.slug
-- ---------------------------------------------------------------------
WITH per_entity AS (
    SELECT e.id, e.category, COUNT(dd.id) AS n_depth
    FROM public.entities e
    LEFT JOIN public.depth_definitions dd ON dd.entity_id = e.id
    GROUP BY e.id, e.category
),
apt_per_category AS (
    SELECT category, COUNT(*) AS apt_count
    FROM per_entity
    WHERE n_depth >= 10
    GROUP BY category
),
target_categories AS (
    SELECT c.id      AS category_id,
           c.slug    AS category_slug,
           c.name    AS category_name,
           c.emoji   AS category_emoji,
           a.apt_count
    FROM apt_per_category a
    JOIN public.categories c ON c.slug = a.category
    WHERE a.apt_count >= 2
)
-- NOTA: categories.emoji a veces guarda un nombre de Material Icons
-- (e.g. 'flight','account_balance'), no un emoji Unicode, por eso NO lo
-- usamos como prefijo del título.
INSERT INTO public.battles (slug, title, description, category_id, status)
SELECT
    'versus-' || category_slug                                AS slug,
    'Versus: ' || category_name                               AS title,
    'Elige tu favorito en ' || lower(category_name) || '.'    AS description,
    category_id,
    'active'                                                  AS status
FROM target_categories
ON CONFLICT (slug) DO UPDATE SET
    title       = EXCLUDED.title,
    description = EXCLUDED.description,
    category_id = EXCLUDED.category_id,
    status      = 'active';

-- ---------------------------------------------------------------------
-- 2) BATTLE_OPTIONS: solo entities aptas (>= 10 depth_definitions)
--    Cada batalla 'versus-<slug>' jala las entities cuya category = slug
-- ---------------------------------------------------------------------
WITH per_entity AS (
    SELECT e.id, e.name, e.image_url, e.category, COUNT(dd.id) AS n_depth
    FROM public.entities e
    LEFT JOIN public.depth_definitions dd ON dd.entity_id = e.id
    GROUP BY e.id, e.name, e.image_url, e.category
),
apt AS (
    SELECT id AS entity_id, name, image_url, category
    FROM per_entity
    WHERE n_depth >= 10
)
INSERT INTO public.battle_options (battle_id, label, brand_id, image_url, sort_order, brand_domain)
SELECT
    b.id                                                                  AS battle_id,
    apt.name                                                              AS label,
    apt.entity_id                                                         AS brand_id,
    apt.image_url                                                         AS image_url,
    ROW_NUMBER() OVER (PARTITION BY b.id ORDER BY apt.name)::int          AS sort_order,
    NULL                                                                  AS brand_domain
FROM public.battles b
JOIN public.categories c ON c.id = b.category_id
JOIN apt              ON apt.category = c.slug
WHERE b.slug LIKE 'versus-%'
ON CONFLICT (battle_id, label) DO UPDATE SET
    brand_id   = EXCLUDED.brand_id,
    image_url  = EXCLUDED.image_url,
    sort_order = EXCLUDED.sort_order;

-- ---------------------------------------------------------------------
-- 3) BATTLE_INSTANCES: v1 (now) para cada batalla generada arriba
--    Algunas vistas/flujos progresivos esperan al menos una instance.
-- ---------------------------------------------------------------------
INSERT INTO public.battle_instances (battle_id, version, starts_at, context)
SELECT b.id, 1, now(), '{"type":"versus","source":"seed_battles_from_entities"}'::jsonb
FROM public.battles b
WHERE b.slug LIKE 'versus-%'
ON CONFLICT (battle_id, version) DO NOTHING;

-- ---------------------------------------------------------------------
-- 4) RPC admin_seed_battles_from_entities()
--    Re-ejecuta el mismo seeder de forma idempotente desde admin panel.
--    Devuelve un resumen JSON con conteos.
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_seed_battles_from_entities()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public, extensions, pg_temp'
AS $func$
DECLARE
    v_battles_upserted   integer := 0;
    v_options_upserted   integer := 0;
    v_instances_inserted integer := 0;
    v_active_after       integer := 0;
    -- Permite ejecutar también desde el SQL Editor del Dashboard (rol postgres
    -- sin auth.uid()), manteniendo la guarda is_admin() para frontend.
    v_is_dashboard       boolean := (current_user = 'postgres' AND auth.uid() IS NULL);
BEGIN
    IF NOT v_is_dashboard AND NOT public.is_admin() THEN
        RAISE EXCEPTION 'forbidden: admin only';
    END IF;

    -- 1) BATTLES
    WITH per_entity AS (
        SELECT e.id, e.category, COUNT(dd.id) AS n_depth
        FROM public.entities e
        LEFT JOIN public.depth_definitions dd ON dd.entity_id = e.id
        GROUP BY e.id, e.category
    ),
    apt_per_category AS (
        SELECT category, COUNT(*) AS apt_count
        FROM per_entity
        WHERE n_depth >= 10
        GROUP BY category
    ),
    target_categories AS (
        SELECT c.id AS category_id, c.slug AS category_slug, c.name AS category_name
        FROM apt_per_category a
        JOIN public.categories c ON c.slug = a.category
        WHERE a.apt_count >= 2
    ),
    upsert_battles AS (
        INSERT INTO public.battles (slug, title, description, category_id, status)
        SELECT
            'versus-' || category_slug,
            'Versus: ' || category_name,
            'Elige tu favorito en ' || lower(category_name) || '.',
            category_id,
            'active'
        FROM target_categories
        ON CONFLICT (slug) DO UPDATE SET
            title       = EXCLUDED.title,
            description = EXCLUDED.description,
            category_id = EXCLUDED.category_id,
            status      = 'active'
        RETURNING 1
    )
    SELECT COUNT(*) INTO v_battles_upserted FROM upsert_battles;

    -- 2) BATTLE_OPTIONS
    WITH per_entity AS (
        SELECT e.id, e.name, e.image_url, e.category, COUNT(dd.id) AS n_depth
        FROM public.entities e
        LEFT JOIN public.depth_definitions dd ON dd.entity_id = e.id
        GROUP BY e.id, e.name, e.image_url, e.category
    ),
    apt AS (
        SELECT id AS entity_id, name, image_url, category
        FROM per_entity
        WHERE n_depth >= 10
    ),
    upsert_options AS (
        INSERT INTO public.battle_options (battle_id, label, brand_id, image_url, sort_order, brand_domain)
        SELECT
            b.id,
            apt.name,
            apt.entity_id,
            apt.image_url,
            ROW_NUMBER() OVER (PARTITION BY b.id ORDER BY apt.name)::int,
            NULL
        FROM public.battles b
        JOIN public.categories c ON c.id = b.category_id
        JOIN apt ON apt.category = c.slug
        WHERE b.slug LIKE 'versus-%'
        ON CONFLICT (battle_id, label) DO UPDATE SET
            brand_id   = EXCLUDED.brand_id,
            image_url  = EXCLUDED.image_url,
            sort_order = EXCLUDED.sort_order
        RETURNING 1
    )
    SELECT COUNT(*) INTO v_options_upserted FROM upsert_options;

    -- 3) BATTLE_INSTANCES
    WITH ins AS (
        INSERT INTO public.battle_instances (battle_id, version, starts_at, context)
        SELECT b.id, 1, now(), '{"type":"versus","source":"seed_battles_from_entities"}'::jsonb
        FROM public.battles b
        WHERE b.slug LIKE 'versus-%'
        ON CONFLICT (battle_id, version) DO NOTHING
        RETURNING 1
    )
    SELECT COUNT(*) INTO v_instances_inserted FROM ins;

    -- 4) Resultado actual visible por get_active_battles()
    SELECT COUNT(*) INTO v_active_after FROM public.get_active_battles();

    -- Audit (solo cuando hay user real; desde Dashboard auth.uid() es NULL
    -- y log_admin_action no tiene a quién atribuir).
    IF auth.uid() IS NOT NULL THEN
        PERFORM public.log_admin_action(
            'admin_seed_battles_from_entities',
            'battles',
            NULL,
            jsonb_build_object(
                'battles_upserted',   v_battles_upserted,
                'options_upserted',   v_options_upserted,
                'instances_inserted', v_instances_inserted,
                'active_after',       v_active_after,
                'caller',             'frontend'
            )
        );
    END IF;

    RETURN jsonb_build_object(
        'battles_upserted',   v_battles_upserted,
        'options_upserted',   v_options_upserted,
        'instances_inserted', v_instances_inserted,
        'active_after',       v_active_after,
        'caller',             CASE WHEN v_is_dashboard THEN 'dashboard' ELSE 'frontend' END
    );
END;
$func$;

ALTER FUNCTION public.admin_seed_battles_from_entities() OWNER TO postgres;
REVOKE ALL ON FUNCTION public.admin_seed_battles_from_entities() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_seed_battles_from_entities() TO authenticated;

COMMIT;

-- PostgREST schema cache reload (memoria del proyecto):
NOTIFY pgrst, 'reload schema';
