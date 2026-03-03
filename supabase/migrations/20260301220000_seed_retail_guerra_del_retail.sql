BEGIN;

-- 1) CATEGORY
INSERT INTO public.categories (slug, name, emoji)
VALUES ('retail-tiendas-marketplaces', 'Retail', '🛍️')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  emoji = EXCLUDED.emoji;

-- 2) BATTLE
INSERT INTO public.battles (title, slug, description, category_id, status)
SELECT
  'Guerra del Retail', 'guerra_del_retail',
  '¿Dónde compras sin terminar reclamando?',
  c.id, 'active'
FROM public.categories c
WHERE c.slug = 'retail-tiendas-marketplaces'
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  status = EXCLUDED.status;

-- 3) ENTITIES
INSERT INTO public.entities (type, name, slug, category, metadata, image_url)
VALUES
  ('brand','Falabella','falabella','Retail','{}',NULL),
  ('brand','Paris','paris','Retail','{}',NULL),
  ('brand','Ripley','ripley','Retail','{}',NULL),
  ('brand','Hites','hites','Retail','{}',NULL),
  ('brand','La Polar','la_polar','Retail','{}',NULL),
  ('brand','ABC','abc','Retail','{}',NULL),
  ('brand','Lider.cl','lider_cl','Retail','{}',NULL),
  ('brand','Jumbo.cl','jumbo_cl','Retail','{}',NULL),

  ('brand','Mercado Libre','mercado_libre','Retail','{}',NULL),
  ('brand','Linio','linio','Retail','{}',NULL),
  ('brand','AliExpress','aliexpress','Retail','{}',NULL),
  ('brand','Amazon','amazon','Retail','{}',NULL),
  ('brand','Shein','shein','Retail','{}',NULL),
  ('brand','Temu','temu','Retail','{}',NULL),
  ('brand','Nike','nike','Retail','{}',NULL),
  ('brand','Adidas','adidas','Retail','{}',NULL)
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
    WHEN 'falabella' THEN 1
    WHEN 'paris' THEN 2
    WHEN 'ripley' THEN 3
    WHEN 'hites' THEN 4
    WHEN 'la_polar' THEN 5
    WHEN 'abc' THEN 6
    WHEN 'lider_cl' THEN 7
    WHEN 'jumbo_cl' THEN 8
    WHEN 'mercado_libre' THEN 9
    WHEN 'linio' THEN 10
    WHEN 'aliexpress' THEN 11
    WHEN 'amazon' THEN 12
    WHEN 'shein' THEN 13
    WHEN 'temu' THEN 14
    WHEN 'nike' THEN 15
    WHEN 'adidas' THEN 16
    ELSE 999
  END AS sort_order,
  CASE e.slug
    WHEN 'falabella' THEN 'falabella.com'
    WHEN 'paris' THEN 'paris.cl'
    WHEN 'ripley' THEN 'ripley.cl'
    WHEN 'hites' THEN 'hites.com'
    WHEN 'la_polar' THEN 'lapolar.cl'
    WHEN 'abc' THEN 'abc.cl'
    WHEN 'lider_cl' THEN 'lider.cl'
    WHEN 'jumbo_cl' THEN 'jumbo.cl'
    WHEN 'mercado_libre' THEN 'mercadolibre.cl'
    WHEN 'linio' THEN 'linio.cl'
    WHEN 'aliexpress' THEN 'aliexpress.com'
    WHEN 'amazon' THEN 'amazon.com'
    WHEN 'shein' THEN 'shein.com'
    WHEN 'temu' THEN 'temu.com'
    WHEN 'nike' THEN 'nike.com'
    WHEN 'adidas' THEN 'adidas.com'
    ELSE NULL
  END AS brand_domain
FROM public.battles b
JOIN public.entities e ON e.category = 'Retail'
WHERE b.slug = 'guerra_del_retail'
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
    WHERE category = 'Retail'
  LOOP

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'retail-tiendas-marketplaces', 'recomendacion',
      'Del 0 al 10… ¿qué tan probable es que recomiendes ' || v_ent.name || '?',
      'scale', 1, NULL)
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'retail-tiendas-marketplaces', 'q_motivo_principal',
      '¿Por qué compras en ' || v_ent.name || '?',
      'choice', 2, '["Precio","Variedad","Despacho","Promos","Facilidad de compra","Devolución fácil","Marca","Otro"]')
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'retail-tiendas-marketplaces', 'q_dolor_principal',
      '¿Qué te hace reclamar en ' || v_ent.name || '?',
      'choice', 3, '["Despacho malo","Producto distinto","Devolución imposible","Atención mala","Precio final sorpresa","Stock falso","Calidad mala","Nada grave"]')
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'retail-tiendas-marketplaces', 'q_precio_1_5', 'Precio / valor…', 'scale_1_5', 4, NULL)
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'retail-tiendas-marketplaces', 'q_variedad_1_5', 'Variedad…', 'scale_1_5', 5, NULL)
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'retail-tiendas-marketplaces', 'q_despacho_1_5', 'Despacho / tiempos…', 'scale_1_5', 6, NULL)
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'retail-tiendas-marketplaces', 'q_devoluciones_1_5', 'Devoluciones…', 'scale_1_5', 7, NULL)
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'retail-tiendas-marketplaces', 'q_transparencia_1_5', 'Transparencia (precio/letra chica)…', 'scale_1_5', 8, NULL)
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'retail-tiendas-marketplaces', 'q_atencion_1_5', 'Atención post-venta…', 'scale_1_5', 9, NULL)
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'retail-tiendas-marketplaces', 'q_frecuencia_compra',
      '¿Cada cuánto compras ahí?',
      'choice', 10, '["Semanal","Mensual","Trimestral","Semestral","Casi nunca"]')
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

  END LOOP;
END $$;

COMMIT;
