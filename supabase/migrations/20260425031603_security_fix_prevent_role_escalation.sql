-- =====================================================================
-- SECURITY FIX — S05: prevenir escalación de privilegios en public.users
-- =====================================================================
--
-- PROBLEMA:
--   La policy `users_update_self` permitía a cualquier usuario autenticado
--   actualizar su propia fila en public.users, SIN restricción sobre el
--   campo `role`. Resultado: un usuario con role='user' podía ejecutar
--     UPDATE public.users SET role = 'admin' WHERE user_id = auth.uid()
--   y convertirse en admin. Confirmado en el archivo
--     20260312000000_consolidated_baseline.sql:9647
--
-- SOLUCIÓN (defensa en profundidad):
--   1) Helper SECURITY DEFINER que sabe si el caller es admin leyendo
--      public.users (no profiles, que no existe). Aislado de la policy.
--   2) Reemplazar users_update_self por dos policies:
--       - users_update_self_safe: el usuario puede actualizar sus propios
--         campos PERO sólo si el role nuevo coincide con el role existente.
--       - admin_update_any_user: un admin puede actualizar cualquier fila
--         (incluyendo el role).
--   3) Trigger BEFORE UPDATE como defensa extra: si el campo role cambia
--      y el caller no es admin, aborta. Cubre el caso de escrituras con
--      service_role impersonando usuarios.
--
-- EFECTO ESPERADO:
--   - Usuarios normales siguen pudiendo actualizar sus propios datos.
--   - Si intentan cambiarse el role → ERROR.
--   - Admins pueden cambiar role de cualquier usuario.
--   - El service_role (Edge Functions) sigue funcionando porque BYPASSRLS,
--     pero el trigger exige justificación explícita (hook via SET LOCAL).
--
-- =====================================================================

-- 1) HELPER — ¿el caller actual es admin según public.users?
--    SECURITY DEFINER para poder leer la tabla con privilegios altos
--    sin depender de las RLS de la misma tabla (evita recursión).
CREATE OR REPLACE FUNCTION public.current_user_is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users u
    WHERE u.user_id = auth.uid()
      AND u.role = 'admin'
  );
$$;

COMMENT ON FUNCTION public.current_user_is_admin() IS
  'Retorna true si el auth.uid() actual tiene role=admin en public.users. '
  'Usar en policies RLS. Aislado de is_admin_user() que apuntaba a profiles (tabla inexistente).';

-- 2) POLICIES — eliminar la vieja permisiva y crear dos nuevas estrictas

-- Drop la vieja (permite cambiar cualquier campo, incluso role)
DROP POLICY IF EXISTS "users_update_self" ON public.users;

-- Usuario puede actualizarse a sí mismo, pero el role no cambia (o cambia
-- a su mismo valor). Si intenta ascenderse, WITH CHECK falla.
CREATE POLICY "users_update_self_safe"
ON public.users
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (
  user_id = auth.uid()
  AND role = (SELECT u.role FROM public.users u WHERE u.user_id = auth.uid())
);

-- Admin puede actualizar cualquier fila (cualquier campo, incluyendo role).
CREATE POLICY "admin_update_any_user"
ON public.users
FOR UPDATE
TO authenticated
USING (public.current_user_is_admin())
WITH CHECK (public.current_user_is_admin());

-- 3) TRIGGER — defensa extra incluso para conexiones que bypass RLS
--    (ej: service_role). La única forma de cambiar role desde service_role
--    es invocar explícitamente la función pública de admin (por definir),
--    o setear una GUC session-local que indique "permitido". Aquí sólo
--    bloqueamos cambios silenciosos.
CREATE OR REPLACE FUNCTION public.prevent_unauthorized_role_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_is_admin boolean;
  v_allow_override text;
BEGIN
  -- Si el campo role no cambia, dejar pasar
  IF NEW.role IS NOT DISTINCT FROM OLD.role THEN
    RETURN NEW;
  END IF;

  -- Permitir override explícito via GUC (para RPCs admin futuras)
  BEGIN
    v_allow_override := current_setting('app.allow_role_change', true);
  EXCEPTION WHEN OTHERS THEN
    v_allow_override := NULL;
  END;

  IF v_allow_override = 'yes' THEN
    RETURN NEW;
  END IF;

  -- Chequeo: ¿el caller es admin?
  v_is_admin := public.current_user_is_admin();

  IF NOT v_is_admin THEN
    RAISE EXCEPTION
      'Unauthorized role change blocked. user_id=%, old_role=%, new_role=%',
      NEW.user_id, OLD.role, NEW.role
      USING ERRCODE = '42501'; -- insufficient_privilege
  END IF;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.prevent_unauthorized_role_change() IS
  'Trigger BEFORE UPDATE en public.users. Bloquea cambios al campo role '
  'excepto si current_user_is_admin() o si se setea GUC app.allow_role_change=yes.';

DROP TRIGGER IF EXISTS trg_prevent_role_escalation ON public.users;
CREATE TRIGGER trg_prevent_role_escalation
BEFORE UPDATE OF role ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.prevent_unauthorized_role_change();

-- 4) AUDIT LOG — registrar cualquier cambio de role (exitoso o fallido)
--    Si ya existe admin_audit_log (según memoria, sí existe), anotar.
--    Si no existe, no romper: IF EXISTS.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'admin_audit_log'
  ) THEN
    EXECUTE $fn$
      CREATE OR REPLACE FUNCTION public.audit_role_changes()
      RETURNS trigger
      LANGUAGE plpgsql
      SECURITY DEFINER
      SET search_path = public, pg_temp
      AS $inner$
      BEGIN
        IF NEW.role IS DISTINCT FROM OLD.role THEN
          INSERT INTO public.admin_audit_log (actor_user_id, action, target_resource, details)
          VALUES (
            auth.uid(),
            'role_changed',
            'public.users:' || NEW.user_id::text,
            jsonb_build_object(
              'old_role', OLD.role,
              'new_role', NEW.role,
              'changed_at', now()
            )
          );
        END IF;
        RETURN NEW;
      END;
      $inner$;
    $fn$;

    DROP TRIGGER IF EXISTS trg_audit_role_changes ON public.users;
    EXECUTE 'CREATE TRIGGER trg_audit_role_changes
      AFTER UPDATE OF role ON public.users
      FOR EACH ROW EXECUTE FUNCTION public.audit_role_changes();';
  END IF;
END$$;

-- =====================================================================
-- PRUEBAS MANUALES POST-DEPLOY (correr en SQL Editor como usuario no-admin)
-- =====================================================================
-- 1) Un usuario normal intenta subirse a admin (debe fallar):
--      UPDATE public.users SET role = 'admin' WHERE user_id = auth.uid();
--    Resultado esperado: ERROR 42501 "Unauthorized role change blocked"
--
-- 2) Un usuario normal actualiza otro campo permitido (debe pasar):
--      UPDATE public.users SET last_active_at = now() WHERE user_id = auth.uid();
--    Resultado esperado: UPDATE 1
--
-- 3) Un admin cambia el role de otro usuario (debe pasar):
--      UPDATE public.users SET role = 'b2b' WHERE user_id = '<target>';
--    Resultado esperado: UPDATE 1 + fila nueva en admin_audit_log
-- =====================================================================
