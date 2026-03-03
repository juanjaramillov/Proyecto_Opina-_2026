BEGIN;

-- =========================================================
-- 1) CATEGORY
-- =========================================================
INSERT INTO public.categories (slug, name, emoji)
VALUES ('telecom-movil-fibra', 'Telecomunicaciones', '📶')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  emoji = EXCLUDED.emoji;

-- =========================================================
-- 2) BATTLE
-- =========================================================
INSERT INTO public.battles (title, slug, description, category_id, status)
SELECT
  'Guerra del Internet', 'guerra_del_internet',
  '¿Quién te da mejor señal sin excusas?',
  c.id, 'active'
FROM public.categories c
WHERE c.slug = 'telecom-movil-fibra'
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  status = EXCLUDED.status;

-- =========================================================
-- 3) ENTITIES (brands)
-- =========================================================
INSERT INTO public.entities (type, name, slug, category, metadata, image_url)
VALUES
  ('brand','Entel','entel','Telecomunicaciones','{}',NULL),
  ('brand','Movistar','movistar','Telecomunicaciones','{}',NULL),
  ('brand','WOM','wom','Telecomunicaciones','{}',NULL),
  ('brand','Claro','claro','Telecomunicaciones','{}',NULL),
  ('brand','VTR','vtr','Telecomunicaciones','{}',NULL),
  ('brand','Mundo','mundo','Telecomunicaciones','{}',NULL),
  ('brand','Virgin Mobile','virgin_mobile','Telecomunicaciones','{}',NULL),
  ('brand','GTD','gtd','Telecomunicaciones','{}',NULL),
  ('brand','Telsur','telsur','Telecomunicaciones','{}',NULL),
  ('brand','Zapping','zapping','Telecomunicaciones','{}',NULL),
  ('brand','DIRECTV GO','directv_go','Telecomunicaciones','{}',NULL),
  ('brand','Claro Video','claro_video','Telecomunicaciones','{}',NULL),
  ('brand','Movistar Fibra','movistar_fibra','Telecomunicaciones','{}',NULL),
  ('brand','Entel Fibra','entel_fibra','Telecomunicaciones','{}',NULL),
  ('brand','VTR Hogar','vtr_hogar','Telecomunicaciones','{}',NULL),
  ('brand','Mundo Fibra','mundo_fibra','Telecomunicaciones','{}',NULL)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  metadata = EXCLUDED.metadata,
  image_url = EXCLUDED.image_url;

-- =========================================================
-- 4) BATTLE OPTIONS
-- =========================================================
INSERT INTO public.battle_options (battle_id, label, brand_id, image_url, sort_order, brand_domain)
SELECT
  b.id,
  e.name,
  e.id,
  e.image_url,
  CASE e.slug
    WHEN 'entel' THEN 1
    WHEN 'movistar' THEN 2
    WHEN 'wom' THEN 3
    WHEN 'claro' THEN 4
    WHEN 'vtr' THEN 5
    WHEN 'mundo' THEN 6
    WHEN 'virgin_mobile' THEN 7
    WHEN 'gtd' THEN 8
    WHEN 'telsur' THEN 9
    WHEN 'zapping' THEN 10
    WHEN 'directv_go' THEN 11
    WHEN 'claro_video' THEN 12
    WHEN 'movistar_fibra' THEN 13
    WHEN 'entel_fibra' THEN 14
    WHEN 'vtr_hogar' THEN 15
    WHEN 'mundo_fibra' THEN 16
    ELSE 999
  END AS sort_order,
  CASE e.slug
    WHEN 'entel' THEN 'entel.cl'
    WHEN 'movistar' THEN 'movistar.cl'
    WHEN 'wom' THEN 'wom.cl'
    WHEN 'claro' THEN 'claro.cl'
    WHEN 'vtr' THEN 'vtr.com'
    WHEN 'mundo' THEN 'mundo.cl'
    WHEN 'virgin_mobile' THEN 'virginmobile.cl'
    WHEN 'gtd' THEN 'gtd.cl'
    WHEN 'telsur' THEN 'telsur.cl'
    WHEN 'zapping' THEN 'zapping.com'
    WHEN 'directv_go' THEN 'directvgo.com'
    WHEN 'claro_video' THEN 'clarovideo.com'
    WHEN 'movistar_fibra' THEN 'movistar.cl'
    WHEN 'entel_fibra' THEN 'entel.cl'
    WHEN 'vtr_hogar' THEN 'vtr.com'
    WHEN 'mundo_fibra' THEN 'mundo.cl'
    ELSE NULL
  END AS brand_domain
FROM public.battles b
JOIN public.entities e ON e.category = 'Telecomunicaciones'
WHERE b.slug = 'guerra_del_internet'
ON CONFLICT (battle_id, label) DO UPDATE SET
  brand_id = EXCLUDED.brand_id,
  image_url = EXCLUDED.image_url,
  sort_order = EXCLUDED.sort_order,
  brand_domain = EXCLUDED.brand_domain;

-- =========================================================
-- 5) DEPTH DEFINITIONS (10 estándar por marca)
-- =========================================================
DO $$
DECLARE
  v_ent RECORD;
BEGIN
  FOR v_ent IN
    SELECT id, name
    FROM public.entities
    WHERE category = 'Telecomunicaciones'
  LOOP

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'telecom-movil-fibra', 'recomendacion',
      'Del 0 al 10… ¿qué tan probable es que recomiendes ' || v_ent.name || '?',
      'scale', 1, NULL)
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'telecom-movil-fibra', 'q_motivo_principal',
      '¿Por qué sigues con ' || v_ent.name || '?',
      'choice', 2, '["Cobertura","Velocidad","Precio","Promos","Servicio técnico","Me da lo mismo (inercias)","No hay mejor opción","Otro"]')
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'telecom-movil-fibra', 'q_dolor_principal',
      '¿Qué te mata de ' || v_ent.name || '?',
      'choice', 3, '["Se cae","Lento","Mala cobertura","Carísimo","Servicio técnico malo","Atención mala","Cobros raros","Promos engañosas","Nada grave"]')
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'telecom-movil-fibra', 'q_precio_1_5',
      'En precio, ' || v_ent.name || ' es…',
      'scale_1_5', 4, NULL)
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'telecom-movil-fibra', 'q_calidad_1_5',
      'En calidad de señal/servicio…',
      'scale_1_5', 5, NULL)
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'telecom-movil-fibra', 'q_velocidad_1_5',
      'Velocidad (cuando importa)…',
      'scale_1_5', 6, NULL)
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'telecom-movil-fibra', 'q_cobertura_1_5',
      'Cobertura (donde vives/trabajas)…',
      'scale_1_5', 7, NULL)
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'telecom-movil-fibra', 'q_estabilidad_1_5',
      'Estabilidad (se corta/no se corta)…',
      'scale_1_5', 8, NULL)
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'telecom-movil-fibra', 'q_atencion_1_5',
      'Atención / soporte…',
      'scale_1_5', 9, NULL)
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'telecom-movil-fibra', 'q_frecuencia_uso',
      '¿Qué tanto lo usas?',
      'choice', 10, '["Todo el día","Varias veces/día","Diario","Semanal","Casi nunca"]')
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

  END LOOP;
END $$;

COMMIT;
