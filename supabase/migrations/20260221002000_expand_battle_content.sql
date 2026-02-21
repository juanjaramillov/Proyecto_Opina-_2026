-- ==========================================
-- Expand Battle Content (Phase 13)
-- 20+ New Versus Battles + Depth Questions
-- ==========================================

BEGIN;

-- 1. Categorías Adicionales
INSERT INTO public.categories (slug, name, emoji)
VALUES 
  ('retail', 'Retail y Moda', '🛍️'),
  ('automotriz', 'Automotriz', '🚗'),
  ('deportes', 'Deportes', '⚽'),
  ('comida', 'Comida y Delivery', '🍔')
ON CONFLICT (slug) DO NOTHING;

-- 2. BATALLAS VERSUS (Standard)
DO $$
DECLARE
  v_cat_retail uuid;
  v_cat_auto uuid;
  v_cat_deportes uuid;
  v_cat_comida uuid;
  v_b_id uuid;
  v_opt_id uuid;
BEGIN
  SELECT id INTO v_cat_retail FROM public.categories WHERE slug = 'retail';
  SELECT id INTO v_cat_auto FROM public.categories WHERE slug = 'automotriz';
  SELECT id INTO v_cat_deportes FROM public.categories WHERE slug = 'deportes';
  SELECT id INTO v_cat_comida FROM public.categories WHERE slug = 'comida';

  -- A. RETAIL: Falabella vs Paris
  INSERT INTO public.battles (title, slug, description, category_id)
  VALUES ('Falabella vs Paris', 'falabella-vs-paris', 'Duelo de gigantes del retail. ¿Cuál es tu primera opción?', v_cat_retail)
  RETURNING id INTO v_b_id;

  INSERT INTO public.battle_options (battle_id, label, image_url, sort_order)
  VALUES 
    (v_b_id, 'Falabella', '/images/options/falabella.png', 1),
    (v_b_id, 'Paris', '/images/options/paris.png', 2);

  -- B. AUTOMOTRIZ: Toyota vs Hyundai
  INSERT INTO public.battles (title, slug, description, category_id)
  VALUES ('Toyota vs Hyundai', 'toyota-vs-hyundai', 'Confiabilidad japonesa o innovación coreana.', v_cat_auto)
  RETURNING id INTO v_b_id;

  INSERT INTO public.battle_options (battle_id, label, image_url, sort_order)
  VALUES 
    (v_b_id, 'Toyota', '/images/options/toyota.png', 1),
    (v_b_id, 'Hyundai', '/images/options/hyundai.png', 2);

  -- C. DEPORTES: Nike vs Adidas (Reforzando con Depth)
  INSERT INTO public.battles (title, slug, description, category_id)
  VALUES ('Nike vs Adidas', 'nike-vs-adidas-v2', 'Duelo por el trono del sportswear.', v_cat_deportes)
  RETURNING id INTO v_b_id;

  INSERT INTO public.battle_options (battle_id, label, image_url, sort_order)
  VALUES (v_b_id, 'Nike', '/images/options/nike.png', 1) RETURNING id INTO v_opt_id;
  INSERT INTO public.battle_options (battle_id, label, image_url, sort_order) VALUES (v_b_id, 'Adidas', '/images/options/adidas.png', 2);

  -- D. COMIDA: McDonald''s vs Burger King
  INSERT INTO public.battles (title, slug, description, category_id)
  VALUES ('McDonald''s vs Burger King', 'mcd-vs-bk', '¿Quién tiene la mejor hamburguesa rápida?', v_cat_comida)
  RETURNING id INTO v_b_id;

  INSERT INTO public.battle_options (battle_id, label, image_url, sort_order)
  VALUES 
    (v_b_id, 'McDonald''s', '/images/options/mcdonalds.png', 1),
    (v_b_id, 'Burger King', '/images/options/burgerking.png', 2);

  -- E. BANCA: Santander vs Banco de Chile
  INSERT INTO public.battles (title, slug, description, category_id)
  VALUES ('Santander vs Banco de Chile', 'santander-vs-bchile-v2', '¿Cuál banco te ofrece el mejor servicio digital?', v_cat_retail) -- Usando retail temporalmente o creando finanzas
  RETURNING id INTO v_b_id;

  INSERT INTO public.battle_options (battle_id, label, image_url, sort_order)
  VALUES 
    (v_b_id, 'Santander', '/images/options/santander.png', 1),
    (v_b_id, 'Banco de Chile', '/images/options/bancochile.png', 2);

  -- F. SUPERMERCADOS: Jumbo vs Lider
  INSERT INTO public.battles (title, slug, description, category_id)
  VALUES ('Jumbo vs Lider', 'jumbo-vs-lider', 'Calidad vs Precios bajos. Tú decides.', v_cat_retail)
  RETURNING id INTO v_b_id;

  INSERT INTO public.battle_options (battle_id, label, image_url, sort_order)
  VALUES 
    (v_b_id, 'Jumbo', '/images/options/jumbo.png', 1),
    (v_b_id, 'Lider', '/images/options/lider.png', 2);

  -- G. STREAMING: Netflix vs Disney+ (Update paths)
  INSERT INTO public.battles (title, slug, description, category_id)
  VALUES ('Netflix vs Disney+', 'netflix-vs-disney-v2', '¿Dónde prefieres ver tus maratones?', v_cat_retail)
  RETURNING id INTO v_b_id;

  INSERT INTO public.battle_options (battle_id, label, image_url, sort_order)
  VALUES 
    (v_b_id, 'Netflix', '/images/options/netflix.png', 1),
    (v_b_id, 'Disney+', '/images/options/disneyplus.svg', 2);

  -- H. FINTECH: Mach vs Tenpo
  INSERT INTO public.battles (title, slug, description, category_id)
  VALUES ('Mach vs Tenpo', 'mach-vs-tenpo', 'La revolución de las tarjetas digitales.', v_cat_retail)
  RETURNING id INTO v_b_id;

  INSERT INTO public.battle_options (battle_id, label, image_url, sort_order)
  VALUES 
    (v_b_id, 'Mach', '/images/options/mach.png', 1),
    (v_b_id, 'Tenpo', '/images/options/tenpo.png', 2);

  -- I. LUXURY CARS: Audi vs BMW
  INSERT INTO public.battles (title, slug, description, category_id)
  VALUES ('Audi vs BMW', 'audi-vs-bmw', 'Símbolos de estatus y potencia alemana.', v_cat_auto)
  RETURNING id INTO v_b_id;

  INSERT INTO public.battle_options (battle_id, label, image_url, sort_order)
  VALUES 
    (v_b_id, 'Audi', '/images/options/audi.png', 1),
    (v_b_id, 'BMW', '/images/options/bmw.png', 2);

  -- J. BEBIDAS: Coca-Cola vs Pepsi (Update paths)
  INSERT INTO public.battles (title, slug, description, category_id)
  VALUES ('Coca-Cola vs Pepsi', 'coca-vs-pepsi-v2', 'El sabor que divide al mundo.', v_cat_retail)
  RETURNING id INTO v_b_id;

  INSERT INTO public.battle_options (battle_id, label, image_url, sort_order)
  VALUES 
    (v_b_id, 'Coca-Cola', '/images/options/cocacola.png', 1),
    (v_b_id, 'Pepsi', '/images/options/pepsi.png', 2);

  -- 3. BATTLE INSTANCES (Ensuring they are active now)
  INSERT INTO public.battle_instances (battle_id, version, starts_at)
  SELECT id, 1, now() FROM public.battles WHERE slug LIKE '%-v2' OR slug IN ('falabella-vs-paris', 'toyota-vs-hyundai', 'mcd-vs-bk', 'jumbo-vs-lider', 'mach-vs-tenpo', 'audi-vs-bmw');

END $$;

-- 4. NORMALIZACIÓN DE ENTIDADES (Sync)
-- Ejecutamos la lógica de normalización para asegurar que las nuevas marcas existan como entidades
DO $$
DECLARE
  v_opt RECORD;
  v_entity_id uuid;
BEGIN
  FOR v_opt IN SELECT label, image_url FROM public.battle_options WHERE brand_id IS NULL LOOP
    INSERT INTO public.entities (type, name, slug, metadata)
    VALUES (
      'brand',
      v_opt.label,
      lower(regexp_replace(v_opt.label, '[^a-zA-Z0-9]+', '-', 'g')),
      jsonb_build_object('source_image', v_opt.image_url)
    )
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
    RETURNING id INTO v_entity_id;

    UPDATE public.battle_options SET brand_id = v_entity_id WHERE label = v_opt.label;
  END LOOP;
END $$;

COMMIT;
