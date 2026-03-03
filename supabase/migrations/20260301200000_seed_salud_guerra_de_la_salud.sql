BEGIN;

-- =========================================================
-- 1) CATEGORY
-- =========================================================
INSERT INTO public.categories (slug, name, emoji)
VALUES ('salud-clinicas-farmacias', 'Salud', '🩺')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  emoji = EXCLUDED.emoji;

-- =========================================================
-- 2) BATTLE
-- =========================================================
INSERT INTO public.battles (title, slug, description, category_id, status)
SELECT
  'Guerra de la Salud', 'guerra_de_la_salud',
  '¿Dónde te atiendes sin sentir que te están apurando?',
  c.id, 'active'
FROM public.categories c
WHERE c.slug = 'salud-clinicas-farmacias'
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  status = EXCLUDED.status;

-- =========================================================
-- 3) ENTITIES
-- =========================================================
INSERT INTO public.entities (type, name, slug, category, metadata, image_url)
VALUES
  ('brand','Clínica Alemana','clinica_alemana','Salud','{}',NULL),
  ('brand','Clínica Las Condes','clinica_las_condes','Salud','{}',NULL),
  ('brand','Clínica Santa María','clinica_santa_maria','Salud','{}',NULL),
  ('brand','RedSalud','redsalud','Salud','{}',NULL),
  ('brand','Bupa','bupa','Salud','{}',NULL),
  ('brand','IntegraMédica','integramedica','Salud','{}',NULL),
  ('brand','UC CHRISTUS','uc_christus','Salud','{}',NULL),
  ('brand','Clínica Dávila','clinica_davila','Salud','{}',NULL),

  ('brand','Cruz Verde','cruzverde','Salud','{}',NULL),
  ('brand','Farmacias Ahumada','farmacias_ahumada','Salud','{}',NULL),
  ('brand','Salcobrand','salcobrand','Salud','{}',NULL),
  ('brand','Dr. Simi','dr_simi','Salud','{}',NULL),
  ('brand','Farmacia Popular','farmacia_popular','Salud','{}',NULL),
  ('brand','Knop','knop','Salud','{}',NULL),
  ('brand','Farmacias Galénica','galenica','Salud','{}',NULL),
  ('brand','Lider.cl (Farmacia)','lider_farmacia','Salud','{}',NULL)
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
    WHEN 'clinica_alemana' THEN 1
    WHEN 'clinica_las_condes' THEN 2
    WHEN 'clinica_santa_maria' THEN 3
    WHEN 'redsalud' THEN 4
    WHEN 'bupa' THEN 5
    WHEN 'integramedica' THEN 6
    WHEN 'uc_christus' THEN 7
    WHEN 'clinica_davila' THEN 8
    WHEN 'cruzverde' THEN 9
    WHEN 'farmacias_ahumada' THEN 10
    WHEN 'salcobrand' THEN 11
    WHEN 'dr_simi' THEN 12
    WHEN 'farmacia_popular' THEN 13
    WHEN 'knop' THEN 14
    WHEN 'galenica' THEN 15
    WHEN 'lider_farmacia' THEN 16
    ELSE 999
  END AS sort_order,
  CASE e.slug
    WHEN 'clinica_alemana' THEN 'alemana.cl'
    WHEN 'clinica_las_condes' THEN 'clc.cl'
    WHEN 'clinica_santa_maria' THEN 'clinicasantamaria.cl'
    WHEN 'redsalud' THEN 'redsalud.cl'
    WHEN 'bupa' THEN 'bupa.cl'
    WHEN 'integramedica' THEN 'integramedica.cl'
    WHEN 'uc_christus' THEN 'redsaluducchristus.cl'
    WHEN 'clinica_davila' THEN 'clinicadavila.cl'
    WHEN 'cruzverde' THEN 'cruzverde.cl'
    WHEN 'farmacias_ahumada' THEN 'farmaciasahumada.cl'
    WHEN 'salcobrand' THEN 'salcobrand.cl'
    WHEN 'dr_simi' THEN 'drsimi.cl'
    WHEN 'farmacia_popular' THEN 'farmaciapopular.cl'
    WHEN 'knop' THEN 'knop.cl'
    WHEN 'galenica' THEN 'galenica.cl'
    WHEN 'lider_farmacia' THEN 'lider.cl'
    ELSE NULL
  END AS brand_domain
FROM public.battles b
JOIN public.entities e ON e.category = 'Salud'
WHERE b.slug = 'guerra_de_la_salud'
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
    WHERE category = 'Salud'
  LOOP

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'salud-clinicas-farmacias', 'recomendacion',
      'Del 0 al 10… ¿qué tan probable es que recomiendes ' || v_ent.name || '?',
      'scale', 1, NULL)
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'salud-clinicas-farmacias', 'q_motivo_principal',
      '¿Por qué eliges ' || v_ent.name || '?',
      'choice', 2, '["Confianza","Calidad","Precio","Cercanía","Rapidez","Cobertura/Convenio","Por costumbre","Otro"]')
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'salud-clinicas-farmacias', 'q_dolor_principal',
      '¿Qué te molesta más de ' || v_ent.name || '?',
      'choice', 3, '["Carísimo","Demoras","Mala atención","Poca disponibilidad","Cobros sorpresa","Trámites","Falta stock (si aplica)","Nada grave"]')
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'salud-clinicas-farmacias', 'q_precio_1_5', 'Precio / valor…', 'scale_1_5', 4, NULL)
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'salud-clinicas-farmacias', 'q_calidad_1_5', 'Calidad del servicio…', 'scale_1_5', 5, NULL)
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'salud-clinicas-farmacias', 'q_rapidez_1_5', 'Rapidez / tiempos…', 'scale_1_5', 6, NULL)
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'salud-clinicas-farmacias', 'q_disponibilidad_1_5', 'Disponibilidad (horas/stock)…', 'scale_1_5', 7, NULL)
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'salud-clinicas-farmacias', 'q_transparencia_1_5', 'Transparencia (cobros/info)…', 'scale_1_5', 8, NULL)
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'salud-clinicas-farmacias', 'q_atencion_1_5', 'Atención humana…', 'scale_1_5', 9, NULL)
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'salud-clinicas-farmacias', 'salud_frecuencia',
      '¿Con qué frecuencia lo usas?',
      'choice', 10, '["Semanal","Mensual","Trimestral","Semestral","Casi nunca"]')
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

  END LOOP;
END $$;

COMMIT;
