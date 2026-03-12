-- =========================================================
-- OPINA+ | MASTER ENTITIES INITIAL SEED
-- seed inicial curado y pequeño
-- =========================================================

-- buscar tipos
with et_concept as (
  select id from public.entity_types where code = 'CONCEPT'
),
et_event as (
  select id from public.entity_types where code = 'EVENT'
)
insert into public.signal_entities (
  entity_type_id,
  slug,
  display_name,
  normalized_name,
  canonical_code,
  primary_category,
  primary_subcategory,
  metadata
)
select
  et_concept.id,
  seed.slug,
  seed.display_name,
  public.normalize_entity_name(seed.display_name),
  seed.canonical_code,
  seed.primary_category,
  seed.primary_subcategory,
  seed.metadata::jsonb
from et_concept
cross join (
  values
    ('felicidad', 'Felicidad', 'CONCEPT_HAPPINESS', 'tu-pulso', 'estado-emocional', '{"domain":"personal_pulse"}'),
    ('estres', 'Estrés', 'CONCEPT_STRESS', 'tu-pulso', 'estado-emocional', '{"domain":"personal_pulse"}'),
    ('energia', 'Energía', 'CONCEPT_ENERGY', 'tu-pulso', 'bienestar', '{"domain":"personal_pulse"}'),
    ('bienestar', 'Bienestar', 'CONCEPT_WELLBEING', 'tu-pulso', 'bienestar', '{"domain":"personal_pulse"}'),
    ('confianza', 'Confianza', 'CONCEPT_TRUST', 'opinion', 'percepcion', '{"domain":"general"}'),
    ('seguridad', 'Seguridad', 'CONCEPT_SECURITY', 'opinion', 'percepcion', '{"domain":"general"}')
) as seed(slug, display_name, canonical_code, primary_category, primary_subcategory, metadata)
where not exists (
  select 1
  from public.signal_entities se
  where se.canonical_code = seed.canonical_code
);

with et_event as (
  select id from public.entity_types where code = 'EVENT'
)
insert into public.signal_entities (
  entity_type_id,
  slug,
  display_name,
  normalized_name,
  canonical_code,
  primary_category,
  primary_subcategory,
  metadata
)
select
  et_event.id,
  seed.slug,
  seed.display_name,
  public.normalize_entity_name(seed.display_name),
  seed.canonical_code,
  seed.primary_category,
  seed.primary_subcategory,
  seed.metadata::jsonb
from et_event
cross join (
  values
    ('elecciones', 'Elecciones', 'EVENT_ELECTIONS', 'actualidad', 'politica', '{"domain":"news"}'),
    ('inflacion', 'Inflación', 'EVENT_INFLATION', 'actualidad', 'economia', '{"domain":"news"}')
) as seed(slug, display_name, canonical_code, primary_category, primary_subcategory, metadata)
where not exists (
  select 1
  from public.signal_entities se
  where se.canonical_code = seed.canonical_code
);
