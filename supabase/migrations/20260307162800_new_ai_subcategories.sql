-- Insert new subcategories for Moda
INSERT INTO categories (name, slug, comparison_family, entity_type, generation_mode, pairing_rules) VALUES
('Ropa básica', 'ropa-basica', 'product', 'apparel_brand', 'ai_curated_pairs', 'same_entity_type_only'),
('Fast fashion', 'fast-fashion', 'brand_service', 'retail_brand', 'ai_curated_pairs', 'same_entity_type_only'),
('Calzado', 'calzado', 'product', 'shoe_brand', 'ai_curated_pairs', 'same_entity_type_only'),
('Deportivo', 'deportivo', 'product', 'sports_brand', 'ai_curated_pairs', 'same_entity_type_only'),
('Outdoor', 'outdoor', 'product', 'outdoor_brand', 'ai_curated_pairs', 'same_entity_type_only'),
('Accesorios', 'accesorios', 'product', 'accessory_brand', 'ai_curated_pairs', 'same_entity_type_only')
ON CONFLICT (slug) DO NOTHING;

-- Insert new subcategories for Turismo
INSERT INTO categories (name, slug, comparison_family, entity_type, generation_mode, pairing_rules) VALUES
('OTAs / Agencias', 'agencias-otas', 'brand_service', 'travel_agency', 'ai_curated_pairs', 'same_entity_type_only'),
('Destinos (Playa)', 'destinos-playa', 'destination', 'beach_destination', 'ai_curated_pairs', 'same_entity_type_only'),
('Destinos (Urbanos)', 'destinos-urbanos', 'destination', 'city_destination', 'ai_curated_pairs', 'same_entity_type_only'),
('Escapadas / Termas', 'escapadas-termas', 'destination', 'getaway_destination', 'ai_curated_pairs', 'same_entity_type_only')
ON CONFLICT (slug) DO NOTHING;

-- Deactivate the old ambiguous categories
UPDATE categories SET active = false WHERE slug IN ('marcas', 'balnearios', 'playas');
