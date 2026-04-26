-- ============================================================
-- 20260426000100_admin_actualidad_rpcs
-- ============================================================
-- Cierre de F-08 (auditoría Drimo): elimina las 6 escrituras directas
-- desde adminActualidadCrudService.ts a las tablas current_topics /
-- topic_question_sets / topic_questions y las canaliza por 6 RPCs
-- SECURITY DEFINER con gate de admin + audit log.
-- Adicionalmente expone 1 RPC de lectura consolidada (topic + questions)
-- para reducir round-trips y centralizar el gate de admin.
--
-- Patrón de cada función (consistente con admin_audit_log + role_rpc):
--   * SECURITY DEFINER
--   * SET search_path TO 'public', 'pg_temp'
--   * Gate: IF public.is_admin_user() IS NOT TRUE THEN RAISE 'UNAUTHORIZED_ADMIN'
--   * Validación de inputs (whitelists / transiciones / longitudes)
--   * Operación de negocio
--   * PERFORM public.log_admin_action(...)
--   * REVOKE ALL FROM PUBLIC; GRANT a authenticated + service_role
--
-- RPCs creadas (7):
--   1) admin_actualidad_create_topic
--   2) admin_actualidad_update_editorial
--   3) admin_actualidad_upsert_questions
--   4) admin_actualidad_update_status
--   5) admin_actualidad_mark_edited
--   6) admin_actualidad_delete_topics
--   7) admin_actualidad_get_topic_full
-- ============================================================


-- ------------------------------------------------------------
-- 1) admin_actualidad_create_topic
--    Crea un tema editorial atómicamente: current_topics +
--    topic_question_sets + topic_questions[]. El slug se respeta
--    si viene en p_topic; si no, se genera desde el título.
--
--    p_topic JSONB esperado (todas las claves opcionales salvo title):
--      { title, slug?, summary?, category?, status?, impact_phrase?,
--        tags?, actors?, intensity?, relevance_chile?, confidence_score?,
--        event_stage?, topic_duration?, opinion_maturity?, source_domain?,
--        source_url? }
--
--    p_questions JSONB array (puede ser vacío):
--      [ { order, text, type, options? } ]
--
--    Retorna el uuid del nuevo tema.
-- ------------------------------------------------------------
DROP FUNCTION IF EXISTS public.admin_actualidad_create_topic(jsonb, jsonb);

CREATE OR REPLACE FUNCTION public.admin_actualidad_create_topic(
    p_topic     jsonb,
    p_questions jsonb DEFAULT '[]'::jsonb
) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'pg_temp'
    AS $$
DECLARE
    v_title    text;
    v_slug     text;
    v_topic_id uuid;
    v_set_id   uuid;
    v_q        jsonb;
    v_q_count  int := 0;
BEGIN
    IF public.is_admin_user() IS NOT TRUE THEN
        RAISE EXCEPTION 'UNAUTHORIZED_ADMIN';
    END IF;

    v_title := trim(coalesce(p_topic->>'title', ''));
    IF length(v_title) = 0 THEN
        RAISE EXCEPTION 'TITLE_REQUIRED';
    END IF;

    -- Slug: si viene en p_topic se respeta; si no, se genera del título
    -- y se sufija con un fragmento aleatorio para evitar colisiones.
    v_slug := nullif(trim(coalesce(p_topic->>'slug', '')), '');
    IF v_slug IS NULL THEN
        v_slug := regexp_replace(lower(v_title), '[^a-z0-9]+', '-', 'g');
        v_slug := trim(both '-' from v_slug);
        IF length(v_slug) = 0 THEN
            v_slug := 'tema';
        END IF;
        v_slug := v_slug || '-' || substr(encode(gen_random_bytes(4), 'hex'), 1, 6);
    END IF;

    -- Insert tema
    INSERT INTO public.current_topics (
        slug, title, short_summary, category, status,
        impact_quote, tags, actors,
        intensity, relevance_chile, confidence_score,
        event_stage, topic_duration, opinion_maturity,
        source_domain, metadata
    )
    VALUES (
        v_slug,
        v_title,
        coalesce(p_topic->>'summary', ''),
        coalesce(p_topic->>'category', 'País'),
        coalesce(p_topic->>'status', 'detected'),
        nullif(p_topic->>'impact_phrase', ''),
        CASE WHEN jsonb_typeof(p_topic->'tags') = 'array'
             THEN ARRAY(SELECT jsonb_array_elements_text(p_topic->'tags'))
             ELSE ARRAY[]::text[] END,
        CASE WHEN jsonb_typeof(p_topic->'actors') = 'array'
             THEN ARRAY(SELECT jsonb_array_elements_text(p_topic->'actors'))
             ELSE ARRAY[]::text[] END,
        nullif(p_topic->>'intensity', '')::int,
        nullif(p_topic->>'relevance_chile', '')::int,
        nullif(p_topic->>'confidence_score', '')::int,
        coalesce(p_topic->>'event_stage', 'discussion'),
        coalesce(p_topic->>'topic_duration', 'short'),
        coalesce(p_topic->>'opinion_maturity', 'low'),
        nullif(p_topic->>'source_domain', ''),
        jsonb_build_object('source_url', p_topic->>'source_url')
    )
    RETURNING id INTO v_topic_id;

    -- Crear question set vacío para este tema
    INSERT INTO public.topic_question_sets (topic_id)
    VALUES (v_topic_id)
    RETURNING id INTO v_set_id;

    -- Insertar preguntas (si vienen)
    IF jsonb_typeof(p_questions) = 'array' THEN
        FOR v_q IN SELECT * FROM jsonb_array_elements(p_questions) LOOP
            INSERT INTO public.topic_questions (
                set_id, question_order, question_text, answer_type, options_json
            )
            VALUES (
                v_set_id,
                coalesce((v_q->>'order')::int, 0),
                coalesce(v_q->>'text', ''),
                coalesce(v_q->>'type', 'text'),
                CASE WHEN jsonb_typeof(v_q->'options') = 'array'
                     THEN v_q->'options'
                     ELSE '[]'::jsonb END
            );
            v_q_count := v_q_count + 1;
        END LOOP;
    END IF;

    PERFORM public.log_admin_action(
        'actualidad_create_topic',
        'current_topics',
        v_topic_id::text,
        jsonb_build_object(
            'slug', v_slug,
            'title', v_title,
            'status', coalesce(p_topic->>'status', 'detected'),
            'questions_count', v_q_count
        )
    );

    RETURN v_topic_id;
END;
$$;

ALTER FUNCTION public.admin_actualidad_create_topic(jsonb, jsonb) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.admin_actualidad_create_topic(jsonb, jsonb) FROM PUBLIC;
GRANT  ALL ON FUNCTION public.admin_actualidad_create_topic(jsonb, jsonb) TO authenticated;
GRANT  ALL ON FUNCTION public.admin_actualidad_create_topic(jsonb, jsonb) TO service_role;


-- ------------------------------------------------------------
-- 2) admin_actualidad_update_editorial
--    Actualiza metadatos editoriales del tema. WHITELIST estricta:
--    solo se aceptan las 14 columnas editoriales. Cualquier otro
--    campo en p_updates se ignora silenciosamente, incluyendo:
--      status, created_by, reviewed_by, approved_by, published_at,
--      archived_at, admin_edited, id, slug, created_at, updated_at.
--
--    El frontend usa los nombres `summary` y `impact_phrase`; el
--    mapping a las columnas reales (`short_summary`, `impact_quote`)
--    se hace acá server-side para que el cliente nunca toque el
--    schema directo.
-- ------------------------------------------------------------
DROP FUNCTION IF EXISTS public.admin_actualidad_update_editorial(uuid, jsonb, boolean);

CREATE OR REPLACE FUNCTION public.admin_actualidad_update_editorial(
    p_id                  uuid,
    p_updates             jsonb,
    p_mark_admin_edited   boolean DEFAULT true
) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'pg_temp'
    AS $$
DECLARE
    v_count int;
BEGIN
    IF public.is_admin_user() IS NOT TRUE THEN
        RAISE EXCEPTION 'UNAUTHORIZED_ADMIN';
    END IF;

    IF p_id IS NULL THEN
        RAISE EXCEPTION 'TOPIC_ID_REQUIRED';
    END IF;

    -- COALESCE(EXCLUDED, current) sobre cada columna de la whitelist.
    -- Si la clave no viene en p_updates, p_updates->>'col' es NULL y el
    -- COALESCE conserva el valor existente.
    UPDATE public.current_topics t
       SET
        title             = COALESCE(p_updates->>'title',                     t.title),
        category          = COALESCE(p_updates->>'category',                  t.category),
        short_summary     = COALESCE(p_updates->>'summary',
                                     p_updates->>'short_summary',
                                     t.short_summary),
        impact_quote      = COALESCE(p_updates->>'impact_phrase',
                                     p_updates->>'impact_quote',
                                     t.impact_quote),
        tags              = CASE WHEN jsonb_typeof(p_updates->'tags') = 'array'
                                 THEN ARRAY(SELECT jsonb_array_elements_text(p_updates->'tags'))
                                 ELSE t.tags END,
        actors            = CASE WHEN jsonb_typeof(p_updates->'actors') = 'array'
                                 THEN ARRAY(SELECT jsonb_array_elements_text(p_updates->'actors'))
                                 ELSE t.actors END,
        intensity         = COALESCE(NULLIF(p_updates->>'intensity', '')::int,         t.intensity),
        relevance_chile   = COALESCE(NULLIF(p_updates->>'relevance_chile', '')::int,   t.relevance_chile),
        confidence_score  = COALESCE(NULLIF(p_updates->>'confidence_score', '')::int,  t.confidence_score),
        event_stage       = COALESCE(p_updates->>'event_stage',       t.event_stage),
        topic_duration    = COALESCE(p_updates->>'topic_duration',    t.topic_duration),
        opinion_maturity  = COALESCE(p_updates->>'opinion_maturity',  t.opinion_maturity),
        source_domain     = COALESCE(p_updates->>'source_domain',     t.source_domain),
        admin_edited      = CASE WHEN p_mark_admin_edited THEN true ELSE t.admin_edited END,
        updated_at        = now()
     WHERE t.id = p_id;

    GET DIAGNOSTICS v_count = ROW_COUNT;

    IF v_count = 0 THEN
        RAISE EXCEPTION 'TOPIC_NOT_FOUND';
    END IF;

    PERFORM public.log_admin_action(
        'actualidad_update_editorial',
        'current_topics',
        p_id::text,
        jsonb_build_object(
            'mark_admin_edited', p_mark_admin_edited,
            -- Solo loggeamos las claves que vinieron, no los valores (PII safe).
            'fields_in_payload',
            (SELECT to_jsonb(array_agg(key))
               FROM jsonb_object_keys(p_updates) AS key)
        )
    );

    RETURN true;
END;
$$;

ALTER FUNCTION public.admin_actualidad_update_editorial(uuid, jsonb, boolean) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.admin_actualidad_update_editorial(uuid, jsonb, boolean) FROM PUBLIC;
GRANT  ALL ON FUNCTION public.admin_actualidad_update_editorial(uuid, jsonb, boolean) TO authenticated;
GRANT  ALL ON FUNCTION public.admin_actualidad_update_editorial(uuid, jsonb, boolean) TO service_role;


-- ------------------------------------------------------------
-- 3) admin_actualidad_upsert_questions
--    Sincroniza el conjunto de preguntas de un tema:
--      * Si el tema no tiene topic_question_sets, lo crea.
--      * Borra las preguntas que están en DB pero no vienen en
--        p_questions (matching por id).
--      * Upsert (por id) de cada pregunta entrante.
--
--    p_questions JSONB array:
--      [ { id?, order, text, type, options? } ]
-- ------------------------------------------------------------
DROP FUNCTION IF EXISTS public.admin_actualidad_upsert_questions(uuid, jsonb);

CREATE OR REPLACE FUNCTION public.admin_actualidad_upsert_questions(
    p_topic_id  uuid,
    p_questions jsonb
) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'pg_temp'
    AS $$
DECLARE
    v_set_id        uuid;
    v_incoming_ids  uuid[] := ARRAY[]::uuid[];
    v_q             jsonb;
    v_q_id          uuid;
BEGIN
    IF public.is_admin_user() IS NOT TRUE THEN
        RAISE EXCEPTION 'UNAUTHORIZED_ADMIN';
    END IF;

    IF p_topic_id IS NULL THEN
        RAISE EXCEPTION 'TOPIC_ID_REQUIRED';
    END IF;

    IF jsonb_typeof(p_questions) IS DISTINCT FROM 'array' THEN
        RAISE EXCEPTION 'QUESTIONS_MUST_BE_ARRAY';
    END IF;

    -- 1. obtener / crear set
    SELECT id INTO v_set_id
      FROM public.topic_question_sets
     WHERE topic_id = p_topic_id
     LIMIT 1;

    IF v_set_id IS NULL THEN
        INSERT INTO public.topic_question_sets (topic_id)
        VALUES (p_topic_id)
        RETURNING id INTO v_set_id;
    END IF;

    -- 2. recolectar ids entrantes (los que vienen con id válido)
    FOR v_q IN SELECT * FROM jsonb_array_elements(p_questions) LOOP
        v_q_id := nullif(v_q->>'id', '')::uuid;
        IF v_q_id IS NOT NULL THEN
            v_incoming_ids := v_incoming_ids || v_q_id;
        END IF;
    END LOOP;

    -- 3. borrar las que ya no vienen
    IF array_length(v_incoming_ids, 1) IS NULL THEN
        DELETE FROM public.topic_questions WHERE set_id = v_set_id;
    ELSE
        DELETE FROM public.topic_questions
         WHERE set_id = v_set_id
           AND id <> ALL(v_incoming_ids);
    END IF;

    -- 4. upsert de cada pregunta entrante
    FOR v_q IN SELECT * FROM jsonb_array_elements(p_questions) LOOP
        v_q_id := nullif(v_q->>'id', '')::uuid;
        IF v_q_id IS NULL THEN
            -- nueva pregunta
            INSERT INTO public.topic_questions (
                set_id, question_order, question_text, answer_type, options_json
            )
            VALUES (
                v_set_id,
                coalesce((v_q->>'order')::int, 0),
                coalesce(v_q->>'text', ''),
                coalesce(v_q->>'type', 'text'),
                CASE WHEN jsonb_typeof(v_q->'options') = 'array'
                     THEN v_q->'options'
                     ELSE '[]'::jsonb END
            );
        ELSE
            -- update si existe
            UPDATE public.topic_questions
               SET question_order = coalesce((v_q->>'order')::int, question_order),
                   question_text  = coalesce(v_q->>'text', question_text),
                   answer_type    = coalesce(v_q->>'type', answer_type),
                   options_json   = CASE WHEN jsonb_typeof(v_q->'options') = 'array'
                                         THEN v_q->'options'
                                         ELSE options_json END,
                   updated_at     = now()
             WHERE id = v_q_id
               AND set_id = v_set_id;

            -- Si el id viene del cliente pero no existía (caso poco común,
            -- p.ej. paste de UUID inválido), insertamos respetando ese id.
            IF NOT FOUND THEN
                INSERT INTO public.topic_questions (
                    id, set_id, question_order, question_text, answer_type, options_json
                )
                VALUES (
                    v_q_id,
                    v_set_id,
                    coalesce((v_q->>'order')::int, 0),
                    coalesce(v_q->>'text', ''),
                    coalesce(v_q->>'type', 'text'),
                    CASE WHEN jsonb_typeof(v_q->'options') = 'array'
                         THEN v_q->'options'
                         ELSE '[]'::jsonb END
                );
            END IF;
        END IF;
    END LOOP;

    -- touch updated_at del set
    UPDATE public.topic_question_sets
       SET updated_at = now()
     WHERE id = v_set_id;

    PERFORM public.log_admin_action(
        'actualidad_upsert_questions',
        'current_topics',
        p_topic_id::text,
        jsonb_build_object(
            'set_id', v_set_id,
            'count_in_payload', jsonb_array_length(p_questions)
        )
    );

    RETURN true;
END;
$$;

ALTER FUNCTION public.admin_actualidad_upsert_questions(uuid, jsonb) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.admin_actualidad_upsert_questions(uuid, jsonb) FROM PUBLIC;
GRANT  ALL ON FUNCTION public.admin_actualidad_upsert_questions(uuid, jsonb) TO authenticated;
GRANT  ALL ON FUNCTION public.admin_actualidad_upsert_questions(uuid, jsonb) TO service_role;


-- ------------------------------------------------------------
-- 4) admin_actualidad_update_status
--    Cambia el estado editorial del tema. Reglas server-side:
--      * status válido: detected/draft/review/approved/published/archived
--      * Para approved|published exige que el tema tenga >=1 pregunta
--      * Setea timestamps y editor tracking automáticamente
-- ------------------------------------------------------------
DROP FUNCTION IF EXISTS public.admin_actualidad_update_status(uuid, text);

CREATE OR REPLACE FUNCTION public.admin_actualidad_update_status(
    p_id          uuid,
    p_next_status text
) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'pg_temp'
    AS $$
DECLARE
    v_status     text := lower(trim(coalesce(p_next_status, '')));
    v_uid        uuid := auth.uid();
    v_previous   text;
    v_q_count    int;
BEGIN
    IF public.is_admin_user() IS NOT TRUE THEN
        RAISE EXCEPTION 'UNAUTHORIZED_ADMIN';
    END IF;

    IF p_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'TOPIC_ID_REQUIRED');
    END IF;

    IF v_status NOT IN ('detected','draft','review','approved','published','archived') THEN
        RETURN jsonb_build_object('success', false, 'error', 'INVALID_STATUS');
    END IF;

    SELECT status INTO v_previous FROM public.current_topics WHERE id = p_id;
    IF v_previous IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'TOPIC_NOT_FOUND');
    END IF;

    -- Pre-condición de publicación: debe tener al menos 1 pregunta
    IF v_status IN ('approved', 'published') THEN
        SELECT count(*)::int INTO v_q_count
          FROM public.topic_questions q
          JOIN public.topic_question_sets s ON s.id = q.set_id
         WHERE s.topic_id = p_id;

        IF v_q_count = 0 THEN
            RETURN jsonb_build_object(
                'success', false,
                'error', 'TOPIC_NEEDS_QUESTIONS',
                'message', 'El tema no tiene preguntas asociadas'
            );
        END IF;
    END IF;

    -- Update con tracking editorial automático
    UPDATE public.current_topics
       SET status        = v_status,
           created_by    = CASE WHEN v_status = 'review'   THEN v_uid     ELSE created_by END,
           reviewed_by   = CASE WHEN v_status = 'approved' THEN v_uid     ELSE reviewed_by END,
           approved_by   = CASE WHEN v_status = 'approved' THEN v_uid     ELSE approved_by END,
           published_at  = CASE WHEN v_status = 'published' THEN now()    ELSE published_at END,
           archived_at   = CASE WHEN v_status = 'archived'  THEN now()    ELSE archived_at END,
           updated_at    = now()
     WHERE id = p_id;

    PERFORM public.log_admin_action(
        'actualidad_update_status',
        'current_topics',
        p_id::text,
        jsonb_build_object('previous', v_previous, 'next', v_status)
    );

    RETURN jsonb_build_object('success', true, 'previous', v_previous, 'next', v_status);
END;
$$;

ALTER FUNCTION public.admin_actualidad_update_status(uuid, text) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.admin_actualidad_update_status(uuid, text) FROM PUBLIC;
GRANT  ALL ON FUNCTION public.admin_actualidad_update_status(uuid, text) TO authenticated;
GRANT  ALL ON FUNCTION public.admin_actualidad_update_status(uuid, text) TO service_role;


-- ------------------------------------------------------------
-- 5) admin_actualidad_mark_edited
--    Marca admin_edited=true. Operación trivial pero queda en
--    el audit_log para tener trazabilidad de quién tocó qué tema.
-- ------------------------------------------------------------
DROP FUNCTION IF EXISTS public.admin_actualidad_mark_edited(uuid);

CREATE OR REPLACE FUNCTION public.admin_actualidad_mark_edited(
    p_id uuid
) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'pg_temp'
    AS $$
DECLARE
    v_count int;
BEGIN
    IF public.is_admin_user() IS NOT TRUE THEN
        RAISE EXCEPTION 'UNAUTHORIZED_ADMIN';
    END IF;

    UPDATE public.current_topics
       SET admin_edited = true,
           updated_at = now()
     WHERE id = p_id;

    GET DIAGNOSTICS v_count = ROW_COUNT;
    IF v_count = 0 THEN
        RAISE EXCEPTION 'TOPIC_NOT_FOUND';
    END IF;

    PERFORM public.log_admin_action(
        'actualidad_mark_edited',
        'current_topics',
        p_id::text,
        '{}'::jsonb
    );

    RETURN true;
END;
$$;

ALTER FUNCTION public.admin_actualidad_mark_edited(uuid) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.admin_actualidad_mark_edited(uuid) FROM PUBLIC;
GRANT  ALL ON FUNCTION public.admin_actualidad_mark_edited(uuid) TO authenticated;
GRANT  ALL ON FUNCTION public.admin_actualidad_mark_edited(uuid) TO service_role;


-- ------------------------------------------------------------
-- 6) admin_actualidad_delete_topics
--    Bulk hard delete. Devuelve el count de filas borradas para
--    detectar fallos silenciosos (RLS u ids inválidos).
-- ------------------------------------------------------------
DROP FUNCTION IF EXISTS public.admin_actualidad_delete_topics(uuid[]);

CREATE OR REPLACE FUNCTION public.admin_actualidad_delete_topics(
    p_ids uuid[]
) RETURNS int
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'pg_temp'
    AS $$
DECLARE
    v_count int;
BEGIN
    IF public.is_admin_user() IS NOT TRUE THEN
        RAISE EXCEPTION 'UNAUTHORIZED_ADMIN';
    END IF;

    IF p_ids IS NULL OR array_length(p_ids, 1) IS NULL THEN
        RETURN 0;
    END IF;

    DELETE FROM public.current_topics WHERE id = ANY(p_ids);
    GET DIAGNOSTICS v_count = ROW_COUNT;

    PERFORM public.log_admin_action(
        'actualidad_delete_topics',
        'current_topics',
        CASE WHEN array_length(p_ids, 1) = 1 THEN p_ids[1]::text ELSE NULL END,
        jsonb_build_object(
            'count_requested', array_length(p_ids, 1),
            'count_deleted', v_count,
            'ids', to_jsonb(p_ids)
        )
    );

    RETURN v_count;
END;
$$;

ALTER FUNCTION public.admin_actualidad_delete_topics(uuid[]) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.admin_actualidad_delete_topics(uuid[]) FROM PUBLIC;
GRANT  ALL ON FUNCTION public.admin_actualidad_delete_topics(uuid[]) TO authenticated;
GRANT  ALL ON FUNCTION public.admin_actualidad_delete_topics(uuid[]) TO service_role;


-- ------------------------------------------------------------
-- 7) admin_actualidad_get_topic_full
--    Lectura consolidada: tema + array de preguntas en un solo
--    round-trip. Replaces los 3 selects encadenados de getAdminTopicById.
--    Retorna NULL si el tema no existe (no error).
-- ------------------------------------------------------------
DROP FUNCTION IF EXISTS public.admin_actualidad_get_topic_full(uuid);

CREATE OR REPLACE FUNCTION public.admin_actualidad_get_topic_full(
    p_id uuid
) RETURNS jsonb
    LANGUAGE plpgsql STABLE SECURITY DEFINER
    SET search_path TO 'public', 'pg_temp'
    AS $$
DECLARE
    v_topic     jsonb;
    v_questions jsonb;
BEGIN
    IF public.is_admin_user() IS NOT TRUE THEN
        RAISE EXCEPTION 'UNAUTHORIZED_ADMIN';
    END IF;

    SELECT to_jsonb(t.*) INTO v_topic
      FROM public.current_topics t
     WHERE t.id = p_id;

    IF v_topic IS NULL THEN
        RETURN NULL;
    END IF;

    SELECT coalesce(jsonb_agg(
                jsonb_build_object(
                    'id',      q.id,
                    'order',   q.question_order,
                    'text',    q.question_text,
                    'type',    q.answer_type,
                    'options', q.options_json
                ) ORDER BY q.question_order
            ), '[]'::jsonb)
      INTO v_questions
      FROM public.topic_questions q
      JOIN public.topic_question_sets s ON s.id = q.set_id
     WHERE s.topic_id = p_id;

    RETURN jsonb_build_object(
        'topic',     v_topic,
        'questions', v_questions
    );
END;
$$;

ALTER FUNCTION public.admin_actualidad_get_topic_full(uuid) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.admin_actualidad_get_topic_full(uuid) FROM PUBLIC;
GRANT  ALL ON FUNCTION public.admin_actualidad_get_topic_full(uuid) TO authenticated;
GRANT  ALL ON FUNCTION public.admin_actualidad_get_topic_full(uuid) TO service_role;


-- ------------------------------------------------------------
-- PostgREST: refresh schema cache (sin esto, las RPCs nuevas
-- pueden devolver PGRST202 / 42883 hasta el próximo restart).
-- ------------------------------------------------------------
NOTIFY pgrst, 'reload schema';

-- ============================================================
-- Notas operativas
-- ------------------------------------------------------------
-- Smoke check post-deploy (como admin):
--   SELECT public.admin_actualidad_get_topic_full(
--     (SELECT id FROM public.current_topics LIMIT 1)
--   );
--
-- Verificar audit:
--   SELECT * FROM public.admin_list_audit_log(20, 'actualidad_update_editorial');
-- ============================================================
