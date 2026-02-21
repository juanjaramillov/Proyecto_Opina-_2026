-- Migración: Automatización de Ranking Snapshots (pg_cron)
-- Fecha: 2026-02-20
-- 20260220000100_automate_ranking_snapshots.sql

-- 1. Habilitar extensión pg_cron (si no está activa)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2. Eliminar cron previo si existe (evita duplicados)
DO $$
BEGIN
    PERFORM cron.unschedule(jobid)
    FROM cron.job
    WHERE jobname = 'refresh_rankings_every_3_hours';
EXCEPTION
    WHEN OTHERS THEN
        NULL; -- Ignorar si no existe o falla el unschedule
END $$;

-- 3. Crear programación cada 3 horas
-- '0 */3 * * *' significa: minuto 0, cada 3 horas, todos los días
SELECT cron.schedule(
  'refresh_rankings_every_3_hours',
  '0 */3 * * *',
  $$ SELECT public.refresh_all_active_rankings(); $$
);

-- 4. Nota sobre verificación
-- En el editor SQL de Supabase se puede ejecutar:
-- SELECT jobid, jobname, schedule, active FROM cron.job WHERE jobname = 'refresh_rankings_every_3_hours';
