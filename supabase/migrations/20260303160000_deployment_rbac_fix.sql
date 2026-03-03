-- =====================================================
-- OPINA+ V13 — DEPLOYMENT FIX: RBAC & ARCHITECTURE SYNC
-- Fecha: 2026-03-03
-- Objetivo: Asegurar que los permisos de admin y el sistema de invitaciones
--           apunten a public.users (Arquitectura V12.2+)
-- =====================================================

BEGIN;

-- 1. Actualizar validación de administrador para usar public.users
CREATE OR REPLACE FUNCTION public.is_admin_user()
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
      AND COALESCE(u.role, 'user') = 'admin'
  );
$$;

-- 2. Asegurar permisos de ejecución
GRANT EXECUTE ON FUNCTION public.is_admin_user() TO authenticated;

-- 3. (Opcional) Corregir otros RPCs administrativos si detectamos más dependencias en profiles
-- Por ahora, el sistema de invitaciones usa is_admin_user() internamente, 
-- por lo que esta corrección propaga el acceso correcto a:
-- - admin_generate_invites
-- - admin_list_invites
-- - admin_revoke_invite

COMMIT;
