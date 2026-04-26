-- ============================================================
-- Hardening RLS: catálogos, puentes y snapshots (Fase 4)
-- ============================================================
-- Cubre las 11 tablas restantes del audit inicial. Todas son
-- catálogos, link tables o snapshots internos. Ninguna tiene
-- user_id. Ninguna se consume directamente desde el front.
--
-- Patrón uniforme: backend-only (RLS sin policies). Las vistas
-- que las JOINean (v_comparative_preference_summary, etc.)
-- siguen funcionando porque Postgres ejecuta vistas con los
-- privilegios del owner (postgres), no del usuario que consulta.
--
-- Validado empíricamente: Fase 1 aplicó el mismo patrón a
-- signal_types (usada en el mismo patrón de vistas) y el front
-- siguió funcionando correctamente.
-- ============================================================

ALTER TABLE public.context_links          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entity_context_links   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entity_category_links  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_entity_links      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_context_links     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_catalog       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_set_items     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_snapshots      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entity_legacy_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.depth_definitions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_levels    ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.context_links          IS 'Backend-only. RLS sin policies. Usada en vistas que corren como owner.';
COMMENT ON TABLE public.entity_context_links   IS 'Backend-only. RLS sin policies. Usada en vistas que corren como owner.';
COMMENT ON TABLE public.entity_category_links  IS 'Backend-only. RLS sin policies. Usada en vistas que corren como owner.';
COMMENT ON TABLE public.news_entity_links      IS 'Backend-only. RLS sin policies. Usada en vistas que corren como owner.';
COMMENT ON TABLE public.news_context_links     IS 'Backend-only. RLS sin policies. Usada en vistas que corren como owner.';
COMMENT ON TABLE public.question_catalog       IS 'Backend-only. RLS sin policies. Usada en vistas que corren como owner.';
COMMENT ON TABLE public.question_set_items     IS 'Backend-only. RLS sin policies. Usada en vistas que corren como owner.';
COMMENT ON TABLE public.content_snapshots      IS 'Backend-only. RLS sin policies. Snapshots históricos de noticias.';
COMMENT ON TABLE public.entity_legacy_mappings IS 'Backend-only. RLS sin policies. Mapeo de migraciones legacy.';
COMMENT ON TABLE public.depth_definitions      IS 'Backend-only. RLS sin policies. Usada en vistas que corren como owner.';
COMMENT ON TABLE public.verification_levels    IS 'Backend-only. RLS sin policies. Usada en v_signal_events_enriched.';
