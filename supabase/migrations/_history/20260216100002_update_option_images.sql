-- Migration: 20260216_update_option_images.sql
-- Description: Update image_url for all brand-related options in battle_options

BEGIN;

-- Streaming & Entertainment
UPDATE battle_options SET image_url = '/images/options/netflix.png' WHERE label ILIKE 'Netflix';
UPDATE battle_options SET image_url = '/images/options/disneyplus.svg' WHERE label ILIKE 'Disney%';
UPDATE battle_options SET image_url = '/images/options/hbomax.png' WHERE label ILIKE 'HBO Max';
UPDATE battle_options SET image_url = '/images/options/primevideo.png' WHERE label ILIKE 'Prime Video';
UPDATE battle_options SET image_url = '/images/options/marvel.png' WHERE label ILIKE 'Marvel';
UPDATE battle_options SET image_url = '/images/options/dc.png' WHERE label ILIKE 'DC';
UPDATE battle_options SET image_url = '/images/options/starwars.png' WHERE label ILIKE 'Star Wars';
UPDATE battle_options SET image_url = '/images/options/harrypotter.png' WHERE label ILIKE 'Harry Potter';

-- Music
UPDATE battle_options SET image_url = '/images/options/spotify.png' WHERE label ILIKE 'Spotify';
UPDATE battle_options SET image_url = '/images/options/youtube.png' WHERE label ILIKE 'YouTube Music';
UPDATE battle_options SET image_url = '/images/options/amazonmusic.png' WHERE label ILIKE 'Amazon Music';
UPDATE battle_options SET image_url = '/images/options/applemusic.png' WHERE label ILIKE 'Apple Music';
UPDATE battle_options SET image_url = '/images/options/soundcloud.png' WHERE label ILIKE 'SoundCloud';

-- Gaming
UPDATE battle_options SET image_url = '/images/options/playstation.png' WHERE label ILIKE 'PlayStation';
UPDATE battle_options SET image_url = '/images/options/xbox.png' WHERE label ILIKE 'Xbox';
UPDATE battle_options SET image_url = '/images/options/nintendo.png' WHERE label ILIKE 'Nintendo';

-- Banking & Fintech
UPDATE battle_options SET image_url = '/images/options/santander.png' WHERE label ILIKE 'Santander';
UPDATE battle_options SET image_url = '/images/options/bancochile.png' WHERE label ILIKE 'Banco de Chile';
UPDATE battle_options SET image_url = '/images/options/bancoestado.png' WHERE label ILIKE 'Banco Estado';
UPDATE battle_options SET image_url = '/images/options/bci.png' WHERE label ILIKE 'BCI';
UPDATE battle_options SET image_url = '/images/options/scotiabank.png' WHERE label ILIKE 'Scotiabank';
UPDATE battle_options SET image_url = '/images/options/mercadopago.png' WHERE label ILIKE 'Pago Digital' OR label ILIKE 'Mercado Pago';
UPDATE battle_options SET image_url = '/images/options/mach.png' WHERE label ILIKE 'MACH';
UPDATE battle_options SET image_url = '/images/options/tenpo.png' WHERE label ILIKE 'Tenpo';

-- Retail & Supermarkets
UPDATE battle_options SET image_url = '/images/options/falabella.png' WHERE label ILIKE 'Falabella';
UPDATE battle_options SET image_url = '/images/options/paris.png' WHERE label ILIKE 'Paris';
UPDATE battle_options SET image_url = '/images/options/lider.png' WHERE label ILIKE 'Lider';
UPDATE battle_options SET image_url = '/images/options/jumbo.png' WHERE label ILIKE 'Jumbo';
UPDATE battle_options SET image_url = '/images/options/santaisabel.png' WHERE label ILIKE 'Santa Isabel';
UPDATE battle_options SET image_url = '/images/options/tottus.png' WHERE label ILIKE 'Tottus';
UPDATE battle_options SET image_url = '/images/options/unimarc.png' WHERE label ILIKE 'Unimarc';

-- Food & Beverages
UPDATE battle_options SET image_url = '/images/options/cocacola.png' WHERE label ILIKE 'Coca-Cola';
UPDATE battle_options SET image_url = '/images/options/burgerking.png' WHERE label ILIKE 'Burger King';
UPDATE battle_options SET image_url = '/images/options/mcdonalds.png' WHERE label ILIKE 'McDonald%';
UPDATE battle_options SET image_url = '/images/options/kfc.png' WHERE label ILIKE 'KFC';
UPDATE battle_options SET image_url = '/images/options/subway.png' WHERE label ILIKE 'Subway';
UPDATE battle_options SET image_url = '/images/options/dominos.png' WHERE label ILIKE 'Dominos' OR label ILIKE 'Domino''s%';

-- Airlines
UPDATE battle_options SET image_url = '/images/options/latam.png' WHERE label ILIKE 'LATAM';
UPDATE battle_options SET image_url = '/images/options/sky.png' WHERE label ILIKE 'SKY%';
UPDATE battle_options SET image_url = '/images/options/jetsmart.png' WHERE label ILIKE 'JetSmart';
UPDATE battle_options SET image_url = '/images/options/american.png' WHERE label ILIKE 'American Airlines';
UPDATE battle_options SET image_url = '/images/options/united.png' WHERE label ILIKE 'United Airlines';
UPDATE battle_options SET image_url = '/images/options/avianca.png' WHERE label ILIKE 'Avianca';
UPDATE battle_options SET image_url = '/images/options/copa.png' WHERE label ILIKE 'Copa Airlines';
UPDATE battle_options SET image_url = '/images/options/azul.png' WHERE label ILIKE 'Azul';
UPDATE battle_options SET image_url = '/images/options/gol.png' WHERE label ILIKE 'Gol';
UPDATE battle_options SET image_url = '/images/options/delta.png' WHERE label ILIKE 'Delta';

-- Fashion
UPDATE battle_options SET image_url = '/images/options/nike.png' WHERE label ILIKE 'Nike';
UPDATE battle_options SET image_url = '/images/options/adidas.png' WHERE label ILIKE 'Adidas';
UPDATE battle_options SET image_url = '/images/options/puma.png' WHERE label ILIKE 'Puma';
UPDATE battle_options SET image_url = '/images/options/newbalance.png' WHERE label ILIKE 'New Balance';
UPDATE battle_options SET image_url = '/images/options/skechers.png' WHERE label ILIKE 'Skechers';

-- Tech
UPDATE battle_options SET image_url = '/images/options/samsung.png' WHERE label ILIKE 'Samsung';

-- Sports
UPDATE battle_options SET image_url = '/images/options/colo-colo.png' WHERE label ILIKE 'Colo-Colo';
UPDATE battle_options SET image_url = '/images/options/udechile.png' WHERE label ILIKE 'U. de Chile' OR label ILIKE 'Universidad de Chile';

COMMIT;
