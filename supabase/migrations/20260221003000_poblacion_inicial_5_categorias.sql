-- =========================================================
-- Población Inicial Controlada (5 Categorías)
-- Fecha: 2026-02-21
-- Objetivo: 30 Entidades, 5 Torneos Progresivos, 180 Preguntas
-- =========================================================

BEGIN;

-- 1. Crear tabla de definiciones de profundidad si no existe
CREATE TABLE IF NOT EXISTS public.depth_definitions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id uuid REFERENCES public.entities(id) ON DELETE CASCADE,
    category_slug text,
    question_key text NOT NULL,
    question_text text NOT NULL,
    question_type text DEFAULT 'scale',
    options jsonb DEFAULT '[]'::jsonb,
    position int DEFAULT 0,
    is_required boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    UNIQUE(entity_id, question_key)
);

-- 2. Función para asegurar preguntas base (Regla Global)
CREATE OR REPLACE FUNCTION public.fn_ensure_entity_depth(p_entity_id uuid)
RETURNS void AS $$
DECLARE
  v_name text;
  v_cat text;
BEGIN
  SELECT name, category INTO v_name, v_cat FROM public.entities WHERE id = p_entity_id;
  
  -- Pregunta 1: Nota
  INSERT INTO public.depth_definitions (entity_id, question_key, question_text, question_type, position)
  VALUES (p_entity_id, 'nota_general', '¿Qué nota le das a ' || v_name || ' del 0 al 10?', 'scale', 1)
  ON CONFLICT DO NOTHING;

  -- Preguntas 2-6 (Genéricas si no existen)
  INSERT INTO public.depth_definitions (entity_id, question_key, question_text, question_type, position, options)
  VALUES 
    (p_entity_id, 'frecuencia', '¿Con qué frecuencia eliges esta opción?', 'choice', 2, '["Diariamente", "Semanalmente", "Mensualmente", "Ocasionalmente"]'),
    (p_entity_id, 'recomendacion', '¿Qué tan probable es que recomiendes esta opción a un amigo?', 'scale', 3, '[]'),
    (p_entity_id, 'valor', '¿Cómo calificas la relación calidad-precio? (1-5)', 'scale', 4, '[]'),
    (p_entity_id, 'innovacion', '¿Qué tan innovadora consideras que es esta opción? (1-5)', 'scale', 5, '[]'),
    (p_entity_id, 'proposito', '¿Sientes que esta marca aporta un valor real a la sociedad?', 'choice', 6, '["Sí, totalmente", "Parcialmente", "Es indiferente", "No"]')
  ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- 3. Actualizar get_active_battles con validación de profundidad
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
            SELECT jsonb_agg(jsonb_build_object('id', bo.id, 'label', bo.label, 'image_url', bo.image_url) ORDER BY bo.sort_order)
            FROM public.battle_options bo WHERE bo.battle_id = b.id
        ) AS options
    FROM public.battles b
    JOIN public.categories c ON b.category_id = c.id
    WHERE b.status = 'active'
    AND NOT EXISTS (
        -- VALIDACIÓN CRÍTICA: La batalla NO se muestra si alguna de sus opciones (entidades) tiene menos de 6 preguntas
        SELECT 1 
        FROM public.battle_options bo
        LEFT JOIN public.depth_definitions dd ON bo.brand_id = dd.entity_id
        WHERE bo.battle_id = b.id
        GROUP BY bo.id
        HAVING count(dd.id) < 6
    )
    ORDER BY b.created_at DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- 4. Asegurar Categorías
INSERT INTO public.categories (slug, name, emoji)
VALUES 
  ('streaming', 'Streaming y TV', '📺'),
  ('bebidas', 'Bebidas y Snacks', '🥤'),
  ('vacaciones', 'Viajes y Destinos', '✈️'),
  ('smartphones', 'Smartphones y Tech', '📱'),
  ('salud', 'Salud y Clínicas', '🏥')
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, emoji = EXCLUDED.emoji;

-- 3. Inserción de Entidades por Categoría
-- STREAMING
INSERT INTO public.entities (type, name, slug, category, metadata) VALUES
  ('brand', 'Netflix', 'netflix', 'streaming', '{"source": "seed"}'),
  ('brand', 'Prime Video', 'prime-video', 'streaming', '{"source": "seed"}'),
  ('brand', 'Disney+', 'disney-plus', 'streaming', '{"source": "seed"}'),
  ('brand', 'Max', 'max', 'streaming', '{"source": "seed"}'),
  ('brand', 'Apple TV+', 'apple-tv-plus', 'streaming', '{"source": "seed"}'),
  ('brand', 'Paramount+', 'paramount-plus', 'streaming', '{"source": "seed"}')
ON CONFLICT (slug) DO NOTHING;

-- BEBIDAS
INSERT INTO public.entities (type, name, slug, category, metadata) VALUES
  ('brand', 'Coca-Cola', 'coca-cola', 'bebidas', '{"source": "seed"}'),
  ('brand', 'Pepsi', 'pepsi', 'bebidas', '{"source": "seed"}'),
  ('brand', 'Red Bull', 'red-bull', 'bebidas', '{"source": "seed"}'),
  ('brand', 'Monster Energy', 'monster-energy', 'bebidas', '{"source": "seed"}'),
  ('brand', 'Fanta', 'fanta', 'bebidas', '{"source": "seed"}'),
  ('brand', 'Sprite', 'sprite', 'bebidas', '{"source": "seed"}')
ON CONFLICT (slug) DO NOTHING;

-- VACACIONES
INSERT INTO public.entities (type, name, slug, category, metadata) VALUES
  ('city', 'Nueva York', 'nueva-york', 'vacaciones', '{"source": "seed"}'),
  ('city', 'París', 'paris', 'vacaciones', '{"source": "seed"}'),
  ('city', 'Tokio', 'tokio', 'vacaciones', '{"source": "seed"}'),
  ('city', 'Río de Janeiro', 'rio-de-janeiro', 'vacaciones', '{"source": "seed"}'),
  ('city', 'Roma', 'roma', 'vacaciones', '{"source": "seed"}'),
  ('city', 'Barcelona', 'barcelona', 'vacaciones', '{"source": "seed"}')
ON CONFLICT (slug) DO NOTHING;

-- SMARTPHONES
INSERT INTO public.entities (type, name, slug, category, metadata) VALUES
  ('brand', 'Apple (iPhone)', 'apple-iphone', 'smartphones', '{"source": "seed"}'),
  ('brand', 'Samsung', 'samsung', 'smartphones', '{"source": "seed"}'),
  ('brand', 'Xiaomi', 'xiaomi', 'smartphones', '{"source": "seed"}'),
  ('brand', 'Huawei', 'huawei', 'smartphones', '{"source": "seed"}'),
  ('brand', 'Google (Pixel)', 'google-pixel', 'smartphones', '{"source": "seed"}'),
  ('brand', 'Motorola', 'motorola', 'smartphones', '{"source": "seed"}')
ON CONFLICT (slug) DO NOTHING;

-- SALUD
INSERT INTO public.entities (type, name, slug, category, metadata) VALUES
  ('brand', 'Clínica Alemana', 'clinica-alemana', 'salud', '{"source": "seed"}'),
  ('brand', 'Clínica Las Condes', 'clinica-las-condes', 'salud', '{"source": "seed"}'),
  ('brand', 'Clínica Santa María', 'clinica-santa-maria', 'salud', '{"source": "seed"}'),
  ('brand', 'Clínica Dávila', 'clinica-davila', 'salud', '{"source": "seed"}'),
  ('brand', 'RedSalud', 'redsalud', 'salud', '{"source": "seed"}'),
  ('brand', 'IntegraMédica', 'integramedica', 'salud', '{"source": "seed"}')
ON CONFLICT (slug) DO NOTHING;

-- 4. Creación de Batallas Progresivas (Torneos)
INSERT INTO public.battles (title, slug, description, category_id, status)
SELECT '¿Cuál es el mejor servicio de streaming?', 'tournament-streaming', 'Encuentra tu plataforma favorita.', id, 'active' 
FROM public.categories WHERE slug = 'streaming'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.battles (title, slug, description, category_id, status)
SELECT '¿Cuál es tu bebida favorita?', 'tournament-bebidas', 'Duelo refrescante de marcas.', id, 'active' 
FROM public.categories WHERE slug = 'bebidas'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.battles (title, slug, description, category_id, status)
SELECT '¿Cuál es el mejor destino para vacaciones?', 'tournament-vacaciones', 'El viaje de tus sueños empieza aquí.', id, 'active' 
FROM public.categories WHERE slug = 'vacaciones'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.battles (title, slug, description, category_id, status)
SELECT '¿Cuál es la mejor marca de smartphone?', 'tournament-smartphones', 'Poder, cámara y diseño en tus manos.', id, 'active' 
FROM public.categories WHERE slug = 'smartphones'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.battles (title, slug, description, category_id, status)
SELECT '¿Cuál es la mejor clínica?', 'tournament-salud', 'Calidad y confianza en atención médica.', id, 'active' 
FROM public.categories WHERE slug = 'salud'
ON CONFLICT (slug) DO NOTHING;

-- 5. Vincular Entidades a Batallas Progresivas
DO $$
DECLARE
  v_bat RECORD;
BEGIN
  FOR v_bat IN SELECT id, slug FROM public.battles WHERE slug LIKE 'tournament-%' LOOP
    INSERT INTO public.battle_options (battle_id, label, brand_id, sort_order)
    SELECT v_bat.id, e.name, e.id, row_number() OVER ()
    FROM public.entities e
    WHERE e.category = split_part(v_bat.slug, '-', 2)
    ON CONFLICT DO NOTHING;
    
    -- Activar con una instancia
    INSERT INTO public.battle_instances (battle_id, version, starts_at, context)
    VALUES (v_bat.id, 1, now(), '{"type": "progressive"}')
    ON CONFLICT DO NOTHING;
  END LOOP;
END $$;

-- 6. Batallas Versus Simples Destacadas
DO $$
DECLARE
  v_cat_tech uuid;
  v_cat_bebidas uuid;
  v_b_id uuid;
BEGIN
  SELECT id INTO v_cat_tech FROM public.categories WHERE slug = 'smartphones';
  SELECT id INTO v_cat_bebidas FROM public.categories WHERE slug = 'bebidas';

  -- Apple vs Samsung
  INSERT INTO public.battles (title, slug, description, category_id)
  VALUES ('Apple vs Samsung', 'apple-vs-samsung-2026', 'El duelo eterno de la tecnología.', v_cat_tech)
  ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title
  RETURNING id INTO v_b_id;

  INSERT INTO public.battle_options (battle_id, label, brand_id, sort_order)
  SELECT v_b_id, e.name, e.id, 1 FROM public.entities e WHERE e.slug = 'apple-iphone'
  ON CONFLICT DO NOTHING;
  INSERT INTO public.battle_options (battle_id, label, brand_id, sort_order)
  SELECT v_b_id, e.name, e.id, 2 FROM public.entities e WHERE e.slug = 'samsung'
  ON CONFLICT DO NOTHING;
  
  INSERT INTO public.battle_instances (battle_id, version, starts_at) VALUES (v_b_id, 1, now()) ON CONFLICT DO NOTHING;

  -- Coca-Cola vs Pepsi
  INSERT INTO public.battles (title, slug, description, category_id)
  VALUES ('Coca-Cola vs Pepsi', 'coca-vs-pepsi-2026', 'El sabor que divide al mundo.', v_cat_bebidas)
  ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title
  RETURNING id INTO v_b_id;

  INSERT INTO public.battle_options (battle_id, label, brand_id, sort_order)
  SELECT v_b_id, e.name, e.id, 1 FROM public.entities e WHERE e.slug = 'coca-cola'
  ON CONFLICT DO NOTHING;
  INSERT INTO public.battle_options (battle_id, label, brand_id, sort_order)
  SELECT v_b_id, e.name, e.id, 2 FROM public.entities e WHERE e.slug = 'pepsi'
  ON CONFLICT DO NOTHING;

  INSERT INTO public.battle_instances (battle_id, version, starts_at) VALUES (v_b_id, 1, now()) ON CONFLICT DO NOTHING;
END $$;

-- 7. Población de 180 Preguntas de Profundidad (6 por Entidad)
DO $$
DECLARE
  v_ent RECORD;
BEGIN
  FOR v_ent IN SELECT id, name, category FROM public.entities WHERE category IN ('streaming', 'bebidas', 'vacaciones', 'smartphones', 'salud') LOOP
    
    -- Pregunta 1: Nota (Obligatoria)
    INSERT INTO public.depth_definitions (entity_id, question_key, question_text, question_type, position)
    VALUES (v_ent.id, 'nota_general', 
      CASE WHEN v_ent.category = 'salud' THEN '¿Qué nota le das a la experiencia en ' || v_ent.name || ' del 0 al 10?'
      ELSE '¿Qué nota le das a ' || v_ent.name || ' del 0 al 10?' END,
      'scale', 1)
    ON CONFLICT (entity_id, question_key) DO NOTHING;

    -- Pregunta 2: Frecuencia
    INSERT INTO public.depth_definitions (entity_id, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'frecuencia', '¿Con qué frecuencia consumes/visitas ' || v_ent.name || '?', 'choice', 2, '["Diariamente", "Semanalmente", "Mensualmente", "Ocasionalmente"]')
    ON CONFLICT (entity_id, question_key) DO NOTHING;

    -- Pregunta 3: Recomendación (NPS)
    INSERT INTO public.depth_definitions (entity_id, question_key, question_text, question_type, position)
    VALUES (v_ent.id, 'recomendacion', '¿Qué tan probable es que recomiendes ' || v_ent.name || ' del 0 al 10?', 'scale', 3)
    ON CONFLICT (entity_id, question_key) DO NOTHING;

    -- Pregunta 4: Calidad/Precio
    INSERT INTO public.depth_definitions (entity_id, question_key, question_text, question_type, position)
    VALUES (v_ent.id, 'valor', '¿Cómo calificas la relación calidad-precio / valor de ' || v_ent.name || '? (1-5)', 'scale', 4)
    ON CONFLICT (entity_id, question_key) DO NOTHING;

    -- Pregunta 5: Atributo Diferenciador
    INSERT INTO public.depth_definitions (entity_id, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'atributo', '¿Qué es lo que más valoras de ' || v_ent.name || '?', 'choice', 5, 
      CASE 
        WHEN v_ent.category = 'streaming' THEN '["Contenido original", "Precio", "Interfaz", "Catálogo variado"]'
        WHEN v_ent.category = 'bebidas' THEN '["Sabor", "Precio", "Disponibilidad", "Imagen de marca"]'
        WHEN v_ent.category = 'vacaciones' THEN '["Atractivos turísticos", "Seguridad", "Cultura", "Gastronomía"]'
        WHEN v_ent.category = 'smartphones' THEN '["Cámara", "Ecosistema", "Diseño", "Rendimiento"]'
        ELSE '["Calidad médica", "Ubicación", "Tecnología", "Trato al paciente"]'
      END::jsonb)
    ON CONFLICT (entity_id, question_key) DO NOTHING;

    -- Pregunta 6: Innovación / Futuro
    INSERT INTO public.depth_definitions (entity_id, question_key, question_text, question_type, position)
    VALUES (v_ent.id, 'innovacion', '¿Qué tan innovador consideras que es ' || v_ent.name || '? (1-5)', 'scale', 6)
    ON CONFLICT (entity_id, question_key) DO NOTHING;

  END LOOP;
END $$;

COMMIT;
