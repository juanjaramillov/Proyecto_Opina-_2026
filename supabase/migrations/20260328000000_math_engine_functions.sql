-- ==============================================================================
-- Opina+ V14 | Canonical Analytics & Math Engine
-- Date: 2026-03-28
-- Description: Core mathematical formulas for B2B portal metrics simulation
-- ==============================================================================

-- 1. Time Decay (Half-Life)
-- Expands the weight of a signal based on how recently it was cast.
-- Default half-life is 30 days (a 30-day old vote is worth 50% of an action taken today).
-- Formula: W = 0.5 ^ (days_elapsed / half_life)
CREATE OR REPLACE FUNCTION opina_math_time_decay(
    signal_timestamp timestamptz, 
    half_life_days float DEFAULT 30.0
) 
RETURNS numeric 
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
    days_elapsed float;
    weight float;
BEGIN
    -- Calculate days elapsed between now and the timestamp
    -- Note: using CURRENT_TIMESTAMP makes the function normally STABLE or VOLATILE, 
    -- but for the sake of the parameter, if we want an absolute weight, we compare to now.
    -- To keep it testable, we'll allow passing 'now' context, but let's default to CURRENT_TIMESTAMP.
    days_elapsed := extract(epoch from (CURRENT_TIMESTAMP - signal_timestamp)) / 86400.0;
    
    IF days_elapsed < 0 THEN
        days_elapsed := 0;
    END IF;

    IF half_life_days <= 0 THEN
        RETURN 1.0;
    END IF;

    weight := power(0.5, days_elapsed / half_life_days);
    
    -- Bound the weight between 0.01 and 1.0 so incredibly old stuff doesn't go literally to 0 in math logic
    IF weight < 0.01 THEN
        weight := 0.01;
    END IF;

    RETURN round(weight::numeric, 4);
END;
$$;

-- Overload for Admin testing (allows passing a specific "current" date)
CREATE OR REPLACE FUNCTION opina_math_time_decay(
    signal_timestamp timestamptz, 
    reference_timestamp timestamptz,
    half_life_days float DEFAULT 30.0
) 
RETURNS numeric 
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
    days_elapsed float;
    weight float;
BEGIN
    days_elapsed := extract(epoch from (reference_timestamp - signal_timestamp)) / 86400.0;
    IF days_elapsed < 0 THEN days_elapsed := 0; END IF;
    IF half_life_days <= 0 THEN RETURN 1.0; END IF;
    weight := power(0.5, days_elapsed / half_life_days);
    IF weight < 0.01 THEN weight := 0.01; END IF;
    RETURN round(weight::numeric, 4);
END;
$$;


-- 2. Wilson Score Interval (Lower Bound)
-- A statistical formula that calculates the true percentage a choice has with 95% confidence.
-- Solves the "1 positive out of 1 vs 90 positive out of 100" sorting problem.
CREATE OR REPLACE FUNCTION opina_math_wilson_score(
    positive_votes integer, 
    total_votes integer, 
    z_value numeric DEFAULT 1.96 -- 1.96 = 95% confidence interval
) 
RETURNS numeric 
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
    p numeric;
    n numeric;
    result numeric;
BEGIN
    IF total_votes <= 0 THEN
        RETURN 0.0;
    END IF;

    -- If there are more positive votes than total votes (impossible), clamp it
    IF positive_votes > total_votes THEN
        positive_votes := total_votes;
    END IF;

    n := total_votes::numeric;
    p := positive_votes::numeric / n;

    -- Wilson score lower bound calculation
    result := (p + (z_value * z_value) / (2.0 * n) - z_value * sqrt((p * (1.0 - p) + (z_value * z_value) / (4.0 * n)) / n)) / (1.0 + (z_value * z_value) / n);
    
    RETURN round(result, 4);
END;
$$;


-- 3. Shannon Entropy
-- Measures the fragmentation of a category.
-- Entropy = - Sum( p_i * log2(p_i) ) for each option's probability
-- To allow testing via Supabase RPC, it accepts an array of floats representing vote distributions (p_i)
CREATE OR REPLACE FUNCTION opina_math_shannon_entropy(
    probabilities numeric[]
) 
RETURNS numeric 
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
    entropy numeric := 0;
    p numeric;
    -- we need sum to normalize just in case
    total numeric := 0;
BEGIN
    -- First pass to ensure sum is 1.0
    FOREACH p IN ARRAY probabilities LOOP
        IF p > 0 THEN
            total := total + p;
        END IF;
    END LOOP;

    IF total <= 0 THEN
        RETURN 0.0;
    END IF;

    -- Second pass to calculate entropy
    FOREACH p IN ARRAY probabilities LOOP
        IF p > 0 THEN
            p := p / total; -- normalize
            entropy := entropy - (p * (ln(p) / ln(2.0))); -- log2(p)
        END IF;
    END LOOP;

    RETURN round(entropy, 4);
END;
$$;

-- Allow RPC calls using JSON arrays for easy React frontend connection
CREATE OR REPLACE FUNCTION opina_math_shannon_entropy_json(
    shares jsonb
) 
RETURNS numeric 
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
    probs numeric[];
    val jsonb;
BEGIN
    probs := ARRAY[]::numeric[];
    
    FOR val IN SELECT * FROM jsonb_array_elements(shares)
    LOOP
        probs := array_append(probs, val::text::numeric);
    END LOOP;

    RETURN opina_math_shannon_entropy(probs);
END;
$$;
