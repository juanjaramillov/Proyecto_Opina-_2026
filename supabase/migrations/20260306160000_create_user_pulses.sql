-- Create user_pulses table
CREATE TABLE IF NOT EXISTS user_pulses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    signal_type TEXT DEFAULT 'tu_pulso',
    sub_category TEXT NOT NULL CHECK (sub_category IN ('sobre_mi', 'mi_semana', 'mi_entorno')),
    question_identifier TEXT NOT NULL,
    response_value TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_pulses_user_id ON user_pulses(user_id);
CREATE INDEX IF NOT EXISTS idx_user_pulses_sub_category ON user_pulses(sub_category);
CREATE INDEX IF NOT EXISTS idx_user_pulses_created_at ON user_pulses(created_at);

-- RLS Policies
ALTER TABLE user_pulses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own pulses"
ON user_pulses FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own pulses"
ON user_pulses FOR SELECT
USING (auth.uid() = user_id);

-- Optional: Admin could view all pulses for agg/stats if needed
CREATE POLICY "Admins can view all pulses"
ON user_pulses FOR SELECT
USING (auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
));
