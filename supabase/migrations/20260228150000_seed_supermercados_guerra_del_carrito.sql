begin;

-- =========================================================
-- 1) CATEGORY
-- =========================================================
insert into public.categories (slug, name, emoji)
values
  ('supermercados', 'Supermercados', '🛒')
on conflict (slug) do update set
  name = excluded.name,
  emoji = excluded.emoji;

-- =========================================================
-- 2) BATTLE
-- =========================================================
insert into public.battles (title, slug, description, category_id, status)
select
  'Guerra del Carrito', 'guerra_del_carrito',
  '¿Dónde te rinde más el carrito… sin magia negra?',
  c.id, 'active'
from public.categories c
where c.slug = 'supermercados'
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  status = excluded.status;

-- =========================================================
-- 3) ENTITIES
-- =========================================================
insert into public.entities (type, name, slug, category, metadata, image_url)
values
  ('brand', 'Líder', 'lider', 'Supermercados', '{}', null),
  ('brand', 'Jumbo', 'jumbo', 'Supermercados', '{}', null),
  ('brand', 'Santa Isabel', 'santa_isabel', 'Supermercados', '{}', null),
  ('brand', 'Unimarc', 'unimarc', 'Supermercados', '{}', null),
  ('brand', 'Tottus', 'tottus', 'Supermercados', '{}', null),
  ('brand', 'aCuenta', 'acuenta', 'Supermercados', '{}', null),
  ('brand', 'Mayorista 10', 'mayorista10', 'Supermercados', '{}', null),
  ('brand', 'Alvi', 'alvi', 'Supermercados', '{}', null)
on conflict (slug) do update set
  name = excluded.name,
  category = excluded.category,
  metadata = excluded.metadata,
  image_url = excluded.image_url;

-- =========================================================
-- 4) BATTLE OPTIONS
-- =========================================================
insert into public.battle_options (battle_id, label, brand_id, image_url, sort_order)
select
  b.id,
  e.name,
  e.id,
  e.image_url,
  case e.slug
    when 'lider' then 1
    when 'jumbo' then 2
    when 'santa_isabel' then 3
    when 'unimarc' then 4
    when 'tottus' then 5
    when 'acuenta' then 6
    when 'mayorista10' then 7
    when 'alvi' then 8
  end as sort_order
from public.battles b
join public.entities e on e.category = 'Supermercados'
where b.slug = 'guerra_del_carrito'
on conflict (battle_id, label) do update set
  brand_id = excluded.brand_id,
  image_url = excluded.image_url,
  sort_order = excluded.sort_order;

-- =========================================================
-- 5) DEPTH DEFINITIONS
-- =========================================================
DO $$
DECLARE
  v_ent RECORD;
BEGIN
  -- Iterar sobre todos los supermercados
  FOR v_ent IN SELECT id, name, category, slug FROM public.entities WHERE category = 'Supermercados' LOOP
    
    -- Pregunta 1: nps_0_10
    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, v_ent.category, 'q_nps_0_10', 'Del 0 al 10… ¿qué tan probable es que recomiendes ' || v_ent.name || '?', 'nps_0_10', 1, null)
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text = excluded.question_text, question_type = excluded.question_type, position = excluded.position, options = excluded.options;

    -- Pregunta 2: motivo_principal
    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, v_ent.category, 'q_motivo_principal', '¿Por qué vuelves a ' || v_ent.name || '?', 'choice', 2, '["Precio","Variedad","Promos","Cercanía","Rapidez (filas)","Stock","Atención","Marca propia","Experiencia general"]')
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text = excluded.question_text, question_type = excluded.question_type, position = excluded.position, options = excluded.options;

    -- Pregunta 3: dolor_principal
    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, v_ent.category, 'q_dolor_principal', '¿Qué te saca canas de ' || v_ent.name || '?', 'choice', 3, '["Caro","Filas eternas","Falta stock","Promos engañosas","Mala atención","Desorden / suciedad","Precio en caja “sorpresa”","Poca variedad","Marcas propias malas"]')
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text = excluded.question_text, question_type = excluded.question_type, position = excluded.position, options = excluded.options;

    -- Pregunta 4: q_precio_1_5
    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, v_ent.category, 'q_precio_1_5', 'En precio, ' || v_ent.name || ' es…', 'scale_1_5', 4, null)
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text = excluded.question_text, question_type = excluded.question_type, position = excluded.position, options = excluded.options;

    -- Pregunta 5: q_stock_1_5
    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, v_ent.category, 'q_stock_1_5', '¿Encuentras lo que vas a buscar?', 'scale_1_5', 5, null)
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text = excluded.question_text, question_type = excluded.question_type, position = excluded.position, options = excluded.options;

    -- Pregunta 6: q_promos_transparencia_1_5
    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, v_ent.category, 'q_promos_transparencia_1_5', 'Las promos… ¿cumplen o chamullan?', 'scale_1_5', 6, null)
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text = excluded.question_text, question_type = excluded.question_type, position = excluded.position, options = excluded.options;

    -- Pregunta 7: q_filas_1_5
    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, v_ent.category, 'q_filas_1_5', 'Las filas en ' || v_ent.name || ' son…', 'scale_1_5', 7, null)
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text = excluded.question_text, question_type = excluded.question_type, position = excluded.position, options = excluded.options;

    -- Pregunta 8: q_orden_limpieza_1_5
    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, v_ent.category, 'q_orden_limpieza_1_5', 'El local se siente…', 'scale_1_5', 8, null)
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text = excluded.question_text, question_type = excluded.question_type, position = excluded.position, options = excluded.options;

    -- Pregunta 9: q_atencion_1_5
    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, v_ent.category, 'q_atencion_1_5', 'La atención (cuando la necesitas) es…', 'scale_1_5', 9, null)
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text = excluded.question_text, question_type = excluded.question_type, position = excluded.position, options = excluded.options;

    -- Pregunta 10: q_frecuencia_compra
    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, v_ent.category, 'q_frecuencia_compra', '¿Cada cuánto caes (con cariño)?', 'choice', 10, '["2+ veces por semana","1 vez por semana","2–3 veces al mes","1 vez al mes","Menos de 1 vez al mes"]')
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text = excluded.question_text, question_type = excluded.question_type, position = excluded.position, options = excluded.options;

  END LOOP;
END $$;

commit;
