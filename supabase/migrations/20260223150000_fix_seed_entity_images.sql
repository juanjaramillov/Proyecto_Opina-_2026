-- =========================================================
-- Fix Missing Images in Seeded Entities
-- Goal: Update the image_url column in public.entities and 
-- cascade to public.battle_options for the initial 30 entities
-- =========================================================

BEGIN;

-- STREAMING
UPDATE public.entities SET image_url = '/images/options/netflix.png' WHERE slug = 'netflix';
UPDATE public.entities SET image_url = '/images/options/primevideo.png' WHERE slug = 'prime-video';
UPDATE public.entities SET image_url = '/images/options/disneyplus.svg' WHERE slug = 'disney-plus';
UPDATE public.entities SET image_url = '/images/options/hbomax.png' WHERE slug = 'max';
UPDATE public.entities SET image_url = '/images/options/appletv.png' WHERE slug = 'apple-tv-plus';
UPDATE public.entities SET image_url = '/images/options/paramount.png' WHERE slug = 'paramount-plus';

-- BEBIDAS
UPDATE public.entities SET image_url = '/images/options/cocacola.png' WHERE slug = 'coca-cola';
UPDATE public.entities SET image_url = '/images/options/pepsi.png' WHERE slug = 'pepsi';
UPDATE public.entities SET image_url = '/images/options/redbull.png' WHERE slug = 'red-bull';
UPDATE public.entities SET image_url = '/images/options/monster.png' WHERE slug = 'monster-energy';
UPDATE public.entities SET image_url = '/images/options/fanta.png' WHERE slug = 'fanta';
UPDATE public.entities SET image_url = '/images/options/sprite.png' WHERE slug = 'sprite';

-- VACACIONES
UPDATE public.entities SET image_url = '/images/options/nuevayork.png' WHERE slug = 'nueva-york';
UPDATE public.entities SET image_url = '/images/options/paris.png' WHERE slug = 'paris';
UPDATE public.entities SET image_url = '/images/options/tokio.png' WHERE slug = 'tokio';
UPDATE public.entities SET image_url = '/images/options/riodejaneiro.png' WHERE slug = 'rio-de-janeiro';
UPDATE public.entities SET image_url = '/images/options/roma.png' WHERE slug = 'roma';
UPDATE public.entities SET image_url = '/images/options/barcelona.png' WHERE slug = 'barcelona';

-- SMARTPHONES
UPDATE public.entities SET image_url = '/images/options/iphone.png' WHERE slug = 'apple-iphone';
UPDATE public.entities SET image_url = '/images/options/samsung.png' WHERE slug = 'samsung';
UPDATE public.entities SET image_url = '/images/options/xiaomi.png' WHERE slug = 'xiaomi';
UPDATE public.entities SET image_url = '/images/options/huawei.png' WHERE slug = 'huawei';
UPDATE public.entities SET image_url = '/images/options/pixel.png' WHERE slug = 'google-pixel';
UPDATE public.entities SET image_url = '/images/options/motorola.png' WHERE slug = 'motorola';

-- SALUD
UPDATE public.entities SET image_url = '/images/options/clinicaalemana.png' WHERE slug = 'clinica-alemana';
UPDATE public.entities SET image_url = '/images/options/clc.png' WHERE slug = 'clinica-las-condes';
UPDATE public.entities SET image_url = '/images/options/clinicasantamaria.png' WHERE slug = 'clinica-santa-maria';
UPDATE public.entities SET image_url = '/images/options/clinicadavila.png' WHERE slug = 'clinica-davila';
UPDATE public.entities SET image_url = '/images/options/redsalud.png' WHERE slug = 'redsalud';
UPDATE public.entities SET image_url = '/images/options/integramedica.png' WHERE slug = 'integramedica';

-- UPDATE THE BATTLE OPTIONS TO SYNC WITH ENTITIES
UPDATE public.battle_options bo
SET image_url = e.image_url
FROM public.entities e
WHERE bo.brand_id = e.id AND e.image_url IS NOT NULL;

COMMIT;
