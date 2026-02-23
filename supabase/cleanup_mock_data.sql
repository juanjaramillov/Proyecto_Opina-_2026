-- =========================================================
-- Opina+ V12: MOCK DATA CLEANUP SCRIPT
-- =========================================================
-- IMPORTANTE: Este script elimina todos los datos de prueba
-- (Mock Data) insertados mediante el generador mock_data.sql.

DO $$
BEGIN
  RAISE NOTICE 'Iniciando limpieza de datos de prueba...';

  -- 1) Eliminar votos de prueba de signal_events
  -- Utilizamos el marcador JSONB 'is_mock' introducido en la base
  DELETE FROM public.signal_events
  WHERE meta->>'is_mock' = 'true';
  RAISE NOTICE 'Señales de prueba (votos) eliminadas exitosamente.';

  -- 2) Eliminar estados de usuario ficticios de user_state_logs
  -- Utilizamos el patrón de anon_id definido en el generador ('MOCK_USER_%')
  DELETE FROM public.user_state_logs
  WHERE anon_id LIKE 'MOCK_USER_%';
  RAISE NOTICE 'Registros de estado de usuario de prueba eliminados exitosamente.';

  RAISE NOTICE '¡Base de datos limpia de información de prueba!';
END $$;
