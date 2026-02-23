BEGIN;

-- Drop anterior función porque cambiaremos el tipo de retorno (añadiendo battle_title y option_label)
DROP FUNCTION IF EXISTS public.b2b_list_rankings(text, text, int, timestamptz);

-- RPC: devuelve rankings desde snapshots pero ahora con títulos legibles
CREATE OR REPLACE FUNCTION public.b2b_list_rankings(
  p_module_type text,
  p_segment_hash text DEFAULT 'global',
  p_limit int DEFAULT 100,
  p_snapshot_bucket timestamptz DEFAULT NULL
)
RETURNS TABLE (
  snapshot_bucket timestamptz,
  module_type text,
  battle_id uuid,
  battle_title text,
  option_id uuid,
  option_label text,
  score numeric,
  signals_count int,
  segment jsonb,
  segment_hash text
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_bucket timestamptz;
  v_limit int;
  v_mod text := lower(trim(p_module_type));
  v_seg text := COALESCE(trim(p_segment_hash), 'global');
BEGIN
  IF public.is_b2b_user() IS NOT TRUE THEN
    RAISE EXCEPTION 'UNAUTHORIZED_B2B' USING ERRCODE = 'P0001';
  END IF;

  IF v_mod NOT IN ('versus','progressive') THEN
    RAISE EXCEPTION 'INVALID_MODULE' USING ERRCODE = 'P0001';
  END IF;

  v_limit := GREATEST(1, LEAST(COALESCE(p_limit,100), 500));

  IF p_snapshot_bucket IS NULL THEN
    SELECT MAX(s.snapshot_bucket) INTO v_bucket
    FROM public.public_rank_snapshots s;
  ELSE
    v_bucket := p_snapshot_bucket;
  END IF;

  IF v_bucket IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    s.snapshot_bucket,
    s.module_type,
    s.battle_id,
    b.title AS battle_title,
    s.option_id,
    o.label AS option_label,
    s.score,
    s.signals_count,
    s.segment,
    s.segment_hash
  FROM public.public_rank_snapshots s
  LEFT JOIN public.battles b ON b.id = s.battle_id
  LEFT JOIN public.battle_options o ON o.id = s.option_id
  WHERE s.snapshot_bucket = v_bucket
    AND s.module_type = v_mod
    AND COALESCE(s.segment_hash,'global') = v_seg
  ORDER BY s.score DESC
  LIMIT v_limit;
END;
$$;

REVOKE ALL ON FUNCTION public.b2b_list_rankings(text, text, int, timestamptz) FROM anon;
GRANT EXECUTE ON FUNCTION public.b2b_list_rankings(text, text, int, timestamptz) TO authenticated;

COMMIT;
