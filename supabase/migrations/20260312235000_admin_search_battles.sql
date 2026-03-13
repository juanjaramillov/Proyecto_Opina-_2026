-- Migration: admin_search_battles
CREATE OR REPLACE FUNCTION admin_search_battles(
  search_term text DEFAULT '',
  status_filter text DEFAULT 'all',
  limit_count integer DEFAULT 50,
  offset_count integer DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  status text,
  created_at timestamptz,
  category_name text,
  total_votes bigint,
  options jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verificar si el usuario es admin
  IF NOT (
    (current_setting('request.jwt.claims', true)::jsonb ->> 'role') = 'admin' OR
    EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin'))
  ) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  RETURN QUERY
  WITH battle_stats AS (
    SELECT 
      b.id,
      COUNT(se.id) as total_votes
    FROM battles b
    LEFT JOIN signal_events se ON se.battle_id = b.id
    GROUP BY b.id
  ),
  battle_options_agg AS (
    SELECT 
      bo.battle_id,
      jsonb_agg(
        jsonb_build_object(
            'id', bo.id, 
            'label', bo.label, 
            'image_url', bo.image_url
        ) ORDER BY bo.sort_order ASC
      ) as options
    FROM battle_options bo
    GROUP BY bo.battle_id
  )
  SELECT 
    b.id,
    b.title,
    b.description,
    b.status,
    b.created_at,
    c.name as category_name,
    COALESCE(bs.total_votes, 0) as total_votes,
    COALESCE(boa.options, '[]'::jsonb) as options
  FROM battles b
  LEFT JOIN categories c ON b.category_id = c.id
  LEFT JOIN battle_stats bs ON b.id = bs.id
  LEFT JOIN battle_options_agg boa ON b.id = boa.battle_id
  WHERE 
    (search_term = '' OR b.title ILIKE '%' || search_term || '%' OR b.description ILIKE '%' || search_term || '%')
    AND (status_filter = 'all' OR b.status = status_filter)
  ORDER BY b.created_at DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$;
