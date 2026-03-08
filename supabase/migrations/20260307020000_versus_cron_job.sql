-- Configurar pg_cron para el versus bot automático (Semanalmente)

-- Habilitar extensiones requeridas (por si acaso no están)
CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "pg_cron" WITH SCHEMA extensions;

-- Usar un bloque DO para evitar errores si el job no existe antes de eliminarlo
DO $$
BEGIN
  PERFORM cron.unschedule('versus-bot-trigger');
EXCEPTION
  WHEN OTHERS THEN
    -- Ignorar error si el trabajo cron no existe aún
END $$;

-- Programar ejecución semanal (Cada Lunes a las 05:00 AM)
SELECT cron.schedule(
    'versus-bot-trigger',
    '0 5 * * 1',
    $$
    SELECT net.http_post(
        url:='https://neltawfiwpvunkwyvfse.supabase.co/functions/v1/versus-bot',
        headers:=jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5lbHRhd2Zpd3B2dW5rd3l2ZnNlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjI5NDY3NiwiZXhwIjoyMDg3NjU0Njc2fQ.ORbgP0bwLL4YLyO0b2-kiP30mCo6b14qhbiBfKE1h2o'
        ),
        body:='{}'::jsonb,
        timeout_milliseconds:=10000
    );
    $$
);
