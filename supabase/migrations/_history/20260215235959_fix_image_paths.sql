-- Migration: 20260215_fix_image_paths.sql
-- Description: Fix broken image paths by pointing to existing assets or setting to NULL where missing.

BEGIN;

-- 1. Netflix vs Disney+ (Fix paths)
UPDATE battle_options 
SET image_url = '/brands/netflix.png' 
WHERE label = 'Netflix';

UPDATE battle_options 
SET image_url = '/logos/disneyplus-logo.png' 
WHERE label = 'Disney+';

-- 2. Coca-Cola vs Pepsi (Fix Coke, Pepsi NULL)
UPDATE battle_options 
SET image_url = '/logos/cocacola.png' 
WHERE label = 'Coca-Cola';

UPDATE battle_options 
SET image_url = NULL 
WHERE label = 'Pepsi';

-- 3. iPhone vs Samsung (Apple Music logo as proxy for iPhone, Samsung NULL)
UPDATE battle_options 
SET image_url = '/logos/applemusic-logo.png' 
WHERE label = 'iPhone';

UPDATE battle_options 
SET image_url = NULL 
WHERE label = 'Samsung Galaxy';

-- 4. Uber vs Cabify (Both NULL)
UPDATE battle_options 
SET image_url = NULL 
WHERE label IN ('Uber', 'Cabify');

-- 5. Santiago vs Viña (Both NULL)
UPDATE battle_options 
SET image_url = NULL 
WHERE label IN ('Santiago', 'Viña del Mar');

-- 6. Online vs Física (Both NULL)
UPDATE battle_options 
SET image_url = NULL 
WHERE label IN ('Compra Online', 'Tienda Física');

COMMIT;
