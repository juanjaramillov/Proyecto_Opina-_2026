-- Add Loyalty Program Schema

-- 1. Tablas Maestras/Diccionario

-- loyalty_levels
CREATE TABLE public.loyalty_levels (
    id SERIAL PRIMARY KEY,
    level_name VARCHAR(255) NOT NULL,
    min_signals INTEGER NOT NULL DEFAULT 0,
    icon_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.loyalty_levels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Loyalty levels are readable by everyone." ON public.loyalty_levels FOR SELECT USING (true);

-- Insertar niveles iniciales
INSERT INTO public.loyalty_levels (level_name, min_signals) VALUES
('Observador', 0),
('Participante', 100),
('Voz Activa', 500),
('Voz Nacional', 2000),
('Líder de Opinión', 5000),
('Ciudadano Ilustre', 10000);

-- loyalty_actions
CREATE TABLE public.loyalty_actions (
    id SERIAL PRIMARY KEY,
    action_type VARCHAR(255) NOT NULL UNIQUE,
    signal_reward INTEGER NOT NULL DEFAULT 1,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.loyalty_actions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Loyalty actions are readable by everyone." ON public.loyalty_actions FOR SELECT USING (true);

-- Insertar pesos de acciones
INSERT INTO public.loyalty_actions (action_type, signal_reward, description) VALUES
('vote_feed', 1, 'Votar en una pregunta normal del feed'),
('vote_versus', 2, 'Votar en un cruce versus'),
('vote_actualidad', 5, 'Votar en la Mesa Editorial'),
('vote_tournament', 2, 'Votar en un Torneo'),
('onboarding_completed', 50, 'Completar perfil al 100%');


-- 2. Tablas del Motor 1 (El Camino del Ciudadano - Niveles)

CREATE TABLE public.user_loyalty_stats (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    total_historical_signals INTEGER NOT NULL DEFAULT 0,
    current_level_id INTEGER REFERENCES public.loyalty_levels(id),
    penalty_months_remaining INTEGER NOT NULL DEFAULT 0,
    consecutive_months_completed INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.user_loyalty_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own loyalty stats." ON public.user_loyalty_stats FOR SELECT USING (auth.uid() = user_id);

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_user_loyalty_stats_modtime()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_loyalty_stats_modtime_trigger
BEFORE UPDATE ON public.user_loyalty_stats
FOR EACH ROW EXECUTE PROCEDURE update_user_loyalty_stats_modtime();


-- 3. Tablas del Motor 2 (Billetera)

CREATE TABLE public.user_wallets (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    balance NUMERIC NOT NULL DEFAULT 0 CHECK (balance >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.user_wallets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own wallets." ON public.user_wallets FOR SELECT USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION update_user_wallets_modtime()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_wallets_modtime_trigger
BEFORE UPDATE ON public.user_wallets
FOR EACH ROW EXECUTE PROCEDURE update_user_wallets_modtime();

-- wallet_transactions
CREATE TABLE public.wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL, -- Positivo = income, Negativo = gasto
    transaction_type VARCHAR(50) NOT NULL, -- e.g., 'reward', 'redeem'
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
-- Users can view their own transactions but not insert directly (only backend can via trigger/function)
CREATE POLICY "Users can view their own wallet transactions." ON public.wallet_transactions FOR SELECT USING (auth.uid() = user_id);


-- 4. Tablas del Motor 2 (Misiones Semanales)

CREATE TABLE public.weekly_missions (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    target_count INTEGER NOT NULL,
    mission_type VARCHAR(255) NOT NULL, -- 'versus', 'tournament', 'actualidad', 'active_days'
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.weekly_missions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Weekly missions are readable by everyone." ON public.weekly_missions FOR SELECT USING (true);

-- Insertar las 4 misiones acordadas
INSERT INTO public.weekly_missions (title, description, target_count, mission_type) VALUES
('Experto en Versus', 'Aporta señales en el algoritmo Versus', 50, 'versus'),
('Buscador de Consenso', 'Participa en batallas de Torneo', 15, 'tournament'),
('El Pulso del País', 'Vota en temas de la Mesa Editorial (Actualidad)', 3, 'actualidad'),
('Hábito Ciudadano', 'Ingresa y vota en días distintos', 4, 'active_days');


CREATE TABLE public.user_weekly_mission_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    mission_id INTEGER NOT NULL REFERENCES public.weekly_missions(id),
    week_start_date DATE NOT NULL,
    current_count INTEGER NOT NULL DEFAULT 0,
    is_completed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, mission_id, week_start_date)
);
ALTER TABLE public.user_weekly_mission_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own mission progress." ON public.user_weekly_mission_progress FOR SELECT USING (auth.uid() = user_id);
-- Permitimos UPDATE si el request usa service_role (o definimos una policy específica más restrictiva). Por ahora solo SELECT para UI.

CREATE OR REPLACE FUNCTION update_user_mission_progress_modtime()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_mission_progress_modtime_trigger
BEFORE UPDATE ON public.user_weekly_mission_progress
FOR EACH ROW EXECUTE PROCEDURE update_user_mission_progress_modtime();

-- Al crear un usuario, inicializamos sus contadores (Stats y Wallet)
-- Asumimos que hay un profile trigger, podemos agregar otra funcion o modificar la existente.
-- Lo mejor es tener una función separada que maneje el sign up e inserte en user_loyalty_stats y user_wallets.

CREATE OR REPLACE FUNCTION initialize_user_loyalty() 
RETURNS TRIGGER AS $$
BEGIN
  -- Intentamos obtener el ID del Nivel Inicial (Observador = 0 signals)
  DECLARE v_initial_level_id INTEGER;
  BEGIN
      SELECT id INTO v_initial_level_id FROM public.loyalty_levels ORDER BY min_signals ASC LIMIT 1;
      
      INSERT INTO public.user_loyalty_stats (user_id, total_historical_signals, current_level_id)
      VALUES (NEW.id, 0, v_initial_level_id);
      
      INSERT INTO public.user_wallets (user_id, balance)
      VALUES (NEW.id, 0);
  EXCEPTION WHEN OTHERS THEN
      -- Si falla algo por concurrencia, lo ignoramos, la app creará el profile lazily si es necesario.
      NULL;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Adjuntaremos esto al insert de auth.users si no existe
-- Como no podemos hacer DROP TRIGGER fácilmente sin re-crear, verificamos si existe o usamos OR REPLACE.
DROP TRIGGER IF EXISTS on_auth_user_created_loyalty ON auth.users;
CREATE TRIGGER on_auth_user_created_loyalty
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.initialize_user_loyalty();

