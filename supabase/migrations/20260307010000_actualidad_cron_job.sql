-- Migration setup for calling the Actualidad-Bot Edge Function daily.

-- Empezamos asegurando que las extensiones existan en el schema correcto
CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "pg_cron" WITH SCHEMA extensions;

-- Asegurarse de quitar previamente el cron en caso de que esta migración se repita.
DO $$
BEGIN
  PERFORM cron.unschedule('actualidad-bot-trigger');
EXCEPTION WHEN OTHERS THEN
  -- Ignorar error si el trabajo cron no existe aún
END $$;

-- Se programa para todos los días a las 6:00 AM (0 6 * * *)
-- ATENCIÓN: Al implementar en producción, debes reemplazar la URL y ANON_KEY
-- con tu project reference y tu service_role key en el Dashboard de Supabase.
SELECT
  cron.schedule(
    'actualidad-bot-trigger',
    '0 6 * * *',
    $$
    SELECT
      net.http_post(
          url:='https://neltawfiwpvunkwyvfse.supabase.co/functions/v1/actualidad-bot',
          headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5lbHRhd2Zpd3B2dW5rd3l2ZnNlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjI5NDY3NiwiZXhwIjoyMDg3NjU0Njc2fQ.ORbgP0bwLL4YLyO0b2-kiP30mCo6b14qhbiBfKE1h2o"}'::jsonb,
          body:=concat('{"time": "', current_timestamp, '"}')::jsonb
      ) as request_id;
    $$
  );
