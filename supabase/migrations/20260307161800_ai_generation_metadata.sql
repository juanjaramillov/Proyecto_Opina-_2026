-- Migration: Add AI generation metadata to categories table

-- 1. Añadimos las nuevas columnas a la tabla categories
ALTER TABLE categories
ADD COLUMN comparison_family TEXT,
ADD COLUMN entity_type TEXT,
ADD COLUMN generation_mode TEXT DEFAULT 'ai_curated_pairs',
ADD COLUMN pairing_rules TEXT,
ADD COLUMN review_required BOOLEAN DEFAULT true,
ADD COLUMN active BOOLEAN DEFAULT true;

-- 2. Asegurar que las descripciones de los campos estén claras como comentarios en la DB
COMMENT ON COLUMN categories.comparison_family IS 'Familia comparativa general: brand_service, physical_place, destination, product, personal_state';
COMMENT ON COLUMN categories.entity_type IS 'Entidad específica comparada dentro de la familia. Ej: bank_brand, health_insurance, tv_channel';
COMMENT ON COLUMN categories.generation_mode IS 'Modos: ai_curated_pairs, manual_curated, ai_open_generation, trend_reactive, personal_pulse';
COMMENT ON COLUMN categories.pairing_rules IS 'Instrucción o restricción para la IA sobre con quién se puede emparejar. Ej: same_entity_type_only';

-- 3. Update data to fill some defaults for existing categories
UPDATE categories 
SET comparison_family = 'brand_service',
    entity_type = 'general_brand',
    generation_mode = 'ai_curated_pairs',
    pairing_rules = 'same_entity_type_only'
WHERE comparison_family IS NULL;

-- Para "Tu Pulso" (Vida diaria), configuraremos a personal_pulse
UPDATE categories
SET comparison_family = 'personal_state',
    entity_type = 'personal_metric',
    generation_mode = 'personal_pulse',
    review_required = false
WHERE slug IN (
    'presupuesto-del-hogar',
    'costo-de-vida-percibido',
    'deuda-y-carga-financiera',
    'estres-semanal',
    'energia-diaria',
    'sueno',
    'optimismo-futuro',
    'carga-laboral',
    'tiempo-libre-real',
    'salud-mental-autopercepcion',
    'vida-en-tu-ciudad',
    'seguridad-percibida'
);
