BEGIN;

CREATE OR REPLACE FUNCTION public.lookup_battle_options_context(
  p_option_ids uuid[]
)
RETURNS TABLE(
  option_id uuid,
  option_label text,
  battle_id uuid,
  battle_title text,
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
    bo.id AS option_id,
    bo.label AS option_label,
    bo.battle_id,
    b.title AS battle_title,
    bo.brand_id AS entity_id,
    e.name AS entity_name,
    COALESCE(e.image_url, bo.image_url) AS image_url,
    COALESCE(e.category, c.slug) AS category_slug
  FROM public.battle_options bo
  LEFT JOIN public.battles b ON b.id = bo.battle_id
  LEFT JOIN public.categories c ON c.id = b.category_id
  LEFT JOIN public.entities e ON e.id = bo.brand_id
  WHERE bo.id = ANY(p_option_ids);
$$;

GRANT EXECUTE ON FUNCTION public.lookup_battle_options_context(uuid[]) TO anon, authenticated;

COMMIT;
