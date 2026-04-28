-- =====================================================================
-- Migration: 20260427190000_fix_synthetic_entity_slug_format.sql
-- Purpose:
--   _seed_synthetic_entities generaba slugs como 'synthetic_coca_cola'
--   (con underscores), violando chk_entities_slug_format que exige
--   '^[a-z0-9]+(-[a-z0-9]+)*$' (solo lowercase, dígitos y guiones).
--   Fix: usar guiones en lugar de underscores, y trim de guiones al
--   inicio/final para satisfacer "must start and end with alnum".
-- =====================================================================

BEGIN;

CREATE OR REPLACE FUNCTION public._seed_synthetic_entities()
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_battle_record record;
    v_option_record record;
    v_entity_id uuid;
    v_entity_slug text;
    v_seeded int := 0;
BEGIN
    FOR v_battle_record IN
        SELECT id, slug, title FROM public.battles WHERE is_synthetic = true
    LOOP
        FOR v_option_record IN
            SELECT id, label, brand_id, sort_order
            FROM public.battle_options
            WHERE battle_id = v_battle_record.id
        LOOP
            IF v_option_record.brand_id IS NOT NULL THEN
                CONTINUE;
            END IF;

            -- Slug canónico: 'synthetic-<label-en-kebab>'
            -- Reemplaza cualquier no-alfanumérico por guión, colapsa
            -- repetidos y trimea guiones al borde.
            v_entity_slug := 'synthetic-' ||
                regexp_replace(lower(v_option_record.label), '[^a-z0-9]+', '-', 'g');
            v_entity_slug := regexp_replace(v_entity_slug, '-+', '-', 'g');
            v_entity_slug := regexp_replace(v_entity_slug, '^-+|-+$', '', 'g');

            -- Crear entity si no existe (idempotente por slug)
            SELECT id INTO v_entity_id
            FROM public.entities
            WHERE slug = v_entity_slug;

            IF v_entity_id IS NULL THEN
                INSERT INTO public.entities (
                    type, name, slug, category, vertical,
                    is_active, is_synthetic, sort_order, created_at, updated_at
                ) VALUES (
                    'brand',
                    v_option_record.label,
                    v_entity_slug,
                    v_battle_record.slug,
                    'synthetic',
                    true,
                    true,
                    100 + v_option_record.sort_order,
                    now(), now()
                )
                RETURNING id INTO v_entity_id;
                v_seeded := v_seeded + 1;
            ELSE
                UPDATE public.entities
                SET is_synthetic = true
                WHERE id = v_entity_id AND is_synthetic = false;
            END IF;

            -- Linkear battle_option al entity via brand_id
            UPDATE public.battle_options
            SET brand_id = v_entity_id
            WHERE id = v_option_record.id;
        END LOOP;
    END LOOP;

    RETURN v_seeded;
END;
$$;

NOTIFY pgrst, 'reload schema';

COMMIT;
