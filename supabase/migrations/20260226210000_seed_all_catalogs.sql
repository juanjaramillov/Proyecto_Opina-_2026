begin;

-- =========================================================
-- A) CATEGORIES
-- =========================================================
insert into public.categories (slug, name, emoji)
values
  ('transporte-aerolineas', 'Transporte — Aerolíneas', '✈️'),
  ('finanzas-bancos', 'Finanzas — Bancos y Fintech', '🏦'),
  ('transporte-autos', 'Transporte — Marcas de Autos', '🚗'),
  ('gastronomia-comida-rapida', 'Gastronomía — Comida Rápida', '🍔'),
  ('retail-supermercados', 'Retail — Supermercados', '🛒'),
  ('entretencion-streaming-video', 'Entretención — Streaming (Video)', '🎬'),
  ('entretencion-streaming-audio', 'Entretención — Streaming (Audio)', '🎧'),
  ('retail-ropa', 'Retail — Ropa Deportiva y Moda', '👟'),
  ('apps-delivery-movilidad', 'Apps — Movilidad y Reparto', '📱'),
  ('tecnologia-marcas', 'Tecnología — Marcas y Consolas', '💻'),
  ('consumo-bebidas', 'Consumo — Bebidas y Energéticas', '🥤'),
  ('deportes-futbol', 'Deportes — Clubes de Fútbol', '⚽'),
  ('entretencion-sagas', 'Entretención — Universos (Sagas)', '🌌'),
  ('turismo-ciudades', 'Turismo — Ciudades Globales', '🗽')
on conflict (slug) do update set
  name = excluded.name,
  emoji = excluded.emoji;

-- =========================================================
-- B) ENTITIES (Las 111 imágenes de opciones)
-- =========================================================
insert into public.entities (type, name, slug, category, metadata, image_url)
values
  -- 1. Aerolíneas
  ('brand','Avianca','avianca','transporte-aerolineas','{"scope":"international"}','/images/options/avianca.png'),
  ('brand','Azul','azul','transporte-aerolineas','{"scope":"international"}','/images/options/azul.png'),
  ('brand','Copa Airlines','copa','transporte-aerolineas','{"scope":"international"}','/images/options/copa.png'),
  ('brand','Delta','delta','transporte-aerolineas','{"scope":"international"}','/images/options/delta.png'),
  ('brand','Gol','gol','transporte-aerolineas','{"scope":"international"}','/images/options/gol.png'),
  ('brand','Iberia','iberia','transporte-aerolineas','{"scope":"international"}','/images/options/iberia.png'),
  ('brand','JetSmart','jetsmart','transporte-aerolineas','{"scope":"international"}','/images/options/jetsmart.png'),
  ('brand','LATAM Airlines','latam','transporte-aerolineas','{"scope":"international"}','/images/options/latam.png'),
  ('brand','SKY Airline','sky','transporte-aerolineas','{"scope":"international"}','/images/options/sky.png'),
  ('brand','United Airlines','united','transporte-aerolineas','{"scope":"international"}','/images/options/united.png'),

  -- 2. Bancos y Fintech
  ('brand','Banco de Chile','bancochile','finanzas-bancos','{"scope":"national"}','/images/options/bancochile.png'),
  ('brand','BancoEstado','bancoestado','finanzas-bancos','{"scope":"national"}','/images/options/bancoestado.png'),
  ('brand','BCI','bci','finanzas-bancos','{"scope":"national"}','/images/options/bci.png'),
  ('brand','BICE','bice','finanzas-bancos','{"scope":"national"}','/images/options/bice.svg'),
  ('brand','Consorcio','consorcio','finanzas-bancos','{"scope":"national"}','/images/options/consorcio.png'),
  ('brand','Itaú','itau','finanzas-bancos','{"scope":"international"}','/images/options/itau.png'),
  ('brand','MACH','mach','finanzas-bancos','{"scope":"national"}','/images/options/mach.png'),
  ('brand','Mercado Pago','mercadopago','finanzas-bancos','{"scope":"international"}','/images/options/mercadopago.png'),
  ('brand','Santander','santander','finanzas-bancos','{"scope":"international"}','/images/options/santander.png'),
  ('brand','Scotiabank','scotiabank','finanzas-bancos','{"scope":"international"}','/images/options/scotiabank.png'),
  ('brand','Tenpo','tenpo','finanzas-bancos','{"scope":"national"}','/images/options/tenpo.png'),

  -- 3. Marcas de Autos
  ('brand','Audi','audi','transporte-autos','{"scope":"international"}','/images/options/audi.png'),
  ('brand','BMW','bmw','transporte-autos','{"scope":"international"}','/images/options/bmw.png'),
  ('brand','Chevrolet','chevrolet','transporte-autos','{"scope":"international"}','/images/options/chevrolet.png'),
  ('brand','Hyundai','hyundai','transporte-autos','{"scope":"international"}','/images/options/hyundai.png'),
  ('brand','Kia','kia','transporte-autos','{"scope":"international"}','/images/options/kia.png'),
  ('brand','Mazda','mazda','transporte-autos','{"scope":"international"}','/images/options/mazda.png'),
  ('brand','Nissan','nissan','transporte-autos','{"scope":"international"}','/images/options/nissan.png'),
  ('brand','Peugeot','peugeot','transporte-autos','{"scope":"international"}','/images/options/peugeot.png'),
  ('brand','Subaru','subaru','transporte-autos','{"scope":"international"}','/images/options/subaru.png'),
  ('brand','Suzuki','suzuki','transporte-autos','{"scope":"international"}','/images/options/suzuki.png'),
  ('brand','Toyota','toyota','transporte-autos','{"scope":"international"}','/images/options/toyota.png'),
  ('brand','Volkswagen','volkswagen','transporte-autos','{"scope":"international"}','/images/options/volkswagen.png'),

  -- 4. Comida Rápida
  ('brand','Burger King','burgerking','gastronomia-comida-rapida','{"scope":"international"}','/images/options/burgerking.png'),
  ('brand','Domino''s Pizza','dominos','gastronomia-comida-rapida','{"scope":"international"}','/images/options/dominos.png'),
  ('brand','KFC','kfc','gastronomia-comida-rapida','{"scope":"international"}','/images/options/kfc.png'),
  ('brand','McDonald''s','mcdonalds','gastronomia-comida-rapida','{"scope":"international"}','/images/options/mcdonalds.png'),
  ('brand','Subway','subway','gastronomia-comida-rapida','{"scope":"international"}','/images/options/subway.png'),

  -- 5. Supermercados
  ('brand','Jumbo','jumbo','retail-supermercados','{"scope":"national"}','/images/options/jumbo.png'),
  ('brand','Lider','lider','retail-supermercados','{"scope":"national"}','/images/options/lider.png'),
  ('brand','Santa Isabel','santaisabel','retail-supermercados','{"scope":"national"}','/images/options/santaisabel.png'),
  ('brand','Tottus','tottus','retail-supermercados','{"scope":"national"}','/images/options/tottus.png'),
  ('brand','Unimarc','unimarc','retail-supermercados','{"scope":"national"}','/images/options/unimarc.png'),

  -- 6. Streaming Video
  ('brand','Apple TV+','appletv','entretencion-streaming-video','{"scope":"international"}','/images/options/appletv.png'),
  ('brand','Disney+','disneyplus','entretencion-streaming-video','{"scope":"international"}','/images/options/disneyplus.svg'),
  ('brand','Max (HBO)','hbomax','entretencion-streaming-video','{"scope":"international"}','/images/options/hbomax.png'),
  ('brand','Netflix','netflix','entretencion-streaming-video','{"scope":"international"}','/images/options/netflix.png'),
  ('brand','Paramount+','paramount','entretencion-streaming-video','{"scope":"international"}','/images/options/paramount.png'),
  ('brand','Prime Video','primevideo','entretencion-streaming-video','{"scope":"international"}','/images/options/primevideo.png'),
  ('brand','YouTube','youtube','entretencion-streaming-video','{"scope":"international"}','/images/options/youtube.png'),

  -- 7. Streaming Audio
  ('brand','Amazon Music','amazonmusic','entretencion-streaming-audio','{"scope":"international"}','/images/options/amazonmusic.png'),
  ('brand','Apple Music','applemusic','entretencion-streaming-audio','{"scope":"international"}','/images/options/applemusic.png'),
  ('brand','SoundCloud','soundcloud','entretencion-streaming-audio','{"scope":"international"}','/images/options/soundcloud.png'),
  ('brand','Spotify','spotify','entretencion-streaming-audio','{"scope":"international"}','/images/options/spotify.png'),

  -- 8. Modo Ropa Deportiva
  ('brand','Adidas','adidas','retail-ropa','{"scope":"international"}','/images/options/adidas.png'),
  ('brand','H&M','h-m','retail-ropa','{"scope":"international"}','/images/options/h&m.png'),
  ('brand','New Balance','newbalance','retail-ropa','{"scope":"international"}','/images/options/newbalance.png'),
  ('brand','Nike','nike','retail-ropa','{"scope":"international"}','/images/options/nike.png'),
  ('brand','Puma','puma','retail-ropa','{"scope":"international"}','/images/options/puma.png'),
  ('brand','Skechers','skechers','retail-ropa','{"scope":"international"}','/images/options/skechers.png'),
  ('brand','Zara','zara','retail-ropa','{"scope":"international"}','/images/options/zara.png'),

  -- 9. Movilidad y Reparto
  ('brand','Cabify','cabify','apps-delivery-movilidad','{"scope":"international"}','/images/options/cabify.png'),
  ('brand','DiDi','didi','apps-delivery-movilidad','{"scope":"international"}','/images/options/didi.png'),
  ('brand','PedidosYa','pedidosya','apps-delivery-movilidad','{"scope":"international"}','/images/options/pedidosya.png'),
  ('brand','Taxi','taxi','apps-delivery-movilidad','{"scope":"national"}','/images/options/taxi.png'),
  ('brand','Uber','uber','apps-delivery-movilidad','{"scope":"international"}','/images/options/uber.png'),
  ('brand','Uber Eats','ubereats','apps-delivery-movilidad','{"scope":"international"}','/images/options/ubereats.png'),

  -- 10. Tecnología y Consolas
  ('brand','Huawei','huawei','tecnologia-marcas','{"scope":"international"}','/images/options/huawei.png'),
  ('brand','iPhone','iphone','tecnologia-marcas','{"scope":"international"}','/images/options/iphone.png'),
  ('brand','Motorola','motorola','tecnologia-marcas','{"scope":"international"}','/images/options/motorola.png'),
  ('brand','Google Pixel','pixel','tecnologia-marcas','{"scope":"international"}','/images/options/pixel.png'),
  ('brand','Samsung','samsung','tecnologia-marcas','{"scope":"international"}','/images/options/samsung.png'),
  ('brand','Xiaomi','xiaomi','tecnologia-marcas','{"scope":"international"}','/images/options/xiaomi.png'),
  ('brand','Nintendo','nintendo','tecnologia-marcas','{"scope":"international"}','/images/options/nintendo.png'),
  ('brand','PlayStation','playstation','tecnologia-marcas','{"scope":"international"}','/images/options/playstation.png'),
  ('brand','Xbox','xbox','tecnologia-marcas','{"scope":"international"}','/images/options/xbox.png'),

  -- 11. Bebidas y Cervezas
  ('brand','CCU','ccu','consumo-bebidas','{"scope":"national"}','/images/options/ccu.png'),
  ('brand','Coca-Cola','cocacola','consumo-bebidas','{"scope":"international"}','/images/options/cocacola.png'),
  ('brand','Fanta','fanta','consumo-bebidas','{"scope":"international"}','/images/options/fanta.png'),
  ('brand','Heineken','heineken','consumo-bebidas','{"scope":"international"}','/images/options/heineken.png'),
  ('brand','Monster Energy','monster','consumo-bebidas','{"scope":"international"}','/images/options/monster.png'),
  ('brand','Pepsi','pepsi','consumo-bebidas','{"scope":"international"}','/images/options/pepsi.png'),
  ('brand','RedBull','redbull','consumo-bebidas','{"scope":"international"}','/images/options/redbull.png'),
  ('brand','Sprite','sprite','consumo-bebidas','{"scope":"international"}','/images/options/sprite.png'),

  -- 12. Fútbol
  ('brand','FC Barcelona','barcelona','deportes-futbol','{"scope":"international"}','/images/options/barcelona.png'),
  ('brand','Colo-Colo','colo-colo','deportes-futbol','{"scope":"national"}','/images/options/colo-colo.png'),
  ('brand','AS Roma','roma','deportes-futbol','{"scope":"international"}','/images/options/roma.png'),
  ('brand','U. de Chile','udechile','deportes-futbol','{"scope":"national"}','/images/options/udechile.png'),

  -- 13. Sagas Universos
  ('brand','DC Universe','dc','entretencion-sagas','{"scope":"international"}','/images/options/dc.png'),
  ('brand','Harry Potter','harrypotter','entretencion-sagas','{"scope":"international"}','/images/options/harrypotter.png'),
  ('brand','Marvel Universe','marvel','entretencion-sagas','{"scope":"international"}','/images/options/marvel.png'),
  ('brand','Star Wars','starwars','entretencion-sagas','{"scope":"international"}','/images/options/starwars.png'),

  -- 14. Ciudades
  ('brand','Nueva York','nuevayork','turismo-ciudades','{"scope":"international"}','/images/options/nuevayork.png'),
  ('brand','Río de Janeiro','riodejaneiro','turismo-ciudades','{"scope":"international"}','/images/options/riodejaneiro.png'),
  ('brand','Tokio','tokio','turismo-ciudades','{"scope":"international"}','/images/options/tokio.png')
on conflict (slug) do update set
  name = excluded.name,
  category = excluded.category,
  metadata = excluded.metadata,
  image_url = excluded.image_url;

-- =========================================================
-- C) BATTLES (Versus + Tournament)
-- =========================================================
do $$
declare
  cat record;
begin
  for cat in (
      select id, slug, name from public.categories 
      where slug not in ('salud-clinicas-privadas-scl', 'salud-farmacias-scl')
  ) loop
      
      -- Insert Versus
      insert into public.battles (title, slug, description, category_id, status)
      values (
          cat.name || ' — ¿Cuál prefieres?', 
          'versus-' || cat.slug,
          'Duelo directo entre las mejores opciones.',
          cat.id, 
          'active'
      )
      on conflict (slug) do update set status = 'active';

      -- Insert Tournament
      insert into public.battles (title, slug, description, category_id, status)
      values (
          cat.name || ' — Torneo', 
          'tournament-' || cat.slug,
          'Escoge tu favorito absoluto enfrentándolos uno a uno.',
          cat.id, 
          'active'
      )
      on conflict (slug) do update set status = 'active';

  end loop;
end;
$$;

-- =========================================================
-- D) BATTLE OPTIONS (Map entities to Battles)
-- =========================================================

-- Bind Versus
insert into public.battle_options (battle_id, label, brand_id, image_url, sort_order)
select
  b.id,
  e.name,
  e.id,
  e.image_url,
  row_number() over (partition by b.id order by e.slug) as sort_order
from public.battles b
join public.categories c on c.id = b.category_id
join public.entities e on e.category = c.slug
where b.slug like 'versus-%' 
  and c.slug not in ('salud-clinicas-privadas-scl', 'salud-farmacias-scl')
on conflict (battle_id, label) do update set
  brand_id = excluded.brand_id,
  image_url = excluded.image_url,
  sort_order = excluded.sort_order;

-- Bind Tournament
insert into public.battle_options (battle_id, label, brand_id, image_url, sort_order)
select
  b.id,
  e.name,
  e.id,
  e.image_url,
  row_number() over (partition by b.id order by e.slug) as sort_order
from public.battles b
join public.categories c on c.id = b.category_id
join public.entities e on e.category = c.slug
where b.slug like 'tournament-%'
  and c.slug not in ('salud-clinicas-privadas-scl', 'salud-farmacias-scl')
on conflict (battle_id, label) do update set
  brand_id = excluded.brand_id,
  image_url = excluded.image_url,
  sort_order = excluded.sort_order;


-- =========================================================
-- E) COMMON DEPTH DEFINITIONS (Generic Standard Set)
-- =========================================================

-- 1. NPS
insert into public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, options, position)
select e.id, e.category, 'nps', '¿Qué tan probable es que recomiendes ' || e.name || ' a un amigo?', 'scale', '{"min": 1, "max": 10, "step": 1}', 10
from public.entities e
where e.category not in ('salud-clinicas-privadas-scl', 'salud-farmacias-scl')
on conflict on constraint depth_definitions_entity_id_question_key_key do update 
set question_text = excluded.question_text, options = excluded.options, position = excluded.position;

-- 2. Calidad General
insert into public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, options, position)
select e.id, e.category, 'calidad', '¿Cómo calificas la calidad general?', 'scale', '{"min": 1, "max": 5, "step": 1}', 20
from public.entities e
where e.category not in ('salud-clinicas-privadas-scl', 'salud-farmacias-scl')
on conflict on constraint depth_definitions_entity_id_question_key_key do update 
set question_text = excluded.question_text, options = excluded.options, position = excluded.position;

-- 3. Emoción principal
insert into public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, options, position)
select e.id, e.category, 'emocion', '¿Qué sentimiento te genera interactuar con ' || e.name || '?', 'boolean', '["Confianza", "Felicidad", "Indiferencia", "Frustración", "Decepción"]', 30
from public.entities e
where e.category not in ('salud-clinicas-privadas-scl', 'salud-farmacias-scl')
on conflict on constraint depth_definitions_entity_id_question_key_key do update 
set question_text = excluded.question_text, options = excluded.options, position = excluded.position;

-- 4. Valor percibido (Precio/Calidad)
insert into public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, options, position)
select e.id, e.category, 'precio_calidad', 'Relación Precio / Calidad', 'scale', '{"min": 1, "max": 10, "step": 1}', 40
from public.entities e
where e.category not in ('salud-clinicas-privadas-scl', 'salud-farmacias-scl')
on conflict on constraint depth_definitions_entity_id_question_key_key do update 
set question_text = excluded.question_text, options = excluded.options, position = excluded.position;

-- 5. Open Feedback
insert into public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, options, position)
select e.id, e.category, 'open_text', '¿Qué es lo mejor o peor que tiene ' || e.name || '?', 'boolean', '[]', 50
from public.entities e
where e.category not in ('salud-clinicas-privadas-scl', 'salud-farmacias-scl')
on conflict on constraint depth_definitions_entity_id_question_key_key do update 
set question_text = excluded.question_text, options = excluded.options, position = excluded.position;

commit;
