BEGIN;

-- Requiere extensión para digest (si ya existe, ok)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- IMPORTANTE:
-- Cambia 'OP-ADMIN-0001' por el código real que tú vas a usar.
-- Ese valor NO quedará en claro: se guarda solo el hash sha256.
INSERT INTO public.access_gate_tokens (code_hash, label, is_active, expires_at)
VALUES (
  encode(digest('OP-ADMIN-0001', 'sha256'), 'hex'),
  'MASTER_ADMIN',
  true,
  null
)
ON CONFLICT (code_hash) DO NOTHING;

COMMIT;
