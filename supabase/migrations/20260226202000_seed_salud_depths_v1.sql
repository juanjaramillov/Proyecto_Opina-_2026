begin;

-- =========================================================
-- E) DEPTH DEFINITIONS: Asociar atributos a cada entidad de Salud
-- Esto es necesario para que get_active_battles() las muestre (requiere >= 6 preguntas)
-- =========================================================

DO $$
DECLARE
  v_ent RECORD;
BEGIN
  -- Iterar sobre todas las Clínicas y Farmacias
  FOR v_ent IN SELECT id, name, category, slug FROM public.entities WHERE category IN ('salud-clinicas-privadas-scl', 'salud-farmacias-scl') LOOP
    
    -- Pregunta 1: Nota (Obligatoria)
    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position)
    VALUES (v_ent.id, v_ent.category, 'nota_general', '¿Qué nota general le das a ' || v_ent.name || ' del 1 al 10?', 'scale', 1)
    ON CONFLICT (entity_id, question_key) DO NOTHING;

    -- Pregunta 2: Calidad de Atención
    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, v_ent.category, 'calidad', '¿Cómo calificas la calidad de atención de los profesionales en ' || v_ent.name || '?', 'scale', 2, '[]')
    ON CONFLICT (entity_id, question_key) DO NOTHING;

    -- Pregunta 3: Tiempos de Espera
    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, v_ent.category, 'wait_time', '¿Cómo evaluarías el tiempo de espera en ' || v_ent.name || '?', 'choice', 3, '["Muy rápido", "Aceptable", "Lento", "Demasiado lento"]')
    ON CONFLICT (entity_id, question_key) DO NOTHING;

    -- Pregunta 4: Precios y Valor
    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, v_ent.category, 'prices', '¿Consideras que los precios de ' || v_ent.name || ' son justos para lo que ofrecen?', 'choice', 4, '["Excelentes precios", "Justos", "Caros", "Excesivamente caros"]')
    ON CONFLICT (entity_id, question_key) DO NOTHING;

    -- Pregunta 5: Instalaciones / Variedad
    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (
      v_ent.id, v_ent.category, 'facilities', 
      CASE WHEN v_ent.category = 'salud-clinicas-privadas-scl' THEN '¿Qué te parecen las instalaciones y equipos médicos de ' || v_ent.name || '?'
      ELSE '¿Qué te parece la variedad de productos/stock en ' || v_ent.name || '?' END,
      'scale', 5, '[]'
    )
    ON CONFLICT (entity_id, question_key) DO NOTHING;

    -- Pregunta 6: Recomendación (Requerido para pasar el filtro de >= 6 preguntas)
    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, v_ent.category, 'recomendacion', '¿Recomendarías ' || v_ent.name || ' a un familiar o amigo?', 'scale', 6, '[]')
    ON CONFLICT (entity_id, question_key) DO NOTHING;

  END LOOP;
END $$;

commit;
