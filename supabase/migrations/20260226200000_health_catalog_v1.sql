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
