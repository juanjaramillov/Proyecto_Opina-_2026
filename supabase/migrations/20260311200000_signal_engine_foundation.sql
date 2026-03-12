-- =========================================================
-- OPINA+ | SIGNAL ENGINE FOUNDATION
-- additive only / do not break current schema
-- =========================================================

-- ---------------------------------------------------------
-- 1) signal_types
-- catálogo oficial de tipos de señal
-- ---------------------------------------------------------
create table if not exists public.signal_types (
  id bigserial primary key,
  code text not null unique,
  name text not null,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

comment on table public.signal_types is 'Catálogo oficial de tipos de señal de Opina+';
comment on column public.signal_types.code is 'Código estable interno, por ejemplo VERSUS_SIGNAL';

-- seed inicial
insert into public.signal_types (code, name, description)
values
  ('VERSUS_SIGNAL', 'Versus Signal', 'Señal generada por comparación directa entre dos opciones'),
  ('PROGRESSIVE_SIGNAL', 'Progressive Signal', 'Señal generada por comparación secuencial'),
  ('DEPTH_SIGNAL', 'Depth Signal', 'Señal generada por evaluación estructurada'),
  ('CONTEXT_SIGNAL', 'Context Signal', 'Señal generada ante noticias o eventos coyunturales'),
  ('PERSONAL_PULSE_SIGNAL', 'Personal Pulse Signal', 'Señal sobre estado o percepción del propio usuario')
on conflict (code) do nothing;

-- ---------------------------------------------------------
-- 2) entity_types
-- tipos de entidades evaluables
-- ---------------------------------------------------------
create table if not exists public.entity_types (
  id bigserial primary key,
  code text not null unique,
  name text not null,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

comment on table public.entity_types is 'Tipos de entidades que pueden recibir señales';

insert into public.entity_types (code, name, description)
values
  ('BRAND', 'Brand', 'Marca'),
  ('COMPANY', 'Company', 'Empresa'),
  ('PRODUCT', 'Product', 'Producto'),
  ('SERVICE', 'Service', 'Servicio'),
  ('INSTITUTION', 'Institution', 'Institución'),
  ('PUBLIC_FIGURE', 'Public Figure', 'Persona pública'),
  ('CONCEPT', 'Concept', 'Concepto'),
  ('EVENT', 'Event', 'Evento')
on conflict (code) do nothing;

-- ---------------------------------------------------------
-- 3) signal_entities
-- entidad universal evaluable
-- esta tabla no reemplaza catálogos actuales; convive con ellos
-- ---------------------------------------------------------
create table if not exists public.signal_entities (
  id uuid primary key default gen_random_uuid(),
  entity_type_id bigint not null references public.entity_types(id),
  slug text,
  display_name text not null,
  legal_name text,
  external_ref text,
  metadata jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.signal_entities is 'Entidad universal sobre la que se pueden emitir señales';
comment on column public.signal_entities.external_ref is 'Referencia opcional a catálogos o tablas existentes';
comment on column public.signal_entities.metadata is 'Atributos adicionales flexibles de la entidad';

create unique index if not exists signal_entities_slug_unique_idx
  on public.signal_entities (slug)
  where slug is not null;

create index if not exists signal_entities_entity_type_id_idx
  on public.signal_entities (entity_type_id);

-- ---------------------------------------------------------
-- 4) signal_contexts
-- contexto en el que ocurre la señal
-- ---------------------------------------------------------
create table if not exists public.signal_contexts (
  id uuid primary key default gen_random_uuid(),
  code text,
  name text not null,
  context_kind text not null,
  source_module text,
  external_ref text,
  metadata jsonb not null default '{}'::jsonb,
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.signal_contexts is 'Contexto o contenedor en el que se emite una señal';
comment on column public.signal_contexts.context_kind is 'Ejemplos: versus, progressive, depth, news, pulse';
comment on column public.signal_contexts.source_module is 'Módulo actual del producto desde donde provino la señal';

create unique index if not exists signal_contexts_code_unique_idx
  on public.signal_contexts (code)
  where code is not null;

create index if not exists signal_contexts_context_kind_idx
  on public.signal_contexts (context_kind);

-- ---------------------------------------------------------
-- 5) verification_levels
-- nivel de confianza/calidad del usuario
-- puede mapearse luego al sistema real de perfiles existente
-- ---------------------------------------------------------
create table if not exists public.verification_levels (
  id bigserial primary key,
  code text not null unique,
  name text not null,
  description text,
  weight_multiplier numeric(8,4) not null default 1.0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

comment on table public.verification_levels is 'Nivel de verificación/calidad del usuario para ponderar señales';

insert into public.verification_levels (code, name, description, weight_multiplier)
values
  ('ANON', 'Anónimo', 'Usuario sin verificación relevante', 0.5000),
  ('BASIC', 'Básico', 'Usuario registrado con información mínima', 1.0000),
  ('VERIFIED', 'Verificado', 'Usuario con verificación reforzada', 2.0000),
  ('IDENTITY', 'Identidad validada', 'Usuario con identidad formal validada', 3.0000)
on conflict (code) do nothing;

-- ---------------------------------------------------------
-- 6) signal_events
-- tabla madre del motor de señales
-- ---------------------------------------------------------
create table if not exists public.signal_events (
  id uuid primary key default gen_random_uuid(),

  user_id uuid,
  anon_id text,

  signal_type_id bigint not null references public.signal_types(id),
  entity_id uuid not null references public.signal_entities(id),
  context_id uuid references public.signal_contexts(id),

  verification_level_id bigint references public.verification_levels(id),

  value_numeric numeric(14,4),
  value_text text,
  value_boolean boolean,
  value_json jsonb not null default '{}'::jsonb,

  raw_weight numeric(14,4) not null default 1.0,
  effective_weight numeric(14,4) not null default 1.0,

  source_module text,
  source_record_id text,

  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),

  metadata jsonb not null default '{}'::jsonb,

  constraint signal_events_user_or_anon_chk
    check (user_id is not null or anon_id is not null)
);

comment on table public.signal_events is 'Tabla madre del motor de señales de Opina+';
comment on column public.signal_events.user_id is 'Usuario autenticado si existe';
comment on column public.signal_events.anon_id is 'Identificador anónimo si no existe user_id';
comment on column public.signal_events.source_module is 'Módulo de origen: versus, progressive, depth, news, pulse';
comment on column public.signal_events.source_record_id is 'ID del registro original en tablas legacy o actuales';
comment on column public.signal_events.value_json is 'Payload estructurado específico según el tipo de señal';
comment on column public.signal_events.raw_weight is 'Peso base de la señal antes de aplicar multiplicadores';
comment on column public.signal_events.effective_weight is 'Peso final utilizable para agregaciones';

create index if not exists signal_events_user_id_idx
  on public.signal_events (user_id);

create index if not exists signal_events_anon_id_idx
  on public.signal_events (anon_id);

create index if not exists signal_events_signal_type_id_idx
  on public.signal_events (signal_type_id);

create index if not exists signal_events_entity_id_idx
  on public.signal_events (entity_id);

create index if not exists signal_events_context_id_idx
  on public.signal_events (context_id);

create index if not exists signal_events_verification_level_id_idx
  on public.signal_events (verification_level_id);

create index if not exists signal_events_occurred_at_idx
  on public.signal_events (occurred_at desc);

create index if not exists signal_events_source_module_idx
  on public.signal_events (source_module);

create index if not exists signal_events_value_json_gin_idx
  on public.signal_events
  using gin (value_json);

create index if not exists signal_events_metadata_gin_idx
  on public.signal_events
  using gin (metadata);

-- ---------------------------------------------------------
-- 7) updated_at trigger helper
-- reutilizar si ya existe una función similar; si no existe, crearla
-- ---------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_signal_entities_updated_at on public.signal_entities;
create trigger trg_signal_entities_updated_at
before update on public.signal_entities
for each row execute function public.set_updated_at();

drop trigger if exists trg_signal_contexts_updated_at on public.signal_contexts;
create trigger trg_signal_contexts_updated_at
before update on public.signal_contexts
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------
-- 8) vista simple de lectura
-- útil para debugging y futuras integraciones
-- ---------------------------------------------------------
create or replace view public.v_signal_events_enriched as
select
  se.id,
  se.user_id,
  se.anon_id,
  st.code as signal_type_code,
  st.name as signal_type_name,
  ent.id as entity_id,
  ent.display_name as entity_name,
  et.code as entity_type_code,
  ctx.id as context_id,
  ctx.name as context_name,
  ctx.context_kind,
  vl.code as verification_level_code,
  vl.weight_multiplier,
  se.value_numeric,
  se.value_text,
  se.value_boolean,
  se.value_json,
  se.raw_weight,
  se.effective_weight,
  se.source_module,
  se.source_record_id,
  se.occurred_at,
  se.created_at,
  se.metadata
from public.signal_events se
join public.signal_types st
  on st.id = se.signal_type_id
join public.signal_entities ent
  on ent.id = se.entity_id
join public.entity_types et
  on et.id = ent.entity_type_id
left join public.signal_contexts ctx
  on ctx.id = se.context_id
left join public.verification_levels vl
  on vl.id = se.verification_level_id;

comment on view public.v_signal_events_enriched is 'Vista enriquecida para explorar señales y acelerar integraciones futuras';

-- TODO: RLS strategies for these tables will be defined as part of the overall application integration phase.
