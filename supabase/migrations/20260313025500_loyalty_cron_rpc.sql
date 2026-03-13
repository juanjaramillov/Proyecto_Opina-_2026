-- Process Weekly Missions RPC
-- Esta función será llamada por la Edge Function cada domingo a las 23:59.

CREATE OR REPLACE FUNCTION process_weekly_missions()
RETURNS void AS $$
DECLARE
    v_user_id UUID;
    v_missions_count INTEGER;
    v_completed_count INTEGER;
    v_penalty INTEGER;
    v_week_start_date DATE;
    v_wallet_amount NUMERIC := 5000;
BEGIN
    v_week_start_date := date_trunc('week', CURRENT_DATE)::DATE;

    -- Cuántas misiones activas hay
    SELECT count(*) INTO v_missions_count FROM public.weekly_missions WHERE is_active = true;

    -- Iteramos sobre todos los usuarios que tienen un registro de lealtad
    FOR v_user_id IN 
        SELECT user_id FROM public.user_loyalty_stats
    LOOP
        -- Contar cuántas misiones completó el usuario en esta semana
        SELECT count(*) INTO v_completed_count
        FROM public.user_weekly_mission_progress
        WHERE user_id = v_user_id
          AND week_start_date = v_week_start_date
          AND is_completed = true;

        -- Obtenemos su penalty actual
        SELECT penalty_months_remaining INTO v_penalty
        FROM public.user_loyalty_stats
        WHERE user_id = v_user_id;

        IF v_completed_count >= v_missions_count THEN
            -- ¡Cumplió todas las misiones de la semana!
            -- Asumiremos que esta función corre cada fin de semana.
            -- Deberíamos llevar la cuenta de "semanas consecutivas" o simplemente "meses".
            -- Para este MVP, simplificaremos: 
            -- Cada semana exitosa cuenta como 1. Si llega a 4 (1 mes), evaluamos el premio.
            -- Para eso, podemos usar el campo consecutive_months_completed para guardar "semanas" temporalmente, 
            -- o crear un campo consecutive_weeks. Vamos a usar consecutive_months_completed renombrado conceptualmente o sumarle de a 1.
            -- Hagamos: consecutive_months_completed guarda SEMANAS.
            UPDATE public.user_loyalty_stats
            SET consecutive_months_completed = consecutive_months_completed + 1
            WHERE user_id = v_user_id;

            -- Evaluamos si se cumplió un "mes" (4 semanas)
            IF (SELECT consecutive_months_completed FROM public.user_loyalty_stats WHERE user_id = v_user_id) >= 4 THEN
                IF v_penalty > 0 THEN
                    -- Estaba en el pozo. Pagó 1 mes (4 semanas) de castigo.
                    UPDATE public.user_loyalty_stats
                    SET penalty_months_remaining = penalty_months_remaining - 1,
                        consecutive_months_completed = 0
                    WHERE user_id = v_user_id;
                ELSE
                    -- Premio!
                    UPDATE public.user_wallets
                    SET balance = balance + v_wallet_amount
                    WHERE user_id = v_user_id;

                    INSERT INTO public.wallet_transactions (user_id, amount, transaction_type, description)
                    VALUES (v_user_id, v_wallet_amount, 'reward', 'Premio por cumplir 4 semanas de misiones ciudadanas');

                    -- Se resetea para que gane los próximos $5000 el siguiente bloque de 4 semanas.
                    UPDATE public.user_loyalty_stats
                    SET consecutive_months_completed = 0
                    WHERE user_id = v_user_id;
                END IF;
            END IF;
        ELSE
            -- Falló esta semana. Pierde la racha y se va al pozo (3 meses de castigo).
            UPDATE public.user_loyalty_stats
            SET consecutive_months_completed = 0,
                penalty_months_remaining = 3
            WHERE user_id = v_user_id;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
