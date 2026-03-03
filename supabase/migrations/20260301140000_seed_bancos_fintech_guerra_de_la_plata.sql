BEGIN;

-- =========================================================
-- 1) CATEGORY
-- =========================================================
INSERT INTO public.categories (slug, name, emoji)
VALUES ('finanzas-bancos-fintech', 'Bancos y Fintech', '💳')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  emoji = EXCLUDED.emoji;

-- =========================================================
-- 2) BATTLE (1 master battle)
-- =========================================================
INSERT INTO public.battles (title, slug, description, category_id, status)
SELECT
  'Guerra de la Plata', 'guerra_de_la_plata',
  '¿A quién le confías tu plata sin apretar los dientes?',
  c.id, 'active'
FROM public.categories c
WHERE c.slug = 'finanzas-bancos-fintech'
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  status = EXCLUDED.status;

-- =========================================================
-- 3) ENTITIES (brands)
-- =========================================================
INSERT INTO public.entities (type, name, slug, category, metadata, image_url)
VALUES
  ('brand','Banco de Chile','banco_de_chile','Bancos y Fintech','{}',NULL),
  ('brand','Santander','santander','Bancos y Fintech','{}',NULL),
  ('brand','BCI','bci','Bancos y Fintech','{}',NULL),
  ('brand','BancoEstado','bancoestado','Bancos y Fintech','{}',NULL),
  ('brand','Scotiabank','scotiabank','Bancos y Fintech','{}',NULL),
  ('brand','Itaú','itau','Bancos y Fintech','{}',NULL),
  ('brand','MACH','mach','Bancos y Fintech','{}',NULL),
  ('brand','Tenpo','tenpo','Bancos y Fintech','{}',NULL),
  ('brand','Mercado Pago','mercado_pago','Bancos y Fintech','{}',NULL),
  ('brand','Fpay','fpay','Bancos y Fintech','{}',NULL),
  ('brand','Banco Ripley','banco_ripley','Bancos y Fintech','{}',NULL),
  ('brand','CMR Falabella','cmr_falabella','Bancos y Fintech','{}',NULL),
  ('brand','Coopeuch','coopeuch','Bancos y Fintech','{}',NULL),
  ('brand','Banco Internacional','banco_internacional','Bancos y Fintech','{}',NULL),
  ('brand','Banco Security','banco_security','Bancos y Fintech','{}',NULL),
  ('brand','Consorcio','consorcio','Bancos y Fintech','{}',NULL)
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
    WHEN 'banco_de_chile' THEN 1
    WHEN 'santander' THEN 2
    WHEN 'bci' THEN 3
    WHEN 'bancoestado' THEN 4
    WHEN 'scotiabank' THEN 5
    WHEN 'itau' THEN 6
    WHEN 'mach' THEN 7
    WHEN 'tenpo' THEN 8
    WHEN 'mercado_pago' THEN 9
    WHEN 'fpay' THEN 10
    WHEN 'banco_ripley' THEN 11
    WHEN 'cmr_falabella' THEN 12
    WHEN 'coopeuch' THEN 13
    WHEN 'banco_internacional' THEN 14
    WHEN 'banco_security' THEN 15
    WHEN 'consorcio' THEN 16
    ELSE 999
  END AS sort_order,
  CASE e.slug
    WHEN 'banco_de_chile' THEN 'bancochile.cl'
    WHEN 'santander' THEN 'santander.cl'
    WHEN 'bci' THEN 'bci.cl'
    WHEN 'bancoestado' THEN 'bancoestado.cl'
    WHEN 'scotiabank' THEN 'scotiabank.cl'
    WHEN 'itau' THEN 'itau.cl'
    WHEN 'mach' THEN 'mach.cl'
    WHEN 'tenpo' THEN 'tenpo.cl'
    WHEN 'mercado_pago' THEN 'mercadopago.cl'
    WHEN 'fpay' THEN 'fpay.cl'
    WHEN 'banco_ripley' THEN 'bancoripley.cl'
    WHEN 'cmr_falabella' THEN 'cmr.cl'
    WHEN 'coopeuch' THEN 'coopeuch.cl'
    WHEN 'banco_internacional' THEN 'internacional.cl'
    WHEN 'banco_security' THEN 'bancosecurity.cl'
    WHEN 'consorcio' THEN 'consorcio.cl'
    ELSE NULL
  END AS brand_domain
FROM public.battles b
JOIN public.entities e ON e.category = 'Bancos y Fintech'
WHERE b.slug = 'guerra_de_la_plata'
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
    WHERE category = 'Bancos y Fintech'
  LOOP

    -- 1) NPS 0-10 (renderer actual: type='scale' + key='recomendacion')
    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'finanzas-bancos-fintech', 'recomendacion',
      'Del 0 al 10… ¿qué tan probable es que recomiendes ' || v_ent.name || '?',
      'scale', 1, NULL)
    ON CONFLICT (entity_id, question_key) DO UPDATE SET
      question_text = EXCLUDED.question_text, question_type = EXCLUDED.question_type, position = EXCLUDED.position, options = EXCLUDED.options;

    -- 2) Motivo principal
    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'finanzas-bancos-fintech', 'q_motivo_principal',
      '¿Por qué sigues con ' || v_ent.name || '?',
      'choice', 2, '["Confianza","App","Beneficios","Cercanía","Crédito / cupos","Costo","Me lo recomendaron","Por costumbre","Otro"]')
    ON CONFLICT (entity_id, question_key) DO UPDATE SET
      question_text = EXCLUDED.question_text, question_type = EXCLUDED.question_type, position = EXCLUDED.position, options = EXCLUDED.options;

    -- 3) Dolor principal
    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'finanzas-bancos-fintech', 'q_dolor_principal',
      '¿Qué te desespera de ' || v_ent.name || '?',
      'choice', 3, '["Comisiones","App falla","Bloqueos","Atención mala","Fraudes / seguridad","Lento","Letra chica","Cupos bajos","Nada grave"]')
    ON CONFLICT (entity_id, question_key) DO UPDATE SET
      question_text = EXCLUDED.question_text, question_type = EXCLUDED.question_type, position = EXCLUDED.position, options = EXCLUDED.options;

    -- 4) Confianza 1-5
    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'finanzas-bancos-fintech', 'q_confianza_1_5',
      'Confianza en ' || v_ent.name || '…',
      'scale_1_5', 4, NULL)
    ON CONFLICT (entity_id, question_key) DO UPDATE SET
      question_text = EXCLUDED.question_text, question_type = EXCLUDED.question_type, position = EXCLUDED.position, options = EXCLUDED.options;

    -- 5) App 1-5
    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'finanzas-bancos-fintech', 'q_app_1_5',
      'La app de ' || v_ent.name || ' es…',
      'scale_1_5', 5, NULL)
    ON CONFLICT (entity_id, question_key) DO UPDATE SET
      question_text = EXCLUDED.question_text, question_type = EXCLUDED.question_type, position = EXCLUDED.position, options = EXCLUDED.options;

    -- 6) Costos 1-5
    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'finanzas-bancos-fintech', 'q_costos_1_5',
      'Comisiones / costos…',
      'scale_1_5', 6, NULL)
    ON CONFLICT (entity_id, question_key) DO UPDATE SET
      question_text = EXCLUDED.question_text, question_type = EXCLUDED.question_type, position = EXCLUDED.position, options = EXCLUDED.options;

    -- 7) Seguridad 1-5
    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'finanzas-bancos-fintech', 'q_seguridad_1_5',
      'Seguridad (fraudes/prevención)…',
      'scale_1_5', 7, NULL)
    ON CONFLICT (entity_id, question_key) DO UPDATE SET
      question_text = EXCLUDED.question_text, question_type = EXCLUDED.question_type, position = EXCLUDED.position, options = EXCLUDED.options;

    -- 8) Atención 1-5
    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'finanzas-bancos-fintech', 'q_atencion_1_5',
      'Atención (cuando la necesitas)…',
      'scale_1_5', 8, NULL)
    ON CONFLICT (entity_id, question_key) DO UPDATE SET
      question_text = EXCLUDED.question_text, question_type = EXCLUDED.question_type, position = EXCLUDED.position, options = EXCLUDED.options;

    -- 9) Beneficios (choice)
    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'finanzas-bancos-fintech', 'q_beneficios_choice',
      'Lo mejor que tiene…',
      'choice', 9, '["Promos / descuentos","Cupos / crédito","App","Atención","Seguridad","Costo","Nada destacable"]')
    ON CONFLICT (entity_id, question_key) DO UPDATE SET
      question_text = EXCLUDED.question_text, question_type = EXCLUDED.question_type, position = EXCLUDED.position, options = EXCLUDED.options;

    -- 10) Frecuencia
    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'finanzas-bancos-fintech', 'q_uso_frecuencia',
      '¿Qué tanto lo usas?',
      'choice', 10, '["Todos los días","Varias veces/semana","1 vez/semana","1-2 veces/mes","Casi nunca"]')
    ON CONFLICT (entity_id, question_key) DO UPDATE SET
      question_text = EXCLUDED.question_text, question_type = EXCLUDED.question_type, position = EXCLUDED.position, options = EXCLUDED.options;

  END LOOP;
END $$;

COMMIT;
