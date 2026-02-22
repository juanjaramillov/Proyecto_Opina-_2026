-- =========================================================
-- Migración de Reparación: Alineación de Categorías y Profundidad
-- Fecha: 2026-02-21
-- =========================================================

BEGIN;

-- 1. Forzar alineación de categorías para entidades críticas (basado en slug)
-- Esto asegura que las entidades sean procesadas por los loops de preguntas
UPDATE public.entities SET category = 'streaming' WHERE slug IN ('netflix', 'prime-video', 'disney-plus', 'max', 'apple-tv-plus', 'paramount-plus');
UPDATE public.entities SET category = 'bebidas' WHERE slug IN ('coca-cola', 'pepsi', 'red-bull', 'monster-energy', 'fanta', 'sprite');
UPDATE public.entities SET category = 'vacaciones' WHERE slug IN ('nueva-york', 'paris', 'tokio', 'rio-de-janeiro', 'roma', 'barcelona');
UPDATE public.entities SET category = 'smartphones' WHERE slug IN ('apple-iphone', 'samsung', 'xiaomi', 'huawei', 'google-pixel', 'motorola');
UPDATE public.entities SET category = 'salud' WHERE slug IN ('clinica-alemana', 'clinica-las-condes', 'clinica-santa-maria', 'clinica-davila', 'redsalud', 'integramedica');

-- 2. Asegurar que las batallas progresivas apunten a los battle_options correctos
-- Borramos opciones que no pertenezcan a las categorías del torneo (limpieza de basura)
DELETE FROM public.battle_options 
WHERE battle_id IN (SELECT id FROM public.battles WHERE slug LIKE 'tournament-%') 
AND brand_id NOT IN (SELECT id FROM public.entities WHERE category IN ('streaming', 'bebidas', 'vacaciones', 'smartphones', 'salud'));

-- 3. Volver a correr el loop de generación de preguntas para TODas las entidades en estas categorías
-- Esto garantiza que CADA entidad tenga al menos 6 preguntas en depth_definitions
DO $$
DECLARE
  v_ent RECORD;
BEGIN
  FOR v_ent IN SELECT id, name, category FROM public.entities WHERE category IN ('streaming', 'bebidas', 'vacaciones', 'smartphones', 'salud') LOOP
    -- Llamamos a la función de utilidad definida en la migración anterior
    PERFORM public.fn_ensure_entity_depth(v_ent.id);
  END LOOP;
END $$;

-- 4. Limpieza de batallas antiguas que puedan estar ensuciando el Hub
UPDATE public.battles SET status = 'archived' 
WHERE slug NOT IN (
  'tournament-streaming', 
  'tournament-bebidas', 
  'tournament-vacaciones', 
  'tournament-smartphones', 
  'tournament-salud',
  'apple-vs-samsung-2026',
  'coca-vs-pepsi-2026'
) AND status = 'active';

COMMIT;
