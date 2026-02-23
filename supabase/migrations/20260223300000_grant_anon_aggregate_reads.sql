-- FIX: Grant execute permissions for aggregate reading RPCs to anon
-- Results and Rankings are public pages, so they must be readable by guests.

GRANT EXECUTE ON FUNCTION public.get_entity_trend_agg(uuid, int, text, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_category_overview_agg(text, int, text, text, text) TO anon, authenticated;
