-- Migración para el sistema de Gobernanza Canónica de KPIs (Bloque 1)

-- 1. Crear tabla de overrides de métricas
CREATE TABLE IF NOT EXISTS public.analytics_metric_overrides (
  metric_id text PRIMARY KEY,
  is_enabled boolean NOT NULL DEFAULT true,
  forced_status text,
  visible_by_default_override boolean,
  min_sample_override int,
  min_n_eff_override int,
  max_freshness_hours_override int,
  exportable_override boolean,
  notes text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Crear tabla de presets por superficie
CREATE TABLE IF NOT EXISTS public.analytics_surface_presets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  surface_id text NOT NULL,
  preset_name text NOT NULL,
  is_active boolean NOT NULL DEFAULT false,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(surface_id, preset_name)
);

-- 3. Crear tabla de configuración de métrica por superficie
CREATE TABLE IF NOT EXISTS public.analytics_surface_metric_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  surface_id text NOT NULL,
  metric_id text NOT NULL,
  is_visible boolean NOT NULL DEFAULT true,
  slot_key text NOT NULL DEFAULT 'details',
  sort_order int NOT NULL DEFAULT 0,
  is_pinned boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(surface_id, metric_id)
);

-- Habilitar RLS
ALTER TABLE public.analytics_metric_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_surface_presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_surface_metric_config ENABLE ROW LEVEL SECURITY;

-- Políticas para analytics_metric_overrides
CREATE POLICY select_overrides ON public.analytics_metric_overrides
  FOR SELECT TO authenticated USING (true);

CREATE POLICY all_overrides_admin ON public.analytics_metric_overrides
  FOR ALL TO authenticated USING (public.is_admin_user() = true);


-- Políticas para analytics_surface_presets
CREATE POLICY select_presets ON public.analytics_surface_presets
  FOR SELECT TO authenticated USING (true);

CREATE POLICY all_presets_admin ON public.analytics_surface_presets
  FOR ALL TO authenticated USING (public.is_admin_user() = true);


-- Políticas para analytics_surface_metric_config
CREATE POLICY select_surface_config ON public.analytics_surface_metric_config
  FOR SELECT TO authenticated USING (true);

CREATE POLICY all_surface_config_admin ON public.analytics_surface_metric_config
  FOR ALL TO authenticated USING (public.is_admin_user() = true);

-- Insertar Presets Base requeridos
INSERT INTO public.analytics_surface_presets (surface_id, preset_name, is_active, description) VALUES
  ('results_hero', 'default_results', true, 'Configuración por defecto para Hero de B2C Results'),
  ('b2b_overview_top', 'default_b2b_overview', true, 'Dashboard base para B2B Overview'),
  ('b2b_benchmark_table', 'default_b2b_benchmark', true, 'Métricas base para tabla de Benchmark en B2B'),
  ('b2b_alerts_feed', 'default_b2b_alerts', true, 'Métricas visibles en feed de alertas B2B'),
  ('b2b_deep_dive_header', 'default_b2b_deep_dive', true, 'Métricas de cabecera para Deep Dive'),
  ('b2b_reports_export', 'default_reports', true, 'KPIs exportables por defecto en reportes PDF/CSV')
ON CONFLICT (surface_id, preset_name) DO NOTHING;

-- Insertar config metricas base (default_results)
INSERT INTO public.analytics_surface_metric_config (surface_id, metric_id, is_visible, slot_key, sort_order) VALUES
  ('results_hero', 'active_signals_24h', true, 'hero', 1),
  ('results_hero', 'leader_entity_name', true, 'hero', 2),
  ('results_hero', 'preference_share_leader', true, 'hero', 3),
  ('results_hero', 'market_tension_index', true, 'hero', 4),
  ('results_hero', 'freshness_hours', true, 'hero', 5),
  ('results_hero', 'fastest_riser_entity', true, 'hero', 6),
  ('results_hero', 'fastest_faller_entity', true, 'hero', 7),
  ('results_hero', 'community_activity_label', true, 'hero', 8),
  ('results_hero', 'leader_margin_vs_second', true, 'hero', 9),
  ('results_hero', 'most_contested_category', true, 'hero', 10),
  ('results_hero', 'fragmentation_label', true, 'hero', 11),
  ('results_hero', 'top_strength_attribute', true, 'hero', 12),
  ('results_hero', 'top_pain_attribute', true, 'hero', 13),
  ('results_hero', 'nps_leader_entity', true, 'hero', 14),
  ('results_news', 'hot_topic_title', true, 'hero', 15),
  ('results_news', 'hot_topic_heat_index', true, 'hero', 16),
  ('results_news', 'hot_topic_polarization_label', true, 'hero', 17),
  ('results_hero', 'generation_gap_label', true, 'hero', 18),
  ('results_hero', 'territory_gap_label', true, 'hero', 19)
ON CONFLICT (surface_id, metric_id) DO NOTHING;

-- Insertar config metricas base (default_b2b_overview)
INSERT INTO public.analytics_surface_metric_config (surface_id, metric_id, is_visible, slot_key, sort_order) VALUES
  ('b2b_overview_top', 'weighted_preference_share', true, 'hero', 1),
  ('b2b_overview_top', 'time_decay_momentum', true, 'hero', 2),
  ('b2b_overview_top', 'n_eff', true, 'hero', 3),
  ('b2b_overview_top', 'integrity_score', true, 'hero', 4),
  ('b2b_overview_top', 'reputation_risk_index', true, 'hero', 5),
  ('b2b_overview_top', 'preference_quality_gap', true, 'hero', 6),
  ('b2b_overview_top', 'topic_heat_index', true, 'hero', 7),
  ('b2b_overview_top', 'generation_gap_index', true, 'hero', 8)
ON CONFLICT (surface_id, metric_id) DO NOTHING;

-- Insertar config metricas base (default_b2b_benchmark)
INSERT INTO public.analytics_surface_metric_config (surface_id, metric_id, is_visible, slot_key, sort_order) VALUES
  ('b2b_benchmark_table', 'leader_rank', true, 'details', 1),
  ('b2b_benchmark_table', 'margin_vs_second', true, 'details', 2),
  ('b2b_benchmark_table', 'weighted_win_rate', true, 'details', 3),
  ('b2b_benchmark_table', 'wilson_lower_bound', true, 'details', 4),
  ('b2b_benchmark_table', 'wilson_upper_bound', true, 'details', 5),
  ('b2b_benchmark_table', 'entropy_normalized', true, 'details', 6),
  ('b2b_benchmark_table', 'stability_label', true, 'details', 7),
  ('b2b_benchmark_table', 'commercial_eligibility_label', true, 'details', 8)
ON CONFLICT (surface_id, metric_id) DO NOTHING;

