BEGIN;

-- Redefinir consume_invitation para permitir que auth.uid() sea NULL (modo anon)
CREATE OR REPLACE FUNCTION public.consume_invitation(p_code text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_code text := upper(trim(p_code));
  invite record;
  v_email text;
BEGIN
  -- Se elimina el bloqueo inicial de v_uid IS NULL para permitir a usuarios anon 
  -- usar el Access Gate y consumir un código de invitación.

  -- Lock del código
  SELECT * INTO invite
  FROM public.invitation_codes
  WHERE code = v_code
  FOR UPDATE;

  IF invite IS NULL THEN
    RAISE EXCEPTION 'INVITE_INVALID';
  END IF;

  IF invite.status IS NOT NULL AND invite.status <> 'active' THEN
    RAISE EXCEPTION 'INVITE_INACTIVE';
  END IF;

  IF invite.expires_at IS NOT NULL AND invite.expires_at < now() THEN
    UPDATE public.invitation_codes SET status = 'expired' WHERE id = invite.id;
    RAISE EXCEPTION 'INVITE_EXPIRED';
  END IF;

  IF invite.current_uses >= invite.max_uses THEN
    UPDATE public.invitation_codes SET status = 'consumed' WHERE id = invite.id;
    RAISE EXCEPTION 'INVITE_CONSUMED';
  END IF;

  IF invite.max_uses = 1 AND invite.claimed_by IS NOT NULL THEN
    RAISE EXCEPTION 'INVITE_ALREADY_CLAIMED';
  END IF;

  -- Consumir + marcar claim (solo marca claim 1:1 si v_uid está presente)
  UPDATE public.invitation_codes
  SET
    current_uses = current_uses + 1,
    claimed_by   = CASE 
                     WHEN invite.max_uses = 1 AND v_uid IS NOT NULL THEN v_uid 
                     ELSE COALESCE(claimed_by, v_uid) 
                   END,
    claimed_at   = CASE 
                     WHEN invite.max_uses = 1 AND v_uid IS NOT NULL THEN now() 
                     ELSE COALESCE(claimed_at, CASE WHEN v_uid IS NOT NULL THEN now() ELSE NULL END) 
                   END,
    status       = CASE WHEN current_uses + 1 >= max_uses THEN 'consumed' ELSE status END
  WHERE id = invite.id;

  -- Si hay sesión autenticada, amarramos el código a public.users
  IF v_uid IS NOT NULL THEN
    SELECT au.email INTO v_email FROM auth.users au WHERE au.id = v_uid;
    INSERT INTO public.users (id, email)
    VALUES (v_uid, coalesce(v_email, ''))
    ON CONFLICT (id) DO NOTHING;

    -- Bind del código al usuario (monitoreo)
    UPDATE public.users
    SET invitation_code_id = invite.id
    WHERE id = v_uid;
  END IF;
END;
$$;

-- Asegurar permisos a los roles necesarios
REVOKE ALL ON FUNCTION public.consume_invitation(text) FROM public;
GRANT EXECUTE ON FUNCTION public.consume_invitation(text) TO anon, authenticated;

-- Forzar reload del schema cache de PostgREST
NOTIFY pgrst, 'reload schema';

COMMIT;
