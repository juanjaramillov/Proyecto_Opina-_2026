-- Migration: Create RPC to get the user's ranking position, percentile and score
-- Formula: reputation_score = total_signals * signal_weight

CREATE OR REPLACE FUNCTION get_user_ranking()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id uuid;
    v_total_users int;
    v_user_stats record;
    v_ranking_data record;
BEGIN
    -- Get current authenticated user
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- Get total count of users with stats
    SELECT count(*) INTO v_total_users FROM user_stats;

    -- If no users exist, return defaults
    IF v_total_users = 0 THEN
        RETURN json_build_object(
            'position', 1,
            'total_users', 1,
            'percentile', 100.0,
            'reputation_score', 0,
            'signals', 0,
            'weight', 1.0
        );
    END IF;

    -- Make sure user_stats exists for current user
    SELECT * INTO v_user_stats FROM user_stats WHERE user_id = v_user_id;

    -- If no user_stats yet, they are unranked (treat as last)
    IF v_user_stats IS NULL THEN
        RETURN json_build_object(
            'position', v_total_users + 1,
            'total_users', v_total_users,
            'percentile', 100.0,
            'reputation_score', 0,
            'signals', 0,
            'weight', 1.0
        );
    END IF;

    -- Calculate ranking using a window function on reputation (signals * weight)
    -- We use a CTE to rank everyone, then select the user's rank
    WITH RankedUsers AS (
        SELECT 
            user_id,
            total_signals,
            signal_weight,
            (total_signals * signal_weight) as reputation_score,
            RANK() OVER (ORDER BY (total_signals * signal_weight) DESC, total_signals DESC, updated_at ASC) as position
        FROM user_stats
    )
    SELECT 
        position,
        total_signals as signals,
        signal_weight as weight,
        reputation_score
    INTO v_ranking_data
    FROM RankedUsers
    WHERE user_id = v_user_id;

    -- Return the compiled record
    RETURN json_build_object(
        'position', v_ranking_data.position,
        'total_users', v_total_users,
        'percentile', ROUND(((v_ranking_data.position::numeric) / v_total_users::numeric) * 100, 1),
        'reputation_score', v_ranking_data.reputation_score,
        'signals', v_ranking_data.signals,
        'weight', v_ranking_data.weight
    );
END;
$$;
