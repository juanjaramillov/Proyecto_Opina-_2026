-- ==========================================
-- Clear Mock Data (Entities, Battles, Options)
-- ==========================================

BEGIN;

-- TRUNCATE all transaction and content tables to leave a clean slate
-- CASCADE will ensure dependent rows in linking tables are also removed.
TRUNCATE TABLE public.signal_events CASCADE;
TRUNCATE TABLE public.battle_instances CASCADE;
TRUNCATE TABLE public.battle_options CASCADE;
TRUNCATE TABLE public.depth_definitions CASCADE;
TRUNCATE TABLE public.battles CASCADE;
TRUNCATE TABLE public.entities CASCADE;

COMMIT;
