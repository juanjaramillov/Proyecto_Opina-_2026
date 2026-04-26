-- ============================================================
-- Bloque B — Fase B.1 + B.2
-- Time-travel: signal_key canónico + funciones as_of
-- ============================================================
-- Contexto: hoy `signal_events` es un event log donde cada voto
-- cuenta como evento independiente. Esto infla KPIs cuando un
-- usuario cambia de opinión (vota A, después B) — ambos cuentan.
--
-- Esta migración crea la infraestructura para:
--   1. Identificar canónicamente "qué votó cada usuario"
--      (misma battle/pregunta = misma signal_key, sin importar
--      qué opción eligió cada vez).
--   2. Consultar "cuál era el estado a la fecha X" (as_of).
--
-- NO modifica datos existentes ni vistas actuales. Es puramente
-- aditivo. Las fases B.3+ agregan agregadores dedupeados y UI.
--
-- Decisión producto (2026-04-24):
--   - Modelo 3: todos los votos se guardan, solo el último pesa.
--   - Time-travel habilitado para B2C (presets) y B2B (libre).
-- ============================================================

-- ====================================================
-- Fase B.1 — signal_key_for(signal_events)
-- ====================================================
-- Identifica canónicamente "qué cosa" votó un usuario, de modo
-- que dos votos del mismo usuario a la misma cosa (aunque elijan
-- opciones distintas) comparten signal_key y se pueden dedupear.
--
-- Formato: '<modulo>:<identificador estable>'
-- IMMUTABLE para permitir índices funcionales.

CREATE OR REPLACE FUNCTION public.signal_key_for(se public.signal_events)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE se.module_type
    -- Versus: un usuario en una battle tiene UNA preferencia (la más reciente).
    WHEN 'versus' THEN
      'versus:' || COALESCE(se.battle_id::text, 'null')

    -- Progressive/Torneo: cada ronda del torneo es una decisión independiente.
    -- sequence_id agrupa el torneo completo, battle_id la ronda.
    WHEN 'progressive' THEN
      'progressive:' ||
      COALESCE(se.value_json->>'sequence_id', se.sequence_id::text, 'null') || ':' ||
      COALESCE(se.battle_id::text, 'null')

    -- Depth (profundidad): atributo de una entidad. Un usuario tiene UNA opinión
    -- por (entidad, pregunta).
    WHEN 'depth' THEN
      'depth:' ||
      COALESCE(se.entity_id::text, 'null') || ':' ||
      COALESCE(se.context_id, 'null')

    -- News/Actualidad: un usuario tiene UNA respuesta por (topic, pregunta).
    WHEN 'news' THEN
      'news:' ||
      COALESCE(se.entity_id::text, 'null') || ':' ||
      COALESCE(se.context_id, 'null')

    -- Pulse: estado personal. Máximo uno por usuario por día.
    WHEN 'pulse' THEN
      'pulse:' ||
      COALESCE(se.user_id::text, se.anon_id, 'null') || ':' ||
      to_char(se.created_at, 'YYYY-MM-DD')

    -- Fallback: signal_key único por evento (no dedupea).
    -- Si aparece 'unknown:*' en agregados, significa que hay un nuevo
    -- module_type que debe agregarse a esta función.
    ELSE
      'unknown:' || COALESCE(se.module_type, 'null') || ':' || se.id::text
  END;
$$;

COMMENT ON FUNCTION public.signal_key_for(public.signal_events) IS
  'Identifica canónicamente qué cosa votó un usuario (battle, pregunta, topic...). Dos votos del mismo usuario a la misma signal_key son variantes del mismo voto; solo cuenta el más reciente al momento consultado.';

-- Grants: callable desde cualquier rol (es pura función sobre datos existentes,
-- no expone info que no estuviera ya accesible via RLS).
GRANT EXECUTE ON FUNCTION public.signal_key_for(public.signal_events) TO anon, authenticated, service_role;


-- ====================================================
-- Fase B.2 — Funciones as_of
-- ====================================================

-- -----------------------------------------------------------------
-- 1) user_vote_as_of — ¿Cuál era el voto vigente de un usuario
--    sobre una signal_key al momento X?
-- -----------------------------------------------------------------
-- Devuelve la FILA COMPLETA de signal_events que corresponde al
-- voto vigente. NULL si el usuario nunca votó esa signal_key antes
-- de la fecha consultada.

CREATE OR REPLACE FUNCTION public.user_vote_as_of(
  p_user_id uuid,
  p_signal_key text,
  p_as_of timestamptz DEFAULT now()
)
RETURNS SETOF public.signal_events
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT se.*
  FROM public.signal_events se
  WHERE se.user_id = p_user_id
    AND public.signal_key_for(se) = p_signal_key
    AND se.created_at <= p_as_of
  ORDER BY se.created_at DESC
  LIMIT 1;
$$;

COMMENT ON FUNCTION public.user_vote_as_of IS
  'Devuelve el voto vigente de un usuario para una signal_key dada al momento p_as_of.';

GRANT EXECUTE ON FUNCTION public.user_vote_as_of(uuid, text, timestamptz) TO authenticated, service_role;


-- -----------------------------------------------------------------
-- 2) battle_preference_as_of — Share por opción en una battle
--    al momento X, dedupeando al último voto de cada usuario.
-- -----------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.battle_preference_as_of(
  p_battle_id uuid,
  p_as_of timestamptz DEFAULT now()
)
RETURNS TABLE (
  option_id uuid,
  vote_count bigint,
  share_pct numeric
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  WITH latest_per_user AS (
    SELECT DISTINCT ON (COALESCE(se.user_id::text, se.anon_id))
      COALESCE(se.user_id::text, se.anon_id) AS voter_key,
      se.option_id,
      se.created_at
    FROM public.signal_events se
    WHERE se.battle_id = p_battle_id
      AND se.created_at <= p_as_of
      AND se.module_type IN ('versus', 'progressive')
      AND se.option_id IS NOT NULL
    ORDER BY
      COALESCE(se.user_id::text, se.anon_id),
      se.created_at DESC
  ),
  totals AS (
    SELECT option_id, count(*)::bigint AS c
    FROM latest_per_user
    GROUP BY option_id
  ),
  grand_total AS (
    SELECT sum(c)::numeric AS total FROM totals
  )
  SELECT
    t.option_id,
    t.c AS vote_count,
    CASE
      WHEN (SELECT total FROM grand_total) > 0
      THEN round(t.c::numeric * 100.0 / (SELECT total FROM grand_total), 2)
      ELSE 0
    END AS share_pct
  FROM totals t
  ORDER BY t.c DESC;
$$;

COMMENT ON FUNCTION public.battle_preference_as_of IS
  'Share de preferencia por option_id en una battle al momento p_as_of, dedupeando al último voto por usuario.';

GRANT EXECUTE ON FUNCTION public.battle_preference_as_of(uuid, timestamptz) TO authenticated, anon, service_role;


-- -----------------------------------------------------------------
-- 3) entity_ranking_as_of — Top N de entidades por wins/losses
--    en VERSUS al momento X, dedupeando por usuario.
-- -----------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.entity_ranking_as_of(
  p_as_of timestamptz DEFAULT now(),
  p_category_slug text DEFAULT NULL,
  p_limit int DEFAULT 20
)
RETURNS TABLE (
  entity_id uuid,
  entity_name text,
  wins_count bigint,
  losses_count bigint,
  total_comparisons bigint,
  preference_share numeric,
  win_rate numeric
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  WITH versus_votes AS (
    -- Último voto de cada usuario por cada battle
    SELECT DISTINCT ON (COALESCE(se.user_id::text, se.anon_id), se.battle_id)
      COALESCE(se.user_id::text, se.anon_id) AS voter_key,
      se.battle_id,
      se.entity_id AS winner_entity_id,
      (NULLIF(se.value_json->>'loser_entity_id', ''))::uuid AS loser_entity_id,
      se.effective_weight,
      se.created_at
    FROM public.signal_events se
    WHERE se.created_at <= p_as_of
      AND se.module_type IN ('versus', 'progressive')
      AND se.entity_id IS NOT NULL
    ORDER BY
      COALESCE(se.user_id::text, se.anon_id),
      se.battle_id,
      se.created_at DESC
  ),
  wins AS (
    SELECT
      winner_entity_id AS entity_id,
      count(*)::bigint AS wins_count,
      sum(effective_weight)::numeric AS weighted_wins
    FROM versus_votes
    GROUP BY winner_entity_id
  ),
  losses AS (
    SELECT
      loser_entity_id AS entity_id,
      count(*)::bigint AS losses_count,
      sum(effective_weight)::numeric AS weighted_losses
    FROM versus_votes
    WHERE loser_entity_id IS NOT NULL
    GROUP BY loser_entity_id
  ),
  combined AS (
    SELECT
      COALESCE(w.entity_id, l.entity_id) AS entity_id,
      COALESCE(w.wins_count, 0) AS wins_count,
      COALESCE(l.losses_count, 0) AS losses_count
    FROM wins w
    FULL OUTER JOIN losses l ON w.entity_id = l.entity_id
  )
  SELECT
    c.entity_id,
    e.name AS entity_name,
    c.wins_count,
    c.losses_count,
    (c.wins_count + c.losses_count) AS total_comparisons,
    CASE
      WHEN (c.wins_count + c.losses_count) > 0
      THEN round(c.wins_count::numeric * 100.0 / (c.wins_count + c.losses_count)::numeric, 2)
      ELSE 0
    END AS preference_share,
    CASE
      WHEN (c.wins_count + c.losses_count) > 0
      THEN round(c.wins_count::numeric / (c.wins_count + c.losses_count)::numeric, 4)
      ELSE 0
    END AS win_rate
  FROM combined c
  JOIN public.entities e ON e.id = c.entity_id
  WHERE e.is_active = true
    AND (p_category_slug IS NULL OR e.category = p_category_slug)
  ORDER BY preference_share DESC, total_comparisons DESC
  LIMIT p_limit;
$$;

COMMENT ON FUNCTION public.entity_ranking_as_of IS
  'Ranking dedupeado de entidades VERSUS al momento p_as_of. Solo cuenta el último voto de cada usuario por battle. Filtrable por categoría.';

GRANT EXECUTE ON FUNCTION public.entity_ranking_as_of(timestamptz, text, int) TO authenticated, anon, service_role;


-- -----------------------------------------------------------------
-- 4) user_vote_history_for — Historial completo de cambios de
--    opinión de un usuario sobre una signal_key.
--    (Para la UI "Ver historial de cambios" del perfil personal.)
-- -----------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.user_vote_history_for(
  p_user_id uuid,
  p_signal_key text
)
RETURNS TABLE (
  event_id uuid,
  option_id uuid,
  entity_id uuid,
  value_json jsonb,
  created_at timestamptz,
  is_current boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  WITH user_votes AS (
    SELECT
      se.id AS event_id,
      se.option_id,
      se.entity_id,
      se.value_json,
      se.created_at,
      row_number() OVER (ORDER BY se.created_at DESC) AS rn
    FROM public.signal_events se
    WHERE se.user_id = p_user_id
      AND public.signal_key_for(se) = p_signal_key
  )
  SELECT
    event_id,
    option_id,
    entity_id,
    value_json,
    created_at,
    (rn = 1) AS is_current
  FROM user_votes
  ORDER BY created_at ASC;
$$;

COMMENT ON FUNCTION public.user_vote_history_for IS
  'Historial completo de votos de un usuario para una signal_key. La flag is_current marca el voto actualmente vigente.';

GRANT EXECUTE ON FUNCTION public.user_vote_history_for(uuid, text) TO authenticated, service_role;


-- ============================================================
-- Verificación rápida
-- ============================================================
-- Estas queries están comentadas. Corrélas manualmente para validar
-- después de aplicar la migración (también ver archivo de smoke test).

-- -- Cuántos signal_events caen en 'unknown:*' (no deberían)
-- SELECT
--   module_type,
--   count(*) AS events
-- FROM public.signal_events
-- WHERE public.signal_key_for(signal_events.*) LIKE 'unknown:%'
-- GROUP BY module_type;

-- -- Distribución de signal_keys por módulo (top 10 de cada uno)
-- SELECT
--   module_type,
--   public.signal_key_for(signal_events.*) AS signal_key,
--   count(*) AS events
-- FROM public.signal_events
-- GROUP BY module_type, signal_key
-- ORDER BY events DESC
-- LIMIT 20;
