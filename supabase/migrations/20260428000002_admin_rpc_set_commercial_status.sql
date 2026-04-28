-- =========================================================
-- RPC: admin_set_commercial_status
-- Permite a un admin cambiar el estado comercial de una entidad o categoría
-- desde la UI admin. Cada cambio queda registrado en admin_audit_log.
--
-- Sigue patrón canónico:
--   * SECURITY DEFINER + search_path estricto (memoria F-02)
--   * Verificación de admin con is_admin_user() (memoria F-03)
--   * Audit log con log_admin_action (memoria project_opina_admin_audit_log)
--   * REVOKE PUBLIC + GRANT authenticated (memoria F-08)
-- =========================================================

CREATE OR REPLACE FUNCTION public.admin_set_commercial_status(
  p_target_type text,                              -- 'entity' | 'category'
  p_target_id   uuid,
  p_status      public.commercial_status_t
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_old_status public.commercial_status_t;
  v_target_exists boolean;
BEGIN
  -- 1. Verificar que el caller es admin
  IF NOT public.is_admin_user() THEN
    RAISE EXCEPTION 'forbidden: admin only';
  END IF;

  -- 2. Validar target_type
  IF p_target_type NOT IN ('entity', 'category') THEN
    RAISE EXCEPTION 'invalid target_type %, must be entity or category', p_target_type;
  END IF;

  -- 3. Validar status (defensa extra; el enum ya restringe)
  IF p_status NOT IN ('sellable', 'restricted', 'pending_review') THEN
    RAISE EXCEPTION 'invalid status %', p_status;
  END IF;

  -- 4. Aplicar cambio + capturar estado anterior
  IF p_target_type = 'entity' THEN
    SELECT commercial_status INTO v_old_status
      FROM public.entities WHERE id = p_target_id;

    GET DIAGNOSTICS v_target_exists = ROW_COUNT;
    IF v_old_status IS NULL AND NOT EXISTS (SELECT 1 FROM public.entities WHERE id = p_target_id) THEN
      RAISE EXCEPTION 'entity not found: %', p_target_id;
    END IF;

    UPDATE public.entities
       SET commercial_status = p_status
     WHERE id = p_target_id;

  ELSE -- category
    SELECT commercial_status INTO v_old_status
      FROM public.categories WHERE id = p_target_id;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'category not found: %', p_target_id;
    END IF;

    UPDATE public.categories
       SET commercial_status = p_status
     WHERE id = p_target_id;
  END IF;

  -- 5. Audit log (firma real: action, target_type, target_id::text, payload)
  PERFORM public.log_admin_action(
    'set_commercial_status',
    p_target_type,
    p_target_id::text,
    jsonb_build_object(
      'old_status', v_old_status,
      'new_status', p_status
    )
  );
END;
$$;

ALTER FUNCTION public.admin_set_commercial_status(text, uuid, public.commercial_status_t) OWNER TO postgres;

REVOKE ALL ON FUNCTION public.admin_set_commercial_status(text, uuid, public.commercial_status_t) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_set_commercial_status(text, uuid, public.commercial_status_t)
  TO authenticated, service_role;

-- Refrescar PostgREST schema cache
NOTIFY pgrst, 'reload schema';
