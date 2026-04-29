-- =========================================================
-- Extiende la tabla b2b_leads con campos de cualificación
-- para el rediseño de /intelligence (Fase D).
--
-- Nuevos campos:
--   * tier_interesado   — Basic / Pro / Enterprise / undecided
--   * scope_interesado  — entity / category / industry / all / undecided
--   * tamano_empresa    — bucket cualitativo (<50, 50-200, 200-1000, 1000+)
--   * industria         — industria del prospecto (opcional)
--   * source            — origen del CTA dentro de la landing (selector, api_stub, etc.)
-- =========================================================

ALTER TABLE public.b2b_leads
  ADD COLUMN IF NOT EXISTS tier_interesado  text,
  ADD COLUMN IF NOT EXISTS scope_interesado text,
  ADD COLUMN IF NOT EXISTS tamano_empresa   text,
  ADD COLUMN IF NOT EXISTS industria        text,
  ADD COLUMN IF NOT EXISTS source           text;

COMMENT ON COLUMN public.b2b_leads.tier_interesado  IS 'Tier que el prospecto seleccionó en el selector. Valores: basic | pro | enterprise | undecided.';
COMMENT ON COLUMN public.b2b_leads.scope_interesado IS 'Scope que el prospecto seleccionó. Valores: entity | category | industry | all | undecided.';
COMMENT ON COLUMN public.b2b_leads.tamano_empresa   IS 'Bucket de tamaño: lt_50 | b50_200 | b200_1000 | gt_1000.';
COMMENT ON COLUMN public.b2b_leads.industria        IS 'Industria autoreportada por el prospecto. Texto libre.';
COMMENT ON COLUMN public.b2b_leads.source           IS 'CTA dentro de la landing: tier_scope_selector | api_early_access | hero | manual.';
