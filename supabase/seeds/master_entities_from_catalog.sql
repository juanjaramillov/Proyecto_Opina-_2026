-- Seed master entities from curated catalog Excel
-- Generated: 2026-03-11T23:10:36.956Z

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'bruno-fritsch',
  'Bruno Fritsch',
  'BRUNO FRITSCH',
  'BRAND_BRUNO_FRITSCH',
  'CL',
  'Automotriz',
  'Automotoras',
  '{"original_category":"Automotriz","original_subcategory":"Automotoras","original_domain":"brunofritsch.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'dercocenter',
  'DercoCenter',
  'DERCOCENTER',
  'BRAND_DERCOCENTER',
  'CL',
  'Automotriz',
  'Automotoras',
  '{"original_category":"Automotriz","original_subcategory":"Automotoras","original_domain":"dercocenter.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'gildemeister',
  'Gildemeister',
  'GILDEMEISTER',
  'BRAND_GILDEMEISTER',
  'CL',
  'Automotriz',
  'Automotoras',
  '{"original_category":"Automotriz","original_subcategory":"Automotoras","original_domain":"gildemeister.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'kaufmann',
  'Kaufmann',
  'KAUFMANN',
  'BRAND_KAUFMANN',
  'CL',
  'Automotriz',
  'Automotoras',
  '{"original_category":"Automotriz","original_subcategory":"Automotoras","original_domain":"kaufmann.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'portillo',
  'Portillo',
  'PORTILLO',
  'BRAND_PORTILLO',
  'CL',
  'Automotriz',
  'Automotoras',
  '{"original_category":"Automotriz","original_subcategory":"Automotoras","original_domain":"portillo.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'salazar-israel',
  'Salazar Israel',
  'SALAZAR ISRAEL',
  'BRAND_SALAZAR_ISRAEL',
  'CL',
  'Automotriz',
  'Automotoras',
  '{"original_category":"Automotriz","original_subcategory":"Automotoras","original_domain":"salazarisrael.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'byd',
  'BYD',
  'BYD',
  'BRAND_BYD',
  NULL,
  'Automotriz',
  'Marcas de autos',
  '{"original_category":"Automotriz","original_subcategory":"Marcas de autos","original_domain":"byd.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'chery',
  'Chery',
  'CHERY',
  'BRAND_CHERY',
  'CL',
  'Automotriz',
  'Marcas de autos',
  '{"original_category":"Automotriz","original_subcategory":"Marcas de autos","original_domain":"chery.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'geely',
  'Geely',
  'GEELY',
  'BRAND_GEELY',
  'CL',
  'Automotriz',
  'Marcas de autos',
  '{"original_category":"Automotriz","original_subcategory":"Marcas de autos","original_domain":"geely.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'great-wall',
  'Great Wall',
  'GREAT WALL',
  'BRAND_GREAT_WALL',
  NULL,
  'Automotriz',
  'Marcas de autos',
  '{"original_category":"Automotriz","original_subcategory":"Marcas de autos","original_domain":"gwm-global.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'haval',
  'Haval',
  'HAVAL',
  'BRAND_HAVAL',
  'CL',
  'Automotriz',
  'Marcas de autos',
  '{"original_category":"Automotriz","original_subcategory":"Marcas de autos","original_domain":"gwm.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'jac',
  'JAC',
  'JAC',
  'BRAND_JAC',
  'CL',
  'Automotriz',
  'Marcas de autos',
  '{"original_category":"Automotriz","original_subcategory":"Marcas de autos","original_domain":"jac.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'jetour',
  'Jetour',
  'JETOUR',
  'BRAND_JETOUR',
  NULL,
  'Automotriz',
  'Marcas de autos',
  '{"original_category":"Automotriz","original_subcategory":"Marcas de autos","original_domain":"jetourglobal.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'mg',
  'MG',
  'MG',
  'BRAND_MG',
  'CL',
  'Automotriz',
  'Marcas de autos',
  '{"original_category":"Automotriz","original_subcategory":"Marcas de autos","original_domain":"mgmotor.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'bmw',
  'BMW',
  'BMW',
  'BRAND_BMW',
  'CL',
  'Automotriz',
  'Marcas de autos',
  '{"original_category":"Automotriz","original_subcategory":"Marcas de autos","original_domain":"bmw.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'chevrolet',
  'Chevrolet',
  'CHEVROLET',
  'BRAND_CHEVROLET',
  'CL',
  'Automotriz',
  'Marcas de autos',
  '{"original_category":"Automotriz","original_subcategory":"Marcas de autos","original_domain":"chevrolet.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'hyundai',
  'Hyundai',
  'HYUNDAI',
  'BRAND_HYUNDAI',
  'CL',
  'Automotriz',
  'Marcas de autos',
  '{"original_category":"Automotriz","original_subcategory":"Marcas de autos","original_domain":"hyundai.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'kia',
  'Kia',
  'KIA',
  'BRAND_KIA',
  'CL',
  'Automotriz',
  'Marcas de autos',
  '{"original_category":"Automotriz","original_subcategory":"Marcas de autos","original_domain":"kia.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'mazda',
  'Mazda',
  'MAZDA',
  'BRAND_MAZDA',
  'CL',
  'Automotriz',
  'Marcas de autos',
  '{"original_category":"Automotriz","original_subcategory":"Marcas de autos","original_domain":"mazda.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'mercedes-benz',
  'Mercedes-Benz',
  'MERCEDESBENZ',
  'BRAND_MERCEDESBENZ',
  'CL',
  'Automotriz',
  'Marcas de autos',
  '{"original_category":"Automotriz","original_subcategory":"Marcas de autos","original_domain":"mercedes-benz.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'nissan',
  'Nissan',
  'NISSAN',
  'BRAND_NISSAN',
  'CL',
  'Automotriz',
  'Marcas de autos',
  '{"original_category":"Automotriz","original_subcategory":"Marcas de autos","original_domain":"nissan.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'peugeot',
  'Peugeot',
  'PEUGEOT',
  'BRAND_PEUGEOT',
  'CL',
  'Automotriz',
  'Marcas de autos',
  '{"original_category":"Automotriz","original_subcategory":"Marcas de autos","original_domain":"peugeot.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'suzuki',
  'Suzuki',
  'SUZUKI',
  'BRAND_SUZUKI',
  'CL',
  'Automotriz',
  'Marcas de autos',
  '{"original_category":"Automotriz","original_subcategory":"Marcas de autos","original_domain":"suzuki.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'toyota',
  'Toyota',
  'TOYOTA',
  'BRAND_TOYOTA',
  'CL',
  'Automotriz',
  'Marcas de autos',
  '{"original_category":"Automotriz","original_subcategory":"Marcas de autos","original_domain":"toyota.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'aquarius',
  'Aquarius',
  'AQUARIUS',
  'BRAND_AQUARIUS',
  NULL,
  'Bebidas',
  'Aguas',
  '{"original_category":"Bebidas","original_subcategory":"Aguas","original_domain":"coca-cola.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'benedictino',
  'Benedictino',
  'BENEDICTINO',
  'BRAND_BENEDICTINO',
  'CL',
  'Bebidas',
  'Aguas',
  '{"original_category":"Bebidas","original_subcategory":"Aguas","original_domain":"benedictino.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'cachantun',
  'Cachantun',
  'CACHANTUN',
  'BRAND_CACHANTUN',
  'CL',
  'Bebidas',
  'Aguas',
  '{"original_category":"Bebidas","original_subcategory":"Aguas","original_domain":"cachantun.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'evian',
  'Evian',
  'EVIAN',
  'BRAND_EVIAN',
  NULL,
  'Bebidas',
  'Aguas',
  '{"original_category":"Bebidas","original_subcategory":"Aguas","original_domain":"evian.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'perrier',
  'Perrier',
  'PERRIER',
  'BRAND_PERRIER',
  NULL,
  'Bebidas',
  'Aguas',
  '{"original_category":"Bebidas","original_subcategory":"Aguas","original_domain":"perrier.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'vital',
  'Vital',
  'VITAL',
  'BRAND_VITAL',
  'CL',
  'Bebidas',
  'Aguas',
  '{"original_category":"Bebidas","original_subcategory":"Aguas","original_domain":"vitalagua.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'becker',
  'Becker',
  'BECKER',
  'BRAND_BECKER',
  'CL',
  'Bebidas',
  'Cervezas',
  '{"original_category":"Bebidas","original_subcategory":"Cervezas","original_domain":"becker.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'corona',
  'Corona',
  'CORONA',
  'BRAND_CORONA',
  'CL',
  'Bebidas',
  'Cervezas',
  '{"original_category":"Bebidas","original_subcategory":"Cervezas","original_domain":"cervezacorona.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'cristal',
  'Cristal',
  'CRISTAL',
  'BRAND_CRISTAL',
  NULL,
  'Bebidas',
  'Cervezas',
  '{"original_category":"Bebidas","original_subcategory":"Cervezas","original_domain":null,"catalog_source":"excel","curation_status":"needs_review","notes":"Domain review needed."}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'escudo',
  'Escudo',
  'ESCUDO',
  'BRAND_ESCUDO',
  NULL,
  'Bebidas',
  'Cervezas',
  '{"original_category":"Bebidas","original_subcategory":"Cervezas","original_domain":null,"catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'heineken',
  'Heineken',
  'HEINEKEN',
  'BRAND_HEINEKEN',
  NULL,
  'Bebidas',
  'Cervezas',
  '{"original_category":"Bebidas","original_subcategory":"Cervezas","original_domain":"heineken.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'kunstmann',
  'Kunstmann',
  'KUNSTMANN',
  'BRAND_KUNSTMANN',
  'CL',
  'Bebidas',
  'Cervezas',
  '{"original_category":"Bebidas","original_subcategory":"Cervezas","original_domain":"cerveza-kunstmann.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'burn',
  'Burn',
  'BURN',
  'BRAND_BURN',
  NULL,
  'Bebidas',
  'Energéticas',
  '{"original_category":"Bebidas","original_subcategory":"Energéticas","original_domain":null,"catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'celsius',
  'Celsius',
  'CELSIUS',
  'BRAND_CELSIUS',
  NULL,
  'Bebidas',
  'Energéticas',
  '{"original_category":"Bebidas","original_subcategory":"Energéticas","original_domain":null,"catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'monster',
  'Monster',
  'MONSTER',
  'BRAND_MONSTER',
  NULL,
  'Bebidas',
  'Energéticas',
  '{"original_category":"Bebidas","original_subcategory":"Energéticas","original_domain":"monsterenergy.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'prime-energy',
  'Prime Energy',
  'PRIME ENERGY',
  'BRAND_PRIME_ENERGY',
  NULL,
  'Bebidas',
  'Energéticas',
  '{"original_category":"Bebidas","original_subcategory":"Energéticas","original_domain":null,"catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'red-bull',
  'Red Bull',
  'RED BULL',
  'BRAND_RED_BULL',
  NULL,
  'Bebidas',
  'Energéticas',
  '{"original_category":"Bebidas","original_subcategory":"Energéticas","original_domain":"redbull.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'rockstar',
  'Rockstar',
  'ROCKSTAR',
  'BRAND_ROCKSTAR',
  NULL,
  'Bebidas',
  'Energéticas',
  '{"original_category":"Bebidas","original_subcategory":"Energéticas","original_domain":null,"catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'canada-dry',
  'Canada Dry',
  'CANADA DRY',
  'BRAND_CANADA_DRY',
  'CL',
  'Bebidas',
  'Gaseosas',
  '{"original_category":"Bebidas","original_subcategory":"Gaseosas","original_domain":"canadadrychile.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'coca-cola',
  'Coca-Cola',
  'COCACOLA',
  'BRAND_COCACOLA',
  'CL',
  'Bebidas',
  'Gaseosas',
  '{"original_category":"Bebidas","original_subcategory":"Gaseosas","original_domain":"andina.micoca-cola.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'fanta',
  'Fanta',
  'FANTA',
  'BRAND_FANTA',
  NULL,
  'Bebidas',
  'Gaseosas',
  '{"original_category":"Bebidas","original_subcategory":"Gaseosas","original_domain":"coca-cola.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'pepsi',
  'Pepsi',
  'PEPSI',
  'BRAND_PEPSI',
  NULL,
  'Bebidas',
  'Gaseosas',
  '{"original_category":"Bebidas","original_subcategory":"Gaseosas","original_domain":"pepsi.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'schweppes',
  'Schweppes',
  'SCHWEPPES',
  'BRAND_SCHWEPPES',
  NULL,
  'Bebidas',
  'Gaseosas',
  '{"original_category":"Bebidas","original_subcategory":"Gaseosas","original_domain":null,"catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'sprite',
  'Sprite',
  'SPRITE',
  'BRAND_SPRITE',
  NULL,
  'Bebidas',
  'Gaseosas',
  '{"original_category":"Bebidas","original_subcategory":"Gaseosas","original_domain":null,"catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'descorcha',
  'Descorcha',
  'DESCORCHA',
  'BRAND_DESCORCHA',
  NULL,
  'Bebidas',
  'Tiendas de vino',
  '{"original_category":"Bebidas","original_subcategory":"Tiendas de vino","original_domain":"descorcha.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'el-mundo-del-vino',
  'El Mundo del Vino',
  'EL MUNDO DEL VINO',
  'BRAND_EL_MUNDO_DEL_VINO',
  'CL',
  'Bebidas',
  'Tiendas de vino',
  '{"original_category":"Bebidas","original_subcategory":"Tiendas de vino","original_domain":"elmundodelvino.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'la-cav',
  'La Cav',
  'LA CAV',
  'BRAND_LA_CAV',
  'CL',
  'Bebidas',
  'Tiendas de vino',
  '{"original_category":"Bebidas","original_subcategory":"Tiendas de vino","original_domain":"cav.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'la-vinoteca',
  'La Vinoteca',
  'LA VINOTECA',
  'BRAND_LA_VINOTECA',
  'CL',
  'Bebidas',
  'Tiendas de vino',
  '{"original_category":"Bebidas","original_subcategory":"Tiendas de vino","original_domain":"lavinoteca.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'tienda-concha-y-toro',
  'Tienda Concha y Toro',
  'TIENDA CONCHA Y TORO',
  'BRAND_TIENDA_CONCHA_Y_TORO',
  NULL,
  'Bebidas',
  'Tiendas de vino',
  '{"original_category":"Bebidas","original_subcategory":"Tiendas de vino","original_domain":null,"catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'tienda-santa-rita',
  'Tienda Santa Rita',
  'TIENDA SANTA RITA',
  'BRAND_TIENDA_SANTA_RITA',
  NULL,
  'Bebidas',
  'Tiendas de vino',
  '{"original_category":"Bebidas","original_subcategory":"Tiendas de vino","original_domain":null,"catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'concha-y-toro',
  'Concha y Toro',
  'CONCHA Y TORO',
  'BRAND_CONCHA_Y_TORO',
  NULL,
  'Bebidas',
  'Viñas',
  '{"original_category":"Bebidas","original_subcategory":"Viñas","original_domain":"conchaytoro.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'miguel-torres',
  'Miguel Torres',
  'MIGUEL TORRES',
  'BRAND_MIGUEL_TORRES',
  'CL',
  'Bebidas',
  'Viñas',
  '{"original_category":"Bebidas","original_subcategory":"Viñas","original_domain":"migueltorres.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'montes',
  'Montes',
  'MONTES',
  'BRAND_MONTES',
  NULL,
  'Bebidas',
  'Viñas',
  '{"original_category":"Bebidas","original_subcategory":"Viñas","original_domain":"monteswines.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'san-pedro',
  'San Pedro',
  'SAN PEDRO',
  'BRAND_SAN_PEDRO',
  'CL',
  'Bebidas',
  'Viñas',
  '{"original_category":"Bebidas","original_subcategory":"Viñas","original_domain":"sanpedro.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'santa-rita',
  'Santa Rita',
  'SANTA RITA',
  'BRAND_SANTA_RITA',
  NULL,
  'Bebidas',
  'Viñas',
  '{"original_category":"Bebidas","original_subcategory":"Viñas","original_domain":"santarita.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'undurraga',
  'Undurraga',
  'UNDURRAGA',
  'BRAND_UNDURRAGA',
  'CL',
  'Bebidas',
  'Viñas',
  '{"original_category":"Bebidas","original_subcategory":"Viñas","original_domain":"undurraga.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'bebesit',
  'Bebesit',
  'BEBESIT',
  'BRAND_BEBESIT',
  'CL',
  'Bebés',
  'Coches',
  '{"original_category":"Bebés","original_subcategory":"Coches","original_domain":"bebesit.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'chicco',
  'Chicco',
  'CHICCO',
  'BRAND_CHICCO',
  'CL',
  'Bebés',
  'Cochecitos',
  '{"original_category":"Bebés","original_subcategory":"Cochecitos","original_domain":"chicco.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'graco',
  'Graco',
  'GRACO',
  'BRAND_GRACO',
  'CL',
  'Bebés',
  'Cochecitos',
  '{"original_category":"Bebés","original_subcategory":"Cochecitos","original_domain":"babygraco.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'infanti',
  'Infanti',
  'INFANTI',
  'BRAND_INFANTI',
  'CL',
  'Bebés',
  'Cochecitos',
  '{"original_category":"Bebés","original_subcategory":"Cochecitos","original_domain":"infanti.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'joie',
  'Joie',
  'JOIE',
  'BRAND_JOIE',
  NULL,
  'Bebés',
  'Cochecitos',
  '{"original_category":"Bebés","original_subcategory":"Cochecitos","original_domain":"joiebaby.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'maxi-cosi',
  'Maxi-Cosi',
  'MAXICOSI',
  'BRAND_MAXICOSI',
  'CL',
  'Bebés',
  'Cochecitos',
  '{"original_category":"Bebés","original_subcategory":"Cochecitos","original_domain":"maxicosi.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'enfamil',
  'Enfamil',
  'ENFAMIL',
  'BRAND_ENFAMIL',
  NULL,
  'Bebés',
  'Alimento Infantil',
  '{"original_category":"Bebés","original_subcategory":"Alimento Infantil","original_domain":"enfamil.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'nan',
  'NAN',
  'NAN',
  'BRAND_NAN',
  'CL',
  'Bebés',
  'Alimento Infantil',
  '{"original_category":"Bebés","original_subcategory":"Alimento Infantil","original_domain":"nestle.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'nidal',
  'Nidal',
  'NIDAL',
  'BRAND_NIDAL',
  NULL,
  'Bebés',
  'Alimento Infantil',
  '{"original_category":"Bebés","original_subcategory":"Alimento Infantil","original_domain":null,"catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'pediasure',
  'Pediasure',
  'PEDIASURE',
  'BRAND_PEDIASURE',
  NULL,
  'Bebés',
  'Alimento Infantil',
  '{"original_category":"Bebés","original_subcategory":"Alimento Infantil","original_domain":null,"catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  's-26',
  'S-26',
  'S26',
  'BRAND_S26',
  NULL,
  'Bebés',
  'Alimento Infantil',
  '{"original_category":"Bebés","original_subcategory":"Alimento Infantil","original_domain":null,"catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'similac',
  'Similac',
  'SIMILAC',
  'BRAND_SIMILAC',
  NULL,
  'Bebés',
  'Alimento Infantil',
  '{"original_category":"Bebés","original_subcategory":"Alimento Infantil","original_domain":null,"catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'bbtips',
  'BBTips',
  'BBTIPS',
  'BRAND_BBTIPS',
  NULL,
  'Bebés',
  'Pañales',
  '{"original_category":"Bebés","original_subcategory":"Pañales","original_domain":null,"catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'babysec',
  'Babysec',
  'BABYSEC',
  'BRAND_BABYSEC',
  'CL',
  'Bebés',
  'Pañales',
  '{"original_category":"Bebés","original_subcategory":"Pañales","original_domain":"babysec.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'huggies',
  'Huggies',
  'HUGGIES',
  'BRAND_HUGGIES',
  'CL',
  'Bebés',
  'Pañales',
  '{"original_category":"Bebés","original_subcategory":"Pañales","original_domain":"huggies.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'pampers',
  'Pampers',
  'PAMPERS',
  'BRAND_PAMPERS',
  'CL',
  'Bebés',
  'Pañales',
  '{"original_category":"Bebés","original_subcategory":"Pañales","original_domain":"pampers.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'pampers-premium-care',
  'Pampers Premium Care',
  'PAMPERS PREMIUM CARE',
  'BRAND_PAMPERS_PREMIUM_CARE',
  'CL',
  'Bebés',
  'Pañales',
  '{"original_category":"Bebés","original_subcategory":"Pañales","original_domain":"pampers.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'bbtips',
  'BBTips',
  'BBTIPS',
  'BRAND_BBTIPS',
  NULL,
  'Bebés',
  'Toallitas húmedas',
  '{"original_category":"Bebés","original_subcategory":"Toallitas húmedas","original_domain":null,"catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'babysec',
  'Babysec',
  'BABYSEC',
  'BRAND_BABYSEC',
  'CL',
  'Bebés',
  'Toallitas húmedas',
  '{"original_category":"Bebés","original_subcategory":"Toallitas húmedas","original_domain":"babysec.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'bebesit',
  'Bebesit',
  'BEBESIT',
  'BRAND_BEBESIT',
  'CL',
  'Bebés',
  'Toallitas húmedas',
  '{"original_category":"Bebés","original_subcategory":"Toallitas húmedas","original_domain":"bebesit.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'huggies',
  'Huggies',
  'HUGGIES',
  'BRAND_HUGGIES',
  'CL',
  'Bebés',
  'Toallitas húmedas',
  '{"original_category":"Bebés","original_subcategory":"Toallitas húmedas","original_domain":"huggies.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'pampers',
  'Pampers',
  'PAMPERS',
  'BRAND_PAMPERS',
  'CL',
  'Bebés',
  'Toallitas húmedas',
  '{"original_category":"Bebés","original_subcategory":"Toallitas húmedas","original_domain":"pampers.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'waterwipes',
  'WaterWipes',
  'WATERWIPES',
  'BRAND_WATERWIPES',
  NULL,
  'Bebés',
  'Toallitas húmedas',
  '{"original_category":"Bebés","original_subcategory":"Toallitas húmedas","original_domain":null,"catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'l-oreal-paris',
  'L''Oréal Paris',
  'LOREAL PARIS',
  'BRAND_LOREAL_PARIS',
  'CL',
  'Belleza',
  'Maquillaje',
  '{"original_category":"Belleza","original_subcategory":"Maquillaje","original_domain":"loreal-paris.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'mac',
  'MAC',
  'MAC',
  'BRAND_MAC',
  'CL',
  'Belleza',
  'Maquillaje',
  '{"original_category":"Belleza","original_subcategory":"Maquillaje","original_domain":"maccosmetics.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'maybelline',
  'Maybelline',
  'MAYBELLINE',
  'BRAND_MAYBELLINE',
  'CL',
  'Belleza',
  'Maquillaje',
  '{"original_category":"Belleza","original_subcategory":"Maquillaje","original_domain":"maybelline.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'nyx',
  'NYX',
  'NYX',
  'BRAND_NYX',
  NULL,
  'Belleza',
  'Maquillaje',
  '{"original_category":"Belleza","original_subcategory":"Maquillaje","original_domain":"nyxcosmetics.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'natura',
  'Natura',
  'NATURA',
  'BRAND_NATURA',
  'CL',
  'Belleza',
  'Maquillaje',
  '{"original_category":"Belleza","original_subcategory":"Maquillaje","original_domain":"natura.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'petrizzio',
  'Petrizzio',
  'PETRIZZIO',
  'BRAND_PETRIZZIO',
  'CL',
  'Belleza',
  'Maquillaje',
  '{"original_category":"Belleza","original_subcategory":"Maquillaje","original_domain":"petrizzio.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'axe',
  'Axe',
  'AXE',
  'BRAND_AXE',
  NULL,
  'Belleza',
  'Desodorantes',
  '{"original_category":"Belleza","original_subcategory":"Desodorantes","original_domain":"axe.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'dove',
  'Dove',
  'DOVE',
  'BRAND_DOVE',
  NULL,
  'Belleza',
  'Desodorantes',
  '{"original_category":"Belleza","original_subcategory":"Desodorantes","original_domain":"dove.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'lady-speed-stick',
  'Lady Speed Stick',
  'LADY SPEED STICK',
  'BRAND_LADY_SPEED_STICK',
  NULL,
  'Belleza',
  'Desodorantes',
  '{"original_category":"Belleza","original_subcategory":"Desodorantes","original_domain":"ladyspeedstick.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'nivea',
  'Nivea',
  'NIVEA',
  'BRAND_NIVEA',
  'CL',
  'Belleza',
  'Desodorantes',
  '{"original_category":"Belleza","original_subcategory":"Desodorantes","original_domain":"nivea.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'old-spice',
  'Old Spice',
  'OLD SPICE',
  'BRAND_OLD_SPICE',
  NULL,
  'Belleza',
  'Desodorantes',
  '{"original_category":"Belleza","original_subcategory":"Desodorantes","original_domain":"oldspice.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'rexona',
  'Rexona',
  'REXONA',
  'BRAND_REXONA',
  NULL,
  'Belleza',
  'Desodorantes',
  '{"original_category":"Belleza","original_subcategory":"Desodorantes","original_domain":"rexona.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'aquafresh',
  'Aquafresh',
  'AQUAFRESH',
  'BRAND_AQUAFRESH',
  NULL,
  'Belleza',
  'Pastas dentales',
  '{"original_category":"Belleza","original_subcategory":"Pastas dentales","original_domain":"aquafresh.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'closeup',
  'Closeup',
  'CLOSEUP',
  'BRAND_CLOSEUP',
  NULL,
  'Belleza',
  'Pastas dentales',
  '{"original_category":"Belleza","original_subcategory":"Pastas dentales","original_domain":"closeup.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'colgate',
  'Colgate',
  'COLGATE',
  'BRAND_COLGATE',
  'CL',
  'Belleza',
  'Pastas dentales',
  '{"original_category":"Belleza","original_subcategory":"Pastas dentales","original_domain":"colgate.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'oral-b',
  'Oral-B',
  'ORALB',
  'BRAND_ORALB',
  'CL',
  'Belleza',
  'Pastas dentales',
  '{"original_category":"Belleza","original_subcategory":"Pastas dentales","original_domain":"oralb.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'pepsodent',
  'Pepsodent',
  'PEPSODENT',
  'BRAND_PEPSODENT',
  NULL,
  'Belleza',
  'Pastas dentales',
  '{"original_category":"Belleza","original_subcategory":"Pastas dentales","original_domain":"pepsodent.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'sensodyne',
  'Sensodyne',
  'SENSODYNE',
  'BRAND_SENSODYNE',
  'CL',
  'Belleza',
  'Pastas dentales',
  '{"original_category":"Belleza","original_subcategory":"Pastas dentales","original_domain":"sensodyne.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'calvin-klein',
  'Calvin Klein',
  'CALVIN KLEIN',
  'BRAND_CALVIN_KLEIN',
  'CL',
  'Belleza',
  'Perfumes',
  '{"original_category":"Belleza","original_subcategory":"Perfumes","original_domain":"calvinklein.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'carolina-herrera',
  'Carolina Herrera',
  'CAROLINA HERRERA',
  'BRAND_CAROLINA_HERRERA',
  NULL,
  'Belleza',
  'Perfumes',
  '{"original_category":"Belleza","original_subcategory":"Perfumes","original_domain":"carolinaherrera.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'chanel',
  'Chanel',
  'CHANEL',
  'BRAND_CHANEL',
  NULL,
  'Belleza',
  'Perfumes',
  '{"original_category":"Belleza","original_subcategory":"Perfumes","original_domain":"chanel.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'dior',
  'Dior',
  'DIOR',
  'BRAND_DIOR',
  NULL,
  'Belleza',
  'Perfumes',
  '{"original_category":"Belleza","original_subcategory":"Perfumes","original_domain":"dior.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'hugo-boss',
  'Hugo Boss',
  'HUGO BOSS',
  'BRAND_HUGO_BOSS',
  NULL,
  'Belleza',
  'Perfumes',
  '{"original_category":"Belleza","original_subcategory":"Perfumes","original_domain":"hugoboss.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'rabanne',
  'Rabanne',
  'RABANNE',
  'BRAND_RABANNE',
  NULL,
  'Belleza',
  'Perfumes',
  '{"original_category":"Belleza","original_subcategory":"Perfumes","original_domain":"rabanne.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'eucerin-sun',
  'Eucerin Sun',
  'EUCERIN SUN',
  'BRAND_EUCERIN_SUN',
  'CL',
  'Belleza',
  'Protección solar',
  '{"original_category":"Belleza","original_subcategory":"Protección solar","original_domain":"eucerin.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'hawaiian-tropic',
  'Hawaiian Tropic',
  'HAWAIIAN TROPIC',
  'BRAND_HAWAIIAN_TROPIC',
  NULL,
  'Belleza',
  'Protección solar',
  '{"original_category":"Belleza","original_subcategory":"Protección solar","original_domain":"hawaiiantropic.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'isdin',
  'ISDIN',
  'ISDIN',
  'BRAND_ISDIN',
  NULL,
  'Belleza',
  'Protección solar',
  '{"original_category":"Belleza","original_subcategory":"Protección solar","original_domain":"isdin.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'la-roche-posay-anthelios',
  'La Roche-Posay Anthelios',
  'LA ROCHEPOSAY ANTHELIOS',
  'BRAND_LA_ROCHEPOSAY_ANTHELIOS',
  'CL',
  'Belleza',
  'Protección solar',
  '{"original_category":"Belleza","original_subcategory":"Protección solar","original_domain":"laroche-posay.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'raytan',
  'Raytan',
  'RAYTAN',
  'BRAND_RAYTAN',
  'CL',
  'Belleza',
  'Protección solar',
  '{"original_category":"Belleza","original_subcategory":"Protección solar","original_domain":"raytan.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'vichy-capital-soleil',
  'Vichy Capital Soleil',
  'VICHY CAPITAL SOLEIL',
  'BRAND_VICHY_CAPITAL_SOLEIL',
  'CL',
  'Belleza',
  'Protección solar',
  '{"original_category":"Belleza","original_subcategory":"Protección solar","original_domain":"vichy.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'dove',
  'Dove',
  'DOVE',
  'BRAND_DOVE',
  NULL,
  'Belleza',
  'Shampoo',
  '{"original_category":"Belleza","original_subcategory":"Shampoo","original_domain":"dove.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'elvive',
  'Elvive',
  'ELVIVE',
  'BRAND_ELVIVE',
  'CL',
  'Belleza',
  'Shampoo',
  '{"original_category":"Belleza","original_subcategory":"Shampoo","original_domain":"loreal-paris.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'head-shoulders',
  'Head & Shoulders',
  'HEAD SHOULDERS',
  'BRAND_HEAD_SHOULDERS',
  'CL',
  'Belleza',
  'Shampoo',
  '{"original_category":"Belleza","original_subcategory":"Shampoo","original_domain":"headandshoulders.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'pantene',
  'Pantene',
  'PANTENE',
  'BRAND_PANTENE',
  NULL,
  'Belleza',
  'Shampoo',
  '{"original_category":"Belleza","original_subcategory":"Shampoo","original_domain":"pantenela.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'sedal',
  'Sedal',
  'SEDAL',
  'BRAND_SEDAL',
  'CL',
  'Belleza',
  'Shampoo',
  '{"original_category":"Belleza","original_subcategory":"Shampoo","original_domain":"sedal.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'tio-nacho',
  'Tío Nacho',
  'TIO NACHO',
  'BRAND_TIO_NACHO',
  NULL,
  'Belleza',
  'Shampoo',
  '{"original_category":"Belleza","original_subcategory":"Shampoo","original_domain":"tionacho.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'bioderma',
  'Bioderma',
  'BIODERMA',
  'BRAND_BIODERMA',
  'CL',
  'Belleza',
  'Skincare',
  '{"original_category":"Belleza","original_subcategory":"Skincare","original_domain":"bioderma.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'cerave',
  'CeraVe',
  'CERAVE',
  'BRAND_CERAVE',
  'CL',
  'Belleza',
  'Skincare',
  '{"original_category":"Belleza","original_subcategory":"Skincare","original_domain":"cerave.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'cetaphil',
  'Cetaphil',
  'CETAPHIL',
  'BRAND_CETAPHIL',
  'CL',
  'Belleza',
  'Skincare',
  '{"original_category":"Belleza","original_subcategory":"Skincare","original_domain":"cetaphil.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'eucerin',
  'Eucerin',
  'EUCERIN',
  'BRAND_EUCERIN',
  'CL',
  'Belleza',
  'Skincare',
  '{"original_category":"Belleza","original_subcategory":"Skincare","original_domain":"eucerin.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'la-roche-posay',
  'La Roche-Posay',
  'LA ROCHEPOSAY',
  'BRAND_LA_ROCHEPOSAY',
  'CL',
  'Belleza',
  'Skincare',
  '{"original_category":"Belleza","original_subcategory":"Skincare","original_domain":"laroche-posay.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'vichy',
  'Vichy',
  'VICHY',
  'BRAND_VICHY',
  'CL',
  'Belleza',
  'Skincare',
  '{"original_category":"Belleza","original_subcategory":"Skincare","original_domain":"vichy.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'cafe-haiti',
  'Café Haiti',
  'CAFE HAITI',
  'BRAND_CAFE_HAITI',
  'CL',
  'Comida',
  'Cafeterías',
  '{"original_category":"Comida","original_subcategory":"Cafeterías","original_domain":"cafehaiti.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'castano',
  'Castaño',
  'CASTANO',
  'BRAND_CASTANO',
  'CL',
  'Comida',
  'Cafeterías',
  '{"original_category":"Comida","original_subcategory":"Cafeterías","original_domain":"castano.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'dunkin',
  'Dunkin',
  'DUNKIN',
  'BRAND_DUNKIN',
  'CL',
  'Comida',
  'Cafeterías',
  '{"original_category":"Comida","original_subcategory":"Cafeterías","original_domain":"dunkin.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'juan-valdez',
  'Juan Valdez',
  'JUAN VALDEZ',
  'BRAND_JUAN_VALDEZ',
  NULL,
  'Comida',
  'Cafeterías',
  '{"original_category":"Comida","original_subcategory":"Cafeterías","original_domain":"juanvaldezcafe.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'starbucks',
  'Starbucks',
  'STARBUCKS',
  'BRAND_STARBUCKS',
  'CL',
  'Comida',
  'Cafeterías',
  '{"original_category":"Comida","original_subcategory":"Cafeterías","original_domain":"starbucks.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'tavelli',
  'Tavelli',
  'TAVELLI',
  'BRAND_TAVELLI',
  'CL',
  'Comida',
  'Cafeterías',
  '{"original_category":"Comida","original_subcategory":"Cafeterías","original_domain":"tavelli.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'didi-food',
  'DiDi Food',
  'DIDI FOOD',
  'BRAND_DIDI_FOOD',
  NULL,
  'Comida',
  'Delivery',
  '{"original_category":"Comida","original_subcategory":"Delivery","original_domain":"didiglobal.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'justo',
  'Justo',
  'JUSTO',
  'BRAND_JUSTO',
  'CL',
  'Comida',
  'Delivery',
  '{"original_category":"Comida","original_subcategory":"Delivery","original_domain":"justo.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'orders',
  'Orders',
  'ORDERS',
  'BRAND_ORDERS',
  'CL',
  'Comida',
  'Delivery',
  '{"original_category":"Comida","original_subcategory":"Delivery","original_domain":"orders.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'pedidosya',
  'PedidosYa',
  'PEDIDOSYA',
  'BRAND_PEDIDOSYA',
  'CL',
  'Comida',
  'Delivery',
  '{"original_category":"Comida","original_subcategory":"Delivery","original_domain":"pedidosya.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'rappi',
  'Rappi',
  'RAPPI',
  'BRAND_RAPPI',
  NULL,
  'Comida',
  'Delivery',
  '{"original_category":"Comida","original_subcategory":"Delivery","original_domain":"rappi.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'uber-eats',
  'Uber Eats',
  'UBER EATS',
  'BRAND_UBER_EATS',
  NULL,
  'Comida',
  'Delivery',
  '{"original_category":"Comida","original_subcategory":"Delivery","original_domain":"ubereats.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'burger-king',
  'Burger King',
  'BURGER KING',
  'BRAND_BURGER_KING',
  'CL',
  'Comida',
  'Fast food',
  '{"original_category":"Comida","original_subcategory":"Fast food","original_domain":"burgerking.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'doggis',
  'Doggis',
  'DOGGIS',
  'BRAND_DOGGIS',
  'CL',
  'Comida',
  'Fast food',
  '{"original_category":"Comida","original_subcategory":"Fast food","original_domain":"doggis.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'juan-maestro',
  'Juan Maestro',
  'JUAN MAESTRO',
  'BRAND_JUAN_MAESTRO',
  'CL',
  'Comida',
  'Fast food',
  '{"original_category":"Comida","original_subcategory":"Fast food","original_domain":"juanmaestro.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'kfc',
  'KFC',
  'KFC',
  'BRAND_KFC',
  'CL',
  'Comida',
  'Fast food',
  '{"original_category":"Comida","original_subcategory":"Fast food","original_domain":"kfc.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'mcdonald-s',
  'McDonald''s',
  'MCDONALDS',
  'BRAND_MCDONALDS',
  'CL',
  'Comida',
  'Fast food',
  '{"original_category":"Comida","original_subcategory":"Fast food","original_domain":"mcdonalds.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'pedro-juan-diego',
  'Pedro, Juan & Diego',
  'PEDRO JUAN DIEGO',
  'BRAND_PEDRO_JUAN_DIEGO',
  'CL',
  'Comida',
  'Fast food',
  '{"original_category":"Comida","original_subcategory":"Fast food","original_domain":"pyd.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'subway',
  'Subway',
  'SUBWAY',
  'BRAND_SUBWAY',
  NULL,
  'Comida',
  'Fast food',
  '{"original_category":"Comida","original_subcategory":"Fast food","original_domain":"subway.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'tarragona',
  'Tarragona',
  'TARRAGONA',
  'BRAND_TARRAGONA',
  'CL',
  'Comida',
  'Fast food',
  '{"original_category":"Comida","original_subcategory":"Fast food","original_domain":"tarragona.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'domino-s',
  'Domino''s',
  'DOMINOS',
  'BRAND_DOMINOS',
  'CL',
  'Comida',
  'Pizza',
  '{"original_category":"Comida","original_subcategory":"Pizza","original_domain":"dominos.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'little-caesars',
  'Little Caesars',
  'LITTLE CAESARS',
  'BRAND_LITTLE_CAESARS',
  'CL',
  'Comida',
  'Pizza',
  '{"original_category":"Comida","original_subcategory":"Pizza","original_domain":"littlecaesars.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'melt-pizzas',
  'Melt Pizzas',
  'MELT PIZZAS',
  'BRAND_MELT_PIZZAS',
  NULL,
  'Comida',
  'Pizza',
  '{"original_category":"Comida","original_subcategory":"Pizza","original_domain":"meltpizzas.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'papa-johns',
  'Papa Johns',
  'PAPA JOHNS',
  'BRAND_PAPA_JOHNS',
  'CL',
  'Comida',
  'Pizza',
  '{"original_category":"Comida","original_subcategory":"Pizza","original_domain":"papajohns.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'pizza-hut',
  'Pizza Hut',
  'PIZZA HUT',
  'BRAND_PIZZA_HUT',
  'CL',
  'Comida',
  'Pizza',
  '{"original_category":"Comida","original_subcategory":"Pizza","original_domain":"pizzahut.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'telepizza',
  'Telepizza',
  'TELEPIZZA',
  'BRAND_TELEPIZZA',
  'CL',
  'Comida',
  'Pizza',
  '{"original_category":"Comida","original_subcategory":"Pizza","original_domain":"telepizza.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'cobreloa',
  'Cobreloa',
  'COBRELOA',
  'BRAND_COBRELOA',
  'CL',
  'Deportes',
  'Fútbol',
  '{"original_category":"Deportes","original_subcategory":"Fútbol","original_domain":"cobreloa.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'colo-colo',
  'Colo-Colo',
  'COLOCOLO',
  'BRAND_COLOCOLO',
  'CL',
  'Deportes',
  'Fútbol',
  '{"original_category":"Deportes","original_subcategory":"Fútbol","original_domain":"colocolo.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'santiago-wanderers',
  'Santiago Wanderers',
  'SANTIAGO WANDERERS',
  'BRAND_SANTIAGO_WANDERERS',
  'CL',
  'Deportes',
  'Fútbol',
  '{"original_category":"Deportes","original_subcategory":"Fútbol","original_domain":"santiagowanderers.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'universidad-catolica',
  'Universidad Católica',
  'UNIVERSIDAD CATOLICA',
  'BRAND_UNIVERSIDAD_CATOLICA',
  'CL',
  'Deportes',
  'Fútbol',
  '{"original_category":"Deportes","original_subcategory":"Fútbol","original_domain":"lacatolica.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'universidad-de-chile',
  'Universidad de Chile',
  'UNIVERSIDAD DE CHILE',
  'BRAND_UNIVERSIDAD_DE_CHILE',
  'CL',
  'Deportes',
  'Fútbol',
  '{"original_category":"Deportes","original_subcategory":"Fútbol","original_domain":"udechile.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'union-espanola',
  'Unión Española',
  'UNION ESPANOLA',
  'BRAND_UNION_ESPANOLA',
  'CL',
  'Deportes',
  'Fútbol',
  '{"original_category":"Deportes","original_subcategory":"Fútbol","original_domain":"unionespanola.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'aiep',
  'AIEP',
  'AIEP',
  'BRAND_AIEP',
  'CL',
  'Educación',
  'Institutos',
  '{"original_category":"Educación","original_subcategory":"Institutos","original_domain":"aiep.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'duoc-uc',
  'Duoc UC',
  'DUOC UC',
  'BRAND_DUOC_UC',
  'CL',
  'Educación',
  'Institutos',
  '{"original_category":"Educación","original_subcategory":"Institutos","original_domain":"duoc.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'enac',
  'ENAC',
  'ENAC',
  'BRAND_ENAC',
  'CL',
  'Educación',
  'Institutos',
  '{"original_category":"Educación","original_subcategory":"Institutos","original_domain":"enac.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'inacap',
  'INACAP',
  'INACAP',
  'BRAND_INACAP',
  'CL',
  'Educación',
  'Institutos',
  '{"original_category":"Educación","original_subcategory":"Institutos","original_domain":"inacap.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'ipchile',
  'IPChile',
  'IPCHILE',
  'BRAND_IPCHILE',
  'CL',
  'Educación',
  'Institutos',
  '{"original_category":"Educación","original_subcategory":"Institutos","original_domain":"ipchile.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'santo-tomas',
  'Santo Tomás',
  'SANTO TOMAS',
  'BRAND_SANTO_TOMAS',
  'CL',
  'Educación',
  'Institutos',
  '{"original_category":"Educación","original_subcategory":"Institutos","original_domain":"ust.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'cpech',
  'Cpech',
  'CPECH',
  'BRAND_CPECH',
  'CL',
  'Educación',
  'Preuniversitarios',
  '{"original_category":"Educación","original_subcategory":"Preuniversitarios","original_domain":"cpech.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'filadd',
  'Filadd',
  'FILADD',
  'BRAND_FILADD',
  'CL',
  'Educación',
  'Preuniversitarios',
  '{"original_category":"Educación","original_subcategory":"Preuniversitarios","original_domain":"filadd.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'm30m',
  'M30M',
  'M30M',
  'BRAND_M30M',
  NULL,
  'Educación',
  'Preuniversitarios',
  '{"original_category":"Educación","original_subcategory":"Preuniversitarios","original_domain":"preuniversitariom30m.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'pedro-de-valdivia',
  'Pedro de Valdivia',
  'PEDRO DE VALDIVIA',
  'BRAND_PEDRO_DE_VALDIVIA',
  'CL',
  'Educación',
  'Preuniversitarios',
  '{"original_category":"Educación","original_subcategory":"Preuniversitarios","original_domain":"pdv.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'preu-uc',
  'Preu UC',
  'PREU UC',
  'BRAND_PREU_UC',
  'CL',
  'Educación',
  'Preuniversitarios',
  '{"original_category":"Educación","original_subcategory":"Preuniversitarios","original_domain":"preupdv.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'puntaje-nacional',
  'Puntaje Nacional',
  'PUNTAJE NACIONAL',
  'BRAND_PUNTAJE_NACIONAL',
  'CL',
  'Educación',
  'Preuniversitarios',
  '{"original_category":"Educación","original_subcategory":"Preuniversitarios","original_domain":"puntajenacional.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'pontificia-universidad-catolica',
  'Pontificia Universidad Católica',
  'PONTIFICIA UNIVERSIDAD CATOLICA',
  'BRAND_PONTIFICIA_UNIVERSIDAD_CATOLICA',
  'CL',
  'Educación',
  'Universidades',
  '{"original_category":"Educación","original_subcategory":"Universidades","original_domain":"uc.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'uai',
  'UAI',
  'UAI',
  'BRAND_UAI',
  'CL',
  'Educación',
  'Universidades',
  '{"original_category":"Educación","original_subcategory":"Universidades","original_domain":"uai.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'udp',
  'UDP',
  'UDP',
  'BRAND_UDP',
  'CL',
  'Educación',
  'Universidades',
  '{"original_category":"Educación","original_subcategory":"Universidades","original_domain":"udp.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'usach',
  'USACH',
  'USACH',
  'BRAND_USACH',
  'CL',
  'Educación',
  'Universidades',
  '{"original_category":"Educación","original_subcategory":"Universidades","original_domain":"usach.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'universidad-de-chile',
  'Universidad de Chile',
  'UNIVERSIDAD DE CHILE',
  'BRAND_UNIVERSIDAD_DE_CHILE',
  'CL',
  'Educación',
  'Universidades',
  '{"original_category":"Educación","original_subcategory":"Universidades","original_domain":"uchile.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'universidad-de-concepcion',
  'Universidad de Concepción',
  'UNIVERSIDAD DE CONCEPCION',
  'BRAND_UNIVERSIDAD_DE_CONCEPCION',
  'CL',
  'Educación',
  'Universidades',
  '{"original_category":"Educación","original_subcategory":"Universidades","original_domain":"udec.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'cine-hoyts',
  'Cine Hoyts',
  'CINE HOYTS',
  'BRAND_CINE_HOYTS',
  'CL',
  'Entretenimiento',
  'Cines',
  '{"original_category":"Entretenimiento","original_subcategory":"Cines","original_domain":"cinehoyts.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'cinemark',
  'Cinemark',
  'CINEMARK',
  'BRAND_CINEMARK',
  'CL',
  'Entretenimiento',
  'Cines',
  '{"original_category":"Entretenimiento","original_subcategory":"Cines","original_domain":"cinemark.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'cineplanet',
  'Cineplanet',
  'CINEPLANET',
  'BRAND_CINEPLANET',
  'CL',
  'Entretenimiento',
  'Cines',
  '{"original_category":"Entretenimiento","original_subcategory":"Cines","original_domain":"cineplanet.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'cinestar',
  'Cinestar',
  'CINESTAR',
  'BRAND_CINESTAR',
  'CL',
  'Entretenimiento',
  'Cines',
  '{"original_category":"Entretenimiento","original_subcategory":"Cines","original_domain":"cinestar.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'cinepolis',
  'Cinépolis',
  'CINEPOLIS',
  'BRAND_CINEPOLIS',
  'CL',
  'Entretenimiento',
  'Cines',
  '{"original_category":"Entretenimiento","original_subcategory":"Cines","original_domain":"cinepolis.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'muvix',
  'Muvix',
  'MUVIX',
  'BRAND_MUVIX',
  'CL',
  'Entretenimiento',
  'Cines',
  '{"original_category":"Entretenimiento","original_subcategory":"Cines","original_domain":"muvix.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'discord',
  'Discord',
  'DISCORD',
  'BRAND_DISCORD',
  NULL,
  'Entretenimiento',
  'Comunidades',
  '{"original_category":"Entretenimiento","original_subcategory":"Comunidades","original_domain":"discord.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'pinterest',
  'Pinterest',
  'PINTEREST',
  'BRAND_PINTEREST',
  NULL,
  'Entretenimiento',
  'Comunidades',
  '{"original_category":"Entretenimiento","original_subcategory":"Comunidades","original_domain":"cl.pinterest.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'quora',
  'Quora',
  'QUORA',
  'BRAND_QUORA',
  NULL,
  'Entretenimiento',
  'Comunidades',
  '{"original_category":"Entretenimiento","original_subcategory":"Comunidades","original_domain":"quora.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'reddit',
  'Reddit',
  'REDDIT',
  'BRAND_REDDIT',
  NULL,
  'Entretenimiento',
  'Comunidades',
  '{"original_category":"Entretenimiento","original_subcategory":"Comunidades","original_domain":"reddit.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'steam-community',
  'Steam Community',
  'STEAM COMMUNITY',
  'BRAND_STEAM_COMMUNITY',
  NULL,
  'Entretenimiento',
  'Comunidades',
  '{"original_category":"Entretenimiento","original_subcategory":"Comunidades","original_domain":"steamcommunity.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'tumblr',
  'Tumblr',
  'TUMBLR',
  'BRAND_TUMBLR',
  NULL,
  'Entretenimiento',
  'Comunidades',
  '{"original_category":"Entretenimiento","original_subcategory":"Comunidades","original_domain":"tumblr.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'biobiochile',
  'BioBioChile',
  'BIOBIOCHILE',
  'BRAND_BIOBIOCHILE',
  'CL',
  'Medios',
  'Prensa digital',
  '{"original_category":"Medios","original_subcategory":"Prensa digital","original_domain":"biobiochile.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'cnn-chile',
  'CNN Chile',
  'CNN CHILE',
  'BRAND_CNN_CHILE',
  NULL,
  'Medios',
  'Prensa digital',
  '{"original_category":"Medios","original_subcategory":"Prensa digital","original_domain":"cnnchile.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'cooperativa',
  'Cooperativa',
  'COOPERATIVA',
  'BRAND_COOPERATIVA',
  'CL',
  'Medios',
  'Prensa digital',
  '{"original_category":"Medios","original_subcategory":"Prensa digital","original_domain":"cooperativa.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'el-mostrador',
  'El Mostrador',
  'EL MOSTRADOR',
  'BRAND_EL_MOSTRADOR',
  'CL',
  'Medios',
  'Prensa digital',
  '{"original_category":"Medios","original_subcategory":"Prensa digital","original_domain":"elmostrador.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'emol',
  'Emol',
  'EMOL',
  'BRAND_EMOL',
  NULL,
  'Medios',
  'Prensa digital',
  '{"original_category":"Medios","original_subcategory":"Prensa digital","original_domain":"emol.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'la-tercera',
  'La Tercera',
  'LA TERCERA',
  'BRAND_LA_TERCERA',
  NULL,
  'Medios',
  'Prensa digital',
  '{"original_category":"Medios","original_subcategory":"Prensa digital","original_domain":"latercera.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'adn-radio',
  'ADN Radio',
  'ADN RADIO',
  'BRAND_ADN_RADIO',
  'CL',
  'Medios',
  'Radios',
  '{"original_category":"Medios","original_subcategory":"Radios","original_domain":"adnradio.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'carolina',
  'Carolina',
  'CAROLINA',
  'BRAND_CAROLINA',
  'CL',
  'Medios',
  'Radios',
  '{"original_category":"Medios","original_subcategory":"Radios","original_domain":"radiocarolina.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'cooperativa',
  'Cooperativa',
  'COOPERATIVA',
  'BRAND_COOPERATIVA',
  'CL',
  'Medios',
  'Radios',
  '{"original_category":"Medios","original_subcategory":"Radios","original_domain":"cooperativa.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'pudahuel',
  'Pudahuel',
  'PUDAHUEL',
  'BRAND_PUDAHUEL',
  'CL',
  'Medios',
  'Radios',
  '{"original_category":"Medios","original_subcategory":"Radios","original_domain":"pudahuel.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'radio-agricultura',
  'Radio Agricultura',
  'RADIO AGRICULTURA',
  'BRAND_RADIO_AGRICULTURA',
  'CL',
  'Medios',
  'Radios',
  '{"original_category":"Medios","original_subcategory":"Radios","original_domain":"radioagricultura.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'radio-bio-bio',
  'Radio Bío Bío',
  'RADIO BIO BIO',
  'BRAND_RADIO_BIO_BIO',
  'CL',
  'Medios',
  'Radios',
  '{"original_category":"Medios","original_subcategory":"Radios","original_domain":"biobiochile.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'facebook',
  'Facebook',
  'FACEBOOK',
  'BRAND_FACEBOOK',
  NULL,
  'Medios',
  'Redes sociales',
  '{"original_category":"Medios","original_subcategory":"Redes sociales","original_domain":"facebook.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'instagram',
  'Instagram',
  'INSTAGRAM',
  'BRAND_INSTAGRAM',
  NULL,
  'Medios',
  'Redes sociales',
  '{"original_category":"Medios","original_subcategory":"Redes sociales","original_domain":"instagram.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'linkedin',
  'LinkedIn',
  'LINKEDIN',
  'BRAND_LINKEDIN',
  NULL,
  'Medios',
  'Redes sociales',
  '{"original_category":"Medios","original_subcategory":"Redes sociales","original_domain":"linkedin.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'snapchat',
  'Snapchat',
  'SNAPCHAT',
  'BRAND_SNAPCHAT',
  NULL,
  'Medios',
  'Redes sociales',
  '{"original_category":"Medios","original_subcategory":"Redes sociales","original_domain":"snapchat.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'tiktok',
  'TikTok',
  'TIKTOK',
  'BRAND_TIKTOK',
  NULL,
  'Medios',
  'Redes sociales',
  '{"original_category":"Medios","original_subcategory":"Redes sociales","original_domain":"tiktok.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'x',
  'X',
  'X',
  'BRAND_X',
  NULL,
  'Medios',
  'Redes sociales',
  '{"original_category":"Medios","original_subcategory":"Redes sociales","original_domain":"x.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'amazon-music',
  'Amazon Music',
  'AMAZON MUSIC',
  'BRAND_AMAZON_MUSIC',
  NULL,
  'Entretenimiento',
  'Streaming de música',
  '{"original_category":"Entretenimiento","original_subcategory":"Streaming de música","original_domain":"music.amazon.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'apple-music',
  'Apple Music',
  'APPLE MUSIC',
  'BRAND_APPLE_MUSIC',
  NULL,
  'Entretenimiento',
  'Streaming de música',
  '{"original_category":"Entretenimiento","original_subcategory":"Streaming de música","original_domain":"music.apple.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'deezer',
  'Deezer',
  'DEEZER',
  'BRAND_DEEZER',
  NULL,
  'Entretenimiento',
  'Streaming de música',
  '{"original_category":"Entretenimiento","original_subcategory":"Streaming de música","original_domain":"deezer.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'spotify',
  'Spotify',
  'SPOTIFY',
  'BRAND_SPOTIFY',
  NULL,
  'Entretenimiento',
  'Streaming de música',
  '{"original_category":"Entretenimiento","original_subcategory":"Streaming de música","original_domain":"spotify.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'tidal',
  'TIDAL',
  'TIDAL',
  'BRAND_TIDAL',
  NULL,
  'Entretenimiento',
  'Streaming de música',
  '{"original_category":"Entretenimiento","original_subcategory":"Streaming de música","original_domain":"tidal.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'youtube-music',
  'YouTube Music',
  'YOUTUBE MUSIC',
  'BRAND_YOUTUBE_MUSIC',
  NULL,
  'Entretenimiento',
  'Streaming de música',
  '{"original_category":"Entretenimiento","original_subcategory":"Streaming de música","original_domain":"music.youtube.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'apple-tv',
  'Apple TV+',
  'APPLE TV',
  'BRAND_APPLE_TV',
  NULL,
  'Entretenimiento',
  'Streaming de video',
  '{"original_category":"Entretenimiento","original_subcategory":"Streaming de video","original_domain":"tv.apple.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'disney',
  'Disney+',
  'DISNEY',
  'BRAND_DISNEY',
  NULL,
  'Entretenimiento',
  'Streaming de video',
  '{"original_category":"Entretenimiento","original_subcategory":"Streaming de video","original_domain":"disneyplus.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'mubi',
  'MUBI',
  'MUBI',
  'BRAND_MUBI',
  NULL,
  'Entretenimiento',
  'Streaming de video',
  '{"original_category":"Entretenimiento","original_subcategory":"Streaming de video","original_domain":"mubi.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'max',
  'Max',
  'MAX',
  'BRAND_MAX',
  NULL,
  'Entretenimiento',
  'Streaming de video',
  '{"original_category":"Entretenimiento","original_subcategory":"Streaming de video","original_domain":"max.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'netflix',
  'Netflix',
  'NETFLIX',
  'BRAND_NETFLIX',
  NULL,
  'Entretenimiento',
  'Streaming de video',
  '{"original_category":"Entretenimiento","original_subcategory":"Streaming de video","original_domain":"netflix.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'paramount',
  'Paramount+',
  'PARAMOUNT',
  'BRAND_PARAMOUNT',
  NULL,
  'Entretenimiento',
  'Streaming de video',
  '{"original_category":"Entretenimiento","original_subcategory":"Streaming de video","original_domain":"paramountplus.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'prime-video',
  'Prime Video',
  'PRIME VIDEO',
  'BRAND_PRIME_VIDEO',
  NULL,
  'Entretenimiento',
  'Streaming de video',
  '{"original_category":"Entretenimiento","original_subcategory":"Streaming de video","original_domain":"primevideo.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'universal',
  'Universal+',
  'UNIVERSAL',
  'BRAND_UNIVERSAL',
  NULL,
  'Entretenimiento',
  'Streaming de video',
  '{"original_category":"Entretenimiento","original_subcategory":"Streaming de video","original_domain":"universalplus.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'canal-13',
  'Canal 13',
  'CANAL 13',
  'BRAND_CANAL_13',
  'CL',
  'Entretenimiento',
  'TV abierta',
  '{"original_category":"Entretenimiento","original_subcategory":"TV abierta","original_domain":"13.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'chilevision',
  'Chilevisión',
  'CHILEVISION',
  'BRAND_CHILEVISION',
  'CL',
  'Entretenimiento',
  'TV abierta',
  '{"original_category":"Entretenimiento","original_subcategory":"TV abierta","original_domain":"chv.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'la-red',
  'La Red',
  'LA RED',
  'BRAND_LA_RED',
  'CL',
  'Entretenimiento',
  'TV abierta',
  '{"original_category":"Entretenimiento","original_subcategory":"TV abierta","original_domain":"lared.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'mega',
  'Mega',
  'MEGA',
  'BRAND_MEGA',
  'CL',
  'Entretenimiento',
  'TV abierta',
  '{"original_category":"Entretenimiento","original_subcategory":"TV abierta","original_domain":"mega.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'tv',
  'TV+',
  'TV',
  'BRAND_TV',
  NULL,
  'Entretenimiento',
  'TV abierta',
  '{"original_category":"Entretenimiento","original_subcategory":"TV abierta","original_domain":null,"catalog_source":"excel","curation_status":"needs_review","notes":"Domain review needed."}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'tvn',
  'TVN',
  'TVN',
  'BRAND_TVN',
  'CL',
  'Entretenimiento',
  'TV abierta',
  '{"original_category":"Entretenimiento","original_subcategory":"TV abierta","original_domain":"tvn.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'bci',
  'BCI',
  'BCI',
  'BRAND_BCI',
  'CL',
  'Finanzas',
  'Bancos',
  '{"original_category":"Finanzas","original_subcategory":"Bancos","original_domain":"bci.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'banco-bice',
  'Banco BICE',
  'BANCO BICE',
  'BRAND_BANCO_BICE',
  'CL',
  'Finanzas',
  'Bancos',
  '{"original_category":"Finanzas","original_subcategory":"Bancos","original_domain":"bice.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'banco-falabella',
  'Banco Falabella',
  'BANCO FALABELLA',
  'BRAND_BANCO_FALABELLA',
  'CL',
  'Finanzas',
  'Bancos',
  '{"original_category":"Finanzas","original_subcategory":"Bancos","original_domain":"bancofalabella.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'banco-de-chile',
  'Banco de Chile',
  'BANCO DE CHILE',
  'BRAND_BANCO_DE_CHILE',
  'CL',
  'Finanzas',
  'Bancos',
  '{"original_category":"Finanzas","original_subcategory":"Bancos","original_domain":"bancochile.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'bancoestado',
  'BancoEstado',
  'BANCOESTADO',
  'BRAND_BANCOESTADO',
  'CL',
  'Finanzas',
  'Bancos',
  '{"original_category":"Finanzas","original_subcategory":"Bancos","original_domain":"bancoestado.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'consorcio',
  'Consorcio',
  'CONSORCIO',
  'BRAND_CONSORCIO',
  'CL',
  'Finanzas',
  'Bancos',
  '{"original_category":"Finanzas","original_subcategory":"Bancos","original_domain":"consorcio.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'itau',
  'Itaú',
  'ITAU',
  'BRAND_ITAU',
  'CL',
  'Finanzas',
  'Bancos',
  '{"original_category":"Finanzas","original_subcategory":"Bancos","original_domain":"itau.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'santander',
  'Santander',
  'SANTANDER',
  'BRAND_SANTANDER',
  'CL',
  'Finanzas',
  'Bancos',
  '{"original_category":"Finanzas","original_subcategory":"Bancos","original_domain":"santander.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'scotiabank',
  'Scotiabank',
  'SCOTIABANK',
  'BRAND_SCOTIABANK',
  'CL',
  'Finanzas',
  'Bancos',
  '{"original_category":"Finanzas","original_subcategory":"Bancos","original_domain":"scotiabankchile.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'security',
  'Security',
  'SECURITY',
  'BRAND_SECURITY',
  'CL',
  'Finanzas',
  'Bancos',
  '{"original_category":"Finanzas","original_subcategory":"Bancos","original_domain":"security.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'chek',
  'Chek',
  'CHEK',
  'BRAND_CHEK',
  'CL',
  'Finanzas',
  'Fintech',
  '{"original_category":"Finanzas","original_subcategory":"Fintech","original_domain":"simple.ripley.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'fintual',
  'Fintual',
  'FINTUAL',
  'BRAND_FINTUAL',
  'CL',
  'Finanzas',
  'Fintech',
  '{"original_category":"Finanzas","original_subcategory":"Fintech","original_domain":"fintual.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'global66',
  'Global66',
  'GLOBAL66',
  'BRAND_GLOBAL66',
  NULL,
  'Finanzas',
  'Fintech',
  '{"original_category":"Finanzas","original_subcategory":"Fintech","original_domain":"global66.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'mach',
  'MACH',
  'MACH',
  'BRAND_MACH',
  NULL,
  'Finanzas',
  'Fintech',
  '{"original_category":"Finanzas","original_subcategory":"Fintech","original_domain":"somosmach.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'mercado-pago',
  'Mercado Pago',
  'MERCADO PAGO',
  'BRAND_MERCADO_PAGO',
  'CL',
  'Finanzas',
  'Fintech',
  '{"original_category":"Finanzas","original_subcategory":"Fintech","original_domain":"mercadopago.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'prex',
  'Prex',
  'PREX',
  'BRAND_PREX',
  'CL',
  'Finanzas',
  'Fintech',
  '{"original_category":"Finanzas","original_subcategory":"Fintech","original_domain":"prexcard.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'tapp',
  'Tapp',
  'TAPP',
  'BRAND_TAPP',
  'CL',
  'Finanzas',
  'Fintech',
  '{"original_category":"Finanzas","original_subcategory":"Fintech","original_domain":"tapp.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'tenpo',
  'Tenpo',
  'TENPO',
  'BRAND_TENPO',
  'CL',
  'Finanzas',
  'Fintech',
  '{"original_category":"Finanzas","original_subcategory":"Fintech","original_domain":"tenpo.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'bice-inversiones',
  'BICE Inversiones',
  'BICE INVERSIONES',
  'BRAND_BICE_INVERSIONES',
  'CL',
  'Finanzas',
  'Inversiones',
  '{"original_category":"Finanzas","original_subcategory":"Inversiones","original_domain":"biceinversiones.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'btg-pactual',
  'BTG Pactual',
  'BTG PACTUAL',
  'BRAND_BTG_PACTUAL',
  'CL',
  'Finanzas',
  'Inversiones',
  '{"original_category":"Finanzas","original_subcategory":"Inversiones","original_domain":"btgpactual.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'banchile-inversiones',
  'Banchile Inversiones',
  'BANCHILE INVERSIONES',
  'BRAND_BANCHILE_INVERSIONES',
  'CL',
  'Finanzas',
  'Inversiones',
  '{"original_category":"Finanzas","original_subcategory":"Inversiones","original_domain":"banchileinversiones.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'fintual',
  'Fintual',
  'FINTUAL',
  'BRAND_FINTUAL',
  'CL',
  'Finanzas',
  'Inversiones',
  '{"original_category":"Finanzas","original_subcategory":"Inversiones","original_domain":"fintual.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'larrainvial',
  'LarrainVial',
  'LARRAINVIAL',
  'BRAND_LARRAINVIAL',
  NULL,
  'Finanzas',
  'Inversiones',
  '{"original_category":"Finanzas","original_subcategory":"Inversiones","original_domain":"larrainvial.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'mbi',
  'MBI',
  'MBI',
  'BRAND_MBI',
  'CL',
  'Finanzas',
  'Inversiones',
  '{"original_category":"Finanzas","original_subcategory":"Inversiones","original_domain":"mbi.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'renta4',
  'Renta4',
  'RENTA4',
  'BRAND_RENTA4',
  'CL',
  'Finanzas',
  'Inversiones',
  '{"original_category":"Finanzas","original_subcategory":"Inversiones","original_domain":"renta4.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'santander-corredora',
  'Santander Corredora',
  'SANTANDER CORREDORA',
  'BRAND_SANTANDER_CORREDORA',
  'CL',
  'Finanzas',
  'Inversiones',
  '{"original_category":"Finanzas","original_subcategory":"Inversiones","original_domain":"santander.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'american-express',
  'American Express',
  'AMERICAN EXPRESS',
  'BRAND_AMERICAN_EXPRESS',
  NULL,
  'Finanzas',
  'Medios de Pago',
  '{"original_category":"Finanzas","original_subcategory":"Medios de Pago","original_domain":"americanexpress.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'cmr-falabella',
  'CMR Falabella',
  'CMR FALABELLA',
  'BRAND_CMR_FALABELLA',
  NULL,
  'Finanzas',
  'Medios de Pago',
  '{"original_category":"Finanzas","original_subcategory":"Medios de Pago","original_domain":"cmrfalabella.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'getnet',
  'Getnet',
  'GETNET',
  'BRAND_GETNET',
  'CL',
  'Finanzas',
  'Medios de Pago',
  '{"original_category":"Finanzas","original_subcategory":"Medios de Pago","original_domain":"getnet.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'mastercard',
  'Mastercard',
  'MASTERCARD',
  'BRAND_MASTERCARD',
  'CL',
  'Finanzas',
  'Medios de Pago',
  '{"original_category":"Finanzas","original_subcategory":"Medios de Pago","original_domain":"mastercard.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'mercado-pago',
  'Mercado Pago',
  'MERCADO PAGO',
  'BRAND_MERCADO_PAGO',
  'CL',
  'Finanzas',
  'Medios de Pago',
  '{"original_category":"Finanzas","original_subcategory":"Medios de Pago","original_domain":"mercadopago.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'redcompra',
  'Redcompra',
  'REDCOMPRA',
  'BRAND_REDCOMPRA',
  'CL',
  'Finanzas',
  'Medios de Pago',
  '{"original_category":"Finanzas","original_subcategory":"Medios de Pago","original_domain":"redcompra.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'visa',
  'Visa',
  'VISA',
  'BRAND_VISA',
  NULL,
  'Finanzas',
  'Medios de Pago',
  '{"original_category":"Finanzas","original_subcategory":"Medios de Pago","original_domain":"visa.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'webpay',
  'Webpay',
  'WEBPAY',
  'BRAND_WEBPAY',
  'CL',
  'Finanzas',
  'Medios de Pago',
  '{"original_category":"Finanzas","original_subcategory":"Medios de Pago","original_domain":"webpay.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'dyson',
  'Dyson',
  'DYSON',
  'BRAND_DYSON',
  'CL',
  'Hogar',
  'Aspiradoras',
  '{"original_category":"Hogar","original_subcategory":"Aspiradoras","original_domain":"dyson.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'electrolux',
  'Electrolux',
  'ELECTROLUX',
  'BRAND_ELECTROLUX',
  'CL',
  'Hogar',
  'Aspiradoras',
  '{"original_category":"Hogar","original_subcategory":"Aspiradoras","original_domain":"electrolux.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'philips',
  'Philips',
  'PHILIPS',
  'BRAND_PHILIPS',
  'CL',
  'Hogar',
  'Aspiradoras',
  '{"original_category":"Hogar","original_subcategory":"Aspiradoras","original_domain":"philips.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'thomas',
  'Thomas',
  'THOMAS',
  'BRAND_THOMAS',
  'CL',
  'Hogar',
  'Aspiradoras',
  '{"original_category":"Hogar","original_subcategory":"Aspiradoras","original_domain":"thomas.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'ursus-trotter',
  'Ursus Trotter',
  'URSUS TROTTER',
  'BRAND_URSUS_TROTTER',
  'CL',
  'Hogar',
  'Aspiradoras',
  '{"original_category":"Hogar","original_subcategory":"Aspiradoras","original_domain":"ursustrotter.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'xiaomi',
  'Xiaomi',
  'XIAOMI',
  'BRAND_XIAOMI',
  'CL',
  'Hogar',
  'Aspiradoras',
  '{"original_category":"Hogar","original_subcategory":"Aspiradoras","original_domain":"xiaomi.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'cic',
  'CIC',
  'CIC',
  'BRAND_CIC',
  'CL',
  'Hogar',
  'Colchones',
  '{"original_category":"Hogar","original_subcategory":"Colchones","original_domain":"cic.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'drimkip',
  'Drimkip',
  'DRIMKIP',
  'BRAND_DRIMKIP',
  'CL',
  'Hogar',
  'Colchones',
  '{"original_category":"Hogar","original_subcategory":"Colchones","original_domain":"drimkip.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'emma',
  'Emma',
  'EMMA',
  'BRAND_EMMA',
  'CL',
  'Hogar',
  'Colchones',
  '{"original_category":"Hogar","original_subcategory":"Colchones","original_domain":"emma-colchon.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'flex',
  'Flex',
  'FLEX',
  'BRAND_FLEX',
  'CL',
  'Hogar',
  'Colchones',
  '{"original_category":"Hogar","original_subcategory":"Colchones","original_domain":"flex.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'mantahue',
  'Mantahue',
  'MANTAHUE',
  'BRAND_MANTAHUE',
  'CL',
  'Hogar',
  'Colchones',
  '{"original_category":"Hogar","original_subcategory":"Colchones","original_domain":"mantahue.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'rosen',
  'Rosen',
  'ROSEN',
  'BRAND_ROSEN',
  'CL',
  'Hogar',
  'Colchones',
  '{"original_category":"Hogar","original_subcategory":"Colchones","original_domain":"rosen.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'bosch',
  'Bosch',
  'BOSCH',
  'BRAND_BOSCH',
  'CL',
  'Hogar',
  'Lavadoras',
  '{"original_category":"Hogar","original_subcategory":"Lavadoras","original_domain":"bosch.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'fensa',
  'Fensa',
  'FENSA',
  'BRAND_FENSA',
  'CL',
  'Hogar',
  'Lavadoras',
  '{"original_category":"Hogar","original_subcategory":"Lavadoras","original_domain":"fensa.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'lg',
  'LG',
  'LG',
  'BRAND_LG',
  NULL,
  'Hogar',
  'Lavadoras',
  '{"original_category":"Hogar","original_subcategory":"Lavadoras","original_domain":"lg.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'midea',
  'Midea',
  'MIDEA',
  'BRAND_MIDEA',
  'CL',
  'Hogar',
  'Lavadoras',
  '{"original_category":"Hogar","original_subcategory":"Lavadoras","original_domain":"midea.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'samsung',
  'Samsung',
  'SAMSUNG',
  'BRAND_SAMSUNG',
  NULL,
  'Hogar',
  'Lavadoras',
  '{"original_category":"Hogar","original_subcategory":"Lavadoras","original_domain":"samsung.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'whirlpool',
  'Whirlpool',
  'WHIRLPOOL',
  'BRAND_WHIRLPOOL',
  'CL',
  'Hogar',
  'Lavadoras',
  '{"original_category":"Hogar","original_subcategory":"Lavadoras","original_domain":"whirlpool.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'bosch',
  'Bosch',
  'BOSCH',
  'BRAND_BOSCH',
  'CL',
  'Hogar',
  'Refrigeradores',
  '{"original_category":"Hogar","original_subcategory":"Refrigeradores","original_domain":"bosch.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'electrolux',
  'Electrolux',
  'ELECTROLUX',
  'BRAND_ELECTROLUX',
  'CL',
  'Hogar',
  'Refrigeradores',
  '{"original_category":"Hogar","original_subcategory":"Refrigeradores","original_domain":"electrolux.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'lg',
  'LG',
  'LG',
  'BRAND_LG',
  NULL,
  'Hogar',
  'Refrigeradores',
  '{"original_category":"Hogar","original_subcategory":"Refrigeradores","original_domain":"lg.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'midea',
  'Midea',
  'MIDEA',
  'BRAND_MIDEA',
  NULL,
  'Hogar',
  'Refrigeradores',
  '{"original_category":"Hogar","original_subcategory":"Refrigeradores","original_domain":"midea.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'samsung',
  'Samsung',
  'SAMSUNG',
  'BRAND_SAMSUNG',
  NULL,
  'Hogar',
  'Refrigeradores',
  '{"original_category":"Hogar","original_subcategory":"Refrigeradores","original_domain":"samsung.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'whirlpool',
  'Whirlpool',
  'WHIRLPOOL',
  'BRAND_WHIRLPOOL',
  'CL',
  'Hogar',
  'Refrigeradores',
  '{"original_category":"Hogar","original_subcategory":"Refrigeradores","original_domain":"whirlpool.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'acana',
  'Acana',
  'ACANA',
  'BRAND_ACANA',
  NULL,
  'Mascotas',
  'Alimento para gatos',
  '{"original_category":"Mascotas","original_subcategory":"Alimento para gatos","original_domain":"acana.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'bravery',
  'Bravery',
  'BRAVERY',
  'BRAND_BRAVERY',
  'CL',
  'Mascotas',
  'Alimento para gatos',
  '{"original_category":"Mascotas","original_subcategory":"Alimento para gatos","original_domain":"bravery.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'cat-chow',
  'Cat Chow',
  'CAT CHOW',
  'BRAND_CAT_CHOW',
  'CL',
  'Mascotas',
  'Alimento para gatos',
  '{"original_category":"Mascotas","original_subcategory":"Alimento para gatos","original_domain":"purina.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'pro-plan',
  'Pro Plan',
  'PRO PLAN',
  'BRAND_PRO_PLAN',
  NULL,
  'Mascotas',
  'Alimento para gatos',
  '{"original_category":"Mascotas","original_subcategory":"Alimento para gatos","original_domain":null,"catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'royal-canin',
  'Royal Canin',
  'ROYAL CANIN',
  'BRAND_ROYAL_CANIN',
  NULL,
  'Mascotas',
  'Alimento para gatos',
  '{"original_category":"Mascotas","original_subcategory":"Alimento para gatos","original_domain":"royalcanin.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'whiskas',
  'Whiskas',
  'WHISKAS',
  'BRAND_WHISKAS',
  'CL',
  'Mascotas',
  'Alimento para gatos',
  '{"original_category":"Mascotas","original_subcategory":"Alimento para gatos","original_domain":"whiskas.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'acana',
  'Acana',
  'ACANA',
  'BRAND_ACANA',
  NULL,
  'Mascotas',
  'Alimento para perros',
  '{"original_category":"Mascotas","original_subcategory":"Alimento para perros","original_domain":"acana.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'bravery',
  'Bravery',
  'BRAVERY',
  'BRAND_BRAVERY',
  'CL',
  'Mascotas',
  'Alimento para perros',
  '{"original_category":"Mascotas","original_subcategory":"Alimento para perros","original_domain":"bravery.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'dog-chow',
  'Dog Chow',
  'DOG CHOW',
  'BRAND_DOG_CHOW',
  NULL,
  'Mascotas',
  'Alimento para perros',
  '{"original_category":"Mascotas","original_subcategory":"Alimento para perros","original_domain":null,"catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'pedigree',
  'Pedigree',
  'PEDIGREE',
  'BRAND_PEDIGREE',
  'CL',
  'Mascotas',
  'Alimento para perros',
  '{"original_category":"Mascotas","original_subcategory":"Alimento para perros","original_domain":"pedigree.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'pro-plan',
  'Pro Plan',
  'PRO PLAN',
  'BRAND_PRO_PLAN',
  'CL',
  'Mascotas',
  'Alimento para perros',
  '{"original_category":"Mascotas","original_subcategory":"Alimento para perros","original_domain":"purina.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'royal-canin',
  'Royal Canin',
  'ROYAL CANIN',
  'BRAND_ROYAL_CANIN',
  NULL,
  'Mascotas',
  'Alimento para perros',
  '{"original_category":"Mascotas","original_subcategory":"Alimento para perros","original_domain":"royalcanin.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'clinica-veterinaria-alemana',
  'Clínica Veterinaria Alemana',
  'CLINICA VETERINARIA ALEMANA',
  'BRAND_CLINICA_VETERINARIA_ALEMANA',
  'CL',
  'Mascotas',
  'Clínicas veterinarias',
  '{"original_category":"Mascotas","original_subcategory":"Clínicas veterinarias","original_domain":"cv-alemana.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'hospital-clinico-veterinario-u-de-chile',
  'Hospital Clínico Veterinario U. de Chile',
  'HOSPITAL CLINICO VETERINARIO U DE CHILE',
  'BRAND_HOSPITAL_CLINICO_VETERINARIO_U_DE_CHILE',
  'CL',
  'Mascotas',
  'Clínicas veterinarias',
  '{"original_category":"Mascotas","original_subcategory":"Clínicas veterinarias","original_domain":"hcv.uchile.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'petsalud',
  'PetSalud',
  'PETSALUD',
  'BRAND_PETSALUD',
  'CL',
  'Mascotas',
  'Clínicas veterinarias',
  '{"original_category":"Mascotas","original_subcategory":"Clínicas veterinarias","original_domain":"petsalud.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'vet24',
  'Vet24',
  'VET24',
  'BRAND_VET24',
  'CL',
  'Mascotas',
  'Clínicas veterinarias',
  '{"original_category":"Mascotas","original_subcategory":"Clínicas veterinarias","original_domain":"vet24.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'vetpoint',
  'VetPoint',
  'VETPOINT',
  'BRAND_VETPOINT',
  'CL',
  'Mascotas',
  'Clínicas veterinarias',
  '{"original_category":"Mascotas","original_subcategory":"Clínicas veterinarias","original_domain":"vetpoint.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'vets',
  'Vets',
  'VETS',
  'BRAND_VETS',
  'CL',
  'Mascotas',
  'Clínicas veterinarias',
  '{"original_category":"Mascotas","original_subcategory":"Clínicas veterinarias","original_domain":"vets.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'club-de-perros-y-gatos',
  'Club de Perros y Gatos',
  'CLUB DE PERROS Y GATOS',
  'BRAND_CLUB_DE_PERROS_Y_GATOS',
  'CL',
  'Mascotas',
  'Tiendas de mascotas',
  '{"original_category":"Mascotas","original_subcategory":"Tiendas de mascotas","original_domain":"clubdeperrosygatos.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'maspet',
  'Maspet',
  'MASPET',
  'BRAND_MASPET',
  'CL',
  'Mascotas',
  'Tiendas de mascotas',
  '{"original_category":"Mascotas","original_subcategory":"Tiendas de mascotas","original_domain":"maspet.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'pet-bj',
  'Pet BJ',
  'PET BJ',
  'BRAND_PET_BJ',
  'CL',
  'Mascotas',
  'Tiendas de mascotas',
  '{"original_category":"Mascotas","original_subcategory":"Tiendas de mascotas","original_domain":"petbj.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'pet-happy',
  'Pet Happy',
  'PET HAPPY',
  'BRAND_PET_HAPPY',
  'CL',
  'Mascotas',
  'Tiendas de mascotas',
  '{"original_category":"Mascotas","original_subcategory":"Tiendas de mascotas","original_domain":"pethappy.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'petslandia',
  'Petslandia',
  'PETSLANDIA',
  'BRAND_PETSLANDIA',
  'CL',
  'Mascotas',
  'Tiendas de mascotas',
  '{"original_category":"Mascotas","original_subcategory":"Tiendas de mascotas","original_domain":"petslandia.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'superzoo',
  'SuperZoo',
  'SUPERZOO',
  'BRAND_SUPERZOO',
  'CL',
  'Mascotas',
  'Tiendas de mascotas',
  '{"original_category":"Mascotas","original_subcategory":"Tiendas de mascotas","original_domain":"superzoo.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'amphora',
  'Amphora',
  'AMPHORA',
  'BRAND_AMPHORA',
  'CL',
  'Moda',
  'Accesorios',
  '{"original_category":"Moda","original_subcategory":"Accesorios","original_domain":"amphora.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'pandora',
  'Pandora',
  'PANDORA',
  'BRAND_PANDORA',
  NULL,
  'Moda',
  'Accesorios',
  '{"original_category":"Moda","original_subcategory":"Accesorios","original_domain":"pandoraoficial.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'saxoline',
  'Saxoline',
  'SAXOLINE',
  'BRAND_SAXOLINE',
  'CL',
  'Moda',
  'Accesorios',
  '{"original_category":"Moda","original_subcategory":"Accesorios","original_domain":"saxoline.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'secret',
  'Secret',
  'SECRET',
  'BRAND_SECRET',
  'CL',
  'Moda',
  'Accesorios',
  '{"original_category":"Moda","original_subcategory":"Accesorios","original_domain":"secret.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'swarovski',
  'Swarovski',
  'SWAROVSKI',
  'BRAND_SWAROVSKI',
  NULL,
  'Moda',
  'Accesorios',
  '{"original_category":"Moda","original_subcategory":"Accesorios","original_domain":"swarovski.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'tous',
  'Tous',
  'TOUS',
  'BRAND_TOUS',
  NULL,
  'Moda',
  'Accesorios',
  '{"original_category":"Moda","original_subcategory":"Accesorios","original_domain":"tous.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'aldo',
  'Aldo',
  'ALDO',
  'BRAND_ALDO',
  NULL,
  'Moda',
  'Calzado',
  '{"original_category":"Moda","original_subcategory":"Calzado","original_domain":"aldoshoes.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'bata',
  'Bata',
  'BATA',
  'BRAND_BATA',
  'CL',
  'Moda',
  'Calzado',
  '{"original_category":"Moda","original_subcategory":"Calzado","original_domain":"bata.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'guante',
  'Guante',
  'GUANTE',
  'BRAND_GUANTE',
  'CL',
  'Moda',
  'Calzado',
  '{"original_category":"Moda","original_subcategory":"Calzado","original_domain":"guante.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'hush-puppies',
  'Hush Puppies',
  'HUSH PUPPIES',
  'BRAND_HUSH_PUPPIES',
  'CL',
  'Moda',
  'Calzado',
  '{"original_category":"Moda","original_subcategory":"Calzado","original_domain":"hushpuppies.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'nike',
  'Nike',
  'NIKE',
  'BRAND_NIKE',
  NULL,
  'Moda',
  'Calzado',
  '{"original_category":"Moda","original_subcategory":"Calzado","original_domain":"nike.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'skechers',
  'Skechers',
  'SKECHERS',
  'BRAND_SKECHERS',
  'CL',
  'Moda',
  'Calzado',
  '{"original_category":"Moda","original_subcategory":"Calzado","original_domain":"skechers.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'adidas',
  'adidas',
  'ADIDAS',
  'BRAND_ADIDAS',
  'CL',
  'Moda',
  'Calzado',
  '{"original_category":"Moda","original_subcategory":"Calzado","original_domain":"adidas.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'decathlon',
  'Decathlon',
  'DECATHLON',
  'BRAND_DECATHLON',
  'CL',
  'Moda',
  'Deportivo',
  '{"original_category":"Moda","original_subcategory":"Deportivo","original_domain":"decathlon.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'new-balance',
  'New Balance',
  'NEW BALANCE',
  'BRAND_NEW_BALANCE',
  'CL',
  'Moda',
  'Deportivo',
  '{"original_category":"Moda","original_subcategory":"Deportivo","original_domain":"newbalance.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'nike',
  'Nike',
  'NIKE',
  'BRAND_NIKE',
  NULL,
  'Moda',
  'Deportivo',
  '{"original_category":"Moda","original_subcategory":"Deportivo","original_domain":"nike.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'puma',
  'Puma',
  'PUMA',
  'BRAND_PUMA',
  NULL,
  'Moda',
  'Deportivo',
  '{"original_category":"Moda","original_subcategory":"Deportivo","original_domain":"puma.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'reebok',
  'Reebok',
  'REEBOK',
  'BRAND_REEBOK',
  NULL,
  'Moda',
  'Deportivo',
  '{"original_category":"Moda","original_subcategory":"Deportivo","original_domain":"reebok.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'sparta',
  'Sparta',
  'SPARTA',
  'BRAND_SPARTA',
  'CL',
  'Moda',
  'Deportivo',
  '{"original_category":"Moda","original_subcategory":"Deportivo","original_domain":"sparta.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'under-armour',
  'Under Armour',
  'UNDER ARMOUR',
  'BRAND_UNDER_ARMOUR',
  'CL',
  'Moda',
  'Deportivo',
  '{"original_category":"Moda","original_subcategory":"Deportivo","original_domain":"underarmour.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'adidas',
  'adidas',
  'ADIDAS',
  'BRAND_ADIDAS',
  'CL',
  'Moda',
  'Deportivo',
  '{"original_category":"Moda","original_subcategory":"Deportivo","original_domain":"adidas.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'bershka',
  'Bershka',
  'BERSHKA',
  'BRAND_BERSHKA',
  NULL,
  'Moda',
  'Fast fashion',
  '{"original_category":"Moda","original_subcategory":"Fast fashion","original_domain":"bershka.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'forever-21',
  'Forever 21',
  'FOREVER 21',
  'BRAND_FOREVER_21',
  NULL,
  'Moda',
  'Fast fashion',
  '{"original_category":"Moda","original_subcategory":"Fast fashion","original_domain":"forever21.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'h-m',
  'H&M',
  'HM',
  'BRAND_HM',
  NULL,
  'Moda',
  'Fast fashion',
  '{"original_category":"Moda","original_subcategory":"Fast fashion","original_domain":"cl.hm.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'mango',
  'Mango',
  'MANGO',
  'BRAND_MANGO',
  NULL,
  'Moda',
  'Fast fashion',
  '{"original_category":"Moda","original_subcategory":"Fast fashion","original_domain":"shop.mango.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'pull-bear',
  'Pull&Bear',
  'PULLBEAR',
  'BRAND_PULLBEAR',
  NULL,
  'Moda',
  'Fast fashion',
  '{"original_category":"Moda","original_subcategory":"Fast fashion","original_domain":"pullandbear.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'stradivarius',
  'Stradivarius',
  'STRADIVARIUS',
  'BRAND_STRADIVARIUS',
  NULL,
  'Moda',
  'Fast fashion',
  '{"original_category":"Moda","original_subcategory":"Fast fashion","original_domain":"stradivarius.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'zara',
  'Zara',
  'ZARA',
  'BRAND_ZARA',
  NULL,
  'Moda',
  'Fast fashion',
  '{"original_category":"Moda","original_subcategory":"Fast fashion","original_domain":"zara.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'columbia',
  'Columbia',
  'COLUMBIA',
  'BRAND_COLUMBIA',
  'CL',
  'Moda',
  'Outdoor',
  '{"original_category":"Moda","original_subcategory":"Outdoor","original_domain":"columbiachile.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'doite',
  'Doite',
  'DOITE',
  'BRAND_DOITE',
  'CL',
  'Moda',
  'Outdoor',
  '{"original_category":"Moda","original_subcategory":"Outdoor","original_domain":"doite.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'lippi',
  'Lippi',
  'LIPPI',
  'BRAND_LIPPI',
  NULL,
  'Moda',
  'Outdoor',
  '{"original_category":"Moda","original_subcategory":"Outdoor","original_domain":"lippioutdoor.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'marmot',
  'Marmot',
  'MARMOT',
  'BRAND_MARMOT',
  'CL',
  'Moda',
  'Outdoor',
  '{"original_category":"Moda","original_subcategory":"Outdoor","original_domain":"marmot.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'patagonia',
  'Patagonia',
  'PATAGONIA',
  'BRAND_PATAGONIA',
  NULL,
  'Moda',
  'Outdoor',
  '{"original_category":"Moda","original_subcategory":"Outdoor","original_domain":"patagonia.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'the-north-face',
  'The North Face',
  'THE NORTH FACE',
  'BRAND_THE_NORTH_FACE',
  'CL',
  'Moda',
  'Outdoor',
  '{"original_category":"Moda","original_subcategory":"Outdoor","original_domain":"thenorthface.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'family-shop',
  'Family Shop',
  'FAMILY SHOP',
  'BRAND_FAMILY_SHOP',
  'CL',
  'Moda',
  'Ropa básica',
  '{"original_category":"Moda","original_subcategory":"Ropa básica","original_domain":"familyshop.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'h-m',
  'H&M',
  'HM',
  'BRAND_HM',
  NULL,
  'Moda',
  'Ropa básica',
  '{"original_category":"Moda","original_subcategory":"Ropa básica","original_domain":"hm.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'mango',
  'Mango',
  'MANGO',
  'BRAND_MANGO',
  NULL,
  'Moda',
  'Ropa básica',
  '{"original_category":"Moda","original_subcategory":"Ropa básica","original_domain":"shop.mango.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'sybilla',
  'Sybilla',
  'SYBILLA',
  'BRAND_SYBILLA',
  NULL,
  'Moda',
  'Ropa básica',
  '{"original_category":"Moda","original_subcategory":"Ropa básica","original_domain":"falabella.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'tricot',
  'Tricot',
  'TRICOT',
  'BRAND_TRICOT',
  'CL',
  'Moda',
  'Ropa básica',
  '{"original_category":"Moda","original_subcategory":"Ropa básica","original_domain":"tricot.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'zara',
  'Zara',
  'ZARA',
  'BRAND_ZARA',
  NULL,
  'Moda',
  'Ropa básica',
  '{"original_category":"Moda","original_subcategory":"Ropa básica","original_domain":"zara.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'aliexpress',
  'AliExpress',
  'ALIEXPRESS',
  'BRAND_ALIEXPRESS',
  NULL,
  'Retail',
  'Marketplaces',
  '{"original_category":"Retail","original_subcategory":"Marketplaces","original_domain":"aliexpress.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'amazon',
  'Amazon',
  'AMAZON',
  'BRAND_AMAZON',
  NULL,
  'Retail',
  'Marketplaces',
  '{"original_category":"Retail","original_subcategory":"Marketplaces","original_domain":"amazon.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'falabella',
  'Falabella',
  'FALABELLA',
  'BRAND_FALABELLA',
  NULL,
  'Retail',
  'Marketplaces',
  '{"original_category":"Retail","original_subcategory":"Marketplaces","original_domain":"falabella.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'linio',
  'Linio',
  'LINIO',
  'BRAND_LINIO',
  'CL',
  'Retail',
  'Marketplaces',
  '{"original_category":"Retail","original_subcategory":"Marketplaces","original_domain":"linio.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'mercado-libre',
  'Mercado Libre',
  'MERCADO LIBRE',
  'BRAND_MERCADO_LIBRE',
  'CL',
  'Retail',
  'Marketplaces',
  '{"original_category":"Retail","original_subcategory":"Marketplaces","original_domain":"mercadolibre.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'paris',
  'Paris',
  'PARIS',
  'BRAND_PARIS',
  'CL',
  'Retail',
  'Marketplaces',
  '{"original_category":"Retail","original_subcategory":"Marketplaces","original_domain":"paris.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'ripley',
  'Ripley',
  'RIPLEY',
  'BRAND_RIPLEY',
  'CL',
  'Retail',
  'Marketplaces',
  '{"original_category":"Retail","original_subcategory":"Marketplaces","original_domain":"ripley.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'chilemat',
  'Chilemat',
  'CHILEMAT',
  'BRAND_CHILEMAT',
  'CL',
  'Retail',
  'Mejoramiento del hogar',
  '{"original_category":"Retail","original_subcategory":"Mejoramiento del hogar","original_domain":"chilemat.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'construmart',
  'Construmart',
  'CONSTRUMART',
  'BRAND_CONSTRUMART',
  'CL',
  'Retail',
  'Mejoramiento del hogar',
  '{"original_category":"Retail","original_subcategory":"Mejoramiento del hogar","original_domain":"construmart.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'easy',
  'Easy',
  'EASY',
  'BRAND_EASY',
  'CL',
  'Retail',
  'Mejoramiento del hogar',
  '{"original_category":"Retail","original_subcategory":"Mejoramiento del hogar","original_domain":"easy.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'imperial',
  'Imperial',
  'IMPERIAL',
  'BRAND_IMPERIAL',
  'CL',
  'Retail',
  'Mejoramiento del hogar',
  '{"original_category":"Retail","original_subcategory":"Mejoramiento del hogar","original_domain":"imperial.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'mts',
  'MTS',
  'MTS',
  'BRAND_MTS',
  'CL',
  'Retail',
  'Mejoramiento del hogar',
  '{"original_category":"Retail","original_subcategory":"Mejoramiento del hogar","original_domain":"mts.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'sodimac',
  'Sodimac',
  'SODIMAC',
  'BRAND_SODIMAC',
  'CL',
  'Retail',
  'Mejoramiento del hogar',
  '{"original_category":"Retail","original_subcategory":"Mejoramiento del hogar","original_domain":"sodimac.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'abc',
  'ABC',
  'ABC',
  'BRAND_ABC',
  'CL',
  'Retail',
  'Multitiendas',
  '{"original_category":"Retail","original_subcategory":"Multitiendas","original_domain":"abc.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'falabella',
  'Falabella',
  'FALABELLA',
  'BRAND_FALABELLA',
  NULL,
  'Retail',
  'Multitiendas',
  '{"original_category":"Retail","original_subcategory":"Multitiendas","original_domain":"falabella.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'hites',
  'Hites',
  'HITES',
  'BRAND_HITES',
  NULL,
  'Retail',
  'Multitiendas',
  '{"original_category":"Retail","original_subcategory":"Multitiendas","original_domain":"hites.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'la-polar',
  'La Polar',
  'LA POLAR',
  'BRAND_LA_POLAR',
  'CL',
  'Retail',
  'Multitiendas',
  '{"original_category":"Retail","original_subcategory":"Multitiendas","original_domain":"lapolar.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'paris',
  'Paris',
  'PARIS',
  'BRAND_PARIS',
  'CL',
  'Retail',
  'Multitiendas',
  '{"original_category":"Retail","original_subcategory":"Multitiendas","original_domain":"paris.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'ripley',
  'Ripley',
  'RIPLEY',
  'BRAND_RIPLEY',
  'CL',
  'Retail',
  'Multitiendas',
  '{"original_category":"Retail","original_subcategory":"Multitiendas","original_domain":"ripley.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'tricot',
  'Tricot',
  'TRICOT',
  'BRAND_TRICOT',
  'CL',
  'Retail',
  'Multitiendas',
  '{"original_category":"Retail","original_subcategory":"Multitiendas","original_domain":"tricot.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'alvi',
  'Alvi',
  'ALVI',
  'BRAND_ALVI',
  'CL',
  'Retail',
  'Supermercados',
  '{"original_category":"Retail","original_subcategory":"Supermercados","original_domain":"alvi.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'jumbo',
  'Jumbo',
  'JUMBO',
  'BRAND_JUMBO',
  'CL',
  'Retail',
  'Supermercados',
  '{"original_category":"Retail","original_subcategory":"Supermercados","original_domain":"jumbo.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'lider',
  'Líder',
  'LIDER',
  'BRAND_LIDER',
  'CL',
  'Retail',
  'Supermercados',
  '{"original_category":"Retail","original_subcategory":"Supermercados","original_domain":"lider.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'santa-isabel',
  'Santa Isabel',
  'SANTA ISABEL',
  'BRAND_SANTA_ISABEL',
  'CL',
  'Retail',
  'Supermercados',
  '{"original_category":"Retail","original_subcategory":"Supermercados","original_domain":"santaisabel.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'tottus',
  'Tottus',
  'TOTTUS',
  'BRAND_TOTTUS',
  'CL',
  'Retail',
  'Supermercados',
  '{"original_category":"Retail","original_subcategory":"Supermercados","original_domain":"tottus.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'unimarc',
  'Unimarc',
  'UNIMARC',
  'BRAND_UNIMARC',
  'CL',
  'Retail',
  'Supermercados',
  '{"original_category":"Retail","original_subcategory":"Supermercados","original_domain":"unimarc.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'acuenta',
  'aCuenta',
  'ACUENTA',
  'BRAND_ACUENTA',
  'CL',
  'Retail',
  'Supermercados',
  '{"original_category":"Retail","original_subcategory":"Supermercados","original_domain":"acuenta.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'falabella',
  'Falabella',
  'FALABELLA',
  'BRAND_FALABELLA',
  NULL,
  'Retail',
  'Tiendas de tecnología',
  '{"original_category":"Retail","original_subcategory":"Tiendas de tecnología","original_domain":"falabella.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'maconline',
  'MacOnline',
  'MACONLINE',
  'BRAND_MACONLINE',
  NULL,
  'Retail',
  'Tiendas de tecnología',
  '{"original_category":"Retail","original_subcategory":"Tiendas de tecnología","original_domain":"maconline.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'pc-factory',
  'PC Factory',
  'PC FACTORY',
  'BRAND_PC_FACTORY',
  'CL',
  'Retail',
  'Tiendas de tecnología',
  '{"original_category":"Retail","original_subcategory":"Tiendas de tecnología","original_domain":"pcfactory.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'reifstore',
  'Reifstore',
  'REIFSTORE',
  'BRAND_REIFSTORE',
  'CL',
  'Retail',
  'Tiendas de tecnología',
  '{"original_category":"Retail","original_subcategory":"Tiendas de tecnología","original_domain":"reifstore.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'ripley',
  'Ripley',
  'RIPLEY',
  'BRAND_RIPLEY',
  'CL',
  'Retail',
  'Tiendas de tecnología',
  '{"original_category":"Retail","original_subcategory":"Tiendas de tecnología","original_domain":"ripley.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'sp-digital',
  'SP Digital',
  'SP DIGITAL',
  'BRAND_SP_DIGITAL',
  'CL',
  'Retail',
  'Tiendas de tecnología',
  '{"original_category":"Retail","original_subcategory":"Tiendas de tecnología","original_domain":"spdigital.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'weplay',
  'WePlay',
  'WEPLAY',
  'BRAND_WEPLAY',
  'CL',
  'Retail',
  'Tiendas de tecnología',
  '{"original_category":"Retail","original_subcategory":"Tiendas de tecnología","original_domain":"weplay.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'bupa',
  'Bupa',
  'BUPA',
  'BRAND_BUPA',
  'CL',
  'Salud',
  'Centros médicos',
  '{"original_category":"Salud","original_subcategory":"Centros médicos","original_domain":"bupa.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'integramedica',
  'IntegraMédica',
  'INTEGRAMEDICA',
  'BRAND_INTEGRAMEDICA',
  'CL',
  'Salud',
  'Centros médicos',
  '{"original_category":"Salud","original_subcategory":"Centros médicos","original_domain":"integramedica.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'megasalud',
  'Megasalud',
  'MEGASALUD',
  'BRAND_MEGASALUD',
  'CL',
  'Salud',
  'Centros médicos',
  '{"original_category":"Salud","original_subcategory":"Centros médicos","original_domain":"megasalud.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'redsalud-centros-medicos',
  'RedSalud Centros Médicos',
  'REDSALUD CENTROS MEDICOS',
  'BRAND_REDSALUD_CENTROS_MEDICOS',
  'CL',
  'Salud',
  'Centros médicos',
  '{"original_category":"Salud","original_subcategory":"Centros médicos","original_domain":"redsalud.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'uc-christus',
  'UC Christus',
  'UC CHRISTUS',
  'BRAND_UC_CHRISTUS',
  'CL',
  'Salud',
  'Centros médicos',
  '{"original_category":"Salud","original_subcategory":"Centros médicos","original_domain":"ucchristus.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'vidaintegra',
  'Vidaintegra',
  'VIDAINTEGRA',
  'BRAND_VIDAINTEGRA',
  'CL',
  'Salud',
  'Centros médicos',
  '{"original_category":"Salud","original_subcategory":"Centros médicos","original_domain":"vidaintegra.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'clinica-alemana',
  'Clínica Alemana',
  'CLINICA ALEMANA',
  'BRAND_CLINICA_ALEMANA',
  'CL',
  'Salud',
  'Clínicas',
  '{"original_category":"Salud","original_subcategory":"Clínicas","original_domain":"alemana.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'clinica-indisa',
  'Clínica Indisa',
  'CLINICA INDISA',
  'BRAND_CLINICA_INDISA',
  'CL',
  'Salud',
  'Clínicas',
  '{"original_category":"Salud","original_subcategory":"Clínicas","original_domain":"indisa.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'clinica-las-condes',
  'Clínica Las Condes',
  'CLINICA LAS CONDES',
  'BRAND_CLINICA_LAS_CONDES',
  'CL',
  'Salud',
  'Clínicas',
  '{"original_category":"Salud","original_subcategory":"Clínicas","original_domain":"clc.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'clinica-meds',
  'Clínica MEDS',
  'CLINICA MEDS',
  'BRAND_CLINICA_MEDS',
  'CL',
  'Salud',
  'Clínicas',
  '{"original_category":"Salud","original_subcategory":"Clínicas","original_domain":"meds.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'clinica-santa-maria',
  'Clínica Santa María',
  'CLINICA SANTA MARIA',
  'BRAND_CLINICA_SANTA_MARIA',
  'CL',
  'Salud',
  'Clínicas',
  '{"original_category":"Salud","original_subcategory":"Clínicas","original_domain":"clinicasantamaria.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'redsalud',
  'RedSalud',
  'REDSALUD',
  'BRAND_REDSALUD',
  'CL',
  'Salud',
  'Clínicas',
  '{"original_category":"Salud","original_subcategory":"Clínicas","original_domain":"redsalud.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'cruz-verde',
  'Cruz Verde',
  'CRUZ VERDE',
  'BRAND_CRUZ_VERDE',
  'CL',
  'Salud',
  'Farmacias',
  '{"original_category":"Salud","original_subcategory":"Farmacias","original_domain":"cruzverde.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'dr-simi',
  'Dr. Simi',
  'DR SIMI',
  'BRAND_DR_SIMI',
  'CL',
  'Salud',
  'Farmacias',
  '{"original_category":"Salud","original_subcategory":"Farmacias","original_domain":"drsimi.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'farmacias-ahumada',
  'Farmacias Ahumada',
  'FARMACIAS AHUMADA',
  'BRAND_FARMACIAS_AHUMADA',
  'CL',
  'Salud',
  'Farmacias',
  '{"original_category":"Salud","original_subcategory":"Farmacias","original_domain":"farmaciasahumada.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'fraccion',
  'Fracción',
  'FRACCION',
  'BRAND_FRACCION',
  'CL',
  'Salud',
  'Farmacias',
  '{"original_category":"Salud","original_subcategory":"Farmacias","original_domain":"farmaciafraccion.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'knop',
  'Knop',
  'KNOP',
  'BRAND_KNOP',
  'CL',
  'Salud',
  'Farmacias',
  '{"original_category":"Salud","original_subcategory":"Farmacias","original_domain":"knop.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'salcobrand',
  'Salcobrand',
  'SALCOBRAND',
  'BRAND_SALCOBRAND',
  'CL',
  'Salud',
  'Farmacias',
  '{"original_category":"Salud","original_subcategory":"Farmacias","original_domain":"salcobrand.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'banmedica',
  'Banmédica',
  'BANMEDICA',
  'BRAND_BANMEDICA',
  'CL',
  'Salud',
  'Isapres',
  '{"original_category":"Salud","original_subcategory":"Isapres","original_domain":"banmedica.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'colmena',
  'Colmena',
  'COLMENA',
  'BRAND_COLMENA',
  'CL',
  'Salud',
  'Isapres',
  '{"original_category":"Salud","original_subcategory":"Isapres","original_domain":"colmena.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'consalud',
  'Consalud',
  'CONSALUD',
  'BRAND_CONSALUD',
  'CL',
  'Salud',
  'Isapres',
  '{"original_category":"Salud","original_subcategory":"Isapres","original_domain":"consalud.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'cruz-blanca',
  'Cruz Blanca',
  'CRUZ BLANCA',
  'BRAND_CRUZ_BLANCA',
  'CL',
  'Salud',
  'Isapres',
  '{"original_category":"Salud","original_subcategory":"Isapres","original_domain":"cruzblanca.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'nueva-masvida',
  'Nueva Masvida',
  'NUEVA MASVIDA',
  'BRAND_NUEVA_MASVIDA',
  'CL',
  'Salud',
  'Isapres',
  '{"original_category":"Salud","original_subcategory":"Isapres","original_domain":"nuevamasvida.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'vida-tres',
  'Vida Tres',
  'VIDA TRES',
  'BRAND_VIDA_TRES',
  'CL',
  'Salud',
  'Isapres',
  '{"original_category":"Salud","original_subcategory":"Isapres","original_domain":"vidatres.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'bci-seguros',
  'BCI Seguros',
  'BCI SEGUROS',
  'BRAND_BCI_SEGUROS',
  'CL',
  'Salud',
  'Seguros de salud',
  '{"original_category":"Salud","original_subcategory":"Seguros de salud","original_domain":"bciseguros.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'consorcio',
  'Consorcio',
  'CONSORCIO',
  'BRAND_CONSORCIO',
  'CL',
  'Salud',
  'Seguros de salud',
  '{"original_category":"Salud","original_subcategory":"Seguros de salud","original_domain":"consorcio.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'hdi-seguros',
  'HDI Seguros',
  'HDI SEGUROS',
  'BRAND_HDI_SEGUROS',
  'CL',
  'Salud',
  'Seguros de salud',
  '{"original_category":"Salud","original_subcategory":"Seguros de salud","original_domain":"hdi.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'mapfre',
  'Mapfre',
  'MAPFRE',
  'BRAND_MAPFRE',
  'CL',
  'Salud',
  'Seguros de salud',
  '{"original_category":"Salud","original_subcategory":"Seguros de salud","original_domain":"mapfre.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'metlife',
  'MetLife',
  'METLIFE',
  'BRAND_METLIFE',
  'CL',
  'Salud',
  'Seguros de salud',
  '{"original_category":"Salud","original_subcategory":"Seguros de salud","original_domain":"metlife.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'zurich',
  'Zurich',
  'ZURICH',
  'BRAND_ZURICH',
  'CL',
  'Salud',
  'Seguros de salud',
  '{"original_category":"Salud","original_subcategory":"Seguros de salud","original_domain":"zurich.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'apple-airpods',
  'Apple AirPods',
  'APPLE AIRPODS',
  'BRAND_APPLE_AIRPODS',
  NULL,
  'Tecnología',
  'Audífonos',
  '{"original_category":"Tecnología","original_subcategory":"Audífonos","original_domain":"apple.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'bose',
  'Bose',
  'BOSE',
  'BRAND_BOSE',
  NULL,
  'Tecnología',
  'Audífonos',
  '{"original_category":"Tecnología","original_subcategory":"Audífonos","original_domain":"bose.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'jbl',
  'JBL',
  'JBL',
  'BRAND_JBL',
  'CL',
  'Tecnología',
  'Audífonos',
  '{"original_category":"Tecnología","original_subcategory":"Audífonos","original_domain":"jbl.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'samsung-galaxy-buds',
  'Samsung Galaxy Buds',
  'SAMSUNG GALAXY BUDS',
  'BRAND_SAMSUNG_GALAXY_BUDS',
  'CL',
  'Tecnología',
  'Audífonos',
  '{"original_category":"Tecnología","original_subcategory":"Audífonos","original_domain":"samsung.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'skullcandy',
  'Skullcandy',
  'SKULLCANDY',
  'BRAND_SKULLCANDY',
  NULL,
  'Tecnología',
  'Audífonos',
  '{"original_category":"Tecnología","original_subcategory":"Audífonos","original_domain":null,"catalog_source":"excel","curation_status":"needs_review","notes":"Domain review needed."}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'sony',
  'Sony',
  'SONY',
  'BRAND_SONY',
  NULL,
  'Tecnología',
  'Audífonos',
  '{"original_category":"Tecnología","original_subcategory":"Audífonos","original_domain":"sony.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'asus-rog-ally',
  'ASUS ROG Ally',
  'ASUS ROG ALLY',
  'BRAND_ASUS_ROG_ALLY',
  NULL,
  'Tecnología',
  'Consolas',
  '{"original_category":"Tecnología","original_subcategory":"Consolas","original_domain":"rog.asus.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'lenovo-legion-go',
  'Lenovo Legion Go',
  'LENOVO LEGION GO',
  'BRAND_LENOVO_LEGION_GO',
  'CL',
  'Tecnología',
  'Consolas',
  '{"original_category":"Tecnología","original_subcategory":"Consolas","original_domain":"lenovo.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'nintendo-switch',
  'Nintendo Switch',
  'NINTENDO SWITCH',
  'BRAND_NINTENDO_SWITCH',
  'CL',
  'Tecnología',
  'Consolas',
  '{"original_category":"Tecnología","original_subcategory":"Consolas","original_domain":"nintendo.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'playstation',
  'PlayStation',
  'PLAYSTATION',
  'BRAND_PLAYSTATION',
  NULL,
  'Tecnología',
  'Consolas',
  '{"original_category":"Tecnología","original_subcategory":"Consolas","original_domain":"ps.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'steam-deck',
  'Steam Deck',
  'STEAM DECK',
  'BRAND_STEAM_DECK',
  NULL,
  'Tecnología',
  'Consolas',
  '{"original_category":"Tecnología","original_subcategory":"Consolas","original_domain":"steamdeck.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'xbox',
  'Xbox',
  'XBOX',
  'BRAND_XBOX',
  NULL,
  'Tecnología',
  'Consolas',
  '{"original_category":"Tecnología","original_subcategory":"Consolas","original_domain":"xbox.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'aoc',
  'AOC',
  'AOC',
  'BRAND_AOC',
  'CL',
  'Tecnología',
  'Monitores gamer',
  '{"original_category":"Tecnología","original_subcategory":"Monitores gamer","original_domain":"aocchile.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'asus-rog',
  'ASUS ROG',
  'ASUS ROG',
  'BRAND_ASUS_ROG',
  NULL,
  'Tecnología',
  'Monitores gamer',
  '{"original_category":"Tecnología","original_subcategory":"Monitores gamer","original_domain":"rog.asus.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'acer-predator',
  'Acer Predator',
  'ACER PREDATOR',
  'BRAND_ACER_PREDATOR',
  NULL,
  'Tecnología',
  'Monitores gamer',
  '{"original_category":"Tecnología","original_subcategory":"Monitores gamer","original_domain":"acer.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'lg-ultragear',
  'LG UltraGear',
  'LG ULTRAGEAR',
  'BRAND_LG_ULTRAGEAR',
  NULL,
  'Tecnología',
  'Monitores gamer',
  '{"original_category":"Tecnología","original_subcategory":"Monitores gamer","original_domain":"lg.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'msi',
  'MSI',
  'MSI',
  'BRAND_MSI',
  NULL,
  'Tecnología',
  'Monitores gamer',
  '{"original_category":"Tecnología","original_subcategory":"Monitores gamer","original_domain":"latam.msi.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'samsung-odyssey',
  'Samsung Odyssey',
  'SAMSUNG ODYSSEY',
  'BRAND_SAMSUNG_ODYSSEY',
  'CL',
  'Tecnología',
  'Monitores gamer',
  '{"original_category":"Tecnología","original_subcategory":"Monitores gamer","original_domain":"samsung.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'asus',
  'ASUS',
  'ASUS',
  'BRAND_ASUS',
  NULL,
  'Tecnología',
  'Notebooks',
  '{"original_category":"Tecnología","original_subcategory":"Notebooks","original_domain":"asus.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'acer',
  'Acer',
  'ACER',
  'BRAND_ACER',
  NULL,
  'Tecnología',
  'Notebooks',
  '{"original_category":"Tecnología","original_subcategory":"Notebooks","original_domain":"acer.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'apple-macbook',
  'Apple MacBook',
  'APPLE MACBOOK',
  'BRAND_APPLE_MACBOOK',
  NULL,
  'Tecnología',
  'Notebooks',
  '{"original_category":"Tecnología","original_subcategory":"Notebooks","original_domain":"apple.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'dell',
  'Dell',
  'DELL',
  'BRAND_DELL',
  NULL,
  'Tecnología',
  'Notebooks',
  '{"original_category":"Tecnología","original_subcategory":"Notebooks","original_domain":"dell.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'hp',
  'HP',
  'HP',
  'BRAND_HP',
  NULL,
  'Tecnología',
  'Notebooks',
  '{"original_category":"Tecnología","original_subcategory":"Notebooks","original_domain":"hp.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'lenovo',
  'Lenovo',
  'LENOVO',
  'BRAND_LENOVO',
  NULL,
  'Tecnología',
  'Notebooks',
  '{"original_category":"Tecnología","original_subcategory":"Notebooks","original_domain":"lenovo.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'msi',
  'MSI',
  'MSI',
  'BRAND_MSI',
  NULL,
  'Tecnología',
  'Notebooks',
  '{"original_category":"Tecnología","original_subcategory":"Notebooks","original_domain":"latam.msi.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'corsair',
  'Corsair',
  'CORSAIR',
  'BRAND_CORSAIR',
  NULL,
  'Tecnología',
  'Periféricos gamer',
  '{"original_category":"Tecnología","original_subcategory":"Periféricos gamer","original_domain":"corsair.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'hyperx',
  'HyperX',
  'HYPERX',
  'BRAND_HYPERX',
  NULL,
  'Tecnología',
  'Periféricos gamer',
  '{"original_category":"Tecnología","original_subcategory":"Periféricos gamer","original_domain":"hyperx.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'logitech-g',
  'Logitech G',
  'LOGITECH G',
  'BRAND_LOGITECH_G',
  NULL,
  'Tecnología',
  'Periféricos gamer',
  '{"original_category":"Tecnología","original_subcategory":"Periféricos gamer","original_domain":"logitechg.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'razer',
  'Razer',
  'RAZER',
  'BRAND_RAZER',
  NULL,
  'Tecnología',
  'Periféricos gamer',
  '{"original_category":"Tecnología","original_subcategory":"Periféricos gamer","original_domain":"razer.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'redragon',
  'Redragon',
  'REDRAGON',
  'BRAND_REDRAGON',
  NULL,
  'Tecnología',
  'Periféricos gamer',
  '{"original_category":"Tecnología","original_subcategory":"Periféricos gamer","original_domain":"redragon.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'steelseries',
  'SteelSeries',
  'STEELSERIES',
  'BRAND_STEELSERIES',
  NULL,
  'Tecnología',
  'Periféricos gamer',
  '{"original_category":"Tecnología","original_subcategory":"Periféricos gamer","original_domain":"steelseries.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'apple-iphone',
  'Apple iPhone',
  'APPLE IPHONE',
  'BRAND_APPLE_IPHONE',
  NULL,
  'Tecnología',
  'Smartphones',
  '{"original_category":"Tecnología","original_subcategory":"Smartphones","original_domain":"apple.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'honor',
  'Honor',
  'HONOR',
  'BRAND_HONOR',
  NULL,
  'Tecnología',
  'Smartphones',
  '{"original_category":"Tecnología","original_subcategory":"Smartphones","original_domain":"honor.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'huawei',
  'Huawei',
  'HUAWEI',
  'BRAND_HUAWEI',
  NULL,
  'Tecnología',
  'Smartphones',
  '{"original_category":"Tecnología","original_subcategory":"Smartphones","original_domain":"huawei.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'motorola',
  'Motorola',
  'MOTOROLA',
  'BRAND_MOTOROLA',
  NULL,
  'Tecnología',
  'Smartphones',
  '{"original_category":"Tecnología","original_subcategory":"Smartphones","original_domain":"motorola.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'oppo',
  'Oppo',
  'OPPO',
  'BRAND_OPPO',
  NULL,
  'Tecnología',
  'Smartphones',
  '{"original_category":"Tecnología","original_subcategory":"Smartphones","original_domain":"oppo.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'realme',
  'Realme',
  'REALME',
  'BRAND_REALME',
  NULL,
  'Tecnología',
  'Smartphones',
  '{"original_category":"Tecnología","original_subcategory":"Smartphones","original_domain":"realme.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'samsung-galaxy',
  'Samsung Galaxy',
  'SAMSUNG GALAXY',
  'BRAND_SAMSUNG_GALAXY',
  'CL',
  'Tecnología',
  'Smartphones',
  '{"original_category":"Tecnología","original_subcategory":"Smartphones","original_domain":"samsung.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'xiaomi',
  'Xiaomi',
  'XIAOMI',
  'BRAND_XIAOMI',
  NULL,
  'Tecnología',
  'Smartphones',
  '{"original_category":"Tecnología","original_subcategory":"Smartphones","original_domain":"mi.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'amazfit',
  'Amazfit',
  'AMAZFIT',
  'BRAND_AMAZFIT',
  NULL,
  'Tecnología',
  'Smartwatches',
  '{"original_category":"Tecnología","original_subcategory":"Smartwatches","original_domain":"amazfit.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'apple-watch',
  'Apple Watch',
  'APPLE WATCH',
  'BRAND_APPLE_WATCH',
  NULL,
  'Tecnología',
  'Smartwatches',
  '{"original_category":"Tecnología","original_subcategory":"Smartwatches","original_domain":"apple.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'garmin',
  'Garmin',
  'GARMIN',
  'BRAND_GARMIN',
  NULL,
  'Tecnología',
  'Smartwatches',
  '{"original_category":"Tecnología","original_subcategory":"Smartwatches","original_domain":"garmin.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'huawei-watch',
  'Huawei Watch',
  'HUAWEI WATCH',
  'BRAND_HUAWEI_WATCH',
  NULL,
  'Tecnología',
  'Smartwatches',
  '{"original_category":"Tecnología","original_subcategory":"Smartwatches","original_domain":"huawei.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'samsung-galaxy-watch',
  'Samsung Galaxy Watch',
  'SAMSUNG GALAXY WATCH',
  'BRAND_SAMSUNG_GALAXY_WATCH',
  'CL',
  'Tecnología',
  'Smartwatches',
  '{"original_category":"Tecnología","original_subcategory":"Smartwatches","original_domain":"samsung.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'xiaomi-watch',
  'Xiaomi Watch',
  'XIAOMI WATCH',
  'BRAND_XIAOMI_WATCH',
  'CL',
  'Tecnología',
  'Smartwatches',
  '{"original_category":"Tecnología","original_subcategory":"Smartwatches","original_domain":"vxiaomi.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'apple-ipad',
  'Apple iPad',
  'APPLE IPAD',
  'BRAND_APPLE_IPAD',
  NULL,
  'Tecnología',
  'Tablets',
  '{"original_category":"Tecnología","original_subcategory":"Tablets","original_domain":"apple.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'honor-pad',
  'Honor Pad',
  'HONOR PAD',
  'BRAND_HONOR_PAD',
  'CL',
  'Tecnología',
  'Tablets',
  '{"original_category":"Tecnología","original_subcategory":"Tablets","original_domain":"honorstore.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'huawei-matepad',
  'Huawei MatePad',
  'HUAWEI MATEPAD',
  'BRAND_HUAWEI_MATEPAD',
  NULL,
  'Tecnología',
  'Tablets',
  '{"original_category":"Tecnología","original_subcategory":"Tablets","original_domain":"huawei.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'lenovo-tab',
  'Lenovo Tab',
  'LENOVO TAB',
  'BRAND_LENOVO_TAB',
  'CL',
  'Tecnología',
  'Tablets',
  '{"original_category":"Tecnología","original_subcategory":"Tablets","original_domain":"lenovo.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'samsung-galaxy-tab',
  'Samsung Galaxy Tab',
  'SAMSUNG GALAXY TAB',
  'BRAND_SAMSUNG_GALAXY_TAB',
  'CL',
  'Tecnología',
  'Tablets',
  '{"original_category":"Tecnología","original_subcategory":"Tablets","original_domain":"samsung.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'xiaomi-pad',
  'Xiaomi Pad',
  'XIAOMI PAD',
  'BRAND_XIAOMI_PAD',
  'CL',
  'Tecnología',
  'Tablets',
  '{"original_category":"Tecnología","original_subcategory":"Tablets","original_domain":"xiaomi.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'hisense',
  'Hisense',
  'HISENSE',
  'BRAND_HISENSE',
  'CL',
  'Tecnología',
  'Televisores',
  '{"original_category":"Tecnología","original_subcategory":"Televisores","original_domain":"hisense.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'lg',
  'LG',
  'LG',
  'BRAND_LG',
  NULL,
  'Tecnología',
  'Televisores',
  '{"original_category":"Tecnología","original_subcategory":"Televisores","original_domain":"lg.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'philips',
  'Philips',
  'PHILIPS',
  'BRAND_PHILIPS',
  'CL',
  'Tecnología',
  'Televisores',
  '{"original_category":"Tecnología","original_subcategory":"Televisores","original_domain":"philips.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'samsung',
  'Samsung',
  'SAMSUNG',
  'BRAND_SAMSUNG',
  'CL',
  'Tecnología',
  'Televisores',
  '{"original_category":"Tecnología","original_subcategory":"Televisores","original_domain":"samsung.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'sony',
  'Sony',
  'SONY',
  'BRAND_SONY',
  NULL,
  'Tecnología',
  'Televisores',
  '{"original_category":"Tecnología","original_subcategory":"Televisores","original_domain":"sony.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'tcl',
  'TCL',
  'TCL',
  'BRAND_TCL',
  'CL',
  'Tecnología',
  'Televisores',
  '{"original_category":"Tecnología","original_subcategory":"Televisores","original_domain":"tclstore.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'claro-hogar',
  'Claro Hogar',
  'CLARO HOGAR',
  'BRAND_CLARO_HOGAR',
  'CL',
  'Telecomunicaciones',
  'Internet hogar',
  '{"original_category":"Telecomunicaciones","original_subcategory":"Internet hogar","original_domain":"claro.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'entel-fibra',
  'Entel Fibra',
  'ENTEL FIBRA',
  'BRAND_ENTEL_FIBRA',
  'CL',
  'Telecomunicaciones',
  'Internet hogar',
  '{"original_category":"Telecomunicaciones","original_subcategory":"Internet hogar","original_domain":"entel.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'gtd',
  'GTD',
  'GTD',
  'BRAND_GTD',
  'CL',
  'Telecomunicaciones',
  'Internet hogar',
  '{"original_category":"Telecomunicaciones","original_subcategory":"Internet hogar","original_domain":"gtd.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'movistar-fibra',
  'Movistar Fibra',
  'MOVISTAR FIBRA',
  'BRAND_MOVISTAR_FIBRA',
  'CL',
  'Telecomunicaciones',
  'Internet hogar',
  '{"original_category":"Telecomunicaciones","original_subcategory":"Internet hogar","original_domain":"movistar.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'mundo',
  'Mundo',
  'MUNDO',
  'BRAND_MUNDO',
  'CL',
  'Telecomunicaciones',
  'Internet hogar',
  '{"original_category":"Telecomunicaciones","original_subcategory":"Internet hogar","original_domain":"mundo.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'telsur',
  'Telsur',
  'TELSUR',
  'BRAND_TELSUR',
  'CL',
  'Telecomunicaciones',
  'Internet hogar',
  '{"original_category":"Telecomunicaciones","original_subcategory":"Internet hogar","original_domain":"gtd.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'vtr',
  'VTR',
  'VTR',
  'BRAND_VTR',
  NULL,
  'Telecomunicaciones',
  'Internet hogar',
  '{"original_category":"Telecomunicaciones","original_subcategory":"Internet hogar","original_domain":"vtr.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'claro-video',
  'Claro video',
  'CLARO VIDEO',
  'BRAND_CLARO_VIDEO',
  NULL,
  'Telecomunicaciones',
  'TV online',
  '{"original_category":"Telecomunicaciones","original_subcategory":"TV online","original_domain":"clarovideo.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'dgo',
  'DGO',
  'DGO',
  'BRAND_DGO',
  NULL,
  'Telecomunicaciones',
  'TV online',
  '{"original_category":"Telecomunicaciones","original_subcategory":"TV online","original_domain":"directvgo.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'michv',
  'MiCHV',
  'MICHV',
  'BRAND_MICHV',
  'CL',
  'Telecomunicaciones',
  'TV online',
  '{"original_category":"Telecomunicaciones","original_subcategory":"TV online","original_domain":"michv.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'movistar-tv-app',
  'Movistar TV App',
  'MOVISTAR TV APP',
  'BRAND_MOVISTAR_TV_APP',
  'CL',
  'Telecomunicaciones',
  'TV online',
  '{"original_category":"Telecomunicaciones","original_subcategory":"TV online","original_domain":"movistar.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'tvn-play',
  'TVN Play',
  'TVN PLAY',
  'BRAND_TVN_PLAY',
  'CL',
  'Telecomunicaciones',
  'TV online',
  '{"original_category":"Telecomunicaciones","original_subcategory":"TV online","original_domain":"tvnplay.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'zapping',
  'Zapping',
  'ZAPPING',
  'BRAND_ZAPPING',
  NULL,
  'Telecomunicaciones',
  'TV online',
  '{"original_category":"Telecomunicaciones","original_subcategory":"TV online","original_domain":"zapping.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'claro-tv',
  'Claro TV',
  'CLARO TV',
  'BRAND_CLARO_TV',
  'CL',
  'Telecomunicaciones',
  'TV paga',
  '{"original_category":"Telecomunicaciones","original_subcategory":"TV paga","original_domain":"claro.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'directv',
  'DIRECTV',
  'DIRECTV',
  'BRAND_DIRECTV',
  'CL',
  'Telecomunicaciones',
  'TV paga',
  '{"original_category":"Telecomunicaciones","original_subcategory":"TV paga","original_domain":"directtv.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'movistar-tv',
  'Movistar TV',
  'MOVISTAR TV',
  'BRAND_MOVISTAR_TV',
  'CL',
  'Telecomunicaciones',
  'TV paga',
  '{"original_category":"Telecomunicaciones","original_subcategory":"TV paga","original_domain":"movistar.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'tuves',
  'TuVes',
  'TUVES',
  'BRAND_TUVES',
  'CL',
  'Telecomunicaciones',
  'TV paga',
  '{"original_category":"Telecomunicaciones","original_subcategory":"TV paga","original_domain":"tuves.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'vtr',
  'VTR',
  'VTR',
  'BRAND_VTR',
  NULL,
  'Telecomunicaciones',
  'TV paga',
  '{"original_category":"Telecomunicaciones","original_subcategory":"TV paga","original_domain":"vtr.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'zapping',
  'Zapping',
  'ZAPPING',
  'BRAND_ZAPPING',
  NULL,
  'Telecomunicaciones',
  'TV paga',
  '{"original_category":"Telecomunicaciones","original_subcategory":"TV paga","original_domain":"zapping.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'claro',
  'Claro',
  'CLARO',
  'BRAND_CLARO',
  'CL',
  'Telecomunicaciones',
  'Telefonía móvil',
  '{"original_category":"Telecomunicaciones","original_subcategory":"Telefonía móvil","original_domain":"claro.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'entel',
  'Entel',
  'ENTEL',
  'BRAND_ENTEL',
  'CL',
  'Telecomunicaciones',
  'Telefonía móvil',
  '{"original_category":"Telecomunicaciones","original_subcategory":"Telefonía móvil","original_domain":"entel.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'movistar',
  'Movistar',
  'MOVISTAR',
  'BRAND_MOVISTAR',
  'CL',
  'Telecomunicaciones',
  'Telefonía móvil',
  '{"original_category":"Telecomunicaciones","original_subcategory":"Telefonía móvil","original_domain":"movistar.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'mundo',
  'Mundo',
  'MUNDO',
  'BRAND_MUNDO',
  'CL',
  'Telecomunicaciones',
  'Telefonía móvil',
  '{"original_category":"Telecomunicaciones","original_subcategory":"Telefonía móvil","original_domain":"mundo.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'wom',
  'WOM',
  'WOM',
  'BRAND_WOM',
  'CL',
  'Telecomunicaciones',
  'Telefonía móvil',
  '{"original_category":"Telecomunicaciones","original_subcategory":"Telefonía móvil","original_domain":"wom.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'air-france',
  'Air France',
  'AIR FRANCE',
  'BRAND_AIR_FRANCE',
  'CL',
  'Viajes y transporte',
  'Aerolíneas',
  '{"original_category":"Viajes y transporte","original_subcategory":"Aerolíneas","original_domain":"airfrance.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'american-airlines',
  'American Airlines',
  'AMERICAN AIRLINES',
  'BRAND_AMERICAN_AIRLINES',
  NULL,
  'Viajes y transporte',
  'Aerolíneas',
  '{"original_category":"Viajes y transporte","original_subcategory":"Aerolíneas","original_domain":"aa.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'avianca',
  'Avianca',
  'AVIANCA',
  'BRAND_AVIANCA',
  NULL,
  'Viajes y transporte',
  'Aerolíneas',
  '{"original_category":"Viajes y transporte","original_subcategory":"Aerolíneas","original_domain":"avianca.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'copa-airlines',
  'Copa Airlines',
  'COPA AIRLINES',
  'BRAND_COPA_AIRLINES',
  NULL,
  'Viajes y transporte',
  'Aerolíneas',
  '{"original_category":"Viajes y transporte","original_subcategory":"Aerolíneas","original_domain":"copaair.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'delta-air-lines',
  'Delta Air Lines',
  'DELTA AIR LINES',
  'BRAND_DELTA_AIR_LINES',
  NULL,
  'Viajes y transporte',
  'Aerolíneas',
  '{"original_category":"Viajes y transporte","original_subcategory":"Aerolíneas","original_domain":"delta.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'iberia',
  'Iberia',
  'IBERIA',
  'BRAND_IBERIA',
  NULL,
  'Viajes y transporte',
  'Aerolíneas',
  '{"original_category":"Viajes y transporte","original_subcategory":"Aerolíneas","original_domain":"iberia.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'jetsmart',
  'JetSMART',
  'JETSMART',
  'BRAND_JETSMART',
  NULL,
  'Viajes y transporte',
  'Aerolíneas',
  '{"original_category":"Viajes y transporte","original_subcategory":"Aerolíneas","original_domain":"jetsmart.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'klm',
  'KLM',
  'KLM',
  'BRAND_KLM',
  'CL',
  'Viajes y transporte',
  'Aerolíneas',
  '{"original_category":"Viajes y transporte","original_subcategory":"Aerolíneas","original_domain":"klm.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'latam',
  'LATAM',
  'LATAM',
  'BRAND_LATAM',
  NULL,
  'Viajes y transporte',
  'Aerolíneas',
  '{"original_category":"Viajes y transporte","original_subcategory":"Aerolíneas","original_domain":"latamairlines.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'sky-airline',
  'Sky Airline',
  'SKY AIRLINE',
  'BRAND_SKY_AIRLINE',
  NULL,
  'Viajes y transporte',
  'Aerolíneas',
  '{"original_category":"Viajes y transporte","original_subcategory":"Aerolíneas","original_domain":"skyairlines.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'united-airlines',
  'United Airlines',
  'UNITED AIRLINES',
  'BRAND_UNITED_AIRLINES',
  NULL,
  'Viajes y transporte',
  'Aerolíneas',
  '{"original_category":"Viajes y transporte","original_subcategory":"Aerolíneas","original_domain":"ua.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'cabify',
  'Cabify',
  'CABIFY',
  'BRAND_CABIFY',
  'CL',
  'Viajes y transporte',
  'Apps de transporte',
  '{"original_category":"Viajes y transporte","original_subcategory":"Apps de transporte","original_domain":"cabify.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'didi',
  'DiDi',
  'DIDI',
  'BRAND_DIDI',
  NULL,
  'Viajes y transporte',
  'Apps de transporte',
  '{"original_category":"Viajes y transporte","original_subcategory":"Apps de transporte","original_domain":"didi.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'transvip',
  'Transvip',
  'TRANSVIP',
  'BRAND_TRANSVIP',
  'CL',
  'Viajes y transporte',
  'Apps de transporte',
  '{"original_category":"Viajes y transporte","original_subcategory":"Apps de transporte","original_domain":"transvip.cl","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'uber',
  'Uber',
  'UBER',
  'BRAND_UBER',
  NULL,
  'Viajes y transporte',
  'Apps de transporte',
  '{"original_category":"Viajes y transporte","original_subcategory":"Apps de transporte","original_domain":"uber.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'indrive',
  'inDrive',
  'INDRIVE',
  'BRAND_INDRIVE',
  NULL,
  'Viajes y transporte',
  'Apps de transporte',
  '{"original_category":"Viajes y transporte","original_subcategory":"Apps de transporte","original_domain":"indrive.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'discord',
  'Discord',
  'DISCORD',
  'BRAND_DISCORD',
  NULL,
  'Viajes y transporte',
  'Mensajería',
  '{"original_category":"Viajes y transporte","original_subcategory":"Mensajería","original_domain":"discord.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'messenger',
  'Messenger',
  'MESSENGER',
  'BRAND_MESSENGER',
  NULL,
  'Viajes y transporte',
  'Mensajería',
  '{"original_category":"Viajes y transporte","original_subcategory":"Mensajería","original_domain":"messenger.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'signal',
  'Signal',
  'SIGNAL',
  'BRAND_SIGNAL',
  NULL,
  'Viajes y transporte',
  'Mensajería',
  '{"original_category":"Viajes y transporte","original_subcategory":"Mensajería","original_domain":"signal.org","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'telegram',
  'Telegram',
  'TELEGRAM',
  'BRAND_TELEGRAM',
  NULL,
  'Viajes y transporte',
  'Mensajería',
  '{"original_category":"Viajes y transporte","original_subcategory":"Mensajería","original_domain":"telegram.org","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'wechat',
  'WeChat',
  'WECHAT',
  'BRAND_WECHAT',
  NULL,
  'Viajes y transporte',
  'Mensajería',
  '{"original_category":"Viajes y transporte","original_subcategory":"Mensajería","original_domain":"wechat.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (
  (SELECT id FROM public.entity_types WHERE slug = 'brand'),
  'whatsapp',
  'WhatsApp',
  'WHATSAPP',
  'BRAND_WHATSAPP',
  NULL,
  'Viajes y transporte',
  'Mensajería',
  '{"original_category":"Viajes y transporte","original_subcategory":"Mensajería","original_domain":"whatsapp.com","catalog_source":"excel","curation_status":"curated","notes":""}'::jsonb
) ON CONFLICT (canonical_code) DO NOTHING;

