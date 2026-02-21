-- Migration: 20260215_fix_battles_visibility.sql
-- Description: Fix visibility for new battles by setting is_public and is_active (if exists) to true

BEGIN;

-- 1. Fix is_public (Confimado que existe y está null en los nuevos)
UPDATE battles
SET is_public = true
WHERE status = 'active'
  AND (is_public IS NULL OR is_public = false);

-- 2. Try to fix is_active (Si la columna existe)
-- Usamos un bloque DO para evitar error si la columna no existe en esta versión de la tabla
DO $$
BEGIN
  -- Intentar update si la columna existe en information_schema
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'battles' 
      AND column_name = 'is_active'
  ) THEN
    EXECUTE 'UPDATE battles SET is_active = true WHERE status = ''active'' AND (is_active IS NULL OR is_active = false)';
  END IF;
END $$;

COMMIT;
