BEGIN;

-- =========================================================
-- 1) CATEGORY
-- =========================================================
INSERT INTO public.categories (slug, name, emoji)
VALUES ('gastronomia-comida-rapida', 'Comida Rápida', '🍔')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  emoji = EXCLUDED.emoji;

-- =========================================================
-- 2) BATTLE (1 master battle)
-- =========================================================
INSERT INTO public.battles (title, slug, description, category_id, status)
SELECT
  'Reyes del Bajón', 'reyes_del_bajon',
  '¿Qué antojo domina hoy?',
  c.id, 'active'
FROM public.categories c
WHERE c.slug = 'gastronomia-comida-rapida'
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  status = EXCLUDED.status;

-- =========================================================
-- 3) ENTITIES (brands)
-- =========================================================
INSERT INTO public.entities (type, name, slug, category, metadata, image_url)
VALUES
  ('brand','McDonald''s','mcdonalds','Comida Rápida','{}',NULL),
  ('brand','Burger King','burger_king','Comida Rápida','{}',NULL),
  ('brand','KFC','kfc','Comida Rápida','{}',NULL),
  ('brand','Popeyes','popeyes','Comida Rápida','{}',NULL),
  ('brand','Domino''s Pizza','dominos_pizza','Comida Rápida','{}',NULL),
  ('brand','Papa Johns','papa_johns','Comida Rápida','{}',NULL),
  ('brand','Pizza Hut','pizza_hut','Comida Rápida','{}',NULL),
  ('brand','Telepizza','telepizza','Comida Rápida','{}',NULL),
  ('brand','Subway','subway','Comida Rápida','{}',NULL),
  ('brand','Juan Maestro','juan_maestro','Comida Rápida','{}',NULL),
  ('brand','Doggis','doggis','Comida Rápida','{}',NULL),
  ('brand','Tommy Beans','tommy_beans','Comida Rápida','{}',NULL),
  ('brand','Dunkin''','dunkin','Comida Rápida','{}',NULL),
  ('brand','Krispy Kreme','krispy_kreme','Comida Rápida','{}',NULL),
  ('brand','Starbucks','starbucks','Comida Rápida','{}',NULL),
  ('brand','Juan Valdez','juan_valdez','Comida Rápida','{}',NULL)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  metadata = EXCLUDED.metadata,
  image_url = EXCLUDED.image_url;

-- =========================================================
-- 4) BATTLE OPTIONS (attach brands + brand_domain for logos)
-- =========================================================
INSERT INTO public.battle_options (battle_id, label, brand_id, image_url, sort_order, brand_domain)
SELECT
  b.id,
  e.name,
  e.id,
  e.image_url,
  CASE e.slug
    WHEN 'mcdonalds' THEN 1
    WHEN 'burger_king' THEN 2
    WHEN 'kfc' THEN 3
    WHEN 'popeyes' THEN 4
    WHEN 'dominos_pizza' THEN 5
    WHEN 'papa_johns' THEN 6
    WHEN 'pizza_hut' THEN 7
    WHEN 'telepizza' THEN 8
    WHEN 'subway' THEN 9
    WHEN 'juan_maestro' THEN 10
    WHEN 'doggis' THEN 11
    WHEN 'tommy_beans' THEN 12
    WHEN 'dunkin' THEN 13
    WHEN 'krispy_kreme' THEN 14
    WHEN 'starbucks' THEN 15
    WHEN 'juan_valdez' THEN 16
    ELSE 999
  END AS sort_order,
  CASE e.slug
    WHEN 'mcdonalds' THEN 'mcdonalds.cl'
    WHEN 'burger_king' THEN 'burgerking.cl'
    WHEN 'kfc' THEN 'kfc.cl'
    WHEN 'popeyes' THEN 'popeyes.com'
    WHEN 'dominos_pizza' THEN 'dominospizza.cl'
    WHEN 'papa_johns' THEN 'papajohns.cl'
    WHEN 'pizza_hut' THEN 'pizzahut.cl'
    WHEN 'telepizza' THEN 'telepizza.cl'
    WHEN 'subway' THEN 'subway.com'
    WHEN 'juan_maestro' THEN 'juanmaestro.cl'
    WHEN 'doggis' THEN 'doggis.cl'
    WHEN 'tommy_beans' THEN 'tommybeans.cl'
    WHEN 'dunkin' THEN 'dunkin.cl'
    WHEN 'krispy_kreme' THEN 'krispykreme.com'
    WHEN 'starbucks' THEN 'starbucks.cl'
    WHEN 'juan_valdez' THEN 'juanvaldez.com'
    ELSE NULL
  END AS brand_domain
FROM public.battles b
JOIN public.entities e ON e.category = 'Comida Rápida'
WHERE b.slug = 'reyes_del_bajon'
ON CONFLICT (battle_id, label) DO UPDATE SET
  brand_id = EXCLUDED.brand_id,
  image_url = EXCLUDED.image_url,
  sort_order = EXCLUDED.sort_order,
  brand_domain = EXCLUDED.brand_domain;

-- =========================================================
-- 5) DEPTH DEFINITIONS (10 estándar por marca)
--    Nota: 1ra pregunta NPS (0-10) usando key 'recomendacion' + type 'scale'
-- =========================================================
DO $$
DECLARE
  v_ent RECORD;
BEGIN
  FOR v_ent IN
    SELECT id, name, category, slug
    FROM public.entities
    WHERE category = 'Comida Rápida'
  LOOP

    -- 1) NPS 0-10 (compatible con renderer actual: type='scale' + key='recomendacion')
    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'gastronomia-comida-rapida', 'recomendacion',
      'Del 0 al 10… ¿qué tan probable es que recomiendes ' || v_ent.name || '?',
      'scale', 1, NULL)
    ON CONFLICT (entity_id, question_key) DO UPDATE SET
      question_text = EXCLUDED.question_text, question_type = EXCLUDED.question_type, position = EXCLUDED.position, options = EXCLUDED.options;

    -- 2) Motivo principal
    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'gastronomia-comida-rapida', 'q_motivo_principal',
      '¿Por qué vuelves a ' || v_ent.name || '?',
      'choice', 2, '["Sabor","Precio","Rapidez","Promos","Cercanía","Por costumbre","Por antojo","Variedad","Otro"]')
    ON CONFLICT (entity_id, question_key) DO UPDATE SET
      question_text = EXCLUDED.question_text, question_type = EXCLUDED.question_type, position = EXCLUDED.position, options = EXCLUDED.options;

    -- 3) Dolor principal
    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'gastronomia-comida-rapida', 'q_dolor_principal',
      '¿Qué te arruina la experiencia en ' || v_ent.name || '?',
      'choice', 3, '["Carísimo","Demora eterna","Pedido mal hecho","Poca calidad","Mala atención","Local sucio","Promos engañosas","Porciones chicas","Nada grave"]')
    ON CONFLICT (entity_id, question_key) DO UPDATE SET
      question_text = EXCLUDED.question_text, question_type = EXCLUDED.question_type, position = EXCLUDED.position, options = EXCLUDED.options;

    -- 4) Precio 1-5
    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'gastronomia-comida-rapida', 'q_precio_1_5',
      'En precio, ' || v_ent.name || ' es…',
      'scale_1_5', 4, NULL)
    ON CONFLICT (entity_id, question_key) DO UPDATE SET
      question_text = EXCLUDED.question_text, question_type = EXCLUDED.question_type, position = EXCLUDED.position, options = EXCLUDED.options;

    -- 5) Sabor/Calidad 1-5
    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'gastronomia-comida-rapida', 'q_calidad_1_5',
      'Sabor / calidad en ' || v_ent.name || '…',
      'scale_1_5', 5, NULL)
    ON CONFLICT (entity_id, question_key) DO UPDATE SET
      question_text = EXCLUDED.question_text, question_type = EXCLUDED.question_type, position = EXCLUDED.position, options = EXCLUDED.options;

    -- 6) Rapidez 1-5
    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'gastronomia-comida-rapida', 'q_rapidez_1_5',
      'Rapidez (pedido/entrega)…',
      'scale_1_5', 6, NULL)
    ON CONFLICT (entity_id, question_key) DO UPDATE SET
      question_text = EXCLUDED.question_text, question_type = EXCLUDED.question_type, position = EXCLUDED.position, options = EXCLUDED.options;

    -- 7) Consistencia 1-5
    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'gastronomia-comida-rapida', 'q_consistencia_1_5',
      '¿Qué tan consistente es (siempre cumple)?',
      'scale_1_5', 7, NULL)
    ON CONFLICT (entity_id, question_key) DO UPDATE SET
      question_text = EXCLUDED.question_text, question_type = EXCLUDED.question_type, position = EXCLUDED.position, options = EXCLUDED.options;

    -- 8) Promos 1-5
    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'gastronomia-comida-rapida', 'q_promos_1_5',
      'Promos: ¿cumplen o chamullan?',
      'scale_1_5', 8, NULL)
    ON CONFLICT (entity_id, question_key) DO UPDATE SET
      question_text = EXCLUDED.question_text, question_type = EXCLUDED.question_type, position = EXCLUDED.position, options = EXCLUDED.options;

    -- 9) Atención 1-5
    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'gastronomia-comida-rapida', 'q_atencion_1_5',
      'Atención (cuando la necesitas)…',
      'scale_1_5', 9, NULL)
    ON CONFLICT (entity_id, question_key) DO UPDATE SET
      question_text = EXCLUDED.question_text, question_type = EXCLUDED.question_type, position = EXCLUDED.position, options = EXCLUDED.options;

    -- 10) Frecuencia
    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'gastronomia-comida-rapida', 'q_frecuencia_compra',
      '¿Cada cuánto caes (con cariño)?',
      'choice', 10, '["2+ veces/semana","1 vez/semana","2-3 veces/mes","1 vez/mes","Casi nunca"]')
    ON CONFLICT (entity_id, question_key) DO UPDATE SET
      question_text = EXCLUDED.question_text, question_type = EXCLUDED.question_type, position = EXCLUDED.position, options = EXCLUDED.options;

  END LOOP;
END $$;

COMMIT;
