-- Migration: 20260215_insert_new_battles.sql
-- Description: Insert 6 new battles with options using available images in /brands and /logos

BEGIN;

-- 1. iPhone vs Samsung Galaxy
DO $$
DECLARE
  v_battle_id uuid;
BEGIN
  INSERT INTO battles (title, slug, description, category, status)
  VALUES (
    'iPhone vs Samsung Galaxy',
    'iphone-vs-samsung',
    '¿Team iOS o Team Android? La eterna batalla de los smartphones.',
    'tecnologia',
    'active'
  )
  RETURNING id INTO v_battle_id;

  INSERT INTO battle_options (battle_id, label, image_url, sort_order)
  VALUES 
    (v_battle_id, 'iPhone', '/brands/apple.png', 1),
    (v_battle_id, 'Samsung Galaxy', '/brands/samsung.png', 2);
END $$;

-- 2. Uber vs Cabify
DO $$
DECLARE
  v_battle_id uuid;
BEGIN
  INSERT INTO battles (title, slug, description, category, status)
  VALUES (
    'Uber vs Cabify',
    'uber-vs-cabify',
    '¿Cuál app de transporte prefieres para moverte por la ciudad?',
    'transporte',
    'active'
  )
  RETURNING id INTO v_battle_id;

  INSERT INTO battle_options (battle_id, label, image_url, sort_order)
  VALUES 
    (v_battle_id, 'Uber', '/brands/uber.png', 1),
    (v_battle_id, 'Cabify', '/brands/cabify.png', 2);
END $$;

-- 3. Netflix vs Disney+
DO $$
DECLARE
  v_battle_id uuid;
BEGIN
  INSERT INTO battles (title, slug, description, category, status)
  VALUES (
    'Netflix vs Disney+',
    'netflix-vs-disney',
    '¿Quién gana la guerra del streaming en tu casa?',
    'entretencion',
    'active'
  )
  RETURNING id INTO v_battle_id;

  INSERT INTO battle_options (battle_id, label, image_url, sort_order)
  VALUES 
    (v_battle_id, 'Netflix', '/brands/netflix.png', 1),
    (v_battle_id, 'Disney+', '/logos/disneyplus-logo.png', 2); -- Fallback to logo
END $$;

-- 4. Coca-Cola vs Pepsi
DO $$
DECLARE
  v_battle_id uuid;
BEGIN
  INSERT INTO battles (title, slug, description, category, status)
  VALUES (
    'Coca-Cola vs Pepsi',
    'coca-vs-pepsi',
    'El clásico de las colas. ¿Dulzor o frescura?',
    'bebidas',
    'active'
  )
  RETURNING id INTO v_battle_id;

  INSERT INTO battle_options (battle_id, label, image_url, sort_order)
  VALUES 
    (v_battle_id, 'Coca-Cola', '/logos/cocacola.png', 1), -- Fallback to logo
    (v_battle_id, 'Pepsi', '/images/cards/product.png', 2); -- PLACEHOLDER (No image found)
END $$;

-- 5. Santiago vs Viña del Mar
DO $$
DECLARE
  v_battle_id uuid;
BEGIN
  INSERT INTO battles (title, slug, description, category, status)
  VALUES (
    'Santiago vs Viña del Mar',
    'santiago-vs-vina',
    '¿Vida de capital o brisa marina? ¿Dónde prefieres vivir?',
    'estilo_vida',
    'active'
  )
  RETURNING id INTO v_battle_id;

  INSERT INTO battle_options (battle_id, label, image_url, sort_order)
  VALUES 
    (v_battle_id, 'Santiago', '/images/cards/product.png', 1), -- PLACEHOLDER
    (v_battle_id, 'Viña del Mar', '/images/cards/product.png', 2); -- PLACEHOLDER
END $$;

-- 6. Compra Online vs Tienda Física
DO $$
DECLARE
  v_battle_id uuid;
BEGIN
  INSERT INTO battles (title, slug, description, category, status)
  VALUES (
    'Compra Online vs Tienda Física',
    'online-vs-fisica',
    '¿Comodidad desde casa o la experiencia de ir a comprar?',
    'consumo',
    'active'
  )
  RETURNING id INTO v_battle_id;

  INSERT INTO battle_options (battle_id, label, image_url, sort_order)
  VALUES 
    (v_battle_id, 'Compra Online', '/brands/home.webp', 1),
    (v_battle_id, 'Tienda Física', '/brands/office.jpg', 2);
END $$;

COMMIT;
