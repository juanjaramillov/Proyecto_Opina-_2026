BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

INSERT INTO public.access_gate_tokens (code_hash, label, is_active, expires_at)
VALUES (


encode(extensions.digest('ADMIN-OPINA-2026', 'sha256'), 'hex'),



  'MASTER_ADMIN',
  true,
  null
)
ON CONFLICT (code_hash) DO NOTHING;

COMMIT;
