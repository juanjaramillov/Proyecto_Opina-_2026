-- Añadir columnas demográficas y de perfil faltantes en user_profiles

ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS birth_year int,
ADD COLUMN IF NOT EXISTS housing_type text,
ADD COLUMN IF NOT EXISTS education_level text,
ADD COLUMN IF NOT EXISTS employment_status text,
ADD COLUMN IF NOT EXISTS income_range text,
ADD COLUMN IF NOT EXISTS purchase_behavior text,
ADD COLUMN IF NOT EXISTS influence_level text,
ADD COLUMN IF NOT EXISTS profile_stage int DEFAULT 0,
ADD COLUMN IF NOT EXISTS signal_weight numeric DEFAULT 1.0,
ADD COLUMN IF NOT EXISTS household_size text,
ADD COLUMN IF NOT EXISTS children_count text,
ADD COLUMN IF NOT EXISTS car_count text;
