-- Migración para añadir soporte de Resúmenes Mágicos (AI Insights) a las Batallas

-- 1. Añadimos la columna `ai_summary` a la tabla `battles`
ALTER TABLE public.battles
ADD COLUMN IF NOT EXISTS ai_summary TEXT;

-- Opcional: Podríamos añadir un timestamp para saber cuándo se generó
ALTER TABLE public.battles
ADD COLUMN IF NOT EXISTS ai_summary_generated_at TIMESTAMPTZ;

-- Comentar las columnas para documentar en la BD
COMMENT ON COLUMN public.battles.ai_summary IS 'Resumen corporativo generado por IA sobre el desempeño y polarización de esta batalla.';
COMMENT ON COLUMN public.battles.ai_summary_generated_at IS 'Fecha y hora en que la IA de OpenAI generó el resumen mágico.';
