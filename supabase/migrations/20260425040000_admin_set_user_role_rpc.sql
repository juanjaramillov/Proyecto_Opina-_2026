-- =====================================================================
-- F-03 (CTO audit, 2026-04-25): RPC admin_set_user_role
-- =====================================================================
--
-- POR QUÉ:
-- Hoy `src/features/admin/services/adminUsersService.ts:29` escribe
-- `users.role` con un `.update({ role })` directo desde el cliente.
-- La defensa actual ya bloquea escalación de privilegios:
--   - Policy `users_update_self_safe` (20260425031603): no-admin no puede
--     cambiar su propio role.
--   - Policy `admin_update_any_user` (20260425031603): solo admin escribe.
--   - Trigger `prevent_unauthorized_role_change` (20260425031603): defensa
--     en profundidad incluso para escrituras vía service_role.
--   - Trigger `audit_role_changes` (20260425032000): registra cada cambio
--     en admin_audit_log vía log_admin_action.
--
-- LO QUE FALTA y este archivo agrega — REGLAS DE NEGOCIO que RLS no cubre:
--   1) Un admin no puede cambiarse el role a sí mismo (auto-degradación
--      accidental → quedar fuera de la consola).
--   2) El admin canónico (UUID e9ac2e3e-3c13-4b7d-8763-81d8094efe65,
--      email admin@opina.com) es intocable. Se identifica por UUID
--      hardcodeado, NO por email — el UUID es PK de public.users,
--      inmutable y sin dependencia de auth.users.
--   3) No se puede degradar al ÚLTIMO admin existente (el sistema queda
--      sin operador).
--   4) Solo roles válidos: 'user', 'admin', 'b2b'.
--
-- DECISIONES:
-- - SECURITY DEFINER + SET search_path = public, extensions, pg_temp.
-- - GRANT EXECUTE TO authenticated (la propia RPC valida que el caller
--   es admin; sin GRANT a anon/public).
-- - SET LOCAL app.allow_role_change = 'yes' antes del UPDATE para que
--   el trigger `prevent_unauthorized_role_change` deje pasar este UPDATE
--   "autorizado" (ese GUC ya está soportado en 20260425031603).
-- - El audit log lo emite el trigger AFTER UPDATE OF role automáticamente,
--   no se duplica desde aquí.
-- - Errores con SQLSTATE estándar:
--     '42501' insufficient_privilege  → caller no es admin / target protegido
--     '22023' invalid_parameter_value → role inválido / target inexistente
--     '23514' check_violation         → último admin / self-change
--
-- IDEMPOTENTE: CREATE OR REPLACE FUNCTION + DROP/RE-GRANT.
-- =====================================================================

CREATE OR REPLACE FUNCTION public.admin_set_user_role(
    p_target_user_id uuid,
    p_new_role       text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
    v_caller_id        uuid := auth.uid();
    v_target_old_role  text;
    v_admin_count      int;
    -- UUID hardcodeado del admin canónico (admin@opina.com).
    -- Identificarlo por UUID es inmutable y no depende de auth.users.
    v_canonical_admin  constant uuid := 'e9ac2e3e-3c13-4b7d-8763-81d8094efe65';
BEGIN
    -- 0) Validar input básico
    IF p_target_user_id IS NULL THEN
        RAISE EXCEPTION 'p_target_user_id is required'
            USING ERRCODE = '22023';
    END IF;

    IF p_new_role IS NULL OR p_new_role NOT IN ('user', 'admin', 'b2b') THEN
        RAISE EXCEPTION 'Invalid role. Allowed: user, admin, b2b. Got: %', p_new_role
            USING ERRCODE = '22023';
    END IF;

    -- 1) Caller debe estar autenticado y ser admin
    IF v_caller_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required'
            USING ERRCODE = '42501';
    END IF;

    IF NOT public.current_user_is_admin() THEN
        RAISE EXCEPTION 'Admin role required'
            USING ERRCODE = '42501';
    END IF;

    -- 2) Bloquear auto-cambios. Un admin no debe poder degradarse a sí mismo
    --    accidentalmente. Para emergencias hay service_role + SQL directo.
    IF p_target_user_id = v_caller_id THEN
        RAISE EXCEPTION 'Cannot change your own role'
            USING ERRCODE = '23514';
    END IF;

    -- 3) Bloquear toques al admin canónico (chequeo por UUID, sin JOIN
    --    a auth.users → cero dependencia externa, inmune a duplicados
    --    de email). El check va ANTES del SELECT del target para que ni
    --    siquiera se gaste un round-trip si la operación está prohibida.
    IF p_target_user_id = v_canonical_admin THEN
        RAISE EXCEPTION 'Cannot modify canonical admin (%)', v_canonical_admin
            USING ERRCODE = '42501';
    END IF;

    -- 4) Cargar role actual del target
    SELECT u.role
      INTO v_target_old_role
      FROM public.users u
     WHERE u.user_id = p_target_user_id;

    IF v_target_old_role IS NULL THEN
        RAISE EXCEPTION 'Target user does not exist: %', p_target_user_id
            USING ERRCODE = '22023';
    END IF;

    -- 5) Si el cambio degrada un admin a no-admin, asegurar que no es el último
    IF v_target_old_role = 'admin' AND p_new_role <> 'admin' THEN
        SELECT count(*)::int INTO v_admin_count
          FROM public.users
         WHERE role = 'admin';

        IF v_admin_count <= 1 THEN
            RAISE EXCEPTION 'Cannot demote the last admin in the system'
                USING ERRCODE = '23514';
        END IF;
    END IF;

    -- 6) No-op si el role ya es el deseado (no escribir, no auditar)
    IF v_target_old_role = p_new_role THEN
        RETURN jsonb_build_object(
            'changed',    false,
            'reason',     'noop',
            'user_id',    p_target_user_id,
            'old_role',   v_target_old_role,
            'new_role',   p_new_role
        );
    END IF;

    -- 7) Autorizar el UPDATE para el trigger prevent_unauthorized_role_change
    --    (ese trigger lee app.allow_role_change vía current_setting).
    PERFORM set_config('app.allow_role_change', 'yes', true); -- true = SET LOCAL

    -- 8) Aplicar el cambio.
    --    El trigger AFTER UPDATE OF role (audit_role_changes) registra
    --    automáticamente en admin_audit_log via log_admin_action.
    UPDATE public.users
       SET role = p_new_role
     WHERE user_id = p_target_user_id;

    -- 9) Devolver resumen útil al frontend
    RETURN jsonb_build_object(
        'changed',    true,
        'user_id',    p_target_user_id,
        'old_role',   v_target_old_role,
        'new_role',   p_new_role
    );
END;
$$;

ALTER FUNCTION public.admin_set_user_role(uuid, text) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.admin_set_user_role(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_set_user_role(uuid, text) TO authenticated, service_role;

COMMENT ON FUNCTION public.admin_set_user_role(uuid, text) IS
  'F-03: única vía oficial para cambiar public.users.role. Aplica reglas '
  'de negocio (no self, no canónico admin@opina.com, no último admin) '
  'y delega audit al trigger audit_role_changes vía log_admin_action.';

-- =====================================================================
-- VALIDACIÓN POST-DEPLOY (correr en SQL Editor con sesión admin)
-- =====================================================================
-- 1) Caso feliz: admin cambia role de un usuario normal.
--    SELECT public.admin_set_user_role(
--      '<UUID_USER_NORMAL>'::uuid, 'b2b'
--    );
--    Esperado: jsonb {"changed": true, "old_role": "user", "new_role": "b2b"}.
--    Y: SELECT * FROM admin_audit_log ORDER BY created_at DESC LIMIT 1;
--    Esperado: action='role_changed', target_id='<UUID_USER_NORMAL>'.
--
-- 2) Auto-cambio (debe fallar):
--    SELECT public.admin_set_user_role(auth.uid(), 'user');
--    Esperado: ERROR '23514' Cannot change your own role.
--
-- 3) Toque al canónico (debe fallar — el UUID está hardcodeado):
--    SELECT public.admin_set_user_role(
--      'e9ac2e3e-3c13-4b7d-8763-81d8094efe65'::uuid, 'user'
--    );
--    Esperado: ERROR '42501' Cannot modify canonical admin.
--
-- 4) Caller no-admin (debe fallar):
--    Loguearse como user normal y SELECT public.admin_set_user_role(...).
--    Esperado: ERROR '42501' Admin role required.
--
-- 5) Role inválido:
--    SELECT public.admin_set_user_role('<uuid>'::uuid, 'superadmin');
--    Esperado: ERROR '22023' Invalid role.
-- =====================================================================
