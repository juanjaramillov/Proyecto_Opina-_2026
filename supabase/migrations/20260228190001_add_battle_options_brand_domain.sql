BEGIN;

ALTER TABLE public.battle_options
ADD COLUMN IF NOT EXISTS brand_domain text;

COMMIT;
