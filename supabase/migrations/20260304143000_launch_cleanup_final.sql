-- =========================================================
-- PURGA FINAL PARA LANZAMIENTO
-- - Mantiene solo cuentas de Administrador
-- - Limpia todos los usuarios de prueba
-- - Resetea todas las tablas de actividad y métricas
-- =========================================================

DO $$
DECLARE
  t text;
  tables_to_clean text[] := ARRAY[
    'signal_events', 
    'user_daily_metrics', 
    'user_state_logs', 
    'module_interest_events', 
    'user_tracking_metrics', 
    'user_stats', 
    'anonymous_identities', 
    'invitation_codes',
    'user_level_history',
    'user_achievements',
    'app_events',
    'whatsapp_feedback',
    'invitation_observability'
  ];
BEGIN
  -- 1. Truncar tablas de actividad (public)
  FOR t IN SELECT table_name FROM information_schema.tables 
           WHERE table_schema = 'public' 
           AND table_name = ANY(tables_to_clean)
  LOOP
    RAISE NOTICE 'Truncating table: public.%', t;
    EXECUTE 'TRUNCATE TABLE public.' || quote_ident(t) || ' CASCADE';
  END LOOP;

  -- 2. Eliminar usuarios de Auth (esto cascadeará a public.users y public.user_profiles)
  -- Protegemos:
  -- - Emails que contengan 'admin'
  -- - Emails con dominio '@opina.plus'
  -- - El email del dueño (juanjaramillov@gmail.com)
  DELETE FROM auth.users 
  WHERE email NOT LIKE '%admin%' 
    AND email NOT LIKE '%opina.plus%'
    AND email NOT LIKE 'juanjaramillov%';

  RAISE NOTICE 'Cleanup complete. Only admin users remain.';
END $$;
