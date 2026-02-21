-- ==========================================
-- Data Cleanup: Battles & Depth
-- Objective: Start with a clean state for new model
-- ==========================================

BEGIN;

-- 1) Profundidad (Hijas primero)
DELETE FROM public.depth_answers;
DELETE FROM public.depth_questions;
DELETE FROM public.depth_surveys;

-- 2) Eventos e Historia
DELETE FROM public.signal_events;
DELETE FROM public.user_stats;

-- 3) Estructura de Batallas (Hijas primero)
DELETE FROM public.battle_options;

-- Nota: battle_instances puede existir por migraciones previas
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'battle_instances') THEN
        DELETE FROM public.battle_instances;
    END IF;
END $$;

-- 4) Raíz
DELETE FROM public.battles;

COMMIT;
