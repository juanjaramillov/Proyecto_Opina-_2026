begin;

-- =========================================================
-- A) CATEGORÍAS (2)
-- =========================================================
insert into public.categories (slug, name, emoji)
values
  ('salud-clinicas-privadas-scl', 'Salud — Clínicas Privadas (Santiago)', '🏥'),
  ('salud-farmacias-scl', 'Salud — Farmacias (Santiago)', '💊')
on conflict (slug) do update set
  name = excluded.name,
  emoji = excluded.emoji;

-- =========================================================
-- B) ENTITIES (10) con image_url desde /public/images/options/
-- type = 'brand' (consistente con tus seeds anteriores)
-- category = slug de categoría (para filtrar rápido)
-- metadata: ciudad + scope
-- =========================================================
insert into public.entities (type, name, slug, category, metadata, image_url)
values
  -- Clínicas privadas (7)
  ('brand','Clínica Alemana','clinica-alemana','salud-clinicas-privadas-scl','{"city":"Santiago","scope":"private_clinic"}','/images/options/clinica-alemana.png'),
  ('brand','Clínica Las Condes (CLC)','clinica-las-condes','salud-clinicas-privadas-scl','{"city":"Santiago","scope":"private_clinic"}','/images/options/clinica-las-condes.png'),
  ('brand','Clínica Santa María','clinica-santa-maria','salud-clinicas-privadas-scl','{"city":"Santiago","scope":"private_clinic"}','/images/options/clinica-santa-maria.png'),
  ('brand','Clínica Universidad de los Andes','clinica-universidad-de-los-andes','salud-clinicas-privadas-scl','{"city":"Santiago","scope":"private_clinic"}','/images/options/clinica-universidad-de-los-andes.png'),
  ('brand','Clínica Indisa','clinica-indisa','salud-clinicas-privadas-scl','{"city":"Santiago","scope":"private_clinic"}','/images/options/clinica-indisa.png'),
  ('brand','Clínica Dávila','clinica-davila','salud-clinicas-privadas-scl','{"city":"Santiago","scope":"private_clinic"}','/images/options/clinica-davila.png'),
  ('brand','Clínica Vespucio','clinica-vespucio','salud-clinicas-privadas-scl','{"city":"Santiago","scope":"private_clinic"}','/images/options/clinica-vespucio.png'),

  -- Farmacias (3)
  ('brand','Cruz Verde','farmacia-cruz-verde','salud-farmacias-scl','{"city":"Santiago","scope":"pharmacy"}','/images/options/farmacia-cruz-verde.png'),
  ('brand','Salcobrand','farmacia-salcobrand','salud-farmacias-scl','{"city":"Santiago","scope":"pharmacy"}','/images/options/farmacia-salcobrand.png'),
  ('brand','Farmacias Ahumada','farmacia-ahumada','salud-farmacias-scl','{"city":"Santiago","scope":"pharmacy"}','/images/options/farmacia-ahumada.png')
on conflict (slug) do update set
  name = excluded.name,
  category = excluded.category,
  metadata = excluded.metadata,
  image_url = excluded.image_url;

-- =========================================================
-- C) BATALLAS (Versus + Torneo) para cada categoría
-- =========================================================
-- Clínicas
insert into public.battles (title, slug, description, category_id, status)
select
  'Clínicas privadas — ¿Cuál prefieres?', 'versus-salud-clinicas-privadas-scl',
  'Duelo 1vs1 entre clínicas privadas en Santiago.',
  c.id, 'active'
from public.categories c
where c.slug = 'salud-clinicas-privadas-scl'
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  status = excluded.status;

insert into public.battles (title, slug, description, category_id, status)
select
  'Clínicas privadas — Torneo', 'tournament-salud-clinicas-privadas-scl',
  'Modo progresivo: el ganador sigue avanzando.',
  c.id, 'active'
from public.categories c
where c.slug = 'salud-clinicas-privadas-scl'
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  status = excluded.status;

-- Farmacias
insert into public.battles (title, slug, description, category_id, status)
select
  'Farmacias — ¿Cuál prefieres?', 'versus-salud-farmacias-scl',
  'Duelo 1vs1 entre farmacias en Santiago.',
  c.id, 'active'
from public.categories c
where c.slug = 'salud-farmacias-scl'
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  status = excluded.status;

insert into public.battles (title, slug, description, category_id, status)
select
  'Farmacias — Torneo', 'tournament-salud-farmacias-scl',
  'Modo progresivo: el ganador sigue avanzando.',
  c.id, 'active'
from public.categories c
where c.slug = 'salud-farmacias-scl'
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  status = excluded.status;

-- =========================================================
-- D) BATTLE OPTIONS: amarrar entidades a cada battle (versus + torneo)
-- Usamos label = name, brand_id = entities.id, image_url = entities.image_url
-- =========================================================
-- helper: insertar options para una battle por category (idempotente)
-- 1) Clínicas → Versus
insert into public.battle_options (battle_id, label, brand_id, image_url, sort_order)
select
  b.id,
  e.name,
  e.id,
  e.image_url,
  row_number() over (order by e.slug) as sort_order
from public.battles b
join public.entities e on e.category = 'salud-clinicas-privadas-scl'
where b.slug = 'versus-salud-clinicas-privadas-scl'
on conflict (battle_id, label) do update set
  brand_id = excluded.brand_id,
  image_url = excluded.image_url,
  sort_order = excluded.sort_order;

-- 2) Clínicas → Torneo
insert into public.battle_options (battle_id, label, brand_id, image_url, sort_order)
select
  b.id,
  e.name,
  e.id,
  e.image_url,
  row_number() over (order by e.slug) as sort_order
from public.battles b
join public.entities e on e.category = 'salud-clinicas-privadas-scl'
where b.slug = 'tournament-salud-clinicas-privadas-scl'
on conflict (battle_id, label) do update set
  brand_id = excluded.brand_id,
  image_url = excluded.image_url,
  sort_order = excluded.sort_order;

-- 3) Farmacias → Versus
insert into public.battle_options (battle_id, label, brand_id, image_url, sort_order)
select
  b.id,
  e.name,
  e.id,
  e.image_url,
  row_number() over (order by e.slug) as sort_order
from public.battles b
join public.entities e on e.category = 'salud-farmacias-scl'
where b.slug = 'versus-salud-farmacias-scl'
on conflict (battle_id, label) do update set
  brand_id = excluded.brand_id,
  image_url = excluded.image_url,
  sort_order = excluded.sort_order;

-- 4) Farmacias → Torneo
insert into public.battle_options (battle_id, label, brand_id, image_url, sort_order)
select
  b.id,
  e.name,
  e.id,
  e.image_url,
  row_number() over (order by e.slug) as sort_order
from public.battles b
join public.entities e on e.category = 'salud-farmacias-scl'
where b.slug = 'tournament-salud-farmacias-scl'
on conflict (battle_id, label) do update set
  brand_id = excluded.brand_id,
  image_url = excluded.image_url,
  sort_order = excluded.sort_order;

commit;
