-- Migración: Sistema de Sesiones y Multiatributo
-- 20260219080000_multiatribute_sessions.sql

-- 1. Tabla de Atributos (Definiciones maestras)
CREATE TABLE IF NOT EXISTS public.attributes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Insertar los 5 atributos críticos de Clínicas
INSERT INTO public.attributes (slug, name, description) VALUES
('confianza', 'Confianza', 'Percepción de seguridad y fiabilidad en la institución.'),
('experiencia_general', 'Experiencia General', 'Evaluación holística de la visita o interacción.'),
('trato_personal', 'Trato Personal', 'Calidad de la atención por parte del personal médico y administrativo.'),
('claridad_diagnostica', 'Claridad Diagnóstica', 'Nivel de entendimiento de los diagnósticos y pasos a seguir.'),
('precio_calidad', 'Precio/Calidad', 'Relación entre el costo del servicio y la calidad recibida.');

-- 3. Tabla de Sesiones de Usuario
CREATE TABLE IF NOT EXISTS public.user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    attributes_shown UUID[] DEFAULT '{}', -- Atributos seleccionados para esta sesión
    attributes_completed UUID[] DEFAULT '{}', -- Atributos ya comparados
    dominant_clinic_id UUID, -- Clínica ganadora detectada post-versus
    depth_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    finished_at TIMESTAMPTZ,
    meta JSONB DEFAULT '{}' -- Para capturar tiempo por atributo, etc.
);

-- 4. Actualizar signal_events para vincular a sesión y atributo
ALTER TABLE public.signal_events 
ADD COLUMN IF NOT EXISTS session_id UUID REFERENCES public.user_sessions(id),
ADD COLUMN IF NOT EXISTS attribute_id UUID REFERENCES public.attributes(id);

-- 5. RLS para user_sessions
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see their own sessions"
    ON public.user_sessions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sessions"
    ON public.user_sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions"
    ON public.user_sessions FOR UPDATE
    USING (auth.uid() = user_id);

-- 6. Indices para performance
CREATE INDEX IF NOT EXISTS idx_signal_events_session ON public.signal_events(session_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user ON public.user_sessions(user_id);
