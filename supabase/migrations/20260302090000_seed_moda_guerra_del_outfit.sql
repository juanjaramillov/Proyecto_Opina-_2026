BEGIN;

-- 1) CATEGORY
INSERT INTO public.categories (slug, name, emoji)
VALUES ('retail-ropa-moda', 'Ropa & Moda', '👟')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  emoji = EXCLUDED.emoji;

-- 2) BATTLE
INSERT INTO public.battles (title, slug, description, category_id, status)
SELECT
  'Guerra del Outfit', 'guerra_del_outfit',
  '¿Qué marca te salva el look sin arruinarte?',
  c.id, 'active'
FROM public.categories c
WHERE c.slug = 'retail-ropa-moda'
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  status = EXCLUDED.status;

-- 3) ENTITIES
INSERT INTO public.entities (type, name, slug, category, metadata, image_url)
VALUES
  ('brand','Adidas','adidas','Ropa & Moda','{}',NULL),
  ('brand','Nike','nike','Ropa & Moda','{}',NULL),
  ('brand','Puma','puma','Ropa & Moda','{}',NULL),
  ('brand','Reebok','reebok','Ropa & Moda','{}',NULL),
  ('brand','Under Armour','under_armour','Ropa & Moda','{}',NULL),
  ('brand','New Balance','new_balance','Ropa & Moda','{}',NULL),
  ('brand','Skechers','skechers','Ropa & Moda','{}',NULL),
  ('brand','Converse','converse','Ropa & Moda','{}',NULL),
  ('brand','Zara','zara','Ropa & Moda','{}',NULL),
  ('brand','H&M','hm','Ropa & Moda','{}',NULL),
  ('brand','Uniqlo','uniqlo','Ropa & Moda','{}',NULL),
  ('brand','Shein','shein','Ropa & Moda','{}',NULL),
  ('brand','Gap','gap','Ropa & Moda','{}',NULL),
  ('brand','Levi''s','levis','Ropa & Moda','{}',NULL),
  ('brand','Forever 21','forever21','Ropa & Moda','{}',NULL),
  ('brand','Pull&Bear','pullandbear','Ropa & Moda','{}',NULL)
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
    WHEN 'adidas' THEN 1
    WHEN 'nike' THEN 2
    WHEN 'puma' THEN 3
    WHEN 'reebok' THEN 4
    WHEN 'under_armour' THEN 5
    WHEN 'new_balance' THEN 6
    WHEN 'skechers' THEN 7
    WHEN 'converse' THEN 8
    WHEN 'zara' THEN 9
    WHEN 'hm' THEN 10
    WHEN 'uniqlo' THEN 11
    WHEN 'shein' THEN 12
    WHEN 'gap' THEN 13
    WHEN 'levis' THEN 14
    WHEN 'forever21' THEN 15
    WHEN 'pullandbear' THEN 16
    ELSE 999
  END AS sort_order,
  CASE e.slug
    WHEN 'adidas' THEN 'adidas.com'
    WHEN 'nike' THEN 'nike.com'
    WHEN 'puma' THEN 'puma.com'
    WHEN 'reebok' THEN 'reebok.com'
    WHEN 'under_armour' THEN 'underarmour.com'
    WHEN 'new_balance' THEN 'newbalance.com'
    WHEN 'skechers' THEN 'skechers.com'
    WHEN 'converse' THEN 'converse.com'
    WHEN 'zara' THEN 'zara.com'
    WHEN 'hm' THEN 'hm.com'
    WHEN 'uniqlo' THEN 'uniqlo.com'
    WHEN 'shein' THEN 'shein.com'
    WHEN 'gap' THEN 'gap.com'
    WHEN 'levis' THEN 'levis.com'
    WHEN 'forever21' THEN 'forever21.com'
    WHEN 'pullandbear' THEN 'pullandbear.com'
    ELSE NULL
  END AS brand_domain
FROM public.battles b
JOIN public.entities e ON e.category = 'Ropa & Moda'
WHERE b.slug = 'guerra_del_outfit'
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
    WHERE category = 'Ropa & Moda'
  LOOP

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'retail-ropa-moda', 'recomendacion',
      'Del 0 al 10… ¿qué tan probable es que recomiendes ' || v_ent.name || '?',
      'scale', 1, NULL)
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'retail-ropa-moda', 'q_motivo_principal',
      '¿Por qué compras ' || v_ent.name || '?',
      'choice', 2, '["Diseño","Calidad","Precio","Status","Comodidad","Variedad","Promos","Otro"]')
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'retail-ropa-moda', 'q_dolor_principal',
      '¿Qué te decepciona de ' || v_ent.name || '?',
      'choice', 3, '["Carísimo","Dura poco","Calce malo","Atención","Stock","Tallas inconsistentes","Se ve distinto en persona","Nada grave"]')
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'retail-ropa-moda', 'q_precio_1_5', 'Precio / valor…', 'scale_1_5', 4, NULL)
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'retail-ropa-moda', 'q_calidad_1_5', 'Calidad / duración…', 'scale_1_5', 5, NULL)
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'retail-ropa-moda', 'q_diseno_1_5', 'Diseño…', 'scale_1_5', 6, NULL)
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'retail-ropa-moda', 'q_comodidad_1_5', 'Comodidad…', 'scale_1_5', 7, NULL)
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'retail-ropa-moda', 'q_variedad_1_5', 'Variedad…', 'scale_1_5', 8, NULL)
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'retail-ropa-moda', 'q_atencion_1_5', 'Atención / post-venta…', 'scale_1_5', 9, NULL)
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'retail-ropa-moda', 'q_frecuencia',
      '¿Qué tanto la usas/compras?',
      'choice', 10, '["Semanal","Mensual","Trimestral","Semestral","Casi nunca"]')
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

  END LOOP;
END $$;

COMMIT;
