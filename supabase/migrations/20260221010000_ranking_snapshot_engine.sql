-- ===============================================
-- FIX 06: SNAPSHOT ENGINE CADA 3 HORAS
-- ===============================================

-- 1. TABLA DE SNAPSHOTS
CREATE TABLE IF NOT EXISTS public.ranking_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_slug text NOT NULL,
  option_id uuid REFERENCES public.battle_options(id) ON DELETE CASCADE,
  total_weight numeric(15,2) NOT NULL,
  rank_position integer NOT NULL,
  snapshot_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_snapshot_battle
ON public.ranking_snapshots (battle_slug, snapshot_at DESC);

-- 2. FUNCIÓN GENERADORA
CREATE OR REPLACE FUNCTION public.generate_ranking_snapshot()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insertamos el snapshot calculado
  INSERT INTO public.ranking_snapshots (
    battle_slug,
    option_id,
    total_weight,
    rank_position,
    snapshot_at
  )
  SELECT 
    b.slug as battle_slug,
    se.option_id,
    SUM(se.signal_weight) as total_weight,
    RANK() OVER (PARTITION BY b.slug ORDER BY SUM(se.signal_weight) DESC) as rank_position,
    now()
  FROM public.signal_events se
  JOIN public.battles b ON b.id = se.battle_id
  WHERE se.battle_id IS NOT NULL 
    AND se.option_id IS NOT NULL
  GROUP BY b.slug, se.option_id;
  
  -- Opcional: Limpiar snapshots antiguos (más de 7 días) para no saturar la tabla
  DELETE FROM public.ranking_snapshots 
  WHERE snapshot_at < now() - interval '7 days';
END;
$$;

-- 3. PROGRAMAR CRON (cada 3 horas)
-- NOTA: Requiere pg_cron activado en Supabase
SELECT cron.schedule(
  'generate-ranking-snapshot',
  '0 */3 * * *',
  'SELECT public.generate_ranking_snapshot();'
);

-- 4. RPC PARA FRONTEND
CREATE OR REPLACE FUNCTION public.get_latest_ranking()
RETURNS TABLE (
  battle_slug text,
  option_id uuid,
  total_weight numeric,
  rank_position integer,
  snapshot_at timestamptz,
  battle_id uuid,
  battle_title text,
  option_label text,
  image_url text
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  WITH latest_ts AS (
    SELECT MAX(snapshot_at) as max_at FROM public.ranking_snapshots
  )
  SELECT 
    rs.battle_slug,
    rs.option_id,
    rs.total_weight,
    rs.rank_position,
    rs.snapshot_at,
    b.id as battle_id,
    b.title as battle_title,
    bo.label as option_label,
    bo.image_url
  FROM public.ranking_snapshots rs
  JOIN latest_ts l ON rs.snapshot_at = l.max_at
  JOIN public.battles b ON b.slug = rs.battle_slug
  JOIN public.battle_options bo ON bo.id = rs.option_id
  ORDER BY rs.battle_slug, rs.rank_position ASC;
$$;

-- 5. RPC CON VARIACIÓN (FIX 07)
CREATE OR REPLACE FUNCTION public.get_ranking_with_variation()
RETURNS TABLE (
  battle_slug text,
  option_id uuid,
  total_weight numeric,
  rank_position integer,
  variation numeric,
  variation_percent numeric,
  direction text,
  snapshot_at timestamptz,
  battle_id uuid,
  battle_title text,
  option_label text,
  image_url text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  latest_ts timestamptz;
  previous_ts timestamptz;
BEGIN
  -- Obtenemos el timestamp del snapshot más reciente
  SELECT MAX(rs.snapshot_at) INTO latest_ts FROM public.ranking_snapshots rs;

  -- Obtenemos el timestamp del snapshot anterior
  SELECT MAX(rs.snapshot_at) INTO previous_ts 
  FROM public.ranking_snapshots rs 
  WHERE rs.snapshot_at < latest_ts;

  RETURN QUERY
  WITH latest AS (
    SELECT *
    FROM public.ranking_snapshots
    WHERE snapshot_at = latest_ts
  ),
  previous AS (
    SELECT *
    FROM public.ranking_snapshots
    WHERE snapshot_at = previous_ts
  )
  SELECT
    l.battle_slug,
    l.option_id,
    l.total_weight,
    l.rank_position,
    (l.total_weight - COALESCE(p.total_weight, 0))::numeric AS variation,
    CASE
      WHEN COALESCE(p.total_weight, 0) <= 0 THEN 0
      ELSE ((l.total_weight - p.total_weight) / p.total_weight) * 100
    END::numeric AS variation_percent,
    CASE
      WHEN (l.total_weight - COALESCE(p.total_weight, 0)) > 0 THEN 'up'
      WHEN (l.total_weight - COALESCE(p.total_weight, 0)) < 0 THEN 'down'
      ELSE 'stable'
    END AS direction,
    l.snapshot_at,
    b.id as battle_id,
    b.title as battle_title,
    bo.label as option_label,
    bo.image_url
  FROM latest l
  LEFT JOIN previous p
    ON l.battle_slug = p.battle_slug
    AND l.option_id = p.option_id
  JOIN public.battles b ON b.slug = l.battle_slug
  JOIN public.battle_options bo ON bo.id = l.option_id
  ORDER BY l.battle_slug, l.rank_position ASC;
END;
$$;
