BEGIN;

-- 1. Eliminar instancias de batallas
TRUNCATE TABLE battle_instances CASCADE;

-- 2. Eliminar batallas y opciones
TRUNCATE TABLE battles CASCADE;
TRUNCATE TABLE battle_options CASCADE;

-- 3. Eliminar agregados de categorías y rankings
TRUNCATE TABLE category_daily_aggregates CASCADE;
TRUNCATE TABLE category_attributes CASCADE;
TRUNCATE TABLE entity_daily_aggregates CASCADE;
TRUNCATE TABLE entity_rank_snapshots CASCADE;
TRUNCATE TABLE public_rank_snapshots CASCADE;
TRUNCATE TABLE depth_definitions CASCADE;
TRUNCATE TABLE depth_aggregates CASCADE;

-- 4. Eliminar todas las categorías
DELETE FROM categories;

-- 5. Eliminar todas las entidades de tipo marca
DELETE FROM entities WHERE type = 'brand';

COMMIT;
