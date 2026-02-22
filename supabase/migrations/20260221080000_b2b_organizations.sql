-- =====================================================
-- OPINA+ V12 — FIX 15: B2B ORGANIZATION LAYER
-- =====================================================

-- 1. Crear tabla de organizaciones
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Crear tabla de miembros de organización
CREATE TABLE IF NOT EXISTS public.organization_members (
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member', -- 'admin', 'member', 'viewer'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (org_id, user_id)
);

-- 3. Añadir context organizacional a tablas de analíticas
ALTER TABLE public.ranking_snapshots ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);
ALTER TABLE public.depth_aggregates ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);

-- Index para multi-tenancy
CREATE INDEX IF NOT EXISTS idx_ranking_snapshots_org ON public.ranking_snapshots(organization_id);
CREATE INDEX IF NOT EXISTS idx_depth_aggregates_org ON public.depth_aggregates(organization_id);

-- 4. Actualizar RLS para analíticas (Filtrar por Organización)
-- Snapshot de Ranking
ALTER TABLE public.ranking_snapshots DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ranking_snapshots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Access ranking snapshots by org membership" ON public.ranking_snapshots;
CREATE POLICY "Access ranking snapshots by org membership" ON public.ranking_snapshots
FOR SELECT
TO authenticated
USING (
  -- Los admins del sistema ven todo (basado en el rol de la tabla users implementado en FIX 11)
  (EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id = auth.uid() AND (auth.users.raw_user_meta_data->>'role') = 'admin'))
  OR
  -- Usuarios ven snapshots de su organización
  organization_id IN (SELECT org_id FROM public.organization_members WHERE user_id = auth.uid())
);

-- Depth Aggregates
ALTER TABLE public.depth_aggregates DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.depth_aggregates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Access depth aggregates by org membership" ON public.depth_aggregates;
CREATE POLICY "Access depth aggregates by org membership" ON public.depth_aggregates
FOR SELECT
TO authenticated
USING (
  (EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id = auth.uid() AND (auth.users.raw_user_meta_data->>'role') = 'admin'))
  OR
  organization_id IN (SELECT org_id FROM public.organization_members WHERE user_id = auth.uid())
);

-- 5. Crear una organización demo por defecto para B2B
INSERT INTO public.organizations (name, slug)
VALUES ('Opina+ B2B Demo', 'opina-demo')
ON CONFLICT (slug) DO NOTHING;
