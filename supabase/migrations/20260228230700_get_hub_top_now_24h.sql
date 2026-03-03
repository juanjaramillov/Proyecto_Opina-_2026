BEGIN;

CREATE OR REPLACE FUNCTION public.get_hub_top_now_24h()
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
AS $$
  WITH windowed AS (
    SELECT
      se.battle_id,
      count(*) AS signals_24h
    FROM public.signal_events se
    WHERE se.created_at >= now() - interval '24 hours'
      AND se.battle_id IS NOT NULL
      AND coalesce(se.module_type, '') <> 'depth'
    GROUP BY se.battle_id
  ),
  ranked AS (
    SELECT
      b.id,
      b.slug,
      b.title,
      b.status,
      w.signals_24h,
      CASE
        WHEN b.slug LIKE 'versus-%' THEN 'versus'
        WHEN b.slug LIKE 'tournament-%' THEN 'tournament'
        ELSE 'other'
      END AS kind
    FROM windowed w
    JOIN public.battles b ON b.id::text = w.battle_id::text
    WHERE b.status = 'active'
  ),
  top_versus AS (
    SELECT slug, title, signals_24h
    FROM ranked
    WHERE kind = 'versus'
    ORDER BY signals_24h DESC
    LIMIT 1
  ),
  top_tournament AS (
    SELECT slug, title, signals_24h
    FROM ranked
    WHERE kind = 'tournament'
    ORDER BY signals_24h DESC
    LIMIT 1
  )
  SELECT jsonb_build_object(
    'top_versus', COALESCE((SELECT to_jsonb(top_versus) FROM top_versus), NULL),
    'top_tournament', COALESCE((SELECT to_jsonb(top_tournament) FROM top_tournament), NULL)
  );
$$;

COMMIT;
