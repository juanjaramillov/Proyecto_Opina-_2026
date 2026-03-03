BEGIN;

-- 1) Limpiamos todas las definiciones de profundidad actuales para empezar de cero
DELETE FROM public.depth_definitions;

-- 2) Insertamos las 10 preguntas genéricas para TODAS las entidades
DO $$
DECLARE
  v_ent RECORD;
BEGIN
  -- Iteramos sobre todas las entidades y hacemos un JOIN con la categoría para obtener el slug
  FOR v_ent IN
    SELECT e.id, e.name, c.slug AS cat_slug
    FROM public.entities e
    JOIN public.categories c ON c.name = e.category
  LOOP

    -- Q1: NPS 0-10 (Obligatorio, tipo 'scale', clave 'recomendacion')
    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, v_ent.cat_slug, 'recomendacion',
      'Del 0 al 10… ¿qué tan probable es que recomiendes ' || v_ent.name || ' a tu mejor amigo o peor enemigo?',
      'scale', 1, NULL);

    -- Q2: Personaje / Vibes (choice)
    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, v_ent.cat_slug, 'q_personaje',
      'Si ' || v_ent.name || ' fuera un personaje de tu serie favorita, ¿cuál sería?',
      'choice', 2, '["El protagonista que salva el día","El secundario buena onda","El villano sin corazón","El extra que desaparece rápido","Ese que nadie entiende qué hace ahí"]');

    -- Q3: Precio vs Valor (scale_1_5)
    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, v_ent.cat_slug, 'q_precio_1_5',
      'Precio vs Valor del 1 al 5. ¿Te cobran lo justo o te ven la cara en ' || v_ent.name || '?',
      'scale_1_5', 3, NULL);

    -- Q4: Innovación / Modernidad (scale_1_5)
    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, v_ent.cat_slug, 'q_innovacion_1_5',
      'Innovación del 1 al 5. ¿Qué tan al día está ' || v_ent.name || ' con el siglo XXI?',
      'scale_1_5', 4, NULL);

    -- Q5: Atención / Soporte (scale_1_5)
    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, v_ent.cat_slug, 'q_soporte_1_5',
      'Si tienes un problema urgente... del 1 al 5, ¿te ayudan rapidito o te mandan a un bot inútil?',
      'scale_1_5', 5, NULL);

    -- Q6: Dolor Principal / Pain point (choice)
    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, v_ent.cat_slug, 'q_dolor_principal',
      '¿Qué es lo que más te hace perder la santa paciencia con ' || v_ent.name || '?',
      'choice', 6, '["Sus precios de joyería","Atención estilo municipalidad","Se caen o fallan en el peor momento","La burocracia interminable","Me prometen maravillas y no cumplen","Sinceramente, los amo sin cuestionar"]');

    -- Q7: Atractivo Principal / Hook (choice)
    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, v_ent.cat_slug, 'q_atractivo_principal',
      'Y a pesar de todo, ¿por qué vuelves a caer con ' || v_ent.name || '?',
      'choice', 7, '["El precio me salva la vida","Dentro de todo, funciona","Me da flojera suprema cambiarme","Me atienden como rey/reina","Tienen el monopolio de mi vida","Porque soy fiel por naturaleza"]');

    -- Q8: Confianza / Fe (scale_1_5)
    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, v_ent.cat_slug, 'q_confianza_1_5',
      '¿Cuánta fe ciega le tienes a ' || v_ent.name || ' a largo plazo? (1 al 5)',
      'scale_1_5', 8, NULL);

    -- Q9: Fidelidad / Lealtad extrema (choice)
    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, v_ent.cat_slug, 'q_fidelidad',
      'Si mañana desaparece ' || v_ent.name || ' de la faz de la tierra... tu reacción sería:',
      'choice', 9, '["Lloro lágrimas de sangre","Me duele un rato, pero superable","Me da exactamente lo mismo","Descorcho y hago una fiesta","Ya no los usaba de todas formas"]');

    -- Q10: Frecuencia de uso (choice)
    INSERT INTO public.depth_definitions (entity_id, category_slug, question_key, question_text, question_type, position, options)
    VALUES (v_ent.id, v_ent.cat_slug, 'q_frecuencia_uso',
      'Seamos honestos... ¿cada cuánto le rezas o acudes a ' || v_ent.name || '?',
      'choice', 10, '["Prácticamente todos los días","Una que otra vez a la semana","Aparezco una vez al mes","Solo para los años bisiestos","Solo cuando no me queda de otra"]');

  END LOOP;
END $$;

COMMIT;
