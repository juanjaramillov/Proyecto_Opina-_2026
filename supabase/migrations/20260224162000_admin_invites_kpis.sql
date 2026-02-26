BEGIN;

-- Añadimos las columnas de métricas al resultado de admin_list_invites
-- Haciendo un LEFT JOIN con la tabla de users basándonos en used_by_user_id (users.user_id)
DROP FUNCTION IF EXISTS public.admin_list_invites(integer);

CREATE OR REPLACE FUNCTION public.admin_list_invites(p_limit int DEFAULT 200)
RETURNS TABLE (
  id uuid,
  code text,
  assigned_alias text,
  status text,
  expires_at timestamptz,
  used_at timestamptz,
  used_by_user_id uuid,
  created_at timestamptz,
  total_interactions bigint,
  total_time_spent_seconds bigint,
  total_sessions bigint,
  last_active_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT 
    ic.id, 
    ic.code, 
    ic.assigned_alias, 
    ic.status, 
    ic.expires_at, 
    ic.used_at, 
    ic.used_by_user_id, 
    ic.created_at,
    u.total_interactions,
    u.total_time_spent_seconds,
    u.total_sessions,
    u.last_active_at
  FROM public.invitation_codes ic
  LEFT JOIN public.users u ON ic.used_by_user_id = u.user_id
  WHERE public.is_admin_user() = true
  ORDER BY ic.created_at DESC
  LIMIT GREATEST(1, LEAST(COALESCE(p_limit, 200), 1000));
$$;

REVOKE ALL ON FUNCTION public.admin_list_invites(int) FROM anon;
GRANT EXECUTE ON FUNCTION public.admin_list_invites(int) TO authenticated;

NOTIFY pgrst, 'reload schema';

COMMIT;
