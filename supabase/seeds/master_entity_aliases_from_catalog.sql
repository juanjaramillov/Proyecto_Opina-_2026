-- Master entity aliases (opcional)
-- ON CONFLICT ignore to be safe

-- Example: Some names might have useful aliases
/* 
INSERT INTO public.entity_aliases (entity_id, alias_name, alias_normalized, confidence_score) 
SELECT id, 'Short Name', 'SHORT NAME', 1.0 FROM public.signal_entities WHERE canonical_code = 'BRAND_LONG_NAME' ON CONFLICT DO NOTHING;
*/
