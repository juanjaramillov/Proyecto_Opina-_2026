-- ==========================================
-- Ensure Segmentation Columns in profiles (Bloque 11)
-- ==========================================

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'age_bucket') THEN
        ALTER TABLE public.profiles ADD COLUMN age_bucket text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'region') THEN
        ALTER TABLE public.profiles ADD COLUMN region text;
    END IF;
END $$;

-- Comentario: Estos campos son esenciales para el filtrado en get_depth_analytics.
