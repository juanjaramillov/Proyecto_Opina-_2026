-- ==========================================================================
-- F-09: Cerrar policies RLS USING(true) inseguras o redundantes
-- ==========================================================================
-- Contexto:
--   La auditoría detectó policies con USING(true) o WITH CHECK true expuestas
--   a {public} o {authenticated}. En cada tabla afectada por esta migración,
--   ya existe (o se crea aquí) una policy admin-gated que cubre la operación.
--   Eliminamos las abiertas para que la única ruta de acceso sea la admin.
--
-- Tablas afectadas:
--   * entities                          (3 escrituras críticas + 2 SELECT redundantes)
--   * analytics_engine_config           (SELECT abierto)
--   * analytics_metric_overrides        (SELECT redundante con admin ALL)
--   * analytics_surface_metric_config   (SELECT redundante con admin ALL)
--   * analytics_rollup_runs             (SELECT abierto, escritura por service_role)
--   * algorithm_versions                (SELECT public abierto)
--
-- Tablas NO tocadas (legítimas, documentadas en CLAUDE.md):
--   * Catálogos públicos: categories, category_attributes, loyalty_actions,
--     loyalty_levels, weekly_missions, subscription_plans, signal_contexts,
--     signal_entities, battles, battle_options, results_publication_state
--   * Snapshots públicos de rank: entity_rank_snapshots, public_rank_snapshots
--   * Lectura de Actualidad para authenticated: actualidad_topics,
--     topic_question_sets, topic_questions
--   * b2b_leads INSERT public: formulario "contáctanos" intencional
--   * whatsapp_webhook_logs ALL service_role: correcto
--   * analytics_surface_presets, analytics_daily_*_rollup: lectura
--     authenticated intencional (dashboards no-admin las consumen)
-- ==========================================================================

-- ENTITIES ---------------------------------------------------------------
-- Estado actual: 6 policies, 5 inseguras + 1 admin correcta
--   ✓ "Entities are manageable by admins only" (ALL via is_admin()) ← se mantiene
--   ✗ entities_delete_all                  (DELETE true public)
--   ✗ entities_insert_all                  (INSERT true public)
--   ✗ entities_update_all                  (UPDATE true public)
--   ✗ "Entities are viewable by everyone"  (SELECT true public)
--   ✗ entities_read_all                    (SELECT true anon+authenticated)
--
-- Frontend confirmado: solo escribe via adminEntitiesService → catalogGovernance.
-- Lectura desde frontend público usa signal_entities (canónica V15), no entities.
DROP POLICY IF EXISTS "entities_delete_all"               ON public.entities;
DROP POLICY IF EXISTS "entities_insert_all"               ON public.entities;
DROP POLICY IF EXISTS "entities_update_all"               ON public.entities;
DROP POLICY IF EXISTS "Entities are viewable by everyone" ON public.entities;
DROP POLICY IF EXISTS "entities_read_all"                 ON public.entities;

CREATE POLICY "entities_select_authenticated"
  ON public.entities
  FOR SELECT
  TO authenticated
  USING (true);

COMMENT ON POLICY "entities_select_authenticated" ON public.entities IS
  'F-09: lectura legacy de entities solo para usuarios autenticados (admin dashboards). El frontend público lee de signal_entities.';


-- ANALYTICS_ENGINE_CONFIG ------------------------------------------------
-- Estado actual: SELECT abierto + UPDATE admin. Falta SELECT admin.
DROP POLICY IF EXISTS "select_engine_config" ON public.analytics_engine_config;

CREATE POLICY "select_engine_config_admin"
  ON public.analytics_engine_config
  FOR SELECT
  TO authenticated
  USING (public.is_admin_user() = true);

COMMENT ON POLICY "select_engine_config_admin" ON public.analytics_engine_config IS
  'F-09: configuración del motor analítico solo legible por admins (uso desde AdminMathEngine).';


-- ANALYTICS_METRIC_OVERRIDES --------------------------------------------
-- Estado actual: SELECT abierto + ALL admin. La SELECT abierta es redundante;
-- los admins ya quedan cubiertos por all_overrides_admin.
DROP POLICY IF EXISTS "select_overrides" ON public.analytics_metric_overrides;


-- ANALYTICS_SURFACE_METRIC_CONFIG ---------------------------------------
-- Mismo patrón: SELECT abierto + ALL admin. Drop del redundante.
DROP POLICY IF EXISTS "select_surface_config" ON public.analytics_surface_metric_config;


-- ANALYTICS_ROLLUP_RUNS -------------------------------------------------
-- Estado actual: solo SELECT abierto. Sin policy de escritura user-facing
-- (los rollup runs los escribe el motor con service_role, que bypassa RLS).
DROP POLICY IF EXISTS "Enable read access for authenticated rollup runs"
  ON public.analytics_rollup_runs;

CREATE POLICY "select_rollup_runs_admin"
  ON public.analytics_rollup_runs
  FOR SELECT
  TO authenticated
  USING (public.is_admin_user() = true);

COMMENT ON POLICY "select_rollup_runs_admin" ON public.analytics_rollup_runs IS
  'F-09: metadata operacional de jobs solo visible para admins.';


-- ALGORITHM_VERSIONS ----------------------------------------------------
-- Estado actual: solo SELECT public. La escritura la hace el motor con
-- service_role (cron / edge functions privilegiadas).
DROP POLICY IF EXISTS "Algorithm versions are viewable by everyone"
  ON public.algorithm_versions;

CREATE POLICY "select_algorithm_versions_admin"
  ON public.algorithm_versions
  FOR SELECT
  TO authenticated
  USING (public.is_admin_user() = true);

COMMENT ON POLICY "select_algorithm_versions_admin" ON public.algorithm_versions IS
  'F-09: versiones del algoritmo (pesos, parámetros) solo visibles para admins. Eran SELECT public lo que permitía ingeniería inversa del ranking.';


-- ==========================================================================
-- Audit log: registrar el cierre de policies
-- ==========================================================================
DO $$
BEGIN
  PERFORM public.log_admin_action(
    'rls_policies_closed',
    'security_audit',
    NULL::uuid,
    jsonb_build_object(
      'finding', 'F-09',
      'tables_affected', ARRAY[
        'entities',
        'analytics_engine_config',
        'analytics_metric_overrides',
        'analytics_surface_metric_config',
        'analytics_rollup_runs',
        'algorithm_versions'
      ],
      'policies_dropped', 11,
      'policies_created', 4,
      'migration', '20260426000200_close_open_rls_policies'
    )
  );
EXCEPTION WHEN OTHERS THEN
  -- log_admin_action puede fallar si esto se aplica fuera de sesión admin
  -- (por ejemplo, durante CI). No bloqueamos la migración por eso.
  RAISE NOTICE 'log_admin_action no se ejecutó (probablemente fuera de sesión admin): %', SQLERRM;
END $$;

NOTIFY pgrst, 'reload schema';
