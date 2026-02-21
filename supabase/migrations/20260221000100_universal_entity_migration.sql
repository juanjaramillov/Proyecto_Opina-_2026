-- =========================================================
-- Universal Entity Model Migration
-- Fecha: 2026-02-21
-- Objetivo: Migrar opciones de batalla y marcas a un modelo de entidades unificado.
-- =========================================================

BEGIN;

-- 1. Insertar categorías base si no existen
INSERT INTO public.categories (slug, name)
VALUES 
  ('consumo', 'Consumo y Retail'),
  ('tecnologia', 'Tecnología'),
  ('politica', 'Política'),
  ('transporte', 'Transporte'),
  ('entretencion', 'Entretención'),
  ('estilo_vida', 'Estilo de Vida')
ON CONFLICT (slug) DO NOTHING;

-- 2. Función temporal para inferir tipo de entidad
CREATE OR REPLACE FUNCTION tmp_infer_entity_type(p_label text, p_image_url text, p_battle_category text)
RETURNS text AS $$
BEGIN
  IF p_image_url LIKE '%/brands/%' OR p_image_url LIKE '%/logos/%' THEN
    RETURN 'brand';
  ELSIF p_battle_category = 'politica' THEN
    RETURN 'person';
  ELSIF p_battle_category IN ('transporte', 'consumo') AND p_label ~ '^[A-Z]' THEN
    RETURN 'brand';
  ELSE
    RETURN 'topic';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 3. Migrar Opciones a Entidades
-- Tomamos etiquetas únicas de opciones de batalla para crear el catálogo inicial
DO $$
DECLARE
  v_opt RECORD;
  v_entity_id uuid;
  v_battle_cat text;
BEGIN
  FOR v_opt IN 
    SELECT DISTINCT ON (label) 
      bo.label, 
      bo.image_url, 
      b.category as battle_category
    FROM public.battle_options bo
    JOIN public.battles b ON b.id = bo.battle_id
  LOOP
    -- Insertar en entities
    INSERT INTO public.entities (type, name, slug, metadata)
    VALUES (
      tmp_infer_entity_type(v_opt.label, v_opt.image_url, v_opt.battle_category),
      v_opt.label,
      lower(regexp_replace(v_opt.label, '[^a-zA-Z0-9]+', '-', 'g')),
      jsonb_build_object('source_image', v_opt.image_url)
    )
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
    RETURNING id INTO v_entity_id;

    -- Actualizar battle_options con el brand_id (FK a entities.id)
    UPDATE public.battle_options 
    SET brand_id = v_entity_id 
    WHERE label = v_opt.label;
    
    -- Actualizar signal_events (Polymorphic enrichment)
    UPDATE public.signal_events
    SET 
      entity_id = v_entity_id,
      entity_type = tmp_infer_entity_type(v_opt.label, v_opt.image_url, v_opt.battle_category)
    WHERE option_id IN (SELECT id FROM public.battle_options WHERE label = v_opt.label);

  END LOOP;
END $$;

-- 4. Limpieza
DROP FUNCTION tmp_infer_entity_type;

COMMIT;
