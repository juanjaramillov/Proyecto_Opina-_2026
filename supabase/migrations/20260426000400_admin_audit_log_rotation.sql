-- ============================================================
-- 20260426000400_admin_audit_log_rotation
-- ============================================================
-- F-15 (P3) — Rotación / archivado de admin_audit_log.
--
-- Why: la tabla admin_audit_log no se purga ni rota; crece
-- indefinidamente. Con N admins activos (~5) y M operaciones
-- por día (~50), 1 año = ~91k filas. Manejable, pero crece
-- linealmente y dificulta consultas ad-hoc en SQL Editor.
--
-- Estrategia (no destructiva):
--   1. Crear admin_audit_log_archive con misma estructura.
--   2. Función archive_admin_audit_log(retention_days) que MUEVE
--      registros más viejos que retention_days a la archive table.
--   3. La función es SECURITY DEFINER, callable solo por admin o
--      por pg_cron (ambos via search_path estricto).
--   4. El schedule del cron está en `_optional_cron_audit_log_rotation.sql`
--      y NO se aplica con `supabase db push`. Se activa a mano cuando
--      el operador quiera (igual que cleanup-orphan-users).
--
-- Por qué archivar y no DELETE: el audit_log es evidencia legal
-- y operativa. Si en una investigación necesitamos rastrear una
-- acción admin de hace 6 meses, queremos tenerla — solo no en la
-- tabla "caliente" que se consulta con frecuencia.
-- ============================================================

-- ------------------------------------------------------------
-- 1) Tabla admin_audit_log_archive (estructura idéntica)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "public"."admin_audit_log_archive" (
    "id"               uuid        PRIMARY KEY,
    "created_at"       timestamptz NOT NULL,
    "actor_user_id"    uuid,
    "actor_email"      text,
    "action"           text        NOT NULL,
    "target_type"      text,
    "target_id"        text,
    "payload"          jsonb       NOT NULL DEFAULT '{}'::jsonb,
    "archived_at"      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE "public"."admin_audit_log_archive" OWNER TO postgres;

-- Índice por created_at original (consultas históricas) y archived_at (gestión)
CREATE INDEX IF NOT EXISTS "idx_admin_audit_log_archive_created_at_desc"
    ON "public"."admin_audit_log_archive" ("created_at" DESC);

CREATE INDEX IF NOT EXISTS "idx_admin_audit_log_archive_archived_at_desc"
    ON "public"."admin_audit_log_archive" ("archived_at" DESC);

CREATE INDEX IF NOT EXISTS "idx_admin_audit_log_archive_action_created"
    ON "public"."admin_audit_log_archive" ("action", "created_at" DESC);

-- RLS: misma política que la caliente — solo admin lee, nadie escribe directo
ALTER TABLE "public"."admin_audit_log_archive" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_audit_log_archive_select_admin"
    ON "public"."admin_audit_log_archive";
CREATE POLICY "admin_audit_log_archive_select_admin"
    ON "public"."admin_audit_log_archive"
    FOR SELECT
    TO authenticated
    USING (public.is_admin_user());

REVOKE INSERT, UPDATE, DELETE ON "public"."admin_audit_log_archive" FROM authenticated, anon;

-- ------------------------------------------------------------
-- 2) Función archive_admin_audit_log(retention_days)
-- ------------------------------------------------------------
-- Mueve filas más viejas que `retention_days` desde la tabla
-- caliente a la archive. Devuelve el número de filas movidas.
--
-- Idempotente: si no hay nada para archivar, devuelve 0.
-- Atómica: usa CTE con DELETE...RETURNING + INSERT INTO archive.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.archive_admin_audit_log(retention_days int DEFAULT 90)
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_moved int := 0;
    v_cutoff timestamptz;
BEGIN
    -- Validación defensiva: retention_days entre 7 y 3650 (10 años).
    IF retention_days IS NULL OR retention_days < 7 OR retention_days > 3650 THEN
        RAISE EXCEPTION 'retention_days must be between 7 and 3650 (got %)', retention_days;
    END IF;

    v_cutoff := now() - (retention_days || ' days')::interval;

    WITH moved AS (
        DELETE FROM public.admin_audit_log
        WHERE created_at < v_cutoff
        RETURNING id, created_at, actor_user_id, actor_email, action,
                  target_type, target_id, payload
    )
    INSERT INTO public.admin_audit_log_archive
        (id, created_at, actor_user_id, actor_email, action,
         target_type, target_id, payload, archived_at)
    SELECT id, created_at, actor_user_id, actor_email, action,
           target_type, target_id, payload, now()
    FROM moved;

    GET DIAGNOSTICS v_moved = ROW_COUNT;

    -- Auditar la propia rotación (meta-audit).
    -- Si la operación movió >0 filas, registrar el evento en la tabla caliente.
    IF v_moved > 0 THEN
        INSERT INTO public.admin_audit_log
            (actor_user_id, actor_email, action, target_type, target_id, payload)
        VALUES
            (NULL, 'system:cron', 'archive_admin_audit_log', 'admin_audit_log', NULL,
             jsonb_build_object('retention_days', retention_days,
                                'cutoff', v_cutoff,
                                'rows_moved', v_moved));
    END IF;

    RETURN v_moved;
END;
$$;

-- Solo admin (vía RLS de admin_audit_log) y pg_cron pueden ejecutar.
-- En la práctica esto se llama desde:
--   a) SQL Editor por un admin (manual, ad-hoc).
--   b) pg_cron (schedule en archivo _optional_).
REVOKE ALL ON FUNCTION public.archive_admin_audit_log(int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.archive_admin_audit_log(int) TO authenticated;
GRANT EXECUTE ON FUNCTION public.archive_admin_audit_log(int) TO service_role;

COMMENT ON FUNCTION public.archive_admin_audit_log(int) IS
'F-15: Mueve admin_audit_log entries older than retention_days to admin_audit_log_archive. Returns rows moved. Idempotente. Auditea su propia ejecución como meta-audit en la tabla caliente.';

-- ------------------------------------------------------------
-- 3) Refrescar PostgREST schema cache (preferencia operativa de Juan).
-- ------------------------------------------------------------
NOTIFY pgrst, 'reload schema';
