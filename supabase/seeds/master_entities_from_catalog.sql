-- Seed master entities from curated catalog CSV
-- Generated: 2026-03-13T12:38:07.689Z

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'bruno-fritsch',
  'Bruno Fritsch',
  'BRUNO FRITSCH',
  'BRAND_BRUNO_FRITSCH',
  'CL',
  'Automotriz',
  'Automotoras',
  '{"original_category":"Automotriz","original_subcategory":"Automotoras","original_domain":"brunofritsch.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'dercocenter',
  'DercoCenter',
  'DERCOCENTER',
  'BRAND_DERCOCENTER',
  'CL',
  'Automotriz',
  'Automotoras',
  '{"original_category":"Automotriz","original_subcategory":"Automotoras","original_domain":"dercocenter.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'gildemeister',
  'Gildemeister',
  'GILDEMEISTER',
  'BRAND_GILDEMEISTER',
  'CL',
  'Automotriz',
  'Automotoras',
  '{"original_category":"Automotriz","original_subcategory":"Automotoras","original_domain":"gildemeister.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'kaufmann',
  'Kaufmann',
  'KAUFMANN',
  'BRAND_KAUFMANN',
  'CL',
  'Automotriz',
  'Automotoras',
  '{"original_category":"Automotriz","original_subcategory":"Automotoras","original_domain":"kaufmann.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'portillo',
  'Portillo',
  'PORTILLO',
  'BRAND_PORTILLO',
  'CL',
  'Automotriz',
  'Automotoras',
  '{"original_category":"Automotriz","original_subcategory":"Automotoras","original_domain":"portillo.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'salazar-israel',
  'Salazar Israel',
  'SALAZAR ISRAEL',
  'BRAND_SALAZAR_ISRAEL',
  'CL',
  'Automotriz',
  'Automotoras',
  '{"original_category":"Automotriz","original_subcategory":"Automotoras","original_domain":"salazarisrael.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'byd',
  'BYD',
  'BYD',
  'BRAND_BYD',
  NULL,
  'Automotriz',
  'Marcas de autos',
  '{"original_category":"Automotriz","original_subcategory":"Marcas de autos","original_domain":"byd.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'chery',
  'Chery',
  'CHERY',
  'BRAND_CHERY',
  'CL',
  'Automotriz',
  'Marcas de autos',
  '{"original_category":"Automotriz","original_subcategory":"Marcas de autos","original_domain":"chery.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'geely',
  'Geely',
  'GEELY',
  'BRAND_GEELY',
  'CL',
  'Automotriz',
  'Marcas de autos',
  '{"original_category":"Automotriz","original_subcategory":"Marcas de autos","original_domain":"geely.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'great-wall',
  'Great Wall',
  'GREAT WALL',
  'BRAND_GREAT_WALL',
  NULL,
  'Automotriz',
  'Marcas de autos',
  '{"original_category":"Automotriz","original_subcategory":"Marcas de autos","original_domain":"gwm-global.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'haval',
  'Haval',
  'HAVAL',
  'BRAND_HAVAL',
  'CL',
  'Automotriz',
  'Marcas de autos',
  '{"original_category":"Automotriz","original_subcategory":"Marcas de autos","original_domain":"gwm.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'jac',
  'JAC',
  'JAC',
  'BRAND_JAC',
  'CL',
  'Automotriz',
  'Marcas de autos',
  '{"original_category":"Automotriz","original_subcategory":"Marcas de autos","original_domain":"jac.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'jetour',
  'Jetour',
  'JETOUR',
  'BRAND_JETOUR',
  NULL,
  'Automotriz',
  'Marcas de autos',
  '{"original_category":"Automotriz","original_subcategory":"Marcas de autos","original_domain":"jetourglobal.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'mg',
  'MG',
  'MG',
  'BRAND_MG',
  'CL',
  'Automotriz',
  'Marcas de autos',
  '{"original_category":"Automotriz","original_subcategory":"Marcas de autos","original_domain":"mgmotor.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'bmw',
  'BMW',
  'BMW',
  'BRAND_BMW',
  'CL',
  'Automotriz',
  'Marcas de autos',
  '{"original_category":"Automotriz","original_subcategory":"Marcas de autos","original_domain":"bmw.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'chevrolet',
  'Chevrolet',
  'CHEVROLET',
  'BRAND_CHEVROLET',
  'CL',
  'Automotriz',
  'Marcas de autos',
  '{"original_category":"Automotriz","original_subcategory":"Marcas de autos","original_domain":"chevrolet.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'hyundai',
  'Hyundai',
  'HYUNDAI',
  'BRAND_HYUNDAI',
  'CL',
  'Automotriz',
  'Marcas de autos',
  '{"original_category":"Automotriz","original_subcategory":"Marcas de autos","original_domain":"hyundai.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'kia',
  'Kia',
  'KIA',
  'BRAND_KIA',
  'CL',
  'Automotriz',
  'Marcas de autos',
  '{"original_category":"Automotriz","original_subcategory":"Marcas de autos","original_domain":"kia.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'mazda',
  'Mazda',
  'MAZDA',
  'BRAND_MAZDA',
  'CL',
  'Automotriz',
  'Marcas de autos',
  '{"original_category":"Automotriz","original_subcategory":"Marcas de autos","original_domain":"mazda.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'mercedes-benz',
  'Mercedes-Benz',
  'MERCEDESBENZ',
  'BRAND_MERCEDESBENZ',
  'CL',
  'Automotriz',
  'Marcas de autos',
  '{"original_category":"Automotriz","original_subcategory":"Marcas de autos","original_domain":"mercedes-benz.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'nissan',
  'Nissan',
  'NISSAN',
  'BRAND_NISSAN',
  'CL',
  'Automotriz',
  'Marcas de autos',
  '{"original_category":"Automotriz","original_subcategory":"Marcas de autos","original_domain":"nissan.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'peugeot',
  'Peugeot',
  'PEUGEOT',
  'BRAND_PEUGEOT',
  'CL',
  'Automotriz',
  'Marcas de autos',
  '{"original_category":"Automotriz","original_subcategory":"Marcas de autos","original_domain":"peugeot.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'suzuki',
  'Suzuki',
  'SUZUKI',
  'BRAND_SUZUKI',
  'CL',
  'Automotriz',
  'Marcas de autos',
  '{"original_category":"Automotriz","original_subcategory":"Marcas de autos","original_domain":"suzuki.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'toyota',
  'Toyota',
  'TOYOTA',
  'BRAND_TOYOTA',
  'CL',
  'Automotriz',
  'Marcas de autos',
  '{"original_category":"Automotriz","original_subcategory":"Marcas de autos","original_domain":"toyota.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'aquarius',
  'Aquarius',
  'AQUARIUS',
  'BRAND_AQUARIUS',
  NULL,
  'Bebidas',
  'Aguas',
  '{"original_category":"Bebidas","original_subcategory":"Aguas","original_domain":"coca-cola.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'benedictino',
  'Benedictino',
  'BENEDICTINO',
  'BRAND_BENEDICTINO',
  'CL',
  'Bebidas',
  'Aguas',
  '{"original_category":"Bebidas","original_subcategory":"Aguas","original_domain":"benedictino.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'cachantun',
  'Cachantun',
  'CACHANTUN',
  'BRAND_CACHANTUN',
  'CL',
  'Bebidas',
  'Aguas',
  '{"original_category":"Bebidas","original_subcategory":"Aguas","original_domain":"cachantun.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'evian',
  'Evian',
  'EVIAN',
  'BRAND_EVIAN',
  NULL,
  'Bebidas',
  'Aguas',
  '{"original_category":"Bebidas","original_subcategory":"Aguas","original_domain":"evian.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'perrier',
  'Perrier',
  'PERRIER',
  'BRAND_PERRIER',
  NULL,
  'Bebidas',
  'Aguas',
  '{"original_category":"Bebidas","original_subcategory":"Aguas","original_domain":"perrier.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'vital',
  'Vital',
  'VITAL',
  'BRAND_VITAL',
  'CL',
  'Bebidas',
  'Aguas',
  '{"original_category":"Bebidas","original_subcategory":"Aguas","original_domain":"vitalagua.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'becker',
  'Becker',
  'BECKER',
  'BRAND_BECKER',
  'CL',
  'Bebidas',
  'Cervezas',
  '{"original_category":"Bebidas","original_subcategory":"Cervezas","original_domain":"becker.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'corona',
  'Corona',
  'CORONA',
  'BRAND_CORONA',
  'CL',
  'Bebidas',
  'Cervezas',
  '{"original_category":"Bebidas","original_subcategory":"Cervezas","original_domain":"cervezacorona.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'cristal',
  'Cristal',
  'CRISTAL',
  'BRAND_CRISTAL',
  NULL,
  'Bebidas',
  'Cervezas',
  '{"original_category":"Bebidas","original_subcategory":"Cervezas","original_domain":"","catalog_source":"excel","curation_status":"needs_review","notes":"Domain review needed."}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'escudo',
  'Escudo',
  'ESCUDO',
  'BRAND_ESCUDO',
  NULL,
  'Bebidas',
  'Cervezas',
  '{"original_category":"Bebidas","original_subcategory":"Cervezas","original_domain":"","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'heineken',
  'Heineken',
  'HEINEKEN',
  'BRAND_HEINEKEN',
  NULL,
  'Bebidas',
  'Cervezas',
  '{"original_category":"Bebidas","original_subcategory":"Cervezas","original_domain":"heineken.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'kunstmann',
  'Kunstmann',
  'KUNSTMANN',
  'BRAND_KUNSTMANN',
  'CL',
  'Bebidas',
  'Cervezas',
  '{"original_category":"Bebidas","original_subcategory":"Cervezas","original_domain":"cerveza-kunstmann.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'burn',
  'Burn',
  'BURN',
  'BRAND_BURN',
  NULL,
  'Bebidas',
  'Energéticas',
  '{"original_category":"Bebidas","original_subcategory":"Energéticas","original_domain":"","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'celsius',
  'Celsius',
  'CELSIUS',
  'BRAND_CELSIUS',
  NULL,
  'Bebidas',
  'Energéticas',
  '{"original_category":"Bebidas","original_subcategory":"Energéticas","original_domain":"","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'monster',
  'Monster',
  'MONSTER',
  'BRAND_MONSTER',
  NULL,
  'Bebidas',
  'Energéticas',
  '{"original_category":"Bebidas","original_subcategory":"Energéticas","original_domain":"monsterenergy.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'prime-energy',
  'Prime Energy',
  'PRIME ENERGY',
  'BRAND_PRIME_ENERGY',
  NULL,
  'Bebidas',
  'Energéticas',
  '{"original_category":"Bebidas","original_subcategory":"Energéticas","original_domain":"","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'red-bull',
  'Red Bull',
  'RED BULL',
  'BRAND_RED_BULL',
  NULL,
  'Bebidas',
  'Energéticas',
  '{"original_category":"Bebidas","original_subcategory":"Energéticas","original_domain":"redbull.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'rockstar',
  'Rockstar',
  'ROCKSTAR',
  'BRAND_ROCKSTAR',
  NULL,
  'Bebidas',
  'Energéticas',
  '{"original_category":"Bebidas","original_subcategory":"Energéticas","original_domain":"","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'canada-dry',
  'Canada Dry',
  'CANADA DRY',
  'BRAND_CANADA_DRY',
  'CL',
  'Bebidas',
  'Gaseosas',
  '{"original_category":"Bebidas","original_subcategory":"Gaseosas","original_domain":"canadadrychile.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'coca-cola',
  'Coca-Cola',
  'COCACOLA',
  'BRAND_COCACOLA',
  'CL',
  'Bebidas',
  'Gaseosas',
  '{"original_category":"Bebidas","original_subcategory":"Gaseosas","original_domain":"andina.micoca-cola.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'fanta',
  'Fanta',
  'FANTA',
  'BRAND_FANTA',
  NULL,
  'Bebidas',
  'Gaseosas',
  '{"original_category":"Bebidas","original_subcategory":"Gaseosas","original_domain":"coca-cola.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'pepsi',
  'Pepsi',
  'PEPSI',
  'BRAND_PEPSI',
  NULL,
  'Bebidas',
  'Gaseosas',
  '{"original_category":"Bebidas","original_subcategory":"Gaseosas","original_domain":"pepsi.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'schweppes',
  'Schweppes',
  'SCHWEPPES',
  'BRAND_SCHWEPPES',
  NULL,
  'Bebidas',
  'Gaseosas',
  '{"original_category":"Bebidas","original_subcategory":"Gaseosas","original_domain":"","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'sprite',
  'Sprite',
  'SPRITE',
  'BRAND_SPRITE',
  NULL,
  'Bebidas',
  'Gaseosas',
  '{"original_category":"Bebidas","original_subcategory":"Gaseosas","original_domain":"","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'descorcha',
  'Descorcha',
  'DESCORCHA',
  'BRAND_DESCORCHA',
  NULL,
  'Bebidas',
  'Tiendas de vino',
  '{"original_category":"Bebidas","original_subcategory":"Tiendas de vino","original_domain":"descorcha.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'el-mundo-del-vino',
  'El Mundo del Vino',
  'EL MUNDO DEL VINO',
  'BRAND_EL_MUNDO_DEL_VINO',
  'CL',
  'Bebidas',
  'Tiendas de vino',
  '{"original_category":"Bebidas","original_subcategory":"Tiendas de vino","original_domain":"elmundodelvino.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'la-cav',
  'La Cav',
  'LA CAV',
  'BRAND_LA_CAV',
  'CL',
  'Bebidas',
  'Tiendas de vino',
  '{"original_category":"Bebidas","original_subcategory":"Tiendas de vino","original_domain":"cav.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'la-vinoteca',
  'La Vinoteca',
  'LA VINOTECA',
  'BRAND_LA_VINOTECA',
  'CL',
  'Bebidas',
  'Tiendas de vino',
  '{"original_category":"Bebidas","original_subcategory":"Tiendas de vino","original_domain":"lavinoteca.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'tienda-concha-y-toro',
  'Tienda Concha y Toro',
  'TIENDA CONCHA Y TORO',
  'BRAND_TIENDA_CONCHA_Y_TORO',
  NULL,
  'Bebidas',
  'Tiendas de vino',
  '{"original_category":"Bebidas","original_subcategory":"Tiendas de vino","original_domain":"","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'tienda-santa-rita',
  'Tienda Santa Rita',
  'TIENDA SANTA RITA',
  'BRAND_TIENDA_SANTA_RITA',
  NULL,
  'Bebidas',
  'Tiendas de vino',
  '{"original_category":"Bebidas","original_subcategory":"Tiendas de vino","original_domain":"","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'concha-y-toro',
  'Concha y Toro',
  'CONCHA Y TORO',
  'BRAND_CONCHA_Y_TORO',
  NULL,
  'Bebidas',
  'Viñas',
  '{"original_category":"Bebidas","original_subcategory":"Viñas","original_domain":"conchaytoro.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'miguel-torres',
  'Miguel Torres',
  'MIGUEL TORRES',
  'BRAND_MIGUEL_TORRES',
  'CL',
  'Bebidas',
  'Viñas',
  '{"original_category":"Bebidas","original_subcategory":"Viñas","original_domain":"migueltorres.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'montes',
  'Montes',
  'MONTES',
  'BRAND_MONTES',
  NULL,
  'Bebidas',
  'Viñas',
  '{"original_category":"Bebidas","original_subcategory":"Viñas","original_domain":"monteswines.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'san-pedro',
  'San Pedro',
  'SAN PEDRO',
  'BRAND_SAN_PEDRO',
  'CL',
  'Bebidas',
  'Viñas',
  '{"original_category":"Bebidas","original_subcategory":"Viñas","original_domain":"sanpedro.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'santa-rita',
  'Santa Rita',
  'SANTA RITA',
  'BRAND_SANTA_RITA',
  NULL,
  'Bebidas',
  'Viñas',
  '{"original_category":"Bebidas","original_subcategory":"Viñas","original_domain":"santarita.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'undurraga',
  'Undurraga',
  'UNDURRAGA',
  'BRAND_UNDURRAGA',
  'CL',
  'Bebidas',
  'Viñas',
  '{"original_category":"Bebidas","original_subcategory":"Viñas","original_domain":"undurraga.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'bebesit',
  'Bebesit',
  'BEBESIT',
  'BRAND_BEBESIT',
  'CL',
  'Bebés',
  'Coches',
  '{"original_category":"Bebés","original_subcategory":"Coches","original_domain":"bebesit.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'chicco',
  'Chicco',
  'CHICCO',
  'BRAND_CHICCO',
  'CL',
  'Bebés',
  'Cochecitos',
  '{"original_category":"Bebés","original_subcategory":"Cochecitos","original_domain":"chicco.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'graco',
  'Graco',
  'GRACO',
  'BRAND_GRACO',
  'CL',
  'Bebés',
  'Cochecitos',
  '{"original_category":"Bebés","original_subcategory":"Cochecitos","original_domain":"babygraco.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'infanti',
  'Infanti',
  'INFANTI',
  'BRAND_INFANTI',
  'CL',
  'Bebés',
  'Cochecitos',
  '{"original_category":"Bebés","original_subcategory":"Cochecitos","original_domain":"infanti.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'joie',
  'Joie',
  'JOIE',
  'BRAND_JOIE',
  NULL,
  'Bebés',
  'Cochecitos',
  '{"original_category":"Bebés","original_subcategory":"Cochecitos","original_domain":"joiebaby.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'maxi-cosi',
  'Maxi-Cosi',
  'MAXICOSI',
  'BRAND_MAXICOSI',
  'CL',
  'Bebés',
  'Cochecitos',
  '{"original_category":"Bebés","original_subcategory":"Cochecitos","original_domain":"maxicosi.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'enfamil',
  'Enfamil',
  'ENFAMIL',
  'BRAND_ENFAMIL',
  NULL,
  'Bebés',
  'Alimento Infantil',
  '{"original_category":"Bebés","original_subcategory":"Alimento Infantil","original_domain":"enfamil.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'nan',
  'NAN',
  'NAN',
  'BRAND_NAN',
  'CL',
  'Bebés',
  'Alimento Infantil',
  '{"original_category":"Bebés","original_subcategory":"Alimento Infantil","original_domain":"nestle.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'nidal',
  'Nidal',
  'NIDAL',
  'BRAND_NIDAL',
  NULL,
  'Bebés',
  'Alimento Infantil',
  '{"original_category":"Bebés","original_subcategory":"Alimento Infantil","original_domain":"","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'pediasure',
  'Pediasure',
  'PEDIASURE',
  'BRAND_PEDIASURE',
  NULL,
  'Bebés',
  'Alimento Infantil',
  '{"original_category":"Bebés","original_subcategory":"Alimento Infantil","original_domain":"","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  's-26',
  'S-26',
  'S26',
  'BRAND_S26',
  NULL,
  'Bebés',
  'Alimento Infantil',
  '{"original_category":"Bebés","original_subcategory":"Alimento Infantil","original_domain":"","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'similac',
  'Similac',
  'SIMILAC',
  'BRAND_SIMILAC',
  NULL,
  'Bebés',
  'Alimento Infantil',
  '{"original_category":"Bebés","original_subcategory":"Alimento Infantil","original_domain":"","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'bbtips',
  'BBTips',
  'BBTIPS',
  'BRAND_BBTIPS',
  NULL,
  'Bebés',
  'Pañales',
  '{"original_category":"Bebés","original_subcategory":"Pañales","original_domain":"","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'babysec',
  'Babysec',
  'BABYSEC',
  'BRAND_BABYSEC',
  'CL',
  'Bebés',
  'Pañales',
  '{"original_category":"Bebés","original_subcategory":"Pañales","original_domain":"babysec.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'huggies',
  'Huggies',
  'HUGGIES',
  'BRAND_HUGGIES',
  'CL',
  'Bebés',
  'Pañales',
  '{"original_category":"Bebés","original_subcategory":"Pañales","original_domain":"huggies.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'pampers',
  'Pampers',
  'PAMPERS',
  'BRAND_PAMPERS',
  'CL',
  'Bebés',
  'Pañales',
  '{"original_category":"Bebés","original_subcategory":"Pañales","original_domain":"pampers.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'waterwipes',
  'WaterWipes',
  'WATERWIPES',
  'BRAND_WATERWIPES',
  NULL,
  'Bebés',
  'Toallitas húmedas',
  '{"original_category":"Bebés","original_subcategory":"Toallitas húmedas","original_domain":"","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'l-oreal-paris',
  'L''Oréal Paris',
  'LOREAL PARIS',
  'BRAND_LOREAL_PARIS',
  'CL',
  'Belleza',
  'Maquillaje',
  '{"original_category":"Belleza","original_subcategory":"Maquillaje","original_domain":"loreal-paris.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'mac',
  'MAC',
  'MAC',
  'BRAND_MAC',
  'CL',
  'Belleza',
  'Maquillaje',
  '{"original_category":"Belleza","original_subcategory":"Maquillaje","original_domain":"maccosmetics.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'maybelline',
  'Maybelline',
  'MAYBELLINE',
  'BRAND_MAYBELLINE',
  'CL',
  'Belleza',
  'Maquillaje',
  '{"original_category":"Belleza","original_subcategory":"Maquillaje","original_domain":"maybelline.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'nyx',
  'NYX',
  'NYX',
  'BRAND_NYX',
  NULL,
  'Belleza',
  'Maquillaje',
  '{"original_category":"Belleza","original_subcategory":"Maquillaje","original_domain":"nyxcosmetics.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'natura',
  'Natura',
  'NATURA',
  'BRAND_NATURA',
  'CL',
  'Belleza',
  'Maquillaje',
  '{"original_category":"Belleza","original_subcategory":"Maquillaje","original_domain":"natura.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'petrizzio',
  'Petrizzio',
  'PETRIZZIO',
  'BRAND_PETRIZZIO',
  'CL',
  'Belleza',
  'Maquillaje',
  '{"original_category":"Belleza","original_subcategory":"Maquillaje","original_domain":"petrizzio.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'axe',
  'Axe',
  'AXE',
  'BRAND_AXE',
  NULL,
  'Belleza',
  'Desodorantes',
  '{"original_category":"Belleza","original_subcategory":"Desodorantes","original_domain":"axe.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'dove',
  'Dove',
  'DOVE',
  'BRAND_DOVE',
  NULL,
  'Belleza',
  'Desodorantes',
  '{"original_category":"Belleza","original_subcategory":"Desodorantes","original_domain":"dove.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'lady-speed-stick',
  'Lady Speed Stick',
  'LADY SPEED STICK',
  'BRAND_LADY_SPEED_STICK',
  NULL,
  'Belleza',
  'Desodorantes',
  '{"original_category":"Belleza","original_subcategory":"Desodorantes","original_domain":"ladyspeedstick.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'nivea',
  'Nivea',
  'NIVEA',
  'BRAND_NIVEA',
  'CL',
  'Belleza',
  'Desodorantes',
  '{"original_category":"Belleza","original_subcategory":"Desodorantes","original_domain":"nivea.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'old-spice',
  'Old Spice',
  'OLD SPICE',
  'BRAND_OLD_SPICE',
  NULL,
  'Belleza',
  'Desodorantes',
  '{"original_category":"Belleza","original_subcategory":"Desodorantes","original_domain":"oldspice.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'rexona',
  'Rexona',
  'REXONA',
  'BRAND_REXONA',
  NULL,
  'Belleza',
  'Desodorantes',
  '{"original_category":"Belleza","original_subcategory":"Desodorantes","original_domain":"rexona.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'aquafresh',
  'Aquafresh',
  'AQUAFRESH',
  'BRAND_AQUAFRESH',
  NULL,
  'Belleza',
  'Pastas dentales',
  '{"original_category":"Belleza","original_subcategory":"Pastas dentales","original_domain":"aquafresh.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'closeup',
  'Closeup',
  'CLOSEUP',
  'BRAND_CLOSEUP',
  NULL,
  'Belleza',
  'Pastas dentales',
  '{"original_category":"Belleza","original_subcategory":"Pastas dentales","original_domain":"closeup.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'colgate',
  'Colgate',
  'COLGATE',
  'BRAND_COLGATE',
  'CL',
  'Belleza',
  'Pastas dentales',
  '{"original_category":"Belleza","original_subcategory":"Pastas dentales","original_domain":"colgate.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'oral-b',
  'Oral-B',
  'ORALB',
  'BRAND_ORALB',
  'CL',
  'Belleza',
  'Pastas dentales',
  '{"original_category":"Belleza","original_subcategory":"Pastas dentales","original_domain":"oralb.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'pepsodent',
  'Pepsodent',
  'PEPSODENT',
  'BRAND_PEPSODENT',
  NULL,
  'Belleza',
  'Pastas dentales',
  '{"original_category":"Belleza","original_subcategory":"Pastas dentales","original_domain":"pepsodent.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'sensodyne',
  'Sensodyne',
  'SENSODYNE',
  'BRAND_SENSODYNE',
  'CL',
  'Belleza',
  'Pastas dentales',
  '{"original_category":"Belleza","original_subcategory":"Pastas dentales","original_domain":"sensodyne.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'calvin-klein',
  'Calvin Klein',
  'CALVIN KLEIN',
  'BRAND_CALVIN_KLEIN',
  'CL',
  'Belleza',
  'Perfumes',
  '{"original_category":"Belleza","original_subcategory":"Perfumes","original_domain":"calvinklein.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'carolina-herrera',
  'Carolina Herrera',
  'CAROLINA HERRERA',
  'BRAND_CAROLINA_HERRERA',
  NULL,
  'Belleza',
  'Perfumes',
  '{"original_category":"Belleza","original_subcategory":"Perfumes","original_domain":"carolinaherrera.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'chanel',
  'Chanel',
  'CHANEL',
  'BRAND_CHANEL',
  NULL,
  'Belleza',
  'Perfumes',
  '{"original_category":"Belleza","original_subcategory":"Perfumes","original_domain":"chanel.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'dior',
  'Dior',
  'DIOR',
  'BRAND_DIOR',
  NULL,
  'Belleza',
  'Perfumes',
  '{"original_category":"Belleza","original_subcategory":"Perfumes","original_domain":"dior.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'hugo-boss',
  'Hugo Boss',
  'HUGO BOSS',
  'BRAND_HUGO_BOSS',
  NULL,
  'Belleza',
  'Perfumes',
  '{"original_category":"Belleza","original_subcategory":"Perfumes","original_domain":"hugoboss.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'rabanne',
  'Rabanne',
  'RABANNE',
  'BRAND_RABANNE',
  NULL,
  'Belleza',
  'Perfumes',
  '{"original_category":"Belleza","original_subcategory":"Perfumes","original_domain":"rabanne.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'eucerin-sun',
  'Eucerin Sun',
  'EUCERIN SUN',
  'BRAND_EUCERIN_SUN',
  'CL',
  'Belleza',
  'Protección solar',
  '{"original_category":"Belleza","original_subcategory":"Protección solar","original_domain":"eucerin.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'hawaiian-tropic',
  'Hawaiian Tropic',
  'HAWAIIAN TROPIC',
  'BRAND_HAWAIIAN_TROPIC',
  NULL,
  'Belleza',
  'Protección solar',
  '{"original_category":"Belleza","original_subcategory":"Protección solar","original_domain":"hawaiiantropic.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'isdin',
  'ISDIN',
  'ISDIN',
  'BRAND_ISDIN',
  NULL,
  'Belleza',
  'Protección solar',
  '{"original_category":"Belleza","original_subcategory":"Protección solar","original_domain":"isdin.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'la-roche-posay',
  'La Roche-Posay',
  'LA ROCHEPOSAY',
  'BRAND_LA_ROCHEPOSAY',
  'CL',
  'Belleza',
  'Protección solar',
  '{"original_category":"Belleza","original_subcategory":"Protección solar","original_domain":"laroche-posay.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'raytan',
  'Raytan',
  'RAYTAN',
  'BRAND_RAYTAN',
  'CL',
  'Belleza',
  'Protección solar',
  '{"original_category":"Belleza","original_subcategory":"Protección solar","original_domain":"raytan.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'vichy',
  'Vichy',
  'VICHY',
  'BRAND_VICHY',
  'CL',
  'Belleza',
  'Protección solar',
  '{"original_category":"Belleza","original_subcategory":"Protección solar","original_domain":"vichy.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'elvive',
  'Elvive',
  'ELVIVE',
  'BRAND_ELVIVE',
  'CL',
  'Belleza',
  'Shampoo',
  '{"original_category":"Belleza","original_subcategory":"Shampoo","original_domain":"loreal-paris.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'head-shoulders',
  'Head & Shoulders',
  'HEAD SHOULDERS',
  'BRAND_HEAD_SHOULDERS',
  'CL',
  'Belleza',
  'Shampoo',
  '{"original_category":"Belleza","original_subcategory":"Shampoo","original_domain":"headandshoulders.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'pantene',
  'Pantene',
  'PANTENE',
  'BRAND_PANTENE',
  NULL,
  'Belleza',
  'Shampoo',
  '{"original_category":"Belleza","original_subcategory":"Shampoo","original_domain":"pantenela.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'sedal',
  'Sedal',
  'SEDAL',
  'BRAND_SEDAL',
  'CL',
  'Belleza',
  'Shampoo',
  '{"original_category":"Belleza","original_subcategory":"Shampoo","original_domain":"sedal.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'tio-nacho',
  'Tío Nacho',
  'TIO NACHO',
  'BRAND_TIO_NACHO',
  NULL,
  'Belleza',
  'Shampoo',
  '{"original_category":"Belleza","original_subcategory":"Shampoo","original_domain":"tionacho.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'bioderma',
  'Bioderma',
  'BIODERMA',
  'BRAND_BIODERMA',
  'CL',
  'Belleza',
  'Skincare',
  '{"original_category":"Belleza","original_subcategory":"Skincare","original_domain":"bioderma.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'cerave',
  'CeraVe',
  'CERAVE',
  'BRAND_CERAVE',
  'CL',
  'Belleza',
  'Skincare',
  '{"original_category":"Belleza","original_subcategory":"Skincare","original_domain":"cerave.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'cetaphil',
  'Cetaphil',
  'CETAPHIL',
  'BRAND_CETAPHIL',
  'CL',
  'Belleza',
  'Skincare',
  '{"original_category":"Belleza","original_subcategory":"Skincare","original_domain":"cetaphil.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'eucerin',
  'Eucerin',
  'EUCERIN',
  'BRAND_EUCERIN',
  'CL',
  'Belleza',
  'Skincare',
  '{"original_category":"Belleza","original_subcategory":"Skincare","original_domain":"eucerin.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'cafe-haiti',
  'Café Haiti',
  'CAFE HAITI',
  'BRAND_CAFE_HAITI',
  'CL',
  'Comida',
  'Cafeterías',
  '{"original_category":"Comida","original_subcategory":"Cafeterías","original_domain":"cafehaiti.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'castano',
  'Castaño',
  'CASTANO',
  'BRAND_CASTANO',
  'CL',
  'Comida',
  'Cafeterías',
  '{"original_category":"Comida","original_subcategory":"Cafeterías","original_domain":"castano.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'dunkin',
  'Dunkin',
  'DUNKIN',
  'BRAND_DUNKIN',
  'CL',
  'Comida',
  'Cafeterías',
  '{"original_category":"Comida","original_subcategory":"Cafeterías","original_domain":"dunkin.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'juan-valdez',
  'Juan Valdez',
  'JUAN VALDEZ',
  'BRAND_JUAN_VALDEZ',
  NULL,
  'Comida',
  'Cafeterías',
  '{"original_category":"Comida","original_subcategory":"Cafeterías","original_domain":"juanvaldezcafe.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'starbucks',
  'Starbucks',
  'STARBUCKS',
  'BRAND_STARBUCKS',
  'CL',
  'Comida',
  'Cafeterías',
  '{"original_category":"Comida","original_subcategory":"Cafeterías","original_domain":"starbucks.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'tavelli',
  'Tavelli',
  'TAVELLI',
  'BRAND_TAVELLI',
  'CL',
  'Comida',
  'Cafeterías',
  '{"original_category":"Comida","original_subcategory":"Cafeterías","original_domain":"tavelli.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'didi-food',
  'DiDi Food',
  'DIDI FOOD',
  'BRAND_DIDI_FOOD',
  NULL,
  'Comida',
  'Delivery',
  '{"original_category":"Comida","original_subcategory":"Delivery","original_domain":"didiglobal.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'justo',
  'Justo',
  'JUSTO',
  'BRAND_JUSTO',
  'CL',
  'Comida',
  'Delivery',
  '{"original_category":"Comida","original_subcategory":"Delivery","original_domain":"justo.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'orders',
  'Orders',
  'ORDERS',
  'BRAND_ORDERS',
  'CL',
  'Comida',
  'Delivery',
  '{"original_category":"Comida","original_subcategory":"Delivery","original_domain":"orders.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'pedidosya',
  'PedidosYa',
  'PEDIDOSYA',
  'BRAND_PEDIDOSYA',
  'CL',
  'Comida',
  'Delivery',
  '{"original_category":"Comida","original_subcategory":"Delivery","original_domain":"pedidosya.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'rappi',
  'Rappi',
  'RAPPI',
  'BRAND_RAPPI',
  NULL,
  'Comida',
  'Delivery',
  '{"original_category":"Comida","original_subcategory":"Delivery","original_domain":"rappi.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'uber-eats',
  'Uber Eats',
  'UBER EATS',
  'BRAND_UBER_EATS',
  NULL,
  'Comida',
  'Delivery',
  '{"original_category":"Comida","original_subcategory":"Delivery","original_domain":"ubereats.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'burger-king',
  'Burger King',
  'BURGER KING',
  'BRAND_BURGER_KING',
  'CL',
  'Comida',
  'Fast food',
  '{"original_category":"Comida","original_subcategory":"Fast food","original_domain":"burgerking.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'doggis',
  'Doggis',
  'DOGGIS',
  'BRAND_DOGGIS',
  'CL',
  'Comida',
  'Fast food',
  '{"original_category":"Comida","original_subcategory":"Fast food","original_domain":"doggis.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'juan-maestro',
  'Juan Maestro',
  'JUAN MAESTRO',
  'BRAND_JUAN_MAESTRO',
  'CL',
  'Comida',
  'Fast food',
  '{"original_category":"Comida","original_subcategory":"Fast food","original_domain":"juanmaestro.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'kfc',
  'KFC',
  'KFC',
  'BRAND_KFC',
  'CL',
  'Comida',
  'Fast food',
  '{"original_category":"Comida","original_subcategory":"Fast food","original_domain":"kfc.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'mcdonald-s',
  'McDonald''s',
  'MCDONALDS',
  'BRAND_MCDONALDS',
  'CL',
  'Comida',
  'Fast food',
  '{"original_category":"Comida","original_subcategory":"Fast food","original_domain":"mcdonalds.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'pedro-juan-diego',
  'Pedro, Juan & Diego',
  'PEDRO JUAN DIEGO',
  'BRAND_PEDRO_JUAN_DIEGO',
  'CL',
  'Comida',
  'Fast food',
  '{"original_category":"Comida","original_subcategory":"Fast food","original_domain":"pyd.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'subway',
  'Subway',
  'SUBWAY',
  'BRAND_SUBWAY',
  NULL,
  'Comida',
  'Fast food',
  '{"original_category":"Comida","original_subcategory":"Fast food","original_domain":"subway.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'tarragona',
  'Tarragona',
  'TARRAGONA',
  'BRAND_TARRAGONA',
  'CL',
  'Comida',
  'Fast food',
  '{"original_category":"Comida","original_subcategory":"Fast food","original_domain":"tarragona.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'domino-s',
  'Domino''s',
  'DOMINOS',
  'BRAND_DOMINOS',
  'CL',
  'Comida',
  'Pizza',
  '{"original_category":"Comida","original_subcategory":"Pizza","original_domain":"dominos.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'little-caesars',
  'Little Caesars',
  'LITTLE CAESARS',
  'BRAND_LITTLE_CAESARS',
  'CL',
  'Comida',
  'Pizza',
  '{"original_category":"Comida","original_subcategory":"Pizza","original_domain":"littlecaesars.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'melt-pizzas',
  'Melt Pizzas',
  'MELT PIZZAS',
  'BRAND_MELT_PIZZAS',
  NULL,
  'Comida',
  'Pizza',
  '{"original_category":"Comida","original_subcategory":"Pizza","original_domain":"meltpizzas.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'papa-johns',
  'Papa Johns',
  'PAPA JOHNS',
  'BRAND_PAPA_JOHNS',
  'CL',
  'Comida',
  'Pizza',
  '{"original_category":"Comida","original_subcategory":"Pizza","original_domain":"papajohns.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'pizza-hut',
  'Pizza Hut',
  'PIZZA HUT',
  'BRAND_PIZZA_HUT',
  'CL',
  'Comida',
  'Pizza',
  '{"original_category":"Comida","original_subcategory":"Pizza","original_domain":"pizzahut.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'telepizza',
  'Telepizza',
  'TELEPIZZA',
  'BRAND_TELEPIZZA',
  'CL',
  'Comida',
  'Pizza',
  '{"original_category":"Comida","original_subcategory":"Pizza","original_domain":"telepizza.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'cobreloa',
  'Cobreloa',
  'COBRELOA',
  'BRAND_COBRELOA',
  'CL',
  'Deportes',
  'Fútbol',
  '{"original_category":"Deportes","original_subcategory":"Fútbol","original_domain":"cobreloa.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'colo-colo',
  'Colo-Colo',
  'COLOCOLO',
  'BRAND_COLOCOLO',
  'CL',
  'Deportes',
  'Fútbol',
  '{"original_category":"Deportes","original_subcategory":"Fútbol","original_domain":"colocolo.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'santiago-wanderers',
  'Santiago Wanderers',
  'SANTIAGO WANDERERS',
  'BRAND_SANTIAGO_WANDERERS',
  'CL',
  'Deportes',
  'Fútbol',
  '{"original_category":"Deportes","original_subcategory":"Fútbol","original_domain":"santiagowanderers.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'universidad-catolica',
  'Universidad Católica',
  'UNIVERSIDAD CATOLICA',
  'BRAND_UNIVERSIDAD_CATOLICA',
  'CL',
  'Deportes',
  'Fútbol',
  '{"original_category":"Deportes","original_subcategory":"Fútbol","original_domain":"lacatolica.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'universidad-de-chile',
  'Universidad de Chile',
  'UNIVERSIDAD DE CHILE',
  'BRAND_UNIVERSIDAD_DE_CHILE',
  'CL',
  'Deportes',
  'Fútbol',
  '{"original_category":"Deportes","original_subcategory":"Fútbol","original_domain":"udechile.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'union-espanola',
  'Unión Española',
  'UNION ESPANOLA',
  'BRAND_UNION_ESPANOLA',
  'CL',
  'Deportes',
  'Fútbol',
  '{"original_category":"Deportes","original_subcategory":"Fútbol","original_domain":"unionespanola.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'aiep',
  'AIEP',
  'AIEP',
  'BRAND_AIEP',
  'CL',
  'Educación',
  'Institutos',
  '{"original_category":"Educación","original_subcategory":"Institutos","original_domain":"aiep.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'duoc-uc',
  'Duoc UC',
  'DUOC UC',
  'BRAND_DUOC_UC',
  'CL',
  'Educación',
  'Institutos',
  '{"original_category":"Educación","original_subcategory":"Institutos","original_domain":"duoc.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'enac',
  'ENAC',
  'ENAC',
  'BRAND_ENAC',
  'CL',
  'Educación',
  'Institutos',
  '{"original_category":"Educación","original_subcategory":"Institutos","original_domain":"enac.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'inacap',
  'INACAP',
  'INACAP',
  'BRAND_INACAP',
  'CL',
  'Educación',
  'Institutos',
  '{"original_category":"Educación","original_subcategory":"Institutos","original_domain":"inacap.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'ipchile',
  'IPChile',
  'IPCHILE',
  'BRAND_IPCHILE',
  'CL',
  'Educación',
  'Institutos',
  '{"original_category":"Educación","original_subcategory":"Institutos","original_domain":"ipchile.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'santo-tomas',
  'Santo Tomás',
  'SANTO TOMAS',
  'BRAND_SANTO_TOMAS',
  'CL',
  'Educación',
  'Institutos',
  '{"original_category":"Educación","original_subcategory":"Institutos","original_domain":"ust.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'cpech',
  'Cpech',
  'CPECH',
  'BRAND_CPECH',
  'CL',
  'Educación',
  'Preuniversitarios',
  '{"original_category":"Educación","original_subcategory":"Preuniversitarios","original_domain":"cpech.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'filadd',
  'Filadd',
  'FILADD',
  'BRAND_FILADD',
  'CL',
  'Educación',
  'Preuniversitarios',
  '{"original_category":"Educación","original_subcategory":"Preuniversitarios","original_domain":"filadd.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'm30m',
  'M30M',
  'M30M',
  'BRAND_M30M',
  NULL,
  'Educación',
  'Preuniversitarios',
  '{"original_category":"Educación","original_subcategory":"Preuniversitarios","original_domain":"preuniversitariom30m.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'pedro-de-valdivia',
  'Pedro de Valdivia',
  'PEDRO DE VALDIVIA',
  'BRAND_PEDRO_DE_VALDIVIA',
  'CL',
  'Educación',
  'Preuniversitarios',
  '{"original_category":"Educación","original_subcategory":"Preuniversitarios","original_domain":"pdv.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'preu-uc',
  'Preu UC',
  'PREU UC',
  'BRAND_PREU_UC',
  'CL',
  'Educación',
  'Preuniversitarios',
  '{"original_category":"Educación","original_subcategory":"Preuniversitarios","original_domain":"preupdv.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'puntaje-nacional',
  'Puntaje Nacional',
  'PUNTAJE NACIONAL',
  'BRAND_PUNTAJE_NACIONAL',
  'CL',
  'Educación',
  'Preuniversitarios',
  '{"original_category":"Educación","original_subcategory":"Preuniversitarios","original_domain":"puntajenacional.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'pontificia-universidad-catolica',
  'Pontificia Universidad Católica',
  'PONTIFICIA UNIVERSIDAD CATOLICA',
  'BRAND_PONTIFICIA_UNIVERSIDAD_CATOLICA',
  'CL',
  'Educación',
  'Universidades',
  '{"original_category":"Educación","original_subcategory":"Universidades","original_domain":"uc.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'uai',
  'UAI',
  'UAI',
  'BRAND_UAI',
  'CL',
  'Educación',
  'Universidades',
  '{"original_category":"Educación","original_subcategory":"Universidades","original_domain":"uai.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'udp',
  'UDP',
  'UDP',
  'BRAND_UDP',
  'CL',
  'Educación',
  'Universidades',
  '{"original_category":"Educación","original_subcategory":"Universidades","original_domain":"udp.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'usach',
  'USACH',
  'USACH',
  'BRAND_USACH',
  'CL',
  'Educación',
  'Universidades',
  '{"original_category":"Educación","original_subcategory":"Universidades","original_domain":"usach.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'universidad-de-concepcion',
  'Universidad de Concepción',
  'UNIVERSIDAD DE CONCEPCION',
  'BRAND_UNIVERSIDAD_DE_CONCEPCION',
  'CL',
  'Educación',
  'Universidades',
  '{"original_category":"Educación","original_subcategory":"Universidades","original_domain":"udec.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'cine-hoyts',
  'Cine Hoyts',
  'CINE HOYTS',
  'BRAND_CINE_HOYTS',
  'CL',
  'Entretenimiento',
  'Cines',
  '{"original_category":"Entretenimiento","original_subcategory":"Cines","original_domain":"cinehoyts.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'cinemark',
  'Cinemark',
  'CINEMARK',
  'BRAND_CINEMARK',
  'CL',
  'Entretenimiento',
  'Cines',
  '{"original_category":"Entretenimiento","original_subcategory":"Cines","original_domain":"cinemark.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'cineplanet',
  'Cineplanet',
  'CINEPLANET',
  'BRAND_CINEPLANET',
  'CL',
  'Entretenimiento',
  'Cines',
  '{"original_category":"Entretenimiento","original_subcategory":"Cines","original_domain":"cineplanet.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'cinestar',
  'Cinestar',
  'CINESTAR',
  'BRAND_CINESTAR',
  'CL',
  'Entretenimiento',
  'Cines',
  '{"original_category":"Entretenimiento","original_subcategory":"Cines","original_domain":"cinestar.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'cinepolis',
  'Cinépolis',
  'CINEPOLIS',
  'BRAND_CINEPOLIS',
  'CL',
  'Entretenimiento',
  'Cines',
  '{"original_category":"Entretenimiento","original_subcategory":"Cines","original_domain":"cinepolis.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'muvix',
  'Muvix',
  'MUVIX',
  'BRAND_MUVIX',
  'CL',
  'Entretenimiento',
  'Cines',
  '{"original_category":"Entretenimiento","original_subcategory":"Cines","original_domain":"muvix.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'discord',
  'Discord',
  'DISCORD',
  'BRAND_DISCORD',
  NULL,
  'Entretenimiento',
  'Comunidades',
  '{"original_category":"Entretenimiento","original_subcategory":"Comunidades","original_domain":"discord.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'pinterest',
  'Pinterest',
  'PINTEREST',
  'BRAND_PINTEREST',
  NULL,
  'Entretenimiento',
  'Comunidades',
  '{"original_category":"Entretenimiento","original_subcategory":"Comunidades","original_domain":"cl.pinterest.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'quora',
  'Quora',
  'QUORA',
  'BRAND_QUORA',
  NULL,
  'Entretenimiento',
  'Comunidades',
  '{"original_category":"Entretenimiento","original_subcategory":"Comunidades","original_domain":"quora.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'reddit',
  'Reddit',
  'REDDIT',
  'BRAND_REDDIT',
  NULL,
  'Entretenimiento',
  'Comunidades',
  '{"original_category":"Entretenimiento","original_subcategory":"Comunidades","original_domain":"reddit.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'steam-community',
  'Steam Community',
  'STEAM COMMUNITY',
  'BRAND_STEAM_COMMUNITY',
  NULL,
  'Entretenimiento',
  'Comunidades',
  '{"original_category":"Entretenimiento","original_subcategory":"Comunidades","original_domain":"steamcommunity.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'tumblr',
  'Tumblr',
  'TUMBLR',
  'BRAND_TUMBLR',
  NULL,
  'Entretenimiento',
  'Comunidades',
  '{"original_category":"Entretenimiento","original_subcategory":"Comunidades","original_domain":"tumblr.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'biobiochile',
  'BioBioChile',
  'BIOBIOCHILE',
  'BRAND_BIOBIOCHILE',
  'CL',
  'Medios',
  'Prensa digital',
  '{"original_category":"Medios","original_subcategory":"Prensa digital","original_domain":"biobiochile.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'cnn-chile',
  'CNN Chile',
  'CNN CHILE',
  'BRAND_CNN_CHILE',
  NULL,
  'Medios',
  'Prensa digital',
  '{"original_category":"Medios","original_subcategory":"Prensa digital","original_domain":"cnnchile.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'cooperativa',
  'Cooperativa',
  'COOPERATIVA',
  'BRAND_COOPERATIVA',
  'CL',
  'Medios',
  'Prensa digital',
  '{"original_category":"Medios","original_subcategory":"Prensa digital","original_domain":"cooperativa.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'el-mostrador',
  'El Mostrador',
  'EL MOSTRADOR',
  'BRAND_EL_MOSTRADOR',
  'CL',
  'Medios',
  'Prensa digital',
  '{"original_category":"Medios","original_subcategory":"Prensa digital","original_domain":"elmostrador.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'emol',
  'Emol',
  'EMOL',
  'BRAND_EMOL',
  NULL,
  'Medios',
  'Prensa digital',
  '{"original_category":"Medios","original_subcategory":"Prensa digital","original_domain":"emol.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'la-tercera',
  'La Tercera',
  'LA TERCERA',
  'BRAND_LA_TERCERA',
  NULL,
  'Medios',
  'Prensa digital',
  '{"original_category":"Medios","original_subcategory":"Prensa digital","original_domain":"latercera.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'adn-radio',
  'ADN Radio',
  'ADN RADIO',
  'BRAND_ADN_RADIO',
  'CL',
  'Medios',
  'Radios',
  '{"original_category":"Medios","original_subcategory":"Radios","original_domain":"adnradio.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'carolina',
  'Carolina',
  'CAROLINA',
  'BRAND_CAROLINA',
  'CL',
  'Medios',
  'Radios',
  '{"original_category":"Medios","original_subcategory":"Radios","original_domain":"radiocarolina.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'pudahuel',
  'Pudahuel',
  'PUDAHUEL',
  'BRAND_PUDAHUEL',
  'CL',
  'Medios',
  'Radios',
  '{"original_category":"Medios","original_subcategory":"Radios","original_domain":"pudahuel.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'radio-agricultura',
  'Radio Agricultura',
  'RADIO AGRICULTURA',
  'BRAND_RADIO_AGRICULTURA',
  'CL',
  'Medios',
  'Radios',
  '{"original_category":"Medios","original_subcategory":"Radios","original_domain":"radioagricultura.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'radio-bio-bio',
  'Radio Bío Bío',
  'RADIO BIO BIO',
  'BRAND_RADIO_BIO_BIO',
  'CL',
  'Medios',
  'Radios',
  '{"original_category":"Medios","original_subcategory":"Radios","original_domain":"biobiochile.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'facebook',
  'Facebook',
  'FACEBOOK',
  'BRAND_FACEBOOK',
  NULL,
  'Medios',
  'Redes sociales',
  '{"original_category":"Medios","original_subcategory":"Redes sociales","original_domain":"facebook.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'instagram',
  'Instagram',
  'INSTAGRAM',
  'BRAND_INSTAGRAM',
  NULL,
  'Medios',
  'Redes sociales',
  '{"original_category":"Medios","original_subcategory":"Redes sociales","original_domain":"instagram.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'linkedin',
  'LinkedIn',
  'LINKEDIN',
  'BRAND_LINKEDIN',
  NULL,
  'Medios',
  'Redes sociales',
  '{"original_category":"Medios","original_subcategory":"Redes sociales","original_domain":"linkedin.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'snapchat',
  'Snapchat',
  'SNAPCHAT',
  'BRAND_SNAPCHAT',
  NULL,
  'Medios',
  'Redes sociales',
  '{"original_category":"Medios","original_subcategory":"Redes sociales","original_domain":"snapchat.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'tiktok',
  'TikTok',
  'TIKTOK',
  'BRAND_TIKTOK',
  NULL,
  'Medios',
  'Redes sociales',
  '{"original_category":"Medios","original_subcategory":"Redes sociales","original_domain":"tiktok.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'x',
  'X',
  'X',
  'BRAND_X',
  NULL,
  'Medios',
  'Redes sociales',
  '{"original_category":"Medios","original_subcategory":"Redes sociales","original_domain":"x.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'amazon-music',
  'Amazon Music',
  'AMAZON MUSIC',
  'BRAND_AMAZON_MUSIC',
  NULL,
  'Entretenimiento',
  'Streaming de música',
  '{"original_category":"Entretenimiento","original_subcategory":"Streaming de música","original_domain":"music.amazon.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'apple-music',
  'Apple Music',
  'APPLE MUSIC',
  'BRAND_APPLE_MUSIC',
  NULL,
  'Entretenimiento',
  'Streaming de música',
  '{"original_category":"Entretenimiento","original_subcategory":"Streaming de música","original_domain":"music.apple.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'deezer',
  'Deezer',
  'DEEZER',
  'BRAND_DEEZER',
  NULL,
  'Entretenimiento',
  'Streaming de música',
  '{"original_category":"Entretenimiento","original_subcategory":"Streaming de música","original_domain":"deezer.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'spotify',
  'Spotify',
  'SPOTIFY',
  'BRAND_SPOTIFY',
  NULL,
  'Entretenimiento',
  'Streaming de música',
  '{"original_category":"Entretenimiento","original_subcategory":"Streaming de música","original_domain":"spotify.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'tidal',
  'TIDAL',
  'TIDAL',
  'BRAND_TIDAL',
  NULL,
  'Entretenimiento',
  'Streaming de música',
  '{"original_category":"Entretenimiento","original_subcategory":"Streaming de música","original_domain":"tidal.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'youtube-music',
  'YouTube Music',
  'YOUTUBE MUSIC',
  'BRAND_YOUTUBE_MUSIC',
  NULL,
  'Entretenimiento',
  'Streaming de música',
  '{"original_category":"Entretenimiento","original_subcategory":"Streaming de música","original_domain":"music.youtube.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'apple-tv',
  'Apple TV+',
  'APPLE TV',
  'BRAND_APPLE_TV',
  NULL,
  'Entretenimiento',
  'Streaming de video',
  '{"original_category":"Entretenimiento","original_subcategory":"Streaming de video","original_domain":"tv.apple.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'disney',
  'Disney+',
  'DISNEY',
  'BRAND_DISNEY',
  NULL,
  'Entretenimiento',
  'Streaming de video',
  '{"original_category":"Entretenimiento","original_subcategory":"Streaming de video","original_domain":"disneyplus.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'mubi',
  'MUBI',
  'MUBI',
  'BRAND_MUBI',
  NULL,
  'Entretenimiento',
  'Streaming de video',
  '{"original_category":"Entretenimiento","original_subcategory":"Streaming de video","original_domain":"mubi.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'max',
  'Max',
  'MAX',
  'BRAND_MAX',
  NULL,
  'Entretenimiento',
  'Streaming de video',
  '{"original_category":"Entretenimiento","original_subcategory":"Streaming de video","original_domain":"max.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'netflix',
  'Netflix',
  'NETFLIX',
  'BRAND_NETFLIX',
  NULL,
  'Entretenimiento',
  'Streaming de video',
  '{"original_category":"Entretenimiento","original_subcategory":"Streaming de video","original_domain":"netflix.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'paramount',
  'Paramount+',
  'PARAMOUNT',
  'BRAND_PARAMOUNT',
  NULL,
  'Entretenimiento',
  'Streaming de video',
  '{"original_category":"Entretenimiento","original_subcategory":"Streaming de video","original_domain":"paramountplus.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'prime-video',
  'Prime Video',
  'PRIME VIDEO',
  'BRAND_PRIME_VIDEO',
  NULL,
  'Entretenimiento',
  'Streaming de video',
  '{"original_category":"Entretenimiento","original_subcategory":"Streaming de video","original_domain":"primevideo.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'universal',
  'Universal+',
  'UNIVERSAL',
  'BRAND_UNIVERSAL',
  NULL,
  'Entretenimiento',
  'Streaming de video',
  '{"original_category":"Entretenimiento","original_subcategory":"Streaming de video","original_domain":"universalplus.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'canal-13',
  'Canal 13',
  'CANAL 13',
  'BRAND_CANAL_13',
  'CL',
  'Entretenimiento',
  'TV abierta',
  '{"original_category":"Entretenimiento","original_subcategory":"TV abierta","original_domain":"13.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'chilevision',
  'Chilevisión',
  'CHILEVISION',
  'BRAND_CHILEVISION',
  'CL',
  'Entretenimiento',
  'TV abierta',
  '{"original_category":"Entretenimiento","original_subcategory":"TV abierta","original_domain":"chv.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'la-red',
  'La Red',
  'LA RED',
  'BRAND_LA_RED',
  'CL',
  'Entretenimiento',
  'TV abierta',
  '{"original_category":"Entretenimiento","original_subcategory":"TV abierta","original_domain":"lared.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'mega',
  'Mega',
  'MEGA',
  'BRAND_MEGA',
  'CL',
  'Entretenimiento',
  'TV abierta',
  '{"original_category":"Entretenimiento","original_subcategory":"TV abierta","original_domain":"mega.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'tv',
  'TV+',
  'TV',
  'BRAND_TV',
  NULL,
  'Entretenimiento',
  'TV abierta',
  '{"original_category":"Entretenimiento","original_subcategory":"TV abierta","original_domain":"","catalog_source":"excel","curation_status":"needs_review","notes":"Domain review needed."}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'tvn',
  'TVN',
  'TVN',
  'BRAND_TVN',
  'CL',
  'Entretenimiento',
  'TV abierta',
  '{"original_category":"Entretenimiento","original_subcategory":"TV abierta","original_domain":"tvn.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'bci',
  'BCI',
  'BCI',
  'BRAND_BCI',
  'CL',
  'Finanzas',
  'Bancos',
  '{"original_category":"Finanzas","original_subcategory":"Bancos","original_domain":"bci.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'banco-bice',
  'Banco BICE',
  'BANCO BICE',
  'BRAND_BANCO_BICE',
  'CL',
  'Finanzas',
  'Bancos',
  '{"original_category":"Finanzas","original_subcategory":"Bancos","original_domain":"bice.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'banco-falabella',
  'Banco Falabella',
  'BANCO FALABELLA',
  'BRAND_BANCO_FALABELLA',
  'CL',
  'Finanzas',
  'Bancos',
  '{"original_category":"Finanzas","original_subcategory":"Bancos","original_domain":"bancofalabella.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'banco-de-chile',
  'Banco de Chile',
  'BANCO DE CHILE',
  'BRAND_BANCO_DE_CHILE',
  'CL',
  'Finanzas',
  'Bancos',
  '{"original_category":"Finanzas","original_subcategory":"Bancos","original_domain":"bancochile.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'bancoestado',
  'BancoEstado',
  'BANCOESTADO',
  'BRAND_BANCOESTADO',
  'CL',
  'Finanzas',
  'Bancos',
  '{"original_category":"Finanzas","original_subcategory":"Bancos","original_domain":"bancoestado.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'consorcio',
  'Consorcio',
  'CONSORCIO',
  'BRAND_CONSORCIO',
  'CL',
  'Finanzas',
  'Bancos',
  '{"original_category":"Finanzas","original_subcategory":"Bancos","original_domain":"consorcio.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'itau',
  'Itaú',
  'ITAU',
  'BRAND_ITAU',
  'CL',
  'Finanzas',
  'Bancos',
  '{"original_category":"Finanzas","original_subcategory":"Bancos","original_domain":"itau.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'santander',
  'Santander',
  'SANTANDER',
  'BRAND_SANTANDER',
  'CL',
  'Finanzas',
  'Bancos',
  '{"original_category":"Finanzas","original_subcategory":"Bancos","original_domain":"santander.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'scotiabank',
  'Scotiabank',
  'SCOTIABANK',
  'BRAND_SCOTIABANK',
  'CL',
  'Finanzas',
  'Bancos',
  '{"original_category":"Finanzas","original_subcategory":"Bancos","original_domain":"scotiabankchile.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'security',
  'Security',
  'SECURITY',
  'BRAND_SECURITY',
  'CL',
  'Finanzas',
  'Bancos',
  '{"original_category":"Finanzas","original_subcategory":"Bancos","original_domain":"security.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'chek',
  'Chek',
  'CHEK',
  'BRAND_CHEK',
  'CL',
  'Finanzas',
  'Fintech',
  '{"original_category":"Finanzas","original_subcategory":"Fintech","original_domain":"simple.ripley.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'fintual',
  'Fintual',
  'FINTUAL',
  'BRAND_FINTUAL',
  'CL',
  'Finanzas',
  'Fintech',
  '{"original_category":"Finanzas","original_subcategory":"Fintech","original_domain":"fintual.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'global66',
  'Global66',
  'GLOBAL66',
  'BRAND_GLOBAL66',
  NULL,
  'Finanzas',
  'Fintech',
  '{"original_category":"Finanzas","original_subcategory":"Fintech","original_domain":"global66.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'mach',
  'MACH',
  'MACH',
  'BRAND_MACH',
  NULL,
  'Finanzas',
  'Fintech',
  '{"original_category":"Finanzas","original_subcategory":"Fintech","original_domain":"somosmach.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'mercado-pago',
  'Mercado Pago',
  'MERCADO PAGO',
  'BRAND_MERCADO_PAGO',
  'CL',
  'Finanzas',
  'Fintech',
  '{"original_category":"Finanzas","original_subcategory":"Fintech","original_domain":"mercadopago.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'prex',
  'Prex',
  'PREX',
  'BRAND_PREX',
  'CL',
  'Finanzas',
  'Fintech',
  '{"original_category":"Finanzas","original_subcategory":"Fintech","original_domain":"prexcard.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'tapp',
  'Tapp',
  'TAPP',
  'BRAND_TAPP',
  'CL',
  'Finanzas',
  'Fintech',
  '{"original_category":"Finanzas","original_subcategory":"Fintech","original_domain":"tapp.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'tenpo',
  'Tenpo',
  'TENPO',
  'BRAND_TENPO',
  'CL',
  'Finanzas',
  'Fintech',
  '{"original_category":"Finanzas","original_subcategory":"Fintech","original_domain":"tenpo.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'bice-inversiones',
  'BICE Inversiones',
  'BICE INVERSIONES',
  'BRAND_BICE_INVERSIONES',
  'CL',
  'Finanzas',
  'Inversiones',
  '{"original_category":"Finanzas","original_subcategory":"Inversiones","original_domain":"biceinversiones.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'btg-pactual',
  'BTG Pactual',
  'BTG PACTUAL',
  'BRAND_BTG_PACTUAL',
  'CL',
  'Finanzas',
  'Inversiones',
  '{"original_category":"Finanzas","original_subcategory":"Inversiones","original_domain":"btgpactual.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'banchile-inversiones',
  'Banchile Inversiones',
  'BANCHILE INVERSIONES',
  'BRAND_BANCHILE_INVERSIONES',
  'CL',
  'Finanzas',
  'Inversiones',
  '{"original_category":"Finanzas","original_subcategory":"Inversiones","original_domain":"banchileinversiones.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'larrainvial',
  'LarrainVial',
  'LARRAINVIAL',
  'BRAND_LARRAINVIAL',
  NULL,
  'Finanzas',
  'Inversiones',
  '{"original_category":"Finanzas","original_subcategory":"Inversiones","original_domain":"larrainvial.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'mbi',
  'MBI',
  'MBI',
  'BRAND_MBI',
  'CL',
  'Finanzas',
  'Inversiones',
  '{"original_category":"Finanzas","original_subcategory":"Inversiones","original_domain":"mbi.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'renta4',
  'Renta4',
  'RENTA4',
  'BRAND_RENTA4',
  'CL',
  'Finanzas',
  'Inversiones',
  '{"original_category":"Finanzas","original_subcategory":"Inversiones","original_domain":"renta4.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'santander-corredora',
  'Santander Corredora',
  'SANTANDER CORREDORA',
  'BRAND_SANTANDER_CORREDORA',
  'CL',
  'Finanzas',
  'Inversiones',
  '{"original_category":"Finanzas","original_subcategory":"Inversiones","original_domain":"santander.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'american-express',
  'American Express',
  'AMERICAN EXPRESS',
  'BRAND_AMERICAN_EXPRESS',
  NULL,
  'Finanzas',
  'Medios de Pago',
  '{"original_category":"Finanzas","original_subcategory":"Medios de Pago","original_domain":"americanexpress.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'cmr-falabella',
  'CMR Falabella',
  'CMR FALABELLA',
  'BRAND_CMR_FALABELLA',
  NULL,
  'Finanzas',
  'Medios de Pago',
  '{"original_category":"Finanzas","original_subcategory":"Medios de Pago","original_domain":"cmrfalabella.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'getnet',
  'Getnet',
  'GETNET',
  'BRAND_GETNET',
  'CL',
  'Finanzas',
  'Medios de Pago',
  '{"original_category":"Finanzas","original_subcategory":"Medios de Pago","original_domain":"getnet.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'mastercard',
  'Mastercard',
  'MASTERCARD',
  'BRAND_MASTERCARD',
  'CL',
  'Finanzas',
  'Medios de Pago',
  '{"original_category":"Finanzas","original_subcategory":"Medios de Pago","original_domain":"mastercard.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'redcompra',
  'Redcompra',
  'REDCOMPRA',
  'BRAND_REDCOMPRA',
  'CL',
  'Finanzas',
  'Medios de Pago',
  '{"original_category":"Finanzas","original_subcategory":"Medios de Pago","original_domain":"redcompra.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'visa',
  'Visa',
  'VISA',
  'BRAND_VISA',
  NULL,
  'Finanzas',
  'Medios de Pago',
  '{"original_category":"Finanzas","original_subcategory":"Medios de Pago","original_domain":"visa.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'webpay',
  'Webpay',
  'WEBPAY',
  'BRAND_WEBPAY',
  'CL',
  'Finanzas',
  'Medios de Pago',
  '{"original_category":"Finanzas","original_subcategory":"Medios de Pago","original_domain":"webpay.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'dyson',
  'Dyson',
  'DYSON',
  'BRAND_DYSON',
  'CL',
  'Hogar',
  'Aspiradoras',
  '{"original_category":"Hogar","original_subcategory":"Aspiradoras","original_domain":"dyson.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'electrolux',
  'Electrolux',
  'ELECTROLUX',
  'BRAND_ELECTROLUX',
  'CL',
  'Hogar',
  'Aspiradoras',
  '{"original_category":"Hogar","original_subcategory":"Aspiradoras","original_domain":"electrolux.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'philips',
  'Philips',
  'PHILIPS',
  'BRAND_PHILIPS',
  'CL',
  'Hogar',
  'Aspiradoras',
  '{"original_category":"Hogar","original_subcategory":"Aspiradoras","original_domain":"philips.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'thomas',
  'Thomas',
  'THOMAS',
  'BRAND_THOMAS',
  'CL',
  'Hogar',
  'Aspiradoras',
  '{"original_category":"Hogar","original_subcategory":"Aspiradoras","original_domain":"thomas.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'ursus-trotter',
  'Ursus Trotter',
  'URSUS TROTTER',
  'BRAND_URSUS_TROTTER',
  'CL',
  'Hogar',
  'Aspiradoras',
  '{"original_category":"Hogar","original_subcategory":"Aspiradoras","original_domain":"ursustrotter.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'xiaomi',
  'Xiaomi',
  'XIAOMI',
  'BRAND_XIAOMI',
  'CL',
  'Hogar',
  'Aspiradoras',
  '{"original_category":"Hogar","original_subcategory":"Aspiradoras","original_domain":"xiaomi.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'cic',
  'CIC',
  'CIC',
  'BRAND_CIC',
  'CL',
  'Hogar',
  'Colchones',
  '{"original_category":"Hogar","original_subcategory":"Colchones","original_domain":"cic.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'drimkip',
  'Drimkip',
  'DRIMKIP',
  'BRAND_DRIMKIP',
  'CL',
  'Hogar',
  'Colchones',
  '{"original_category":"Hogar","original_subcategory":"Colchones","original_domain":"drimkip.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'emma',
  'Emma',
  'EMMA',
  'BRAND_EMMA',
  'CL',
  'Hogar',
  'Colchones',
  '{"original_category":"Hogar","original_subcategory":"Colchones","original_domain":"emma-colchon.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'flex',
  'Flex',
  'FLEX',
  'BRAND_FLEX',
  'CL',
  'Hogar',
  'Colchones',
  '{"original_category":"Hogar","original_subcategory":"Colchones","original_domain":"flex.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'mantahue',
  'Mantahue',
  'MANTAHUE',
  'BRAND_MANTAHUE',
  'CL',
  'Hogar',
  'Colchones',
  '{"original_category":"Hogar","original_subcategory":"Colchones","original_domain":"mantahue.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'rosen',
  'Rosen',
  'ROSEN',
  'BRAND_ROSEN',
  'CL',
  'Hogar',
  'Colchones',
  '{"original_category":"Hogar","original_subcategory":"Colchones","original_domain":"rosen.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'bosch',
  'Bosch',
  'BOSCH',
  'BRAND_BOSCH',
  'CL',
  'Hogar',
  'Lavadoras',
  '{"original_category":"Hogar","original_subcategory":"Lavadoras","original_domain":"bosch.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'fensa',
  'Fensa',
  'FENSA',
  'BRAND_FENSA',
  'CL',
  'Hogar',
  'Lavadoras',
  '{"original_category":"Hogar","original_subcategory":"Lavadoras","original_domain":"fensa.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'lg',
  'LG',
  'LG',
  'BRAND_LG',
  NULL,
  'Hogar',
  'Lavadoras',
  '{"original_category":"Hogar","original_subcategory":"Lavadoras","original_domain":"lg.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'midea',
  'Midea',
  'MIDEA',
  'BRAND_MIDEA',
  'CL',
  'Hogar',
  'Lavadoras',
  '{"original_category":"Hogar","original_subcategory":"Lavadoras","original_domain":"midea.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'samsung',
  'Samsung',
  'SAMSUNG',
  'BRAND_SAMSUNG',
  NULL,
  'Hogar',
  'Lavadoras',
  '{"original_category":"Hogar","original_subcategory":"Lavadoras","original_domain":"samsung.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'whirlpool',
  'Whirlpool',
  'WHIRLPOOL',
  'BRAND_WHIRLPOOL',
  'CL',
  'Hogar',
  'Lavadoras',
  '{"original_category":"Hogar","original_subcategory":"Lavadoras","original_domain":"whirlpool.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'acana',
  'Acana',
  'ACANA',
  'BRAND_ACANA',
  NULL,
  'Mascotas',
  'Alimento para gatos',
  '{"original_category":"Mascotas","original_subcategory":"Alimento para gatos","original_domain":"acana.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'bravery',
  'Bravery',
  'BRAVERY',
  'BRAND_BRAVERY',
  'CL',
  'Mascotas',
  'Alimento para gatos',
  '{"original_category":"Mascotas","original_subcategory":"Alimento para gatos","original_domain":"bravery.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'cat-chow',
  'Cat Chow',
  'CAT CHOW',
  'BRAND_CAT_CHOW',
  'CL',
  'Mascotas',
  'Alimento para gatos',
  '{"original_category":"Mascotas","original_subcategory":"Alimento para gatos","original_domain":"purina.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'pro-plan',
  'Pro Plan',
  'PRO PLAN',
  'BRAND_PRO_PLAN',
  NULL,
  'Mascotas',
  'Alimento para gatos',
  '{"original_category":"Mascotas","original_subcategory":"Alimento para gatos","original_domain":"","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'royal-canin',
  'Royal Canin',
  'ROYAL CANIN',
  'BRAND_ROYAL_CANIN',
  NULL,
  'Mascotas',
  'Alimento para gatos',
  '{"original_category":"Mascotas","original_subcategory":"Alimento para gatos","original_domain":"royalcanin.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'whiskas',
  'Whiskas',
  'WHISKAS',
  'BRAND_WHISKAS',
  'CL',
  'Mascotas',
  'Alimento para gatos',
  '{"original_category":"Mascotas","original_subcategory":"Alimento para gatos","original_domain":"whiskas.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'dog-chow',
  'Dog Chow',
  'DOG CHOW',
  'BRAND_DOG_CHOW',
  NULL,
  'Mascotas',
  'Alimento para perros',
  '{"original_category":"Mascotas","original_subcategory":"Alimento para perros","original_domain":"","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'pedigree',
  'Pedigree',
  'PEDIGREE',
  'BRAND_PEDIGREE',
  'CL',
  'Mascotas',
  'Alimento para perros',
  '{"original_category":"Mascotas","original_subcategory":"Alimento para perros","original_domain":"pedigree.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'clinica-veterinaria-alemana',
  'Clínica Veterinaria Alemana',
  'CLINICA VETERINARIA ALEMANA',
  'BRAND_CLINICA_VETERINARIA_ALEMANA',
  'CL',
  'Mascotas',
  'Clínicas veterinarias',
  '{"original_category":"Mascotas","original_subcategory":"Clínicas veterinarias","original_domain":"cv-alemana.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'hospital-clinico-veterinario-u-de-chile',
  'Hospital Clínico Veterinario U. de Chile',
  'HOSPITAL CLINICO VETERINARIO U DE CHILE',
  'BRAND_HOSPITAL_CLINICO_VETERINARIO_U_DE_CHILE',
  'CL',
  'Mascotas',
  'Clínicas veterinarias',
  '{"original_category":"Mascotas","original_subcategory":"Clínicas veterinarias","original_domain":"hcv.uchile.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'petsalud',
  'PetSalud',
  'PETSALUD',
  'BRAND_PETSALUD',
  'CL',
  'Mascotas',
  'Clínicas veterinarias',
  '{"original_category":"Mascotas","original_subcategory":"Clínicas veterinarias","original_domain":"petsalud.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'vet24',
  'Vet24',
  'VET24',
  'BRAND_VET24',
  'CL',
  'Mascotas',
  'Clínicas veterinarias',
  '{"original_category":"Mascotas","original_subcategory":"Clínicas veterinarias","original_domain":"vet24.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'vetpoint',
  'VetPoint',
  'VETPOINT',
  'BRAND_VETPOINT',
  'CL',
  'Mascotas',
  'Clínicas veterinarias',
  '{"original_category":"Mascotas","original_subcategory":"Clínicas veterinarias","original_domain":"vetpoint.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'vets',
  'Vets',
  'VETS',
  'BRAND_VETS',
  'CL',
  'Mascotas',
  'Clínicas veterinarias',
  '{"original_category":"Mascotas","original_subcategory":"Clínicas veterinarias","original_domain":"vets.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'club-de-perros-y-gatos',
  'Club de Perros y Gatos',
  'CLUB DE PERROS Y GATOS',
  'BRAND_CLUB_DE_PERROS_Y_GATOS',
  'CL',
  'Mascotas',
  'Tiendas de mascotas',
  '{"original_category":"Mascotas","original_subcategory":"Tiendas de mascotas","original_domain":"clubdeperrosygatos.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'maspet',
  'Maspet',
  'MASPET',
  'BRAND_MASPET',
  'CL',
  'Mascotas',
  'Tiendas de mascotas',
  '{"original_category":"Mascotas","original_subcategory":"Tiendas de mascotas","original_domain":"maspet.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'pet-bj',
  'Pet BJ',
  'PET BJ',
  'BRAND_PET_BJ',
  'CL',
  'Mascotas',
  'Tiendas de mascotas',
  '{"original_category":"Mascotas","original_subcategory":"Tiendas de mascotas","original_domain":"petbj.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'pet-happy',
  'Pet Happy',
  'PET HAPPY',
  'BRAND_PET_HAPPY',
  'CL',
  'Mascotas',
  'Tiendas de mascotas',
  '{"original_category":"Mascotas","original_subcategory":"Tiendas de mascotas","original_domain":"pethappy.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'petslandia',
  'Petslandia',
  'PETSLANDIA',
  'BRAND_PETSLANDIA',
  'CL',
  'Mascotas',
  'Tiendas de mascotas',
  '{"original_category":"Mascotas","original_subcategory":"Tiendas de mascotas","original_domain":"petslandia.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'superzoo',
  'SuperZoo',
  'SUPERZOO',
  'BRAND_SUPERZOO',
  'CL',
  'Mascotas',
  'Tiendas de mascotas',
  '{"original_category":"Mascotas","original_subcategory":"Tiendas de mascotas","original_domain":"superzoo.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'amphora',
  'Amphora',
  'AMPHORA',
  'BRAND_AMPHORA',
  'CL',
  'Moda',
  'Accesorios',
  '{"original_category":"Moda","original_subcategory":"Accesorios","original_domain":"amphora.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'pandora',
  'Pandora',
  'PANDORA',
  'BRAND_PANDORA',
  NULL,
  'Moda',
  'Accesorios',
  '{"original_category":"Moda","original_subcategory":"Accesorios","original_domain":"pandoraoficial.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'saxoline',
  'Saxoline',
  'SAXOLINE',
  'BRAND_SAXOLINE',
  'CL',
  'Moda',
  'Accesorios',
  '{"original_category":"Moda","original_subcategory":"Accesorios","original_domain":"saxoline.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'secret',
  'Secret',
  'SECRET',
  'BRAND_SECRET',
  'CL',
  'Moda',
  'Accesorios',
  '{"original_category":"Moda","original_subcategory":"Accesorios","original_domain":"secret.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'swarovski',
  'Swarovski',
  'SWAROVSKI',
  'BRAND_SWAROVSKI',
  NULL,
  'Moda',
  'Accesorios',
  '{"original_category":"Moda","original_subcategory":"Accesorios","original_domain":"swarovski.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'tous',
  'Tous',
  'TOUS',
  'BRAND_TOUS',
  NULL,
  'Moda',
  'Accesorios',
  '{"original_category":"Moda","original_subcategory":"Accesorios","original_domain":"tous.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'aldo',
  'Aldo',
  'ALDO',
  'BRAND_ALDO',
  NULL,
  'Moda',
  'Calzado',
  '{"original_category":"Moda","original_subcategory":"Calzado","original_domain":"aldoshoes.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'bata',
  'Bata',
  'BATA',
  'BRAND_BATA',
  'CL',
  'Moda',
  'Calzado',
  '{"original_category":"Moda","original_subcategory":"Calzado","original_domain":"bata.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'guante',
  'Guante',
  'GUANTE',
  'BRAND_GUANTE',
  'CL',
  'Moda',
  'Calzado',
  '{"original_category":"Moda","original_subcategory":"Calzado","original_domain":"guante.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'hush-puppies',
  'Hush Puppies',
  'HUSH PUPPIES',
  'BRAND_HUSH_PUPPIES',
  'CL',
  'Moda',
  'Calzado',
  '{"original_category":"Moda","original_subcategory":"Calzado","original_domain":"hushpuppies.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'nike',
  'Nike',
  'NIKE',
  'BRAND_NIKE',
  NULL,
  'Moda',
  'Calzado',
  '{"original_category":"Moda","original_subcategory":"Calzado","original_domain":"nike.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'skechers',
  'Skechers',
  'SKECHERS',
  'BRAND_SKECHERS',
  'CL',
  'Moda',
  'Calzado',
  '{"original_category":"Moda","original_subcategory":"Calzado","original_domain":"skechers.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'adidas',
  'adidas',
  'ADIDAS',
  'BRAND_ADIDAS',
  'CL',
  'Moda',
  'Calzado',
  '{"original_category":"Moda","original_subcategory":"Calzado","original_domain":"adidas.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'decathlon',
  'Decathlon',
  'DECATHLON',
  'BRAND_DECATHLON',
  'CL',
  'Moda',
  'Deportivo',
  '{"original_category":"Moda","original_subcategory":"Deportivo","original_domain":"decathlon.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'new-balance',
  'New Balance',
  'NEW BALANCE',
  'BRAND_NEW_BALANCE',
  'CL',
  'Moda',
  'Deportivo',
  '{"original_category":"Moda","original_subcategory":"Deportivo","original_domain":"newbalance.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'puma',
  'Puma',
  'PUMA',
  'BRAND_PUMA',
  NULL,
  'Moda',
  'Deportivo',
  '{"original_category":"Moda","original_subcategory":"Deportivo","original_domain":"puma.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'reebok',
  'Reebok',
  'REEBOK',
  'BRAND_REEBOK',
  NULL,
  'Moda',
  'Deportivo',
  '{"original_category":"Moda","original_subcategory":"Deportivo","original_domain":"reebok.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'sparta',
  'Sparta',
  'SPARTA',
  'BRAND_SPARTA',
  'CL',
  'Moda',
  'Deportivo',
  '{"original_category":"Moda","original_subcategory":"Deportivo","original_domain":"sparta.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'under-armour',
  'Under Armour',
  'UNDER ARMOUR',
  'BRAND_UNDER_ARMOUR',
  'CL',
  'Moda',
  'Deportivo',
  '{"original_category":"Moda","original_subcategory":"Deportivo","original_domain":"underarmour.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'bershka',
  'Bershka',
  'BERSHKA',
  'BRAND_BERSHKA',
  NULL,
  'Moda',
  'Fast fashion',
  '{"original_category":"Moda","original_subcategory":"Fast fashion","original_domain":"bershka.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'forever-21',
  'Forever 21',
  'FOREVER 21',
  'BRAND_FOREVER_21',
  NULL,
  'Moda',
  'Fast fashion',
  '{"original_category":"Moda","original_subcategory":"Fast fashion","original_domain":"forever21.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'h-m',
  'H&M',
  'HM',
  'BRAND_HM',
  NULL,
  'Moda',
  'Fast fashion',
  '{"original_category":"Moda","original_subcategory":"Fast fashion","original_domain":"cl.hm.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'mango',
  'Mango',
  'MANGO',
  'BRAND_MANGO',
  NULL,
  'Moda',
  'Fast fashion',
  '{"original_category":"Moda","original_subcategory":"Fast fashion","original_domain":"shop.mango.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'pull-bear',
  'Pull&Bear',
  'PULLBEAR',
  'BRAND_PULLBEAR',
  NULL,
  'Moda',
  'Fast fashion',
  '{"original_category":"Moda","original_subcategory":"Fast fashion","original_domain":"pullandbear.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'stradivarius',
  'Stradivarius',
  'STRADIVARIUS',
  'BRAND_STRADIVARIUS',
  NULL,
  'Moda',
  'Fast fashion',
  '{"original_category":"Moda","original_subcategory":"Fast fashion","original_domain":"stradivarius.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'zara',
  'Zara',
  'ZARA',
  'BRAND_ZARA',
  NULL,
  'Moda',
  'Fast fashion',
  '{"original_category":"Moda","original_subcategory":"Fast fashion","original_domain":"zara.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'columbia',
  'Columbia',
  'COLUMBIA',
  'BRAND_COLUMBIA',
  'CL',
  'Moda',
  'Outdoor',
  '{"original_category":"Moda","original_subcategory":"Outdoor","original_domain":"columbiachile.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'doite',
  'Doite',
  'DOITE',
  'BRAND_DOITE',
  'CL',
  'Moda',
  'Outdoor',
  '{"original_category":"Moda","original_subcategory":"Outdoor","original_domain":"doite.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'lippi',
  'Lippi',
  'LIPPI',
  'BRAND_LIPPI',
  NULL,
  'Moda',
  'Outdoor',
  '{"original_category":"Moda","original_subcategory":"Outdoor","original_domain":"lippioutdoor.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'marmot',
  'Marmot',
  'MARMOT',
  'BRAND_MARMOT',
  'CL',
  'Moda',
  'Outdoor',
  '{"original_category":"Moda","original_subcategory":"Outdoor","original_domain":"marmot.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'patagonia',
  'Patagonia',
  'PATAGONIA',
  'BRAND_PATAGONIA',
  NULL,
  'Moda',
  'Outdoor',
  '{"original_category":"Moda","original_subcategory":"Outdoor","original_domain":"patagonia.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'the-north-face',
  'The North Face',
  'THE NORTH FACE',
  'BRAND_THE_NORTH_FACE',
  'CL',
  'Moda',
  'Outdoor',
  '{"original_category":"Moda","original_subcategory":"Outdoor","original_domain":"thenorthface.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'family-shop',
  'Family Shop',
  'FAMILY SHOP',
  'BRAND_FAMILY_SHOP',
  'CL',
  'Moda',
  'Ropa básica',
  '{"original_category":"Moda","original_subcategory":"Ropa básica","original_domain":"familyshop.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'sybilla',
  'Sybilla',
  'SYBILLA',
  'BRAND_SYBILLA',
  NULL,
  'Moda',
  'Ropa básica',
  '{"original_category":"Moda","original_subcategory":"Ropa básica","original_domain":"falabella.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'tricot',
  'Tricot',
  'TRICOT',
  'BRAND_TRICOT',
  'CL',
  'Moda',
  'Ropa básica',
  '{"original_category":"Moda","original_subcategory":"Ropa básica","original_domain":"tricot.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'aliexpress',
  'AliExpress',
  'ALIEXPRESS',
  'BRAND_ALIEXPRESS',
  NULL,
  'Retail',
  'Marketplaces',
  '{"original_category":"Retail","original_subcategory":"Marketplaces","original_domain":"aliexpress.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'amazon',
  'Amazon',
  'AMAZON',
  'BRAND_AMAZON',
  NULL,
  'Retail',
  'Marketplaces',
  '{"original_category":"Retail","original_subcategory":"Marketplaces","original_domain":"amazon.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'falabella',
  'Falabella',
  'FALABELLA',
  'BRAND_FALABELLA',
  NULL,
  'Retail',
  'Marketplaces',
  '{"original_category":"Retail","original_subcategory":"Marketplaces","original_domain":"falabella.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'linio',
  'Linio',
  'LINIO',
  'BRAND_LINIO',
  'CL',
  'Retail',
  'Marketplaces',
  '{"original_category":"Retail","original_subcategory":"Marketplaces","original_domain":"linio.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'mercado-libre',
  'Mercado Libre',
  'MERCADO LIBRE',
  'BRAND_MERCADO_LIBRE',
  'CL',
  'Retail',
  'Marketplaces',
  '{"original_category":"Retail","original_subcategory":"Marketplaces","original_domain":"mercadolibre.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'paris',
  'Paris',
  'PARIS',
  'BRAND_PARIS',
  'CL',
  'Retail',
  'Marketplaces',
  '{"original_category":"Retail","original_subcategory":"Marketplaces","original_domain":"paris.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'ripley',
  'Ripley',
  'RIPLEY',
  'BRAND_RIPLEY',
  'CL',
  'Retail',
  'Marketplaces',
  '{"original_category":"Retail","original_subcategory":"Marketplaces","original_domain":"ripley.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'chilemat',
  'Chilemat',
  'CHILEMAT',
  'BRAND_CHILEMAT',
  'CL',
  'Retail',
  'Mejoramiento del hogar',
  '{"original_category":"Retail","original_subcategory":"Mejoramiento del hogar","original_domain":"chilemat.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'construmart',
  'Construmart',
  'CONSTRUMART',
  'BRAND_CONSTRUMART',
  'CL',
  'Retail',
  'Mejoramiento del hogar',
  '{"original_category":"Retail","original_subcategory":"Mejoramiento del hogar","original_domain":"construmart.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'easy',
  'Easy',
  'EASY',
  'BRAND_EASY',
  'CL',
  'Retail',
  'Mejoramiento del hogar',
  '{"original_category":"Retail","original_subcategory":"Mejoramiento del hogar","original_domain":"easy.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'imperial',
  'Imperial',
  'IMPERIAL',
  'BRAND_IMPERIAL',
  'CL',
  'Retail',
  'Mejoramiento del hogar',
  '{"original_category":"Retail","original_subcategory":"Mejoramiento del hogar","original_domain":"imperial.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'mts',
  'MTS',
  'MTS',
  'BRAND_MTS',
  'CL',
  'Retail',
  'Mejoramiento del hogar',
  '{"original_category":"Retail","original_subcategory":"Mejoramiento del hogar","original_domain":"mts.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'sodimac',
  'Sodimac',
  'SODIMAC',
  'BRAND_SODIMAC',
  'CL',
  'Retail',
  'Mejoramiento del hogar',
  '{"original_category":"Retail","original_subcategory":"Mejoramiento del hogar","original_domain":"sodimac.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'abc',
  'ABC',
  'ABC',
  'BRAND_ABC',
  'CL',
  'Retail',
  'Multitiendas',
  '{"original_category":"Retail","original_subcategory":"Multitiendas","original_domain":"abc.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'hites',
  'Hites',
  'HITES',
  'BRAND_HITES',
  NULL,
  'Retail',
  'Multitiendas',
  '{"original_category":"Retail","original_subcategory":"Multitiendas","original_domain":"hites.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'la-polar',
  'La Polar',
  'LA POLAR',
  'BRAND_LA_POLAR',
  'CL',
  'Retail',
  'Multitiendas',
  '{"original_category":"Retail","original_subcategory":"Multitiendas","original_domain":"lapolar.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'alvi',
  'Alvi',
  'ALVI',
  'BRAND_ALVI',
  'CL',
  'Retail',
  'Supermercados',
  '{"original_category":"Retail","original_subcategory":"Supermercados","original_domain":"alvi.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'jumbo',
  'Jumbo',
  'JUMBO',
  'BRAND_JUMBO',
  'CL',
  'Retail',
  'Supermercados',
  '{"original_category":"Retail","original_subcategory":"Supermercados","original_domain":"jumbo.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'lider',
  'Líder',
  'LIDER',
  'BRAND_LIDER',
  'CL',
  'Retail',
  'Supermercados',
  '{"original_category":"Retail","original_subcategory":"Supermercados","original_domain":"lider.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'santa-isabel',
  'Santa Isabel',
  'SANTA ISABEL',
  'BRAND_SANTA_ISABEL',
  'CL',
  'Retail',
  'Supermercados',
  '{"original_category":"Retail","original_subcategory":"Supermercados","original_domain":"santaisabel.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'tottus',
  'Tottus',
  'TOTTUS',
  'BRAND_TOTTUS',
  'CL',
  'Retail',
  'Supermercados',
  '{"original_category":"Retail","original_subcategory":"Supermercados","original_domain":"tottus.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'unimarc',
  'Unimarc',
  'UNIMARC',
  'BRAND_UNIMARC',
  'CL',
  'Retail',
  'Supermercados',
  '{"original_category":"Retail","original_subcategory":"Supermercados","original_domain":"unimarc.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'acuenta',
  'aCuenta',
  'ACUENTA',
  'BRAND_ACUENTA',
  'CL',
  'Retail',
  'Supermercados',
  '{"original_category":"Retail","original_subcategory":"Supermercados","original_domain":"acuenta.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'maconline',
  'MacOnline',
  'MACONLINE',
  'BRAND_MACONLINE',
  NULL,
  'Retail',
  'Tiendas de tecnología',
  '{"original_category":"Retail","original_subcategory":"Tiendas de tecnología","original_domain":"maconline.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'pc-factory',
  'PC Factory',
  'PC FACTORY',
  'BRAND_PC_FACTORY',
  'CL',
  'Retail',
  'Tiendas de tecnología',
  '{"original_category":"Retail","original_subcategory":"Tiendas de tecnología","original_domain":"pcfactory.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'reifstore',
  'Reifstore',
  'REIFSTORE',
  'BRAND_REIFSTORE',
  'CL',
  'Retail',
  'Tiendas de tecnología',
  '{"original_category":"Retail","original_subcategory":"Tiendas de tecnología","original_domain":"reifstore.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'sp-digital',
  'SP Digital',
  'SP DIGITAL',
  'BRAND_SP_DIGITAL',
  'CL',
  'Retail',
  'Tiendas de tecnología',
  '{"original_category":"Retail","original_subcategory":"Tiendas de tecnología","original_domain":"spdigital.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'weplay',
  'WePlay',
  'WEPLAY',
  'BRAND_WEPLAY',
  'CL',
  'Retail',
  'Tiendas de tecnología',
  '{"original_category":"Retail","original_subcategory":"Tiendas de tecnología","original_domain":"weplay.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'bupa',
  'Bupa',
  'BUPA',
  'BRAND_BUPA',
  'CL',
  'Salud',
  'Centros médicos',
  '{"original_category":"Salud","original_subcategory":"Centros médicos","original_domain":"bupa.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'integramedica',
  'IntegraMédica',
  'INTEGRAMEDICA',
  'BRAND_INTEGRAMEDICA',
  'CL',
  'Salud',
  'Centros médicos',
  '{"original_category":"Salud","original_subcategory":"Centros médicos","original_domain":"integramedica.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'megasalud',
  'Megasalud',
  'MEGASALUD',
  'BRAND_MEGASALUD',
  'CL',
  'Salud',
  'Centros médicos',
  '{"original_category":"Salud","original_subcategory":"Centros médicos","original_domain":"megasalud.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'redsalud',
  'RedSalud',
  'REDSALUD',
  'BRAND_REDSALUD',
  'CL',
  'Salud',
  'Centros médicos',
  '{"original_category":"Salud","original_subcategory":"Centros médicos","original_domain":"redsalud.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'uc-christus',
  'UC Christus',
  'UC CHRISTUS',
  'BRAND_UC_CHRISTUS',
  'CL',
  'Salud',
  'Centros médicos',
  '{"original_category":"Salud","original_subcategory":"Centros médicos","original_domain":"ucchristus.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'vidaintegra',
  'Vidaintegra',
  'VIDAINTEGRA',
  'BRAND_VIDAINTEGRA',
  'CL',
  'Salud',
  'Centros médicos',
  '{"original_category":"Salud","original_subcategory":"Centros médicos","original_domain":"vidaintegra.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'clinica-alemana',
  'Clínica Alemana',
  'CLINICA ALEMANA',
  'BRAND_CLINICA_ALEMANA',
  'CL',
  'Salud',
  'Clínicas',
  '{"original_category":"Salud","original_subcategory":"Clínicas","original_domain":"alemana.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'clinica-indisa',
  'Clínica Indisa',
  'CLINICA INDISA',
  'BRAND_CLINICA_INDISA',
  'CL',
  'Salud',
  'Clínicas',
  '{"original_category":"Salud","original_subcategory":"Clínicas","original_domain":"indisa.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'clinica-las-condes',
  'Clínica Las Condes',
  'CLINICA LAS CONDES',
  'BRAND_CLINICA_LAS_CONDES',
  'CL',
  'Salud',
  'Clínicas',
  '{"original_category":"Salud","original_subcategory":"Clínicas","original_domain":"clc.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'clinica-meds',
  'Clínica MEDS',
  'CLINICA MEDS',
  'BRAND_CLINICA_MEDS',
  'CL',
  'Salud',
  'Clínicas',
  '{"original_category":"Salud","original_subcategory":"Clínicas","original_domain":"meds.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'clinica-santa-maria',
  'Clínica Santa María',
  'CLINICA SANTA MARIA',
  'BRAND_CLINICA_SANTA_MARIA',
  'CL',
  'Salud',
  'Clínicas',
  '{"original_category":"Salud","original_subcategory":"Clínicas","original_domain":"clinicasantamaria.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'cruz-verde',
  'Cruz Verde',
  'CRUZ VERDE',
  'BRAND_CRUZ_VERDE',
  'CL',
  'Salud',
  'Farmacias',
  '{"original_category":"Salud","original_subcategory":"Farmacias","original_domain":"cruzverde.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'dr-simi',
  'Dr. Simi',
  'DR SIMI',
  'BRAND_DR_SIMI',
  'CL',
  'Salud',
  'Farmacias',
  '{"original_category":"Salud","original_subcategory":"Farmacias","original_domain":"drsimi.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'farmacias-ahumada',
  'Farmacias Ahumada',
  'FARMACIAS AHUMADA',
  'BRAND_FARMACIAS_AHUMADA',
  'CL',
  'Salud',
  'Farmacias',
  '{"original_category":"Salud","original_subcategory":"Farmacias","original_domain":"farmaciasahumada.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'fraccion',
  'Fracción',
  'FRACCION',
  'BRAND_FRACCION',
  'CL',
  'Salud',
  'Farmacias',
  '{"original_category":"Salud","original_subcategory":"Farmacias","original_domain":"farmaciafraccion.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'knop',
  'Knop',
  'KNOP',
  'BRAND_KNOP',
  'CL',
  'Salud',
  'Farmacias',
  '{"original_category":"Salud","original_subcategory":"Farmacias","original_domain":"knop.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'salcobrand',
  'Salcobrand',
  'SALCOBRAND',
  'BRAND_SALCOBRAND',
  'CL',
  'Salud',
  'Farmacias',
  '{"original_category":"Salud","original_subcategory":"Farmacias","original_domain":"salcobrand.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'banmedica',
  'Banmédica',
  'BANMEDICA',
  'BRAND_BANMEDICA',
  'CL',
  'Salud',
  'Isapres',
  '{"original_category":"Salud","original_subcategory":"Isapres","original_domain":"banmedica.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'colmena',
  'Colmena',
  'COLMENA',
  'BRAND_COLMENA',
  'CL',
  'Salud',
  'Isapres',
  '{"original_category":"Salud","original_subcategory":"Isapres","original_domain":"colmena.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'consalud',
  'Consalud',
  'CONSALUD',
  'BRAND_CONSALUD',
  'CL',
  'Salud',
  'Isapres',
  '{"original_category":"Salud","original_subcategory":"Isapres","original_domain":"consalud.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'cruz-blanca',
  'Cruz Blanca',
  'CRUZ BLANCA',
  'BRAND_CRUZ_BLANCA',
  'CL',
  'Salud',
  'Isapres',
  '{"original_category":"Salud","original_subcategory":"Isapres","original_domain":"cruzblanca.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'nueva-masvida',
  'Nueva Masvida',
  'NUEVA MASVIDA',
  'BRAND_NUEVA_MASVIDA',
  'CL',
  'Salud',
  'Isapres',
  '{"original_category":"Salud","original_subcategory":"Isapres","original_domain":"nuevamasvida.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'vida-tres',
  'Vida Tres',
  'VIDA TRES',
  'BRAND_VIDA_TRES',
  'CL',
  'Salud',
  'Isapres',
  '{"original_category":"Salud","original_subcategory":"Isapres","original_domain":"vidatres.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'bci-seguros',
  'BCI Seguros',
  'BCI SEGUROS',
  'BRAND_BCI_SEGUROS',
  'CL',
  'Salud',
  'Seguros de salud',
  '{"original_category":"Salud","original_subcategory":"Seguros de salud","original_domain":"bciseguros.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'hdi-seguros',
  'HDI Seguros',
  'HDI SEGUROS',
  'BRAND_HDI_SEGUROS',
  'CL',
  'Salud',
  'Seguros de salud',
  '{"original_category":"Salud","original_subcategory":"Seguros de salud","original_domain":"hdi.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'mapfre',
  'Mapfre',
  'MAPFRE',
  'BRAND_MAPFRE',
  'CL',
  'Salud',
  'Seguros de salud',
  '{"original_category":"Salud","original_subcategory":"Seguros de salud","original_domain":"mapfre.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'metlife',
  'MetLife',
  'METLIFE',
  'BRAND_METLIFE',
  'CL',
  'Salud',
  'Seguros de salud',
  '{"original_category":"Salud","original_subcategory":"Seguros de salud","original_domain":"metlife.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'zurich',
  'Zurich',
  'ZURICH',
  'BRAND_ZURICH',
  'CL',
  'Salud',
  'Seguros de salud',
  '{"original_category":"Salud","original_subcategory":"Seguros de salud","original_domain":"zurich.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'apple',
  'Apple',
  'APPLE',
  'BRAND_APPLE',
  NULL,
  'Tecnología',
  'Audífonos',
  '{"original_category":"Tecnología","original_subcategory":"Audífonos","original_domain":"apple.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'bose',
  'Bose',
  'BOSE',
  'BRAND_BOSE',
  NULL,
  'Tecnología',
  'Audífonos',
  '{"original_category":"Tecnología","original_subcategory":"Audífonos","original_domain":"bose.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'jbl',
  'JBL',
  'JBL',
  'BRAND_JBL',
  'CL',
  'Tecnología',
  'Audífonos',
  '{"original_category":"Tecnología","original_subcategory":"Audífonos","original_domain":"jbl.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'skullcandy',
  'Skullcandy',
  'SKULLCANDY',
  'BRAND_SKULLCANDY',
  NULL,
  'Tecnología',
  'Audífonos',
  '{"original_category":"Tecnología","original_subcategory":"Audífonos","original_domain":"","catalog_source":"excel","curation_status":"needs_review","notes":"Domain review needed."}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'sony',
  'Sony',
  'SONY',
  'BRAND_SONY',
  NULL,
  'Tecnología',
  'Audífonos',
  '{"original_category":"Tecnología","original_subcategory":"Audífonos","original_domain":"sony.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'asus',
  'ASUS',
  'ASUS',
  'BRAND_ASUS',
  NULL,
  'Tecnología',
  'Consolas',
  '{"original_category":"Tecnología","original_subcategory":"Consolas","original_domain":"rog.asus.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'lenovo',
  'Lenovo',
  'LENOVO',
  'BRAND_LENOVO',
  'CL',
  'Tecnología',
  'Consolas',
  '{"original_category":"Tecnología","original_subcategory":"Consolas","original_domain":"lenovo.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'nintendo',
  'Nintendo',
  'NINTENDO',
  'BRAND_NINTENDO',
  'CL',
  'Tecnología',
  'Consolas',
  '{"original_category":"Tecnología","original_subcategory":"Consolas","original_domain":"nintendo.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'playstation',
  'PlayStation',
  'PLAYSTATION',
  'BRAND_PLAYSTATION',
  NULL,
  'Tecnología',
  'Consolas',
  '{"original_category":"Tecnología","original_subcategory":"Consolas","original_domain":"ps.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'steam-deck',
  'Steam Deck',
  'STEAM DECK',
  'BRAND_STEAM_DECK',
  NULL,
  'Tecnología',
  'Consolas',
  '{"original_category":"Tecnología","original_subcategory":"Consolas","original_domain":"steamdeck.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'xbox',
  'Xbox',
  'XBOX',
  'BRAND_XBOX',
  NULL,
  'Tecnología',
  'Consolas',
  '{"original_category":"Tecnología","original_subcategory":"Consolas","original_domain":"xbox.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'aoc',
  'AOC',
  'AOC',
  'BRAND_AOC',
  'CL',
  'Tecnología',
  'Monitores gamer',
  '{"original_category":"Tecnología","original_subcategory":"Monitores gamer","original_domain":"aocchile.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'acer',
  'Acer',
  'ACER',
  'BRAND_ACER',
  NULL,
  'Tecnología',
  'Monitores gamer',
  '{"original_category":"Tecnología","original_subcategory":"Monitores gamer","original_domain":"acer.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'msi',
  'MSI',
  'MSI',
  'BRAND_MSI',
  NULL,
  'Tecnología',
  'Monitores gamer',
  '{"original_category":"Tecnología","original_subcategory":"Monitores gamer","original_domain":"latam.msi.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'dell',
  'Dell',
  'DELL',
  'BRAND_DELL',
  NULL,
  'Tecnología',
  'Notebooks',
  '{"original_category":"Tecnología","original_subcategory":"Notebooks","original_domain":"dell.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'hp',
  'HP',
  'HP',
  'BRAND_HP',
  NULL,
  'Tecnología',
  'Notebooks',
  '{"original_category":"Tecnología","original_subcategory":"Notebooks","original_domain":"hp.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'corsair',
  'Corsair',
  'CORSAIR',
  'BRAND_CORSAIR',
  NULL,
  'Tecnología',
  'Periféricos gamer',
  '{"original_category":"Tecnología","original_subcategory":"Periféricos gamer","original_domain":"corsair.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'hyperx',
  'HyperX',
  'HYPERX',
  'BRAND_HYPERX',
  NULL,
  'Tecnología',
  'Periféricos gamer',
  '{"original_category":"Tecnología","original_subcategory":"Periféricos gamer","original_domain":"hyperx.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'logitech-g',
  'Logitech G',
  'LOGITECH G',
  'BRAND_LOGITECH_G',
  NULL,
  'Tecnología',
  'Periféricos gamer',
  '{"original_category":"Tecnología","original_subcategory":"Periféricos gamer","original_domain":"logitechg.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'razer',
  'Razer',
  'RAZER',
  'BRAND_RAZER',
  NULL,
  'Tecnología',
  'Periféricos gamer',
  '{"original_category":"Tecnología","original_subcategory":"Periféricos gamer","original_domain":"razer.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'redragon',
  'Redragon',
  'REDRAGON',
  'BRAND_REDRAGON',
  NULL,
  'Tecnología',
  'Periféricos gamer',
  '{"original_category":"Tecnología","original_subcategory":"Periféricos gamer","original_domain":"redragon.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'steelseries',
  'SteelSeries',
  'STEELSERIES',
  'BRAND_STEELSERIES',
  NULL,
  'Tecnología',
  'Periféricos gamer',
  '{"original_category":"Tecnología","original_subcategory":"Periféricos gamer","original_domain":"steelseries.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'honor',
  'Honor',
  'HONOR',
  'BRAND_HONOR',
  NULL,
  'Tecnología',
  'Smartphones',
  '{"original_category":"Tecnología","original_subcategory":"Smartphones","original_domain":"honor.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'huawei',
  'Huawei',
  'HUAWEI',
  'BRAND_HUAWEI',
  NULL,
  'Tecnología',
  'Smartphones',
  '{"original_category":"Tecnología","original_subcategory":"Smartphones","original_domain":"huawei.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'motorola',
  'Motorola',
  'MOTOROLA',
  'BRAND_MOTOROLA',
  NULL,
  'Tecnología',
  'Smartphones',
  '{"original_category":"Tecnología","original_subcategory":"Smartphones","original_domain":"motorola.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'oppo',
  'Oppo',
  'OPPO',
  'BRAND_OPPO',
  NULL,
  'Tecnología',
  'Smartphones',
  '{"original_category":"Tecnología","original_subcategory":"Smartphones","original_domain":"oppo.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'realme',
  'Realme',
  'REALME',
  'BRAND_REALME',
  NULL,
  'Tecnología',
  'Smartphones',
  '{"original_category":"Tecnología","original_subcategory":"Smartphones","original_domain":"realme.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'amazfit',
  'Amazfit',
  'AMAZFIT',
  'BRAND_AMAZFIT',
  NULL,
  'Tecnología',
  'Smartwatches',
  '{"original_category":"Tecnología","original_subcategory":"Smartwatches","original_domain":"amazfit.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'garmin',
  'Garmin',
  'GARMIN',
  'BRAND_GARMIN',
  NULL,
  'Tecnología',
  'Smartwatches',
  '{"original_category":"Tecnología","original_subcategory":"Smartwatches","original_domain":"garmin.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'hisense',
  'Hisense',
  'HISENSE',
  'BRAND_HISENSE',
  'CL',
  'Tecnología',
  'Televisores',
  '{"original_category":"Tecnología","original_subcategory":"Televisores","original_domain":"hisense.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'tcl',
  'TCL',
  'TCL',
  'BRAND_TCL',
  'CL',
  'Tecnología',
  'Televisores',
  '{"original_category":"Tecnología","original_subcategory":"Televisores","original_domain":"tclstore.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'claro',
  'Claro',
  'CLARO',
  'BRAND_CLARO',
  'CL',
  'Telecomunicaciones',
  'Internet hogar',
  '{"original_category":"Telecomunicaciones","original_subcategory":"Internet hogar","original_domain":"claro.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'entel',
  'Entel',
  'ENTEL',
  'BRAND_ENTEL',
  'CL',
  'Telecomunicaciones',
  'Internet hogar',
  '{"original_category":"Telecomunicaciones","original_subcategory":"Internet hogar","original_domain":"entel.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'gtd',
  'GTD',
  'GTD',
  'BRAND_GTD',
  'CL',
  'Telecomunicaciones',
  'Internet hogar',
  '{"original_category":"Telecomunicaciones","original_subcategory":"Internet hogar","original_domain":"gtd.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'movistar',
  'Movistar',
  'MOVISTAR',
  'BRAND_MOVISTAR',
  'CL',
  'Telecomunicaciones',
  'Internet hogar',
  '{"original_category":"Telecomunicaciones","original_subcategory":"Internet hogar","original_domain":"movistar.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'mundo',
  'Mundo',
  'MUNDO',
  'BRAND_MUNDO',
  'CL',
  'Telecomunicaciones',
  'Internet hogar',
  '{"original_category":"Telecomunicaciones","original_subcategory":"Internet hogar","original_domain":"mundo.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'telsur',
  'Telsur',
  'TELSUR',
  'BRAND_TELSUR',
  'CL',
  'Telecomunicaciones',
  'Internet hogar',
  '{"original_category":"Telecomunicaciones","original_subcategory":"Internet hogar","original_domain":"gtd.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'vtr',
  'VTR',
  'VTR',
  'BRAND_VTR',
  NULL,
  'Telecomunicaciones',
  'Internet hogar',
  '{"original_category":"Telecomunicaciones","original_subcategory":"Internet hogar","original_domain":"vtr.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'dgo',
  'DGO',
  'DGO',
  'BRAND_DGO',
  NULL,
  'Telecomunicaciones',
  'TV online',
  '{"original_category":"Telecomunicaciones","original_subcategory":"TV online","original_domain":"directvgo.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'michv',
  'MiCHV',
  'MICHV',
  'BRAND_MICHV',
  'CL',
  'Telecomunicaciones',
  'TV online',
  '{"original_category":"Telecomunicaciones","original_subcategory":"TV online","original_domain":"michv.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'tvn-play',
  'TVN Play',
  'TVN PLAY',
  'BRAND_TVN_PLAY',
  'CL',
  'Telecomunicaciones',
  'TV online',
  '{"original_category":"Telecomunicaciones","original_subcategory":"TV online","original_domain":"tvnplay.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'zapping',
  'Zapping',
  'ZAPPING',
  'BRAND_ZAPPING',
  NULL,
  'Telecomunicaciones',
  'TV online',
  '{"original_category":"Telecomunicaciones","original_subcategory":"TV online","original_domain":"zapping.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'directv',
  'DIRECTV',
  'DIRECTV',
  'BRAND_DIRECTV',
  'CL',
  'Telecomunicaciones',
  'TV paga',
  '{"original_category":"Telecomunicaciones","original_subcategory":"TV paga","original_domain":"directtv.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'tuves',
  'TuVes',
  'TUVES',
  'BRAND_TUVES',
  'CL',
  'Telecomunicaciones',
  'TV paga',
  '{"original_category":"Telecomunicaciones","original_subcategory":"TV paga","original_domain":"tuves.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'wom',
  'WOM',
  'WOM',
  'BRAND_WOM',
  'CL',
  'Telecomunicaciones',
  'Telefonía móvil',
  '{"original_category":"Telecomunicaciones","original_subcategory":"Telefonía móvil","original_domain":"wom.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'air-france',
  'Air France',
  'AIR FRANCE',
  'BRAND_AIR_FRANCE',
  'CL',
  'Viajes y transporte',
  'Aerolíneas',
  '{"original_category":"Viajes y transporte","original_subcategory":"Aerolíneas","original_domain":"airfrance.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'american-airlines',
  'American Airlines',
  'AMERICAN AIRLINES',
  'BRAND_AMERICAN_AIRLINES',
  NULL,
  'Viajes y transporte',
  'Aerolíneas',
  '{"original_category":"Viajes y transporte","original_subcategory":"Aerolíneas","original_domain":"aa.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'avianca',
  'Avianca',
  'AVIANCA',
  'BRAND_AVIANCA',
  NULL,
  'Viajes y transporte',
  'Aerolíneas',
  '{"original_category":"Viajes y transporte","original_subcategory":"Aerolíneas","original_domain":"avianca.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'copa-airlines',
  'Copa Airlines',
  'COPA AIRLINES',
  'BRAND_COPA_AIRLINES',
  NULL,
  'Viajes y transporte',
  'Aerolíneas',
  '{"original_category":"Viajes y transporte","original_subcategory":"Aerolíneas","original_domain":"copaair.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'delta-air-lines',
  'Delta Air Lines',
  'DELTA AIR LINES',
  'BRAND_DELTA_AIR_LINES',
  NULL,
  'Viajes y transporte',
  'Aerolíneas',
  '{"original_category":"Viajes y transporte","original_subcategory":"Aerolíneas","original_domain":"delta.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'iberia',
  'Iberia',
  'IBERIA',
  'BRAND_IBERIA',
  NULL,
  'Viajes y transporte',
  'Aerolíneas',
  '{"original_category":"Viajes y transporte","original_subcategory":"Aerolíneas","original_domain":"iberia.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'jetsmart',
  'JetSMART',
  'JETSMART',
  'BRAND_JETSMART',
  NULL,
  'Viajes y transporte',
  'Aerolíneas',
  '{"original_category":"Viajes y transporte","original_subcategory":"Aerolíneas","original_domain":"jetsmart.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'klm',
  'KLM',
  'KLM',
  'BRAND_KLM',
  'CL',
  'Viajes y transporte',
  'Aerolíneas',
  '{"original_category":"Viajes y transporte","original_subcategory":"Aerolíneas","original_domain":"klm.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'latam',
  'LATAM',
  'LATAM',
  'BRAND_LATAM',
  NULL,
  'Viajes y transporte',
  'Aerolíneas',
  '{"original_category":"Viajes y transporte","original_subcategory":"Aerolíneas","original_domain":"latamairlines.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'sky-airline',
  'Sky Airline',
  'SKY AIRLINE',
  'BRAND_SKY_AIRLINE',
  NULL,
  'Viajes y transporte',
  'Aerolíneas',
  '{"original_category":"Viajes y transporte","original_subcategory":"Aerolíneas","original_domain":"skyairlines.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'united-airlines',
  'United Airlines',
  'UNITED AIRLINES',
  'BRAND_UNITED_AIRLINES',
  NULL,
  'Viajes y transporte',
  'Aerolíneas',
  '{"original_category":"Viajes y transporte","original_subcategory":"Aerolíneas","original_domain":"ua.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'cabify',
  'Cabify',
  'CABIFY',
  'BRAND_CABIFY',
  'CL',
  'Viajes y transporte',
  'Apps de transporte',
  '{"original_category":"Viajes y transporte","original_subcategory":"Apps de transporte","original_domain":"cabify.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'didi',
  'DiDi',
  'DIDI',
  'BRAND_DIDI',
  NULL,
  'Viajes y transporte',
  'Apps de transporte',
  '{"original_category":"Viajes y transporte","original_subcategory":"Apps de transporte","original_domain":"didi.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'transvip',
  'Transvip',
  'TRANSVIP',
  'BRAND_TRANSVIP',
  'CL',
  'Viajes y transporte',
  'Apps de transporte',
  '{"original_category":"Viajes y transporte","original_subcategory":"Apps de transporte","original_domain":"transvip.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'uber',
  'Uber',
  'UBER',
  'BRAND_UBER',
  NULL,
  'Viajes y transporte',
  'Apps de transporte',
  '{"original_category":"Viajes y transporte","original_subcategory":"Apps de transporte","original_domain":"uber.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'indrive',
  'inDrive',
  'INDRIVE',
  'BRAND_INDRIVE',
  NULL,
  'Viajes y transporte',
  'Apps de transporte',
  '{"original_category":"Viajes y transporte","original_subcategory":"Apps de transporte","original_domain":"indrive.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'messenger',
  'Messenger',
  'MESSENGER',
  'BRAND_MESSENGER',
  NULL,
  'Viajes y transporte',
  'Mensajería',
  '{"original_category":"Viajes y transporte","original_subcategory":"Mensajería","original_domain":"messenger.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'signal',
  'Signal',
  'SIGNAL',
  'BRAND_SIGNAL',
  NULL,
  'Viajes y transporte',
  'Mensajería',
  '{"original_category":"Viajes y transporte","original_subcategory":"Mensajería","original_domain":"signal.org","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'telegram',
  'Telegram',
  'TELEGRAM',
  'BRAND_TELEGRAM',
  NULL,
  'Viajes y transporte',
  'Mensajería',
  '{"original_category":"Viajes y transporte","original_subcategory":"Mensajería","original_domain":"telegram.org","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'wechat',
  'WeChat',
  'WECHAT',
  'BRAND_WECHAT',
  NULL,
  'Viajes y transporte',
  'Mensajería',
  '{"original_category":"Viajes y transporte","original_subcategory":"Mensajería","original_domain":"wechat.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE code = 'BRAND'),
  'whatsapp',
  'WhatsApp',
  'WHATSAPP',
  'BRAND_WHATSAPP',
  NULL,
  'Viajes y transporte',
  'Mensajería',
  '{"original_category":"Viajes y transporte","original_subcategory":"Mensajería","original_domain":"whatsapp.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET
  display_name = EXCLUDED.display_name,
  normalized_name = EXCLUDED.normalized_name,
  slug = EXCLUDED.slug,
  metadata = EXCLUDED.metadata;

