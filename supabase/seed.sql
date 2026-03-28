-- Consolidated Seed Data from prior migrations

-- Source: 20260223150000_fix_seed_entity_images.sql
-- =========================================================
-- Fix Missing Images in Seeded Entities
-- Goal: Update the image_url column in public.entities and 
-- cascade to public.battle_options for the initial 30 entities
-- =========================================================

BEGIN;

-- STREAMING
UPDATE public.entities SET image_url = '/images/options/netflix.png' WHERE slug = 'netflix';
UPDATE public.entities SET image_url = '/images/options/primevideo.png' WHERE slug = 'prime-video';
UPDATE public.entities SET image_url = '/images/options/disneyplus.svg' WHERE slug = 'disney-plus';
UPDATE public.entities SET image_url = '/images/options/hbomax.png' WHERE slug = 'max';
UPDATE public.entities SET image_url = '/images/options/appletv.png' WHERE slug = 'apple-tv-plus';
UPDATE public.entities SET image_url = '/images/options/paramount.png' WHERE slug = 'paramount-plus';

-- BEBIDAS
UPDATE public.entities SET image_url = '/images/options/cocacola.png' WHERE slug = 'coca-cola';
UPDATE public.entities SET image_url = '/images/options/pepsi.png' WHERE slug = 'pepsi';
UPDATE public.entities SET image_url = '/images/options/redbull.png' WHERE slug = 'red-bull';
UPDATE public.entities SET image_url = '/images/options/monster.png' WHERE slug = 'monster-energy';
UPDATE public.entities SET image_url = '/images/options/fanta.png' WHERE slug = 'fanta';
UPDATE public.entities SET image_url = '/images/options/sprite.png' WHERE slug = 'sprite';

-- VACACIONES
UPDATE public.entities SET image_url = '/images/options/nuevayork.png' WHERE slug = 'nueva-york';
UPDATE public.entities SET image_url = '/images/options/paris.png' WHERE slug = 'paris';
UPDATE public.entities SET image_url = '/images/options/tokio.png' WHERE slug = 'tokio';
UPDATE public.entities SET image_url = '/images/options/riodejaneiro.png' WHERE slug = 'rio-de-janeiro';
UPDATE public.entities SET image_url = '/images/options/roma.png' WHERE slug = 'roma';
UPDATE public.entities SET image_url = '/images/options/barcelona.png' WHERE slug = 'barcelona';

-- SMARTPHONES
UPDATE public.entities SET image_url = '/images/options/iphone.png' WHERE slug = 'apple-iphone';
UPDATE public.entities SET image_url = '/images/options/samsung.png' WHERE slug = 'samsung';
UPDATE public.entities SET image_url = '/images/options/xiaomi.png' WHERE slug = 'xiaomi';
UPDATE public.entities SET image_url = '/images/options/huawei.png' WHERE slug = 'huawei';
UPDATE public.entities SET image_url = '/images/options/pixel.png' WHERE slug = 'google-pixel';
UPDATE public.entities SET image_url = '/images/options/motorola.png' WHERE slug = 'motorola';

-- SALUD
UPDATE public.entities SET image_url = '/images/options/clinicaalemana.png' WHERE slug = 'clinica-alemana';
UPDATE public.entities SET image_url = '/images/options/clc.png' WHERE slug = 'clinica-las-condes';
UPDATE public.entities SET image_url = '/images/options/clinicasantamaria.png' WHERE slug = 'clinica-santa-maria';
UPDATE public.entities SET image_url = '/images/options/clinicadavila.png' WHERE slug = 'clinica-davila';
UPDATE public.entities SET image_url = '/images/options/redsalud.png' WHERE slug = 'redsalud';
UPDATE public.entities SET image_url = '/images/options/integramedica.png' WHERE slug = 'integramedica';

-- UPDATE THE BATTLE OPTIONS TO SYNC WITH ENTITIES
UPDATE public.battle_options bo
SET image_url = e.image_url
FROM public.entities e
WHERE bo.brand_id = e.id AND e.image_url IS NOT NULL;

COMMIT;


-- Source: 20260224120000_seed_master_admin_access_code.sql

BEGIN;

-- Requiere extensión para digest (si ya existe, ok)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- IMPORTANTE:
-- Cambia 'OP-ADMIN-0001' por el código real que tú vas a usar.
-- Ese valor NO quedará en claro: se guarda solo el hash sha256.
INSERT INTO public.access_gate_tokens (code_hash, label, is_active, expires_at)
VALUES (
encode(extensions.digest('OP-ADMIN-0001', 'sha256'), 'hex'),
  'MASTER_ADMIN',
  true,
  null
)
ON CONFLICT (code_hash) DO NOTHING;

COMMIT;


-- Source: 20260224124500_seed_master_admin_access_code.sql
BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

INSERT INTO public.access_gate_tokens (code_hash, label, is_active, expires_at)
VALUES (


encode(extensions.digest('ADMIN-OPINA-2026', 'sha256'), 'hex'),



  'MASTER_ADMIN',
  true,
  null
)
ON CONFLICT (code_hash) DO NOTHING;

COMMIT;


-- Source: 20260226200000_health_catalog_v1.sql
begin;

create extension if not exists "pgcrypto";

-- =========================
-- 1) ENTITIES (catálogo único)
-- =========================
create table if not exists public.entities (
  id uuid primary key default gen_random_uuid(),
  vertical text,                 -- 'health'
  category text,                 -- 'clinics_private' | 'pharmacies'
  name text not null,
  slug text not null,
  city text default 'Santiago',
  country_code text default 'CL',
  logo_path text,                         -- '/images/options/{slug}.png'
  is_active boolean default true,
  sort_order int default 100,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

ALTER TABLE public.entities ADD COLUMN IF NOT EXISTS vertical text;
ALTER TABLE public.entities ADD COLUMN IF NOT EXISTS category text;
ALTER TABLE public.entities ADD COLUMN IF NOT EXISTS city text DEFAULT 'Santiago';
ALTER TABLE public.entities ADD COLUMN IF NOT EXISTS country_code text DEFAULT 'CL';
ALTER TABLE public.entities ADD COLUMN IF NOT EXISTS logo_path text;
ALTER TABLE public.entities ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;
ALTER TABLE public.entities ADD COLUMN IF NOT EXISTS sort_order int DEFAULT 100;
ALTER TABLE public.entities ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

create unique index if not exists entities_unique_category_slug
  on public.entities (category, slug);

create index if not exists entities_idx_vertical_category_active
  on public.entities (vertical, category, is_active);

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_entities_set_updated_at on public.entities;
create trigger trg_entities_set_updated_at
before update on public.entities
for each row execute function public.set_updated_at();

-- =========================
-- 2) CATEGORY ATTRIBUTES (Profundidad estándar)
-- =========================
create table if not exists public.category_attributes (
  id uuid primary key default gen_random_uuid(),
  vertical text not null,                 -- 'health'
  category text not null,                 -- 'clinics_private' | 'pharmacies'
  key text not null,                      -- stable key, e.g. 'quality'
  label text not null,                    -- UI question label
  scale_min int not null default 1,
  scale_max int not null default 5,
  sort_order int not null default 100,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create unique index if not exists category_attributes_unique
  on public.category_attributes (category, key);

create index if not exists category_attributes_idx_category_active
  on public.category_attributes (category, is_active);

-- =========================
-- 3) RLS (lectura pública, escritura solo service/admin)
-- =========================
alter table public.entities enable row level security;
alter table public.category_attributes enable row level security;

drop policy if exists "entities_read_all" on public.entities;
create policy "entities_read_all"
on public.entities for select
to anon, authenticated
using (true);

drop policy if exists "category_attributes_read_all" on public.category_attributes;
create policy "category_attributes_read_all"
on public.category_attributes for select
to anon, authenticated
using (true);

-- =========================
-- 4) SEED: SALUD V1 (SANTIAGO)
-- =========================

-- Clínicas privadas (7)
insert into public.entities (type, vertical, category, name, slug, city, logo_path, is_active, sort_order)
values
  ('brand','health','clinics_private','Clínica Alemana','clinica-alemana','Santiago','/images/options/clinica-alemana.png',true,10),
  ('brand','health','clinics_private','Clínica Las Condes (CLC)','clinica-las-condes','Santiago','/images/options/clinica-las-condes.png',true,20),
  ('brand','health','clinics_private','Clínica Santa María','clinica-santa-maria','Santiago','/images/options/clinica-santa-maria.png',true,30),
  ('brand','health','clinics_private','Clínica Universidad de los Andes','clinica-universidad-de-los-andes','Santiago','/images/options/clinica-universidad-de-los-andes.png',true,40),
  ('brand','health','clinics_private','Clínica Indisa','clinica-indisa','Santiago','/images/options/clinica-indisa.png',true,50),
  ('brand','health','clinics_private','Clínica Dávila','clinica-davila','Santiago','/images/options/clinica-davila.png',true,60),
  ('brand','health','clinics_private','Clínica Vespucio','clinica-vespucio','Santiago','/images/options/clinica-vespucio.png',true,70)
on conflict (category, slug) do update set
  name = excluded.name,
  city = excluded.city,
  logo_path = excluded.logo_path,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order,
  vertical = excluded.vertical,
  updated_at = now();

-- Farmacias (3)
insert into public.entities (type, vertical, category, name, slug, city, logo_path, is_active, sort_order)
values
  ('brand','health','pharmacies','Cruz Verde','farmacia-cruz-verde','Santiago','/images/options/farmacia-cruz-verde.png',true,10),
  ('brand','health','pharmacies','Salcobrand','farmacia-salcobrand','Santiago','/images/options/farmacia-salcobrand.png',true,20),
  ('brand','health','pharmacies','Farmacias Ahumada','farmacia-ahumada','Santiago','/images/options/farmacia-ahumada.png',true,30)
on conflict (category, slug) do update set
  name = excluded.name,
  city = excluded.city,
  logo_path = excluded.logo_path,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order,
  vertical = excluded.vertical,
  updated_at = now();

-- Profundidad: Clínicas (5)
insert into public.category_attributes (vertical, category, key, label, scale_min, scale_max, sort_order, is_active)
values
  ('health','clinics_private','quality','Calidad de la atención',1,5,10,true),
  ('health','clinics_private','wait_time','Tiempos de espera',1,5,20,true),
  ('health','clinics_private','experience','Trato y experiencia',1,5,30,true),
  ('health','clinics_private','value','Relación precio / servicio',1,5,40,true),
  ('health','clinics_private','trust','Confianza',1,5,50,true)
on conflict (category, key) do update set
  label = excluded.label,
  scale_min = excluded.scale_min,
  scale_max = excluded.scale_max,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active;

-- Profundidad: Farmacias (5)
insert into public.category_attributes (vertical, category, key, label, scale_min, scale_max, sort_order, is_active)
values
  ('health','pharmacies','price','Precios',1,5,10,true),
  ('health','pharmacies','stock','Disponibilidad de stock',1,5,20,true),
  ('health','pharmacies','speed','Rapidez (atención/compra)',1,5,30,true),
  ('health','pharmacies','service','Atención del personal',1,5,40,true),
  ('health','pharmacies','trust','Confianza',1,5,50,true)
on conflict (category, key) do update set
  label = excluded.label,
  scale_min = excluded.scale_min,
  scale_max = excluded.scale_max,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active;

commit;


-- Source: 20260226201000_seed_salud_santiago_v1.sql
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
  'Clínicas privadas — Torneo', 'torneo-salud-clinicas-privadas-scl',
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
  'Farmacias — Torneo', 'torneo-salud-farmacias-scl',
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
where b.slug = 'torneo-salud-clinicas-privadas-scl'
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
where b.slug = 'torneo-salud-farmacias-scl'
on conflict (battle_id, label) do update set
  brand_id = excluded.brand_id,
  image_url = excluded.image_url,
  sort_order = excluded.sort_order;

commit;


-- Source: 20260226202000_seed_salud_depths_v1.sql
begin;

-- =========================================================
-- E) DEPTH DEFINITIONS: Asociar atributos a cada entidad de Salud
-- Esto es necesario para que get_active_battles() las muestre (requiere >= 6 preguntas)
-- =========================================================

DO $$
DECLARE
  v_ent RECORD;
BEGIN
  -- Iterar sobre todas las Clínicas y Farmacias
  FOR v_ent IN SELECT id, name, category, slug FROM public.entities WHERE category IN ('salud-clinicas-privadas-scl', 'salud-farmacias-scl') LOOP
    
    -- Pregunta 1: Nota (Obligatoria)
    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position)
    VALUES (v_ent.id, v_ent.category, 'nota_general', '¿Qué nota general le das a ' || v_ent.name || ' del 1 al 10?', 'scale', 1)
    ON CONFLICT (entity_id, question_key) DO NOTHING;

    -- Pregunta 2: Calidad de Atención
    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, v_ent.category, 'calidad', '¿Cómo calificas la calidad de atención de los profesionales en ' || v_ent.name || '?', 'scale', 2, '[]')
    ON CONFLICT (entity_id, question_key) DO NOTHING;

    -- Pregunta 3: Tiempos de Espera
    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, v_ent.category, 'wait_time', '¿Cómo evaluarías el tiempo de espera en ' || v_ent.name || '?', 'choice', 3, '["Muy rápido", "Aceptable", "Lento", "Demasiado lento"]')
    ON CONFLICT (entity_id, question_key) DO NOTHING;

    -- Pregunta 4: Precios y Valor
    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, v_ent.category, 'prices', '¿Consideras que los precios de ' || v_ent.name || ' son justos para lo que ofrecen?', 'choice', 4, '["Excelentes precios", "Justos", "Caros", "Excesivamente caros"]')
    ON CONFLICT (entity_id, question_key) DO NOTHING;

    -- Pregunta 5: Instalaciones / Variedad
    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (
      v_ent.id, v_ent.category, 'facilities', 
      CASE WHEN v_ent.category = 'salud-clinicas-privadas-scl' THEN '¿Qué te parecen las instalaciones y equipos médicos de ' || v_ent.name || '?'
      ELSE '¿Qué te parece la variedad de productos/stock en ' || v_ent.name || '?' END,
      'scale', 5, '[]'
    )
    ON CONFLICT (entity_id, question_key) DO NOTHING;

    -- Pregunta 6: Recomendación (Requerido para pasar el filtro de >= 6 preguntas)
    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, v_ent.category, 'recomendacion', '¿Recomendarías ' || v_ent.name || ' a un familiar o amigo?', 'scale', 6, '[]')
    ON CONFLICT (entity_id, question_key) DO NOTHING;

  END LOOP;
END $$;

commit;


-- Source: 20260226210000_seed_all_catalogs.sql
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
          'torneo-' || cat.slug,
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
where b.slug like 'torneo-%'
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


-- Source: 20260228150000_seed_supermercados_guerra_del_carrito.sql
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


-- Source: 20260301114357_seed_supermercados_brand_domains.sql
BEGIN;

-- Guerra del Carrito: setear brand_domain para Brandfetch/Clearbit
UPDATE public.battle_options bo
SET brand_domain = CASE lower(trim(bo.label))
  WHEN 'líder' THEN 'lider.cl'
  WHEN 'jumbo' THEN 'jumbo.cl'
  WHEN 'santa isabel' THEN 'santaisabel.cl'
  WHEN 'unimarc' THEN 'unimarc.cl'
  WHEN 'tottus' THEN 'tottus.cl'
  WHEN 'acuenta' THEN 'acuenta.cl'
  WHEN 'mayorista 10' THEN 'mayorista10.cl'
  WHEN 'alvi' THEN 'alvi.cl'
  ELSE bo.brand_domain
END
FROM public.battles b
WHERE b.id = bo.battle_id
  AND b.slug = 'guerra_del_carrito';

COMMIT;


-- Source: 20260301120000_seed_comida_rapida_reyes_del_bajon.sql
BEGIN;

-- =========================================================
-- 1) CATEGORY
-- =========================================================
INSERT INTO public.categories (slug, name, emoji)
VALUES ('gastronomia-comida-rapida', 'Comida Rápida', '🍔')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  emoji = EXCLUDED.emoji;

-- =========================================================
-- 2) BATTLE (1 master battle)
-- =========================================================
INSERT INTO public.battles (title, slug, description, category_id, status)
SELECT
  'Reyes del Bajón', 'reyes_del_bajon',
  '¿Qué antojo domina hoy?',
  c.id, 'active'
FROM public.categories c
WHERE c.slug = 'gastronomia-comida-rapida'
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  status = EXCLUDED.status;

-- =========================================================
-- 3) ENTITIES (brands)
-- =========================================================
INSERT INTO public.entities (type, name, slug, category, metadata, image_url)
VALUES
  ('brand','McDonald''s','mcdonalds','Comida Rápida','{}',NULL),
  ('brand','Burger King','burger_king','Comida Rápida','{}',NULL),
  ('brand','KFC','kfc','Comida Rápida','{}',NULL),
  ('brand','Popeyes','popeyes','Comida Rápida','{}',NULL),
  ('brand','Domino''s Pizza','dominos_pizza','Comida Rápida','{}',NULL),
  ('brand','Papa Johns','papa_johns','Comida Rápida','{}',NULL),
  ('brand','Pizza Hut','pizza_hut','Comida Rápida','{}',NULL),
  ('brand','Telepizza','telepizza','Comida Rápida','{}',NULL),
  ('brand','Subway','subway','Comida Rápida','{}',NULL),
  ('brand','Juan Maestro','juan_maestro','Comida Rápida','{}',NULL),
  ('brand','Doggis','doggis','Comida Rápida','{}',NULL),
  ('brand','Tommy Beans','tommy_beans','Comida Rápida','{}',NULL),
  ('brand','Dunkin''','dunkin','Comida Rápida','{}',NULL),
  ('brand','Krispy Kreme','krispy_kreme','Comida Rápida','{}',NULL),
  ('brand','Starbucks','starbucks','Comida Rápida','{}',NULL),
  ('brand','Juan Valdez','juan_valdez','Comida Rápida','{}',NULL)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  metadata = EXCLUDED.metadata,
  image_url = EXCLUDED.image_url;

-- =========================================================
-- 4) BATTLE OPTIONS (attach brands + brand_domain for logos)
-- =========================================================
INSERT INTO public.battle_options (battle_id, label, brand_id, image_url, sort_order, brand_domain)
SELECT
  b.id,
  e.name,
  e.id,
  e.image_url,
  CASE e.slug
    WHEN 'mcdonalds' THEN 1
    WHEN 'burger_king' THEN 2
    WHEN 'kfc' THEN 3
    WHEN 'popeyes' THEN 4
    WHEN 'dominos_pizza' THEN 5
    WHEN 'papa_johns' THEN 6
    WHEN 'pizza_hut' THEN 7
    WHEN 'telepizza' THEN 8
    WHEN 'subway' THEN 9
    WHEN 'juan_maestro' THEN 10
    WHEN 'doggis' THEN 11
    WHEN 'tommy_beans' THEN 12
    WHEN 'dunkin' THEN 13
    WHEN 'krispy_kreme' THEN 14
    WHEN 'starbucks' THEN 15
    WHEN 'juan_valdez' THEN 16
    ELSE 999
  END AS sort_order,
  CASE e.slug
    WHEN 'mcdonalds' THEN 'mcdonalds.cl'
    WHEN 'burger_king' THEN 'burgerking.cl'
    WHEN 'kfc' THEN 'kfc.cl'
    WHEN 'popeyes' THEN 'popeyes.com'
    WHEN 'dominos_pizza' THEN 'dominospizza.cl'
    WHEN 'papa_johns' THEN 'papajohns.cl'
    WHEN 'pizza_hut' THEN 'pizzahut.cl'
    WHEN 'telepizza' THEN 'telepizza.cl'
    WHEN 'subway' THEN 'subway.com'
    WHEN 'juan_maestro' THEN 'juanmaestro.cl'
    WHEN 'doggis' THEN 'doggis.cl'
    WHEN 'tommy_beans' THEN 'tommybeans.cl'
    WHEN 'dunkin' THEN 'dunkin.cl'
    WHEN 'krispy_kreme' THEN 'krispykreme.com'
    WHEN 'starbucks' THEN 'starbucks.cl'
    WHEN 'juan_valdez' THEN 'juanvaldez.com'
    ELSE NULL
  END AS brand_domain
FROM public.battles b
JOIN public.entities e ON e.category = 'Comida Rápida'
WHERE b.slug = 'reyes_del_bajon'
ON CONFLICT (battle_id, label) DO UPDATE SET
  brand_id = EXCLUDED.brand_id,
  image_url = EXCLUDED.image_url,
  sort_order = EXCLUDED.sort_order,
  brand_domain = EXCLUDED.brand_domain;

-- =========================================================
-- 5) DEPTH DEFINITIONS (10 estándar por marca)
--    Nota: 1ra pregunta NPS (0-10) usando key 'recomendacion' + type 'scale'
-- =========================================================
DO $$
DECLARE
  v_ent RECORD;
BEGIN
  FOR v_ent IN
    SELECT id, name, category, slug
    FROM public.entities
    WHERE category = 'Comida Rápida'
  LOOP

    -- 1) NPS 0-10 (compatible con renderer actual: type='scale' + key='recomendacion')
    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'gastronomia-comida-rapida', 'recomendacion',
      'Del 0 al 10… ¿qué tan probable es que recomiendes ' || v_ent.name || '?',
      'scale', 1, NULL)
    ON CONFLICT (entity_id, question_key) DO UPDATE SET
      question_text = EXCLUDED.question_text, question_type = EXCLUDED.question_type, position = EXCLUDED.position, options = EXCLUDED.options;

    -- 2) Motivo principal
    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'gastronomia-comida-rapida', 'q_motivo_principal',
      '¿Por qué vuelves a ' || v_ent.name || '?',
      'choice', 2, '["Sabor","Precio","Rapidez","Promos","Cercanía","Por costumbre","Por antojo","Variedad","Otro"]')
    ON CONFLICT (entity_id, question_key) DO UPDATE SET
      question_text = EXCLUDED.question_text, question_type = EXCLUDED.question_type, position = EXCLUDED.position, options = EXCLUDED.options;

    -- 3) Dolor principal
    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'gastronomia-comida-rapida', 'q_dolor_principal',
      '¿Qué te arruina la experiencia en ' || v_ent.name || '?',
      'choice', 3, '["Carísimo","Demora eterna","Pedido mal hecho","Poca calidad","Mala atención","Local sucio","Promos engañosas","Porciones chicas","Nada grave"]')
    ON CONFLICT (entity_id, question_key) DO UPDATE SET
      question_text = EXCLUDED.question_text, question_type = EXCLUDED.question_type, position = EXCLUDED.position, options = EXCLUDED.options;

    -- 4) Precio 1-5
    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'gastronomia-comida-rapida', 'q_precio_1_5',
      'En precio, ' || v_ent.name || ' es…',
      'scale_1_5', 4, NULL)
    ON CONFLICT (entity_id, question_key) DO UPDATE SET
      question_text = EXCLUDED.question_text, question_type = EXCLUDED.question_type, position = EXCLUDED.position, options = EXCLUDED.options;

    -- 5) Sabor/Calidad 1-5
    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'gastronomia-comida-rapida', 'q_calidad_1_5',
      'Sabor / calidad en ' || v_ent.name || '…',
      'scale_1_5', 5, NULL)
    ON CONFLICT (entity_id, question_key) DO UPDATE SET
      question_text = EXCLUDED.question_text, question_type = EXCLUDED.question_type, position = EXCLUDED.position, options = EXCLUDED.options;

    -- 6) Rapidez 1-5
    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'gastronomia-comida-rapida', 'q_rapidez_1_5',
      'Rapidez (pedido/entrega)…',
      'scale_1_5', 6, NULL)
    ON CONFLICT (entity_id, question_key) DO UPDATE SET
      question_text = EXCLUDED.question_text, question_type = EXCLUDED.question_type, position = EXCLUDED.position, options = EXCLUDED.options;

    -- 7) Consistencia 1-5
    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'gastronomia-comida-rapida', 'q_consistencia_1_5',
      '¿Qué tan consistente es (siempre cumple)?',
      'scale_1_5', 7, NULL)
    ON CONFLICT (entity_id, question_key) DO UPDATE SET
      question_text = EXCLUDED.question_text, question_type = EXCLUDED.question_type, position = EXCLUDED.position, options = EXCLUDED.options;

    -- 8) Promos 1-5
    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'gastronomia-comida-rapida', 'q_promos_1_5',
      'Promos: ¿cumplen o chamullan?',
      'scale_1_5', 8, NULL)
    ON CONFLICT (entity_id, question_key) DO UPDATE SET
      question_text = EXCLUDED.question_text, question_type = EXCLUDED.question_type, position = EXCLUDED.position, options = EXCLUDED.options;

    -- 9) Atención 1-5
    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'gastronomia-comida-rapida', 'q_atencion_1_5',
      'Atención (cuando la necesitas)…',
      'scale_1_5', 9, NULL)
    ON CONFLICT (entity_id, question_key) DO UPDATE SET
      question_text = EXCLUDED.question_text, question_type = EXCLUDED.question_type, position = EXCLUDED.position, options = EXCLUDED.options;

    -- 10) Frecuencia
    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'gastronomia-comida-rapida', 'q_frecuencia_compra',
      '¿Cada cuánto caes (con cariño)?',
      'choice', 10, '["2+ veces/semana","1 vez/semana","2-3 veces/mes","1 vez/mes","Casi nunca"]')
    ON CONFLICT (entity_id, question_key) DO UPDATE SET
      question_text = EXCLUDED.question_text, question_type = EXCLUDED.question_type, position = EXCLUDED.position, options = EXCLUDED.options;

  END LOOP;
END $$;

COMMIT;


-- Source: 20260301140000_seed_bancos_fintech_guerra_de_la_plata.sql
BEGIN;

-- =========================================================
-- 1) CATEGORY
-- =========================================================
INSERT INTO public.categories (slug, name, emoji)
VALUES ('finanzas-bancos-fintech', 'Bancos y Fintech', '💳')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  emoji = EXCLUDED.emoji;

-- =========================================================
-- 2) BATTLE (1 master battle)
-- =========================================================
INSERT INTO public.battles (title, slug, description, category_id, status)
SELECT
  'Guerra de la Plata', 'guerra_de_la_plata',
  '¿A quién le confías tu plata sin apretar los dientes?',
  c.id, 'active'
FROM public.categories c
WHERE c.slug = 'finanzas-bancos-fintech'
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  status = EXCLUDED.status;

-- =========================================================
-- 3) ENTITIES (brands)
-- =========================================================
INSERT INTO public.entities (type, name, slug, category, metadata, image_url)
VALUES
  ('brand','Banco de Chile','banco_de_chile','Bancos y Fintech','{}',NULL),
  ('brand','Santander','santander','Bancos y Fintech','{}',NULL),
  ('brand','BCI','bci','Bancos y Fintech','{}',NULL),
  ('brand','BancoEstado','bancoestado','Bancos y Fintech','{}',NULL),
  ('brand','Scotiabank','scotiabank','Bancos y Fintech','{}',NULL),
  ('brand','Itaú','itau','Bancos y Fintech','{}',NULL),
  ('brand','MACH','mach','Bancos y Fintech','{}',NULL),
  ('brand','Tenpo','tenpo','Bancos y Fintech','{}',NULL),
  ('brand','Mercado Pago','mercado_pago','Bancos y Fintech','{}',NULL),
  ('brand','Fpay','fpay','Bancos y Fintech','{}',NULL),
  ('brand','Banco Ripley','banco_ripley','Bancos y Fintech','{}',NULL),
  ('brand','CMR Falabella','cmr_falabella','Bancos y Fintech','{}',NULL),
  ('brand','Coopeuch','coopeuch','Bancos y Fintech','{}',NULL),
  ('brand','Banco Internacional','banco_internacional','Bancos y Fintech','{}',NULL),
  ('brand','Banco Security','banco_security','Bancos y Fintech','{}',NULL),
  ('brand','Consorcio','consorcio','Bancos y Fintech','{}',NULL)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  metadata = EXCLUDED.metadata,
  image_url = EXCLUDED.image_url;

-- =========================================================
-- 4) BATTLE OPTIONS (attach brands + brand_domain for logos)
-- =========================================================
INSERT INTO public.battle_options (battle_id, label, brand_id, image_url, sort_order, brand_domain)
SELECT
  b.id,
  e.name,
  e.id,
  e.image_url,
  CASE e.slug
    WHEN 'banco_de_chile' THEN 1
    WHEN 'santander' THEN 2
    WHEN 'bci' THEN 3
    WHEN 'bancoestado' THEN 4
    WHEN 'scotiabank' THEN 5
    WHEN 'itau' THEN 6
    WHEN 'mach' THEN 7
    WHEN 'tenpo' THEN 8
    WHEN 'mercado_pago' THEN 9
    WHEN 'fpay' THEN 10
    WHEN 'banco_ripley' THEN 11
    WHEN 'cmr_falabella' THEN 12
    WHEN 'coopeuch' THEN 13
    WHEN 'banco_internacional' THEN 14
    WHEN 'banco_security' THEN 15
    WHEN 'consorcio' THEN 16
    ELSE 999
  END AS sort_order,
  CASE e.slug
    WHEN 'banco_de_chile' THEN 'bancochile.cl'
    WHEN 'santander' THEN 'santander.cl'
    WHEN 'bci' THEN 'bci.cl'
    WHEN 'bancoestado' THEN 'bancoestado.cl'
    WHEN 'scotiabank' THEN 'scotiabank.cl'
    WHEN 'itau' THEN 'itau.cl'
    WHEN 'mach' THEN 'mach.cl'
    WHEN 'tenpo' THEN 'tenpo.cl'
    WHEN 'mercado_pago' THEN 'mercadopago.cl'
    WHEN 'fpay' THEN 'fpay.cl'
    WHEN 'banco_ripley' THEN 'bancoripley.cl'
    WHEN 'cmr_falabella' THEN 'cmr.cl'
    WHEN 'coopeuch' THEN 'coopeuch.cl'
    WHEN 'banco_internacional' THEN 'internacional.cl'
    WHEN 'banco_security' THEN 'bancosecurity.cl'
    WHEN 'consorcio' THEN 'consorcio.cl'
    ELSE NULL
  END AS brand_domain
FROM public.battles b
JOIN public.entities e ON e.category = 'Bancos y Fintech'
WHERE b.slug = 'guerra_de_la_plata'
ON CONFLICT (battle_id, label) DO UPDATE SET
  brand_id = EXCLUDED.brand_id,
  image_url = EXCLUDED.image_url,
  sort_order = EXCLUDED.sort_order,
  brand_domain = EXCLUDED.brand_domain;

-- =========================================================
-- 5) DEPTH DEFINITIONS (10 estándar por marca)
-- =========================================================
DO $$
DECLARE
  v_ent RECORD;
BEGIN
  FOR v_ent IN
    SELECT id, name
    FROM public.entities
    WHERE category = 'Bancos y Fintech'
  LOOP

    -- 1) NPS 0-10 (renderer actual: type='scale' + key='recomendacion')
    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'finanzas-bancos-fintech', 'recomendacion',
      'Del 0 al 10… ¿qué tan probable es que recomiendes ' || v_ent.name || '?',
      'scale', 1, NULL)
    ON CONFLICT (entity_id, question_key) DO UPDATE SET
      question_text = EXCLUDED.question_text, question_type = EXCLUDED.question_type, position = EXCLUDED.position, options = EXCLUDED.options;

    -- 2) Motivo principal
    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'finanzas-bancos-fintech', 'q_motivo_principal',
      '¿Por qué sigues con ' || v_ent.name || '?',
      'choice', 2, '["Confianza","App","Beneficios","Cercanía","Crédito / cupos","Costo","Me lo recomendaron","Por costumbre","Otro"]')
    ON CONFLICT (entity_id, question_key) DO UPDATE SET
      question_text = EXCLUDED.question_text, question_type = EXCLUDED.question_type, position = EXCLUDED.position, options = EXCLUDED.options;

    -- 3) Dolor principal
    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'finanzas-bancos-fintech', 'q_dolor_principal',
      '¿Qué te desespera de ' || v_ent.name || '?',
      'choice', 3, '["Comisiones","App falla","Bloqueos","Atención mala","Fraudes / seguridad","Lento","Letra chica","Cupos bajos","Nada grave"]')
    ON CONFLICT (entity_id, question_key) DO UPDATE SET
      question_text = EXCLUDED.question_text, question_type = EXCLUDED.question_type, position = EXCLUDED.position, options = EXCLUDED.options;

    -- 4) Confianza 1-5
    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'finanzas-bancos-fintech', 'q_confianza_1_5',
      'Confianza en ' || v_ent.name || '…',
      'scale_1_5', 4, NULL)
    ON CONFLICT (entity_id, question_key) DO UPDATE SET
      question_text = EXCLUDED.question_text, question_type = EXCLUDED.question_type, position = EXCLUDED.position, options = EXCLUDED.options;

    -- 5) App 1-5
    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'finanzas-bancos-fintech', 'q_app_1_5',
      'La app de ' || v_ent.name || ' es…',
      'scale_1_5', 5, NULL)
    ON CONFLICT (entity_id, question_key) DO UPDATE SET
      question_text = EXCLUDED.question_text, question_type = EXCLUDED.question_type, position = EXCLUDED.position, options = EXCLUDED.options;

    -- 6) Costos 1-5
    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'finanzas-bancos-fintech', 'q_costos_1_5',
      'Comisiones / costos…',
      'scale_1_5', 6, NULL)
    ON CONFLICT (entity_id, question_key) DO UPDATE SET
      question_text = EXCLUDED.question_text, question_type = EXCLUDED.question_type, position = EXCLUDED.position, options = EXCLUDED.options;

    -- 7) Seguridad 1-5
    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'finanzas-bancos-fintech', 'q_seguridad_1_5',
      'Seguridad (fraudes/prevención)…',
      'scale_1_5', 7, NULL)
    ON CONFLICT (entity_id, question_key) DO UPDATE SET
      question_text = EXCLUDED.question_text, question_type = EXCLUDED.question_type, position = EXCLUDED.position, options = EXCLUDED.options;

    -- 8) Atención 1-5
    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'finanzas-bancos-fintech', 'q_atencion_1_5',
      'Atención (cuando la necesitas)…',
      'scale_1_5', 8, NULL)
    ON CONFLICT (entity_id, question_key) DO UPDATE SET
      question_text = EXCLUDED.question_text, question_type = EXCLUDED.question_type, position = EXCLUDED.position, options = EXCLUDED.options;

    -- 9) Beneficios (choice)
    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'finanzas-bancos-fintech', 'q_beneficios_choice',
      'Lo mejor que tiene…',
      'choice', 9, '["Promos / descuentos","Cupos / crédito","App","Atención","Seguridad","Costo","Nada destacable"]')
    ON CONFLICT (entity_id, question_key) DO UPDATE SET
      question_text = EXCLUDED.question_text, question_type = EXCLUDED.question_type, position = EXCLUDED.position, options = EXCLUDED.options;

    -- 10) Frecuencia
    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'finanzas-bancos-fintech', 'q_uso_frecuencia',
      '¿Qué tanto lo usas?',
      'choice', 10, '["Todos los días","Varias veces/semana","1 vez/semana","1-2 veces/mes","Casi nunca"]')
    ON CONFLICT (entity_id, question_key) DO UPDATE SET
      question_text = EXCLUDED.question_text, question_type = EXCLUDED.question_type, position = EXCLUDED.position, options = EXCLUDED.options;

  END LOOP;
END $$;

COMMIT;


-- Source: 20260301160000_seed_telecom_guerra_del_internet.sql
BEGIN;

-- =========================================================
-- 1) CATEGORY
-- =========================================================
INSERT INTO public.categories (slug, name, emoji)
VALUES ('telecom-movil-fibra', 'Telecomunicaciones', '📶')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  emoji = EXCLUDED.emoji;

-- =========================================================
-- 2) BATTLE
-- =========================================================
INSERT INTO public.battles (title, slug, description, category_id, status)
SELECT
  'Guerra del Internet', 'guerra_del_internet',
  '¿Quién te da mejor señal sin excusas?',
  c.id, 'active'
FROM public.categories c
WHERE c.slug = 'telecom-movil-fibra'
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  status = EXCLUDED.status;

-- =========================================================
-- 3) ENTITIES (brands)
-- =========================================================
INSERT INTO public.entities (type, name, slug, category, metadata, image_url)
VALUES
  ('brand','Entel','entel','Telecomunicaciones','{}',NULL),
  ('brand','Movistar','movistar','Telecomunicaciones','{}',NULL),
  ('brand','WOM','wom','Telecomunicaciones','{}',NULL),
  ('brand','Claro','claro','Telecomunicaciones','{}',NULL),
  ('brand','VTR','vtr','Telecomunicaciones','{}',NULL),
  ('brand','Mundo','mundo','Telecomunicaciones','{}',NULL),
  ('brand','Virgin Mobile','virgin_mobile','Telecomunicaciones','{}',NULL),
  ('brand','GTD','gtd','Telecomunicaciones','{}',NULL),
  ('brand','Telsur','telsur','Telecomunicaciones','{}',NULL),
  ('brand','Zapping','zapping','Telecomunicaciones','{}',NULL),
  ('brand','DIRECTV GO','directv_go','Telecomunicaciones','{}',NULL),
  ('brand','Claro Video','claro_video','Telecomunicaciones','{}',NULL),
  ('brand','Movistar Fibra','movistar_fibra','Telecomunicaciones','{}',NULL),
  ('brand','Entel Fibra','entel_fibra','Telecomunicaciones','{}',NULL),
  ('brand','VTR Hogar','vtr_hogar','Telecomunicaciones','{}',NULL),
  ('brand','Mundo Fibra','mundo_fibra','Telecomunicaciones','{}',NULL)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  metadata = EXCLUDED.metadata,
  image_url = EXCLUDED.image_url;

-- =========================================================
-- 4) BATTLE OPTIONS
-- =========================================================
INSERT INTO public.battle_options (battle_id, label, brand_id, image_url, sort_order, brand_domain)
SELECT
  b.id,
  e.name,
  e.id,
  e.image_url,
  CASE e.slug
    WHEN 'entel' THEN 1
    WHEN 'movistar' THEN 2
    WHEN 'wom' THEN 3
    WHEN 'claro' THEN 4
    WHEN 'vtr' THEN 5
    WHEN 'mundo' THEN 6
    WHEN 'virgin_mobile' THEN 7
    WHEN 'gtd' THEN 8
    WHEN 'telsur' THEN 9
    WHEN 'zapping' THEN 10
    WHEN 'directv_go' THEN 11
    WHEN 'claro_video' THEN 12
    WHEN 'movistar_fibra' THEN 13
    WHEN 'entel_fibra' THEN 14
    WHEN 'vtr_hogar' THEN 15
    WHEN 'mundo_fibra' THEN 16
    ELSE 999
  END AS sort_order,
  CASE e.slug
    WHEN 'entel' THEN 'entel.cl'
    WHEN 'movistar' THEN 'movistar.cl'
    WHEN 'wom' THEN 'wom.cl'
    WHEN 'claro' THEN 'claro.cl'
    WHEN 'vtr' THEN 'vtr.com'
    WHEN 'mundo' THEN 'mundo.cl'
    WHEN 'virgin_mobile' THEN 'virginmobile.cl'
    WHEN 'gtd' THEN 'gtd.cl'
    WHEN 'telsur' THEN 'telsur.cl'
    WHEN 'zapping' THEN 'zapping.com'
    WHEN 'directv_go' THEN 'directvgo.com'
    WHEN 'claro_video' THEN 'clarovideo.com'
    WHEN 'movistar_fibra' THEN 'movistar.cl'
    WHEN 'entel_fibra' THEN 'entel.cl'
    WHEN 'vtr_hogar' THEN 'vtr.com'
    WHEN 'mundo_fibra' THEN 'mundo.cl'
    ELSE NULL
  END AS brand_domain
FROM public.battles b
JOIN public.entities e ON e.category = 'Telecomunicaciones'
WHERE b.slug = 'guerra_del_internet'
ON CONFLICT (battle_id, label) DO UPDATE SET
  brand_id = EXCLUDED.brand_id,
  image_url = EXCLUDED.image_url,
  sort_order = EXCLUDED.sort_order,
  brand_domain = EXCLUDED.brand_domain;

-- =========================================================
-- 5) DEPTH DEFINITIONS (10 estándar por marca)
-- =========================================================
DO $$
DECLARE
  v_ent RECORD;
BEGIN
  FOR v_ent IN
    SELECT id, name
    FROM public.entities
    WHERE category = 'Telecomunicaciones'
  LOOP

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'telecom-movil-fibra', 'recomendacion',
      'Del 0 al 10… ¿qué tan probable es que recomiendes ' || v_ent.name || '?',
      'scale', 1, NULL)
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'telecom-movil-fibra', 'q_motivo_principal',
      '¿Por qué sigues con ' || v_ent.name || '?',
      'choice', 2, '["Cobertura","Velocidad","Precio","Promos","Servicio técnico","Me da lo mismo (inercias)","No hay mejor opción","Otro"]')
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'telecom-movil-fibra', 'q_dolor_principal',
      '¿Qué te mata de ' || v_ent.name || '?',
      'choice', 3, '["Se cae","Lento","Mala cobertura","Carísimo","Servicio técnico malo","Atención mala","Cobros raros","Promos engañosas","Nada grave"]')
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'telecom-movil-fibra', 'q_precio_1_5',
      'En precio, ' || v_ent.name || ' es…',
      'scale_1_5', 4, NULL)
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'telecom-movil-fibra', 'q_calidad_1_5',
      'En calidad de señal/servicio…',
      'scale_1_5', 5, NULL)
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'telecom-movil-fibra', 'q_velocidad_1_5',
      'Velocidad (cuando importa)…',
      'scale_1_5', 6, NULL)
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'telecom-movil-fibra', 'q_cobertura_1_5',
      'Cobertura (donde vives/trabajas)…',
      'scale_1_5', 7, NULL)
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'telecom-movil-fibra', 'q_estabilidad_1_5',
      'Estabilidad (se corta/no se corta)…',
      'scale_1_5', 8, NULL)
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'telecom-movil-fibra', 'q_atencion_1_5',
      'Atención / soporte…',
      'scale_1_5', 9, NULL)
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'telecom-movil-fibra', 'q_frecuencia_uso',
      '¿Qué tanto lo usas?',
      'choice', 10, '["Todo el día","Varias veces/día","Diario","Semanal","Casi nunca"]')
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

  END LOOP;
END $$;

COMMIT;


-- Source: 20260301180000_seed_aerolineas_guerra_de_los_cielos.sql
BEGIN;

-- =========================================================
-- 1) CATEGORY
-- =========================================================
INSERT INTO public.categories (slug, name, emoji)
VALUES ('transporte-aerolineas', 'Aerolíneas', '✈️')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  emoji = EXCLUDED.emoji;

-- =========================================================
-- 2) BATTLE
-- =========================================================
INSERT INTO public.battles (title, slug, description, category_id, status)
SELECT
  'Guerra de los Cielos', 'guerra_de_los_cielos',
  '¿Con quién vuelas sin arrepentirte después?',
  c.id, 'active'
FROM public.categories c
WHERE c.slug = 'transporte-aerolineas'
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  status = EXCLUDED.status;

-- =========================================================
-- 3) ENTITIES
-- =========================================================
INSERT INTO public.entities (type, name, slug, category, metadata, image_url)
VALUES
  ('brand','LATAM','latam','Aerolíneas','{}',NULL),
  ('brand','Sky Airline','sky','Aerolíneas','{}',NULL),
  ('brand','JetSMART','jetsmart','Aerolíneas','{}',NULL),
  ('brand','Avianca','avianca','Aerolíneas','{}',NULL),
  ('brand','Copa Airlines','copa','Aerolíneas','{}',NULL),
  ('brand','American Airlines','american','Aerolíneas','{}',NULL),
  ('brand','Delta','delta','Aerolíneas','{}',NULL),
  ('brand','United','united','Aerolíneas','{}',NULL),
  ('brand','Air Canada','air_canada','Aerolíneas','{}',NULL),
  ('brand','Iberia','iberia','Aerolíneas','{}',NULL),
  ('brand','Air France','air_france','Aerolíneas','{}',NULL),
  ('brand','KLM','klm','Aerolíneas','{}',NULL),
  ('brand','British Airways','british_airways','Aerolíneas','{}',NULL),
  ('brand','Emirates','emirates','Aerolíneas','{}',NULL),
  ('brand','Qatar Airways','qatar','Aerolíneas','{}',NULL),
  ('brand','Turkish Airlines','turkish','Aerolíneas','{}',NULL)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  metadata = EXCLUDED.metadata,
  image_url = EXCLUDED.image_url;

-- =========================================================
-- 4) BATTLE OPTIONS (brand_domain)
-- =========================================================
INSERT INTO public.battle_options (battle_id, label, brand_id, image_url, sort_order, brand_domain)
SELECT
  b.id,
  e.name,
  e.id,
  e.image_url,
  CASE e.slug
    WHEN 'latam' THEN 1
    WHEN 'sky' THEN 2
    WHEN 'jetsmart' THEN 3
    WHEN 'avianca' THEN 4
    WHEN 'copa' THEN 5
    WHEN 'american' THEN 6
    WHEN 'delta' THEN 7
    WHEN 'united' THEN 8
    WHEN 'air_canada' THEN 9
    WHEN 'iberia' THEN 10
    WHEN 'air_france' THEN 11
    WHEN 'klm' THEN 12
    WHEN 'british_airways' THEN 13
    WHEN 'emirates' THEN 14
    WHEN 'qatar' THEN 15
    WHEN 'turkish' THEN 16
    ELSE 999
  END AS sort_order,
  CASE e.slug
    WHEN 'latam' THEN 'latamairlines.com'
    WHEN 'sky' THEN 'skyairline.com'
    WHEN 'jetsmart' THEN 'jetsmart.com'
    WHEN 'avianca' THEN 'avianca.com'
    WHEN 'copa' THEN 'copaair.com'
    WHEN 'american' THEN 'aa.com'
    WHEN 'delta' THEN 'delta.com'
    WHEN 'united' THEN 'united.com'
    WHEN 'air_canada' THEN 'aircanada.com'
    WHEN 'iberia' THEN 'iberia.com'
    WHEN 'air_france' THEN 'airfrance.com'
    WHEN 'klm' THEN 'klm.com'
    WHEN 'british_airways' THEN 'britishairways.com'
    WHEN 'emirates' THEN 'emirates.com'
    WHEN 'qatar' THEN 'qatarairways.com'
    WHEN 'turkish' THEN 'turkishairlines.com'
    ELSE NULL
  END AS brand_domain
FROM public.battles b
JOIN public.entities e ON e.category = 'Aerolíneas'
WHERE b.slug = 'guerra_de_los_cielos'
ON CONFLICT (battle_id, label) DO UPDATE SET
  brand_id = EXCLUDED.brand_id,
  image_url = EXCLUDED.image_url,
  sort_order = EXCLUDED.sort_order,
  brand_domain = EXCLUDED.brand_domain;

-- =========================================================
-- 5) DEPTH DEFINITIONS (10 estándar)
-- =========================================================
DO $$
DECLARE
  v_ent RECORD;
BEGIN
  FOR v_ent IN
    SELECT id, name
    FROM public.entities
    WHERE category = 'Aerolíneas'
  LOOP

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'transporte-aerolineas', 'recomendacion',
      'Del 0 al 10… ¿qué tan probable es que recomiendes ' || v_ent.name || '?',
      'scale', 1, NULL)
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'transporte-aerolineas', 'q_motivo_principal',
      '¿Por qué vuelas con ' || v_ent.name || '?',
      'choice', 2, '["Precio","Rutas/horarios","Puntualidad","Servicio","Millas/beneficios","Experiencia","Por costumbre","Otro"]')
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'transporte-aerolineas', 'q_dolor_principal',
      '¿Qué te hace jurar “nunca más” con ' || v_ent.name || '?',
      'choice', 3, '["Atrasos","Cancelaciones","Cobros extra","Atención mala","Equipaje","Asientos incómodos","Check-in","Nada grave"]')
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'transporte-aerolineas', 'q_precio_1_5', 'Precio / valor…', 'scale_1_5', 4, NULL)
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'transporte-aerolineas', 'q_puntualidad_1_5', 'Puntualidad…', 'scale_1_5', 5, NULL)
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'transporte-aerolineas', 'q_comodidad_1_5', 'Comodidad…', 'scale_1_5', 6, NULL)
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'transporte-aerolineas', 'q_servicio_1_5', 'Servicio a bordo…', 'scale_1_5', 7, NULL)
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'transporte-aerolineas', 'q_atencion_1_5', 'Atención (cuando hay problemas)…', 'scale_1_5', 8, NULL)
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'transporte-aerolineas', 'q_transparencia_1_5', 'Transparencia (cobros/condiciones)…', 'scale_1_5', 9, NULL)
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'transporte-aerolineas', 'q_frecuencia', '¿Con qué frecuencia vuelas?', 'choice', 10, '["Mensual","Trimestral","Semestral","1 vez/año","Casi nunca"]')
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

  END LOOP;
END $$;

COMMIT;


-- Source: 20260301200000_seed_salud_guerra_de_la_salud.sql
BEGIN;

-- =========================================================
-- 1) CATEGORY
-- =========================================================
INSERT INTO public.categories (slug, name, emoji)
VALUES ('salud-clinicas-farmacias', 'Salud', '🩺')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  emoji = EXCLUDED.emoji;

-- =========================================================
-- 2) BATTLE
-- =========================================================
INSERT INTO public.battles (title, slug, description, category_id, status)
SELECT
  'Guerra de la Salud', 'guerra_de_la_salud',
  '¿Dónde te atiendes sin sentir que te están apurando?',
  c.id, 'active'
FROM public.categories c
WHERE c.slug = 'salud-clinicas-farmacias'
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  status = EXCLUDED.status;

-- =========================================================
-- 3) ENTITIES
-- =========================================================
INSERT INTO public.entities (type, name, slug, category, metadata, image_url)
VALUES
  ('brand','Clínica Alemana','clinica_alemana','Salud','{}',NULL),
  ('brand','Clínica Las Condes','clinica_las_condes','Salud','{}',NULL),
  ('brand','Clínica Santa María','clinica_santa_maria','Salud','{}',NULL),
  ('brand','RedSalud','redsalud','Salud','{}',NULL),
  ('brand','Bupa','bupa','Salud','{}',NULL),
  ('brand','IntegraMédica','integramedica','Salud','{}',NULL),
  ('brand','UC CHRISTUS','uc_christus','Salud','{}',NULL),
  ('brand','Clínica Dávila','clinica_davila','Salud','{}',NULL),

  ('brand','Cruz Verde','cruzverde','Salud','{}',NULL),
  ('brand','Farmacias Ahumada','farmacias_ahumada','Salud','{}',NULL),
  ('brand','Salcobrand','salcobrand','Salud','{}',NULL),
  ('brand','Dr. Simi','dr_simi','Salud','{}',NULL),
  ('brand','Farmacia Popular','farmacia_popular','Salud','{}',NULL),
  ('brand','Knop','knop','Salud','{}',NULL),
  ('brand','Farmacias Galénica','galenica','Salud','{}',NULL),
  ('brand','Lider.cl (Farmacia)','lider_farmacia','Salud','{}',NULL)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  metadata = EXCLUDED.metadata,
  image_url = EXCLUDED.image_url;

-- =========================================================
-- 4) BATTLE OPTIONS
-- =========================================================
INSERT INTO public.battle_options (battle_id, label, brand_id, image_url, sort_order, brand_domain)
SELECT
  b.id,
  e.name,
  e.id,
  e.image_url,
  CASE e.slug
    WHEN 'clinica_alemana' THEN 1
    WHEN 'clinica_las_condes' THEN 2
    WHEN 'clinica_santa_maria' THEN 3
    WHEN 'redsalud' THEN 4
    WHEN 'bupa' THEN 5
    WHEN 'integramedica' THEN 6
    WHEN 'uc_christus' THEN 7
    WHEN 'clinica_davila' THEN 8
    WHEN 'cruzverde' THEN 9
    WHEN 'farmacias_ahumada' THEN 10
    WHEN 'salcobrand' THEN 11
    WHEN 'dr_simi' THEN 12
    WHEN 'farmacia_popular' THEN 13
    WHEN 'knop' THEN 14
    WHEN 'galenica' THEN 15
    WHEN 'lider_farmacia' THEN 16
    ELSE 999
  END AS sort_order,
  CASE e.slug
    WHEN 'clinica_alemana' THEN 'alemana.cl'
    WHEN 'clinica_las_condes' THEN 'clc.cl'
    WHEN 'clinica_santa_maria' THEN 'clinicasantamaria.cl'
    WHEN 'redsalud' THEN 'redsalud.cl'
    WHEN 'bupa' THEN 'bupa.cl'
    WHEN 'integramedica' THEN 'integramedica.cl'
    WHEN 'uc_christus' THEN 'redsaluducchristus.cl'
    WHEN 'clinica_davila' THEN 'clinicadavila.cl'
    WHEN 'cruzverde' THEN 'cruzverde.cl'
    WHEN 'farmacias_ahumada' THEN 'farmaciasahumada.cl'
    WHEN 'salcobrand' THEN 'salcobrand.cl'
    WHEN 'dr_simi' THEN 'drsimi.cl'
    WHEN 'farmacia_popular' THEN 'farmaciapopular.cl'
    WHEN 'knop' THEN 'knop.cl'
    WHEN 'galenica' THEN 'galenica.cl'
    WHEN 'lider_farmacia' THEN 'lider.cl'
    ELSE NULL
  END AS brand_domain
FROM public.battles b
JOIN public.entities e ON e.category = 'Salud'
WHERE b.slug = 'guerra_de_la_salud'
ON CONFLICT (battle_id, label) DO UPDATE SET
  brand_id = EXCLUDED.brand_id,
  image_url = EXCLUDED.image_url,
  sort_order = EXCLUDED.sort_order,
  brand_domain = EXCLUDED.brand_domain;

-- =========================================================
-- 5) DEPTH DEFINITIONS (10 estándar)
-- =========================================================
DO $$
DECLARE
  v_ent RECORD;
BEGIN
  FOR v_ent IN
    SELECT id, name
    FROM public.entities
    WHERE category = 'Salud'
  LOOP

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'salud-clinicas-farmacias', 'recomendacion',
      'Del 0 al 10… ¿qué tan probable es que recomiendes ' || v_ent.name || '?',
      'scale', 1, NULL)
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'salud-clinicas-farmacias', 'q_motivo_principal',
      '¿Por qué eliges ' || v_ent.name || '?',
      'choice', 2, '["Confianza","Calidad","Precio","Cercanía","Rapidez","Cobertura/Convenio","Por costumbre","Otro"]')
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'salud-clinicas-farmacias', 'q_dolor_principal',
      '¿Qué te molesta más de ' || v_ent.name || '?',
      'choice', 3, '["Carísimo","Demoras","Mala atención","Poca disponibilidad","Cobros sorpresa","Trámites","Falta stock (si aplica)","Nada grave"]')
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'salud-clinicas-farmacias', 'q_precio_1_5', 'Precio / valor…', 'scale_1_5', 4, NULL)
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'salud-clinicas-farmacias', 'q_calidad_1_5', 'Calidad del servicio…', 'scale_1_5', 5, NULL)
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'salud-clinicas-farmacias', 'q_rapidez_1_5', 'Rapidez / tiempos…', 'scale_1_5', 6, NULL)
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'salud-clinicas-farmacias', 'q_disponibilidad_1_5', 'Disponibilidad (horas/stock)…', 'scale_1_5', 7, NULL)
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'salud-clinicas-farmacias', 'q_transparencia_1_5', 'Transparencia (cobros/info)…', 'scale_1_5', 8, NULL)
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'salud-clinicas-farmacias', 'q_atencion_1_5', 'Atención humana…', 'scale_1_5', 9, NULL)
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'salud-clinicas-farmacias', 'salud_frecuencia',
      '¿Con qué frecuencia lo usas?',
      'choice', 10, '["Semanal","Mensual","Trimestral","Semestral","Casi nunca"]')
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

  END LOOP;
END $$;

COMMIT;


-- Source: 20260301220000_seed_retail_guerra_del_retail.sql
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


-- Source: 20260301230000_seed_streaming_guerra_del_streaming.sql
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


-- Source: 20260302090000_seed_moda_guerra_del_outfit.sql
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


-- Source: 20260302110000_seed_delivery_guerra_del_delivery.sql
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


-- Source: 20260302130000_seed_isapres_seguros_guerra_isapres.sql
BEGIN;

-- 1) CATEGORY
INSERT INTO public.categories (slug, name, emoji)
VALUES ('salud-isapres-seguros', 'Isapres & Seguros', '🧾')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  emoji = EXCLUDED.emoji;

-- 2) BATTLE
INSERT INTO public.battles (title, slug, description, category_id, status)
SELECT
  'Guerra de las Isapres', 'guerra_de_las_isapres',
  '¿Quién te responde cuando de verdad lo necesitas?',
  c.id, 'active'
FROM public.categories c
WHERE c.slug = 'salud-isapres-seguros'
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  status = EXCLUDED.status;

-- 3) ENTITIES (16)
INSERT INTO public.entities (type, name, slug, category, metadata, image_url)
VALUES
  ('brand','Banmédica','banmedica','Isapres & Seguros','{}',NULL),
  ('brand','Colmena','colmena','Isapres & Seguros','{}',NULL),
  ('brand','Consalud','consalud','Isapres & Seguros','{}',NULL),
  ('brand','Cruz Blanca','cruz_blanca','Isapres & Seguros','{}',NULL),
  ('brand','Vida Tres','vida_tres','Isapres & Seguros','{}',NULL),
  ('brand','Nueva Masvida','nueva_masvida','Isapres & Seguros','{}',NULL),
  ('brand','Fonasa','fonasa','Isapres & Seguros','{}',NULL),
  ('brand','Caja Los Andes (salud)','caja_los_andes_salud','Isapres & Seguros','{}',NULL),

  ('brand','MetLife','metlife','Isapres & Seguros','{}',NULL),
  ('brand','Zurich','zurich','Isapres & Seguros','{}',NULL),
  ('brand','SURA','sura','Isapres & Seguros','{}',NULL),
  ('brand','Consorcio','consorcio_seg','Isapres & Seguros','{}',NULL),
  ('brand','BICE Vida','bice_vida','Isapres & Seguros','{}',NULL),
  ('brand','HDI','hdi','Isapres & Seguros','{}',NULL),
  ('brand','MAPFRE','mapfre','Isapres & Seguros','{}',NULL),
  ('brand','Chilena Consolidada','chilena_consolidada','Isapres & Seguros','{}',NULL)
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
    WHEN 'banmedica' THEN 1
    WHEN 'colmena' THEN 2
    WHEN 'consalud' THEN 3
    WHEN 'cruz_blanca' THEN 4
    WHEN 'vida_tres' THEN 5
    WHEN 'nueva_masvida' THEN 6
    WHEN 'fonasa' THEN 7
    WHEN 'caja_los_andes_salud' THEN 8
    WHEN 'metlife' THEN 9
    WHEN 'zurich' THEN 10
    WHEN 'sura' THEN 11
    WHEN 'consorcio_seg' THEN 12
    WHEN 'bice_vida' THEN 13
    WHEN 'hdi' THEN 14
    WHEN 'mapfre' THEN 15
    WHEN 'chilena_consolidada' THEN 16
    ELSE 999
  END AS sort_order,
  CASE e.slug
    WHEN 'banmedica' THEN 'banmedica.cl'
    WHEN 'colmena' THEN 'colmena.cl'
    WHEN 'consalud' THEN 'consalud.cl'
    WHEN 'cruz_blanca' THEN 'cruzblanca.cl'
    WHEN 'vida_tres' THEN 'vidatres.cl'
    WHEN 'nueva_masvida' THEN 'nuevamasvida.cl'
    WHEN 'fonasa' THEN 'fonasa.cl'
    WHEN 'caja_los_andes_salud' THEN 'cajalosandes.cl'
    WHEN 'metlife' THEN 'metlife.cl'
    WHEN 'zurich' THEN 'zurich.cl'
    WHEN 'sura' THEN 'sura.cl'
    WHEN 'consorcio_seg' THEN 'consorcio.cl'
    WHEN 'bice_vida' THEN 'bicevida.cl'
    WHEN 'hdi' THEN 'hdi.cl'
    WHEN 'mapfre' THEN 'mapfre.cl'
    WHEN 'chilena_consolidada' THEN 'chilenaconsolidada.cl'
    ELSE NULL
  END AS brand_domain
FROM public.battles b
JOIN public.entities e ON e.category = 'Isapres & Seguros'
WHERE b.slug = 'guerra_de_las_isapres'
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
    WHERE category = 'Isapres & Seguros'
  LOOP

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'salud-isapres-seguros', 'recomendacion',
      'Del 0 al 10… ¿qué tan probable es que recomiendes ' || v_ent.name || '?',
      'scale', 1, NULL)
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'salud-isapres-seguros', 'q_motivo_principal',
      '¿Por qué estás con ' || v_ent.name || '?',
      'choice', 2, '["Cobertura","Precio","Reembolsos","Red de prestadores","Atención","Por plan empresa","Por costumbre","Otro"]')
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'salud-isapres-seguros', 'q_dolor_principal',
      '¿Qué te frustra de ' || v_ent.name || '?',
      'choice', 3, '["Reembolsos","Cobros sorpresa","Letra chica","Rechazos","Atención","Trámites","Demoras","Nada grave"]')
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'salud-isapres-seguros', 'q_precio_1_5', 'Precio / valor…', 'scale_1_5', 4, NULL)
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'salud-isapres-seguros', 'q_cobertura_1_5', 'Cobertura real…', 'scale_1_5', 5, NULL)
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'salud-isapres-seguros', 'q_reembolsos_1_5', 'Reembolsos / rapidez…', 'scale_1_5', 6, NULL)
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'salud-isapres-seguros', 'q_transparencia_1_5', 'Transparencia (letra chica)…', 'scale_1_5', 7, NULL)
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'salud-isapres-seguros', 'q_atencion_1_5', 'Atención / soporte…', 'scale_1_5', 8, NULL)
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'salud-isapres-seguros', 'q_facilidad_1_5', 'Facilidad de trámites…', 'scale_1_5', 9, NULL)
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'salud-isapres-seguros', 'q_frecuencia',
      '¿Qué tan seguido lo usas?',
      'choice', 10, '["Mensual","Trimestral","Semestral","1 vez/año","Casi nunca"]')
    ON CONFLICT (entity_id, question_key) DO UPDATE SET question_text=EXCLUDED.question_text, question_type=EXCLUDED.question_type, position=EXCLUDED.position, options=EXCLUDED.options;

  END LOOP;
END $$;

COMMIT;


-- Source: 20260302150000_seed_generic_depths_all_categories.sql
BEGIN;

-- 1) Limpiamos todas las definiciones de profundidad actuales para empezar de cero
DELETE FROM public.depth_definitions;

-- 2) Insertamos las 10 preguntas genéricas para TODAS las entidades
DO $$
DECLARE
  v_ent RECORD;
BEGIN
  -- Iteramos sobre todas las entidades y hacemos un JOIN con la categoría para obtener el slug
  FOR v_ent IN
    SELECT e.id, e.name, c.slug AS cat_slug
    FROM public.entities e
    JOIN public.categories c ON c.name = e.category
  LOOP

    -- Q1: NPS 0-10 (Obligatorio, tipo 'scale', clave 'recomendacion')
    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, v_ent.cat_slug, 'recomendacion',
      'Del 0 al 10… ¿qué tan probable es que recomiendes ' || v_ent.name || ' a tu mejor amigo o peor enemigo?',
      'scale', 1, NULL);

    -- Q2: Personaje / Vibes (choice)
    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, v_ent.cat_slug, 'q_personaje',
      'Si ' || v_ent.name || ' fuera un personaje de tu serie favorita, ¿cuál sería?',
      'choice', 2, '["El protagonista que salva el día","El secundario buena onda","El villano sin corazón","El extra que desaparece rápido","Ese que nadie entiende qué hace ahí"]');

    -- Q3: Precio vs Valor (scale_1_5)
    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, v_ent.cat_slug, 'q_precio_1_5',
      'Precio vs Valor del 1 al 5. ¿Te cobran lo justo o te ven la cara en ' || v_ent.name || '?',
      'scale_1_5', 3, NULL);

    -- Q4: Innovación / Modernidad (scale_1_5)
    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, v_ent.cat_slug, 'q_innovacion_1_5',
      'Innovación del 1 al 5. ¿Qué tan al día está ' || v_ent.name || ' con el siglo XXI?',
      'scale_1_5', 4, NULL);

    -- Q5: Atención / Soporte (scale_1_5)
    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, v_ent.cat_slug, 'q_soporte_1_5',
      'Si tienes un problema urgente... del 1 al 5, ¿te ayudan rapidito o te mandan a un bot inútil?',
      'scale_1_5', 5, NULL);

    -- Q6: Dolor Principal / Pain point (choice)
    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, v_ent.cat_slug, 'q_dolor_principal',
      '¿Qué es lo que más te hace perder la santa paciencia con ' || v_ent.name || '?',
      'choice', 6, '["Sus precios de joyería","Atención estilo municipalidad","Se caen o fallan en el peor momento","La burocracia interminable","Me prometen maravillas y no cumplen","Sinceramente, los amo sin cuestionar"]');

    -- Q7: Atractivo Principal / Hook (choice)
    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, v_ent.cat_slug, 'q_atractivo_principal',
      'Y a pesar de todo, ¿por qué vuelves a caer con ' || v_ent.name || '?',
      'choice', 7, '["El precio me salva la vida","Dentro de todo, funciona","Me da flojera suprema cambiarme","Me atienden como rey/reina","Tienen el monopolio de mi vida","Porque soy fiel por naturaleza"]');

    -- Q8: Confianza / Fe (scale_1_5)
    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, v_ent.cat_slug, 'q_confianza_1_5',
      '¿Cuánta fe ciega le tienes a ' || v_ent.name || ' a largo plazo? (1 al 5)',
      'scale_1_5', 8, NULL);

    -- Q9: Fidelidad / Lealtad extrema (choice)
    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, v_ent.cat_slug, 'q_fidelidad',
      'Si mañana desaparece ' || v_ent.name || ' de la faz de la tierra... tu reacción sería:',
      'choice', 9, '["Lloro lágrimas de sangre","Me duele un rato, pero superable","Me da exactamente lo mismo","Descorcho y hago una fiesta","Ya no los usaba de todas formas"]');

    -- Q10: Frecuencia de uso (choice)
    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, v_ent.cat_slug, 'q_frecuencia_uso',
      'Seamos honestos... ¿cada cuánto le rezas o acudes a ' || v_ent.name || '?',
      'choice', 10, '["Prácticamente todos los días","Una que otra vez a la semana","Aparezco una vez al mes","Solo para los años bisiestos","Solo cuando no me queda de otra"]');

  END LOOP;
END $$;

COMMIT;


-- Source: 20260307164000_seed_entities.sql
-- Seed Entities File

INSERT INTO entities (name, slug, type, category) VALUES
-- Bancos
('Banco de Chile', 'banco-de-chile', 'brand', 'bancos'),
('Banco Santander', 'banco-santander', 'brand', 'bancos'),
('BCI', 'bci', 'brand', 'bancos'),
('BancoEstado', 'bancoestado', 'brand', 'bancos'),
('Scotiabank', 'scotiabank', 'brand', 'bancos'),
('Itaú', 'itau', 'brand', 'bancos'),

-- Fintech / Wallets
('Mercado Pago', 'mercado-pago', 'brand', 'fintech-wallets'),
('Tenpo', 'tenpo', 'brand', 'fintech-wallets'),
('Mach', 'mach', 'brand', 'fintech-wallets'),
('Fintual', 'fintual', 'brand', 'fintech-wallets'),
('Tapp', 'tapp', 'brand', 'fintech-wallets'),
('Chek', 'chek', 'brand', 'fintech-wallets'),

-- Tarjetas / Medios de pago
('Visa', 'visa', 'brand', 'tarjetas-medios-de-pago'),
('Mastercard', 'mastercard', 'brand', 'tarjetas-medios-de-pago'),
('American Express', 'american-express', 'brand', 'tarjetas-medios-de-pago'),
('CMR Falabella', 'cmr-falabella', 'brand', 'tarjetas-medios-de-pago'),
('Tarjeta Cencosud', 'tarjeta-cencosud', 'brand', 'tarjetas-medios-de-pago'),
('Tarjeta Lider BCI', 'tarjeta-lider-bci', 'brand', 'tarjetas-medios-de-pago'),

-- Clínicas
('Clínica Alemana', 'clinica-alemana', 'brand', 'clinicas'),
('Clínica Las Condes', 'clinica-las-condes', 'brand', 'clinicas'),
('Clínica Santa María', 'clinica-santa-maria', 'brand', 'clinicas'),
('Clínica Indisa', 'clinica-indisa', 'brand', 'clinicas'),
('RedSalud', 'redsalud', 'brand', 'clinicas'),
('Clínica MEDS', 'clinica-meds', 'brand', 'clinicas'),

-- Centros de Salud
('IntegraMédica', 'integramedica', 'brand', 'centros-de-salud'),
('RedSalud Centro Médico', 'redsalud-centro-medico', 'brand', 'centros-de-salud'),
('Megasalud', 'megasalud', 'brand', 'centros-de-salud'),
('Vidaintegra', 'vidaintegra', 'brand', 'centros-de-salud'),
('Centro Médico UC Christus', 'centro-medico-uc-christus', 'brand', 'centros-de-salud'),
('Bupa', 'bupa', 'brand', 'centros-de-salud'),

-- Farmacias
('Cruz Verde', 'cruz-verde', 'brand', 'farmacias'),
('Salcobrand', 'salcobrand', 'brand', 'farmacias'),
('Farmacias Ahumada', 'farmacias-ahumada', 'brand', 'farmacias'),
('Dr. Simi', 'dr-simi', 'brand', 'farmacias'),
('Liga Chilena contra la Epilepsia', 'liga-chilena-contra-la-epilepsia', 'brand', 'farmacias'),
('Fracción', 'fraccion', 'brand', 'farmacias'),

-- Isapres
('Colmena', 'colmena', 'brand', 'isapres'),
('Banmédica', 'banmedica', 'brand', 'isapres'),
('Consalud', 'consalud', 'brand', 'isapres'),
('Vida Tres', 'vida-tres', 'brand', 'isapres'),
('Nueva Masvida', 'nueva-masvida', 'brand', 'isapres'),
('Cruz Blanca', 'cruz-blanca', 'brand', 'isapres'),

-- Seguros
('MetLife', 'metlife', 'brand', 'seguros'),
('BCI Seguros', 'bci-seguros', 'brand', 'seguros'),
('Consorcio', 'consorcio', 'brand', 'seguros'),
('Chilena Consolidada', 'chilena-consolidada', 'brand', 'seguros'),
('Mapfre', 'mapfre', 'brand', 'seguros'),
('HDI Seguros', 'hdi-seguros', 'brand', 'seguros'),

-- Línea móvil
('Entel', 'entel', 'brand', 'linea-movil'),
('Movistar', 'movistar', 'brand', 'linea-movil'),
('WOM', 'wom', 'brand', 'linea-movil'),
('Claro', 'claro', 'brand', 'linea-movil'),
('VTR Móvil', 'vtr-movil', 'brand', 'linea-movil'),
('Virgin Mobile', 'virgin-mobile', 'brand', 'linea-movil'),

-- Internet hogar
('Mundo Pacífico', 'mundo-pacifico', 'brand', 'internet-hogar'),
('Entel Fibra', 'entel-fibra', 'brand', 'internet-hogar'),
('Movistar Fibra', 'movistar-fibra', 'brand', 'internet-hogar'),
('VTR', 'vtr', 'brand', 'internet-hogar'),
('Claro Hogar', 'claro-hogar', 'brand', 'internet-hogar'),
('GTD', 'gtd', 'brand', 'internet-hogar'),

-- Supermercados
('Líder', 'lider', 'brand', 'supermercados'),
('Jumbo', 'jumbo', 'brand', 'supermercados'),
('Santa Isabel', 'santa-isabel', 'brand', 'supermercados'),
('Tottus', 'tottus', 'brand', 'supermercados'),
('Unimarc', 'unimarc', 'brand', 'supermercados'),
('aCuenta', 'acuenta', 'brand', 'supermercados'),

-- Marketplaces
('Mercado Libre', 'mercado-libre', 'brand', 'marketplaces'),
('Falabella.com', 'falabella-com', 'brand', 'marketplaces'),
('Ripley.com', 'ripley-com', 'brand', 'marketplaces'),
('Paris.cl', 'paris-cl', 'brand', 'marketplaces'),
('Amazon', 'amazon', 'brand', 'marketplaces'),
('AliExpress', 'aliexpress', 'brand', 'marketplaces'),

-- Multitiendas
('Falabella', 'falabella', 'brand', 'multitiendas'),
('Ripley', 'ripley', 'brand', 'multitiendas'),
('Paris', 'paris', 'brand', 'multitiendas'),
('La Polar', 'la-polar', 'brand', 'multitiendas'),
('Hites', 'hites', 'brand', 'multitiendas'),
('Tricot', 'tricot', 'brand', 'multitiendas'),

-- Ropa básica
('H&M', 'h-m', 'brand', 'ropa-basica'),
('Zara', 'zara', 'brand', 'ropa-basica'),
('Corona', 'corona', 'brand', 'ropa-basica'),
('Fashion''s Park', 'fashions-park', 'brand', 'ropa-basica'),
('Tricot', 'tricot', 'brand', 'ropa-basica'),
('Family Shop', 'family-shop', 'brand', 'ropa-basica'),

-- Calzado
('BATA', 'bata', 'brand', 'calzado'),
('Guante', 'guante', 'brand', 'calzado'),
('16 Horas', '16-horas', 'brand', 'calzado'),
('Skechers', 'skechers', 'brand', 'calzado'),
('Hush Puppies', 'hush-puppies', 'brand', 'calzado'),
('Aldo', 'aldo', 'brand', 'calzado'),

-- Deportivo
('Nike', 'nike', 'brand', 'deportivo'),
('adidas', 'adidas', 'brand', 'deportivo'),
('Puma', 'puma', 'brand', 'deportivo'),
('Under Armour', 'under-armour', 'brand', 'deportivo'),
('Reebok', 'reebok', 'brand', 'deportivo'),
('Sparta', 'sparta', 'brand', 'deportivo'),

-- Outdoor
('The North Face', 'the-north-face', 'brand', 'outdoor'),
('Columbia', 'columbia', 'brand', 'outdoor'),
('Patagonia', 'patagonia', 'brand', 'outdoor'),
('Lippi', 'lippi', 'brand', 'outdoor'),
('Doite', 'doite', 'brand', 'outdoor'),
('Marmot', 'marmot', 'brand', 'outdoor'),

-- Fast Food / Comida rápida
('McDonald''s', 'mcdonalds', 'brand', 'fast-food-comida-rapida'),
('Burger King', 'burger-king', 'brand', 'fast-food-comida-rapida'),
('Wendy''s', 'wendys', 'brand', 'fast-food-comida-rapida'),
('KFC', 'kfc', 'brand', 'fast-food-comida-rapida'),
('Doggis', 'doggis', 'brand', 'fast-food-comida-rapida'),
('Tarragona', 'tarragona', 'brand', 'fast-food-comida-rapida'),

-- Delivery (apps)
('PedidosYa', 'pedidosya', 'brand', 'delivery-apps'),
('Uber Eats', 'uber-eats', 'brand', 'delivery-apps'),
('Rappi', 'rappi', 'brand', 'delivery-apps'),
('Justo', 'justo', 'brand', 'delivery-apps'),
('Spid', 'spid', 'brand', 'delivery-apps'),
('Kig', 'kig', 'brand', 'delivery-apps'),

-- Aerolíneas
('LATAM', 'latam', 'brand', 'aerolineas'),
('Sky Airline', 'sky-airline', 'brand', 'aerolineas'),
('JetSMART', 'jetsmart', 'brand', 'aerolineas'),
('Copa Airlines', 'copa-airlines', 'brand', 'aerolineas'),
('American Airlines', 'american-airlines', 'brand', 'aerolineas'),
('Iberia', 'iberia', 'brand', 'aerolineas'),

-- Automotoras (concesionarias)
('Salazar Israel', 'salazar-israel', 'brand', 'automotoras'),
('Bruno Fritsch', 'bruno-fritsch', 'brand', 'automotoras'),
('DercoCenter', 'dercocenter', 'brand', 'automotoras'),
('Kaufmann', 'kaufmann', 'brand', 'automotoras'),
('Gildemeister', 'gildemeister', 'brand', 'automotoras'),
('Pomar', 'pomar', 'brand', 'automotoras'),

-- Autos (marcas)
('Chevrolet', 'chevrolet', 'brand', 'autos-marcas'),
('Toyota', 'toyota', 'brand', 'autos-marcas'),
('Suzuki', 'suzuki', 'brand', 'autos-marcas'),
('Hyundai', 'hyundai', 'brand', 'autos-marcas'),
('Kia', 'kia', 'brand', 'autos-marcas'),
('Peugeot', 'peugeot', 'brand', 'autos-marcas'),

-- Streaming video
('Netflix', 'netflix', 'brand', 'streaming-video'),
('Max', 'max', 'brand', 'streaming-video'),
('Disney+', 'disney', 'brand', 'streaming-video'),
('Prime Video', 'prime-video', 'brand', 'streaming-video'),
('Apple TV+', 'apple-tv', 'brand', 'streaming-video'),
('Paramount+', 'paramount', 'brand', 'streaming-video'),

-- Cosméticos / Maquillaje
('MAC', 'mac', 'brand', 'cosmeticos'),
('Maybelline', 'maybelline', 'brand', 'cosmeticos'),
('L''Oréal', 'loreal', 'brand', 'cosmeticos'),
('Petrizzio', 'petrizzio', 'brand', 'cosmeticos'),
('NYX', 'nyx', 'brand', 'cosmeticos'),
('Natura', 'natura', 'brand', 'cosmeticos'),

-- Universidades
('U. de Chile', 'u-de-chile', 'brand', 'universidades'),
('PUC (U. Católica)', 'puc-u-catolica', 'brand', 'universidades'),
('U. de Concepción', 'u-de-concepcion', 'brand', 'universidades'),
('USACH', 'usach', 'brand', 'universidades'),
('U. Adolfo Ibáñez (UAI)', 'u-adolfo-ibanez-uai', 'brand', 'universidades'),
('U. Diego Portales (UDP)', 'u-diego-portales-udp', 'brand', 'universidades'),

-- Institutos / CFT
('INACAP', 'inacap', 'brand', 'institutos'),
('Duoc UC', 'duoc-uc', 'brand', 'institutos'),
('AIEP', 'aiep', 'brand', 'institutos'),
('Santo Tomás', 'santo-tomas', 'brand', 'institutos'),
('IPChile', 'ipchile', 'brand', 'institutos'),
('ENAC', 'enac', 'brand', 'institutos'),

-- Fútbol (Chile)
('Colo-Colo', 'colo-colo', 'brand', 'futbol-chile'),
('U. de Chile', 'u-de-chile', 'brand', 'futbol-chile'),
('U. Católica', 'u-catolica', 'brand', 'futbol-chile'),
('Cobreloa', 'cobreloa', 'brand', 'futbol-chile'),
('Wanderers', 'wanderers', 'brand', 'futbol-chile'),
('Unión Española', 'union-espanola', 'brand', 'futbol-chile'),

-- Destinos urbanos
('Santiago', 'santiago', 'brand', 'destinos-urbanos'),
('Concepción', 'concepcion', 'brand', 'destinos-urbanos'),
('Valparaíso', 'valparaiso', 'brand', 'destinos-urbanos'),
('Antofagasta', 'antofagasta', 'brand', 'destinos-urbanos'),
('Temuco', 'temuco', 'brand', 'destinos-urbanos'),
('Puerto Montt', 'puerto-montt', 'brand', 'destinos-urbanos'),

-- Destinos playa
('Viña del Mar', 'vina-del-mar', 'brand', 'destinos-playa'),
('La Serena', 'la-serena', 'brand', 'destinos-playa'),
('Reñaca', 'renaca', 'brand', 'destinos-playa'),
('Maitencillo', 'maitencillo', 'brand', 'destinos-playa'),
('Pichilemu', 'pichilemu', 'brand', 'destinos-playa'),
('Iquique (Cavancha)', 'iquique-cavancha', 'brand', 'destinos-playa')
ON CONFLICT (slug) DO NOTHING;
;


-- Source: 20260307165000_seed_generic_depths.sql
BEGIN;

DO $$
DECLARE
  v_ent RECORD;
BEGIN
  -- Iterar sobre todas las entidades que no tienen suficientes depth definitions
  FOR v_ent IN 
    SELECT e.id, e.name, e.category, e.slug 
    FROM public.entities e
    WHERE (SELECT count(*) FROM public.depth_definitions dd WHERE dd.entity_id = e.id) < 10
  LOOP
    
    -- Pregunta 1: Nota
    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position)
    VALUES (v_ent.id, v_ent.category, 'nota_general', '¿Qué nota general le das a ' || v_ent.name || ' del 1 al 10?', 'scale', 1)
    ON CONFLICT (entity_id, question_key) DO NOTHING;

    -- Pregunta 2: Calidad
    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, v_ent.category, 'calidad', '¿Cómo calificas la calidad general de ' || v_ent.name || '?', 'scale', 2, '[]')
    ON CONFLICT (entity_id, question_key) DO NOTHING;

    -- Pregunta 3: Recomendacion
    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, v_ent.category, 'recomendacion', '¿Recomendarías ' || v_ent.name || ' a un conocido?', 'scale', 3, '[]')
    ON CONFLICT (entity_id, question_key) DO NOTHING;

    -- Pregunta 4: Innovacion
    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, v_ent.category, 'innovacion', '¿Qué tan innovadora consideras que es la propuesta de ' || v_ent.name || '?', 'scale', 4, '[]')
    ON CONFLICT (entity_id, question_key) DO NOTHING;

    -- Pregunta 5: Confianza
    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, v_ent.category, 'confianza', '¿Qué nivel de confianza te inspira ' || v_ent.name || '?', 'scale', 5, '[]')
    ON CONFLICT (entity_id, question_key) DO NOTHING;

    -- Pregunta 6: Atencion
    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, v_ent.category, 'atencion', '¿Cómo evaluarías la atención/servicio de ' || v_ent.name || '?', 'scale', 6, '[]')
    ON CONFLICT (entity_id, question_key) DO NOTHING;

    -- Pregunta 7: Precios
    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, v_ent.category, 'precios', '¿Consideras que los precios de ' || v_ent.name || ' son acordes a su nivel?', 'scale', 7, '[]')
    ON CONFLICT (entity_id, question_key) DO NOTHING;

    -- Pregunta 8: Imagen
    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, v_ent.category, 'imagen', '¿Qué tan moderna o atractiva te parece la imagen de ' || v_ent.name || '?', 'scale', 8, '[]')
    ON CONFLICT (entity_id, question_key) DO NOTHING;

    -- Pregunta 9: Experiencia Digital
    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, v_ent.category, 'digital', '¿Cómo evaluarías la experiencia digital (app/web) de ' || v_ent.name || '?', 'scale', 9, '[]')
    ON CONFLICT (entity_id, question_key) DO NOTHING;

    -- Pregunta 10: Fidelidad
    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, v_ent.category, 'fidelidad', '¿Qué tan probable es que sigas eligiendo ' || v_ent.name || ' en el futuro?', 'scale', 10, '[]')
    ON CONFLICT (entity_id, question_key) DO NOTHING;

  END LOOP;
END $$;

COMMIT;


-- Source: 20260309130000_update_full_catalog.sql

-- Nuevo catálogo migratorio
DELETE FROM signal_events WHERE id IS NOT NULL;
DELETE FROM battle_options WHERE id IS NOT NULL;
DELETE FROM battles WHERE id IS NOT NULL;
DELETE FROM entities WHERE id IS NOT NULL;
UPDATE categories SET active = false;

INSERT INTO categories (id, name, slug, comparison_family, entity_type, generation_mode, pairing_rules) VALUES
('dcd1b1df-2663-447b-afba-1ca4ad96c000', 'Clínicas', 'clinicas', 'product', 'brand_service', 'ai_curated_pairs', 'same_entity_type_only'),
('e420cf10-1b4f-4f24-994c-6cb4e00595ee', 'Centros médicos', 'centros-medicos', 'product', 'brand_service', 'ai_curated_pairs', 'same_entity_type_only'),
('ac94fe10-4baa-4657-b15b-887760c81e77', 'Farmacias', 'farmacias', 'product', 'brand_service', 'ai_curated_pairs', 'same_entity_type_only'),
('01c26971-c145-4b4f-aa07-44722ebabcab', 'Isapres', 'isapres', 'product', 'brand_service', 'ai_curated_pairs', 'same_entity_type_only'),
('39fc65f0-6ed6-437f-beee-05a265338745', 'Seguros de salud', 'seguros-de-salud', 'product', 'brand_service', 'ai_curated_pairs', 'same_entity_type_only'),
('992629c0-25fd-42ff-907a-2b7c4efb62db', 'Bancos', 'bancos', 'product', 'brand_service', 'ai_curated_pairs', 'same_entity_type_only'),
('3b4c48a6-0590-492e-b234-11d8161bd711', 'Fintech / billeteras', 'fintech-billeteras', 'product', 'brand_service', 'ai_curated_pairs', 'same_entity_type_only'),
('2f26dda8-48a5-4f6d-94e9-08c75092ebe9', 'Tarjetas / medios de pago', 'tarjetas-medios-de-pago', 'product', 'brand_service', 'ai_curated_pairs', 'same_entity_type_only'),
('8adc810a-48b2-46c1-aeef-0be60320a43d', 'Inversiones / brokers', 'inversiones-brokers', 'product', 'brand_service', 'ai_curated_pairs', 'same_entity_type_only'),
('663dd712-82f3-47cc-b65b-8aff98daacfa', 'Telefonía móvil', 'telefonia-movil', 'product', 'brand_service', 'ai_curated_pairs', 'same_entity_type_only'),
('0529ebb7-b3f2-461c-a72a-be8e23f64d86', 'Internet hogar', 'internet-hogar', 'product', 'brand_service', 'ai_curated_pairs', 'same_entity_type_only'),
('f5a86f3e-8659-47e1-ad09-d9e14f267292', 'TV paga', 'tv-paga', 'product', 'brand_service', 'ai_curated_pairs', 'same_entity_type_only'),
('c637096d-5ab9-443f-8c0c-6ae9ddcac28e', 'TV online', 'tv-online', 'product', 'brand_service', 'ai_curated_pairs', 'same_entity_type_only'),
('036a099f-c554-4c88-8af1-73295a346dba', 'Supermercados', 'supermercados', 'product', 'brand_service', 'ai_curated_pairs', 'same_entity_type_only'),
('e653146f-a9d0-4faa-8b89-77204c41fa7d', 'Marketplaces', 'marketplaces', 'product', 'brand_service', 'ai_curated_pairs', 'same_entity_type_only'),
('3e158885-d465-43fc-83e2-23dac345fb72', 'Multitiendas', 'multitiendas', 'product', 'brand_service', 'ai_curated_pairs', 'same_entity_type_only'),
('2f764907-49d3-4b18-a796-c4e70e5bcdaa', 'Mejoramiento del hogar', 'mejoramiento-del-hogar', 'product', 'brand_service', 'ai_curated_pairs', 'same_entity_type_only'),
('291b576a-8167-4bda-a6bc-9dcec1a2357b', 'Tiendas de tecnología', 'tiendas-de-tecnologia', 'product', 'brand_service', 'ai_curated_pairs', 'same_entity_type_only'),
('ef89cded-697a-46b8-adc8-41de07bb6d3d', 'Ropa básica', 'ropa-basica', 'product', 'brand_service', 'ai_curated_pairs', 'same_entity_type_only'),
('4fc6aa75-5c0c-44f7-9229-806a703c9c9d', 'Fast fashion', 'fast-fashion', 'product', 'brand_service', 'ai_curated_pairs', 'same_entity_type_only'),
('df099ceb-941e-4bb1-83c2-a124d95308a6', 'Calzado', 'calzado', 'product', 'brand_service', 'ai_curated_pairs', 'same_entity_type_only'),
('3af61e4e-cc2f-4999-981a-23999a33d0d2', 'Deportivo', 'deportivo', 'product', 'brand_service', 'ai_curated_pairs', 'same_entity_type_only'),
('165cfe3d-96a3-4baa-9800-e4223234020d', 'Outdoor', 'outdoor', 'product', 'brand_service', 'ai_curated_pairs', 'same_entity_type_only'),
('b7bfdedf-e2d3-4e9b-a2c8-4184ded80f4e', 'Accesorios', 'accesorios', 'product', 'brand_service', 'ai_curated_pairs', 'same_entity_type_only'),
('fb33ecf7-7ec7-4508-924b-5f1c384139cc', 'Fast food', 'fast-food', 'product', 'brand_service', 'ai_curated_pairs', 'same_entity_type_only'),
('fcb9dfbc-403c-41ce-8275-31c0c12743d1', 'Cafeterías', 'cafeterias', 'product', 'brand_service', 'ai_curated_pairs', 'same_entity_type_only'),
('d6421544-37e4-4d48-9ce6-05d0f0b7437d', 'Pizza', 'pizza', 'product', 'brand_service', 'ai_curated_pairs', 'same_entity_type_only'),
('6555758d-c2d6-4045-95b0-42534e85dda0', 'Delivery de comida', 'delivery-de-comida', 'product', 'brand_service', 'ai_curated_pairs', 'same_entity_type_only'),
('bd8ba5b0-9ea9-4f59-9d94-71968b35a808', 'Aerolíneas', 'aerolineas', 'product', 'brand_service', 'ai_curated_pairs', 'same_entity_type_only'),
('c425941d-56ae-4067-b398-1ce24fe6b00f', 'Apps de transporte', 'apps-de-transporte', 'product', 'brand_service', 'ai_curated_pairs', 'same_entity_type_only'),
('8c0acdbe-f34c-4f7d-bab1-128896622b2f', 'Marcas de autos', 'marcas-de-autos', 'product', 'brand_service', 'ai_curated_pairs', 'same_entity_type_only'),
('fb657ad7-8c6b-453d-9511-6d8c84c067b5', 'Marcas chinas de autos', 'marcas-chinas-de-autos', 'product', 'brand_service', 'ai_curated_pairs', 'same_entity_type_only'),
('d32853b3-a678-415f-8c09-344a4c114f33', 'Automotoras / concesionarios', 'automotoras-concesionarios', 'product', 'brand_service', 'ai_curated_pairs', 'same_entity_type_only'),
('21ea3ee2-f5b6-40ba-93f3-cde9ef2443ce', 'Streaming de video', 'streaming-de-video', 'product', 'brand_service', 'ai_curated_pairs', 'same_entity_type_only'),
('a71b2416-5466-461f-8af1-d1051e6204cc', 'Streaming de música', 'streaming-de-musica', 'product', 'brand_service', 'ai_curated_pairs', 'same_entity_type_only'),
('a6110018-6c42-4eb9-9f95-498d2404e7c0', 'Cines', 'cines', 'product', 'brand_service', 'ai_curated_pairs', 'same_entity_type_only'),
('2df70fa0-1f76-401e-96dc-0d4ea276080e', 'Gaseosas', 'gaseosas', 'product', 'brand_service', 'ai_curated_pairs', 'same_entity_type_only'),
('e11b3c1a-9e0d-4a9f-a09d-63425a434144', 'Energéticas', 'energeticas', 'product', 'brand_service', 'ai_curated_pairs', 'same_entity_type_only'),
('a13531bc-6083-4c44-8860-a365eaeb6346', 'Cervezas', 'cervezas', 'product', 'brand_service', 'ai_curated_pairs', 'same_entity_type_only'),
('a60f5f50-4f61-413d-9a97-2ab18f218e0d', 'Aguas', 'aguas', 'product', 'brand_service', 'ai_curated_pairs', 'same_entity_type_only'),
('b7cbebe1-3437-4f4c-a07e-1675ecd0023c', 'Radios', 'radios', 'product', 'brand_service', 'ai_curated_pairs', 'same_entity_type_only'),
('b5a19d62-32bb-40fc-81cc-c64913038747', 'TV abierta', 'tv-abierta', 'product', 'brand_service', 'ai_curated_pairs', 'same_entity_type_only'),
('22cb7124-e821-4373-8f16-21f38f55ab81', 'Prensa digital', 'prensa-digital', 'product', 'brand_service', 'ai_curated_pairs', 'same_entity_type_only'),
('5ee7023d-1015-4c20-af0b-bdc9f64b0609', 'Redes sociales', 'redes-sociales', 'product', 'brand_service', 'ai_curated_pairs', 'same_entity_type_only'),
('ee8340e6-5026-48d4-a5b3-361baf2a0f5c', 'Mensajería', 'mensajeria', 'product', 'brand_service', 'ai_curated_pairs', 'same_entity_type_only'),
('682713bb-b45f-4c5c-9072-6be011c1f418', 'Comunidades / foros', 'comunidades-foros', 'product', 'brand_service', 'ai_curated_pairs', 'same_entity_type_only'),
('be3c5880-160c-4d02-b6d8-0a4f077c6fad', 'Universidades', 'universidades', 'product', 'brand_service', 'ai_curated_pairs', 'same_entity_type_only'),
('4e62dbe3-24a3-469a-93fe-390aff5db902', 'Institutos / CFT', 'institutos-cft', 'product', 'brand_service', 'ai_curated_pairs', 'same_entity_type_only'),
('e83b3295-c2be-4965-9a31-62bf2c55a0c5', 'Preuniversitarios', 'preuniversitarios', 'product', 'brand_service', 'ai_curated_pairs', 'same_entity_type_only'),
('61f1c9e6-efd1-4940-9fb7-3fb315013a20', 'Fútbol chileno', 'futbol-chileno', 'product', 'brand_service', 'ai_curated_pairs', 'same_entity_type_only'),
('9ef5dbb9-03ba-4021-9604-48fe7dccbc6f', 'Viñas', 'vinas', 'product', 'brand_service', 'ai_curated_pairs', 'same_entity_type_only'),
('091b564e-bfaa-451d-947e-1f157c26fe8c', 'Tiendas de vino', 'tiendas-de-vino', 'product', 'brand_service', 'ai_curated_pairs', 'same_entity_type_only'),
('af7eba88-a4bc-4900-a9b6-77e7818ad607', 'Alimento para perros', 'alimento-para-perros', 'product', 'brand_service', 'ai_curated_pairs', 'same_entity_type_only'),
('e2093f93-5627-41a5-9350-97e833b09826', 'Alimento para gatos', 'alimento-para-gatos', 'product', 'brand_service', 'ai_curated_pairs', 'same_entity_type_only'),
('e1506be8-839f-4e33-9c6a-82234a5f698f', 'Tiendas de mascotas', 'tiendas-de-mascotas', 'product', 'brand_service', 'ai_curated_pairs', 'same_entity_type_only'),
('35b25dd1-995f-4c3d-8d92-a6a249de4e4c', 'Clínicas veterinarias', 'clinicas-veterinarias', 'product', 'brand_service', 'ai_curated_pairs', 'same_entity_type_only'),
('263a363f-632a-4822-9fdf-1e8268a3890d', 'Shampoo', 'shampoo', 'product', 'brand_service', 'ai_curated_pairs', 'same_entity_type_only'),
('5c9be044-22d3-4efc-974a-662595c00458', 'Desodorantes', 'desodorantes', 'product', 'brand_service', 'ai_curated_pairs', 'same_entity_type_only'),
('8130a76f-ad9b-4aef-b117-b139564c2b45', 'Pastas dentales', 'pastas-dentales', 'product', 'brand_service', 'ai_curated_pairs', 'same_entity_type_only'),
('ea22fa1e-03cb-41d9-9262-ca13e99a5614', 'Protección solar', 'proteccion-solar', 'product', 'brand_service', 'ai_curated_pairs', 'same_entity_type_only'),
('23bdbcfd-6179-4ef4-8f58-9e5508d79de9', 'Cosméticos / maquillaje', 'cosmeticos-maquillaje', 'product', 'brand_service', 'ai_curated_pairs', 'same_entity_type_only'),
('419a5a82-15c8-4ce3-92d2-d0735c025bde', 'Skincare', 'skincare', 'product', 'brand_service', 'ai_curated_pairs', 'same_entity_type_only'),
('be5759e5-da29-4329-b4fe-ef1a580c4814', 'Perfumes', 'perfumes', 'product', 'brand_service', 'ai_curated_pairs', 'same_entity_type_only'),
('1e43428f-1930-4c5b-be60-4bf850cf6e58', 'Refrigeradores', 'refrigeradores', 'product', 'brand_service', 'ai_curated_pairs', 'same_entity_type_only'),
('19df3b74-a46f-4d96-b114-31be2d0a6f7a', 'Lavadoras', 'lavadoras', 'product', 'brand_service', 'ai_curated_pairs', 'same_entity_type_only'),
('a70a5b53-0fc0-40f2-be99-5067f2ec16f8', 'Aspiradoras', 'aspiradoras', 'product', 'brand_service', 'ai_curated_pairs', 'same_entity_type_only'),
('4c97d742-9b7d-47ff-8823-8cf4c5d551f1', 'Colchones', 'colchones', 'product', 'brand_service', 'ai_curated_pairs', 'same_entity_type_only'),
('fc61e65e-d82b-434f-9d83-71902b0c9dbd', 'Smartphones', 'smartphones', 'product', 'brand_service', 'ai_curated_pairs', 'same_entity_type_only'),
('0918f1c2-b313-4041-9c21-fa5f071c64ef', 'Notebooks', 'notebooks', 'product', 'brand_service', 'ai_curated_pairs', 'same_entity_type_only'),
('a3472d47-8870-464a-91f9-96a4a0b0f17d', 'Audífonos', 'audifonos', 'product', 'brand_service', 'ai_curated_pairs', 'same_entity_type_only'),
('9c34102c-97d8-4cc7-a2b7-6d1f2c3a3dce', 'Smartwatches', 'smartwatches', 'product', 'brand_service', 'ai_curated_pairs', 'same_entity_type_only'),
('4d53c145-2830-4fd8-b533-8078c1d84184', 'Televisores', 'televisores', 'product', 'brand_service', 'ai_curated_pairs', 'same_entity_type_only'),
('6cb24253-e07d-4225-8797-fe3e5c993ed2', 'Tablets', 'tablets', 'product', 'brand_service', 'ai_curated_pairs', 'same_entity_type_only'),
('7e4683dd-6531-40eb-a424-1a90a5c980e8', 'Consolas', 'consolas', 'product', 'brand_service', 'ai_curated_pairs', 'same_entity_type_only'),
('cc513591-46f9-493d-a837-a3d5869b4705', 'Periféricos gamer', 'perifericos-gamer', 'product', 'brand_service', 'ai_curated_pairs', 'same_entity_type_only'),
('32a62d66-f323-4808-aa61-af6ce29ecad6', 'Monitores gamer', 'monitores-gamer', 'product', 'brand_service', 'ai_curated_pairs', 'same_entity_type_only'),
('af34a448-b54d-4147-8277-8bd713f03c14', 'Pañales', 'panales', 'product', 'brand_service', 'ai_curated_pairs', 'same_entity_type_only'),
('1e9665c5-1108-462d-947d-461ea003e656', 'Fórmula / alimentación infantil', 'formula-alimentacion-infantil', 'product', 'brand_service', 'ai_curated_pairs', 'same_entity_type_only'),
('69a5f4dd-bfa5-467b-bd48-27d964eb1f9d', 'Toallitas húmedas', 'toallitas-humedas', 'product', 'brand_service', 'ai_curated_pairs', 'same_entity_type_only'),
('8763218d-2d48-4f03-9485-caca1291d082', 'Cochecitos', 'cochecitos', 'product', 'brand_service', 'ai_curated_pairs', 'same_entity_type_only')
ON CONFLICT (slug) DO UPDATE SET active = true, id = EXCLUDED.id;

INSERT INTO entities (id, name, slug, type, category) VALUES
('fc0bf2fa-279d-4f95-b6d6-e7c9cd2ade32', 'Clínica Alemana', 'clinica-alemana', 'brand', 'clinicas'),
('4cc53b65-ac58-43ed-825c-cf587ab7f27a', 'Clínica Las Condes', 'clinica-las-condes', 'brand', 'clinicas'),
('80fc1790-5483-451c-b95d-666fdb0879ca', 'Clínica Santa María', 'clinica-santa-maria', 'brand', 'clinicas'),
('0917f2b0-59bd-4dfd-961d-176c3876f932', 'Clínica Indisa', 'clinica-indisa', 'brand', 'clinicas'),
('2ba8696a-7799-4538-b5d3-61ecde6d0c22', 'RedSalud', 'redsalud', 'brand', 'clinicas'),
('f59ea904-e894-4984-b9b3-25dbb265c735', 'Clínica MEDS', 'clinica-meds', 'brand', 'clinicas'),
('d4f219dc-560f-46a9-acd4-5bc99df110ba', 'IntegraMédica', 'integramedica', 'brand', 'centros-medicos'),
('18186636-204a-47a8-b55e-12b1fccdaaf7', 'Vidaintegra', 'vidaintegra', 'brand', 'centros-medicos'),
('77bfcde8-bf5f-4eec-85c9-c5b58c7570f0', 'Megasalud', 'megasalud', 'brand', 'centros-medicos'),
('e02994ff-a8e9-455e-90e1-19fe8482d727', 'RedSalud Centros Médicos', 'redsalud-centros-medicos', 'brand', 'centros-medicos'),
('ed9f7d05-6dd6-4808-98a5-139d84eda5b2', 'UC Christus', 'uc-christus', 'brand', 'centros-medicos'),
('f0e4e0a3-3e6a-442e-a10e-e97ca9c7d945', 'Bupa', 'bupa', 'brand', 'centros-medicos'),
('bad9cae7-c965-4e00-8f80-fb756c1583f9', 'Cruz Verde', 'cruz-verde', 'brand', 'farmacias'),
('53de5982-301b-4d20-94ec-4ecfa1708067', 'Salcobrand', 'salcobrand', 'brand', 'farmacias'),
('079fe3d8-3292-44c1-82de-e88e89f08597', 'Farmacias Ahumada', 'farmacias-ahumada', 'brand', 'farmacias'),
('b92e434f-2c97-49cf-9dd2-bd6c5cd8b29f', 'Dr. Simi', 'dr-simi', 'brand', 'farmacias'),
('3d8611e1-ffe0-438b-89ba-1b3a9da365a3', 'Knop', 'knop', 'brand', 'farmacias'),
('5ac8d82f-10b3-438d-8c2b-e92a5a12b0eb', 'Fracción', 'fraccion', 'brand', 'farmacias'),
('702d7657-6cd0-48c0-934a-449038bddc33', 'Colmena', 'colmena', 'brand', 'isapres'),
('48250a29-df1f-4eed-9b23-e35f5fc41c9f', 'Banmédica', 'banmedica', 'brand', 'isapres'),
('87d0c8fb-a2db-4cce-ac0e-7a9904a4556e', 'Consalud', 'consalud', 'brand', 'isapres'),
('eb191410-92b9-4a2a-8fae-d870e54c989c', 'Vida Tres', 'vida-tres', 'brand', 'isapres'),
('3708a20b-0294-4c52-8aaa-f999592e0a66', 'Cruz Blanca', 'cruz-blanca', 'brand', 'isapres'),
('dc9502a9-67fd-43f3-8731-86b6ca3da483', 'Nueva Masvida', 'nueva-masvida', 'brand', 'isapres'),
('03da26de-9def-4545-825a-e0d9b57f5797', 'MetLife', 'metlife', 'brand', 'seguros-de-salud'),
('4e9d8ee5-5ef0-4100-a495-523524e7499c', 'BCI Seguros', 'bci-seguros', 'brand', 'seguros-de-salud'),
('fcf34422-8257-4cb0-8804-37f07340f37d', 'Consorcio', 'consorcio', 'brand', 'seguros-de-salud'),
('4a987296-1bb7-49f1-a27c-64b903abe2d3', 'Zurich', 'zurich', 'brand', 'seguros-de-salud'),
('d4d53c1f-334d-4c99-8659-4019ae820c21', 'Mapfre', 'mapfre', 'brand', 'seguros-de-salud'),
('a44bb49d-6112-42cc-b7e5-a098cc0c598b', 'HDI Seguros', 'hdi-seguros', 'brand', 'seguros-de-salud'),
('0921d947-e401-40c8-a260-6b786626bf7c', 'Banco de Chile', 'banco-de-chile', 'brand', 'bancos'),
('9bdb219b-5957-484b-92e5-86d46d71e34e', 'Santander', 'santander', 'brand', 'bancos'),
('40b62635-4fd6-49e1-bf7a-4fef04257341', 'BCI', 'bci', 'brand', 'bancos'),
('690e2b56-eebd-4d34-972c-8ca88a030c03', 'BancoEstado', 'bancoestado', 'brand', 'bancos'),
('f7517def-7d94-408f-b711-7288c71cc098', 'Scotiabank', 'scotiabank', 'brand', 'bancos'),
('1c006df2-d803-4500-8c19-f9e58e01eb8a', 'Itaú', 'itau', 'brand', 'bancos'),
('1a951a97-718f-4316-bba8-b159f61473f1', 'Banco BICE', 'banco-bice', 'brand', 'bancos'),
('849eaf67-4b78-4b8d-ab92-e8c05d964d6b', 'Banco Falabella', 'banco-falabella', 'brand', 'bancos'),
('07506eb6-1824-44f0-b6a2-08d1e6890474', 'Security', 'security', 'brand', 'bancos'),
('67c67b18-a8f4-45b0-af88-54d0d0db545b', 'Consorcio', 'consorcio-bancos', 'brand', 'bancos'),
('9d0cf2fe-3f96-490b-944d-a9c15629065b', 'Mercado Pago', 'mercado-pago', 'brand', 'fintech-billeteras'),
('cf73505a-3568-4b0e-9fbb-b0ac75a0dddc', 'Tenpo', 'tenpo', 'brand', 'fintech-billeteras'),
('469b4640-a12a-428e-84f6-484f5863ae8a', 'MACH', 'mach', 'brand', 'fintech-billeteras'),
('0b54c39d-3fe6-420f-9399-083620c6baf0', 'Fintual', 'fintual', 'brand', 'fintech-billeteras'),
('24028601-6820-4a43-8104-fc56c672e765', 'Tapp', 'tapp', 'brand', 'fintech-billeteras'),
('addc5a8f-aea6-4f3e-9f69-439514a60f95', 'Chek', 'chek', 'brand', 'fintech-billeteras'),
('75edc13b-8f84-4eaa-81bb-dbf2b522ccd9', 'Global66', 'global66', 'brand', 'fintech-billeteras'),
('61f78b46-b99b-4911-822e-b0d7abd9882a', 'Prex', 'prex', 'brand', 'fintech-billeteras'),
('f134e1fe-eafa-48d5-9ea4-79deea57787c', 'Visa', 'visa', 'brand', 'tarjetas-medios-de-pago'),
('b38d4049-545c-40ef-a6e6-149f9979bca8', 'Mastercard', 'mastercard', 'brand', 'tarjetas-medios-de-pago'),
('c769f555-6e62-4cde-90a4-4d8e5f82325a', 'American Express', 'american-express', 'brand', 'tarjetas-medios-de-pago'),
('4b4a0a50-ad9d-4795-8c4a-871cd1a5e3d4', 'Webpay', 'webpay', 'brand', 'tarjetas-medios-de-pago'),
('e6a9e5c3-2cdb-4d53-b430-494415fcf722', 'Redcompra', 'redcompra', 'brand', 'tarjetas-medios-de-pago'),
('5f31d4f0-85ec-49c6-8e92-ff0b363f45d3', 'Getnet', 'getnet', 'brand', 'tarjetas-medios-de-pago'),
('baeb8dd5-3ab1-4dea-9fa3-623348267f93', 'Mercado Pago', 'mercado-pago-tarjetas-medios-de-pago', 'brand', 'tarjetas-medios-de-pago'),
('a7336596-5d10-40ce-a32f-dc2a6fdbd3d2', 'CMR Falabella', 'cmr-falabella', 'brand', 'tarjetas-medios-de-pago'),
('5a65295a-65d1-40f0-b4d3-baeabe5b126d', 'Banchile Inversiones', 'banchile-inversiones', 'brand', 'inversiones-brokers'),
('4e1fafe4-7c95-4621-b004-852193eef904', 'Renta4', 'renta4', 'brand', 'inversiones-brokers'),
('3c9c542c-e688-455d-b794-fcc9b0223b8e', 'BICE Inversiones', 'bice-inversiones', 'brand', 'inversiones-brokers'),
('e9241bbb-2ecc-4eae-b702-dfb2151a1bb5', 'LarrainVial', 'larrainvial', 'brand', 'inversiones-brokers'),
('e7755adb-be5e-44a8-b1b9-6883f6512e57', 'BTG Pactual', 'btg-pactual', 'brand', 'inversiones-brokers'),
('37489008-7c21-4d5c-ae90-151deea8eb8c', 'Fintual', 'fintual-inversiones-brokers', 'brand', 'inversiones-brokers'),
('ce0c5b70-3e2b-4818-8c14-7bbdbf3bae5a', 'MBI', 'mbi', 'brand', 'inversiones-brokers'),
('1e0eb563-1c50-48ac-8b1d-7868ab21d4f3', 'Santander Corredora', 'santander-corredora', 'brand', 'inversiones-brokers'),
('6f9e3b59-66b8-4e81-a4ba-eee33486a3a7', 'Entel', 'entel', 'brand', 'telefonia-movil'),
('de9ddcdb-d21b-47eb-a641-325749c94edf', 'Movistar', 'movistar', 'brand', 'telefonia-movil'),
('2864d88b-82ab-4993-9cc5-673b86e45dec', 'WOM', 'wom', 'brand', 'telefonia-movil'),
('06909bea-228b-46f5-809d-f357df3b56ae', 'Claro', 'claro', 'brand', 'telefonia-movil'),
('4767c540-bf57-422b-ae22-9a4cfc2890e0', 'Virgin Mobile', 'virgin-mobile', 'brand', 'telefonia-movil'),
('067a795d-648b-4f71-bc51-31e70e909bb0', 'Mundo', 'mundo', 'brand', 'telefonia-movil'),
('cffe8115-b6ff-4145-a1dd-fb10a06986af', 'Movistar Fibra', 'movistar-fibra', 'brand', 'internet-hogar'),
('93ce3075-b43c-4ef6-975f-994fd485b71e', 'Entel Fibra', 'entel-fibra', 'brand', 'internet-hogar'),
('ec0d3338-f2d6-4ac3-8872-2367489de2cf', 'Mundo', 'mundo-internet-hogar', 'brand', 'internet-hogar'),
('72619296-f8ce-483e-9fd0-9cd6067cb753', 'Claro Hogar', 'claro-hogar', 'brand', 'internet-hogar'),
('6d2ab33d-d328-405d-a02f-0f0f5f066f8e', 'VTR', 'vtr', 'brand', 'internet-hogar'),
('3dba104a-5c98-4e61-8a3e-b7459b994d3c', 'GTD', 'gtd', 'brand', 'internet-hogar'),
('c69e76cb-130d-4eef-92b2-60bd058415dd', 'Telsur', 'telsur', 'brand', 'internet-hogar'),
('9444475d-5ccb-4ab5-9133-34b7604947ff', 'VTR', 'vtr-tv-paga', 'brand', 'tv-paga'),
('0ff7db49-e0c1-48e2-b50b-725e1140bf19', 'DIRECTV', 'directv', 'brand', 'tv-paga'),
('b0c7a142-3498-408b-afab-023867c34e9f', 'Movistar TV', 'movistar-tv', 'brand', 'tv-paga'),
('69ff4dff-b138-41b3-9e50-96b45f148bb4', 'Claro TV', 'claro-tv', 'brand', 'tv-paga'),
('80d8083e-60ff-4357-bbf7-20a33d20599e', 'TuVes', 'tuves', 'brand', 'tv-paga'),
('f3bc41e8-ecbb-4564-b7d2-3edd5337be80', 'Zapping', 'zapping', 'brand', 'tv-paga'),
('89815f76-ed3c-4e40-bd5e-1740e7393316', 'Zapping', 'zapping-tv-online', 'brand', 'tv-online'),
('96175e38-731d-4e2c-82ca-d05dc5a08ce5', 'DGO', 'dgo', 'brand', 'tv-online'),
('a2651f5f-bdc6-4f78-9b2b-1a99e6b71710', 'Movistar TV App', 'movistar-tv-app', 'brand', 'tv-online'),
('acbc6c48-a5b2-4e41-8e4e-6f0c8aeb0a25', 'Claro video', 'claro-video', 'brand', 'tv-online'),
('f6405dcb-c399-4443-bc51-f7216c6e23dd', 'TVN Play', 'tvn-play', 'brand', 'tv-online'),
('f157f51f-ccb6-4396-8625-aa1ac2283786', 'MiCHV', 'michv', 'brand', 'tv-online'),
('f6ac7fdf-9c5f-4d45-87c3-076792626733', 'Jumbo', 'jumbo', 'brand', 'supermercados'),
('5c9f347e-df03-4caf-ae3e-fb146f9f2a06', 'Líder', 'lider', 'brand', 'supermercados'),
('ec197acb-0d92-4043-910a-5b3db4a087d2', 'Tottus', 'tottus', 'brand', 'supermercados'),
('c52072bb-85b9-464f-9690-37f26f71df9f', 'Santa Isabel', 'santa-isabel', 'brand', 'supermercados'),
('df328df0-e76b-4476-9fa7-2d50821364e9', 'Unimarc', 'unimarc', 'brand', 'supermercados'),
('e70c0b6f-7a45-4011-9320-edadd3f7e17f', 'aCuenta', 'acuenta', 'brand', 'supermercados'),
('bc0096a9-5205-4ecb-b47b-39ec00c993fe', 'Alvi', 'alvi', 'brand', 'supermercados'),
('13ad600d-73fc-4c90-abdf-922c1482de73', 'Mercado Libre', 'mercado-libre', 'brand', 'marketplaces'),
('3aec2b10-0656-42a7-a1d0-88a47aad493d', 'Falabella', 'falabella', 'brand', 'marketplaces'),
('6e78ebf9-3b53-4ea7-a996-4670f29383a6', 'Ripley', 'ripley', 'brand', 'marketplaces'),
('2a5394c9-724b-4922-94ff-ff6f94fbc951', 'Paris', 'paris', 'brand', 'marketplaces'),
('2b69d8c5-1cef-4631-a83c-5b509c52fc46', 'Amazon', 'amazon', 'brand', 'marketplaces'),
('b99524d5-a49d-4d69-bb33-b26b8bc408aa', 'AliExpress', 'aliexpress', 'brand', 'marketplaces'),
('c84a3f56-0818-4f0b-a80b-d3ba0ec4d188', 'Linio', 'linio', 'brand', 'marketplaces'),
('3f37e728-14a0-4df5-9bc0-9d824a344110', 'Falabella', 'falabella-multitiendas', 'brand', 'multitiendas'),
('78c0d5dc-f1fa-4da3-a3ac-773930052820', 'Ripley', 'ripley-multitiendas', 'brand', 'multitiendas'),
('9901112d-5ed0-4c5e-a88c-74af9ecea0f9', 'Paris', 'paris-multitiendas', 'brand', 'multitiendas'),
('26ca9d30-f837-46c9-acbe-e0b34c626377', 'La Polar', 'la-polar', 'brand', 'multitiendas'),
('6447e5b0-843a-4b2f-b4e1-19874843b6de', 'Hites', 'hites', 'brand', 'multitiendas'),
('105061d0-bbbc-4515-a169-184dcaa32397', 'ABC', 'abc', 'brand', 'multitiendas'),
('086aaf1b-bc86-4a60-94c4-e17fb1f6171a', 'Tricot', 'tricot', 'brand', 'multitiendas'),
('4f16de4c-265e-415f-b7a6-d2fed18cad77', 'Sodimac', 'sodimac', 'brand', 'mejoramiento-del-hogar'),
('10b8e275-06e1-494d-a8eb-22f6a47568e5', 'Easy', 'easy', 'brand', 'mejoramiento-del-hogar'),
('cdff9954-056d-4bdf-bb94-87196010fb58', 'Construmart', 'construmart', 'brand', 'mejoramiento-del-hogar'),
('b9b0606b-d34f-4bec-8285-73f6e3e4daa9', 'Imperial', 'imperial', 'brand', 'mejoramiento-del-hogar'),
('d2e1aa22-d11e-4246-b0c6-af46a5c8a006', 'Chilemat', 'chilemat', 'brand', 'mejoramiento-del-hogar'),
('69e72e6a-43a1-4de4-9f5d-b52d4882bf1d', 'MTS', 'mts', 'brand', 'mejoramiento-del-hogar'),
('c4a9cad5-cb9a-460a-9587-3dc05465e4e3', 'PC Factory', 'pc-factory', 'brand', 'tiendas-de-tecnologia'),
('0de76f54-09f9-4c27-8f3d-dae8b944866e', 'SP Digital', 'sp-digital', 'brand', 'tiendas-de-tecnologia'),
('8cd42b63-8129-486b-93a5-5de5ae86c6bd', 'WePlay', 'weplay', 'brand', 'tiendas-de-tecnologia'),
('64743479-0451-4ce4-95c5-23bb68d6d574', 'MacOnline', 'maconline', 'brand', 'tiendas-de-tecnologia'),
('c241dc31-6907-42db-b37d-f414bf420842', 'Reifstore', 'reifstore', 'brand', 'tiendas-de-tecnologia'),
('c8e1470b-a3a8-4811-8e13-c5f199407fa8', 'Falabella', 'falabella-tiendas-de-tecnologia', 'brand', 'tiendas-de-tecnologia'),
('197a6615-7361-4cfc-b907-178c4947af91', 'Ripley', 'ripley-tiendas-de-tecnologia', 'brand', 'tiendas-de-tecnologia'),
('04c0012d-c431-4ea5-8c00-2d19fe9e6429', 'H&M', 'hm', 'brand', 'ropa-basica'),
('d9a70604-3d92-47f6-bef6-557aa3655d64', 'Zara', 'zara', 'brand', 'ropa-basica'),
('ad21b9a5-191c-429b-bbc0-71653537b3a7', 'Corona', 'corona', 'brand', 'ropa-basica'),
('bfb9e1e6-818b-4b7c-b863-e4ee52307ec4', 'Tricot', 'tricot-ropa-basica', 'brand', 'ropa-basica'),
('1d33dac9-7678-4f1e-abba-9e0a19dfc1bd', 'Family Shop', 'family-shop', 'brand', 'ropa-basica'),
('971ed7f4-7009-4468-85ac-46ab1703ced4', 'Mango', 'mango', 'brand', 'ropa-basica'),
('deb16bc5-9f19-444c-9de1-2a7d45e8ad85', 'Sybilla', 'sybilla', 'brand', 'ropa-basica'),
('a30511c4-074a-4556-8509-e9d509a34e6d', 'H&M', 'hm-fast-fashion', 'brand', 'fast-fashion'),
('942cb349-495b-472c-8a7c-b58ff202218f', 'Zara', 'zara-fast-fashion', 'brand', 'fast-fashion'),
('5de78e10-36d9-417e-ba19-3cff58eab5cb', 'Mango', 'mango-fast-fashion', 'brand', 'fast-fashion'),
('8dab2e83-3d2b-4d0d-bf5b-8b9c6b3cb817', 'Bershka', 'bershka', 'brand', 'fast-fashion'),
('63104a74-a74e-454f-b6bf-025371cc7140', 'Pull&Bear', 'pullbear', 'brand', 'fast-fashion'),
('62dfd319-97cd-42c5-91c1-b5f08d6a31d3', 'Stradivarius', 'stradivarius', 'brand', 'fast-fashion'),
('13aac757-7216-44c9-8af7-30cf7d9f0bde', 'Forever 21', 'forever-21', 'brand', 'fast-fashion'),
('522b72c4-4903-4682-869a-4828f768f6e3', 'Bata', 'bata', 'brand', 'calzado'),
('e4c582c6-5243-4058-81ec-b31a00ffd9aa', 'Guante', 'guante', 'brand', 'calzado'),
('aa320fb9-a51c-4b28-ae98-c12f59adbcdd', 'Skechers', 'skechers', 'brand', 'calzado'),
('e64b3708-6a33-4e98-b28f-3779688089f2', 'Hush Puppies', 'hush-puppies', 'brand', 'calzado'),
('e97b6b97-b037-481e-9e84-230a326f90ba', 'Aldo', 'aldo', 'brand', 'calzado'),
('98fdc54f-804b-412b-8f32-84508ba73a09', 'Nike', 'nike', 'brand', 'calzado'),
('a4b85777-6d6f-424b-a107-fcb0d06992cf', 'adidas', 'adidas', 'brand', 'calzado'),
('3cc35481-58da-4bfd-8785-dbee73b95ef6', 'Nike', 'nike-deportivo', 'brand', 'deportivo'),
('b8ea30a0-0bb4-46f4-a563-0792e9100c9c', 'adidas', 'adidas-deportivo', 'brand', 'deportivo'),
('41318922-b9c8-4bbc-a8a2-5b263a9d69b8', 'Puma', 'puma', 'brand', 'deportivo'),
('bb1c3fb5-17c3-4ad2-86e5-8bcee1e140e6', 'Under Armour', 'under-armour', 'brand', 'deportivo'),
('19722073-9ff2-4cc3-8756-16e496a21d38', 'Reebok', 'reebok', 'brand', 'deportivo'),
('4710ee57-c70f-4e75-8371-969047c103c1', 'New Balance', 'new-balance', 'brand', 'deportivo'),
('e2f31367-0029-45f4-9c89-0de769686073', 'Decathlon', 'decathlon', 'brand', 'deportivo'),
('684fcb21-99e3-49ca-a63a-2d4b7571516d', 'Sparta', 'sparta', 'brand', 'deportivo'),
('bcea6625-2d82-44aa-bba6-afb2c57a9fc3', 'The North Face', 'the-north-face', 'brand', 'outdoor'),
('8e1c077c-bec2-4eff-9de4-4e81c9f3d75e', 'Columbia', 'columbia', 'brand', 'outdoor'),
('6b8becf4-fe29-4f1e-aaea-000409263496', 'Patagonia', 'patagonia', 'brand', 'outdoor'),
('8bb52711-aa05-482b-b0fb-94efbdb1ef05', 'Lippi', 'lippi', 'brand', 'outdoor'),
('28fc92b3-3086-447d-9fef-f79f6a01d998', 'Doite', 'doite', 'brand', 'outdoor'),
('6ae88b04-2af5-44ce-a0ee-74b5f2d003a8', 'Marmot', 'marmot', 'brand', 'outdoor'),
('25dd28db-1073-4518-a65c-e1f8e53db1c4', 'Pandora', 'pandora', 'brand', 'accesorios'),
('139358f1-3215-4548-aaf9-0a747d28c7a8', 'Swarovski', 'swarovski', 'brand', 'accesorios'),
('e8306035-4960-487b-825a-109f58e9dfed', 'Tous', 'tous', 'brand', 'accesorios'),
('c8e36510-71ab-444e-bec0-6c0d7e22244b', 'Secret', 'secret', 'brand', 'accesorios'),
('f3d8366d-7864-464a-b4cc-21a333e85612', 'Amphora', 'amphora', 'brand', 'accesorios'),
('7c833bea-637f-4496-8be0-b910f4e134e9', 'Saxoline', 'saxoline', 'brand', 'accesorios'),
('2e12db5e-64f9-4199-89e5-a27a3576fca8', 'McDonald''s', 'mcdonalds', 'brand', 'fast-food'),
('fb4a440e-2ab8-4cf2-a28b-b8756cc8b809', 'Burger King', 'burger-king', 'brand', 'fast-food'),
('4c50f27d-a2cb-4b4e-8b48-7d6165700a67', 'KFC', 'kfc', 'brand', 'fast-food'),
('a8ccb086-5cc8-44ad-a005-d565b56108bb', 'Subway', 'subway', 'brand', 'fast-food'),
('e111860a-624e-4a74-b18e-44f0f06a2008', 'Doggis', 'doggis', 'brand', 'fast-food'),
('9e41c4da-4ed4-4f6a-9b4f-142aa8040dce', 'Juan Maestro', 'juan-maestro', 'brand', 'fast-food'),
('14222eab-c42f-4d9c-a0bd-f47ab422d6ee', 'Pedro, Juan & Diego', 'pedro-juan-diego', 'brand', 'fast-food'),
('a902dba3-b86e-451b-be7c-30dca153b067', 'Tarragona', 'tarragona', 'brand', 'fast-food'),
('b8209f99-e6e3-41b7-a131-f210a6d541a6', 'Starbucks', 'starbucks', 'brand', 'cafeterias'),
('f1ab3783-d5fc-4a75-a672-c564022daa70', 'Juan Valdez', 'juan-valdez', 'brand', 'cafeterias'),
('ebfd66a4-02be-4994-aea1-3bc63ff737a1', 'Dunkin', 'dunkin', 'brand', 'cafeterias'),
('2818b9c7-aa94-4008-9fb3-8958adef90a9', 'Castaño', 'castano', 'brand', 'cafeterias'),
('e66ee742-4a21-4e7f-ae15-ccacf409828b', 'Tavelli', 'tavelli', 'brand', 'cafeterias'),
('3dce76fd-536b-4a94-a34f-50f14cf31796', 'Café Haiti', 'cafe-haiti', 'brand', 'cafeterias'),
('7b02e2b5-cd6d-4c77-8fc9-17dd957417c6', 'Pizza Hut', 'pizza-hut', 'brand', 'pizza'),
('ea4cf6fd-5132-401d-b71f-9b56b82fffef', 'Papa Johns', 'papa-johns', 'brand', 'pizza'),
('98ed8038-8fa9-45a5-b54d-7564b84ed150', 'Telepizza', 'telepizza', 'brand', 'pizza'),
('417b07f3-fa69-4d35-82ce-425dad855bb2', 'Little Caesars', 'little-caesars', 'brand', 'pizza'),
('048b7fd5-15d7-486c-ad35-7ca4cafe20a4', 'Melt Pizzas', 'melt-pizzas', 'brand', 'pizza'),
('899c2192-4aa4-459b-99f9-9e41ae75644c', 'Domino''s', 'dominos', 'brand', 'pizza'),
('ddeec668-fe2c-443d-b905-b9d0bd2cf0f0', 'PedidosYa', 'pedidosya', 'brand', 'delivery-de-comida'),
('b3eba5fe-dfb7-40e6-b6ac-3a6ce2b79ca9', 'Uber Eats', 'uber-eats', 'brand', 'delivery-de-comida'),
('da1a9a58-13a3-4d0c-932a-cd9fc5d2b36c', 'Rappi', 'rappi', 'brand', 'delivery-de-comida'),
('646dbdcb-317c-4903-806f-f1ef76b894fb', 'Justo', 'justo', 'brand', 'delivery-de-comida'),
('a70fd21a-4a6c-40df-882c-560780253d02', 'DiDi Food', 'didi-food', 'brand', 'delivery-de-comida'),
('551b4fc5-7504-456d-9c95-32d146063c16', 'Orders', 'orders', 'brand', 'delivery-de-comida'),
('cd7dcfbc-e4cf-4d27-bcd7-7ed6d5a19246', 'LATAM', 'latam', 'brand', 'aerolineas'),
('e191d3b3-fde6-420b-8ec1-3f67b656d0c8', 'Sky Airline', 'sky-airline', 'brand', 'aerolineas'),
('09bf5ec1-a597-41d2-a8c2-a8a4b633e125', 'JetSMART', 'jetsmart', 'brand', 'aerolineas'),
('72e358d5-a955-46dc-b145-6207075ce807', 'American Airlines', 'american-airlines', 'brand', 'aerolineas'),
('3de1b045-8a58-447a-b59f-9371d907a79d', 'Delta Air Lines', 'delta-air-lines', 'brand', 'aerolineas'),
('1ce92c40-f1fa-46ae-ae2a-6e3241e961f3', 'United Airlines', 'united-airlines', 'brand', 'aerolineas'),
('14201c6c-062e-4e73-83d6-e55513ead65d', 'Avianca', 'avianca', 'brand', 'aerolineas'),
('250f551d-35c1-44b0-8732-6cff435b4f47', 'Copa Airlines', 'copa-airlines', 'brand', 'aerolineas'),
('c485301f-cba8-4160-8f95-611a7074d5b4', 'Iberia', 'iberia', 'brand', 'aerolineas'),
('f9333663-8772-4be4-83a1-9ea6b1fc71b7', 'Air France', 'air-france', 'brand', 'aerolineas'),
('e68f8a2a-607b-4bbc-b066-371c43303cf1', 'KLM', 'klm', 'brand', 'aerolineas'),
('1b3c44f8-ca06-4b9b-9174-7141557c7846', 'Uber', 'uber', 'brand', 'apps-de-transporte'),
('a7cc6b05-4bee-4edb-bc4c-66549d4ef684', 'Cabify', 'cabify', 'brand', 'apps-de-transporte'),
('9dd999dc-a9ab-494a-860c-70c1908cbc30', 'DiDi', 'didi', 'brand', 'apps-de-transporte'),
('5c78a334-d2f3-49f0-917b-34c3e8c17b30', 'inDrive', 'indrive', 'brand', 'apps-de-transporte'),
('8df205cd-d325-41dd-bdb0-85270f5800a3', 'Awto', 'awto', 'brand', 'apps-de-transporte'),
('4459648e-e745-4f33-9cff-47a104ba8703', 'Transvip', 'transvip', 'brand', 'apps-de-transporte'),
('067f2ff6-b8fa-4608-9121-7c38e131e58c', 'Toyota', 'toyota', 'brand', 'marcas-de-autos'),
('ab66e40b-bd0c-43e7-a74b-d9d336302331', 'Chevrolet', 'chevrolet', 'brand', 'marcas-de-autos'),
('698ccd85-a457-4c1f-b2fb-5527c83fbcb4', 'Hyundai', 'hyundai', 'brand', 'marcas-de-autos'),
('dcf68393-2dec-4623-b4f7-bc93a3a543a5', 'Kia', 'kia', 'brand', 'marcas-de-autos'),
('4e8b0b7e-7308-454f-8b54-81903a488a16', 'Suzuki', 'suzuki', 'brand', 'marcas-de-autos'),
('777bde6c-5d5d-424c-a971-107193638dbe', 'Nissan', 'nissan', 'brand', 'marcas-de-autos'),
('73a3a086-1bc3-4d9d-b41d-4aaa6f286c33', 'Mazda', 'mazda', 'brand', 'marcas-de-autos'),
('2f9261c3-681e-4922-a196-30785eb25746', 'Peugeot', 'peugeot', 'brand', 'marcas-de-autos'),
('8ad4a312-7fdc-4c0e-a4b0-462dadeabcb2', 'BMW', 'bmw', 'brand', 'marcas-de-autos'),
('adbacf59-c440-4ff1-a216-92b19cca8c77', 'Mercedes-Benz', 'mercedes-benz', 'brand', 'marcas-de-autos'),
('18c31f79-7cc1-4440-a517-23d2cffd74ec', 'Chery', 'chery', 'brand', 'marcas-chinas-de-autos'),
('eb958dfc-01d2-43aa-b6fd-4230fbf417ef', 'MG', 'mg', 'brand', 'marcas-chinas-de-autos'),
('11b7d105-0036-4045-a909-ebb75ccd69a4', 'BYD', 'byd', 'brand', 'marcas-chinas-de-autos'),
('dad7cea6-2523-4129-9a5b-da1fe764f911', 'Geely', 'geely', 'brand', 'marcas-chinas-de-autos'),
('340802e6-fbdd-4740-987e-33d3b2fabccc', 'Great Wall', 'great-wall', 'brand', 'marcas-chinas-de-autos'),
('0a254a10-8f15-4c02-96f2-f1aad3f06ed1', 'Haval', 'haval', 'brand', 'marcas-chinas-de-autos'),
('00d33215-083f-4105-9a96-61d128bbd506', 'JAC', 'jac', 'brand', 'marcas-chinas-de-autos'),
('3f36b3cc-a0d7-4ecb-aae2-408c5ebdfd2a', 'Jetour', 'jetour', 'brand', 'marcas-chinas-de-autos'),
('588d7602-f4fe-4e2d-bfb0-4e72321dacad', 'Salazar Israel', 'salazar-israel', 'brand', 'automotoras-concesionarios'),
('8a831252-c309-4e10-be63-f3ee3a61bb84', 'Bruno Fritsch', 'bruno-fritsch', 'brand', 'automotoras-concesionarios'),
('3045db09-bef9-46cd-a4a9-bf71a79f864e', 'DercoCenter', 'dercocenter', 'brand', 'automotoras-concesionarios'),
('d1a29e99-a1f7-4d7c-8125-34a3fc422723', 'Kaufmann', 'kaufmann', 'brand', 'automotoras-concesionarios'),
('a1aa92a5-d043-4aea-a41c-5bd6554b71b1', 'Gildemeister', 'gildemeister', 'brand', 'automotoras-concesionarios'),
('f49f20cd-f319-465e-8592-93671ea99781', 'Portillo', 'portillo', 'brand', 'automotoras-concesionarios'),
('39ac02d0-663c-42a3-ae82-56c8e8b80ff1', 'Netflix', 'netflix', 'brand', 'streaming-de-video'),
('60d39e43-29dd-4ff5-b94d-dfe04b0db53f', 'Disney+', 'disney', 'brand', 'streaming-de-video'),
('5971203b-68e4-4f07-b95f-180471ed2544', 'Max', 'max', 'brand', 'streaming-de-video'),
('b43fe794-1ce5-4ad1-8106-9feea930f548', 'Prime Video', 'prime-video', 'brand', 'streaming-de-video'),
('9ebb3cc2-1443-44d1-ad4e-c0aff2498bb6', 'Apple TV+', 'apple-tv', 'brand', 'streaming-de-video'),
('48a6dbe6-67f7-40fa-af51-2e7c51f7f527', 'Paramount+', 'paramount', 'brand', 'streaming-de-video'),
('7360679c-d922-4c84-bc4a-c81004fa05d9', 'Universal+', 'universal', 'brand', 'streaming-de-video'),
('37c92da0-3d32-45c3-8fd6-bfb558e07914', 'MUBI', 'mubi', 'brand', 'streaming-de-video'),
('71458d1b-6214-4caa-9438-49c71378303d', 'Spotify', 'spotify', 'brand', 'streaming-de-musica'),
('53d208ad-f2d4-4c78-9f31-0023917424ea', 'YouTube Music', 'youtube-music', 'brand', 'streaming-de-musica'),
('0d567b2a-8f99-43b9-8cbc-ff422145004d', 'Apple Music', 'apple-music', 'brand', 'streaming-de-musica'),
('aed07625-a46f-438f-8e1a-03615610dbab', 'Deezer', 'deezer', 'brand', 'streaming-de-musica'),
('14041c51-dbd4-416c-a6fe-d99927c157e2', 'TIDAL', 'tidal', 'brand', 'streaming-de-musica'),
('6b57305e-e768-432a-bfa4-78fb4689a022', 'Amazon Music', 'amazon-music', 'brand', 'streaming-de-musica'),
('002b7667-07ca-49ce-a523-38e0e10dbeea', 'Cineplanet', 'cineplanet', 'brand', 'cines'),
('f8fe8c20-c504-4b46-9dce-497d2284ac52', 'Cinépolis', 'cinepolis', 'brand', 'cines'),
('88f2513a-7598-4cec-a63a-2580910f4586', 'Cinemark', 'cinemark', 'brand', 'cines'),
('c314da28-b590-436b-aeca-8fe4ebc19ed4', 'Muvix', 'muvix', 'brand', 'cines'),
('1a25e691-3d0f-4615-bafc-82a476e261f4', 'Cine Hoyts', 'cine-hoyts', 'brand', 'cines'),
('c04df59c-5eac-475d-924e-1a1336073ba4', 'Cinestar', 'cinestar', 'brand', 'cines'),
('97fa6926-984e-4d1d-8dc0-264dc17368d2', 'Coca-Cola', 'coca-cola', 'brand', 'gaseosas'),
('39b0dcf4-1be6-463c-ad07-f5db4160ceb7', 'Pepsi', 'pepsi', 'brand', 'gaseosas'),
('d3f4bcd5-93bc-40a6-975f-ed0e5dd54a1f', 'Sprite', 'sprite', 'brand', 'gaseosas'),
('90b77991-13f6-40a2-8a94-59a5e4702cc3', 'Fanta', 'fanta', 'brand', 'gaseosas'),
('4a96fa00-540a-438c-84b7-19098011a3ec', 'Schweppes', 'schweppes', 'brand', 'gaseosas'),
('1d326869-15b5-4a08-ad67-2c51c2881938', 'Canada Dry', 'canada-dry', 'brand', 'gaseosas'),
('41bb1e5f-2cf0-4561-91df-0b725890d44e', 'Red Bull', 'red-bull', 'brand', 'energeticas'),
('cc189e82-31a1-45f4-aa8c-0f8605be200d', 'Monster', 'monster', 'brand', 'energeticas'),
('c1a5b2f2-ef82-4771-ae40-0f0b43716cf8', 'Rockstar', 'rockstar', 'brand', 'energeticas'),
('f49a64b9-cb9f-4dc6-81a6-957734fa07ee', 'Burn', 'burn', 'brand', 'energeticas'),
('06fc0a07-770a-4d42-ba05-d8bc93dc5e15', 'Celsius', 'celsius', 'brand', 'energeticas'),
('cc8eeefd-5f11-404b-bbec-cd748864ee5a', 'Prime Energy', 'prime-energy', 'brand', 'energeticas'),
('30bca148-cf5c-4324-a681-ec8fd581ddc4', 'Cristal', 'cristal', 'brand', 'cervezas'),
('cb023ff1-4d37-4e7b-a822-2c0519f0bedd', 'Escudo', 'escudo', 'brand', 'cervezas'),
('cd8bf7fe-ff49-4e89-b48e-15fe04c0bdde', 'Becker', 'becker', 'brand', 'cervezas'),
('ccdc2347-6282-445a-b4a9-0fe8f757745b', 'Kunstmann', 'kunstmann', 'brand', 'cervezas'),
('94e35c1b-de1e-463e-a13e-62595ac2a12f', 'Heineken', 'heineken', 'brand', 'cervezas'),
('91268e9e-5d5b-40b5-8514-79dc27521532', 'Corona', 'corona-cervezas', 'brand', 'cervezas'),
('aaea5271-f67c-4cfb-8891-993f8fcdcc06', 'Cachantun', 'cachantun', 'brand', 'aguas'),
('619bcf96-170d-423e-a143-d9d43984d0ef', 'Benedictino', 'benedictino', 'brand', 'aguas'),
('09c292f3-ea45-4578-ba7d-cadee738c05b', 'Vital', 'vital', 'brand', 'aguas'),
('a03ffae9-ed74-44b9-b9e9-366f1aaf35e6', 'Aquarius', 'aquarius', 'brand', 'aguas'),
('495dfdda-8708-46b3-810e-ae8fe54b70c1', 'Evian', 'evian', 'brand', 'aguas'),
('16ae44ae-06d7-4474-b2e5-444147c6965c', 'Perrier', 'perrier', 'brand', 'aguas'),
('dc89adad-ffba-4486-ad74-c0de550064a8', 'Radio Bío Bío', 'radio-bio-bio', 'brand', 'radios'),
('8d577377-21b1-4e11-b303-81d15c432530', 'ADN Radio', 'adn-radio', 'brand', 'radios'),
('a0ba48e3-fcf4-40ad-82b4-ab728c649127', 'Cooperativa', 'cooperativa', 'brand', 'radios'),
('11e0721a-ce00-40b8-97f4-3225d6704d33', 'Radio Agricultura', 'radio-agricultura', 'brand', 'radios'),
('fa5ab19f-6566-4661-ae8d-86d5fd73521e', 'Pudahuel', 'pudahuel', 'brand', 'radios'),
('996d64ec-3a33-4327-8555-827191eb4c1f', 'Carolina', 'carolina', 'brand', 'radios'),
('5d81644d-4107-43f2-b560-8a2ff7b0cfb0', 'Mega', 'mega', 'brand', 'tv-abierta'),
('d605150a-f042-469c-8856-3a745addc016', 'Chilevisión', 'chilevision', 'brand', 'tv-abierta'),
('684f79a0-387a-47d0-8027-e2b000dd4cf0', 'Canal 13', 'canal-13', 'brand', 'tv-abierta'),
('bf841106-1454-4440-bffe-cd04c35b9be8', 'TVN', 'tvn', 'brand', 'tv-abierta'),
('40b968ae-d55b-429a-be1e-1a45174b27ea', 'La Red', 'la-red', 'brand', 'tv-abierta'),
('285483ea-93f0-4f07-9ca0-7b5c88b9a549', 'TV+', 'tv', 'brand', 'tv-abierta'),
('a9b1f8a9-7160-4510-8011-5f9dc8e009a2', 'Emol', 'emol', 'brand', 'prensa-digital'),
('317b3fce-5279-4515-ba0b-c242cbcb3032', 'La Tercera', 'la-tercera', 'brand', 'prensa-digital'),
('1f373834-4b15-43b3-81d5-9dda2da9052f', 'BioBioChile', 'biobiochile', 'brand', 'prensa-digital'),
('8ee3acbc-e59f-43db-a0d6-d9c5a85d8aab', 'Cooperativa', 'cooperativa-prensa-digital', 'brand', 'prensa-digital'),
('6515df79-b8cf-41ce-a298-bab028d11b2f', 'El Mostrador', 'el-mostrador', 'brand', 'prensa-digital'),
('c9ea81d4-26f9-4829-91e6-ac70c0b2fd16', 'CNN Chile', 'cnn-chile', 'brand', 'prensa-digital'),
('d088e935-2715-4ab0-8826-440d996bb2ae', 'Instagram', 'instagram', 'brand', 'redes-sociales'),
('7969aee0-bafe-478e-acc8-671afeda7162', 'Facebook', 'facebook', 'brand', 'redes-sociales'),
('8a087304-41c0-4ac0-9777-befa7b5390d2', 'TikTok', 'tiktok', 'brand', 'redes-sociales'),
('6360e8b2-170d-465b-ab5f-febf7a5c07ac', 'X', 'x', 'brand', 'redes-sociales'),
('f9727510-032d-47df-ab07-72e166e1708f', 'LinkedIn', 'linkedin', 'brand', 'redes-sociales'),
('763e7451-224d-4c3c-be3f-97bb5f7da079', 'Snapchat', 'snapchat', 'brand', 'redes-sociales'),
('dd4540c9-26ed-4248-a610-9981d88425b7', 'WhatsApp', 'whatsapp', 'brand', 'mensajeria'),
('ef72af49-23d8-47fa-96c7-1487d6af6ca4', 'Telegram', 'telegram', 'brand', 'mensajeria'),
('fe8c3d3b-b83d-4b11-aa73-05bf00382c8d', 'Messenger', 'messenger', 'brand', 'mensajeria'),
('9bc4a627-a3c2-4024-b756-7f980a284e68', 'Signal', 'signal', 'brand', 'mensajeria'),
('cd11c696-b231-46c3-8d30-fc99f015b12c', 'Discord', 'discord', 'brand', 'mensajeria'),
('a21d5cc2-9507-4c7d-b214-15bb1549275a', 'WeChat', 'wechat', 'brand', 'mensajeria'),
('08c221db-82bc-4480-9323-e141674bd19e', 'Reddit', 'reddit', 'brand', 'comunidades-foros'),
('9385c3a3-f3aa-449b-9dfa-a86c0027de80', 'Discord', 'discord-comunidades-foros', 'brand', 'comunidades-foros'),
('2bcef021-6076-4ccf-93ff-826def278fe9', 'Quora', 'quora', 'brand', 'comunidades-foros'),
('1797e3b9-6b8d-4eb7-a806-73441add7e2f', 'Tumblr', 'tumblr', 'brand', 'comunidades-foros'),
('7bb944a3-850c-4fe3-8a24-774fae621bc7', 'Pinterest', 'pinterest', 'brand', 'comunidades-foros'),
('e85c1175-5b17-424f-b816-3237fd28c71f', 'Steam Community', 'steam-community', 'brand', 'comunidades-foros'),
('67106386-e166-48ee-a2b8-ba320cacf740', 'Universidad de Chile', 'universidad-de-chile', 'brand', 'universidades'),
('1c5be268-ba3d-43f5-83f0-72b926468e7f', 'Pontificia Universidad Católica', 'pontificia-universidad-catolica', 'brand', 'universidades'),
('5baeb942-80f5-46e3-b455-cd1b8fae0762', 'Universidad de Concepción', 'universidad-de-concepcion', 'brand', 'universidades'),
('19504472-6e92-4ddf-bb6e-b48518c1a832', 'USACH', 'usach', 'brand', 'universidades'),
('1b98da8a-3fcb-46a7-aa51-79436ddd5fc6', 'UAI', 'uai', 'brand', 'universidades'),
('0d14ce7b-0f6a-4eaa-a738-d0134b1efe78', 'UDP', 'udp', 'brand', 'universidades'),
('e61d515d-011c-4fd0-9726-60419af7cc2e', 'INACAP', 'inacap', 'brand', 'institutos-cft'),
('68cd9431-cfd0-441e-8f32-ac34aced4802', 'Duoc UC', 'duoc-uc', 'brand', 'institutos-cft'),
('deb52b0d-9f7c-4842-8188-0dc0085615c7', 'AIEP', 'aiep', 'brand', 'institutos-cft'),
('002182d4-e85a-4cdf-a8a0-a3be01b3cbc4', 'Santo Tomás', 'santo-tomas', 'brand', 'institutos-cft'),
('6c31205b-9ce4-4c97-8cab-18209ec8f76c', 'IPChile', 'ipchile', 'brand', 'institutos-cft'),
('b3e6eb5a-165a-4510-86cc-351089e88a96', 'ENAC', 'enac', 'brand', 'institutos-cft'),
('f864bdf9-37c5-4c90-b789-9990e3479e9c', 'Cpech', 'cpech', 'brand', 'preuniversitarios'),
('b1d0a1d9-d2ad-40eb-9141-be41aaa81882', 'Pedro de Valdivia', 'pedro-de-valdivia', 'brand', 'preuniversitarios'),
('0f462959-f21c-496a-9b2b-69263d124939', 'Preu UC', 'preu-uc', 'brand', 'preuniversitarios'),
('94b68eaa-418b-4fd4-88fd-af346b3ce828', 'Puntaje Nacional', 'puntaje-nacional', 'brand', 'preuniversitarios'),
('4b369c2b-90fb-4a20-897a-9b4ce6cdc34d', 'Filadd', 'filadd', 'brand', 'preuniversitarios'),
('617f0f08-53a9-4ee8-8e96-ac1502c4879b', 'M30M', 'm30m', 'brand', 'preuniversitarios'),
('de3e511d-a74c-4af0-a72b-c121ab503ed4', 'Colo-Colo', 'colo-colo', 'brand', 'futbol-chileno'),
('b3f8b4dc-719a-40d3-9ab5-9691ae5a3649', 'Universidad de Chile', 'universidad-de-chile-futbol-chileno', 'brand', 'futbol-chileno'),
('85edc30e-dd3d-4203-9676-756005721bd3', 'Universidad Católica', 'universidad-catolica', 'brand', 'futbol-chileno'),
('c6078700-b307-4298-b2c8-5f9e7b7e842a', 'Cobreloa', 'cobreloa', 'brand', 'futbol-chileno'),
('a8443a84-6ab4-411f-ad43-d3b11ace217d', 'Santiago Wanderers', 'santiago-wanderers', 'brand', 'futbol-chileno'),
('0c9ecc6a-2f6f-4337-bcd2-c3ae50f21466', 'Unión Española', 'union-espanola', 'brand', 'futbol-chileno'),
('54f3c8ba-ac51-4d87-8a3f-bc5ad377c748', 'Concha y Toro', 'concha-y-toro', 'brand', 'vinas'),
('c56ac794-ee77-4f8b-a208-83df35640dd7', 'Santa Rita', 'santa-rita', 'brand', 'vinas'),
('28fcc459-5711-4f8b-a8b1-0adf25758445', 'San Pedro', 'san-pedro', 'brand', 'vinas'),
('fde929be-5f64-4d10-9306-e3846bad06a9', 'Undurraga', 'undurraga', 'brand', 'vinas'),
('bb01ff55-cb0d-459e-93b0-4b7299b8afff', 'Montes', 'montes', 'brand', 'vinas'),
('48238b26-5d40-4ff8-8434-1a02fc833f78', 'Miguel Torres', 'miguel-torres', 'brand', 'vinas'),
('1d5b7dc9-9697-4a5f-a0b2-1ba205fff867', 'La Cav', 'la-cav', 'brand', 'tiendas-de-vino'),
('5460ff82-c999-4512-ad7f-12ad17286933', 'El Mundo del Vino', 'el-mundo-del-vino', 'brand', 'tiendas-de-vino'),
('d80e6f0f-3038-4d18-ae51-b53b93ba2823', 'La Vinoteca', 'la-vinoteca', 'brand', 'tiendas-de-vino'),
('26f5c0d4-aa3e-462a-b3bd-3e07e188f339', 'Descorcha', 'descorcha', 'brand', 'tiendas-de-vino'),
('0e584ab7-d766-44e6-9b23-312444b14d16', 'Tienda Santa Rita', 'tienda-santa-rita', 'brand', 'tiendas-de-vino'),
('09e4fd67-48cc-4558-9f7e-c39f528f9073', 'Tienda Concha y Toro', 'tienda-concha-y-toro', 'brand', 'tiendas-de-vino'),
('12352393-c6a4-4f13-99c1-f40d7d0e95f3', 'Pedigree', 'pedigree', 'brand', 'alimento-para-perros'),
('7533fc82-e6ef-40a3-b764-0df63908f152', 'Dog Chow', 'dog-chow', 'brand', 'alimento-para-perros'),
('bc0f0bfb-cf80-46b3-817c-326486e40ffe', 'Pro Plan', 'pro-plan', 'brand', 'alimento-para-perros'),
('4f71fcb0-99df-49a5-b66d-074050da95f5', 'Royal Canin', 'royal-canin', 'brand', 'alimento-para-perros'),
('a2e8b7b2-647c-493f-a879-48f30cbad04e', 'Bravery', 'bravery', 'brand', 'alimento-para-perros'),
('988787c8-3b99-4ad0-8474-078db15c3ff9', 'Acana', 'acana', 'brand', 'alimento-para-perros'),
('522799e7-5d32-4259-830d-4c253417a892', 'Whiskas', 'whiskas', 'brand', 'alimento-para-gatos'),
('7722b5c5-7c25-41a3-beab-9240a16be8c1', 'Cat Chow', 'cat-chow', 'brand', 'alimento-para-gatos'),
('697eac14-14bb-4725-8a26-bdaa3fc1afdd', 'Pro Plan', 'pro-plan-alimento-para-gatos', 'brand', 'alimento-para-gatos'),
('ad11ac4c-0833-438b-a35c-a6d47e878a96', 'Royal Canin', 'royal-canin-alimento-para-gatos', 'brand', 'alimento-para-gatos'),
('010f51f1-aeb1-4459-ab71-8d5c8cdcac7c', 'Bravery', 'bravery-alimento-para-gatos', 'brand', 'alimento-para-gatos'),
('b1f7d249-465c-4cd5-9118-585377067764', 'Acana', 'acana-alimento-para-gatos', 'brand', 'alimento-para-gatos'),
('c1911848-601f-480b-8a55-73e9ca7e5c65', 'SuperZoo', 'superzoo', 'brand', 'tiendas-de-mascotas'),
('ee4a8899-c8c6-44c2-be86-2728e8681ba6', 'Club de Perros y Gatos', 'club-de-perros-y-gatos', 'brand', 'tiendas-de-mascotas'),
('22a16b2a-31b3-4c27-b9cb-87141c773f89', 'Pet Happy', 'pet-happy', 'brand', 'tiendas-de-mascotas'),
('a7114d7b-3a48-4316-bbab-75f76546b552', 'Petslandia', 'petslandia', 'brand', 'tiendas-de-mascotas'),
('e7a28daa-90a5-4850-86e2-b37eff8882ab', 'Pet BJ', 'pet-bj', 'brand', 'tiendas-de-mascotas'),
('a58e2c1f-529b-4fb1-9a65-8142d93c48f4', 'Maspet', 'maspet', 'brand', 'tiendas-de-mascotas'),
('346806f9-5a41-4608-be9b-be396f3522f1', 'VetPoint', 'vetpoint', 'brand', 'clinicas-veterinarias'),
('fdbe7201-3c3c-4412-94f5-fe9b17e1f52d', 'PetSalud', 'petsalud', 'brand', 'clinicas-veterinarias'),
('50038834-dfb2-4560-b99b-405603837e38', 'Hospital Clínico Veterinario U. de Chile', 'hospital-clinico-veterinario-u-de-chile', 'brand', 'clinicas-veterinarias'),
('3dfb93c0-7391-4e87-b9de-acb56cbf7ffd', 'Vet24', 'vet24', 'brand', 'clinicas-veterinarias'),
('8b0515e1-03e8-48b3-8613-cf48efd7d866', 'Vets', 'vets', 'brand', 'clinicas-veterinarias'),
('5799a121-ab57-43bc-8301-88f38df94ef8', 'Clínica Veterinaria Alemana', 'clinica-veterinaria-alemana', 'brand', 'clinicas-veterinarias'),
('64121e57-03bf-442b-a82d-d91d5b4397fd', 'Head & Shoulders', 'head-shoulders', 'brand', 'shampoo'),
('54d9d1c5-2923-491e-8768-ac21428d6f73', 'Pantene', 'pantene', 'brand', 'shampoo'),
('3135188c-7b1f-418d-a7f2-97f8ceab3e64', 'Sedal', 'sedal', 'brand', 'shampoo'),
('9d295c6e-92a1-46df-b9a5-d00537d65fa0', 'Dove', 'dove', 'brand', 'shampoo'),
('ea7345f4-03bf-412f-b504-af92c2a9479f', 'Elvive', 'elvive', 'brand', 'shampoo'),
('c0d8601f-5fae-4543-8c2f-f62c41e5d4f5', 'Tío Nacho', 'tio-nacho', 'brand', 'shampoo'),
('58f1c1de-56a9-4c93-ab75-3315108cc0da', 'Rexona', 'rexona', 'brand', 'desodorantes'),
('9ee64027-d331-42b5-883d-df2f8b84e5ac', 'Dove', 'dove-desodorantes', 'brand', 'desodorantes'),
('81834b86-784a-42e5-abc1-4867c31083fc', 'Nivea', 'nivea', 'brand', 'desodorantes'),
('05846732-9afb-4278-8a18-19b36d2f5ba0', 'Axe', 'axe', 'brand', 'desodorantes'),
('7fb04f99-3721-4724-a280-92e0d957b36c', 'Lady Speed Stick', 'lady-speed-stick', 'brand', 'desodorantes'),
('c2d088e6-36e8-4532-abd1-1dd1febd9442', 'Old Spice', 'old-spice', 'brand', 'desodorantes'),
('c5c8735b-83e5-4241-89aa-44239a6422f4', 'Colgate', 'colgate', 'brand', 'pastas-dentales'),
('1b73cea2-b225-4c21-9068-d7f556d3a425', 'Oral-B', 'oral-b', 'brand', 'pastas-dentales'),
('fa761548-00c5-481d-b1db-48d17889eb95', 'Sensodyne', 'sensodyne', 'brand', 'pastas-dentales'),
('e35f8c68-4367-45ae-8512-9499cff0f4d5', 'Closeup', 'closeup', 'brand', 'pastas-dentales'),
('c6c3a2c8-91eb-4f31-9dae-0423c52f2dc1', 'Pepsodent', 'pepsodent', 'brand', 'pastas-dentales'),
('42af9d4a-0993-4acb-a687-cfc71c85e722', 'Aquafresh', 'aquafresh', 'brand', 'pastas-dentales'),
('6ab492ba-254e-4a17-940d-76e5faf8fa5c', 'La Roche-Posay Anthelios', 'la-roche-posay-anthelios', 'brand', 'proteccion-solar'),
('7c28e951-3795-4865-888e-7e1d99a55a0e', 'ISDIN', 'isdin', 'brand', 'proteccion-solar'),
('3ab9ea52-881d-457f-82b9-a19d24efda3d', 'Eucerin Sun', 'eucerin-sun', 'brand', 'proteccion-solar'),
('e4b9ae16-3441-42d9-ade7-fc6ca8b11443', 'Vichy Capital Soleil', 'vichy-capital-soleil', 'brand', 'proteccion-solar'),
('2df50743-6428-4d8d-8560-806f1974dc95', 'Raytan', 'raytan', 'brand', 'proteccion-solar'),
('517ab6f5-5387-46db-b8e1-40306a7c9d85', 'Hawaiian Tropic', 'hawaiian-tropic', 'brand', 'proteccion-solar'),
('7d9efcd5-9634-4f44-af5e-efeb3011b02c', 'MAC', 'mac', 'brand', 'cosmeticos-maquillaje'),
('b4588386-6e22-450b-9888-23b8589d865f', 'Maybelline', 'maybelline', 'brand', 'cosmeticos-maquillaje'),
('ce9ba58e-da9c-45c3-b88e-e9257dafc2fc', 'Petrizzio', 'petrizzio', 'brand', 'cosmeticos-maquillaje'),
('5bb2e014-765f-47bd-84a6-8b45f2cae26d', 'NYX', 'nyx', 'brand', 'cosmeticos-maquillaje'),
('9b65e395-cc84-4f38-99c5-1c5ec1609c1e', 'Natura', 'natura', 'brand', 'cosmeticos-maquillaje'),
('d7b29387-489a-407c-b044-9351ac82a265', 'L''Oréal Paris', 'loreal-paris', 'brand', 'cosmeticos-maquillaje'),
('bb1baf9b-98c4-4e6a-b994-57be98e9aa26', 'La Roche-Posay', 'la-roche-posay', 'brand', 'skincare'),
('fc9b6773-dfae-4583-9213-2f6b4cf1d378', 'Vichy', 'vichy', 'brand', 'skincare'),
('d8be92ce-b3b8-4641-bc00-17c8f1a63cd8', 'Cetaphil', 'cetaphil', 'brand', 'skincare'),
('9d5ea445-a919-492f-870f-ae81fb5e02ae', 'CeraVe', 'cerave', 'brand', 'skincare'),
('45cd3a90-897e-4e4d-91ca-c415f6501f16', 'Eucerin', 'eucerin', 'brand', 'skincare'),
('3e3cd239-23c0-472e-94ca-dc662f93e736', 'Bioderma', 'bioderma', 'brand', 'skincare'),
('10f01255-b92d-44f3-b401-c7bd09436220', 'Chanel', 'chanel', 'brand', 'perfumes'),
('567b7aec-3662-4099-8459-88a349e48614', 'Dior', 'dior', 'brand', 'perfumes'),
('0f29c7fc-bfcf-45fb-b4ef-238c520804f0', 'Carolina Herrera', 'carolina-herrera', 'brand', 'perfumes'),
('cc8090aa-f0a1-4d0d-a3d7-f615cbe26188', 'Rabanne', 'rabanne', 'brand', 'perfumes'),
('da19077a-2e17-4189-861f-eca87071193c', 'Calvin Klein', 'calvin-klein', 'brand', 'perfumes'),
('95e45012-a11d-4fb3-bf1d-d94ff1da5f1a', 'Hugo Boss', 'hugo-boss', 'brand', 'perfumes'),
('a89519fa-2df6-4430-b665-b34b2ab4a591', 'Samsung', 'samsung', 'brand', 'refrigeradores'),
('7c39c0c3-83f0-40f5-94b6-bb0d49077844', 'LG', 'lg', 'brand', 'refrigeradores'),
('e02002c4-1bc1-44a0-9f9d-555652cdbbed', 'Midea', 'midea', 'brand', 'refrigeradores'),
('1d9deb5b-94cc-4597-9b65-6c1b52654026', 'Bosch', 'bosch', 'brand', 'refrigeradores'),
('3211e5b0-97e5-46b2-b6f8-84fb033ca73e', 'Whirlpool', 'whirlpool', 'brand', 'refrigeradores'),
('232bbe27-668c-406f-917a-713ddec90174', 'Electrolux', 'electrolux', 'brand', 'refrigeradores'),
('d5b1b0aa-139a-488f-a8a3-7cfdfd6af9a4', 'Samsung', 'samsung-lavadoras', 'brand', 'lavadoras'),
('f3edbeca-8cfa-441e-97c6-66b007a782be', 'LG', 'lg-lavadoras', 'brand', 'lavadoras'),
('db5a70bf-030c-4ae3-b254-08b79851c460', 'Midea', 'midea-lavadoras', 'brand', 'lavadoras'),
('1f1a2fdc-b1b5-430c-b873-9786b6bb1777', 'Bosch', 'bosch-lavadoras', 'brand', 'lavadoras'),
('7d807a2c-bb03-4d2a-b016-6f177303bab8', 'Whirlpool', 'whirlpool-lavadoras', 'brand', 'lavadoras'),
('09b590e4-f580-49f3-a9b1-8ae54c60ef2e', 'Fensa', 'fensa', 'brand', 'lavadoras'),
('c9d3598d-f377-4072-a43b-6ea2db797f81', 'Dyson', 'dyson', 'brand', 'aspiradoras'),
('9d5174f0-3f9e-4b0f-a10a-57db2e1fc64f', 'Thomas', 'thomas', 'brand', 'aspiradoras'),
('1184995e-5599-41f8-a7f5-32ec9b7e040d', 'Ursus Trotter', 'ursus-trotter', 'brand', 'aspiradoras'),
('dabd5dbd-323d-4148-a50a-e5660695b006', 'Electrolux', 'electrolux-aspiradoras', 'brand', 'aspiradoras'),
('1bf34885-de38-47ae-8ef4-f9871e359e53', 'Philips', 'philips', 'brand', 'aspiradoras'),
('b3102fe6-7751-44f4-b554-3b4e110fbac3', 'Xiaomi', 'xiaomi', 'brand', 'aspiradoras'),
('957378ec-2571-4fb0-8dbf-0a17471875d1', 'Rosen', 'rosen', 'brand', 'colchones'),
('0c3589c3-4266-4266-a125-b93170d156d2', 'CIC', 'cic', 'brand', 'colchones'),
('17817412-cb0b-48cb-aefd-b2e90bc52ffd', 'Flex', 'flex', 'brand', 'colchones'),
('02ef920c-c8d7-4a33-9405-0792e5ceb25c', 'Drimkip', 'drimkip', 'brand', 'colchones'),
('ae2fee37-5a94-4fd8-bfc6-f06eef6ef3cd', 'Emma', 'emma', 'brand', 'colchones'),
('d5dee09b-7d98-41af-ac41-e48465ad52e2', 'Mantahue', 'mantahue', 'brand', 'colchones'),
('0327ef73-0f94-4b7e-b159-64994500fe95', 'Apple iPhone', 'apple-iphone', 'brand', 'smartphones'),
('5aaed809-0ba4-4456-a7eb-4d475f9b16e9', 'Samsung Galaxy', 'samsung-galaxy', 'brand', 'smartphones'),
('f4c40a89-858b-4f8e-a1be-16a65abfe3a6', 'Xiaomi', 'xiaomi-smartphones', 'brand', 'smartphones'),
('e370722b-e7ee-482c-9435-75dfd956f76a', 'Motorola', 'motorola', 'brand', 'smartphones'),
('aba994f9-a32e-4176-a883-7a8721117f7a', 'Huawei', 'huawei', 'brand', 'smartphones'),
('212c85ae-91e4-4a86-a1c0-d0620ff1fae9', 'Honor', 'honor', 'brand', 'smartphones'),
('1db538e4-c02c-48f5-9548-5fab3d9443eb', 'Oppo', 'oppo', 'brand', 'smartphones'),
('a95dbc14-0056-4eec-8bea-79ba37136905', 'Realme', 'realme', 'brand', 'smartphones'),
('3650f6be-973b-4fac-9bb3-4cbc87500ddf', 'Apple MacBook', 'apple-macbook', 'brand', 'notebooks'),
('bca1a8d8-06ec-4674-8ba5-a6ef3ab410f6', 'Lenovo', 'lenovo', 'brand', 'notebooks'),
('028c7743-97cf-4fe2-ae5c-bc5fa9b72153', 'HP', 'hp', 'brand', 'notebooks'),
('b203db4f-a99b-4ddc-8779-520593122029', 'Dell', 'dell', 'brand', 'notebooks'),
('998bd7ce-0c41-4268-b1a3-5ab23faf2c48', 'ASUS', 'asus', 'brand', 'notebooks'),
('f27de973-492a-4fe6-aa4f-8fb676a8f901', 'Acer', 'acer', 'brand', 'notebooks'),
('8bbde015-a8f0-4553-895b-4f3ce0a46881', 'MSI', 'msi', 'brand', 'notebooks'),
('b004aaea-4e10-466f-8687-bc9775eeb32b', 'Sony', 'sony', 'brand', 'audifonos'),
('1b6d6bfb-f8b1-4b91-bde4-a7c4828b7f20', 'JBL', 'jbl', 'brand', 'audifonos'),
('bb7d4bc7-8f4a-4038-a3d7-e831391c7244', 'Apple AirPods', 'apple-airpods', 'brand', 'audifonos'),
('4774e7c7-222a-457b-8050-5b99ebad5361', 'Samsung Galaxy Buds', 'samsung-galaxy-buds', 'brand', 'audifonos'),
('c5274ae9-ff50-406f-a326-0162667a9b0f', 'Bose', 'bose', 'brand', 'audifonos'),
('539c3718-c06a-4e08-b70f-e927849528b0', 'Skullcandy', 'skullcandy', 'brand', 'audifonos'),
('d86ef69d-2022-43fd-88cc-c090070848e8', 'Apple Watch', 'apple-watch', 'brand', 'smartwatches'),
('9625291f-6c4c-4ac7-9ee9-7c0a9d40b7df', 'Samsung Galaxy Watch', 'samsung-galaxy-watch', 'brand', 'smartwatches'),
('671ee384-e02e-4e38-ab7d-38ff4c5742d6', 'Garmin', 'garmin', 'brand', 'smartwatches'),
('4d742590-4980-44f1-a253-ce911648bae7', 'Huawei Watch', 'huawei-watch', 'brand', 'smartwatches'),
('5bc4b453-d46b-47ca-b8cb-daf76fd284c2', 'Xiaomi Watch', 'xiaomi-watch', 'brand', 'smartwatches'),
('c2b61f05-2b97-457f-8382-8b8e29d79bde', 'Amazfit', 'amazfit', 'brand', 'smartwatches'),
('39bd4367-a2ab-47ad-915c-591b74637fc3', 'Samsung', 'samsung-televisores', 'brand', 'televisores'),
('3f6925b5-03a1-4478-8f16-625ddd6431fc', 'LG', 'lg-televisores', 'brand', 'televisores'),
('37fd2746-56d9-4a0d-8377-d04d8b5d8408', 'Sony', 'sony-televisores', 'brand', 'televisores'),
('daaa40aa-2268-4d98-a75e-e2ea3dd864c6', 'TCL', 'tcl', 'brand', 'televisores'),
('49905596-77b5-4b33-aac6-bced6274e71d', 'Hisense', 'hisense', 'brand', 'televisores'),
('d43c2c68-f746-41ae-b777-0f3fe192dcc1', 'Philips', 'philips-televisores', 'brand', 'televisores'),
('4ec3ebb8-7719-4b96-a2ae-ba561a981db8', 'Apple iPad', 'apple-ipad', 'brand', 'tablets'),
('20eaa938-d255-473c-860b-1ef25fbf549e', 'Samsung Galaxy Tab', 'samsung-galaxy-tab', 'brand', 'tablets'),
('c6a1fb2a-07d6-443c-9c8e-9476d00fb3f5', 'Xiaomi Pad', 'xiaomi-pad', 'brand', 'tablets'),
('ef8fd70d-b508-4d1a-afc4-d7a4fa8cf308', 'Lenovo Tab', 'lenovo-tab', 'brand', 'tablets'),
('91d45cb1-19af-435e-bd89-be03c62960ff', 'Huawei MatePad', 'huawei-matepad', 'brand', 'tablets'),
('4404c608-f88f-414c-950c-dd4d3b5f4d4c', 'Honor Pad', 'honor-pad', 'brand', 'tablets'),
('19cdb202-0fba-4c3b-84eb-ca13726d16d9', 'PlayStation', 'playstation', 'brand', 'consolas'),
('79d1630f-7402-48e4-9126-622c3bca7af7', 'Xbox', 'xbox', 'brand', 'consolas'),
('a90a912d-86a2-4452-b576-9fb63a1c2097', 'Nintendo Switch', 'nintendo-switch', 'brand', 'consolas'),
('0b0319f3-855a-4415-8694-493eeac1aaa8', 'Steam Deck', 'steam-deck', 'brand', 'consolas'),
('75284896-cdbf-4323-b811-cc7e4328e2b5', 'ASUS ROG Ally', 'asus-rog-ally', 'brand', 'consolas'),
('8c0d8088-8528-49ba-a153-424f398a6c3a', 'Lenovo Legion Go', 'lenovo-legion-go', 'brand', 'consolas'),
('f4a0e1b5-f7ff-4409-b915-a696696672f0', 'Logitech G', 'logitech-g', 'brand', 'perifericos-gamer'),
('044e944b-7588-4266-8672-53af84916a74', 'Razer', 'razer', 'brand', 'perifericos-gamer'),
('c50c2b13-9bad-4fc7-adb3-3bf1ef3113f1', 'HyperX', 'hyperx', 'brand', 'perifericos-gamer'),
('164e08fc-5705-4763-8124-581fbf041c5a', 'Corsair', 'corsair', 'brand', 'perifericos-gamer'),
('2b7bb1f3-f63a-4268-96ab-7a42dc53c311', 'SteelSeries', 'steelseries', 'brand', 'perifericos-gamer'),
('636b9ffd-23e0-42f1-b9bf-debe4d20507c', 'Redragon', 'redragon', 'brand', 'perifericos-gamer'),
('6831a98a-80fc-41da-959b-59150ae5017f', 'Samsung Odyssey', 'samsung-odyssey', 'brand', 'monitores-gamer'),
('44ab2a01-aded-4014-b72d-1f690021cddc', 'LG UltraGear', 'lg-ultragear', 'brand', 'monitores-gamer'),
('39134317-6f6b-4306-9589-fe537d43a75a', 'ASUS ROG', 'asus-rog', 'brand', 'monitores-gamer'),
('18af38b8-2af7-453d-a92a-71c1b8060802', 'AOC', 'aoc', 'brand', 'monitores-gamer'),
('bf0e8d28-70fe-495e-a1ed-90d62b1a2fbb', 'Acer Predator', 'acer-predator', 'brand', 'monitores-gamer'),
('e4b9412c-f91d-49d1-be4c-665ce4b0b2d6', 'MSI', 'msi-monitores-gamer', 'brand', 'monitores-gamer'),
('f9f09954-498b-4eb1-ae37-f97449e1dc08', 'Pampers', 'pampers', 'brand', 'panales'),
('0dac85af-5a8e-4acb-93ac-16f187176016', 'Huggies', 'huggies', 'brand', 'panales'),
('bf8584dd-4c55-4405-8b66-9424d8d850a8', 'Babysec', 'babysec', 'brand', 'panales'),
('178c57cb-1809-42e0-9777-f705a6c1f54a', 'BBTips', 'bbtips', 'brand', 'panales'),
('88ea3c82-c873-48e5-9383-a6af133df66b', 'Pampers Premium Care', 'pampers-premium-care', 'brand', 'panales'),
('13e189cc-8015-42f4-ae85-7a93a05f0bc1', 'Huggies Natural Care', 'huggies-natural-care', 'brand', 'panales'),
('87fcb501-b88e-4dd7-b513-77cdc56e5b80', 'NAN', 'nan', 'brand', 'formula-alimentacion-infantil'),
('321d5407-f397-4427-9029-c2ac73a932da', 'Nidal', 'nidal', 'brand', 'formula-alimentacion-infantil'),
('ddb8fee9-225f-40ce-a2e0-914f32ffc11c', 'Enfamil', 'enfamil', 'brand', 'formula-alimentacion-infantil'),
('aa59eee7-2361-4eb3-b595-8d5c05fbc01e', 'Similac', 'similac', 'brand', 'formula-alimentacion-infantil'),
('ae64612c-cafd-4bf9-b6c7-8f47665a862a', 'S-26', 's-26', 'brand', 'formula-alimentacion-infantil'),
('3aec06f2-56cb-48b4-a10c-848e5b9cbc35', 'Pediasure', 'pediasure', 'brand', 'formula-alimentacion-infantil'),
('4fb7aa7c-91e1-4bc6-8700-2ba1e23efa35', 'Pampers', 'pampers-toallitas-humedas', 'brand', 'toallitas-humedas'),
('8af20120-890c-483e-a890-6c2c2c354d4c', 'Huggies', 'huggies-toallitas-humedas', 'brand', 'toallitas-humedas'),
('3fdd06b1-8b1d-4274-b86c-ded4dcf14d01', 'Babysec', 'babysec-toallitas-humedas', 'brand', 'toallitas-humedas'),
('cd9e3e67-e32c-4280-8dbb-a36cadf7034e', 'BBTips', 'bbtips-toallitas-humedas', 'brand', 'toallitas-humedas'),
('df6975ef-0bac-4fc5-b80f-198bf1c6cd3c', 'WaterWipes', 'waterwipes', 'brand', 'toallitas-humedas'),
('0fc8a9f8-b0a8-4663-8a5d-1ea2f3c1677e', 'Bebesit', 'bebesit', 'brand', 'toallitas-humedas'),
('4e7dd88d-653e-4c94-be2e-5145f8aee596', 'Bebesit', 'bebesit-cochecitos', 'brand', 'cochecitos'),
('0dd07991-c3d9-4246-9a2b-d1aef140dbf0', 'Infanti', 'infanti', 'brand', 'cochecitos'),
('b926258c-c775-46e7-bf9d-50fc924c149c', 'Chicco', 'chicco', 'brand', 'cochecitos'),
('648bc54f-1b75-426d-8641-773802b7c7e5', 'Joie', 'joie', 'brand', 'cochecitos'),
('8dfa8baa-991f-46e6-8c46-d2744b9fe919', 'Graco', 'graco', 'brand', 'cochecitos'),
('177aaa45-d831-4d5b-a9c6-752320f0f706', 'Maxi-Cosi', 'maxi-cosi', 'brand', 'cochecitos');

INSERT INTO battles (id, title, category_id, status) VALUES
('9ce9a4ca-2d34-4666-ba82-09534a7e5ec0', 'Enfrentamiento en Clínicas', 'dcd1b1df-2663-447b-afba-1ca4ad96c000', 'active'),
('0b2a042c-a64f-4530-ace1-db239d468402', 'Enfrentamiento en Clínicas', 'dcd1b1df-2663-447b-afba-1ca4ad96c000', 'active'),
('65650950-eab5-4e1b-83a7-3730293109c5', 'Enfrentamiento en Clínicas', 'dcd1b1df-2663-447b-afba-1ca4ad96c000', 'active'),
('93b0cf4b-a8bc-4e54-8d5f-14ed4f6cada5', 'Enfrentamiento en Centros médicos', 'e420cf10-1b4f-4f24-994c-6cb4e00595ee', 'active'),
('7a4f05d9-370f-4277-a7a4-10b16a42f8c4', 'Enfrentamiento en Centros médicos', 'e420cf10-1b4f-4f24-994c-6cb4e00595ee', 'active'),
('d6c48935-6714-4115-9168-f7fcfcc5137d', 'Enfrentamiento en Centros médicos', 'e420cf10-1b4f-4f24-994c-6cb4e00595ee', 'active'),
('fe911290-7f60-4fc2-ad64-b0b2d3fa03eb', 'Enfrentamiento en Farmacias', 'ac94fe10-4baa-4657-b15b-887760c81e77', 'active'),
('634fee5d-6def-48fe-adae-4c4ea0c939c2', 'Enfrentamiento en Farmacias', 'ac94fe10-4baa-4657-b15b-887760c81e77', 'active'),
('9e6732b0-4a44-4b94-949d-4c8024911bca', 'Enfrentamiento en Farmacias', 'ac94fe10-4baa-4657-b15b-887760c81e77', 'active'),
('a977a9b2-e78e-4ccd-865e-259371b40eaf', 'Enfrentamiento en Isapres', '01c26971-c145-4b4f-aa07-44722ebabcab', 'active'),
('ef628748-601e-4b77-8661-6cc48dfc8840', 'Enfrentamiento en Isapres', '01c26971-c145-4b4f-aa07-44722ebabcab', 'active'),
('524f6962-bf2d-4a00-84b8-aa1fee10b73d', 'Enfrentamiento en Isapres', '01c26971-c145-4b4f-aa07-44722ebabcab', 'active'),
('c6902f07-c199-4b34-9485-523cacf12717', 'Enfrentamiento en Seguros de salud', '39fc65f0-6ed6-437f-beee-05a265338745', 'active'),
('b48d27d3-2526-43ac-aae5-2bb2a2e8813a', 'Enfrentamiento en Seguros de salud', '39fc65f0-6ed6-437f-beee-05a265338745', 'active'),
('740f8219-9997-443f-ad1d-d81936e7909b', 'Enfrentamiento en Seguros de salud', '39fc65f0-6ed6-437f-beee-05a265338745', 'active'),
('fea0b48c-461d-4a7d-ba74-7a31c1ebbef6', 'Enfrentamiento en Bancos', '992629c0-25fd-42ff-907a-2b7c4efb62db', 'active'),
('60ccd136-040a-42f3-bdfb-9e74e2cddfdb', 'Enfrentamiento en Bancos', '992629c0-25fd-42ff-907a-2b7c4efb62db', 'active'),
('f8126036-1e13-450d-b5aa-13f9084369d2', 'Enfrentamiento en Bancos', '992629c0-25fd-42ff-907a-2b7c4efb62db', 'active'),
('4cc5eb95-858f-44b8-8e9c-194fa5fe35bf', 'Enfrentamiento en Bancos', '992629c0-25fd-42ff-907a-2b7c4efb62db', 'active'),
('380e27d3-ebff-4b15-8ad0-192be087dd55', 'Enfrentamiento en Bancos', '992629c0-25fd-42ff-907a-2b7c4efb62db', 'active'),
('659275e4-2279-4ffe-990f-8b625ada9317', 'Enfrentamiento en Fintech / billeteras', '3b4c48a6-0590-492e-b234-11d8161bd711', 'active'),
('262966b7-ed31-4bf4-b09d-e0d2c427f4b9', 'Enfrentamiento en Fintech / billeteras', '3b4c48a6-0590-492e-b234-11d8161bd711', 'active'),
('6edf0e99-40b0-4de8-9729-443305cbaf2d', 'Enfrentamiento en Fintech / billeteras', '3b4c48a6-0590-492e-b234-11d8161bd711', 'active'),
('5a583ce1-2432-4a29-bdfd-fb5b63f6d258', 'Enfrentamiento en Fintech / billeteras', '3b4c48a6-0590-492e-b234-11d8161bd711', 'active'),
('40cd80d4-e4cb-48f7-9b5b-153afcc8be24', 'Enfrentamiento en Tarjetas / medios de pago', '2f26dda8-48a5-4f6d-94e9-08c75092ebe9', 'active'),
('a5cb7239-0a83-4795-82a5-72b0469af832', 'Enfrentamiento en Tarjetas / medios de pago', '2f26dda8-48a5-4f6d-94e9-08c75092ebe9', 'active'),
('ba2831f6-673e-436f-8051-b3a85e3cb19b', 'Enfrentamiento en Tarjetas / medios de pago', '2f26dda8-48a5-4f6d-94e9-08c75092ebe9', 'active'),
('0cb5c6b4-355b-42f1-9a9e-934038d2d067', 'Enfrentamiento en Tarjetas / medios de pago', '2f26dda8-48a5-4f6d-94e9-08c75092ebe9', 'active'),
('5efae174-139f-43cf-b69f-96df10d66f9b', 'Enfrentamiento en Inversiones / brokers', '8adc810a-48b2-46c1-aeef-0be60320a43d', 'active'),
('38304f24-cf1d-43dd-a171-1999533ac539', 'Enfrentamiento en Inversiones / brokers', '8adc810a-48b2-46c1-aeef-0be60320a43d', 'active'),
('fb498a38-5964-4e44-8ab0-88aa7c8c937d', 'Enfrentamiento en Inversiones / brokers', '8adc810a-48b2-46c1-aeef-0be60320a43d', 'active'),
('55a9a868-1fe8-4573-9b75-f754bc94810c', 'Enfrentamiento en Inversiones / brokers', '8adc810a-48b2-46c1-aeef-0be60320a43d', 'active'),
('63e628c4-ff0e-4d96-b783-93eaf1628cde', 'Enfrentamiento en Telefonía móvil', '663dd712-82f3-47cc-b65b-8aff98daacfa', 'active'),
('37ef095b-0e28-41e8-ba8b-9f476d175eac', 'Enfrentamiento en Telefonía móvil', '663dd712-82f3-47cc-b65b-8aff98daacfa', 'active'),
('f8bdd27d-7d73-4496-8049-d23a11de6ace', 'Enfrentamiento en Telefonía móvil', '663dd712-82f3-47cc-b65b-8aff98daacfa', 'active'),
('f587e82d-9ae6-4507-9f57-f2d649031992', 'Enfrentamiento en Internet hogar', '0529ebb7-b3f2-461c-a72a-be8e23f64d86', 'active'),
('21a73dc2-618d-46a6-940a-992d1413291e', 'Enfrentamiento en Internet hogar', '0529ebb7-b3f2-461c-a72a-be8e23f64d86', 'active'),
('a343cac0-6a8d-42f3-bc32-f7d712a03845', 'Enfrentamiento en Internet hogar', '0529ebb7-b3f2-461c-a72a-be8e23f64d86', 'active'),
('38932061-328e-4f3b-aba8-e459de86b36d', 'Enfrentamiento en TV paga', 'f5a86f3e-8659-47e1-ad09-d9e14f267292', 'active'),
('ef4b5b60-b535-46cc-8a3e-b2510321ee8b', 'Enfrentamiento en TV paga', 'f5a86f3e-8659-47e1-ad09-d9e14f267292', 'active'),
('c307c058-9440-411c-b587-6268249f410c', 'Enfrentamiento en TV paga', 'f5a86f3e-8659-47e1-ad09-d9e14f267292', 'active'),
('8714bc6d-29d0-473b-abcf-c47a39c04339', 'Enfrentamiento en TV online', 'c637096d-5ab9-443f-8c0c-6ae9ddcac28e', 'active'),
('b10bb61c-0284-4083-b0d8-c2a9cd9fd92d', 'Enfrentamiento en TV online', 'c637096d-5ab9-443f-8c0c-6ae9ddcac28e', 'active'),
('b3983225-878b-402b-9d05-efd2c62c4f9b', 'Enfrentamiento en TV online', 'c637096d-5ab9-443f-8c0c-6ae9ddcac28e', 'active'),
('f9717ac9-45b1-4c00-8cf9-dfb57f94f34a', 'Enfrentamiento en Supermercados', '036a099f-c554-4c88-8af1-73295a346dba', 'active'),
('8d1b9145-fac9-4b51-b85f-af9dc93c86f8', 'Enfrentamiento en Supermercados', '036a099f-c554-4c88-8af1-73295a346dba', 'active'),
('baf7d6af-c050-4437-977a-28e7a5466dfa', 'Enfrentamiento en Supermercados', '036a099f-c554-4c88-8af1-73295a346dba', 'active'),
('dec63e6f-73b3-40b4-8207-3c53cb598bc1', 'Enfrentamiento en Marketplaces', 'e653146f-a9d0-4faa-8b89-77204c41fa7d', 'active'),
('f454d6a1-7b08-497a-9053-9460182259b0', 'Enfrentamiento en Marketplaces', 'e653146f-a9d0-4faa-8b89-77204c41fa7d', 'active'),
('98d468f4-f9c8-4561-9ec0-68d685f1586f', 'Enfrentamiento en Marketplaces', 'e653146f-a9d0-4faa-8b89-77204c41fa7d', 'active'),
('d10379e2-63d3-42e7-93f6-9f3526046175', 'Enfrentamiento en Multitiendas', '3e158885-d465-43fc-83e2-23dac345fb72', 'active'),
('f60e5a51-fba8-422c-8ff1-e177d0365fcc', 'Enfrentamiento en Multitiendas', '3e158885-d465-43fc-83e2-23dac345fb72', 'active'),
('ded3e918-4b54-434a-83e2-03bedb7ac408', 'Enfrentamiento en Multitiendas', '3e158885-d465-43fc-83e2-23dac345fb72', 'active'),
('d42aac86-dd8c-459f-a869-6fb61916f3c1', 'Enfrentamiento en Mejoramiento del hogar', '2f764907-49d3-4b18-a796-c4e70e5bcdaa', 'active'),
('c4633429-2bff-4bcc-a074-66d15c6201f0', 'Enfrentamiento en Mejoramiento del hogar', '2f764907-49d3-4b18-a796-c4e70e5bcdaa', 'active'),
('056b65a1-7027-4c2b-bf98-b14f549a4816', 'Enfrentamiento en Mejoramiento del hogar', '2f764907-49d3-4b18-a796-c4e70e5bcdaa', 'active'),
('689ff287-f918-43ae-b292-a6b0ac2b79e6', 'Enfrentamiento en Tiendas de tecnología', '291b576a-8167-4bda-a6bc-9dcec1a2357b', 'active'),
('8f32c73c-c3a1-4a72-a58b-987a38e979f3', 'Enfrentamiento en Tiendas de tecnología', '291b576a-8167-4bda-a6bc-9dcec1a2357b', 'active'),
('ae652e83-0d5b-474e-acfa-ee6dbfd14842', 'Enfrentamiento en Tiendas de tecnología', '291b576a-8167-4bda-a6bc-9dcec1a2357b', 'active'),
('a247c19d-032a-4011-bbe9-1a651846ae80', 'Enfrentamiento en Ropa básica', 'ef89cded-697a-46b8-adc8-41de07bb6d3d', 'active'),
('dc865be1-0305-4eeb-aabc-5e4c7649c981', 'Enfrentamiento en Ropa básica', 'ef89cded-697a-46b8-adc8-41de07bb6d3d', 'active'),
('fd377cc1-382a-4ff7-884a-8b22df67a915', 'Enfrentamiento en Ropa básica', 'ef89cded-697a-46b8-adc8-41de07bb6d3d', 'active'),
('91e651cb-b5c6-4c39-9291-ff9c670f62d4', 'Enfrentamiento en Fast fashion', '4fc6aa75-5c0c-44f7-9229-806a703c9c9d', 'active'),
('71e3db51-c183-41a3-bcb4-4e71177eed8c', 'Enfrentamiento en Fast fashion', '4fc6aa75-5c0c-44f7-9229-806a703c9c9d', 'active'),
('2bd1fdee-c2fb-4f37-86b1-78ce48b5d8f6', 'Enfrentamiento en Fast fashion', '4fc6aa75-5c0c-44f7-9229-806a703c9c9d', 'active'),
('f3b46e50-7d18-4334-b3f6-b5a9c7817cb0', 'Enfrentamiento en Calzado', 'df099ceb-941e-4bb1-83c2-a124d95308a6', 'active'),
('5b6651ab-9699-4b07-8c54-67e75abf3aa6', 'Enfrentamiento en Calzado', 'df099ceb-941e-4bb1-83c2-a124d95308a6', 'active'),
('c0d1060d-fb8f-49eb-b4c3-0c4f1f5a518e', 'Enfrentamiento en Calzado', 'df099ceb-941e-4bb1-83c2-a124d95308a6', 'active'),
('a05d929e-5710-4987-bbc7-5120b0670768', 'Enfrentamiento en Deportivo', '3af61e4e-cc2f-4999-981a-23999a33d0d2', 'active'),
('6b054fa5-c0d0-4aec-9a2b-576011c46cbf', 'Enfrentamiento en Deportivo', '3af61e4e-cc2f-4999-981a-23999a33d0d2', 'active'),
('55f21df2-2550-4e36-9583-f4867516b007', 'Enfrentamiento en Deportivo', '3af61e4e-cc2f-4999-981a-23999a33d0d2', 'active'),
('3c49715d-b0ee-4d38-a9fe-1b0ce43e5678', 'Enfrentamiento en Deportivo', '3af61e4e-cc2f-4999-981a-23999a33d0d2', 'active'),
('9b0d71c0-fc5e-4605-8272-dccc9e02b18b', 'Enfrentamiento en Outdoor', '165cfe3d-96a3-4baa-9800-e4223234020d', 'active'),
('179ac56c-638f-402d-ae1e-c4d6b003e458', 'Enfrentamiento en Outdoor', '165cfe3d-96a3-4baa-9800-e4223234020d', 'active'),
('d68f3bd1-5fb0-4758-9dca-d231441d922e', 'Enfrentamiento en Outdoor', '165cfe3d-96a3-4baa-9800-e4223234020d', 'active'),
('baa7b4a4-2235-4dba-804c-84ccfef7de1c', 'Enfrentamiento en Accesorios', 'b7bfdedf-e2d3-4e9b-a2c8-4184ded80f4e', 'active'),
('6f045fad-1ab6-443b-affd-cfa30eaa2f33', 'Enfrentamiento en Accesorios', 'b7bfdedf-e2d3-4e9b-a2c8-4184ded80f4e', 'active'),
('ee04f5e7-c395-44b6-9163-7a8aeffdd115', 'Enfrentamiento en Accesorios', 'b7bfdedf-e2d3-4e9b-a2c8-4184ded80f4e', 'active'),
('51cee30c-34ad-4ce4-abbe-66ed6815c761', 'Enfrentamiento en Fast food', 'fb33ecf7-7ec7-4508-924b-5f1c384139cc', 'active'),
('8381ed7e-4960-4a0f-814f-9020ddf04d10', 'Enfrentamiento en Fast food', 'fb33ecf7-7ec7-4508-924b-5f1c384139cc', 'active'),
('ebda1c45-23fa-43ff-b2af-ea9e12dcad0b', 'Enfrentamiento en Fast food', 'fb33ecf7-7ec7-4508-924b-5f1c384139cc', 'active'),
('77c15b07-e6ad-493e-b006-5f910621c472', 'Enfrentamiento en Fast food', 'fb33ecf7-7ec7-4508-924b-5f1c384139cc', 'active'),
('7a3601c3-14ce-403e-b4a8-83a3bd214d9d', 'Enfrentamiento en Cafeterías', 'fcb9dfbc-403c-41ce-8275-31c0c12743d1', 'active'),
('91a148d5-3204-4887-b8ca-ca6f6c9be197', 'Enfrentamiento en Cafeterías', 'fcb9dfbc-403c-41ce-8275-31c0c12743d1', 'active'),
('ce862510-75e9-4711-9702-b330a017e90b', 'Enfrentamiento en Cafeterías', 'fcb9dfbc-403c-41ce-8275-31c0c12743d1', 'active'),
('1bf3d432-d9de-4f80-8ca6-0273e1275555', 'Enfrentamiento en Pizza', 'd6421544-37e4-4d48-9ce6-05d0f0b7437d', 'active'),
('9dc2cd22-6ec5-452e-bd65-0391b1e9d548', 'Enfrentamiento en Pizza', 'd6421544-37e4-4d48-9ce6-05d0f0b7437d', 'active'),
('e6a2215c-754c-41eb-8394-73e3e1ff25df', 'Enfrentamiento en Pizza', 'd6421544-37e4-4d48-9ce6-05d0f0b7437d', 'active'),
('fa3de9e3-9b43-4d81-b3ec-ac72d8607037', 'Enfrentamiento en Delivery de comida', '6555758d-c2d6-4045-95b0-42534e85dda0', 'active'),
('677b9b22-a98f-453e-b36c-5a7cc7b6e382', 'Enfrentamiento en Delivery de comida', '6555758d-c2d6-4045-95b0-42534e85dda0', 'active'),
('bde6a455-10e5-43c6-a986-21fae3d0eb1d', 'Enfrentamiento en Delivery de comida', '6555758d-c2d6-4045-95b0-42534e85dda0', 'active'),
('ca3bd9c3-2ba7-4182-9a01-3774dabb8acd', 'Enfrentamiento en Aerolíneas', 'bd8ba5b0-9ea9-4f59-9d94-71968b35a808', 'active'),
('0c218c1b-0341-4b24-a214-b8726792ad4d', 'Enfrentamiento en Aerolíneas', 'bd8ba5b0-9ea9-4f59-9d94-71968b35a808', 'active'),
('a4505fb9-05d1-4ae4-b6cb-2620bc9d3def', 'Enfrentamiento en Aerolíneas', 'bd8ba5b0-9ea9-4f59-9d94-71968b35a808', 'active'),
('eeff42bd-b4d0-461d-8362-235bc43fbac2', 'Enfrentamiento en Aerolíneas', 'bd8ba5b0-9ea9-4f59-9d94-71968b35a808', 'active'),
('a4de080e-db9c-4a40-a87a-3df2622d2c26', 'Enfrentamiento en Aerolíneas', 'bd8ba5b0-9ea9-4f59-9d94-71968b35a808', 'active'),
('681cfb50-bf60-4834-bd88-9c6c55ce4d3e', 'Enfrentamiento en Apps de transporte', 'c425941d-56ae-4067-b398-1ce24fe6b00f', 'active'),
('696fb04b-6729-42be-b3fb-58ee7d3d405e', 'Enfrentamiento en Apps de transporte', 'c425941d-56ae-4067-b398-1ce24fe6b00f', 'active'),
('f8dd95a8-c7b0-495b-88ea-75e795864b87', 'Enfrentamiento en Apps de transporte', 'c425941d-56ae-4067-b398-1ce24fe6b00f', 'active'),
('b127ec62-9113-4f88-8a29-b9f0bf092ee8', 'Enfrentamiento en Marcas de autos', '8c0acdbe-f34c-4f7d-bab1-128896622b2f', 'active'),
('88589821-877e-45f5-afcf-40a3f2e1467e', 'Enfrentamiento en Marcas de autos', '8c0acdbe-f34c-4f7d-bab1-128896622b2f', 'active'),
('e7ef1781-07ba-4415-8ad5-fe9c3ce07942', 'Enfrentamiento en Marcas de autos', '8c0acdbe-f34c-4f7d-bab1-128896622b2f', 'active'),
('1e07d849-d829-489e-93b4-f2992656134e', 'Enfrentamiento en Marcas de autos', '8c0acdbe-f34c-4f7d-bab1-128896622b2f', 'active'),
('8301c005-7021-4b33-9063-91e7cbec38dc', 'Enfrentamiento en Marcas de autos', '8c0acdbe-f34c-4f7d-bab1-128896622b2f', 'active'),
('1602b820-4133-4fa9-8a16-02e9229c5a5e', 'Enfrentamiento en Marcas chinas de autos', 'fb657ad7-8c6b-453d-9511-6d8c84c067b5', 'active'),
('6da3835f-1046-40ad-8723-deb831612e25', 'Enfrentamiento en Marcas chinas de autos', 'fb657ad7-8c6b-453d-9511-6d8c84c067b5', 'active'),
('c2876bb1-63d6-4654-a5e9-6c18d90e7b19', 'Enfrentamiento en Marcas chinas de autos', 'fb657ad7-8c6b-453d-9511-6d8c84c067b5', 'active'),
('ad36da91-339a-4745-bc35-a6a909f41de9', 'Enfrentamiento en Marcas chinas de autos', 'fb657ad7-8c6b-453d-9511-6d8c84c067b5', 'active'),
('cc36b979-3020-441a-8ffd-b1627fa6977c', 'Enfrentamiento en Automotoras / concesionarios', 'd32853b3-a678-415f-8c09-344a4c114f33', 'active'),
('148754ff-6df5-46f8-b904-7501aa47d787', 'Enfrentamiento en Automotoras / concesionarios', 'd32853b3-a678-415f-8c09-344a4c114f33', 'active'),
('7e29059a-f4bd-4b53-9a64-408ddf769095', 'Enfrentamiento en Automotoras / concesionarios', 'd32853b3-a678-415f-8c09-344a4c114f33', 'active'),
('e752cd11-1534-4785-830e-143bc0a6a2ed', 'Enfrentamiento en Streaming de video', '21ea3ee2-f5b6-40ba-93f3-cde9ef2443ce', 'active'),
('48530651-7cd6-4524-a351-dbc0aac1cab7', 'Enfrentamiento en Streaming de video', '21ea3ee2-f5b6-40ba-93f3-cde9ef2443ce', 'active'),
('fad8cd26-ab9b-4770-a3b2-a3062d7caf7c', 'Enfrentamiento en Streaming de video', '21ea3ee2-f5b6-40ba-93f3-cde9ef2443ce', 'active'),
('7f4eac25-72ad-434f-a393-291515d1c915', 'Enfrentamiento en Streaming de video', '21ea3ee2-f5b6-40ba-93f3-cde9ef2443ce', 'active'),
('236ed59e-aba1-4f35-b321-6f6fb1957866', 'Enfrentamiento en Streaming de música', 'a71b2416-5466-461f-8af1-d1051e6204cc', 'active'),
('8a2d2a0c-c4ed-4218-bbac-fd69f0bdfd70', 'Enfrentamiento en Streaming de música', 'a71b2416-5466-461f-8af1-d1051e6204cc', 'active'),
('214b2c18-00cd-4063-9445-ad8359a81f74', 'Enfrentamiento en Streaming de música', 'a71b2416-5466-461f-8af1-d1051e6204cc', 'active'),
('a2bd3bfc-0ee1-42a2-87a3-a0dcf42921fb', 'Enfrentamiento en Cines', 'a6110018-6c42-4eb9-9f95-498d2404e7c0', 'active'),
('cc5487b9-da37-4319-bbe0-4c2faeb31e60', 'Enfrentamiento en Cines', 'a6110018-6c42-4eb9-9f95-498d2404e7c0', 'active'),
('b3d50c2a-a169-41df-86f2-8a01d3ec1c70', 'Enfrentamiento en Cines', 'a6110018-6c42-4eb9-9f95-498d2404e7c0', 'active'),
('abf0e74c-f507-4716-8c15-ddad002ca857', 'Enfrentamiento en Gaseosas', '2df70fa0-1f76-401e-96dc-0d4ea276080e', 'active'),
('d1f97e21-95e8-45f8-a289-5cac9ce69605', 'Enfrentamiento en Gaseosas', '2df70fa0-1f76-401e-96dc-0d4ea276080e', 'active'),
('3fb1c408-43b9-4363-8198-a78ad5364c27', 'Enfrentamiento en Gaseosas', '2df70fa0-1f76-401e-96dc-0d4ea276080e', 'active'),
('89e8a89a-51dd-41ce-9b47-7173b2108cca', 'Enfrentamiento en Energéticas', 'e11b3c1a-9e0d-4a9f-a09d-63425a434144', 'active'),
('ab997c9c-234c-4a4c-8579-f4d5bcccaf3e', 'Enfrentamiento en Energéticas', 'e11b3c1a-9e0d-4a9f-a09d-63425a434144', 'active'),
('fdbeaec8-ca82-4eb9-b198-aa57f2a33c34', 'Enfrentamiento en Energéticas', 'e11b3c1a-9e0d-4a9f-a09d-63425a434144', 'active'),
('741095b8-20b8-4496-8c7a-2e6f62aeeec6', 'Enfrentamiento en Cervezas', 'a13531bc-6083-4c44-8860-a365eaeb6346', 'active'),
('24247590-ffef-4bec-be0a-35510bc750b1', 'Enfrentamiento en Cervezas', 'a13531bc-6083-4c44-8860-a365eaeb6346', 'active'),
('b044ac79-b0e1-4d5b-aed6-359ceab7d5e5', 'Enfrentamiento en Cervezas', 'a13531bc-6083-4c44-8860-a365eaeb6346', 'active'),
('621d1f58-4613-402a-b868-f11280825aae', 'Enfrentamiento en Aguas', 'a60f5f50-4f61-413d-9a97-2ab18f218e0d', 'active'),
('5baeb8d6-f2e5-4812-b936-1b00f12da420', 'Enfrentamiento en Aguas', 'a60f5f50-4f61-413d-9a97-2ab18f218e0d', 'active'),
('3467cb9f-97b7-43f4-ba95-6d5c8dafc990', 'Enfrentamiento en Aguas', 'a60f5f50-4f61-413d-9a97-2ab18f218e0d', 'active'),
('d625a8e2-c519-4374-908f-00aaf8d3f14f', 'Enfrentamiento en Radios', 'b7cbebe1-3437-4f4c-a07e-1675ecd0023c', 'active'),
('f675da93-2c92-4dca-9c5b-9313cfb75315', 'Enfrentamiento en Radios', 'b7cbebe1-3437-4f4c-a07e-1675ecd0023c', 'active'),
('e020ea3a-2dee-4634-b3af-29af13888613', 'Enfrentamiento en Radios', 'b7cbebe1-3437-4f4c-a07e-1675ecd0023c', 'active'),
('2639bc86-f38e-4abc-b8ca-e51104663735', 'Enfrentamiento en TV abierta', 'b5a19d62-32bb-40fc-81cc-c64913038747', 'active'),
('a624d258-4811-42c7-ac5d-a15324158911', 'Enfrentamiento en TV abierta', 'b5a19d62-32bb-40fc-81cc-c64913038747', 'active'),
('94d00dcb-84c3-40bc-b3a4-52199cc41762', 'Enfrentamiento en TV abierta', 'b5a19d62-32bb-40fc-81cc-c64913038747', 'active'),
('9d959d68-3c34-4272-ba36-d956b4eaca46', 'Enfrentamiento en Prensa digital', '22cb7124-e821-4373-8f16-21f38f55ab81', 'active'),
('db5051f2-877a-4e76-ad22-be4559142495', 'Enfrentamiento en Prensa digital', '22cb7124-e821-4373-8f16-21f38f55ab81', 'active'),
('b24e5e9b-cd57-481e-a803-8bfbc29011b0', 'Enfrentamiento en Prensa digital', '22cb7124-e821-4373-8f16-21f38f55ab81', 'active'),
('42c2f8ff-9eab-4610-a675-9c8d3a41b80b', 'Enfrentamiento en Redes sociales', '5ee7023d-1015-4c20-af0b-bdc9f64b0609', 'active'),
('5ecb9959-c769-4d52-8c46-3cf37af7540f', 'Enfrentamiento en Redes sociales', '5ee7023d-1015-4c20-af0b-bdc9f64b0609', 'active'),
('247ce509-cbbd-491d-9cea-23ec270c5d29', 'Enfrentamiento en Redes sociales', '5ee7023d-1015-4c20-af0b-bdc9f64b0609', 'active'),
('43054844-91d7-465c-8c49-1030f802d6e4', 'Enfrentamiento en Mensajería', 'ee8340e6-5026-48d4-a5b3-361baf2a0f5c', 'active'),
('2b39b7cc-da75-4ba3-9a30-4806ee4fe3d7', 'Enfrentamiento en Mensajería', 'ee8340e6-5026-48d4-a5b3-361baf2a0f5c', 'active'),
('37cfe0d9-f417-495c-97ca-07a49f58664a', 'Enfrentamiento en Mensajería', 'ee8340e6-5026-48d4-a5b3-361baf2a0f5c', 'active'),
('5edc9b42-54dc-4bfa-97c4-47f29629f692', 'Enfrentamiento en Comunidades / foros', '682713bb-b45f-4c5c-9072-6be011c1f418', 'active'),
('4dde8e3f-4951-4178-85d0-592b53765261', 'Enfrentamiento en Comunidades / foros', '682713bb-b45f-4c5c-9072-6be011c1f418', 'active'),
('af62c50a-a567-4fab-8aff-d836f5bffe4a', 'Enfrentamiento en Comunidades / foros', '682713bb-b45f-4c5c-9072-6be011c1f418', 'active'),
('aa46df80-cdba-48fa-8b94-952609407666', 'Enfrentamiento en Universidades', 'be3c5880-160c-4d02-b6d8-0a4f077c6fad', 'active'),
('88b63277-a333-4d98-a705-a885833e2348', 'Enfrentamiento en Universidades', 'be3c5880-160c-4d02-b6d8-0a4f077c6fad', 'active'),
('dfca33a8-5f9b-4f7a-8c0e-f9c058a4ec3d', 'Enfrentamiento en Universidades', 'be3c5880-160c-4d02-b6d8-0a4f077c6fad', 'active'),
('81fb6be9-b643-4919-b6fc-353a8c8adeae', 'Enfrentamiento en Institutos / CFT', '4e62dbe3-24a3-469a-93fe-390aff5db902', 'active'),
('228f5743-1460-4317-a67c-55db5150645f', 'Enfrentamiento en Institutos / CFT', '4e62dbe3-24a3-469a-93fe-390aff5db902', 'active'),
('bc2b2cb1-65bc-4011-a020-a6a3dd303050', 'Enfrentamiento en Institutos / CFT', '4e62dbe3-24a3-469a-93fe-390aff5db902', 'active'),
('b9112d2b-236a-4fbb-8ee2-06e6377c0126', 'Enfrentamiento en Preuniversitarios', 'e83b3295-c2be-4965-9a31-62bf2c55a0c5', 'active'),
('3872dce6-1a9b-44a1-822f-ad890e1aa90f', 'Enfrentamiento en Preuniversitarios', 'e83b3295-c2be-4965-9a31-62bf2c55a0c5', 'active'),
('24f17538-7f6f-46dc-a4dc-c91d0b979063', 'Enfrentamiento en Preuniversitarios', 'e83b3295-c2be-4965-9a31-62bf2c55a0c5', 'active'),
('c58e3448-633a-40bb-9421-aff31e5c4b86', 'Enfrentamiento en Fútbol chileno', '61f1c9e6-efd1-4940-9fb7-3fb315013a20', 'active'),
('02225caf-98a6-4ce1-880d-77b37d10b7d6', 'Enfrentamiento en Fútbol chileno', '61f1c9e6-efd1-4940-9fb7-3fb315013a20', 'active'),
('7f5082e4-df51-4385-abb5-5cc1b5ef11f9', 'Enfrentamiento en Fútbol chileno', '61f1c9e6-efd1-4940-9fb7-3fb315013a20', 'active'),
('13f1a203-0f7e-497e-a567-b4ceac4ff11b', 'Enfrentamiento en Viñas', '9ef5dbb9-03ba-4021-9604-48fe7dccbc6f', 'active'),
('08be5f54-44e3-4130-b81c-ec42cdb05a92', 'Enfrentamiento en Viñas', '9ef5dbb9-03ba-4021-9604-48fe7dccbc6f', 'active'),
('ab55a4c5-bb51-4bbe-8470-33672a21c1de', 'Enfrentamiento en Viñas', '9ef5dbb9-03ba-4021-9604-48fe7dccbc6f', 'active'),
('382e9ab0-9567-446b-8314-1fbb581bfdba', 'Enfrentamiento en Tiendas de vino', '091b564e-bfaa-451d-947e-1f157c26fe8c', 'active'),
('f3491e0e-7c3d-4538-8b3b-8c0928e5f169', 'Enfrentamiento en Tiendas de vino', '091b564e-bfaa-451d-947e-1f157c26fe8c', 'active'),
('33a5ad03-3da5-48c0-860d-61286b0ffdd2', 'Enfrentamiento en Tiendas de vino', '091b564e-bfaa-451d-947e-1f157c26fe8c', 'active'),
('f9fde89c-fd79-479b-b0ff-af0a0fbcc1f2', 'Enfrentamiento en Alimento para perros', 'af7eba88-a4bc-4900-a9b6-77e7818ad607', 'active'),
('09e0db44-324b-4498-b885-5d3783c00f14', 'Enfrentamiento en Alimento para perros', 'af7eba88-a4bc-4900-a9b6-77e7818ad607', 'active'),
('7de403bf-b899-4ce2-96cc-8a77542ab3f3', 'Enfrentamiento en Alimento para perros', 'af7eba88-a4bc-4900-a9b6-77e7818ad607', 'active'),
('47a31228-cbd3-4ea5-9bda-4f380fd01e58', 'Enfrentamiento en Alimento para gatos', 'e2093f93-5627-41a5-9350-97e833b09826', 'active'),
('14e24a73-3c58-4f93-8c1e-e7faf156ce07', 'Enfrentamiento en Alimento para gatos', 'e2093f93-5627-41a5-9350-97e833b09826', 'active'),
('c74c4be0-283d-425f-aa58-4dc9aec93891', 'Enfrentamiento en Alimento para gatos', 'e2093f93-5627-41a5-9350-97e833b09826', 'active'),
('0f46fd72-b892-4638-b0eb-9dbbff9210ac', 'Enfrentamiento en Tiendas de mascotas', 'e1506be8-839f-4e33-9c6a-82234a5f698f', 'active'),
('462d6052-803b-4d01-b835-6b2d1bb607be', 'Enfrentamiento en Tiendas de mascotas', 'e1506be8-839f-4e33-9c6a-82234a5f698f', 'active'),
('3b012855-7372-4127-8ab6-5d91459eab73', 'Enfrentamiento en Tiendas de mascotas', 'e1506be8-839f-4e33-9c6a-82234a5f698f', 'active'),
('5dd0a4e1-50d2-4595-bc03-04935a1b234c', 'Enfrentamiento en Clínicas veterinarias', '35b25dd1-995f-4c3d-8d92-a6a249de4e4c', 'active'),
('16c4bb26-d21d-4663-b87f-f3de4e00cff4', 'Enfrentamiento en Clínicas veterinarias', '35b25dd1-995f-4c3d-8d92-a6a249de4e4c', 'active'),
('87d73873-59b4-46dc-b7cf-b84d16c7d159', 'Enfrentamiento en Clínicas veterinarias', '35b25dd1-995f-4c3d-8d92-a6a249de4e4c', 'active'),
('e028b2b1-c113-4314-8d02-b91de4c634fa', 'Enfrentamiento en Shampoo', '263a363f-632a-4822-9fdf-1e8268a3890d', 'active'),
('53fb4e33-33a5-4873-919d-9c07797580d0', 'Enfrentamiento en Shampoo', '263a363f-632a-4822-9fdf-1e8268a3890d', 'active'),
('c67ee130-b10b-43ad-a829-d9c2f0dd6424', 'Enfrentamiento en Shampoo', '263a363f-632a-4822-9fdf-1e8268a3890d', 'active'),
('6d6f2355-fc96-420f-a8a5-1d13a1d1b18c', 'Enfrentamiento en Desodorantes', '5c9be044-22d3-4efc-974a-662595c00458', 'active'),
('b3baa1af-7d31-4476-be17-1fff087fc57c', 'Enfrentamiento en Desodorantes', '5c9be044-22d3-4efc-974a-662595c00458', 'active'),
('b5e2a894-fc5e-49de-9b24-e251ea331a6a', 'Enfrentamiento en Desodorantes', '5c9be044-22d3-4efc-974a-662595c00458', 'active'),
('19b37a07-76cc-49d9-897d-af0d91136a03', 'Enfrentamiento en Pastas dentales', '8130a76f-ad9b-4aef-b117-b139564c2b45', 'active'),
('238a4806-d1d4-4256-994a-4013cd798b24', 'Enfrentamiento en Pastas dentales', '8130a76f-ad9b-4aef-b117-b139564c2b45', 'active'),
('f158ff0c-44a6-497f-9f56-6e392ba18025', 'Enfrentamiento en Pastas dentales', '8130a76f-ad9b-4aef-b117-b139564c2b45', 'active'),
('84b69edc-517e-46f9-97c4-5713a6f1aae1', 'Enfrentamiento en Protección solar', 'ea22fa1e-03cb-41d9-9262-ca13e99a5614', 'active'),
('1d257253-41d7-4a6c-a70a-64645aad37d4', 'Enfrentamiento en Protección solar', 'ea22fa1e-03cb-41d9-9262-ca13e99a5614', 'active'),
('c4667c63-f0e5-4638-b9dd-1a7d588ba9a1', 'Enfrentamiento en Protección solar', 'ea22fa1e-03cb-41d9-9262-ca13e99a5614', 'active'),
('24356a14-396e-438d-8a74-6a8f0caa062c', 'Enfrentamiento en Cosméticos / maquillaje', '23bdbcfd-6179-4ef4-8f58-9e5508d79de9', 'active'),
('deecbe14-512a-4825-9fe6-fced8a318de6', 'Enfrentamiento en Cosméticos / maquillaje', '23bdbcfd-6179-4ef4-8f58-9e5508d79de9', 'active'),
('c73d6416-fbf5-49bc-818c-80f7783dbc34', 'Enfrentamiento en Cosméticos / maquillaje', '23bdbcfd-6179-4ef4-8f58-9e5508d79de9', 'active'),
('3f491846-0804-4d76-96e0-308731ced310', 'Enfrentamiento en Skincare', '419a5a82-15c8-4ce3-92d2-d0735c025bde', 'active'),
('db756f1f-96ba-4d61-93e0-34f9cf119ce8', 'Enfrentamiento en Skincare', '419a5a82-15c8-4ce3-92d2-d0735c025bde', 'active'),
('dba6ec47-ed81-4e6c-be16-be4c8b28018b', 'Enfrentamiento en Skincare', '419a5a82-15c8-4ce3-92d2-d0735c025bde', 'active'),
('05720bb4-7910-4bb8-bef7-7416555d84ad', 'Enfrentamiento en Perfumes', 'be5759e5-da29-4329-b4fe-ef1a580c4814', 'active'),
('16e6b3fd-923f-493e-8b11-4f26900e8b7c', 'Enfrentamiento en Perfumes', 'be5759e5-da29-4329-b4fe-ef1a580c4814', 'active'),
('f6380415-3aaf-4c96-9719-8e2f19388c93', 'Enfrentamiento en Perfumes', 'be5759e5-da29-4329-b4fe-ef1a580c4814', 'active'),
('f3992b16-8b2a-47f3-9863-8d9ccae509fa', 'Enfrentamiento en Refrigeradores', '1e43428f-1930-4c5b-be60-4bf850cf6e58', 'active'),
('7200a79d-2b1e-471b-a6c2-ba5424ca0a3b', 'Enfrentamiento en Refrigeradores', '1e43428f-1930-4c5b-be60-4bf850cf6e58', 'active'),
('47972f4f-4f84-4b4b-8bfe-d556199ae8a7', 'Enfrentamiento en Refrigeradores', '1e43428f-1930-4c5b-be60-4bf850cf6e58', 'active'),
('d944092a-bfa4-4885-9472-69ba4887a761', 'Enfrentamiento en Lavadoras', '19df3b74-a46f-4d96-b114-31be2d0a6f7a', 'active'),
('9e8474a3-a8f5-4e63-ae55-8eba575b58f6', 'Enfrentamiento en Lavadoras', '19df3b74-a46f-4d96-b114-31be2d0a6f7a', 'active'),
('fbc3db72-916a-4780-b83c-39e703a1db4f', 'Enfrentamiento en Lavadoras', '19df3b74-a46f-4d96-b114-31be2d0a6f7a', 'active'),
('cddcc1a4-a823-4e47-b15c-912ecb71ffec', 'Enfrentamiento en Aspiradoras', 'a70a5b53-0fc0-40f2-be99-5067f2ec16f8', 'active'),
('4d51d7b9-5aef-475e-9bea-4abe8c8fc90e', 'Enfrentamiento en Aspiradoras', 'a70a5b53-0fc0-40f2-be99-5067f2ec16f8', 'active'),
('02aa1290-b820-4894-874b-f99398fa44a4', 'Enfrentamiento en Aspiradoras', 'a70a5b53-0fc0-40f2-be99-5067f2ec16f8', 'active'),
('b6b19fe2-6648-4f89-8999-f7cd1db532cf', 'Enfrentamiento en Colchones', '4c97d742-9b7d-47ff-8823-8cf4c5d551f1', 'active'),
('819c0b0e-402d-42f4-9ba4-8695d7c312d1', 'Enfrentamiento en Colchones', '4c97d742-9b7d-47ff-8823-8cf4c5d551f1', 'active'),
('bd556404-f25b-4dd9-8253-56dbc4bdf77c', 'Enfrentamiento en Colchones', '4c97d742-9b7d-47ff-8823-8cf4c5d551f1', 'active'),
('cb699a10-979d-4b03-8d80-c1b349a64a41', 'Enfrentamiento en Smartphones', 'fc61e65e-d82b-434f-9d83-71902b0c9dbd', 'active'),
('1db12212-4527-4c59-8f04-b5e36b35c30a', 'Enfrentamiento en Smartphones', 'fc61e65e-d82b-434f-9d83-71902b0c9dbd', 'active'),
('f1760584-69b9-4c9c-9399-2afdf9cbe04c', 'Enfrentamiento en Smartphones', 'fc61e65e-d82b-434f-9d83-71902b0c9dbd', 'active'),
('1a2142ae-ced7-4389-a8b8-aa307ac148e5', 'Enfrentamiento en Smartphones', 'fc61e65e-d82b-434f-9d83-71902b0c9dbd', 'active'),
('bd871221-b3ee-488f-8de5-dc799231dbbf', 'Enfrentamiento en Notebooks', '0918f1c2-b313-4041-9c21-fa5f071c64ef', 'active'),
('f2da7a22-f92e-4918-a5a0-4756280d7b71', 'Enfrentamiento en Notebooks', '0918f1c2-b313-4041-9c21-fa5f071c64ef', 'active'),
('8030ef94-d2f2-44ab-bf58-fc9d75463f47', 'Enfrentamiento en Notebooks', '0918f1c2-b313-4041-9c21-fa5f071c64ef', 'active'),
('1ef1a3c5-006d-4443-8345-535462428da6', 'Enfrentamiento en Audífonos', 'a3472d47-8870-464a-91f9-96a4a0b0f17d', 'active'),
('ec05a162-1d6e-4c60-b614-d099c5881b80', 'Enfrentamiento en Audífonos', 'a3472d47-8870-464a-91f9-96a4a0b0f17d', 'active'),
('03c22dd1-d5a3-4c89-acd4-fb18f4c35b59', 'Enfrentamiento en Audífonos', 'a3472d47-8870-464a-91f9-96a4a0b0f17d', 'active'),
('f03f0352-bea9-4c87-9f7f-da9a2c4f857d', 'Enfrentamiento en Smartwatches', '9c34102c-97d8-4cc7-a2b7-6d1f2c3a3dce', 'active'),
('3e0b39b8-48ac-4b07-9f33-a06006333896', 'Enfrentamiento en Smartwatches', '9c34102c-97d8-4cc7-a2b7-6d1f2c3a3dce', 'active'),
('bb3aceeb-c6d4-4243-b911-c2664df649a2', 'Enfrentamiento en Smartwatches', '9c34102c-97d8-4cc7-a2b7-6d1f2c3a3dce', 'active'),
('74374489-859f-4f87-b785-74f67b1bb818', 'Enfrentamiento en Televisores', '4d53c145-2830-4fd8-b533-8078c1d84184', 'active'),
('409300f5-5722-44f0-997e-82a4a28a7b27', 'Enfrentamiento en Televisores', '4d53c145-2830-4fd8-b533-8078c1d84184', 'active'),
('7ba77909-84f2-4617-ad8c-ea322b697623', 'Enfrentamiento en Televisores', '4d53c145-2830-4fd8-b533-8078c1d84184', 'active'),
('8da5d889-14b4-4caf-8e45-9f7016423cf3', 'Enfrentamiento en Tablets', '6cb24253-e07d-4225-8797-fe3e5c993ed2', 'active'),
('57cfd911-b109-4404-a203-db904068c764', 'Enfrentamiento en Tablets', '6cb24253-e07d-4225-8797-fe3e5c993ed2', 'active'),
('07b280b1-f4db-4ee3-90a6-a3776e395b27', 'Enfrentamiento en Tablets', '6cb24253-e07d-4225-8797-fe3e5c993ed2', 'active'),
('a9011c09-a56f-49c9-a850-b3aa9657785d', 'Enfrentamiento en Consolas', '7e4683dd-6531-40eb-a424-1a90a5c980e8', 'active'),
('4116e72b-bca1-4076-ab18-2451a7200419', 'Enfrentamiento en Consolas', '7e4683dd-6531-40eb-a424-1a90a5c980e8', 'active'),
('a42f1f83-a982-48a2-8858-539d3b22e547', 'Enfrentamiento en Consolas', '7e4683dd-6531-40eb-a424-1a90a5c980e8', 'active'),
('333f9af0-ff29-4392-8449-cd92a822acf2', 'Enfrentamiento en Periféricos gamer', 'cc513591-46f9-493d-a837-a3d5869b4705', 'active'),
('5f22ff48-c313-46a6-97ed-2c8eedb15b91', 'Enfrentamiento en Periféricos gamer', 'cc513591-46f9-493d-a837-a3d5869b4705', 'active'),
('5e2100ad-d7cb-45d0-bad4-601bc06bb9c5', 'Enfrentamiento en Periféricos gamer', 'cc513591-46f9-493d-a837-a3d5869b4705', 'active'),
('31b5720e-dac7-42ac-a6e5-36945a7da26d', 'Enfrentamiento en Monitores gamer', '32a62d66-f323-4808-aa61-af6ce29ecad6', 'active'),
('94ec1491-bd2e-42d7-908a-ab257e0d58e9', 'Enfrentamiento en Monitores gamer', '32a62d66-f323-4808-aa61-af6ce29ecad6', 'active'),
('23233050-0375-449c-9b47-441773de67b4', 'Enfrentamiento en Monitores gamer', '32a62d66-f323-4808-aa61-af6ce29ecad6', 'active'),
('d53f1f4b-5601-4a9f-979b-7083ac2aa7b9', 'Enfrentamiento en Pañales', 'af34a448-b54d-4147-8277-8bd713f03c14', 'active'),
('cdbc1e1a-8976-4166-98c2-1f21d91a956d', 'Enfrentamiento en Pañales', 'af34a448-b54d-4147-8277-8bd713f03c14', 'active'),
('bd506d39-a470-4661-86f4-487346fceb1b', 'Enfrentamiento en Pañales', 'af34a448-b54d-4147-8277-8bd713f03c14', 'active'),
('89b27edc-baab-4cfe-9a1d-ac5e57eec194', 'Enfrentamiento en Fórmula / alimentación infantil', '1e9665c5-1108-462d-947d-461ea003e656', 'active'),
('7ee4bb34-d845-4597-bce5-df1ea1643478', 'Enfrentamiento en Fórmula / alimentación infantil', '1e9665c5-1108-462d-947d-461ea003e656', 'active'),
('e764f1a9-d8a0-4203-abf9-1a68aae492ac', 'Enfrentamiento en Fórmula / alimentación infantil', '1e9665c5-1108-462d-947d-461ea003e656', 'active'),
('96ba0b1f-fa7b-417b-98ec-208f0e99e66f', 'Enfrentamiento en Toallitas húmedas', '69a5f4dd-bfa5-467b-bd48-27d964eb1f9d', 'active'),
('fb8df854-1f4f-4f1d-8eb0-018c9eed1d89', 'Enfrentamiento en Toallitas húmedas', '69a5f4dd-bfa5-467b-bd48-27d964eb1f9d', 'active'),
('a3f4c609-4a3a-4e23-b581-5374ad8138b3', 'Enfrentamiento en Toallitas húmedas', '69a5f4dd-bfa5-467b-bd48-27d964eb1f9d', 'active'),
('d4bae461-e839-4132-acc0-e6ab6c27c554', 'Enfrentamiento en Cochecitos', '8763218d-2d48-4f03-9485-caca1291d082', 'active'),
('941725f1-8c7d-4690-85fa-bd8d0730e069', 'Enfrentamiento en Cochecitos', '8763218d-2d48-4f03-9485-caca1291d082', 'active'),
('2d44a5d3-4f08-4bbb-a54c-c11f30f60c45', 'Enfrentamiento en Cochecitos', '8763218d-2d48-4f03-9485-caca1291d082', 'active');

INSERT INTO battle_options (battle_id, brand_id, label, brand_domain) VALUES
('9ce9a4ca-2d34-4666-ba82-09534a7e5ec0', 'f59ea904-e894-4984-b9b3-25dbb265c735', 'Clínica MEDS', 'www.meds.cl'),
('9ce9a4ca-2d34-4666-ba82-09534a7e5ec0', '0917f2b0-59bd-4dfd-961d-176c3876f932', 'Clínica Indisa', 'www.indisa.cl'),
('0b2a042c-a64f-4530-ace1-db239d468402', '80fc1790-5483-451c-b95d-666fdb0879ca', 'Clínica Santa María', 'www.clinicasantamaria.cl'),
('0b2a042c-a64f-4530-ace1-db239d468402', '4cc53b65-ac58-43ed-825c-cf587ab7f27a', 'Clínica Las Condes', 'www.clinicalascondes.cl'),
('65650950-eab5-4e1b-83a7-3730293109c5', 'fc0bf2fa-279d-4f95-b6d6-e7c9cd2ade32', 'Clínica Alemana', 'www.alemana.cl'),
('65650950-eab5-4e1b-83a7-3730293109c5', '2ba8696a-7799-4538-b5d3-61ecde6d0c22', 'RedSalud', 'www.redsalud.cl'),
('93b0cf4b-a8bc-4e54-8d5f-14ed4f6cada5', 'f0e4e0a3-3e6a-442e-a10e-e97ca9c7d945', 'Bupa', 'www.bupa.cl'),
('93b0cf4b-a8bc-4e54-8d5f-14ed4f6cada5', '77bfcde8-bf5f-4eec-85c9-c5b58c7570f0', 'Megasalud', 'www.megasalud.cl'),
('7a4f05d9-370f-4277-a7a4-10b16a42f8c4', 'd4f219dc-560f-46a9-acd4-5bc99df110ba', 'IntegraMédica', 'www.integramedica.cl'),
('7a4f05d9-370f-4277-a7a4-10b16a42f8c4', 'e02994ff-a8e9-455e-90e1-19fe8482d727', 'RedSalud Centros Médicos', 'www.redsalud.cl'),
('d6c48935-6714-4115-9168-f7fcfcc5137d', 'ed9f7d05-6dd6-4808-98a5-139d84eda5b2', 'UC Christus', 'www.ucchristus.cl'),
('d6c48935-6714-4115-9168-f7fcfcc5137d', '18186636-204a-47a8-b55e-12b1fccdaaf7', 'Vidaintegra', 'www.vidaintegra.cl'),
('fe911290-7f60-4fc2-ad64-b0b2d3fa03eb', '079fe3d8-3292-44c1-82de-e88e89f08597', 'Farmacias Ahumada', 'www.farmaciasahumada.cl'),
('fe911290-7f60-4fc2-ad64-b0b2d3fa03eb', 'bad9cae7-c965-4e00-8f80-fb756c1583f9', 'Cruz Verde', 'www.cruzverde.cl'),
('634fee5d-6def-48fe-adae-4c4ea0c939c2', '53de5982-301b-4d20-94ec-4ecfa1708067', 'Salcobrand', 'www.salcobrand.cl'),
('634fee5d-6def-48fe-adae-4c4ea0c939c2', '5ac8d82f-10b3-438d-8c2b-e92a5a12b0eb', 'Fracción', 'www.fraccion.cl'),
('9e6732b0-4a44-4b94-949d-4c8024911bca', 'b92e434f-2c97-49cf-9dd2-bd6c5cd8b29f', 'Dr. Simi', 'www.drsimi.cl'),
('9e6732b0-4a44-4b94-949d-4c8024911bca', '3d8611e1-ffe0-438b-89ba-1b3a9da365a3', 'Knop', 'www.knop.cl'),
('a977a9b2-e78e-4ccd-865e-259371b40eaf', '87d0c8fb-a2db-4cce-ac0e-7a9904a4556e', 'Consalud', 'www.consalud.cl'),
('a977a9b2-e78e-4ccd-865e-259371b40eaf', 'dc9502a9-67fd-43f3-8731-86b6ca3da483', 'Nueva Masvida', 'www.nuevamasvida.cl'),
('ef628748-601e-4b77-8661-6cc48dfc8840', '702d7657-6cd0-48c0-934a-449038bddc33', 'Colmena', 'www.colmena.cl'),
('ef628748-601e-4b77-8661-6cc48dfc8840', '3708a20b-0294-4c52-8aaa-f999592e0a66', 'Cruz Blanca', 'www.cruzblanca.cl'),
('524f6962-bf2d-4a00-84b8-aa1fee10b73d', 'eb191410-92b9-4a2a-8fae-d870e54c989c', 'Vida Tres', 'www.vidatres.cl'),
('524f6962-bf2d-4a00-84b8-aa1fee10b73d', '48250a29-df1f-4eed-9b23-e35f5fc41c9f', 'Banmédica', 'www.banmedica.cl'),
('c6902f07-c199-4b34-9485-523cacf12717', '4e9d8ee5-5ef0-4100-a495-523524e7499c', 'BCI Seguros', 'www.bciseguros.cl'),
('c6902f07-c199-4b34-9485-523cacf12717', '03da26de-9def-4545-825a-e0d9b57f5797', 'MetLife', 'www.metlife.cl'),
('b48d27d3-2526-43ac-aae5-2bb2a2e8813a', '4a987296-1bb7-49f1-a27c-64b903abe2d3', 'Zurich', 'www.zurich.cl'),
('b48d27d3-2526-43ac-aae5-2bb2a2e8813a', 'fcf34422-8257-4cb0-8804-37f07340f37d', 'Consorcio', 'www.consorcio.cl'),
('740f8219-9997-443f-ad1d-d81936e7909b', 'd4d53c1f-334d-4c99-8659-4019ae820c21', 'Mapfre', 'www.mapfre.cl'),
('740f8219-9997-443f-ad1d-d81936e7909b', 'a44bb49d-6112-42cc-b7e5-a098cc0c598b', 'HDI Seguros', 'www.hdi.cl'),
('fea0b48c-461d-4a7d-ba74-7a31c1ebbef6', '0921d947-e401-40c8-a260-6b786626bf7c', 'Banco de Chile', 'www.bancochile.cl'),
('fea0b48c-461d-4a7d-ba74-7a31c1ebbef6', '9bdb219b-5957-484b-92e5-86d46d71e34e', 'Santander', 'www.santander.cl'),
('60ccd136-040a-42f3-bdfb-9e74e2cddfdb', '1c006df2-d803-4500-8c19-f9e58e01eb8a', 'Itaú', 'www.itau.cl'),
('60ccd136-040a-42f3-bdfb-9e74e2cddfdb', '40b62635-4fd6-49e1-bf7a-4fef04257341', 'BCI', 'www.bci.cl'),
('f8126036-1e13-450d-b5aa-13f9084369d2', '1a951a97-718f-4316-bba8-b159f61473f1', 'Banco BICE', 'www.bice.cl'),
('f8126036-1e13-450d-b5aa-13f9084369d2', '07506eb6-1824-44f0-b6a2-08d1e6890474', 'Security', 'www.security.cl'),
('4cc5eb95-858f-44b8-8e9c-194fa5fe35bf', 'f7517def-7d94-408f-b711-7288c71cc098', 'Scotiabank', 'www.scotiabank.cl'),
('4cc5eb95-858f-44b8-8e9c-194fa5fe35bf', '690e2b56-eebd-4d34-972c-8ca88a030c03', 'BancoEstado', 'www.bancoestado.cl'),
('380e27d3-ebff-4b15-8ad0-192be087dd55', '849eaf67-4b78-4b8d-ab92-e8c05d964d6b', 'Banco Falabella', 'www.bancofalabella.cl'),
('380e27d3-ebff-4b15-8ad0-192be087dd55', '67c67b18-a8f4-45b0-af88-54d0d0db545b', 'Consorcio', 'www.consorcio.cl'),
('659275e4-2279-4ffe-990f-8b625ada9317', '9d0cf2fe-3f96-490b-944d-a9c15629065b', 'Mercado Pago', 'www.mercadopago.cl'),
('659275e4-2279-4ffe-990f-8b625ada9317', '469b4640-a12a-428e-84f6-484f5863ae8a', 'MACH', 'www.mach.cl'),
('262966b7-ed31-4bf4-b09d-e0d2c427f4b9', '0b54c39d-3fe6-420f-9399-083620c6baf0', 'Fintual', 'www.fintual.cl'),
('262966b7-ed31-4bf4-b09d-e0d2c427f4b9', 'addc5a8f-aea6-4f3e-9f69-439514a60f95', 'Chek', 'www.chek.cl'),
('6edf0e99-40b0-4de8-9729-443305cbaf2d', '75edc13b-8f84-4eaa-81bb-dbf2b522ccd9', 'Global66', 'www.global66.com'),
('6edf0e99-40b0-4de8-9729-443305cbaf2d', '24028601-6820-4a43-8104-fc56c672e765', 'Tapp', 'www.tapp.cl'),
('5a583ce1-2432-4a29-bdfd-fb5b63f6d258', 'cf73505a-3568-4b0e-9fbb-b0ac75a0dddc', 'Tenpo', 'www.tenpo.cl'),
('5a583ce1-2432-4a29-bdfd-fb5b63f6d258', '61f78b46-b99b-4911-822e-b0d7abd9882a', 'Prex', 'www.prexcard.com'),
('40cd80d4-e4cb-48f7-9b5b-153afcc8be24', '5f31d4f0-85ec-49c6-8e92-ff0b363f45d3', 'Getnet', 'www.getnet.cl'),
('40cd80d4-e4cb-48f7-9b5b-153afcc8be24', 'baeb8dd5-3ab1-4dea-9fa3-623348267f93', 'Mercado Pago', 'www.mercadopago.cl'),
('a5cb7239-0a83-4795-82a5-72b0469af832', 'c769f555-6e62-4cde-90a4-4d8e5f82325a', 'American Express', 'www.americanexpress.com'),
('a5cb7239-0a83-4795-82a5-72b0469af832', '4b4a0a50-ad9d-4795-8c4a-871cd1a5e3d4', 'Webpay', 'www.webpay.cl'),
('ba2831f6-673e-436f-8051-b3a85e3cb19b', 'b38d4049-545c-40ef-a6e6-149f9979bca8', 'Mastercard', 'www.mastercard.com'),
('ba2831f6-673e-436f-8051-b3a85e3cb19b', 'f134e1fe-eafa-48d5-9ea4-79deea57787c', 'Visa', 'www.visa.com'),
('0cb5c6b4-355b-42f1-9a9e-934038d2d067', 'a7336596-5d10-40ce-a32f-dc2a6fdbd3d2', 'CMR Falabella', 'www.cmr.cl'),
('0cb5c6b4-355b-42f1-9a9e-934038d2d067', 'e6a9e5c3-2cdb-4d53-b430-494415fcf722', 'Redcompra', 'www.transbank.cl'),
('5efae174-139f-43cf-b69f-96df10d66f9b', '3c9c542c-e688-455d-b794-fcc9b0223b8e', 'BICE Inversiones', 'www.biceinversiones.cl'),
('5efae174-139f-43cf-b69f-96df10d66f9b', '1e0eb563-1c50-48ac-8b1d-7868ab21d4f3', 'Santander Corredora', 'www.santander.cl'),
('38304f24-cf1d-43dd-a171-1999533ac539', 'e7755adb-be5e-44a8-b1b9-6883f6512e57', 'BTG Pactual', 'www.btgpactual.cl'),
('38304f24-cf1d-43dd-a171-1999533ac539', '4e1fafe4-7c95-4621-b004-852193eef904', 'Renta4', 'www.renta4.cl'),
('fb498a38-5964-4e44-8ab0-88aa7c8c937d', 'e9241bbb-2ecc-4eae-b702-dfb2151a1bb5', 'LarrainVial', 'www.larrainvial.com'),
('fb498a38-5964-4e44-8ab0-88aa7c8c937d', '5a65295a-65d1-40f0-b4d3-baeabe5b126d', 'Banchile Inversiones', 'www.banchileinversiones.cl'),
('55a9a868-1fe8-4573-9b75-f754bc94810c', '37489008-7c21-4d5c-ae90-151deea8eb8c', 'Fintual', 'www.fintual.cl'),
('55a9a868-1fe8-4573-9b75-f754bc94810c', 'ce0c5b70-3e2b-4818-8c14-7bbdbf3bae5a', 'MBI', 'www.mbi.cl'),
('63e628c4-ff0e-4d96-b783-93eaf1628cde', '067a795d-648b-4f71-bc51-31e70e909bb0', 'Mundo', 'www.tumundo.cl'),
('63e628c4-ff0e-4d96-b783-93eaf1628cde', '06909bea-228b-46f5-809d-f357df3b56ae', 'Claro', 'www.claro.cl'),
('37ef095b-0e28-41e8-ba8b-9f476d175eac', '2864d88b-82ab-4993-9cc5-673b86e45dec', 'WOM', 'www.wom.cl'),
('37ef095b-0e28-41e8-ba8b-9f476d175eac', '6f9e3b59-66b8-4e81-a4ba-eee33486a3a7', 'Entel', 'www.entel.cl'),
('f8bdd27d-7d73-4496-8049-d23a11de6ace', '4767c540-bf57-422b-ae22-9a4cfc2890e0', 'Virgin Mobile', 'www.virginmobile.cl'),
('f8bdd27d-7d73-4496-8049-d23a11de6ace', 'de9ddcdb-d21b-47eb-a641-325749c94edf', 'Movistar', 'www.movistar.cl'),
('f587e82d-9ae6-4507-9f57-f2d649031992', 'cffe8115-b6ff-4145-a1dd-fb10a06986af', 'Movistar Fibra', 'www.movistar.cl'),
('f587e82d-9ae6-4507-9f57-f2d649031992', 'ec0d3338-f2d6-4ac3-8872-2367489de2cf', 'Mundo', 'www.tumundo.cl'),
('21a73dc2-618d-46a6-940a-992d1413291e', '3dba104a-5c98-4e61-8a3e-b7459b994d3c', 'GTD', 'www.gtd.cl'),
('21a73dc2-618d-46a6-940a-992d1413291e', '93ce3075-b43c-4ef6-975f-994fd485b71e', 'Entel Fibra', 'www.entel.cl'),
('a343cac0-6a8d-42f3-bc32-f7d712a03845', 'c69e76cb-130d-4eef-92b2-60bd058415dd', 'Telsur', 'www.telsur.cl'),
('a343cac0-6a8d-42f3-bc32-f7d712a03845', '6d2ab33d-d328-405d-a02f-0f0f5f066f8e', 'VTR', 'www.vtr.com'),
('38932061-328e-4f3b-aba8-e459de86b36d', '9444475d-5ccb-4ab5-9133-34b7604947ff', 'VTR', 'www.vtr.com'),
('38932061-328e-4f3b-aba8-e459de86b36d', '69ff4dff-b138-41b3-9e50-96b45f148bb4', 'Claro TV', 'www.claro.cl'),
('ef4b5b60-b535-46cc-8a3e-b2510321ee8b', '80d8083e-60ff-4357-bbf7-20a33d20599e', 'TuVes', 'www.tuves.cl'),
('ef4b5b60-b535-46cc-8a3e-b2510321ee8b', 'b0c7a142-3498-408b-afab-023867c34e9f', 'Movistar TV', 'www.movistar.cl'),
('c307c058-9440-411c-b587-6268249f410c', '0ff7db49-e0c1-48e2-b50b-725e1140bf19', 'DIRECTV', 'www.directv.cl'),
('c307c058-9440-411c-b587-6268249f410c', 'f3bc41e8-ecbb-4564-b7d2-3edd5337be80', 'Zapping', 'www.zapping.com'),
('8714bc6d-29d0-473b-abcf-c47a39c04339', 'acbc6c48-a5b2-4e41-8e4e-6f0c8aeb0a25', 'Claro video', 'www.clarovideo.com'),
('8714bc6d-29d0-473b-abcf-c47a39c04339', '89815f76-ed3c-4e40-bd5e-1740e7393316', 'Zapping', 'www.zapping.com'),
('b10bb61c-0284-4083-b0d8-c2a9cd9fd92d', 'f157f51f-ccb6-4396-8625-aa1ac2283786', 'MiCHV', 'www.chilevision.cl'),
('b10bb61c-0284-4083-b0d8-c2a9cd9fd92d', 'f6405dcb-c399-4443-bc51-f7216c6e23dd', 'TVN Play', 'www.tvn.cl'),
('b3983225-878b-402b-9d05-efd2c62c4f9b', '96175e38-731d-4e2c-82ca-d05dc5a08ce5', 'DGO', 'www.directvgo.com'),
('b3983225-878b-402b-9d05-efd2c62c4f9b', 'a2651f5f-bdc6-4f78-9b2b-1a99e6b71710', 'Movistar TV App', 'www.movistar.cl'),
('f9717ac9-45b1-4c00-8cf9-dfb57f94f34a', '5c9f347e-df03-4caf-ae3e-fb146f9f2a06', 'Líder', 'www.lider.cl'),
('f9717ac9-45b1-4c00-8cf9-dfb57f94f34a', 'ec197acb-0d92-4043-910a-5b3db4a087d2', 'Tottus', 'www.tottus.cl'),
('8d1b9145-fac9-4b51-b85f-af9dc93c86f8', 'bc0096a9-5205-4ecb-b47b-39ec00c993fe', 'Alvi', 'www.alvi.cl'),
('8d1b9145-fac9-4b51-b85f-af9dc93c86f8', 'df328df0-e76b-4476-9fa7-2d50821364e9', 'Unimarc', 'www.unimarc.cl'),
('baf7d6af-c050-4437-977a-28e7a5466dfa', 'e70c0b6f-7a45-4011-9320-edadd3f7e17f', 'aCuenta', 'www.acuenta.cl'),
('baf7d6af-c050-4437-977a-28e7a5466dfa', 'c52072bb-85b9-464f-9690-37f26f71df9f', 'Santa Isabel', 'www.santaisabel.cl'),
('dec63e6f-73b3-40b4-8207-3c53cb598bc1', 'b99524d5-a49d-4d69-bb33-b26b8bc408aa', 'AliExpress', 'www.aliexpress.com'),
('dec63e6f-73b3-40b4-8207-3c53cb598bc1', '2a5394c9-724b-4922-94ff-ff6f94fbc951', 'Paris', 'www.paris.cl'),
('f454d6a1-7b08-497a-9053-9460182259b0', '3aec2b10-0656-42a7-a1d0-88a47aad493d', 'Falabella', 'www.falabella.com'),
('f454d6a1-7b08-497a-9053-9460182259b0', '13ad600d-73fc-4c90-abdf-922c1482de73', 'Mercado Libre', 'www.mercadolibre.cl'),
('98d468f4-f9c8-4561-9ec0-68d685f1586f', '2b69d8c5-1cef-4631-a83c-5b509c52fc46', 'Amazon', 'www.amazon.com'),
('98d468f4-f9c8-4561-9ec0-68d685f1586f', 'c84a3f56-0818-4f0b-a80b-d3ba0ec4d188', 'Linio', 'www.linio.com'),
('d10379e2-63d3-42e7-93f6-9f3526046175', '3f37e728-14a0-4df5-9bc0-9d824a344110', 'Falabella', 'www.falabella.com'),
('d10379e2-63d3-42e7-93f6-9f3526046175', '78c0d5dc-f1fa-4da3-a3ac-773930052820', 'Ripley', 'www.ripley.cl'),
('f60e5a51-fba8-422c-8ff1-e177d0365fcc', '105061d0-bbbc-4515-a169-184dcaa32397', 'ABC', 'www.abc.cl'),
('f60e5a51-fba8-422c-8ff1-e177d0365fcc', '9901112d-5ed0-4c5e-a88c-74af9ecea0f9', 'Paris', 'www.paris.cl'),
('ded3e918-4b54-434a-83e2-03bedb7ac408', '26ca9d30-f837-46c9-acbe-e0b34c626377', 'La Polar', 'www.lapolar.cl'),
('ded3e918-4b54-434a-83e2-03bedb7ac408', '6447e5b0-843a-4b2f-b4e1-19874843b6de', 'Hites', 'www.hites.com'),
('d42aac86-dd8c-459f-a869-6fb61916f3c1', '10b8e275-06e1-494d-a8eb-22f6a47568e5', 'Easy', 'www.easy.cl'),
('d42aac86-dd8c-459f-a869-6fb61916f3c1', '4f16de4c-265e-415f-b7a6-d2fed18cad77', 'Sodimac', 'www.sodimac.cl'),
('c4633429-2bff-4bcc-a074-66d15c6201f0', 'cdff9954-056d-4bdf-bb94-87196010fb58', 'Construmart', 'www.construmart.cl'),
('c4633429-2bff-4bcc-a074-66d15c6201f0', '69e72e6a-43a1-4de4-9f5d-b52d4882bf1d', 'MTS', 'www.mts.cl'),
('056b65a1-7027-4c2b-bf98-b14f549a4816', 'b9b0606b-d34f-4bec-8285-73f6e3e4daa9', 'Imperial', 'www.imperial.cl'),
('056b65a1-7027-4c2b-bf98-b14f549a4816', 'd2e1aa22-d11e-4246-b0c6-af46a5c8a006', 'Chilemat', 'www.chilemat.cl'),
('689ff287-f918-43ae-b292-a6b0ac2b79e6', 'c241dc31-6907-42db-b37d-f414bf420842', 'Reifstore', 'www.reifstore.com'),
('689ff287-f918-43ae-b292-a6b0ac2b79e6', '0de76f54-09f9-4c27-8f3d-dae8b944866e', 'SP Digital', 'www.spdigital.cl'),
('8f32c73c-c3a1-4a72-a58b-987a38e979f3', 'c8e1470b-a3a8-4811-8e13-c5f199407fa8', 'Falabella', 'www.falabella.com'),
('8f32c73c-c3a1-4a72-a58b-987a38e979f3', 'c4a9cad5-cb9a-460a-9587-3dc05465e4e3', 'PC Factory', 'www.pcfactory.cl'),
('ae652e83-0d5b-474e-acfa-ee6dbfd14842', '197a6615-7361-4cfc-b907-178c4947af91', 'Ripley', 'www.ripley.cl'),
('ae652e83-0d5b-474e-acfa-ee6dbfd14842', '8cd42b63-8129-486b-93a5-5de5ae86c6bd', 'WePlay', 'www.weplay.cl'),
('a247c19d-032a-4011-bbe9-1a651846ae80', 'deb16bc5-9f19-444c-9de1-2a7d45e8ad85', 'Sybilla', 'www.sybilla.cl'),
('a247c19d-032a-4011-bbe9-1a651846ae80', 'ad21b9a5-191c-429b-bbc0-71653537b3a7', 'Corona', 'www.corona.cl'),
('dc865be1-0305-4eeb-aabc-5e4c7649c981', 'd9a70604-3d92-47f6-bef6-557aa3655d64', 'Zara', 'www.zara.com'),
('dc865be1-0305-4eeb-aabc-5e4c7649c981', '1d33dac9-7678-4f1e-abba-9e0a19dfc1bd', 'Family Shop', 'www.familyshop.cl'),
('fd377cc1-382a-4ff7-884a-8b22df67a915', '971ed7f4-7009-4468-85ac-46ab1703ced4', 'Mango', 'www.mango.com'),
('fd377cc1-382a-4ff7-884a-8b22df67a915', 'bfb9e1e6-818b-4b7c-b863-e4ee52307ec4', 'Tricot', 'www.tricot.cl'),
('91e651cb-b5c6-4c39-9291-ff9c670f62d4', '942cb349-495b-472c-8a7c-b58ff202218f', 'Zara', 'www.zara.com'),
('91e651cb-b5c6-4c39-9291-ff9c670f62d4', '62dfd319-97cd-42c5-91c1-b5f08d6a31d3', 'Stradivarius', 'www.stradivarius.com'),
('71e3db51-c183-41a3-bcb4-4e71177eed8c', 'a30511c4-074a-4556-8509-e9d509a34e6d', 'H&M', 'www.hm.com'),
('71e3db51-c183-41a3-bcb4-4e71177eed8c', '8dab2e83-3d2b-4d0d-bf5b-8b9c6b3cb817', 'Bershka', 'www.bershka.com'),
('2bd1fdee-c2fb-4f37-86b1-78ce48b5d8f6', '5de78e10-36d9-417e-ba19-3cff58eab5cb', 'Mango', 'www.mango.com'),
('2bd1fdee-c2fb-4f37-86b1-78ce48b5d8f6', '63104a74-a74e-454f-b6bf-025371cc7140', 'Pull&Bear', 'www.pullandbear.com'),
('f3b46e50-7d18-4334-b3f6-b5a9c7817cb0', 'e64b3708-6a33-4e98-b28f-3779688089f2', 'Hush Puppies', 'www.hushpuppies.cl'),
('f3b46e50-7d18-4334-b3f6-b5a9c7817cb0', '98fdc54f-804b-412b-8f32-84508ba73a09', 'Nike', 'www.nike.com'),
('5b6651ab-9699-4b07-8c54-67e75abf3aa6', 'e97b6b97-b037-481e-9e84-230a326f90ba', 'Aldo', 'www.aldoshoes.com'),
('5b6651ab-9699-4b07-8c54-67e75abf3aa6', 'e4c582c6-5243-4058-81ec-b31a00ffd9aa', 'Guante', 'www.guante.cl'),
('c0d1060d-fb8f-49eb-b4c3-0c4f1f5a518e', '522b72c4-4903-4682-869a-4828f768f6e3', 'Bata', 'www.bata.cl'),
('c0d1060d-fb8f-49eb-b4c3-0c4f1f5a518e', 'aa320fb9-a51c-4b28-ae98-c12f59adbcdd', 'Skechers', 'www.skechers.cl'),
('a05d929e-5710-4987-bbc7-5120b0670768', '3cc35481-58da-4bfd-8785-dbee73b95ef6', 'Nike', 'www.nike.com'),
('a05d929e-5710-4987-bbc7-5120b0670768', 'e2f31367-0029-45f4-9c89-0de769686073', 'Decathlon', 'www.decathlon.cl'),
('6b054fa5-c0d0-4aec-9a2b-576011c46cbf', '41318922-b9c8-4bbc-a8a2-5b263a9d69b8', 'Puma', 'www.puma.com'),
('6b054fa5-c0d0-4aec-9a2b-576011c46cbf', '19722073-9ff2-4cc3-8756-16e496a21d38', 'Reebok', 'www.reebok.com'),
('55f21df2-2550-4e36-9583-f4867516b007', 'bb1c3fb5-17c3-4ad2-86e5-8bcee1e140e6', 'Under Armour', 'www.underarmour.com'),
('55f21df2-2550-4e36-9583-f4867516b007', '684fcb21-99e3-49ca-a63a-2d4b7571516d', 'Sparta', 'www.sparta.cl'),
('3c49715d-b0ee-4d38-a9fe-1b0ce43e5678', '4710ee57-c70f-4e75-8371-969047c103c1', 'New Balance', 'www.newbalance.com'),
('3c49715d-b0ee-4d38-a9fe-1b0ce43e5678', 'b8ea30a0-0bb4-46f4-a563-0792e9100c9c', 'adidas', 'www.adidas.cl'),
('9b0d71c0-fc5e-4605-8272-dccc9e02b18b', '8e1c077c-bec2-4eff-9de4-4e81c9f3d75e', 'Columbia', 'www.columbia.cl'),
('9b0d71c0-fc5e-4605-8272-dccc9e02b18b', '6b8becf4-fe29-4f1e-aaea-000409263496', 'Patagonia', 'www.patagonia.com'),
('179ac56c-638f-402d-ae1e-c4d6b003e458', 'bcea6625-2d82-44aa-bba6-afb2c57a9fc3', 'The North Face', 'www.thenorthface.cl'),
('179ac56c-638f-402d-ae1e-c4d6b003e458', '28fc92b3-3086-447d-9fef-f79f6a01d998', 'Doite', 'www.doite.cl'),
('d68f3bd1-5fb0-4758-9dca-d231441d922e', '6ae88b04-2af5-44ce-a0ee-74b5f2d003a8', 'Marmot', 'www.marmot.cl'),
('d68f3bd1-5fb0-4758-9dca-d231441d922e', '8bb52711-aa05-482b-b0fb-94efbdb1ef05', 'Lippi', 'www.lippioutdoor.com'),
('baa7b4a4-2235-4dba-804c-84ccfef7de1c', '25dd28db-1073-4518-a65c-e1f8e53db1c4', 'Pandora', 'www.pandora.net'),
('baa7b4a4-2235-4dba-804c-84ccfef7de1c', '139358f1-3215-4548-aaf9-0a747d28c7a8', 'Swarovski', 'www.swarovski.com'),
('6f045fad-1ab6-443b-affd-cfa30eaa2f33', 'c8e36510-71ab-444e-bec0-6c0d7e22244b', 'Secret', 'www.secret.cl'),
('6f045fad-1ab6-443b-affd-cfa30eaa2f33', '7c833bea-637f-4496-8be0-b910f4e134e9', 'Saxoline', 'www.saxoline.cl'),
('ee04f5e7-c395-44b6-9163-7a8aeffdd115', 'f3d8366d-7864-464a-b4cc-21a333e85612', 'Amphora', 'www.amphora.cl'),
('ee04f5e7-c395-44b6-9163-7a8aeffdd115', 'e8306035-4960-487b-825a-109f58e9dfed', 'Tous', 'www.tous.com'),
('51cee30c-34ad-4ce4-abbe-66ed6815c761', '4c50f27d-a2cb-4b4e-8b48-7d6165700a67', 'KFC', 'www.kfc.cl'),
('51cee30c-34ad-4ce4-abbe-66ed6815c761', 'fb4a440e-2ab8-4cf2-a28b-b8756cc8b809', 'Burger King', 'www.burgerking.cl'),
('8381ed7e-4960-4a0f-814f-9020ddf04d10', '9e41c4da-4ed4-4f6a-9b4f-142aa8040dce', 'Juan Maestro', 'www.juanmaestro.cl'),
('8381ed7e-4960-4a0f-814f-9020ddf04d10', 'a8ccb086-5cc8-44ad-a005-d565b56108bb', 'Subway', 'www.subway.com'),
('ebda1c45-23fa-43ff-b2af-ea9e12dcad0b', 'e111860a-624e-4a74-b18e-44f0f06a2008', 'Doggis', 'www.doggis.cl'),
('ebda1c45-23fa-43ff-b2af-ea9e12dcad0b', '2e12db5e-64f9-4199-89e5-a27a3576fca8', 'McDonald''s', 'www.mcdonalds.cl'),
('77c15b07-e6ad-493e-b006-5f910621c472', '14222eab-c42f-4d9c-a0bd-f47ab422d6ee', 'Pedro, Juan & Diego', 'www.pyd.cl'),
('77c15b07-e6ad-493e-b006-5f910621c472', 'a902dba3-b86e-451b-be7c-30dca153b067', 'Tarragona', 'www.tarragona.cl'),
('7a3601c3-14ce-403e-b4a8-83a3bd214d9d', 'f1ab3783-d5fc-4a75-a672-c564022daa70', 'Juan Valdez', 'www.juanvaldez.com'),
('7a3601c3-14ce-403e-b4a8-83a3bd214d9d', 'e66ee742-4a21-4e7f-ae15-ccacf409828b', 'Tavelli', 'www.tavelli.cl'),
('91a148d5-3204-4887-b8ca-ca6f6c9be197', '3dce76fd-536b-4a94-a34f-50f14cf31796', 'Café Haiti', 'www.cafehaiti.cl'),
('91a148d5-3204-4887-b8ca-ca6f6c9be197', 'b8209f99-e6e3-41b7-a131-f210a6d541a6', 'Starbucks', 'www.starbucks.cl'),
('ce862510-75e9-4711-9702-b330a017e90b', '2818b9c7-aa94-4008-9fb3-8958adef90a9', 'Castaño', 'www.castano.cl'),
('ce862510-75e9-4711-9702-b330a017e90b', 'ebfd66a4-02be-4994-aea1-3bc63ff737a1', 'Dunkin', 'www.dunkin.cl'),
('1bf3d432-d9de-4f80-8ca6-0273e1275555', '7b02e2b5-cd6d-4c77-8fc9-17dd957417c6', 'Pizza Hut', 'www.pizzahut.cl'),
('1bf3d432-d9de-4f80-8ca6-0273e1275555', '899c2192-4aa4-459b-99f9-9e41ae75644c', 'Domino''s', 'www.dominospizza.cl'),
('9dc2cd22-6ec5-452e-bd65-0391b1e9d548', '417b07f3-fa69-4d35-82ce-425dad855bb2', 'Little Caesars', 'www.littlecaesars.cl'),
('9dc2cd22-6ec5-452e-bd65-0391b1e9d548', 'ea4cf6fd-5132-401d-b71f-9b56b82fffef', 'Papa Johns', 'www.papajohns.cl'),
('e6a2215c-754c-41eb-8394-73e3e1ff25df', '98ed8038-8fa9-45a5-b54d-7564b84ed150', 'Telepizza', 'www.telepizza.cl'),
('e6a2215c-754c-41eb-8394-73e3e1ff25df', '048b7fd5-15d7-486c-ad35-7ca4cafe20a4', 'Melt Pizzas', 'www.meltpizzas.cl'),
('fa3de9e3-9b43-4d81-b3ec-ac72d8607037', 'da1a9a58-13a3-4d0c-932a-cd9fc5d2b36c', 'Rappi', 'www.rappi.cl'),
('fa3de9e3-9b43-4d81-b3ec-ac72d8607037', '646dbdcb-317c-4903-806f-f1ef76b894fb', 'Justo', 'www.justoapp.com'),
('677b9b22-a98f-453e-b36c-5a7cc7b6e382', 'b3eba5fe-dfb7-40e6-b6ac-3a6ce2b79ca9', 'Uber Eats', 'www.ubereats.com'),
('677b9b22-a98f-453e-b36c-5a7cc7b6e382', '551b4fc5-7504-456d-9c95-32d146063c16', 'Orders', 'www.orders.cl'),
('bde6a455-10e5-43c6-a986-21fae3d0eb1d', 'a70fd21a-4a6c-40df-882c-560780253d02', 'DiDi Food', 'www.didi.global'),
('bde6a455-10e5-43c6-a986-21fae3d0eb1d', 'ddeec668-fe2c-443d-b905-b9d0bd2cf0f0', 'PedidosYa', 'www.pedidosya.cl'),
('ca3bd9c3-2ba7-4182-9a01-3774dabb8acd', 'cd7dcfbc-e4cf-4d27-bcd7-7ed6d5a19246', 'LATAM', 'www.latamairlines.com'),
('ca3bd9c3-2ba7-4182-9a01-3774dabb8acd', '14201c6c-062e-4e73-83d6-e55513ead65d', 'Avianca', 'www.avianca.com'),
('0c218c1b-0341-4b24-a214-b8726792ad4d', 'f9333663-8772-4be4-83a1-9ea6b1fc71b7', 'Air France', 'www.airfrance.com'),
('0c218c1b-0341-4b24-a214-b8726792ad4d', 'e191d3b3-fde6-420b-8ec1-3f67b656d0c8', 'Sky Airline', 'www.skyairline.com'),
('a4505fb9-05d1-4ae4-b6cb-2620bc9d3def', '09bf5ec1-a597-41d2-a8c2-a8a4b633e125', 'JetSMART', 'www.jetsmart.com'),
('a4505fb9-05d1-4ae4-b6cb-2620bc9d3def', 'c485301f-cba8-4160-8f95-611a7074d5b4', 'Iberia', 'www.iberia.com'),
('eeff42bd-b4d0-461d-8362-235bc43fbac2', '72e358d5-a955-46dc-b145-6207075ce807', 'American Airlines', 'www.aa.com'),
('eeff42bd-b4d0-461d-8362-235bc43fbac2', '1ce92c40-f1fa-46ae-ae2a-6e3241e961f3', 'United Airlines', 'www.united.com'),
('a4de080e-db9c-4a40-a87a-3df2622d2c26', '250f551d-35c1-44b0-8732-6cff435b4f47', 'Copa Airlines', 'www.copaair.com'),
('a4de080e-db9c-4a40-a87a-3df2622d2c26', '3de1b045-8a58-447a-b59f-9371d907a79d', 'Delta Air Lines', 'www.delta.com'),
('681cfb50-bf60-4834-bd88-9c6c55ce4d3e', '1b3c44f8-ca06-4b9b-9174-7141557c7846', 'Uber', 'www.uber.com'),
('681cfb50-bf60-4834-bd88-9c6c55ce4d3e', 'a7cc6b05-4bee-4edb-bc4c-66549d4ef684', 'Cabify', 'www.cabify.com'),
('696fb04b-6729-42be-b3fb-58ee7d3d405e', '4459648e-e745-4f33-9cff-47a104ba8703', 'Transvip', 'www.transvip.cl'),
('696fb04b-6729-42be-b3fb-58ee7d3d405e', '8df205cd-d325-41dd-bdb0-85270f5800a3', 'Awto', 'www.awto.cl'),
('f8dd95a8-c7b0-495b-88ea-75e795864b87', '9dd999dc-a9ab-494a-860c-70c1908cbc30', 'DiDi', 'www.didi.global'),
('f8dd95a8-c7b0-495b-88ea-75e795864b87', '5c78a334-d2f3-49f0-917b-34c3e8c17b30', 'inDrive', 'www.indrive.com'),
('b127ec62-9113-4f88-8a29-b9f0bf092ee8', '73a3a086-1bc3-4d9d-b41d-4aaa6f286c33', 'Mazda', 'www.mazda.cl'),
('b127ec62-9113-4f88-8a29-b9f0bf092ee8', 'dcf68393-2dec-4623-b4f7-bc93a3a543a5', 'Kia', 'www.kia.cl'),
('88589821-877e-45f5-afcf-40a3f2e1467e', '067f2ff6-b8fa-4608-9121-7c38e131e58c', 'Toyota', 'www.toyota.cl'),
('88589821-877e-45f5-afcf-40a3f2e1467e', 'ab66e40b-bd0c-43e7-a74b-d9d336302331', 'Chevrolet', 'www.chevrolet.cl'),
('e7ef1781-07ba-4415-8ad5-fe9c3ce07942', '698ccd85-a457-4c1f-b2fb-5527c83fbcb4', 'Hyundai', 'www.hyundai.cl'),
('e7ef1781-07ba-4415-8ad5-fe9c3ce07942', '777bde6c-5d5d-424c-a971-107193638dbe', 'Nissan', 'www.nissan.cl'),
('1e07d849-d829-489e-93b4-f2992656134e', '2f9261c3-681e-4922-a196-30785eb25746', 'Peugeot', 'www.peugeot.cl'),
('1e07d849-d829-489e-93b4-f2992656134e', '4e8b0b7e-7308-454f-8b54-81903a488a16', 'Suzuki', 'www.suzuki.cl'),
('8301c005-7021-4b33-9063-91e7cbec38dc', '8ad4a312-7fdc-4c0e-a4b0-462dadeabcb2', 'BMW', 'www.bmw.cl'),
('8301c005-7021-4b33-9063-91e7cbec38dc', 'adbacf59-c440-4ff1-a216-92b19cca8c77', 'Mercedes-Benz', 'www.mercedes-benz.cl'),
('1602b820-4133-4fa9-8a16-02e9229c5a5e', 'eb958dfc-01d2-43aa-b6fd-4230fbf417ef', 'MG', 'www.mgmotor.cl'),
('1602b820-4133-4fa9-8a16-02e9229c5a5e', '3f36b3cc-a0d7-4ecb-aae2-408c5ebdfd2a', 'Jetour', 'www.jetourglobal.com'),
('6da3835f-1046-40ad-8723-deb831612e25', 'dad7cea6-2523-4129-9a5b-da1fe764f911', 'Geely', 'www.geely.com'),
('6da3835f-1046-40ad-8723-deb831612e25', '0a254a10-8f15-4c02-96f2-f1aad3f06ed1', 'Haval', 'www.haval.cl'),
('c2876bb1-63d6-4654-a5e9-6c18d90e7b19', '18c31f79-7cc1-4440-a517-23d2cffd74ec', 'Chery', 'www.chery.cl'),
('c2876bb1-63d6-4654-a5e9-6c18d90e7b19', '340802e6-fbdd-4740-987e-33d3b2fabccc', 'Great Wall', 'www.gwm-global.com'),
('ad36da91-339a-4745-bc35-a6a909f41de9', '11b7d105-0036-4045-a909-ebb75ccd69a4', 'BYD', 'www.byd.com'),
('ad36da91-339a-4745-bc35-a6a909f41de9', '00d33215-083f-4105-9a96-61d128bbd506', 'JAC', 'www.jac.cl'),
('cc36b979-3020-441a-8ffd-b1627fa6977c', '8a831252-c309-4e10-be63-f3ee3a61bb84', 'Bruno Fritsch', 'www.brunofritsch.cl'),
('cc36b979-3020-441a-8ffd-b1627fa6977c', 'f49f20cd-f319-465e-8592-93671ea99781', 'Portillo', 'www.portillo.cl'),
('148754ff-6df5-46f8-b904-7501aa47d787', '588d7602-f4fe-4e2d-bfb0-4e72321dacad', 'Salazar Israel', 'www.salazarisrael.cl'),
('148754ff-6df5-46f8-b904-7501aa47d787', 'd1a29e99-a1f7-4d7c-8125-34a3fc422723', 'Kaufmann', 'www.kaufmann.cl'),
('7e29059a-f4bd-4b53-9a64-408ddf769095', 'a1aa92a5-d043-4aea-a41c-5bd6554b71b1', 'Gildemeister', 'www.gildemeister.cl'),
('7e29059a-f4bd-4b53-9a64-408ddf769095', '3045db09-bef9-46cd-a4a9-bf71a79f864e', 'DercoCenter', 'www.dercocenter.cl'),
('e752cd11-1534-4785-830e-143bc0a6a2ed', '48a6dbe6-67f7-40fa-af51-2e7c51f7f527', 'Paramount+', 'www.paramountplus.com'),
('e752cd11-1534-4785-830e-143bc0a6a2ed', '37c92da0-3d32-45c3-8fd6-bfb558e07914', 'MUBI', 'www.mubi.com'),
('48530651-7cd6-4524-a351-dbc0aac1cab7', '9ebb3cc2-1443-44d1-ad4e-c0aff2498bb6', 'Apple TV+', 'www.apple.com'),
('48530651-7cd6-4524-a351-dbc0aac1cab7', 'b43fe794-1ce5-4ad1-8106-9feea930f548', 'Prime Video', 'www.primevideo.com'),
('fad8cd26-ab9b-4770-a3b2-a3062d7caf7c', '5971203b-68e4-4f07-b95f-180471ed2544', 'Max', 'www.max.com'),
('fad8cd26-ab9b-4770-a3b2-a3062d7caf7c', '60d39e43-29dd-4ff5-b94d-dfe04b0db53f', 'Disney+', 'www.disneyplus.com'),
('7f4eac25-72ad-434f-a393-291515d1c915', '7360679c-d922-4c84-bc4a-c81004fa05d9', 'Universal+', 'www.universalplus.com'),
('7f4eac25-72ad-434f-a393-291515d1c915', '39ac02d0-663c-42a3-ae82-56c8e8b80ff1', 'Netflix', 'www.netflix.com'),
('236ed59e-aba1-4f35-b321-6f6fb1957866', '53d208ad-f2d4-4c78-9f31-0023917424ea', 'YouTube Music', 'www.youtube.com'),
('236ed59e-aba1-4f35-b321-6f6fb1957866', 'aed07625-a46f-438f-8e1a-03615610dbab', 'Deezer', 'www.deezer.com'),
('8a2d2a0c-c4ed-4218-bbac-fd69f0bdfd70', '0d567b2a-8f99-43b9-8cbc-ff422145004d', 'Apple Music', 'www.apple.com'),
('8a2d2a0c-c4ed-4218-bbac-fd69f0bdfd70', '71458d1b-6214-4caa-9438-49c71378303d', 'Spotify', 'www.spotify.com'),
('214b2c18-00cd-4063-9445-ad8359a81f74', '14041c51-dbd4-416c-a6fe-d99927c157e2', 'TIDAL', 'www.tidal.com'),
('214b2c18-00cd-4063-9445-ad8359a81f74', '6b57305e-e768-432a-bfa4-78fb4689a022', 'Amazon Music', 'www.amazon.com'),
('a2bd3bfc-0ee1-42a2-87a3-a0dcf42921fb', 'c314da28-b590-436b-aeca-8fe4ebc19ed4', 'Muvix', 'www.muvix.cl'),
('a2bd3bfc-0ee1-42a2-87a3-a0dcf42921fb', '1a25e691-3d0f-4615-bafc-82a476e261f4', 'Cine Hoyts', 'www.cinehoyts.cl'),
('cc5487b9-da37-4319-bbe0-4c2faeb31e60', 'f8fe8c20-c504-4b46-9dce-497d2284ac52', 'Cinépolis', 'www.cinepolis.cl'),
('cc5487b9-da37-4319-bbe0-4c2faeb31e60', '002b7667-07ca-49ce-a523-38e0e10dbeea', 'Cineplanet', 'www.cineplanet.cl'),
('b3d50c2a-a169-41df-86f2-8a01d3ec1c70', 'c04df59c-5eac-475d-924e-1a1336073ba4', 'Cinestar', 'www.cinestar.cl'),
('b3d50c2a-a169-41df-86f2-8a01d3ec1c70', '88f2513a-7598-4cec-a63a-2580910f4586', 'Cinemark', 'www.cinemark.cl'),
('abf0e74c-f507-4716-8c15-ddad002ca857', '1d326869-15b5-4a08-ad67-2c51c2881938', 'Canada Dry', 'www.canadadry.com'),
('abf0e74c-f507-4716-8c15-ddad002ca857', 'd3f4bcd5-93bc-40a6-975f-ed0e5dd54a1f', 'Sprite', 'www.sprite.com'),
('d1f97e21-95e8-45f8-a289-5cac9ce69605', '97fa6926-984e-4d1d-8dc0-264dc17368d2', 'Coca-Cola', 'www.cocacola.cl'),
('d1f97e21-95e8-45f8-a289-5cac9ce69605', '90b77991-13f6-40a2-8a94-59a5e4702cc3', 'Fanta', 'www.fanta.com'),
('3fb1c408-43b9-4363-8198-a78ad5364c27', '39b0dcf4-1be6-463c-ad07-f5db4160ceb7', 'Pepsi', 'www.pepsi.com'),
('3fb1c408-43b9-4363-8198-a78ad5364c27', '4a96fa00-540a-438c-84b7-19098011a3ec', 'Schweppes', 'www.schweppes.com'),
('89e8a89a-51dd-41ce-9b47-7173b2108cca', 'cc189e82-31a1-45f4-aa8c-0f8605be200d', 'Monster', 'www.monsterenergy.com'),
('89e8a89a-51dd-41ce-9b47-7173b2108cca', 'f49a64b9-cb9f-4dc6-81a6-957734fa07ee', 'Burn', 'www.burn.com'),
('ab997c9c-234c-4a4c-8579-f4d5bcccaf3e', '41bb1e5f-2cf0-4561-91df-0b725890d44e', 'Red Bull', 'www.redbull.com'),
('ab997c9c-234c-4a4c-8579-f4d5bcccaf3e', '06fc0a07-770a-4d42-ba05-d8bc93dc5e15', 'Celsius', 'www.celsius.com'),
('fdbeaec8-ca82-4eb9-b198-aa57f2a33c34', 'c1a5b2f2-ef82-4771-ae40-0f0b43716cf8', 'Rockstar', 'www.rockstarenergy.com'),
('fdbeaec8-ca82-4eb9-b198-aa57f2a33c34', 'cc8eeefd-5f11-404b-bbec-cd748864ee5a', 'Prime Energy', 'www.drinkprime.com'),
('741095b8-20b8-4496-8c7a-2e6f62aeeec6', '30bca148-cf5c-4324-a681-ec8fd581ddc4', 'Cristal', 'www.cervezacristal.cl'),
('741095b8-20b8-4496-8c7a-2e6f62aeeec6', 'cb023ff1-4d37-4e7b-a822-2c0519f0bedd', 'Escudo', 'www.escudo.cl'),
('24247590-ffef-4bec-be0a-35510bc750b1', 'cd8bf7fe-ff49-4e89-b48e-15fe04c0bdde', 'Becker', 'www.becker.cl'),
('24247590-ffef-4bec-be0a-35510bc750b1', 'ccdc2347-6282-445a-b4a9-0fe8f757745b', 'Kunstmann', 'www.kunstmann.cl'),
('b044ac79-b0e1-4d5b-aed6-359ceab7d5e5', '94e35c1b-de1e-463e-a13e-62595ac2a12f', 'Heineken', 'www.heineken.com'),
('b044ac79-b0e1-4d5b-aed6-359ceab7d5e5', '91268e9e-5d5b-40b5-8514-79dc27521532', 'Corona', 'www.corona.com'),
('621d1f58-4613-402a-b868-f11280825aae', 'aaea5271-f67c-4cfb-8891-993f8fcdcc06', 'Cachantun', 'www.cachantun.cl'),
('621d1f58-4613-402a-b868-f11280825aae', '619bcf96-170d-423e-a143-d9d43984d0ef', 'Benedictino', 'www.benedictino.cl'),
('5baeb8d6-f2e5-4812-b936-1b00f12da420', 'a03ffae9-ed74-44b9-b9e9-366f1aaf35e6', 'Aquarius', 'www.aquarius.com'),
('5baeb8d6-f2e5-4812-b936-1b00f12da420', '09c292f3-ea45-4578-ba7d-cadee738c05b', 'Vital', 'www.vitalagua.cl'),
('3467cb9f-97b7-43f4-ba95-6d5c8dafc990', '16ae44ae-06d7-4474-b2e5-444147c6965c', 'Perrier', 'www.perrier.com'),
('3467cb9f-97b7-43f4-ba95-6d5c8dafc990', '495dfdda-8708-46b3-810e-ae8fe54b70c1', 'Evian', 'www.evian.com'),
('d625a8e2-c519-4374-908f-00aaf8d3f14f', 'fa5ab19f-6566-4661-ae8d-86d5fd73521e', 'Pudahuel', 'www.pudahuel.cl'),
('d625a8e2-c519-4374-908f-00aaf8d3f14f', '996d64ec-3a33-4327-8555-827191eb4c1f', 'Carolina', 'www.carolina.cl'),
('f675da93-2c92-4dca-9c5b-9313cfb75315', 'dc89adad-ffba-4486-ad74-c0de550064a8', 'Radio Bío Bío', 'www.biobiochile.cl'),
('f675da93-2c92-4dca-9c5b-9313cfb75315', '8d577377-21b1-4e11-b303-81d15c432530', 'ADN Radio', 'www.adnradio.cl'),
('e020ea3a-2dee-4634-b3af-29af13888613', '11e0721a-ce00-40b8-97f4-3225d6704d33', 'Radio Agricultura', 'www.radioagricultura.cl'),
('e020ea3a-2dee-4634-b3af-29af13888613', 'a0ba48e3-fcf4-40ad-82b4-ab728c649127', 'Cooperativa', 'www.cooperativa.cl'),
('2639bc86-f38e-4abc-b8ca-e51104663735', '5d81644d-4107-43f2-b560-8a2ff7b0cfb0', 'Mega', 'www.mega.cl'),
('2639bc86-f38e-4abc-b8ca-e51104663735', 'd605150a-f042-469c-8856-3a745addc016', 'Chilevisión', 'www.chilevision.cl'),
('a624d258-4811-42c7-ac5d-a15324158911', '285483ea-93f0-4f07-9ca0-7b5c88b9a549', 'TV+', 'www.tvmas.tv'),
('a624d258-4811-42c7-ac5d-a15324158911', '40b968ae-d55b-429a-be1e-1a45174b27ea', 'La Red', 'www.lared.cl'),
('94d00dcb-84c3-40bc-b3a4-52199cc41762', '684f79a0-387a-47d0-8027-e2b000dd4cf0', 'Canal 13', 'www.t13.cl'),
('94d00dcb-84c3-40bc-b3a4-52199cc41762', 'bf841106-1454-4440-bffe-cd04c35b9be8', 'TVN', 'www.tvn.cl'),
('9d959d68-3c34-4272-ba36-d956b4eaca46', 'a9b1f8a9-7160-4510-8011-5f9dc8e009a2', 'Emol', 'www.emol.com'),
('9d959d68-3c34-4272-ba36-d956b4eaca46', '317b3fce-5279-4515-ba0b-c242cbcb3032', 'La Tercera', 'www.latercera.com'),
('db5051f2-877a-4e76-ad22-be4559142495', '1f373834-4b15-43b3-81d5-9dda2da9052f', 'BioBioChile', 'www.biobiochile.cl'),
('db5051f2-877a-4e76-ad22-be4559142495', 'c9ea81d4-26f9-4829-91e6-ac70c0b2fd16', 'CNN Chile', 'www.cnnchile.com'),
('b24e5e9b-cd57-481e-a803-8bfbc29011b0', '8ee3acbc-e59f-43db-a0d6-d9c5a85d8aab', 'Cooperativa', 'www.cooperativa.cl'),
('b24e5e9b-cd57-481e-a803-8bfbc29011b0', '6515df79-b8cf-41ce-a298-bab028d11b2f', 'El Mostrador', 'www.elmostrador.cl'),
('42c2f8ff-9eab-4610-a675-9c8d3a41b80b', '763e7451-224d-4c3c-be3f-97bb5f7da079', 'Snapchat', 'www.snapchat.com'),
('42c2f8ff-9eab-4610-a675-9c8d3a41b80b', 'd088e935-2715-4ab0-8826-440d996bb2ae', 'Instagram', 'www.instagram.com'),
('5ecb9959-c769-4d52-8c46-3cf37af7540f', '6360e8b2-170d-465b-ab5f-febf7a5c07ac', 'X', 'www.x.com'),
('5ecb9959-c769-4d52-8c46-3cf37af7540f', 'f9727510-032d-47df-ab07-72e166e1708f', 'LinkedIn', 'www.linkedin.com'),
('247ce509-cbbd-491d-9cea-23ec270c5d29', '7969aee0-bafe-478e-acc8-671afeda7162', 'Facebook', 'www.facebook.com'),
('247ce509-cbbd-491d-9cea-23ec270c5d29', '8a087304-41c0-4ac0-9777-befa7b5390d2', 'TikTok', 'www.tiktok.com'),
('43054844-91d7-465c-8c49-1030f802d6e4', 'dd4540c9-26ed-4248-a610-9981d88425b7', 'WhatsApp', 'www.whatsapp.com'),
('43054844-91d7-465c-8c49-1030f802d6e4', 'a21d5cc2-9507-4c7d-b214-15bb1549275a', 'WeChat', 'www.wechat.com'),
('2b39b7cc-da75-4ba3-9a30-4806ee4fe3d7', 'fe8c3d3b-b83d-4b11-aa73-05bf00382c8d', 'Messenger', 'www.messenger.com'),
('2b39b7cc-da75-4ba3-9a30-4806ee4fe3d7', 'ef72af49-23d8-47fa-96c7-1487d6af6ca4', 'Telegram', 'www.telegram.org'),
('37cfe0d9-f417-495c-97ca-07a49f58664a', '9bc4a627-a3c2-4024-b756-7f980a284e68', 'Signal', 'www.signal.org'),
('37cfe0d9-f417-495c-97ca-07a49f58664a', 'cd11c696-b231-46c3-8d30-fc99f015b12c', 'Discord', 'www.discord.com'),
('5edc9b42-54dc-4bfa-97c4-47f29629f692', '9385c3a3-f3aa-449b-9dfa-a86c0027de80', 'Discord', 'www.discord.com'),
('5edc9b42-54dc-4bfa-97c4-47f29629f692', '1797e3b9-6b8d-4eb7-a806-73441add7e2f', 'Tumblr', 'www.tumblr.com'),
('4dde8e3f-4951-4178-85d0-592b53765261', '08c221db-82bc-4480-9323-e141674bd19e', 'Reddit', 'www.reddit.com'),
('4dde8e3f-4951-4178-85d0-592b53765261', '7bb944a3-850c-4fe3-8a24-774fae621bc7', 'Pinterest', 'www.pinterest.com'),
('af62c50a-a567-4fab-8aff-d836f5bffe4a', '2bcef021-6076-4ccf-93ff-826def278fe9', 'Quora', 'www.quora.com'),
('af62c50a-a567-4fab-8aff-d836f5bffe4a', 'e85c1175-5b17-424f-b816-3237fd28c71f', 'Steam Community', 'www.steamcommunity.com'),
('aa46df80-cdba-48fa-8b94-952609407666', '5baeb942-80f5-46e3-b455-cd1b8fae0762', 'Universidad de Concepción', 'www.udec.cl'),
('aa46df80-cdba-48fa-8b94-952609407666', '0d14ce7b-0f6a-4eaa-a738-d0134b1efe78', 'UDP', 'www.udp.cl'),
('88b63277-a333-4d98-a705-a885833e2348', '19504472-6e92-4ddf-bb6e-b48518c1a832', 'USACH', 'www.usach.cl'),
('88b63277-a333-4d98-a705-a885833e2348', '1b98da8a-3fcb-46a7-aa51-79436ddd5fc6', 'UAI', 'www.uai.cl'),
('dfca33a8-5f9b-4f7a-8c0e-f9c058a4ec3d', '1c5be268-ba3d-43f5-83f0-72b926468e7f', 'Pontificia Universidad Católica', 'www.uc.cl'),
('dfca33a8-5f9b-4f7a-8c0e-f9c058a4ec3d', '67106386-e166-48ee-a2b8-ba320cacf740', 'Universidad de Chile', 'www.uchile.cl'),
('81fb6be9-b643-4919-b6fc-353a8c8adeae', 'e61d515d-011c-4fd0-9726-60419af7cc2e', 'INACAP', 'www.inacap.cl'),
('81fb6be9-b643-4919-b6fc-353a8c8adeae', '002182d4-e85a-4cdf-a8a0-a3be01b3cbc4', 'Santo Tomás', 'www.santotomas.cl'),
('228f5743-1460-4317-a67c-55db5150645f', 'b3e6eb5a-165a-4510-86cc-351089e88a96', 'ENAC', 'www.enac.cl'),
('228f5743-1460-4317-a67c-55db5150645f', '68cd9431-cfd0-441e-8f32-ac34aced4802', 'Duoc UC', 'www.duoc.cl'),
('bc2b2cb1-65bc-4011-a020-a6a3dd303050', 'deb52b0d-9f7c-4842-8188-0dc0085615c7', 'AIEP', 'www.aiep.cl'),
('bc2b2cb1-65bc-4011-a020-a6a3dd303050', '6c31205b-9ce4-4c97-8cab-18209ec8f76c', 'IPChile', 'www.ipchile.cl'),
('b9112d2b-236a-4fbb-8ee2-06e6377c0126', '94b68eaa-418b-4fd4-88fd-af346b3ce828', 'Puntaje Nacional', 'www.puntajenacional.cl'),
('b9112d2b-236a-4fbb-8ee2-06e6377c0126', '617f0f08-53a9-4ee8-8e96-ac1502c4879b', 'M30M', 'www.m30m.cl'),
('3872dce6-1a9b-44a1-822f-ad890e1aa90f', 'b1d0a1d9-d2ad-40eb-9141-be41aaa81882', 'Pedro de Valdivia', 'www.preupdv.cl'),
('3872dce6-1a9b-44a1-822f-ad890e1aa90f', 'f864bdf9-37c5-4c90-b789-9990e3479e9c', 'Cpech', 'www.cpech.cl'),
('24f17538-7f6f-46dc-a4dc-c91d0b979063', '0f462959-f21c-496a-9b2b-69263d124939', 'Preu UC', 'www.preuniversitariouc.cl'),
('24f17538-7f6f-46dc-a4dc-c91d0b979063', '4b369c2b-90fb-4a20-897a-9b4ce6cdc34d', 'Filadd', 'www.filadd.com'),
('c58e3448-633a-40bb-9421-aff31e5c4b86', '0c9ecc6a-2f6f-4337-bcd2-c3ae50f21466', 'Unión Española', 'www.unionespanola.cl'),
('c58e3448-633a-40bb-9421-aff31e5c4b86', 'c6078700-b307-4298-b2c8-5f9e7b7e842a', 'Cobreloa', 'www.cobreloa.cl'),
('02225caf-98a6-4ce1-880d-77b37d10b7d6', 'b3f8b4dc-719a-40d3-9ab5-9691ae5a3649', 'Universidad de Chile', 'www.udechile.cl'),
('02225caf-98a6-4ce1-880d-77b37d10b7d6', 'a8443a84-6ab4-411f-ad43-d3b11ace217d', 'Santiago Wanderers', 'www.wanderers.cl'),
('7f5082e4-df51-4385-abb5-5cc1b5ef11f9', 'de3e511d-a74c-4af0-a72b-c121ab503ed4', 'Colo-Colo', 'www.colocolo.cl'),
('7f5082e4-df51-4385-abb5-5cc1b5ef11f9', '85edc30e-dd3d-4203-9676-756005721bd3', 'Universidad Católica', 'www.cruzados.cl'),
('13f1a203-0f7e-497e-a567-b4ceac4ff11b', '54f3c8ba-ac51-4d87-8a3f-bc5ad377c748', 'Concha y Toro', 'www.conchaytoro.com'),
('13f1a203-0f7e-497e-a567-b4ceac4ff11b', '48238b26-5d40-4ff8-8434-1a02fc833f78', 'Miguel Torres', 'www.torres.cl'),
('08be5f54-44e3-4130-b81c-ec42cdb05a92', 'bb01ff55-cb0d-459e-93b0-4b7299b8afff', 'Montes', 'www.monteswines.com'),
('08be5f54-44e3-4130-b81c-ec42cdb05a92', 'fde929be-5f64-4d10-9306-e3846bad06a9', 'Undurraga', 'www.undurraga.com'),
('ab55a4c5-bb51-4bbe-8470-33672a21c1de', '28fcc459-5711-4f8b-a8b1-0adf25758445', 'San Pedro', 'www.sanpedro.cl'),
('ab55a4c5-bb51-4bbe-8470-33672a21c1de', 'c56ac794-ee77-4f8b-a208-83df35640dd7', 'Santa Rita', 'www.santarita.com'),
('382e9ab0-9567-446b-8314-1fbb581bfdba', '5460ff82-c999-4512-ad7f-12ad17286933', 'El Mundo del Vino', 'www.elmundodelvino.cl'),
('382e9ab0-9567-446b-8314-1fbb581bfdba', '09e4fd67-48cc-4558-9f7e-c39f528f9073', 'Tienda Concha y Toro', 'www.conchaytoro.com'),
('f3491e0e-7c3d-4538-8b3b-8c0928e5f169', '1d5b7dc9-9697-4a5f-a0b2-1ba205fff867', 'La Cav', 'www.lacav.cl'),
('f3491e0e-7c3d-4538-8b3b-8c0928e5f169', 'd80e6f0f-3038-4d18-ae51-b53b93ba2823', 'La Vinoteca', 'www.vinoteca.cl'),
('33a5ad03-3da5-48c0-860d-61286b0ffdd2', '26f5c0d4-aa3e-462a-b3bd-3e07e188f339', 'Descorcha', 'www.descorcha.com'),
('33a5ad03-3da5-48c0-860d-61286b0ffdd2', '0e584ab7-d766-44e6-9b23-312444b14d16', 'Tienda Santa Rita', 'www.santarita.com'),
('f9fde89c-fd79-479b-b0ff-af0a0fbcc1f2', '988787c8-3b99-4ad0-8474-078db15c3ff9', 'Acana', 'www.acana.com'),
('f9fde89c-fd79-479b-b0ff-af0a0fbcc1f2', '12352393-c6a4-4f13-99c1-f40d7d0e95f3', 'Pedigree', 'www.pedigree.com'),
('09e0db44-324b-4498-b885-5d3783c00f14', 'bc0f0bfb-cf80-46b3-817c-326486e40ffe', 'Pro Plan', 'www.purina.cl'),
('09e0db44-324b-4498-b885-5d3783c00f14', 'a2e8b7b2-647c-493f-a879-48f30cbad04e', 'Bravery', 'www.braverypetfood.com'),
('7de403bf-b899-4ce2-96cc-8a77542ab3f3', '4f71fcb0-99df-49a5-b66d-074050da95f5', 'Royal Canin', 'www.royalcanin.com'),
('7de403bf-b899-4ce2-96cc-8a77542ab3f3', '7533fc82-e6ef-40a3-b764-0df63908f152', 'Dog Chow', 'www.purina.cl'),
('47a31228-cbd3-4ea5-9bda-4f380fd01e58', '522799e7-5d32-4259-830d-4c253417a892', 'Whiskas', 'www.whiskas.com'),
('47a31228-cbd3-4ea5-9bda-4f380fd01e58', '697eac14-14bb-4725-8a26-bdaa3fc1afdd', 'Pro Plan', 'www.purina.cl'),
('14e24a73-3c58-4f93-8c1e-e7faf156ce07', '7722b5c5-7c25-41a3-beab-9240a16be8c1', 'Cat Chow', 'www.purina.cl'),
('14e24a73-3c58-4f93-8c1e-e7faf156ce07', '010f51f1-aeb1-4459-ab71-8d5c8cdcac7c', 'Bravery', 'www.braverypetfood.com'),
('c74c4be0-283d-425f-aa58-4dc9aec93891', 'b1f7d249-465c-4cd5-9118-585377067764', 'Acana', 'www.acana.com'),
('c74c4be0-283d-425f-aa58-4dc9aec93891', 'ad11ac4c-0833-438b-a35c-a6d47e878a96', 'Royal Canin', 'www.royalcanin.com'),
('0f46fd72-b892-4638-b0eb-9dbbff9210ac', 'ee4a8899-c8c6-44c2-be86-2728e8681ba6', 'Club de Perros y Gatos', 'www.clubdeperrosygatos.cl'),
('0f46fd72-b892-4638-b0eb-9dbbff9210ac', 'c1911848-601f-480b-8a55-73e9ca7e5c65', 'SuperZoo', 'www.superzoo.cl'),
('462d6052-803b-4d01-b835-6b2d1bb607be', 'a58e2c1f-529b-4fb1-9a65-8142d93c48f4', 'Maspet', 'www.maspet.cl'),
('462d6052-803b-4d01-b835-6b2d1bb607be', '22a16b2a-31b3-4c27-b9cb-87141c773f89', 'Pet Happy', 'www.pethappy.cl'),
('3b012855-7372-4127-8ab6-5d91459eab73', 'a7114d7b-3a48-4316-bbab-75f76546b552', 'Petslandia', 'www.petslandia.cl'),
('3b012855-7372-4127-8ab6-5d91459eab73', 'e7a28daa-90a5-4850-86e2-b37eff8882ab', 'Pet BJ', 'www.petbj.cl'),
('5dd0a4e1-50d2-4595-bc03-04935a1b234c', '346806f9-5a41-4608-be9b-be396f3522f1', 'VetPoint', 'www.vetpoint.cl'),
('5dd0a4e1-50d2-4595-bc03-04935a1b234c', '3dfb93c0-7391-4e87-b9de-acb56cbf7ffd', 'Vet24', 'www.vet24.cl'),
('16c4bb26-d21d-4663-b87f-f3de4e00cff4', '50038834-dfb2-4560-b99b-405603837e38', 'Hospital Clínico Veterinario U. de Chile', 'www.veterinaria.uchile.cl'),
('16c4bb26-d21d-4663-b87f-f3de4e00cff4', '8b0515e1-03e8-48b3-8613-cf48efd7d866', 'Vets', 'www.vets.cl'),
('87d73873-59b4-46dc-b7cf-b84d16c7d159', '5799a121-ab57-43bc-8301-88f38df94ef8', 'Clínica Veterinaria Alemana', 'www.cv-alemana.cl'),
('87d73873-59b4-46dc-b7cf-b84d16c7d159', 'fdbe7201-3c3c-4412-94f5-fe9b17e1f52d', 'PetSalud', 'www.petsalud.cl'),
('e028b2b1-c113-4314-8d02-b91de4c634fa', 'c0d8601f-5fae-4543-8c2f-f62c41e5d4f5', 'Tío Nacho', 'www.tionacho.com'),
('e028b2b1-c113-4314-8d02-b91de4c634fa', '64121e57-03bf-442b-a82d-d91d5b4397fd', 'Head & Shoulders', 'www.headandshoulders.cl'),
('53fb4e33-33a5-4873-919d-9c07797580d0', '3135188c-7b1f-418d-a7f2-97f8ceab3e64', 'Sedal', 'www.sedal.cl'),
('53fb4e33-33a5-4873-919d-9c07797580d0', '54d9d1c5-2923-491e-8768-ac21428d6f73', 'Pantene', 'www.pantene.cl'),
('c67ee130-b10b-43ad-a829-d9c2f0dd6424', 'ea7345f4-03bf-412f-b504-af92c2a9479f', 'Elvive', 'www.loreal-paris.cl'),
('c67ee130-b10b-43ad-a829-d9c2f0dd6424', '9d295c6e-92a1-46df-b9a5-d00537d65fa0', 'Dove', 'www.dove.com'),
('6d6f2355-fc96-420f-a8a5-1d13a1d1b18c', '81834b86-784a-42e5-abc1-4867c31083fc', 'Nivea', 'www.nivea.cl'),
('6d6f2355-fc96-420f-a8a5-1d13a1d1b18c', '58f1c1de-56a9-4c93-ab75-3315108cc0da', 'Rexona', 'www.rexona.com'),
('b3baa1af-7d31-4476-be17-1fff087fc57c', '7fb04f99-3721-4724-a280-92e0d957b36c', 'Lady Speed Stick', 'www.ladyspeedstick.com'),
('b3baa1af-7d31-4476-be17-1fff087fc57c', '05846732-9afb-4278-8a18-19b36d2f5ba0', 'Axe', 'www.axe.com'),
('b5e2a894-fc5e-49de-9b24-e251ea331a6a', 'c2d088e6-36e8-4532-abd1-1dd1febd9442', 'Old Spice', 'www.oldspice.com'),
('b5e2a894-fc5e-49de-9b24-e251ea331a6a', '9ee64027-d331-42b5-883d-df2f8b84e5ac', 'Dove', 'www.dove.com'),
('19b37a07-76cc-49d9-897d-af0d91136a03', 'fa761548-00c5-481d-b1db-48d17889eb95', 'Sensodyne', 'www.sensodyne.cl'),
('19b37a07-76cc-49d9-897d-af0d91136a03', 'c5c8735b-83e5-4241-89aa-44239a6422f4', 'Colgate', 'www.colgate.cl'),
('238a4806-d1d4-4256-994a-4013cd798b24', 'e35f8c68-4367-45ae-8512-9499cff0f4d5', 'Closeup', 'www.closeup.com'),
('238a4806-d1d4-4256-994a-4013cd798b24', '1b73cea2-b225-4c21-9068-d7f556d3a425', 'Oral-B', 'www.oralb.cl'),
('f158ff0c-44a6-497f-9f56-6e392ba18025', 'c6c3a2c8-91eb-4f31-9dae-0423c52f2dc1', 'Pepsodent', 'www.pepsodent.com'),
('f158ff0c-44a6-497f-9f56-6e392ba18025', '42af9d4a-0993-4acb-a687-cfc71c85e722', 'Aquafresh', 'www.aquafresh.com'),
('84b69edc-517e-46f9-97c4-5713a6f1aae1', '3ab9ea52-881d-457f-82b9-a19d24efda3d', 'Eucerin Sun', 'www.eucerin.cl'),
('84b69edc-517e-46f9-97c4-5713a6f1aae1', '6ab492ba-254e-4a17-940d-76e5faf8fa5c', 'La Roche-Posay Anthelios', 'www.laroche-posay.cl'),
('1d257253-41d7-4a6c-a70a-64645aad37d4', 'e4b9ae16-3441-42d9-ade7-fc6ca8b11443', 'Vichy Capital Soleil', 'www.vichy.cl'),
('1d257253-41d7-4a6c-a70a-64645aad37d4', '7c28e951-3795-4865-888e-7e1d99a55a0e', 'ISDIN', 'www.isdin.com'),
('c4667c63-f0e5-4638-b9dd-1a7d588ba9a1', '2df50743-6428-4d8d-8560-806f1974dc95', 'Raytan', 'www.raytan.cl'),
('c4667c63-f0e5-4638-b9dd-1a7d588ba9a1', '517ab6f5-5387-46db-b8e1-40306a7c9d85', 'Hawaiian Tropic', 'www.hawaiiantropic.com'),
('24356a14-396e-438d-8a74-6a8f0caa062c', '7d9efcd5-9634-4f44-af5e-efeb3011b02c', 'MAC', 'www.maccosmetics.cl'),
('24356a14-396e-438d-8a74-6a8f0caa062c', 'ce9ba58e-da9c-45c3-b88e-e9257dafc2fc', 'Petrizzio', 'www.petrizzio.cl'),
('deecbe14-512a-4825-9fe6-fced8a318de6', '5bb2e014-765f-47bd-84a6-8b45f2cae26d', 'NYX', 'www.nyxcosmetics.com'),
('deecbe14-512a-4825-9fe6-fced8a318de6', '9b65e395-cc84-4f38-99c5-1c5ec1609c1e', 'Natura', 'www.natura.cl'),
('c73d6416-fbf5-49bc-818c-80f7783dbc34', 'b4588386-6e22-450b-9888-23b8589d865f', 'Maybelline', 'www.maybelline.cl'),
('c73d6416-fbf5-49bc-818c-80f7783dbc34', 'd7b29387-489a-407c-b044-9351ac82a265', 'L''Oréal Paris', 'www.loreal-paris.cl'),
('3f491846-0804-4d76-96e0-308731ced310', 'd8be92ce-b3b8-4641-bc00-17c8f1a63cd8', 'Cetaphil', 'www.cetaphil.cl'),
('3f491846-0804-4d76-96e0-308731ced310', '9d5ea445-a919-492f-870f-ae81fb5e02ae', 'CeraVe', 'www.cerave.cl'),
('db756f1f-96ba-4d61-93e0-34f9cf119ce8', '3e3cd239-23c0-472e-94ca-dc662f93e736', 'Bioderma', 'www.bioderma.cl'),
('db756f1f-96ba-4d61-93e0-34f9cf119ce8', '45cd3a90-897e-4e4d-91ca-c415f6501f16', 'Eucerin', 'www.eucerin.cl'),
('dba6ec47-ed81-4e6c-be16-be4c8b28018b', 'bb1baf9b-98c4-4e6a-b994-57be98e9aa26', 'La Roche-Posay', 'www.laroche-posay.cl'),
('dba6ec47-ed81-4e6c-be16-be4c8b28018b', 'fc9b6773-dfae-4583-9213-2f6b4cf1d378', 'Vichy', 'www.vichy.cl'),
('05720bb4-7910-4bb8-bef7-7416555d84ad', '567b7aec-3662-4099-8459-88a349e48614', 'Dior', 'www.dior.com'),
('05720bb4-7910-4bb8-bef7-7416555d84ad', '95e45012-a11d-4fb3-bf1d-d94ff1da5f1a', 'Hugo Boss', 'www.hugoboss.com'),
('16e6b3fd-923f-493e-8b11-4f26900e8b7c', '0f29c7fc-bfcf-45fb-b4ef-238c520804f0', 'Carolina Herrera', 'www.carolinaherrera.com'),
('16e6b3fd-923f-493e-8b11-4f26900e8b7c', 'cc8090aa-f0a1-4d0d-a3d7-f615cbe26188', 'Rabanne', 'www.rabanne.com'),
('f6380415-3aaf-4c96-9719-8e2f19388c93', '10f01255-b92d-44f3-b401-c7bd09436220', 'Chanel', 'www.chanel.com'),
('f6380415-3aaf-4c96-9719-8e2f19388c93', 'da19077a-2e17-4189-861f-eca87071193c', 'Calvin Klein', 'www.calvinklein.com'),
('f3992b16-8b2a-47f3-9863-8d9ccae509fa', '7c39c0c3-83f0-40f5-94b6-bb0d49077844', 'LG', 'www.lg.com'),
('f3992b16-8b2a-47f3-9863-8d9ccae509fa', '232bbe27-668c-406f-917a-713ddec90174', 'Electrolux', 'www.electrolux.cl'),
('7200a79d-2b1e-471b-a6c2-ba5424ca0a3b', 'e02002c4-1bc1-44a0-9f9d-555652cdbbed', 'Midea', 'www.midea.com'),
('7200a79d-2b1e-471b-a6c2-ba5424ca0a3b', '1d9deb5b-94cc-4597-9b65-6c1b52654026', 'Bosch', 'www.bosch.cl'),
('47972f4f-4f84-4b4b-8bfe-d556199ae8a7', '3211e5b0-97e5-46b2-b6f8-84fb033ca73e', 'Whirlpool', 'www.whirlpool.com'),
('47972f4f-4f84-4b4b-8bfe-d556199ae8a7', 'a89519fa-2df6-4430-b665-b34b2ab4a591', 'Samsung', 'www.samsung.com'),
('d944092a-bfa4-4885-9472-69ba4887a761', '1f1a2fdc-b1b5-430c-b873-9786b6bb1777', 'Bosch', 'www.bosch.cl'),
('d944092a-bfa4-4885-9472-69ba4887a761', 'd5b1b0aa-139a-488f-a8a3-7cfdfd6af9a4', 'Samsung', 'www.samsung.com'),
('9e8474a3-a8f5-4e63-ae55-8eba575b58f6', 'db5a70bf-030c-4ae3-b254-08b79851c460', 'Midea', 'www.midea.com'),
('9e8474a3-a8f5-4e63-ae55-8eba575b58f6', 'f3edbeca-8cfa-441e-97c6-66b007a782be', 'LG', 'www.lg.com'),
('fbc3db72-916a-4780-b83c-39e703a1db4f', '7d807a2c-bb03-4d2a-b016-6f177303bab8', 'Whirlpool', 'www.whirlpool.com'),
('fbc3db72-916a-4780-b83c-39e703a1db4f', '09b590e4-f580-49f3-a9b1-8ae54c60ef2e', 'Fensa', 'www.fensa.cl'),
('cddcc1a4-a823-4e47-b15c-912ecb71ffec', '9d5174f0-3f9e-4b0f-a10a-57db2e1fc64f', 'Thomas', 'www.thomas.cl'),
('cddcc1a4-a823-4e47-b15c-912ecb71ffec', '1184995e-5599-41f8-a7f5-32ec9b7e040d', 'Ursus Trotter', 'www.ursustrotter.cl'),
('4d51d7b9-5aef-475e-9bea-4abe8c8fc90e', 'b3102fe6-7751-44f4-b554-3b4e110fbac3', 'Xiaomi', 'www.mi.com'),
('4d51d7b9-5aef-475e-9bea-4abe8c8fc90e', 'dabd5dbd-323d-4148-a50a-e5660695b006', 'Electrolux', 'www.electrolux.cl'),
('02aa1290-b820-4894-874b-f99398fa44a4', '1bf34885-de38-47ae-8ef4-f9871e359e53', 'Philips', 'www.philips.cl'),
('02aa1290-b820-4894-874b-f99398fa44a4', 'c9d3598d-f377-4072-a43b-6ea2db797f81', 'Dyson', 'www.dyson.cl'),
('b6b19fe2-6648-4f89-8999-f7cd1db532cf', '0c3589c3-4266-4266-a125-b93170d156d2', 'CIC', 'www.cic.cl'),
('b6b19fe2-6648-4f89-8999-f7cd1db532cf', 'd5dee09b-7d98-41af-ac41-e48465ad52e2', 'Mantahue', 'www.mantahue.cl'),
('819c0b0e-402d-42f4-9ba4-8695d7c312d1', '957378ec-2571-4fb0-8dbf-0a17471875d1', 'Rosen', 'www.rosen.cl'),
('819c0b0e-402d-42f4-9ba4-8695d7c312d1', 'ae2fee37-5a94-4fd8-bfc6-f06eef6ef3cd', 'Emma', 'www.emma-sleep.cl'),
('bd556404-f25b-4dd9-8253-56dbc4bdf77c', '17817412-cb0b-48cb-aefd-b2e90bc52ffd', 'Flex', 'www.flex.cl'),
('bd556404-f25b-4dd9-8253-56dbc4bdf77c', '02ef920c-c8d7-4a33-9405-0792e5ceb25c', 'Drimkip', 'www.drimkip.cl'),
('cb699a10-979d-4b03-8d80-c1b349a64a41', 'e370722b-e7ee-482c-9435-75dfd956f76a', 'Motorola', 'www.motorola.com'),
('cb699a10-979d-4b03-8d80-c1b349a64a41', 'a95dbc14-0056-4eec-8bea-79ba37136905', 'Realme', 'www.realme.com'),
('1db12212-4527-4c59-8f04-b5e36b35c30a', 'f4c40a89-858b-4f8e-a1be-16a65abfe3a6', 'Xiaomi', 'www.mi.com'),
('1db12212-4527-4c59-8f04-b5e36b35c30a', '5aaed809-0ba4-4456-a7eb-4d475f9b16e9', 'Samsung Galaxy', 'www.samsung.com'),
('f1760584-69b9-4c9c-9399-2afdf9cbe04c', 'aba994f9-a32e-4176-a883-7a8721117f7a', 'Huawei', 'www.huawei.com'),
('f1760584-69b9-4c9c-9399-2afdf9cbe04c', '0327ef73-0f94-4b7e-b159-64994500fe95', 'Apple iPhone', 'www.apple.com'),
('1a2142ae-ced7-4389-a8b8-aa307ac148e5', '212c85ae-91e4-4a86-a1c0-d0620ff1fae9', 'Honor', 'www.honor.com'),
('1a2142ae-ced7-4389-a8b8-aa307ac148e5', '1db538e4-c02c-48f5-9548-5fab3d9443eb', 'Oppo', 'www.oppo.com'),
('bd871221-b3ee-488f-8de5-dc799231dbbf', 'f27de973-492a-4fe6-aa4f-8fb676a8f901', 'Acer', 'www.acer.com'),
('bd871221-b3ee-488f-8de5-dc799231dbbf', '3650f6be-973b-4fac-9bb3-4cbc87500ddf', 'Apple MacBook', 'www.apple.com'),
('f2da7a22-f92e-4918-a5a0-4756280d7b71', '028c7743-97cf-4fe2-ae5c-bc5fa9b72153', 'HP', 'www.hp.com'),
('f2da7a22-f92e-4918-a5a0-4756280d7b71', '998bd7ce-0c41-4268-b1a3-5ab23faf2c48', 'ASUS', 'www.asus.com'),
('8030ef94-d2f2-44ab-bf58-fc9d75463f47', 'bca1a8d8-06ec-4674-8ba5-a6ef3ab410f6', 'Lenovo', 'www.lenovo.com'),
('8030ef94-d2f2-44ab-bf58-fc9d75463f47', '8bbde015-a8f0-4553-895b-4f3ce0a46881', 'MSI', 'www.msi.com'),
('1ef1a3c5-006d-4443-8345-535462428da6', '4774e7c7-222a-457b-8050-5b99ebad5361', 'Samsung Galaxy Buds', 'www.samsung.com'),
('1ef1a3c5-006d-4443-8345-535462428da6', 'b004aaea-4e10-466f-8687-bc9775eeb32b', 'Sony', 'www.sony.com'),
('ec05a162-1d6e-4c60-b614-d099c5881b80', 'bb7d4bc7-8f4a-4038-a3d7-e831391c7244', 'Apple AirPods', 'www.apple.com'),
('ec05a162-1d6e-4c60-b614-d099c5881b80', 'c5274ae9-ff50-406f-a326-0162667a9b0f', 'Bose', 'www.bose.com'),
('03c22dd1-d5a3-4c89-acd4-fb18f4c35b59', '539c3718-c06a-4e08-b70f-e927849528b0', 'Skullcandy', 'www.skullcandy.com'),
('03c22dd1-d5a3-4c89-acd4-fb18f4c35b59', '1b6d6bfb-f8b1-4b91-bde4-a7c4828b7f20', 'JBL', 'www.jbl.cl'),
('f03f0352-bea9-4c87-9f7f-da9a2c4f857d', '4d742590-4980-44f1-a253-ce911648bae7', 'Huawei Watch', 'www.huawei.com'),
('f03f0352-bea9-4c87-9f7f-da9a2c4f857d', '671ee384-e02e-4e38-ab7d-38ff4c5742d6', 'Garmin', 'www.garmin.com'),
('3e0b39b8-48ac-4b07-9f33-a06006333896', 'd86ef69d-2022-43fd-88cc-c090070848e8', 'Apple Watch', 'www.apple.com'),
('3e0b39b8-48ac-4b07-9f33-a06006333896', 'c2b61f05-2b97-457f-8382-8b8e29d79bde', 'Amazfit', 'www.amazfit.com'),
('bb3aceeb-c6d4-4243-b911-c2664df649a2', '5bc4b453-d46b-47ca-b8cb-daf76fd284c2', 'Xiaomi Watch', 'www.mi.com'),
('bb3aceeb-c6d4-4243-b911-c2664df649a2', '9625291f-6c4c-4ac7-9ee9-7c0a9d40b7df', 'Samsung Galaxy Watch', 'www.samsung.com'),
('74374489-859f-4f87-b785-74f67b1bb818', '3f6925b5-03a1-4478-8f16-625ddd6431fc', 'LG', 'www.lg.com'),
('74374489-859f-4f87-b785-74f67b1bb818', 'd43c2c68-f746-41ae-b777-0f3fe192dcc1', 'Philips', 'www.philips.com'),
('409300f5-5722-44f0-997e-82a4a28a7b27', '39bd4367-a2ab-47ad-915c-591b74637fc3', 'Samsung', 'www.samsung.com'),
('409300f5-5722-44f0-997e-82a4a28a7b27', '49905596-77b5-4b33-aac6-bced6274e71d', 'Hisense', 'www.hisense.com'),
('7ba77909-84f2-4617-ad8c-ea322b697623', 'daaa40aa-2268-4d98-a75e-e2ea3dd864c6', 'TCL', 'www.tcl.com'),
('7ba77909-84f2-4617-ad8c-ea322b697623', '37fd2746-56d9-4a0d-8377-d04d8b5d8408', 'Sony', 'www.sony.com'),
('8da5d889-14b4-4caf-8e45-9f7016423cf3', '20eaa938-d255-473c-860b-1ef25fbf549e', 'Samsung Galaxy Tab', 'www.samsung.com'),
('8da5d889-14b4-4caf-8e45-9f7016423cf3', '4ec3ebb8-7719-4b96-a2ae-ba561a981db8', 'Apple iPad', 'www.apple.com'),
('57cfd911-b109-4404-a203-db904068c764', '91d45cb1-19af-435e-bd89-be03c62960ff', 'Huawei MatePad', 'www.huawei.com'),
('57cfd911-b109-4404-a203-db904068c764', 'ef8fd70d-b508-4d1a-afc4-d7a4fa8cf308', 'Lenovo Tab', 'www.lenovo.com'),
('07b280b1-f4db-4ee3-90a6-a3776e395b27', 'c6a1fb2a-07d6-443c-9c8e-9476d00fb3f5', 'Xiaomi Pad', 'www.mi.com'),
('07b280b1-f4db-4ee3-90a6-a3776e395b27', '4404c608-f88f-414c-950c-dd4d3b5f4d4c', 'Honor Pad', 'www.honor.com'),
('a9011c09-a56f-49c9-a850-b3aa9657785d', '8c0d8088-8528-49ba-a153-424f398a6c3a', 'Lenovo Legion Go', 'www.lenovo.com'),
('a9011c09-a56f-49c9-a850-b3aa9657785d', '0b0319f3-855a-4415-8694-493eeac1aaa8', 'Steam Deck', 'www.steampowered.com'),
('4116e72b-bca1-4076-ab18-2451a7200419', 'a90a912d-86a2-4452-b576-9fb63a1c2097', 'Nintendo Switch', 'www.nintendo.com'),
('4116e72b-bca1-4076-ab18-2451a7200419', '79d1630f-7402-48e4-9126-622c3bca7af7', 'Xbox', 'www.xbox.com'),
('a42f1f83-a982-48a2-8858-539d3b22e547', '19cdb202-0fba-4c3b-84eb-ca13726d16d9', 'PlayStation', 'www.playstation.com'),
('a42f1f83-a982-48a2-8858-539d3b22e547', '75284896-cdbf-4323-b811-cc7e4328e2b5', 'ASUS ROG Ally', 'www.asus.com'),
('333f9af0-ff29-4392-8449-cd92a822acf2', 'f4a0e1b5-f7ff-4409-b915-a696696672f0', 'Logitech G', 'www.logitechg.com'),
('333f9af0-ff29-4392-8449-cd92a822acf2', '164e08fc-5705-4763-8124-581fbf041c5a', 'Corsair', 'www.corsair.com'),
('5f22ff48-c313-46a6-97ed-2c8eedb15b91', 'c50c2b13-9bad-4fc7-adb3-3bf1ef3113f1', 'HyperX', 'www.hyperx.com'),
('5f22ff48-c313-46a6-97ed-2c8eedb15b91', '636b9ffd-23e0-42f1-b9bf-debe4d20507c', 'Redragon', 'www.redragon.com'),
('5e2100ad-d7cb-45d0-bad4-601bc06bb9c5', '2b7bb1f3-f63a-4268-96ab-7a42dc53c311', 'SteelSeries', 'www.steelseries.com'),
('5e2100ad-d7cb-45d0-bad4-601bc06bb9c5', '044e944b-7588-4266-8672-53af84916a74', 'Razer', 'www.razer.com'),
('31b5720e-dac7-42ac-a6e5-36945a7da26d', '39134317-6f6b-4306-9589-fe537d43a75a', 'ASUS ROG', 'www.asus.com'),
('31b5720e-dac7-42ac-a6e5-36945a7da26d', '44ab2a01-aded-4014-b72d-1f690021cddc', 'LG UltraGear', 'www.lg.com'),
('94ec1491-bd2e-42d7-908a-ab257e0d58e9', 'e4b9412c-f91d-49d1-be4c-665ce4b0b2d6', 'MSI', 'www.msi.com'),
('94ec1491-bd2e-42d7-908a-ab257e0d58e9', '6831a98a-80fc-41da-959b-59150ae5017f', 'Samsung Odyssey', 'www.samsung.com'),
('23233050-0375-449c-9b47-441773de67b4', 'bf0e8d28-70fe-495e-a1ed-90d62b1a2fbb', 'Acer Predator', 'www.acer.com'),
('23233050-0375-449c-9b47-441773de67b4', '18af38b8-2af7-453d-a92a-71c1b8060802', 'AOC', 'www.aoc.com'),
('d53f1f4b-5601-4a9f-979b-7083ac2aa7b9', '0dac85af-5a8e-4acb-93ac-16f187176016', 'Huggies', 'www.huggies.cl'),
('d53f1f4b-5601-4a9f-979b-7083ac2aa7b9', 'f9f09954-498b-4eb1-ae37-f97449e1dc08', 'Pampers', 'www.pampers.cl'),
('cdbc1e1a-8976-4166-98c2-1f21d91a956d', '88ea3c82-c873-48e5-9383-a6af133df66b', 'Pampers Premium Care', 'www.pampers.cl'),
('cdbc1e1a-8976-4166-98c2-1f21d91a956d', 'bf8584dd-4c55-4405-8b66-9424d8d850a8', 'Babysec', 'www.babysec.cl'),
('bd506d39-a470-4661-86f4-487346fceb1b', '178c57cb-1809-42e0-9777-f705a6c1f54a', 'BBTips', 'www.bbtips.cl'),
('bd506d39-a470-4661-86f4-487346fceb1b', '13e189cc-8015-42f4-ae85-7a93a05f0bc1', 'Huggies Natural Care', 'www.huggies.cl'),
('89b27edc-baab-4cfe-9a1d-ac5e57eec194', '321d5407-f397-4427-9029-c2ac73a932da', 'Nidal', 'www.nestle.cl'),
('89b27edc-baab-4cfe-9a1d-ac5e57eec194', 'aa59eee7-2361-4eb3-b595-8d5c05fbc01e', 'Similac', 'www.similac.com'),
('7ee4bb34-d845-4597-bce5-df1ea1643478', '3aec06f2-56cb-48b4-a10c-848e5b9cbc35', 'Pediasure', 'www.pediasure.com'),
('7ee4bb34-d845-4597-bce5-df1ea1643478', '87fcb501-b88e-4dd7-b513-77cdc56e5b80', 'NAN', 'www.nestle.cl'),
('e764f1a9-d8a0-4203-abf9-1a68aae492ac', 'ae64612c-cafd-4bf9-b6c7-8f47665a862a', 'S-26', 'www.wyethnutrition.com'),
('e764f1a9-d8a0-4203-abf9-1a68aae492ac', 'ddb8fee9-225f-40ce-a2e0-914f32ffc11c', 'Enfamil', 'www.enfamil.cl'),
('96ba0b1f-fa7b-417b-98ec-208f0e99e66f', 'df6975ef-0bac-4fc5-b80f-198bf1c6cd3c', 'WaterWipes', 'www.waterwipes.com'),
('96ba0b1f-fa7b-417b-98ec-208f0e99e66f', '4fb7aa7c-91e1-4bc6-8700-2ba1e23efa35', 'Pampers', 'www.pampers.cl'),
('fb8df854-1f4f-4f1d-8eb0-018c9eed1d89', '0fc8a9f8-b0a8-4663-8a5d-1ea2f3c1677e', 'Bebesit', 'www.bebesit.cl'),
('fb8df854-1f4f-4f1d-8eb0-018c9eed1d89', '3fdd06b1-8b1d-4274-b86c-ded4dcf14d01', 'Babysec', 'www.babysec.cl'),
('a3f4c609-4a3a-4e23-b581-5374ad8138b3', 'cd9e3e67-e32c-4280-8dbb-a36cadf7034e', 'BBTips', 'www.bbtips.cl'),
('a3f4c609-4a3a-4e23-b581-5374ad8138b3', '8af20120-890c-483e-a890-6c2c2c354d4c', 'Huggies', 'www.huggies.cl'),
('d4bae461-e839-4132-acc0-e6ab6c27c554', '4e7dd88d-653e-4c94-be2e-5145f8aee596', 'Bebesit', 'www.bebesit.cl'),
('d4bae461-e839-4132-acc0-e6ab6c27c554', 'b926258c-c775-46e7-bf9d-50fc924c149c', 'Chicco', 'www.chicco.cl'),
('941725f1-8c7d-4690-85fa-bd8d0730e069', '177aaa45-d831-4d5b-a9c6-752320f0f706', 'Maxi-Cosi', 'www.maxi-cosi.com'),
('941725f1-8c7d-4690-85fa-bd8d0730e069', '0dd07991-c3d9-4246-9a2b-d1aef140dbf0', 'Infanti', 'www.infanti.cl'),
('2d44a5d3-4f08-4bbb-a54c-c11f30f60c45', '8dfa8baa-991f-46e6-8c46-d2744b9fe919', 'Graco', 'www.gracobaby.com'),
('2d44a5d3-4f08-4bbb-a54c-c11f30f60c45', '648bc54f-1b75-426d-8641-773802b7c7e5', 'Joie', 'www.joiebaby.com');



-- Source: 20260309160000_seed_generic_depths_catalog.sql
BEGIN;

DO $$
DECLARE
  v_ent RECORD;
BEGIN
  -- Iterar sobre todas las entidades que no tienen suficientes depth definitions (como las recién insertadas del nuevo catálogo)
  FOR v_ent IN 
    SELECT e.id, e.name, e.category, e.slug 
    FROM public.entities e
    WHERE (SELECT count(*) FROM public.depth_definitions dd WHERE dd.entity_id = e.id) < 10
  LOOP
    
    -- Pregunta 1: Nota
    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position)
    VALUES (v_ent.id, v_ent.category, 'nota_general', '¿Qué nota general le das a ' || v_ent.name || ' del 1 al 10?', 'scale', 1)
    ON CONFLICT (entity_id, question_key) DO NOTHING;

    -- Pregunta 2: Calidad
    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, v_ent.category, 'calidad', '¿Cómo calificas la calidad general de ' || v_ent.name || '?', 'scale', 2, '[]')
    ON CONFLICT (entity_id, question_key) DO NOTHING;

    -- Pregunta 3: Recomendacion
    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, v_ent.category, 'recomendacion', '¿Recomendarías ' || v_ent.name || ' a un conocido?', 'scale', 3, '[]')
    ON CONFLICT (entity_id, question_key) DO NOTHING;

    -- Pregunta 4: Innovacion
    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, v_ent.category, 'innovacion', '¿Qué tan innovadora consideras que es la propuesta de ' || v_ent.name || '?', 'scale', 4, '[]')
    ON CONFLICT (entity_id, question_key) DO NOTHING;

    -- Pregunta 5: Confianza
    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, v_ent.category, 'confianza', '¿Qué nivel de confianza te inspira ' || v_ent.name || '?', 'scale', 5, '[]')
    ON CONFLICT (entity_id, question_key) DO NOTHING;

    -- Pregunta 6: Atencion
    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, v_ent.category, 'atencion', '¿Cómo evaluarías la atención/servicio de ' || v_ent.name || '?', 'scale', 6, '[]')
    ON CONFLICT (entity_id, question_key) DO NOTHING;

    -- Pregunta 7: Precios
    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, v_ent.category, 'precios', '¿Consideras que los precios de ' || v_ent.name || ' son acordes a su nivel?', 'scale', 7, '[]')
    ON CONFLICT (entity_id, question_key) DO NOTHING;

    -- Pregunta 8: Imagen
    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, v_ent.category, 'imagen', '¿Qué tan moderna o atractiva te parece la imagen de ' || v_ent.name || '?', 'scale', 8, '[]')
    ON CONFLICT (entity_id, question_key) DO NOTHING;

    -- Pregunta 9: Experiencia Digital
    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, v_ent.category, 'digital', '¿Cómo evaluarías la experiencia digital (app/web) de ' || v_ent.name || '?', 'scale', 9, '[]')
    ON CONFLICT (entity_id, question_key) DO NOTHING;

    -- Pregunta 10: Fidelidad
    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, v_ent.category, 'fidelidad', '¿Qué tan probable es que sigas eligiendo ' || v_ent.name || ' en el futuro?', 'scale', 10, '[]')
    ON CONFLICT (entity_id, question_key) DO NOTHING;

  END LOOP;
END $$;

COMMIT;


-- Source: 20260311220000_master_entity_catalog.sql
-- =========================================================
-- OPINA+ | MASTER ENTITY CATALOG EXTENSIONS
-- additive only
-- =========================================================

-- ---------------------------------------------------------
-- 1) columnas de normalización y clasificación básica
-- ---------------------------------------------------------
alter table public.signal_entities
  add column if not exists normalized_name text,
  add column if not exists canonical_code text,
  add column if not exists country_code text,
  add column if not exists primary_category text,
  add column if not exists primary_subcategory text;

comment on column public.signal_entities.normalized_name is 'Nombre normalizado para deduplicación y matching';
comment on column public.signal_entities.canonical_code is 'Código canónico interno estable';
comment on column public.signal_entities.country_code is 'País principal asociado a la entidad si aplica';
comment on column public.signal_entities.primary_category is 'Categoría principal del negocio o dominio';
comment on column public.signal_entities.primary_subcategory is 'Subcategoría principal del negocio o dominio';

create unique index if not exists signal_entities_canonical_code_unique_idx
  on public.signal_entities (canonical_code)
  where canonical_code is not null;

create index if not exists signal_entities_normalized_name_idx
  on public.signal_entities (normalized_name);

create index if not exists signal_entities_primary_category_idx
  on public.signal_entities (primary_category);

create index if not exists signal_entities_primary_subcategory_idx
  on public.signal_entities (primary_subcategory);

-- ---------------------------------------------------------
-- 2) entity_aliases
-- alias y variantes de nombres de una entidad
-- ---------------------------------------------------------
create table if not exists public.entity_aliases (
  id bigserial primary key,
  entity_id uuid not null references public.signal_entities(id) on delete cascade,
  alias text not null,
  normalized_alias text,
  alias_kind text default 'alternate_name',
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  unique (entity_id, alias)
);

comment on table public.entity_aliases is 'Alias o variantes de nombre asociadas a una entidad maestra';
comment on column public.entity_aliases.alias_kind is 'Ejemplos: alternate_name, typo, short_name, legacy_name';

create index if not exists entity_aliases_entity_id_idx
  on public.entity_aliases (entity_id);

create index if not exists entity_aliases_normalized_alias_idx
  on public.entity_aliases (normalized_alias);

-- ---------------------------------------------------------
-- 3) entity_legacy_mappings
-- mapeo entre tablas legacy y signal_entities
-- ---------------------------------------------------------
create table if not exists public.entity_legacy_mappings (
  id bigserial primary key,
  source_table text not null,
  source_id text not null,
  source_label text,
  entity_id uuid not null references public.signal_entities(id) on delete cascade,
  mapping_status text not null default 'mapped',
  confidence_score numeric(5,4),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source_table, source_id)
);

comment on table public.entity_legacy_mappings is 'Relación entre registros legacy del proyecto y entidad maestra signal_entities';
comment on column public.entity_legacy_mappings.mapping_status is 'mapped, pending_review, rejected, deprecated';
comment on column public.entity_legacy_mappings.confidence_score is 'Confianza del matching o mapeo';

create index if not exists entity_legacy_mappings_entity_id_idx
  on public.entity_legacy_mappings (entity_id);

create index if not exists entity_legacy_mappings_source_table_idx
  on public.entity_legacy_mappings (source_table);

-- ---------------------------------------------------------
-- 4) entity_relationships
-- relaciones entre entidades maestras
-- útil para empresa/marca/producto/servicio
-- ---------------------------------------------------------
create table if not exists public.entity_relationships (
  id bigserial primary key,
  parent_entity_id uuid not null references public.signal_entities(id) on delete cascade,
  child_entity_id uuid not null references public.signal_entities(id) on delete cascade,
  relationship_type text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint entity_relationships_not_same_chk check (parent_entity_id <> child_entity_id),
  unique (parent_entity_id, child_entity_id, relationship_type)
);

comment on table public.entity_relationships is 'Relaciones jerárquicas o semánticas entre entidades maestras';
comment on column public.entity_relationships.relationship_type is 'Ejemplos: owns_brand, offers_service, has_product, related_to, belongs_to';

create index if not exists entity_relationships_parent_idx
  on public.entity_relationships (parent_entity_id);

create index if not exists entity_relationships_child_idx
  on public.entity_relationships (child_entity_id);

-- ---------------------------------------------------------
-- 5) helper updated_at para entity_legacy_mappings
-- reutilizar la función existente si ya fue creada
-- ---------------------------------------------------------
drop trigger if exists trg_entity_legacy_mappings_updated_at on public.entity_legacy_mappings;
create trigger trg_entity_legacy_mappings_updated_at
before update on public.entity_legacy_mappings
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------
-- 6) funcion normalizadora
-- ---------------------------------------------------------
create or replace function public.normalize_entity_name(p_input text)
returns text
language sql
immutable
as $$
  select nullif(
    regexp_replace(
      lower(trim(coalesce(p_input, ''))),
      '[^a-z0-9]+',
      '',
      'g'
    ),
    ''
  );
$$;

comment on function public.normalize_entity_name is 'Normaliza nombres de entidades para matching básico y deduplicación asistida';

-- ---------------------------------------------------------
-- 7) update data
-- ---------------------------------------------------------
update public.signal_entities
set normalized_name = public.normalize_entity_name(display_name)
where normalized_name is null
  and display_name is not null;


-- =========================================================
-- Población Inicial Controlada (5 Categorías)
-- Fecha: 2026-02-21
-- Objetivo: 30 Entidades, 5 Torneos Progresivos, 180 Preguntas
-- =========================================================

BEGIN;

-- 1. Crear tabla de definiciones de profundidad si no existe
CREATE TABLE IF NOT EXISTS public.depth_definitions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id uuid REFERENCES public.entities(id) ON DELETE CASCADE,
    category_slug text,
    question_key text NOT NULL,
    question_text text NOT NULL,
    question_type text DEFAULT 'scale',
    options jsonb DEFAULT '[]'::jsonb,
    position int DEFAULT 0,
    is_required boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    UNIQUE(entity_id, question_key)
);

-- 2. Función para asegurar preguntas base (Regla Global)
CREATE OR REPLACE FUNCTION public.fn_ensure_entity_depth(p_entity_id uuid)
RETURNS void AS $$
DECLARE
  v_name text;
  v_cat text;
BEGIN
  SELECT name, category INTO v_name, v_cat FROM public.entities WHERE id = p_entity_id;
  
  -- Pregunta 1: Nota
  INSERT INTO public.depth_definitions (entity_id, question_key, question_text, question_type, position)
  VALUES (p_entity_id, 'nota_general', '¿Qué nota le das a ' || v_name || ' del 0 al 10?', 'scale', 1)
  ON CONFLICT DO NOTHING;

  -- Preguntas 2-6 (Genéricas si no existen)
  INSERT INTO public.depth_definitions (entity_id, question_key, question_text, question_type, position, options)
  VALUES 
    (p_entity_id, 'frecuencia', '¿Con qué frecuencia eliges esta opción?', 'choice', 2, '["Diariamente", "Semanalmente", "Mensualmente", "Ocasionalmente"]'),
    (p_entity_id, 'recomendacion', '¿Qué tan probable es que recomiendes esta opción a un amigo?', 'scale', 3, '[]'),
    (p_entity_id, 'valor', '¿Cómo calificas la relación calidad-precio? (1-5)', 'scale', 4, '[]'),
    (p_entity_id, 'innovacion', '¿Qué tan innovadora consideras que es esta opción? (1-5)', 'scale', 5, '[]'),
    (p_entity_id, 'proposito', '¿Sientes que esta marca aporta un valor real a la sociedad?', 'choice', 6, '["Sí, totalmente", "Parcialmente", "Es indiferente", "No"]')
  ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- 3. Actualizar get_active_battles con validación de profundidad
CREATE OR REPLACE FUNCTION public.get_active_battles()
RETURNS TABLE (
    id uuid,
    slug text,
    title text,
    description text,
    created_at timestamptz,
    category jsonb,
    options jsonb
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        b.id, b.slug, b.title, b.description, b.created_at,
        jsonb_build_object('slug', c.slug, 'name', c.name, 'emoji', c.emoji) AS category,
        (
            SELECT jsonb_agg(jsonb_build_object('id', bo.id, 'label', bo.label, 'image_url', bo.image_url) ORDER BY bo.sort_order)
            FROM public.battle_options bo WHERE bo.battle_id = b.id
        ) AS options
    FROM public.battles b
    JOIN public.categories c ON b.category_id = c.id
    WHERE b.status = 'active'
    AND NOT EXISTS (
        -- VALIDACIÓN CRÍTICA: La batalla NO se muestra si alguna de sus opciones (entidades) tiene menos de 6 preguntas
        SELECT 1 
        FROM public.battle_options bo
        LEFT JOIN public.depth_definitions dd ON bo.brand_id = dd.entity_id
        WHERE bo.battle_id = b.id
        GROUP BY bo.id
        HAVING count(dd.id) < 6
    )
    ORDER BY b.created_at DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- 4. Asegurar Categorías
INSERT INTO public.categories (slug, name, emoji)
VALUES 
  ('streaming', 'Streaming y TV', '📺'),
  ('bebidas', 'Bebidas y Snacks', '🥤'),
  ('vacaciones', 'Viajes y Destinos', '✈️'),
  ('smartphones', 'Smartphones y Tech', '📱'),
  ('salud', 'Salud y Clínicas', '🏥')
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, emoji = EXCLUDED.emoji;

-- 3. Inserción de Entidades por Categoría
-- STREAMING
INSERT INTO public.entities (type, name, slug, category, metadata) VALUES
  ('brand', 'Netflix', 'netflix', 'streaming', '{"source": "seed"}'),
  ('brand', 'Prime Video', 'prime-video', 'streaming', '{"source": "seed"}'),
  ('brand', 'Disney+', 'disney-plus', 'streaming', '{"source": "seed"}'),
  ('brand', 'Max', 'max', 'streaming', '{"source": "seed"}'),
  ('brand', 'Apple TV+', 'apple-tv-plus', 'streaming', '{"source": "seed"}'),
  ('brand', 'Paramount+', 'paramount-plus', 'streaming', '{"source": "seed"}')
ON CONFLICT (slug) DO NOTHING;

-- BEBIDAS
INSERT INTO public.entities (type, name, slug, category, metadata) VALUES
  ('brand', 'Coca-Cola', 'coca-cola', 'bebidas', '{"source": "seed"}'),
  ('brand', 'Pepsi', 'pepsi', 'bebidas', '{"source": "seed"}'),
  ('brand', 'Red Bull', 'red-bull', 'bebidas', '{"source": "seed"}'),
  ('brand', 'Monster Energy', 'monster-energy', 'bebidas', '{"source": "seed"}'),
  ('brand', 'Fanta', 'fanta', 'bebidas', '{"source": "seed"}'),
  ('brand', 'Sprite', 'sprite', 'bebidas', '{"source": "seed"}')
ON CONFLICT (slug) DO NOTHING;

-- VACACIONES
INSERT INTO public.entities (type, name, slug, category, metadata) VALUES
  ('city', 'Nueva York', 'nueva-york', 'vacaciones', '{"source": "seed"}'),
  ('city', 'París', 'paris', 'vacaciones', '{"source": "seed"}'),
  ('city', 'Tokio', 'tokio', 'vacaciones', '{"source": "seed"}'),
  ('city', 'Río de Janeiro', 'rio-de-janeiro', 'vacaciones', '{"source": "seed"}'),
  ('city', 'Roma', 'roma', 'vacaciones', '{"source": "seed"}'),
  ('city', 'Barcelona', 'barcelona', 'vacaciones', '{"source": "seed"}')
ON CONFLICT (slug) DO NOTHING;

-- SMARTPHONES
INSERT INTO public.entities (type, name, slug, category, metadata) VALUES
  ('brand', 'Apple (iPhone)', 'apple-iphone', 'smartphones', '{"source": "seed"}'),
  ('brand', 'Samsung', 'samsung', 'smartphones', '{"source": "seed"}'),
  ('brand', 'Xiaomi', 'xiaomi', 'smartphones', '{"source": "seed"}'),
  ('brand', 'Huawei', 'huawei', 'smartphones', '{"source": "seed"}'),
  ('brand', 'Google (Pixel)', 'google-pixel', 'smartphones', '{"source": "seed"}'),
  ('brand', 'Motorola', 'motorola', 'smartphones', '{"source": "seed"}')
ON CONFLICT (slug) DO NOTHING;

-- SALUD
INSERT INTO public.entities (type, name, slug, category, metadata) VALUES
  ('brand', 'Clínica Alemana', 'clinica-alemana', 'salud', '{"source": "seed"}'),
  ('brand', 'Clínica Las Condes', 'clinica-las-condes', 'salud', '{"source": "seed"}'),
  ('brand', 'Clínica Santa María', 'clinica-santa-maria', 'salud', '{"source": "seed"}'),
  ('brand', 'Clínica Dávila', 'clinica-davila', 'salud', '{"source": "seed"}'),
  ('brand', 'RedSalud', 'redsalud', 'salud', '{"source": "seed"}'),
  ('brand', 'IntegraMédica', 'integramedica', 'salud', '{"source": "seed"}')
ON CONFLICT (slug) DO NOTHING;

-- 4. Creación de Batallas Progresivas (Torneos)
INSERT INTO public.battles (title, slug, description, category_id, status)
SELECT '¿Cuál es el mejor servicio de streaming?', 'torneo-streaming', 'Encuentra tu plataforma favorita.', id, 'active' 
FROM public.categories WHERE slug = 'streaming'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.battles (title, slug, description, category_id, status)
SELECT '¿Cuál es tu bebida favorita?', 'torneo-bebidas', 'Duelo refrescante de marcas.', id, 'active' 
FROM public.categories WHERE slug = 'bebidas'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.battles (title, slug, description, category_id, status)
SELECT '¿Cuál es el mejor destino para vacaciones?', 'torneo-vacaciones', 'El viaje de tus sueños empieza aquí.', id, 'active' 
FROM public.categories WHERE slug = 'vacaciones'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.battles (title, slug, description, category_id, status)
SELECT '¿Cuál es la mejor marca de smartphone?', 'torneo-smartphones', 'Poder, cámara y diseño en tus manos.', id, 'active' 
FROM public.categories WHERE slug = 'smartphones'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.battles (title, slug, description, category_id, status)
SELECT '¿Cuál es la mejor clínica?', 'torneo-salud', 'Calidad y confianza en atención médica.', id, 'active' 
FROM public.categories WHERE slug = 'salud'
ON CONFLICT (slug) DO NOTHING;

-- 5. Vincular Entidades a Batallas Progresivas
DO $$
DECLARE
  v_bat RECORD;
BEGIN
  FOR v_bat IN SELECT id, slug FROM public.battles WHERE slug LIKE 'torneo-%' LOOP
    INSERT INTO public.battle_options (battle_id, label, brand_id, sort_order)
    SELECT v_bat.id, e.name, e.id, row_number() OVER ()
    FROM public.entities e
    WHERE e.category = split_part(v_bat.slug, '-', 2)
    ON CONFLICT DO NOTHING;
    
    -- Activar con una instancia
    INSERT INTO public.battle_instances (battle_id, version, starts_at, context)
    VALUES (v_bat.id, 1, now(), '{"type": "progressive"}')
    ON CONFLICT DO NOTHING;
  END LOOP;
END $$;

-- 6. Batallas Versus Simples Destacadas
DO $$
DECLARE
  v_cat_tech uuid;
  v_cat_bebidas uuid;
  v_b_id uuid;
BEGIN
  SELECT id INTO v_cat_tech FROM public.categories WHERE slug = 'smartphones';
  SELECT id INTO v_cat_bebidas FROM public.categories WHERE slug = 'bebidas';

  -- Apple vs Samsung
  INSERT INTO public.battles (title, slug, description, category_id)
  VALUES ('Apple vs Samsung', 'apple-vs-samsung-2026', 'El duelo eterno de la tecnología.', v_cat_tech)
  ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title
  RETURNING id INTO v_b_id;

  INSERT INTO public.battle_options (battle_id, label, brand_id, sort_order)
  SELECT v_b_id, e.name, e.id, 1 FROM public.entities e WHERE e.slug = 'apple-iphone'
  ON CONFLICT DO NOTHING;
  INSERT INTO public.battle_options (battle_id, label, brand_id, sort_order)
  SELECT v_b_id, e.name, e.id, 2 FROM public.entities e WHERE e.slug = 'samsung'
  ON CONFLICT DO NOTHING;
  
  INSERT INTO public.battle_instances (battle_id, version, starts_at) VALUES (v_b_id, 1, now()) ON CONFLICT DO NOTHING;

  -- Coca-Cola vs Pepsi
  INSERT INTO public.battles (title, slug, description, category_id)
  VALUES ('Coca-Cola vs Pepsi', 'coca-vs-pepsi-2026', 'El sabor que divide al mundo.', v_cat_bebidas)
  ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title
  RETURNING id INTO v_b_id;

  INSERT INTO public.battle_options (battle_id, label, brand_id, sort_order)
  SELECT v_b_id, e.name, e.id, 1 FROM public.entities e WHERE e.slug = 'coca-cola'
  ON CONFLICT DO NOTHING;
  INSERT INTO public.battle_options (battle_id, label, brand_id, sort_order)
  SELECT v_b_id, e.name, e.id, 2 FROM public.entities e WHERE e.slug = 'pepsi'
  ON CONFLICT DO NOTHING;

  INSERT INTO public.battle_instances (battle_id, version, starts_at) VALUES (v_b_id, 1, now()) ON CONFLICT DO NOTHING;
END $$;

-- 7. Población de 180 Preguntas de Profundidad (6 por Entidad)
DO $$
DECLARE
  v_ent RECORD;
BEGIN
  FOR v_ent IN SELECT id, name, category FROM public.entities WHERE category IN ('streaming', 'bebidas', 'vacaciones', 'smartphones', 'salud') LOOP
    
    -- Pregunta 1: Nota (Obligatoria)
    INSERT INTO public.depth_definitions (entity_id, question_key, question_text, question_type, position)
    VALUES (v_ent.id, 'nota_general', 
      CASE WHEN v_ent.category = 'salud' THEN '¿Qué nota le das a la experiencia en ' || v_ent.name || ' del 0 al 10?'
      ELSE '¿Qué nota le das a ' || v_ent.name || ' del 0 al 10?' END,
      'scale', 1)
    ON CONFLICT (entity_id, question_key) DO NOTHING;

    -- Pregunta 2: Frecuencia
    INSERT INTO public.depth_definitions (entity_id, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'frecuencia', '¿Con qué frecuencia consumes/visitas ' || v_ent.name || '?', 'choice', 2, '["Diariamente", "Semanalmente", "Mensualmente", "Ocasionalmente"]')
    ON CONFLICT (entity_id, question_key) DO NOTHING;

    -- Pregunta 3: Recomendación (NPS)
    INSERT INTO public.depth_definitions (entity_id, question_key, question_text, question_type, position)
    VALUES (v_ent.id, 'recomendacion', '¿Qué tan probable es que recomiendes ' || v_ent.name || ' del 0 al 10?', 'scale', 3)
    ON CONFLICT (entity_id, question_key) DO NOTHING;

    -- Pregunta 4: Calidad/Precio
    INSERT INTO public.depth_definitions (entity_id, question_key, question_text, question_type, position)
    VALUES (v_ent.id, 'valor', '¿Cómo calificas la relación calidad-precio / valor de ' || v_ent.name || '? (1-5)', 'scale', 4)
    ON CONFLICT (entity_id, question_key) DO NOTHING;

    -- Pregunta 5: Atributo Diferenciador
    INSERT INTO public.depth_definitions (entity_id, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, 'atributo', '¿Qué es lo que más valoras de ' || v_ent.name || '?', 'choice', 5, 
      CASE 
        WHEN v_ent.category = 'streaming' THEN '["Contenido original", "Precio", "Interfaz", "Catálogo variado"]'
        WHEN v_ent.category = 'bebidas' THEN '["Sabor", "Precio", "Disponibilidad", "Imagen de marca"]'
        WHEN v_ent.category = 'vacaciones' THEN '["Atractivos turísticos", "Seguridad", "Cultura", "Gastronomía"]'
        WHEN v_ent.category = 'smartphones' THEN '["Cámara", "Ecosistema", "Diseño", "Rendimiento"]'
        ELSE '["Calidad médica", "Ubicación", "Tecnología", "Trato al paciente"]'
      END::jsonb)
    ON CONFLICT (entity_id, question_key) DO NOTHING;

    -- Pregunta 6: Innovación / Futuro
    INSERT INTO public.depth_definitions (entity_id, question_key, question_text, question_type, position)
    VALUES (v_ent.id, 'innovacion', '¿Qué tan innovador consideras que es ' || v_ent.name || '? (1-5)', 'scale', 6)
    ON CONFLICT (entity_id, question_key) DO NOTHING;

  END LOOP;
END $$;

COMMIT;
