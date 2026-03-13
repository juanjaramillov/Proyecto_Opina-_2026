-- Table to store raw incoming webhook payloads from Meta WhatsApp API
CREATE TABLE IF NOT EXISTS public.whatsapp_webhook_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    payload JSONB NOT NULL
);

-- Enable RLS (though it will be written to using Service Role)
ALTER TABLE public.whatsapp_webhook_logs ENABLE ROW LEVEL SECURITY;

-- Add a policy to allow Service Role full access
CREATE POLICY "Enable ALL for service-role on whatsapp_webhook_logs" 
ON public.whatsapp_webhook_logs 
AS PERMISSIVE FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);
