BEGIN;

-- 1) CATEGORY
INSERT INTO public.categories (slug, name, emoji)
VALUES ('salud-isapres-seguros', 'Isapres & Seguros', '🧾')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  emoji = EXCLUDED.emoji;

-- 2) BATTLE
INSERT INTO public.battles (title, slug, description, category_id, status)
SELECT
  'Guerra de las Isapres', 'guerra_de_las_isapres',
  '¿Quién te responde cuando de verdad lo necesitas?',
  c.id, 'active'
FROM public.categories c
WHERE c.slug = 'salud-isapres-seguros'
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  status = EXCLUDED.status;

-- 3) ENTITIES (16)
INSERT INTO public.entities (type, name, slug, category, metadata, image_url)
VALUES
  ('brand','Banmédica','banmedica','Isapres & Seguros','{}',NULL),
  ('brand','Colmena','colmena','Isapres & Seguros','{}',NULL),
  ('brand','Consalud','consalud','Isapres & Seguros','{}',NULL),
  ('brand','Cruz Blanca','cruz_blanca','Isapres & Seguros','{}',NULL),
  ('brand','Vida Tres','vida_tres','Isapres & Seguros','{}',NULL),
  ('brand','Nueva Masvida','nueva_masvida','Isapres & Seguros','{}',NULL),
  ('brand','Fonasa','fonasa','Isapres & Seguros','{}',NULL),
  ('brand','Caja Los Andes (salud)','caja_los_andes_salud','Isapres & Seguros','{}',NULL),

  ('brand','MetLife','metlife','Isapres & Seguros','{}',NULL),
  ('brand','Zurich','zurich','Isapres & Seguros','{}',NULL),
  ('brand','SURA','sura','Isapres & Seguros','{}',NULL),
  ('brand','Consorcio','consorcio_seg','Isapres & Seguros','{}',NULL),
  ('brand','BICE Vida','bice_vida','Isapres & Seguros','{}',NULL),
  ('brand','HDI','hdi','Isapres & Seguros','{}',NULL),
  ('brand','MAPFRE','mapfre','Isapres & Seguros','{}',NULL),
  ('brand','Chilena Consolidada','chilena_consolidada','Isapres & Seguros','{}',NULL)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  metadata = EXCLUDED.metadata,
  image_url = EXCLUDED.image_url;

-- 4) BATTLE OPTIONS (brand_domain)
INSERT INTO public.battle_options (battle_id, label, brand_id, image_url, sort_order, brand_domain)
SELECT
  b.id,
  e.name,
  e.id,
  e.image_url,
  CASE e.slug
    WHEN 'banmedica' THEN 1
    WHEN 'colmena' THEN 2
    WHEN 'consalud' THEN 3
    WHEN 'cruz_blanca' THEN 4
    WHEN 'vida_tres' THEN 5
    WHEN 'nueva_masvida' THEN 6
    WHEN 'fonasa' THEN 7
    WHEN 'caja_los_andes_salud' THEN 8
    WHEN 'metlife' THEN 9
    WHEN 'zurich' THEN 10
    WHEN 'sura' THEN 11
    WHEN 'consorcio_seg' THEN 12
    WHEN 'bice_vida' THEN 13
    WHEN 'hdi' THEN 14
    WHEN 'mapfre' THEN 15
    WHEN 'chilena_consolidada' THEN 16
    ELSE 999
  END AS sort_order,
  CASE e.slug
    WHEN 'banmedica' THEN 'banmedica.cl'
    WHEN 'colmena' THEN 'colmena.cl'
    WHEN 'consalud' THEN 'consalud.cl'
    WHEN 'cruz_blanca' THEN 'cruzblanca.cl'
    WHEN 'vida_tres' THEN 'vidatres.cl'
    WHEN 'nueva_masvida' THEN 'nuevamasvida.cl'
    WHEN 'fonasa' THEN 'fonasa.cl'
    WHEN 'caja_los_andes_salud' THEN 'cajalosandes.cl'
    WHEN 'metlife' THEN 'metlife.cl'
    WHEN 'zurich' THEN 'zurich.cl'
    WHEN 'sura' THEN 'sura.cl'
    WHEN 'consorcio_seg' THEN 'consorcio.cl'
    WHEN 'bice_vida' THEN 'bicevida.cl'
    WHEN 'hdi' THEN 'hdi.cl'
    WHEN 'mapfre' THEN 'mapfre.cl'
    WHEN 'chilena_consolidada' THEN 'chilenaconsolidada.cl'
    ELSE NULL
  END AS brand_domain
FROM public.battles b
JOIN public.entities e ON e.category = 'Isapres & Seguros'
WHERE b.slug = 'guerra_de_las_isapres'
ON CONFLICT (battle_id, label) DO UPDATE SET
  brand_id = EXCLUDED.brand_id,
  image_url = EXCLUDED.image_url,
  sort_order = EXCLUDED.sort_order,
  brand_domain = EXCLUDED.brand_domain;

-- 5) DEPTH DEFINITIONS (10 estándar)
DO $$
DECLARE
  v_ent RECORD;
BEGIN
  FOR v_ent IN
    SELECT id, name
    FROM public.entities
    WHERE category = 'Isapres & Seguros'
  LOOP

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'salud-isapres-seguros', 'recomendacion',
      'Del 0 al 10… ¿qué tan probable es que recomiendes ' || v_ent.name || '?',
      'scale', 1, NULL)
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'salud-isapres-seguros', 'q_motivo_principal',
      '¿Por qué estás con ' || v_ent.name || '?',
      'choice', 2, '["Cobertura","Precio","Reembolsos","Red de prestadores","Atención","Por plan empresa","Por costumbre","Otro"]')
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'salud-isapres-seguros', 'q_dolor_principal',
      '¿Qué te frustra de ' || v_ent.name || '?',
      'choice', 3, '["Reembolsos","Cobros sorpresa","Letra chica","Rechazos","Atención","Trámites","Demoras","Nada grave"]')
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'salud-isapres-seguros', 'q_precio_1_5', 'Precio / valor…', 'scale_1_5', 4, NULL)
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'salud-isapres-seguros', 'q_cobertura_1_5', 'Cobertura real…', 'scale_1_5', 5, NULL)
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'salud-isapres-seguros', 'q_reembolsos_1_5', 'Reembolsos / rapidez…', 'scale_1_5', 6, NULL)
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'salud-isapres-seguros', 'q_transparencia_1_5', 'Transparencia (letra chica)…', 'scale_1_5', 7, NULL)
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'salud-isapres-seguros', 'q_atencion_1_5', 'Atención / soporte…', 'scale_1_5', 8, NULL)
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'salud-isapres-seguros', 'q_facilidad_1_5', 'Facilidad de trámites…', 'scale_1_5', 9, NULL)
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'salud-isapres-seguros', 'q_frecuencia',
      '¿Qué tan seguido lo usas?',
      'choice', 10, '["Mensual","Trimestral","Semestral","1 vez/año","Casi nunca"]')
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

  END LOOP;
END $$;

COMMIT;
