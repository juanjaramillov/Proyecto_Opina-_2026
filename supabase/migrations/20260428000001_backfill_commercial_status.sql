-- =========================================================
-- BACKFILL: marcar catálogo actual como sellable
--
-- Decisión Juan 2026-04-27:
--   * Las ~80 categorías existentes son brand_service / product comerciales puras
--   * No hay políticos ni actualidad en categories (viven en current_topics
--     y signal_entities, que quedan fuera de scope B2B por design)
--   * Zonas grises (medios, fútbol, infantil, alcohólicas) → SELLABLE,
--     responsabilidad de cumplimiento publicitario delegada al cliente
--     vía AUP (cuando se redacte)
--
-- Categorías futuras (cualquier INSERT nuevo) entran en pending_review
-- automáticamente y requieren curaduría admin antes de exponerse.
-- =========================================================

UPDATE public.categories
   SET commercial_status = 'sellable'::public.commercial_status_t
 WHERE commercial_status = 'pending_review'::public.commercial_status_t;

-- Verificación inline post-backfill
DO $$
DECLARE
  v_sellable_count int;
  v_pending_count  int;
  v_restricted_count int;
BEGIN
  SELECT count(*) FILTER (WHERE commercial_status = 'sellable'),
         count(*) FILTER (WHERE commercial_status = 'pending_review'),
         count(*) FILTER (WHERE commercial_status = 'restricted')
    INTO v_sellable_count, v_pending_count, v_restricted_count
    FROM public.categories;

  RAISE NOTICE 'Backfill commercial_status completado:';
  RAISE NOTICE '  sellable        = %', v_sellable_count;
  RAISE NOTICE '  pending_review  = %', v_pending_count;
  RAISE NOTICE '  restricted      = %', v_restricted_count;

  IF v_sellable_count = 0 THEN
    RAISE EXCEPTION 'Backfill falló: 0 categorías marcadas como sellable. Revisar.';
  END IF;
END $$;
