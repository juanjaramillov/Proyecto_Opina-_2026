BEGIN;

CREATE OR REPLACE FUNCTION public.get_hub_signal_timeseries_24h()
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
AS $$
  WITH hours AS (
    SELECT generate_series(
      date_trunc('hour', now()) - interval '23 hours',
      date_trunc('hour', now()),
      interval '1 hour'
    ) AS bucket_start
  ),
  agg AS (
    SELECT
      date_trunc('hour', se.created_at) AS bucket_start,
      count(*) FILTER (WHERE coalesce(se.module_type, '') <> 'depth') AS signals,
      count(*) FILTER (WHERE se.module_type = 'depth') AS depth
    FROM public.signal_events se
    WHERE se.created_at >= now() - interval '24 hours'
    GROUP BY 1
  )
  SELECT jsonb_agg(
    jsonb_build_object(
      'bucket_start', h.bucket_start,
      'label', to_char(h.bucket_start, 'HH24'),
      'signals', coalesce(a.signals, 0),
      'depth', coalesce(a.depth, 0)
    )
    ORDER BY h.bucket_start
  )
  FROM hours h
  LEFT JOIN agg a USING (bucket_start);
$$;

COMMIT;
