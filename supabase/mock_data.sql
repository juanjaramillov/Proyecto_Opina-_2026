-- =========================================================
-- Opina+ V12: MOCK DATA GENERATION SCRIPT
-- =========================================================
-- IMPORTANTE: Este script genera datos aleatorios para la vista
-- de despliegue completo de la aplicación (Modo Real).
-- Úsalo solo en entornos de desarrollo o en tu entorno de pre-producción
-- tras respaldar tu información real si la tuvieras.

DO $$
DECLARE
  v_anon_id text;
  v_battle_inst_id uuid;
  v_option_id uuid;
  v_brand_id uuid;
  v_genders text[] := ARRAY['Masculino', 'Femenino', 'Femenino', 'Otro/Prefiero no decirlo']; -- Más peso a Femenino para simular sesgos reales
  v_ages text[] := ARRAY['18-24', '25-34', '25-34', '35-44', '45-54', '55+']; -- Más peso a millennials
  v_regions text[] := ARRAY['Metropolitana', 'Metropolitana', 'Valparaíso', 'Biobío', 'Antofagasta', 'Araucanía']; -- Énfasis en RM
  
  -- variables for loop
  i int;
  j int;
  selected_gender text;
  selected_age text;
  selected_region text;
  b_record record;
BEGIN
  RAISE NOTICE 'Iniciando generación de datos de prueba...';

  -- 1) Insertar 150 registros de estados de usuario aleatorios (user_state_logs)
  -- Esto alimentará el "Opina+ Intelligence" del Perfil del usuario
  -- A este set en particular, le inyectaremos "MOCK_USER" en anon_id para rastreo
  RAISE NOTICE 'Generando 150 logs de estado de usuario...';
  FOR i IN 1..150 LOOP
    v_anon_id := 'MOCK_USER_' || encode(gen_random_bytes(8), 'hex');
    selected_gender := v_genders[floor(random() * array_length(v_genders, 1) + 1)];
    selected_age := v_ages[floor(random() * array_length(v_ages, 1) + 1)];
    selected_region := v_regions[floor(random() * array_length(v_regions, 1) + 1)];
    
    INSERT INTO public.user_state_logs (
      anon_id, mood_score, economic_score, job_score, happiness_score, gender, age_bucket, region
    ) VALUES (
      v_anon_id,
      floor(random() * 5 + 1)::int,
      floor(random() * 5 + 1)::int,
      floor(random() * 5 + 1)::int,
      floor(random() * 5 + 1)::int,
      selected_gender,
      selected_age,
      selected_region
    );
  END LOOP;

  -- 2) Insertar ~100 votos por cada batalla activa existente
  -- Esto mostrará el "Share of Preference" realista tras votar en Versus
  RAISE NOTICE 'Generando señales de votos para las batallas (Versus)...';
  FOR b_record IN SELECT id FROM public.battles LOOP
    -- Obtener la última instancia activa de esta batalla
    SELECT id INTO v_battle_inst_id FROM public.battle_instances WHERE battle_id = b_record.id ORDER BY created_at DESC LIMIT 1;
    
    IF v_battle_inst_id IS NOT NULL THEN
      FOR j IN 1..100 LOOP
        -- Seleccionar una opción cualquiera de la batalla actual, y recuperar su brand_id (entity_id)
        SELECT id, brand_id INTO v_option_id, v_brand_id FROM public.battle_options WHERE battle_id = b_record.id ORDER BY random() LIMIT 1;
        
        -- Datos demográficos del votante ficticio
        v_anon_id := 'MOCK_USER_' || encode(gen_random_bytes(8), 'hex');
        selected_gender := v_genders[floor(random() * array_length(v_genders, 1) + 1)];
        selected_age := v_ages[floor(random() * array_length(v_ages, 1) + 1)];
        selected_region := v_regions[floor(random() * array_length(v_regions, 1) + 1)];
        
        INSERT INTO public.signal_events (
          signal_id, anon_id, battle_id, battle_instance_id, option_id, entity_id, entity_type, module_type,
          gender, age_bucket, region, country, signal_weight, computed_weight, created_at, meta
        ) VALUES (
          gen_random_uuid(), v_anon_id, b_record.id, v_battle_inst_id, v_brand_id, v_brand_id, 'brand', 'versus',
          selected_gender, selected_age, selected_region, 'CL', 1.0, 1.0, 
          now() - (random() * interval '30 days'),
          '{"is_mock": true}'::jsonb
        );
      END LOOP;
    END IF;
  END LOOP;

  RAISE NOTICE '¡Generación de Mock Data completada satisfactoriamente!';
END $$;
