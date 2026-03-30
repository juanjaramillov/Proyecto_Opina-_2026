-- Migración: Saneamiento de Gobernanza y Blindaje de Lectura Analítica B2C
-- Fecha: 30 Mar 2026

-- 1. Backfill de datos históricos: migramos el concepto obsoleto 'synthetic' al nuevo estándar 'curated'
UPDATE public.results_publication_state 
SET mode = 'curated' 
WHERE mode = 'synthetic';

-- 2. Actualizamos el Constraint para reflejar la Fuente de Verdad tipográfica oficial
ALTER TABLE public.results_publication_state 
DROP CONSTRAINT IF EXISTS results_publication_state_mode_check;

ALTER TABLE public.results_publication_state 
ADD CONSTRAINT results_publication_state_mode_check 
CHECK (mode IN ('curated', 'real', 'hybrid'));

-- 3. Blindaje del Read Path: Índice optimizado para B2C
-- La UI consume siempre `ORDER BY published_at DESC LIMIT 1`. 
-- Este índice previene full table scans a medida que el historial crece.
CREATE INDEX IF NOT EXISTS idx_results_publication_state_published_desc 
ON public.results_publication_state (published_at DESC);
