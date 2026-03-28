-- Migración: Capa Canónica Analítica y Publicación B2C
-- Esta migración no destruye las funciones b2b_curated u overrides previamente creados.
-- Agrega soporte de rollup robusto y guarda el estado editorial B2C de /results.

-- 1. Rollup Diario de Entidades (Resume vs otras entidades en Versus General)
CREATE TABLE IF NOT EXISTS public.analytics_daily_entity_rollup (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID NOT NULL REFERENCES public.entities(id) ON DELETE CASCADE,
  summary_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_battles INT NOT NULL DEFAULT 0,
  wins INT NOT NULL DEFAULT 0,
  losses INT NOT NULL DEFAULT 0,
  preference_share NUMERIC(5,2) DEFAULT 0,
  momentum NUMERIC(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(entity_id, summary_date)
);

-- 2. Rollup Diario de Segmentos (Similar pero granular por demografía/comuna)
CREATE TABLE IF NOT EXISTS public.analytics_daily_segment_rollup (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID NOT NULL REFERENCES public.entities(id) ON DELETE CASCADE,
  segment_type TEXT NOT NULL, -- e.g. "age_range", "gender", "commune"
  segment_value TEXT NOT NULL, 
  summary_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_battles INT NOT NULL DEFAULT 0,
  wins INT NOT NULL DEFAULT 0,
  preference_share NUMERIC(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(entity_id, segment_type, segment_value, summary_date)
);

-- 3. Rollup Diario de Profundidad (Focus en atributos)
CREATE TABLE IF NOT EXISTS public.analytics_daily_depth_rollup (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID NOT NULL REFERENCES public.entities(id) ON DELETE CASCADE,
  attribute_category TEXT NOT NULL,
  summary_date DATE NOT NULL DEFAULT CURRENT_DATE,
  depth_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  responses_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(entity_id, attribute_category, summary_date)
);

-- 4. Estado de Publicación de Resultados B2C (Hero y Highlights Editoriales)
CREATE TABLE IF NOT EXISTS public.results_publication_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mode TEXT NOT NULL DEFAULT 'real' CHECK (mode IN ('synthetic', 'real', 'hybrid')),
  hero_payload JSONB DEFAULT '{}'::jsonb,
  highlights_payload JSONB DEFAULT '[]'::jsonb,
  blocks_visibility_payload JSONB DEFAULT '{}'::jsonb,
  published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Habilitar RLS en estas tablas
ALTER TABLE public.analytics_daily_entity_rollup ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_daily_segment_rollup ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_daily_depth_rollup ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.results_publication_state ENABLE ROW LEVEL SECURITY;

-- Politicas de Lectura para todos (B2B o internal components can read depending on facade logic)
CREATE POLICY "Enable read access for authenticated users in rollups" ON public.analytics_daily_entity_rollup
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable read access for authenticated users in rollups_seg" ON public.analytics_daily_segment_rollup
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable read access for authenticated users in rollups_dep" ON public.analytics_daily_depth_rollup
  FOR SELECT TO authenticated USING (true);

-- publication state es leido publicamente por B2C
CREATE POLICY "Enable read access for all users" ON public.results_publication_state
  FOR SELECT USING (true);

-- Sólo Admins escriben en configuration state
CREATE POLICY "Admins can insert config" ON public.results_publication_state
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "Admins can update config" ON public.results_publication_state
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
