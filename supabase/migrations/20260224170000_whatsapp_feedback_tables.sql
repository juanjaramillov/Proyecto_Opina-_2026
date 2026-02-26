BEGIN;

-- Tabla de mensajes entrantes
CREATE TABLE IF NOT EXISTS public.whatsapp_inbound_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),

  wa_message_id text NULL,
  wa_from text NULL,
  wa_from_hash text NULL,

  message_type text NULL,
  body text NULL,

  token_text text NULL,     -- ej: invite_id o CODE:XXXX (lo que venga en el mensaje)
  invite_id uuid NULL,      -- si token_text era UUID válido

  raw jsonb NULL
);

CREATE INDEX IF NOT EXISTS whatsapp_inbound_created_at_idx
  ON public.whatsapp_inbound_messages (created_at DESC);

CREATE INDEX IF NOT EXISTS whatsapp_inbound_from_hash_idx
  ON public.whatsapp_inbound_messages (wa_from_hash);

CREATE INDEX IF NOT EXISTS whatsapp_inbound_invite_id_idx
  ON public.whatsapp_inbound_messages (invite_id);

ALTER TABLE public.whatsapp_inbound_messages ENABLE ROW LEVEL SECURITY;

-- Solo admins pueden leer (para tu panel)
DROP POLICY IF EXISTS "admin_read_whatsapp_inbound" ON public.whatsapp_inbound_messages;
CREATE POLICY "admin_read_whatsapp_inbound"
ON public.whatsapp_inbound_messages
FOR SELECT
TO authenticated
USING (public.is_admin_user() IS TRUE);

-- Nadie inserta directo desde el cliente (solo Edge Function con service role)
DROP POLICY IF EXISTS "no_client_write_whatsapp_inbound" ON public.whatsapp_inbound_messages;
CREATE POLICY "no_client_write_whatsapp_inbound"
ON public.whatsapp_inbound_messages
FOR ALL
TO anon, authenticated
USING (false)
WITH CHECK (false);

COMMIT;
