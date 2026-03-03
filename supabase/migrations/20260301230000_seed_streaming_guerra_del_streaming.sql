BEGIN;

-- 1) CATEGORY
INSERT INTO public.categories (slug, name, emoji)
VALUES ('entretenimiento-streaming', 'Streaming', '🎬')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  emoji = EXCLUDED.emoji;

-- 2) BATTLE
INSERT INTO public.battles (title, slug, description, category_id, status)
SELECT
  'Guerra del Streaming', 'guerra_del_streaming',
  '¿Cuál vale de verdad la mensualidad?',
  c.id, 'active'
FROM public.categories c
WHERE c.slug = 'entretenimiento-streaming'
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  status = EXCLUDED.status;

-- 3) ENTITIES
INSERT INTO public.entities (type, name, slug, category, metadata, image_url)
VALUES
  ('brand','Netflix','netflix','Streaming','{}',NULL),
  ('brand','Disney+','disney_plus','Streaming','{}',NULL),
  ('brand','Prime Video','prime_video','Streaming','{}',NULL),
  ('brand','Max','max','Streaming','{}',NULL),
  ('brand','Apple TV+','apple_tv_plus','Streaming','{}',NULL),
  ('brand','Paramount+','paramount_plus','Streaming','{}',NULL),
  ('brand','YouTube Premium','youtube_premium','Streaming','{}',NULL),
  ('brand','Crunchyroll','crunchyroll','Streaming','{}',NULL),

  ('brand','Spotify','spotify','Streaming','{}',NULL),
  ('brand','Apple Music','apple_music','Streaming','{}',NULL),
  ('brand','YouTube Music','youtube_music','Streaming','{}',NULL),
  ('brand','Amazon Music','amazon_music','Streaming','{}',NULL),
  ('brand','Deezer','deezer','Streaming','{}',NULL),
  ('brand','Tidal','tidal','Streaming','{}',NULL),
  ('brand','SoundCloud','soundcloud','Streaming','{}',NULL),
  ('brand','Bandcamp','bandcamp','Streaming','{}',NULL)
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
    WHEN 'netflix' THEN 1
    WHEN 'disney_plus' THEN 2
    WHEN 'prime_video' THEN 3
    WHEN 'max' THEN 4
    WHEN 'apple_tv_plus' THEN 5
    WHEN 'paramount_plus' THEN 6
    WHEN 'youtube_premium' THEN 7
    WHEN 'crunchyroll' THEN 8
    WHEN 'spotify' THEN 9
    WHEN 'apple_music' THEN 10
    WHEN 'youtube_music' THEN 11
    WHEN 'amazon_music' THEN 12
    WHEN 'deezer' THEN 13
    WHEN 'tidal' THEN 14
    WHEN 'soundcloud' THEN 15
    WHEN 'bandcamp' THEN 16
    ELSE 999
  END AS sort_order,
  CASE e.slug
    WHEN 'netflix' THEN 'netflix.com'
    WHEN 'disney_plus' THEN 'disneyplus.com'
    WHEN 'prime_video' THEN 'primevideo.com'
    WHEN 'max' THEN 'max.com'
    WHEN 'apple_tv_plus' THEN 'tv.apple.com'
    WHEN 'paramount_plus' THEN 'paramountplus.com'
    WHEN 'youtube_premium' THEN 'youtube.com'
    WHEN 'crunchyroll' THEN 'crunchyroll.com'
    WHEN 'spotify' THEN 'spotify.com'
    WHEN 'apple_music' THEN 'music.apple.com'
    WHEN 'youtube_music' THEN 'music.youtube.com'
    WHEN 'amazon_music' THEN 'music.amazon.com'
    WHEN 'deezer' THEN 'deezer.com'
    WHEN 'tidal' THEN 'tidal.com'
    WHEN 'soundcloud' THEN 'soundcloud.com'
    WHEN 'bandcamp' THEN 'bandcamp.com'
    ELSE NULL
  END AS brand_domain
FROM public.battles b
JOIN public.entities e ON e.category = 'Streaming'
WHERE b.slug = 'guerra_del_streaming'
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
    WHERE category = 'Streaming'
  LOOP

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'entretenimiento-streaming', 'recomendacion',
      'Del 0 al 10… ¿qué tan probable es que recomiendes ' || v_ent.name || '?',
      'scale', 1, NULL)
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'entretenimiento-streaming', 'q_motivo_principal',
      '¿Por qué pagas ' || v_ent.name || '?',
      'choice', 2, '["Catálogo","Calidad","Recomendaciones","Precio","Exclusivos","Familia","Uso diario","Otro"]')
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'entretenimiento-streaming', 'q_dolor_principal',
      '¿Qué te molesta de ' || v_ent.name || '?',
      'choice', 3, '["Caro","Catálogo pobre","Se cae / lento","UI mala","Recomendaciones malas","Publicidad","Cancelé y volví","Nada grave"]')
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'entretenimiento-streaming', 'q_precio_1_5', 'Precio / valor…', 'scale_1_5', 4, NULL)
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'entretenimiento-streaming', 'q_catalogo_1_5', 'Catálogo…', 'scale_1_5', 5, NULL)
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'entretenimiento-streaming', 'q_calidad_1_5', 'Calidad (audio/video)…', 'scale_1_5', 6, NULL)
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'entretenimiento-streaming', 'q_recos_1_5', 'Recomendaciones…', 'scale_1_5', 7, NULL)
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'entretenimiento-streaming', 'q_ui_1_5', 'App / UI…', 'scale_1_5', 8, NULL)
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'entretenimiento-streaming', 'q_estabilidad_1_5', 'Estabilidad…', 'scale_1_5', 9, NULL)
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'entretenimiento-streaming', 'q_frecuencia',
      '¿Qué tanto lo usas?',
      'choice', 10, '["Todos los días","Varias veces/semana","1 vez/semana","1-2 veces/mes","Casi nunca"]')
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

  END LOOP;
END $$;

COMMIT;
