BEGIN;

-- Último refresh real (global o por categoría)
CREATE OR REPLACE FUNCTION public.get_agg_last_refreshed_at(
  p_category_slug text DEFAULT NULL
)
RETURNS timestamptz
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT MAX(last_refreshed_at)
  FROM public.entity_daily_aggregates
  WHERE (p_category_slug IS NULL OR category_slug = p_category_slug);
$$;

-- Tus últimas señales versus/progressive (solo del anon_id del usuario actual)
CREATE OR REPLACE FUNCTION public.get_my_recent_versus_signals(
  p_limit int DEFAULT 20
)
RETURNS TABLE(
  created_at timestamptz,
  battle_id uuid,
  battle_title text,
  option_id uuid,
  option_label text,
  entity_id uuid,
  entity_name text,
  image_url text,
  category_slug text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT
    se.created_at,
    se.battle_id,
    b.title AS battle_title,
    se.option_id,
    bo.label AS option_label,
    se.entity_id,
    e.name AS entity_name,
    COALESCE(e.image_url, bo.image_url) AS image_url,
    COALESCE(e.category, c.slug) AS category_slug
  FROM public.signal_events se
  LEFT JOIN public.battles b ON b.id = se.battle_id
  LEFT JOIN public.battle_options bo ON bo.id = se.option_id
  LEFT JOIN public.entities e ON e.id = se.entity_id
  LEFT JOIN public.categories c ON c.id = b.category_id
  WHERE se.anon_id = public.get_or_create_anon_id()
    AND se.module_type IN ('versus','progressive')
  ORDER BY se.created_at DESC
  LIMIT LEAST(p_limit, 50);
$$;

GRANT EXECUTE ON FUNCTION public.get_agg_last_refreshed_at(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_recent_versus_signals(int) TO anon, authenticated;

COMMIT;
