BEGIN;

-- 1) CATEGORY
INSERT INTO public.categories (slug, name, emoji)
VALUES ('apps-delivery', 'Delivery (Apps)', '🛵')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  emoji = EXCLUDED.emoji;

-- 2) BATTLE
INSERT INTO public.battles (title, slug, description, category_id, status)
SELECT
  'Guerra del Delivery', 'guerra_del_delivery',
  '¿Quién te llega a tiempo… y sin sorpresas?',
  c.id, 'active'
FROM public.categories c
WHERE c.slug = 'apps-delivery'
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  status = EXCLUDED.status;

-- 3) ENTITIES
INSERT INTO public.entities (type, name, slug, category, metadata, image_url)
VALUES
  ('brand','Uber Eats','uber_eats','Delivery (Apps)','{}',NULL),
  ('brand','PedidosYa','pedidosya','Delivery (Apps)','{}',NULL),
  ('brand','Rappi','rappi','Delivery (Apps)','{}',NULL),
  ('brand','Justo','justo','Delivery (Apps)','{}',NULL),
  ('brand','Cornershop by Uber','cornershop','Delivery (Apps)','{}',NULL),
  ('brand','Mercado Libre Envíos','mercado_envios','Delivery (Apps)','{}',NULL),
  ('brand','DiDi Food','didi_food','Delivery (Apps)','{}',NULL),
  ('brand','iFood','ifood','Delivery (Apps)','{}',NULL),

  ('brand','Jumbo (App/Delivery)','jumbo_delivery','Delivery (Apps)','{}',NULL),
  ('brand','Líder (App/Delivery)','lider_delivery','Delivery (Apps)','{}',NULL),
  ('brand','McDelivery','mcdelivery','Delivery (Apps)','{}',NULL),
  ('brand','Burger King Delivery','bk_delivery','Delivery (Apps)','{}',NULL),
  ('brand','KFC Delivery','kfc_delivery','Delivery (Apps)','{}',NULL),
  ('brand','Domino''s Delivery','dominos_delivery','Delivery (Apps)','{}',NULL),
  ('brand','Starbucks Delivery','starbucks_delivery','Delivery (Apps)','{}',NULL),
  ('brand','Dunkin Delivery','dunkin_delivery','Delivery (Apps)','{}',NULL)
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
    WHEN 'uber_eats' THEN 1
    WHEN 'pedidosya' THEN 2
    WHEN 'rappi' THEN 3
    WHEN 'justo' THEN 4
    WHEN 'cornershop' THEN 5
    WHEN 'mercado_envios' THEN 6
    WHEN 'didi_food' THEN 7
    WHEN 'ifood' THEN 8
    WHEN 'jumbo_delivery' THEN 9
    WHEN 'lider_delivery' THEN 10
    WHEN 'mcdelivery' THEN 11
    WHEN 'bk_delivery' THEN 12
    WHEN 'kfc_delivery' THEN 13
    WHEN 'dominos_delivery' THEN 14
    WHEN 'starbucks_delivery' THEN 15
    WHEN 'dunkin_delivery' THEN 16
    ELSE 999
  END AS sort_order,
  CASE e.slug
    WHEN 'uber_eats' THEN 'ubereats.com'
    WHEN 'pedidosya' THEN 'pedidosya.cl'
    WHEN 'rappi' THEN 'rappi.com'
    WHEN 'justo' THEN 'justo.mx'
    WHEN 'cornershop' THEN 'cornershopapp.com'
    WHEN 'mercado_envios' THEN 'mercadolibre.cl'
    WHEN 'didi_food' THEN 'didi-food.com'
    WHEN 'ifood' THEN 'ifood.com.br'
    WHEN 'jumbo_delivery' THEN 'jumbo.cl'
    WHEN 'lider_delivery' THEN 'lider.cl'
    WHEN 'mcdelivery' THEN 'mcdonalds.cl'
    WHEN 'bk_delivery' THEN 'burgerking.cl'
    WHEN 'kfc_delivery' THEN 'kfc.cl'
    WHEN 'dominos_delivery' THEN 'dominospizza.cl'
    WHEN 'starbucks_delivery' THEN 'starbucks.cl'
    WHEN 'dunkin_delivery' THEN 'dunkin.cl'
    ELSE NULL
  END AS brand_domain
FROM public.battles b
JOIN public.entities e ON e.category = 'Delivery (Apps)'
WHERE b.slug = 'guerra_del_delivery'
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
    WHERE category = 'Delivery (Apps)'
  LOOP

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'apps-delivery', 'recomendacion',
      'Del 0 al 10… ¿qué tan probable es que recomiendes ' || v_ent.name || '?',
      'scale', 1, NULL)
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'apps-delivery', 'q_motivo_principal',
      '¿Por qué usas ' || v_ent.name || '?',
      'choice', 2, '["Rapidez","Promos","Cobertura","Variedad","Precio final","App fácil","Por costumbre","Otro"]')
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'apps-delivery', 'q_dolor_principal',
      '¿Qué te mata de ' || v_ent.name || '?',
      'choice', 3, '["Llega tarde","Cobros sorpresa","Pedido incorrecto","Soporte inexistente","Repartidores","Cancelaciones","Precios inflados","Nada grave"]')
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'apps-delivery', 'q_precio_1_5', 'Precio final (con todo)…', 'scale_1_5', 4, NULL)
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'apps-delivery', 'q_rapidez_1_5', 'Rapidez…', 'scale_1_5', 5, NULL)
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'apps-delivery', 'q_confiabilidad_1_5', 'Confiabilidad (llega bien)…', 'scale_1_5', 6, NULL)
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'apps-delivery', 'q_variedad_1_5', 'Variedad…', 'scale_1_5', 7, NULL)
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'apps-delivery', 'q_app_1_5', 'App / UI…', 'scale_1_5', 8, NULL)
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'apps-delivery', 'q_soporte_1_5', 'Soporte / reclamos…', 'scale_1_5', 9, NULL)
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'apps-delivery', 'q_frecuencia',
      '¿Qué tan seguido lo usas?',
      'choice', 10, '["2+ veces/semana","1 vez/semana","2-3 veces/mes","1 vez/mes","Casi nunca"]')
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

  END LOOP;
END $$;

COMMIT;
