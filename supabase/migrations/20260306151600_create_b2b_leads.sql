-- Migration: b2b_leads table
-- Description: Creates a table to store B2B lead capture form submissions from the /intelligence page.

CREATE TABLE IF NOT EXISTS public.b2b_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    name TEXT NOT NULL,
    company TEXT,
    role TEXT,
    email TEXT NOT NULL,
    interest TEXT,
    status TEXT DEFAULT 'new'
);

-- RLS Setup
ALTER TABLE public.b2b_leads ENABLE ROW LEVEL SECURITY;

-- Allow anonymous and authenticated insertions
CREATE POLICY "Allow anonymous inserts to b2b_leads" ON public.b2b_leads
    FOR INSERT 
    TO public
    WITH CHECK (true);

-- Only admins can view leads
CREATE POLICY "Allow admins to select b2b_leads" ON public.b2b_leads
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_roles.user_id = auth.uid()
            AND user_roles.role = 'admin'
        )
    );
