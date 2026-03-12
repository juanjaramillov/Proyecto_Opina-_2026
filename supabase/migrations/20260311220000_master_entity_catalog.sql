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
