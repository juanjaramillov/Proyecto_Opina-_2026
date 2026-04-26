-- =====================================================================
-- 20260425032000_fix_audit_role_changes_columns
-- =====================================================================
-- FIX (Auditoría F-01): el trigger `audit_role_changes` definido en
-- 20260425031603_security_fix_prevent_role_escalation.sql intentaba
-- INSERT en columnas inexistentes (`target_resource`, `details`), lo
-- que provocaba ERROR `column "target_resource" does not exist` en
-- cualquier UPDATE de `public.users.role` y revertía la transacción
-- entera. Resultado: ningún admin podía cambiar roles en producción.
--
-- COLUMNAS REALES de admin_audit_log (definidas en
-- 20260424000100_admin_audit_log.sql):
--   id, created_at, actor_user_id, actor_email,
--   action, target_type, target_id, payload
--
-- SOLUCIÓN (Opción B — usar helper existente):
--   Reescribir `public.audit_role_changes()` para llamar al helper
--   `public.log_admin_action()` que ya está probado en producción
--   y se usa en las 6 RPCs admin instrumentadas. Beneficios:
--     - Una sola fuente de verdad para audit log.
--     - Llena `actor_email` automáticamente.
--     - Fallback a `app_events` si la inserción falla (defensa en
--       profundidad).
--     - Consistente con `admin_delete_invitation`, `admin_revoke_invite`,
--       `admin_generate_invites`, etc.
--
-- IDEMPOTENTE: usa CREATE OR REPLACE + DROP TRIGGER IF EXISTS.
-- =====================================================================

-- 1) Reemplazar la función con la versión corregida
CREATE OR REPLACE FUNCTION public.audit_role_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    PERFORM public.log_admin_action(
      'role_changed',
      'users',
      NEW.user_id::text,
      jsonb_build_object(
        'old_role', OLD.role,
        'new_role', NEW.role
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

ALTER FUNCTION public.audit_role_changes() OWNER TO postgres;

COMMENT ON FUNCTION public.audit_role_changes() IS
  'Trigger AFTER UPDATE OF role on public.users. Registra el cambio en '
  'admin_audit_log via log_admin_action() (helper centralizado). '
  'Reemplaza la versión rota de 20260425031603 que apuntaba a columnas '
  'inexistentes (target_resource, details).';

-- 2) Recrear trigger por idempotencia.
--    CREATE OR REPLACE FUNCTION no recrea el trigger, pero el trigger
--    ya apunta a la función por nombre, así que este DROP+CREATE es
--    sólo para garantizar el estado correcto si se aplica desde cero.
DROP TRIGGER IF EXISTS trg_audit_role_changes ON public.users;
CREATE TRIGGER trg_audit_role_changes
AFTER UPDATE OF role ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.audit_role_changes();

-- =====================================================================
-- VALIDACIÓN POST-DEPLOY
-- =====================================================================
-- Correr en Supabase Dashboard → SQL Editor (logueado como service_role
-- o como un admin con permisos sobre la tabla users):
--
-- -- 1) Cambiar el role de un usuario de prueba:
-- UPDATE public.users SET role = 'b2b'
--  WHERE user_id = '<UUID_DE_USUARIO_DE_PRUEBA>';
-- -- Resultado esperado: UPDATE 1 (sin error).
--
-- -- 2) Verificar que la auditoría se registró:
-- SELECT actor_email, action, target_type, target_id, payload, created_at
--   FROM public.admin_audit_log
--  ORDER BY created_at DESC LIMIT 1;
-- -- Resultado esperado: una fila con
-- --   action      = 'role_changed'
-- --   target_type = 'users'
-- --   target_id   = '<UUID_DE_USUARIO_DE_PRUEBA>'
-- --   payload     = {"old_role": "user", "new_role": "b2b"}
--
-- -- 3) Revertir el cambio de prueba:
-- UPDATE public.users SET role = 'user'
--  WHERE user_id = '<UUID_DE_USUARIO_DE_PRUEBA>';
-- =====================================================================
