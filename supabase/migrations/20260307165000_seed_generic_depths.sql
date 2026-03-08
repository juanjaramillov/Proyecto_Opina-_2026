BEGIN;

DO $$
DECLARE
  v_ent RECORD;
BEGIN
  -- Iterar sobre todas las entidades que no tienen suficientes depth definitions
  FOR v_ent IN 
    SELECT e.id, e.name, e.category, e.slug 
    FROM public.entities e
    WHERE (SELECT count(*) FROM public.depth_definitions dd WHERE dd.entity_id = e.id) < 10
  LOOP
    
    -- Pregunta 1: Nota
    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position)
    VALUES (v_ent.id, v_ent.category, 'nota_general', '¿Qué nota general le das a ' || v_ent.name || ' del 1 al 10?', 'scale', 1)
    ON CONFLICT (entity_id, question_key) DO NOTHING;

    -- Pregunta 2: Calidad
    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, v_ent.category, 'calidad', '¿Cómo calificas la calidad general de ' || v_ent.name || '?', 'scale', 2, '[]')
    ON CONFLICT (entity_id, question_key) DO NOTHING;

    -- Pregunta 3: Recomendacion
    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, v_ent.category, 'recomendacion', '¿Recomendarías ' || v_ent.name || ' a un conocido?', 'scale', 3, '[]')
    ON CONFLICT (entity_id, question_key) DO NOTHING;

    -- Pregunta 4: Innovacion
    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, v_ent.category, 'innovacion', '¿Qué tan innovadora consideras que es la propuesta de ' || v_ent.name || '?', 'scale', 4, '[]')
    ON CONFLICT (entity_id, question_key) DO NOTHING;

    -- Pregunta 5: Confianza
    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, v_ent.category, 'confianza', '¿Qué nivel de confianza te inspira ' || v_ent.name || '?', 'scale', 5, '[]')
    ON CONFLICT (entity_id, question_key) DO NOTHING;

    -- Pregunta 6: Atencion
    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, v_ent.category, 'atencion', '¿Cómo evaluarías la atención/servicio de ' || v_ent.name || '?', 'scale', 6, '[]')
    ON CONFLICT (entity_id, question_key) DO NOTHING;

    -- Pregunta 7: Precios
    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, v_ent.category, 'precios', '¿Consideras que los precios de ' || v_ent.name || ' son acordes a su nivel?', 'scale', 7, '[]')
    ON CONFLICT (entity_id, question_key) DO NOTHING;

    -- Pregunta 8: Imagen
    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, v_ent.category, 'imagen', '¿Qué tan moderna o atractiva te parece la imagen de ' || v_ent.name || '?', 'scale', 8, '[]')
    ON CONFLICT (entity_id, question_key) DO NOTHING;

    -- Pregunta 9: Experiencia Digital
    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, v_ent.category, 'digital', '¿Cómo evaluarías la experiencia digital (app/web) de ' || v_ent.name || '?', 'scale', 9, '[]')
    ON CONFLICT (entity_id, question_key) DO NOTHING;

    -- Pregunta 10: Fidelidad
    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, v_ent.category, 'fidelidad', '¿Qué tan probable es que sigas eligiendo ' || v_ent.name || ' en el futuro?', 'scale', 10, '[]')
    ON CONFLICT (entity_id, question_key) DO NOTHING;

  END LOOP;
END $$;

COMMIT;
