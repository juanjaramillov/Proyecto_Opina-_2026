-- ==========================================
-- Seed Professional Content (Bloque 6)
-- Battles, Options and Depth Surveys
-- Corrected: depth_surveys linked to option_id
-- ==========================================

BEGIN;

-- 1. TECNOLOGÍA: iPhone vs Samsung Galaxy
DO $$
DECLARE
  v_battle_id uuid;
  v_iphone_id uuid;
  v_survey_id uuid;
  v_q1_id uuid;
  v_q2_id uuid;
BEGIN
  INSERT INTO battles (title, slug, description, category, status)
  VALUES ('iPhone vs Samsung Galaxy', 'iphone-vs-samsung', '¿Team iOS o Team Android? La eterna batalla de los smartphones.', 'tecnologia', 'active')
  RETURNING id INTO v_battle_id;

  INSERT INTO battle_options (battle_id, label, image_url, sort_order)
  VALUES (v_battle_id, 'iPhone', '/images/options/iphone.png', 1)
  RETURNING id INTO v_iphone_id;

  INSERT INTO battle_options (battle_id, label, image_url, sort_order)
  VALUES (v_battle_id, 'Samsung Galaxy', '/images/options/samsung.png', 2);

  -- Depth Survey for iPhone (linked to option_id)
  INSERT INTO depth_surveys (option_id, title, description)
  VALUES (v_iphone_id, 'Hábitos de Consumo Móvil', 'Queremos saber qué te mueve a elegir tu smartphone.')
  RETURNING id INTO v_survey_id;

  INSERT INTO depth_questions (survey_id, question_text, question_type, position)
  VALUES (v_survey_id, '¿Qué es lo que más valoras en un teléfono?', 'multiple_choice', 1)
  RETURNING id INTO v_q1_id;

  INSERT INTO depth_questions (survey_id, question_text, question_type, position)
  VALUES (v_survey_id, '¿Hace cuánto tiempo usas tu marca actual?', 'multiple_choice', 2)
  RETURNING id INTO v_q2_id;
END $$;

-- 2. TRANSPORTE: Uber vs Cabify
DO $$
DECLARE
  v_battle_id uuid;
BEGIN
  INSERT INTO battles (title, slug, description, category, status)
  VALUES ('Uber vs Cabify', 'uber-vs-cabify', '¿Cuál app de transporte prefieres para moverte por la ciudad?', 'transporte', 'active')
  RETURNING id INTO v_battle_id;

  INSERT INTO battle_options (battle_id, label, image_url, sort_order)
  VALUES 
    (v_battle_id, 'Uber', '/images/options/uber.png', 1),
    (v_battle_id, 'Cabify', '/images/options/cabify.png', 2);
END $$;

-- 3. STREAMING: Netflix vs Disney+
DO $$
DECLARE
  v_battle_id uuid;
BEGIN
  INSERT INTO battles (title, slug, description, category, status)
  VALUES ('Netflix vs Disney+', 'netflix-vs-disney', '¿Quién gana la guerra del streaming en tu casa?', 'entretencion', 'active')
  RETURNING id INTO v_battle_id;

  INSERT INTO battle_options (battle_id, label, image_url, sort_order)
  VALUES 
    (v_battle_id, 'Netflix', '/images/options/netflix.png', 1),
    (v_battle_id, 'Disney+', '/images/options/disneyplus.svg', 2);
END $$;

-- 4. BEBIDAS: Coca-Cola vs Pepsi
DO $$
DECLARE
  v_battle_id uuid;
BEGIN
  INSERT INTO battles (title, slug, description, category, status)
  VALUES ('Coca-Cola vs Pepsi', 'coca-vs-pepsi', 'El clásico de las colas. ¿Dulzor o frescura?', 'bebidas', 'active')
  RETURNING id INTO v_battle_id;

  INSERT INTO battle_options (battle_id, label, image_url, sort_order)
  VALUES 
    (v_battle_id, 'Coca-Cola', '/images/options/cocacola.png', 1),
    (v_battle_id, 'Pepsi', '/images/options/pepsi.png', 2);
END $$;

-- 5. MÚSICA: Spotify vs Apple Music
DO $$
DECLARE
  v_battle_id uuid;
BEGIN
  INSERT INTO battles (title, slug, description, category, status)
  VALUES ('Spotify vs Apple Music', 'spotify-vs-apple-music', '¿Dónde vive tu playlist favorita?', 'entretencion', 'active')
  RETURNING id INTO v_battle_id;

  INSERT INTO battle_options (battle_id, label, image_url, sort_order)
  VALUES 
    (v_battle_id, 'Spotify', '/images/options/spotify.png', 1),
    (v_battle_id, 'Apple Music', '/images/options/applemusic.png', 2);
END $$;

-- 6. MODA: Nike vs Adidas
DO $$
DECLARE
  v_battle_id uuid;
BEGIN
  INSERT INTO battles (title, slug, description, category, status)
  VALUES ('Nike vs Adidas', 'nike-vs-adidas', '¿Just Do It o Impossible is Nothing?', 'moda', 'active')
  RETURNING id INTO v_battle_id;

  INSERT INTO battle_options (battle_id, label, image_url, sort_order)
  VALUES 
    (v_battle_id, 'Nike', '/images/options/nike.png', 1),
    (v_battle_id, 'Adidas', '/images/options/adidas.png', 2);
END $$;

-- 7. BANCOS: Banco de Chile vs Santander
DO $$
DECLARE
  v_battle_id uuid;
BEGIN
  INSERT INTO battles (title, slug, description, category, status)
  VALUES ('Banco de Chile vs Santander', 'bchile-vs-santander', 'La banca tradicional frente a frente.', 'finanzas', 'active')
  RETURNING id INTO v_battle_id;

  INSERT INTO battle_options (battle_id, label, image_url, sort_order)
  VALUES 
    (v_battle_id, 'Banco de Chile', '/images/options/bancochile.png', 1),
    (v_battle_id, 'Santander', '/images/options/santander.png', 2);
END $$;

COMMIT;
