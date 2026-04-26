-- ============================================================
-- ROLLBACK — Fase 4 RLS (catálogos y puentes)
-- ============================================================
-- NO APLICAR salvo que el deploy principal cause regresión.
-- Uso manual: Supabase SQL Editor → pegar contenido → Run.
-- ============================================================

ALTER TABLE public.context_links          DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.entity_context_links   DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.entity_category_links  DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_entity_links      DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_context_links     DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_catalog       DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_set_items     DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_snapshots      DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.entity_legacy_mappings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.depth_definitions      DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_levels    DISABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.context_links          IS NULL;
COMMENT ON TABLE public.entity_context_links   IS NULL;
COMMENT ON TABLE public.entity_category_links  IS NULL;
COMMENT ON TABLE public.news_entity_links      IS NULL;
COMMENT ON TABLE public.news_context_links     IS NULL;
COMMENT ON TABLE public.question_catalog       IS NULL;
COMMENT ON TABLE public.question_set_items     IS NULL;
COMMENT ON TABLE public.content_snapshots      IS NULL;
COMMENT ON TABLE public.entity_legacy_mappings IS NULL;
COMMENT ON TABLE public.depth_definitions      IS NULL;
COMMENT ON TABLE public.verification_levels    IS NULL;
