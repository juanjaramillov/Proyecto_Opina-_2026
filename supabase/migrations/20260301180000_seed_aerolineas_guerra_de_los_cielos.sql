BEGIN;

-- =========================================================
-- 1) CATEGORY
-- =========================================================
INSERT INTO public.categories (slug, name, emoji)
VALUES ('transporte-aerolineas', 'Aerolíneas', '✈️')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  emoji = EXCLUDED.emoji;

-- =========================================================
-- 2) BATTLE
-- =========================================================
INSERT INTO public.battles (title, slug, description, category_id, status)
SELECT
  'Guerra de los Cielos', 'guerra_de_los_cielos',
  '¿Con quién vuelas sin arrepentirte después?',
  c.id, 'active'
FROM public.categories c
WHERE c.slug = 'transporte-aerolineas'
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  status = EXCLUDED.status;

-- =========================================================
-- 3) ENTITIES
-- =========================================================
INSERT INTO public.entities (type, name, slug, category, metadata, image_url)
VALUES
  ('brand','LATAM','latam','Aerolíneas','{}',NULL),
  ('brand','Sky Airline','sky','Aerolíneas','{}',NULL),
  ('brand','JetSMART','jetsmart','Aerolíneas','{}',NULL),
  ('brand','Avianca','avianca','Aerolíneas','{}',NULL),
  ('brand','Copa Airlines','copa','Aerolíneas','{}',NULL),
  ('brand','American Airlines','american','Aerolíneas','{}',NULL),
  ('brand','Delta','delta','Aerolíneas','{}',NULL),
  ('brand','United','united','Aerolíneas','{}',NULL),
  ('brand','Air Canada','air_canada','Aerolíneas','{}',NULL),
  ('brand','Iberia','iberia','Aerolíneas','{}',NULL),
  ('brand','Air France','air_france','Aerolíneas','{}',NULL),
  ('brand','KLM','klm','Aerolíneas','{}',NULL),
  ('brand','British Airways','british_airways','Aerolíneas','{}',NULL),
  ('brand','Emirates','emirates','Aerolíneas','{}',NULL),
  ('brand','Qatar Airways','qatar','Aerolíneas','{}',NULL),
  ('brand','Turkish Airlines','turkish','Aerolíneas','{}',NULL)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  metadata = EXCLUDED.metadata,
  image_url = EXCLUDED.image_url;

-- =========================================================
-- 4) BATTLE OPTIONS (brand_domain)
-- =========================================================
INSERT INTO public.battle_options (battle_id, label, brand_id, image_url, sort_order, brand_domain)
SELECT
  b.id,
  e.name,
  e.id,
  e.image_url,
  CASE e.slug
    WHEN 'latam' THEN 1
    WHEN 'sky' THEN 2
    WHEN 'jetsmart' THEN 3
    WHEN 'avianca' THEN 4
    WHEN 'copa' THEN 5
    WHEN 'american' THEN 6
    WHEN 'delta' THEN 7
    WHEN 'united' THEN 8
    WHEN 'air_canada' THEN 9
    WHEN 'iberia' THEN 10
    WHEN 'air_france' THEN 11
    WHEN 'klm' THEN 12
    WHEN 'british_airways' THEN 13
    WHEN 'emirates' THEN 14
    WHEN 'qatar' THEN 15
    WHEN 'turkish' THEN 16
    ELSE 999
  END AS sort_order,
  CASE e.slug
    WHEN 'latam' THEN 'latamairlines.com'
    WHEN 'sky' THEN 'skyairline.com'
    WHEN 'jetsmart' THEN 'jetsmart.com'
    WHEN 'avianca' THEN 'avianca.com'
    WHEN 'copa' THEN 'copaair.com'
    WHEN 'american' THEN 'aa.com'
    WHEN 'delta' THEN 'delta.com'
    WHEN 'united' THEN 'united.com'
    WHEN 'air_canada' THEN 'aircanada.com'
    WHEN 'iberia' THEN 'iberia.com'
    WHEN 'air_france' THEN 'airfrance.com'
    WHEN 'klm' THEN 'klm.com'
    WHEN 'british_airways' THEN 'britishairways.com'
    WHEN 'emirates' THEN 'emirates.com'
    WHEN 'qatar' THEN 'qatarairways.com'
    WHEN 'turkish' THEN 'turkishairlines.com'
    ELSE NULL
  END AS brand_domain
FROM public.battles b
JOIN public.entities e ON e.category = 'Aerolíneas'
WHERE b.slug = 'guerra_de_los_cielos'
ON CONFLICT (battle_id, label) DO UPDATE SET
  brand_id = EXCLUDED.brand_id,
  image_url = EXCLUDED.image_url,
  sort_order = EXCLUDED.sort_order,
  brand_domain = EXCLUDED.brand_domain;

-- =========================================================
-- 5) DEPTH DEFINITIONS (10 estándar)
-- =========================================================
DO $$
DECLARE
  v_ent RECORD;
BEGIN
  FOR v_ent IN
    SELECT id, name
    FROM public.entities
    WHERE category = 'Aerolíneas'
  LOOP

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'transporte-aerolineas', 'recomendacion',
      'Del 0 al 10… ¿qué tan probable es que recomiendes ' || v_ent.name || '?',
      'scale', 1, NULL)
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'transporte-aerolineas', 'q_motivo_principal',
      '¿Por qué vuelas con ' || v_ent.name || '?',
      'choice', 2, '["Precio","Rutas/horarios","Puntualidad","Servicio","Millas/beneficios","Experiencia","Por costumbre","Otro"]')
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'transporte-aerolineas', 'q_dolor_principal',
      '¿Qué te hace jurar “nunca más” con ' || v_ent.name || '?',
      'choice', 3, '["Atrasos","Cancelaciones","Cobros extra","Atención mala","Equipaje","Asientos incómodos","Check-in","Nada grave"]')
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'transporte-aerolineas', 'q_precio_1_5', 'Precio / valor…', 'scale_1_5', 4, NULL)
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'transporte-aerolineas', 'q_puntualidad_1_5', 'Puntualidad…', 'scale_1_5', 5, NULL)
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'transporte-aerolineas', 'q_comodidad_1_5', 'Comodidad…', 'scale_1_5', 6, NULL)
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'transporte-aerolineas', 'q_servicio_1_5', 'Servicio a bordo…', 'scale_1_5', 7, NULL)
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'transporte-aerolineas', 'q_atencion_1_5', 'Atención (cuando hay problemas)…', 'scale_1_5', 8, NULL)
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'transporte-aerolineas', 'q_transparencia_1_5', 'Transparencia (cobros/condiciones)…', 'scale_1_5', 9, NULL)
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'transporte-aerolineas', 'q_frecuencia', '¿Con qué frecuencia vuelas?', 'choice', 10, '["Mensual","Trimestral","Semestral","1 vez/año","Casi nunca"]')
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

  END LOOP;
END $$;

COMMIT;
