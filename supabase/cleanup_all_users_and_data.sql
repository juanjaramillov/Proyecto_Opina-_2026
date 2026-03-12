-- ADVERTENCIA: Este script borra todos los usuarios registrados (excepto el administrador)
-- y reinicia todos los contadores, KPIs y analíticas a 0.

DO $$
DECLARE
  v_admin_id uuid;
  t text;
  tables_to_clean text[] := ARRAY[
    'signal_events',
    'entity_daily_aggregates',
    'category_daily_aggregates',
    'depth_aggregates',
    'battles',
    'battle_instances',
    'anonymous_identities',
    'user_daily_metrics',
    'user_state_logs',
    'module_interest_events',
    'user_tracking_metrics',
    'user_stats',
    'invitation_codes',
    'user_level_history',
    'user_achievements',
    'user_pulses',
    'user_actualidad_responses',
    'app_events',
    'whatsapp_inbound_messages',
    'b2b_leads',
    'invite_redemptions',
    'user_profiles',
    'users' 
  ];
BEGIN
  -- 1. Obtener y asegurar el ID del admin
  SELECT user_id INTO v_admin_id FROM public.users WHERE role = 'admin' LIMIT 1;
  
  IF v_admin_id IS NULL THEN
     RAISE EXCEPTION 'No se encontró un usuario administrador en public.users. Abortando limpieza para proteger datos.';
  END IF;

  RAISE NOTICE 'Admin encontrado con ID: %', v_admin_id;

  -- 2. Borrar todos los usuarios de auth.users que no sean el admin
  -- Esto en cascada debería borrar filas en public.users y public.user_profiles
  -- Si el borrado en cascada no está configurado, la sección #3 lo forzará.
  DELETE FROM auth.users WHERE id != v_admin_id;
  RAISE NOTICE 'Usuarios de auth.users borrados exitosamente.';

  -- 3. Limpiar tablas transaccionales de datos y KPIs
  -- Usamos CASCADE para asegurar que cualquier tabla dependiente también se limpie.
  FOR t IN SELECT table_name FROM information_schema.tables 
           WHERE table_schema = 'public' 
           AND table_name = ANY(tables_to_clean)
  LOOP
    RAISE NOTICE 'Vaciando tabla de datos y KPIs: %', t;
    
    -- Excepción para mantener al administrador en public.users y user_profiles si CASCADE las vacía,
    -- pero para mayor seguridad, vamos a usar un approach más suave en las que involucran al admin:
    IF t = 'users' OR t = 'user_profiles' THEN
       EXECUTE 'DELETE FROM public.' || quote_ident(t) || ' WHERE user_id != $1' USING v_admin_id;
    ELSE
       EXECUTE 'TRUNCATE TABLE public.' || quote_ident(t) || ' CASCADE';
    END IF;
  END LOOP;
  
  -- 4. Resetear contadores en rankings ya precalculados evaluando si existen
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'ranking_snapshots') THEN
    EXECUTE 'TRUNCATE TABLE public.ranking_snapshots CASCADE';
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'public_rank_snapshots') THEN
    EXECUTE 'TRUNCATE TABLE public.public_rank_snapshots CASCADE';
  END IF;

  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'entity_rank_snapshots') THEN
    EXECUTE 'TRUNCATE TABLE public.entity_rank_snapshots CASCADE';
  END IF;

  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'actualidad_topics') THEN
    EXECUTE 'TRUNCATE TABLE public.actualidad_topics CASCADE';
  END IF;

  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'volatility_snapshots') THEN
     EXECUTE 'TRUNCATE TABLE public.volatility_snapshots CASCADE';
  END IF;

  RAISE NOTICE 'Limpieza de base de datos exitosa. Todos los KPIs han vuelto a 0.';
END $$;
