BEGIN;

ALTER TABLE public.invitation_codes
  DROP CONSTRAINT IF EXISTS invitation_codes_status_check;

ALTER TABLE public.invitation_codes
  ADD CONSTRAINT invitation_codes_status_check
  CHECK (status IN ('active', 'expired', 'disabled', 'consumed', 'revoked', 'used'));

COMMIT;
