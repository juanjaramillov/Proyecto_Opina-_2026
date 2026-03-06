DO $$
DECLARE
  t text;
  tables_to_clean text[] := ARRAY[
    'signal_events', 
    'user_daily_metrics', 
    'user_state_logs', 
    'module_interest_events', 
    'user_tracking_metrics', 
    'user_stats', 
    'anonymous_identities', 
    'invitation_codes',
    'user_level_history',
    'user_achievements'
  ];
BEGIN
  FOR t IN SELECT table_name FROM information_schema.tables 
           WHERE table_schema = 'public' 
           AND table_name = ANY(tables_to_clean)
  LOOP
    RAISE NOTICE 'Truncating table: %', t;
    EXECUTE 'TRUNCATE TABLE public.' || quote_ident(t) || ' CASCADE';
  END LOOP;
END $$;
