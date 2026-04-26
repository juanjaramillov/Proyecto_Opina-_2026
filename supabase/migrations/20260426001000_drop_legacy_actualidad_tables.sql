-- Drop de tablas legacy reemplazadas por current_topics.
--
-- Confirmado en auditoría 2026-04-26:
--   * src/: 0 lecturas/escrituras (.from('actualidad_topics' | 'user_actualidad_responses')).
--     Las 48 ocurrencias de "actualidad" en src/ son del módulo editorial Actualidad
--     que ya migró a current_topics.
--   * supabase/functions: 0 referencias.
--   * supabase/cleanup_all_users_and_data.sql: ya idempotente vía
--     `information_schema.tables` guards (líneas 51-54 y 79-81), skipea silenciosamente
--     si las tablas no existen.
--   * src/supabase/database.types.ts: auto-generado, se regenera tras este DROP
--     con `npm run ops:db:generate-types`.
--
-- Orden de DROP: primero la tabla con FK (user_actualidad_responses.tema_id_fkey
-- → actualidad_topics.id), luego la padre. CASCADE por seguridad si quedaran
-- objetos dependientes (políticas, triggers, índices).

DROP TABLE IF EXISTS public.user_actualidad_responses CASCADE;
DROP TABLE IF EXISTS public.actualidad_topics CASCADE;
