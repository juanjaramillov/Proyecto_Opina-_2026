-- Migration: Create Actualidad tables
-- Description: Creates the `actualidad_topics` and `user_actualidad_responses` tables.

-- 1. Create actualidad_topics table (Manageable topics)
CREATE TABLE IF NOT EXISTS actualidad_topics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    titulo TEXT NOT NULL,
    contexto_corto TEXT NOT NULL,
    categoria TEXT NOT NULL,
    pregunta_postura JSONB NOT NULL,
    pregunta_impacto JSONB NOT NULL,
    fecha_inicio TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_fin TIMESTAMP WITH TIME ZONE,
    estado TEXT DEFAULT 'activo' CHECK (estado IN ('activo', 'cerrado', 'archivado')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS logic for topics
ALTER TABLE actualidad_topics ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read active topics
CREATE POLICY "Anyone can read active actualidad topics"
    ON actualidad_topics
    FOR SELECT
    USING (estado = 'activo');

-- Policy: Authenticated users can read any topic (optional, depending on if you want users to see past results)
CREATE POLICY "Authenticated users can read all topics"
    ON actualidad_topics
    FOR SELECT
    TO authenticated
    USING (true);


-- 2. Create user_actualidad_responses table
CREATE TABLE IF NOT EXISTS user_actualidad_responses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    signal_type TEXT DEFAULT 'actualidad',
    tema_id UUID REFERENCES actualidad_topics(id) NOT NULL,
    categoria_tema TEXT NOT NULL,
    respuesta_postura TEXT NOT NULL,
    respuesta_impacto TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS logic for responses
ALTER TABLE user_actualidad_responses ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own responses
CREATE POLICY "Users can view their own actualidad responses"
    ON user_actualidad_responses
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can insert their own responses
CREATE POLICY "Users can insert their own actualidad responses"
    ON user_actualidad_responses
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_actualidad_topics_estado ON actualidad_topics(estado);
CREATE INDEX IF NOT EXISTS idx_user_actualidad_responses_tema_id ON user_actualidad_responses(tema_id);
CREATE INDEX IF NOT EXISTS idx_user_actualidad_responses_user_id ON user_actualidad_responses(user_id);
