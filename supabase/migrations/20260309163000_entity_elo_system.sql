-- =========================================================
-- Opina+ ELO Rating System
-- =========================================================

-- 1) Agregar columnas de ELO y estadísticas a la tabla de entidades (marcas)
ALTER TABLE public.entities ADD COLUMN IF NOT EXISTS elo_score numeric DEFAULT 1500.00;
ALTER TABLE public.entities ADD COLUMN IF NOT EXISTS battles_played integer DEFAULT 0;
ALTER TABLE public.entities ADD COLUMN IF NOT EXISTS battles_won integer DEFAULT 0;

-- 2) Crear el Trigger Function para procesar los cálculos cuando alguien vota
CREATE OR REPLACE FUNCTION public.fn_process_elo_on_signal()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_winner_id uuid;
  v_loser_id uuid;
  v_winner_elo numeric;
  v_loser_elo numeric;
  v_k_factor numeric := 32.0;
  v_expected_win numeric;
  v_expected_loss numeric;
BEGIN
  -- Solo nos importan los votos de tipo 'versus'
  IF NEW.module_type != 'versus' THEN
    RETURN NEW;
  END IF;

  -- El ganador es la opcion elegida. Necesitamos sacar su brand_id
  SELECT brand_id INTO v_winner_id
  FROM public.battle_options 
  WHERE id = NEW.option_id AND battle_id = NEW.battle_id;

  IF v_winner_id IS NULL THEN RETURN NEW; END IF;

  -- El perdedor es la OTRA opcion en la misma batalla
  SELECT brand_id INTO v_loser_id
  FROM public.battle_options 
  WHERE battle_id = NEW.battle_id AND id != NEW.option_id
  LIMIT 1;

  IF v_loser_id IS NULL THEN RETURN NEW; END IF;

  -- Bloquear ambas filas para evitar Race Conditions (High Concurrency)
  SELECT elo_score INTO v_winner_elo FROM public.entities WHERE id = v_winner_id FOR UPDATE;
  SELECT elo_score INTO v_loser_elo FROM public.entities WHERE id = v_loser_id FOR UPDATE;

  IF v_winner_elo IS NULL OR v_loser_elo IS NULL THEN RETURN NEW; END IF;

  -- Calcular Expected Scores
  v_expected_win := 1.0 / (1.0 + power(10.0, (v_loser_elo - v_winner_elo) / 400.0));
  v_expected_loss := 1.0 / (1.0 + power(10.0, (v_winner_elo - v_loser_elo) / 400.0));

  -- Actualizar ELOs
  UPDATE public.entities 
  SET 
    elo_score = v_winner_elo + v_k_factor * (1.0 - v_expected_win),
    battles_played = battles_played + 1,
    battles_won = battles_won + 1
  WHERE id = v_winner_id;

  UPDATE public.entities 
  SET 
    elo_score = v_loser_elo + v_k_factor * (0.0 - v_expected_loss),
    battles_played = battles_played + 1
  WHERE id = v_loser_id;

  RETURN NEW;
END;
$$;

-- 3) Adjuntar el trigger a la tabla signal_events (Después de insertar)
DROP TRIGGER IF EXISTS tr_process_elo_on_signal ON public.signal_events;
CREATE TRIGGER tr_process_elo_on_signal 
AFTER INSERT ON public.signal_events 
FOR EACH ROW EXECUTE FUNCTION public.fn_process_elo_on_signal();
