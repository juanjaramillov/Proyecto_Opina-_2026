-- =========================================================
-- Opina+ Architecture Split V12.2
-- Fecha: 2026-02-23
-- Objetivo: Separar identidad de segmento (users vs user_profiles)
-- =========================================================

-- 1) TABLA PRIVADA EXTENDIDA: public.users
CREATE TABLE IF NOT EXISTS public.users (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  invitation_code_id uuid, -- Reference to invitation_codes.id if needed
  is_identity_verified boolean DEFAULT false,
  identity_verified_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- RLS: public.users es estrictamente privada
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only read own private data" ON public.users FOR SELECT USING (id = auth.uid());
CREATE POLICY "Users can only update own private data" ON public.users FOR UPDATE USING (id = auth.uid());
-- Solo el Backend (Service Role) o el Trigger interno debe insertar aquí.


-- 2) TABLA SEGMENTABLE (B2B): public.user_profiles
CREATE TABLE IF NOT EXISTS public.user_profiles (
  user_id uuid PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  nickname text UNIQUE,
  age_range text,
  gender text,
  comuna text,
  housing_status text,
  education_level text,
  employment_status text,
  interests text[],
  profile_completion_percentage int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS: Segmentación y Edición
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own segment profile" ON public.user_profiles FOR ALL USING (user_id = auth.uid());
-- RPCs and Backend (Service Role) can bypass to read aggregates. No public anonymous reads.


-- 3) FUNCIÓN: CALCULAR COMPLETITUD DE PERFIL
CREATE OR REPLACE FUNCTION public.calculate_profile_completeness()
RETURNS trigger AS $$
DECLARE
  v_score int := 0;
BEGIN
  -- Basic Demographics (40%)
  IF NEW.age_range IS NOT NULL THEN v_score := v_score + 15; END IF;
  IF NEW.gender IS NOT NULL THEN v_score := v_score + 10; END IF;
  IF NEW.comuna IS NOT NULL THEN v_score := v_score + 15; END IF;
  
  -- Socioeconomic (30%)
  IF NEW.housing_status IS NOT NULL THEN v_score := v_score + 10; END IF;
  IF NEW.education_level IS NOT NULL THEN v_score := v_score + 10; END IF;
  IF NEW.employment_status IS NOT NULL THEN v_score := v_score + 10; END IF;
  
  -- Interests (30%)
  IF NEW.interests IS NOT NULL AND array_length(NEW.interests, 1) >= 5 THEN
    v_score := v_score + 30;
  ELSIF NEW.interests IS NOT NULL AND array_length(NEW.interests, 1) > 0 THEN
    v_score := v_score + (array_length(NEW.interests, 1) * 6); -- partial score up to 5 interests
  END IF;

  -- Cap at 100
  IF v_score > 100 THEN v_score := 100; END IF;

  NEW.profile_completion_percentage := v_score;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_user_profile_updated
  BEFORE INSERT OR UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.calculate_profile_completeness();


-- 4) MIGRACIÓN DE DATOS (Legacy `profiles` -> New Schema)
-- Migramos a public.users
INSERT INTO public.users (id, email, is_identity_verified, created_at)
SELECT 
  au.id, 
  au.email, 
  COALESCE(p.has_ci, false), 
  p.updated_at 
FROM auth.users au
LEFT JOIN public.profiles p ON p.id = au.id
ON CONFLICT (id) DO NOTHING;

-- Migramos a public.user_profiles (Mapeando columnas legacy)
INSERT INTO public.user_profiles (
  user_id, nickname, age_range, gender, comuna, 
  housing_status, education_level, employment_status, 
  profile_completion_percentage, created_at, updated_at
)
SELECT 
  p.id, 
  p.username, 
  -- Mapear age int a age_range si es necesario o dejar NULL para que el usuario re-ingrese
  CASE 
    WHEN p.age < 18 THEN '-18'
    WHEN p.age BETWEEN 18 AND 24 THEN '18-24'
    WHEN p.age BETWEEN 25 AND 34 THEN '25-34'
    WHEN p.age BETWEEN 35 AND 44 THEN '35-44'
    WHEN p.age >= 45 THEN '45+'
    ELSE NULL
  END,
  p.gender, 
  p.commune, 
  NULL, -- housing_status no existía
  p.education, 
  p.occupation, 
  p.profile_completeness,
  p.updated_at,
  now()
FROM public.profiles p
INNER JOIN public.users u ON p.id = u.user_id -- Solo si la identidad base existe
ON CONFLICT (user_id) DO NOTHING;


-- 5) TRIGGER DE CREACIÓN DE USUARIO RE-ESCRITO
-- Ahora mapea directamente a las nuevas colecciones segmentadas al momento de Registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Insert Private Identity
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, coalesce(NEW.email, ''));
  
  -- Insert Empty Segmentable Profile
  INSERT INTO public.user_profiles (user_id, nickname)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'display_name');

  -- Also populate user_stats if needed for the engine
  INSERT INTO public.user_stats (user_id, total_signals, last_signal_at) 
  VALUES (NEW.id, 0, now()) ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Triggers still firing from `on_auth_user_created` onto auth.users so no need to DROP/CREATE the TRIGGER statement itself.
