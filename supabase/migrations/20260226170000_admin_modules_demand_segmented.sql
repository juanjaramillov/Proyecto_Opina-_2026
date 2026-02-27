BEGIN;

/**
 * Agregación segmentada de demanda por módulo.
 * Permite filtrar por comuna, género o rango etario.
 * Solo accesible para administradores.
 */
CREATE OR REPLACE FUNCTION public.admin_modules_demand_segmented(
  p_range_days int,
  p_segment_dim text -- 'comuna', 'gender', 'age_range'
)
RETURNS TABLE (
  module_slug text,
  segment_value text,
  views bigint,
  clicks bigint,
  ctr numeric
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Seguridad: Solo administradores
  IF public.is_admin_user() IS NOT TRUE THEN
    RAISE EXCEPTION 'UNAUTHORIZED_ADMIN';
  END IF;

  RETURN QUERY
  WITH event_data AS (
    SELECT 
      (meta->>'module_slug')::text as m_slug,
      event_type,
      CASE 
        WHEN p_segment_dim = 'comuna' THEN up.comuna
        WHEN p_segment_dim = 'gender' THEN up.gender
        WHEN p_segment_dim = 'age_range' THEN up.age_range
        ELSE 'Desconocido'
      END as s_value
    FROM public.signal_events se
    INNER JOIN public.user_profiles up ON se.user_id = up.user_id
    WHERE se.created_at >= (now() - (p_range_days || ' days')::interval)
      AND se.event_type IN ('module_preview_viewed', 'module_interest_clicked')
      AND se.meta->>'source' = 'coming_soon'
  ),
  aggregated AS (
    SELECT 
      m_slug,
      s_value,
      count(*) FILTER (WHERE event_type = 'module_preview_viewed') as views_count,
      count(*) FILTER (WHERE event_type = 'module_interest_clicked') as clicks_count
    FROM event_data
    GROUP BY m_slug, s_value
  )
  SELECT 
    m_slug as module_slug,
    COALESCE(s_value, 'No especificado') as segment_value,
    views_count::bigint as views,
    clicks_count::bigint as clicks,
    ROUND(
      CASE 
        WHEN views_count > 0 THEN (clicks_count::numeric / views_count::numeric) * 100
        ELSE 0
      END, 
      2
    ) as ctr
  FROM aggregated
  WHERE m_slug IS NOT NULL
  ORDER BY m_slug ASC, clicks_count DESC;
END;
$$;

-- Permisos
REVOKE ALL ON FUNCTION public.admin_modules_demand_segmented(int, text) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_modules_demand_segmented(int, text) TO authenticated;

COMMIT;
