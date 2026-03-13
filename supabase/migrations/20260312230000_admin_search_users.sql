-- Search users for CRM Admin
CREATE OR REPLACE FUNCTION admin_search_users(p_search_term TEXT)
RETURNS TABLE (
    user_id UUID,
    nickname TEXT,
    role TEXT,
    created_at TIMESTAMPTZ,
    total_interactions BIGINT,
    is_identity_verified BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Only allow admins (basic check)
    IF NOT EXISTS (SELECT 1 FROM users WHERE users.user_id = auth.uid() AND users.role = 'admin') THEN
        -- In local dev without auth context it might fail if we enforce it strictly, 
        -- but let's keep it safe. If auth.uid() is null (service role), we bypass.
        IF current_setting('request.jwt.claims', true) IS NOT NULL THEN
            IF NOT EXISTS (SELECT 1 FROM users WHERE users.user_id = (current_setting('request.jwt.claims', true)::jsonb ->> 'sub')::uuid AND users.role = 'admin') THEN
                RAISE EXCEPTION 'Access denied';
            END IF;
        END IF;
    END IF;

    RETURN QUERY
    SELECT 
        u.user_id,
        up.nickname,
        u.role,
        u.created_at,
        u.total_interactions,
        u.is_identity_verified
    FROM users u
    JOIN user_profiles up ON u.user_id = up.user_id
    WHERE 
        p_search_term IS NULL 
        OR p_search_term = ''
        OR up.nickname ILIKE '%' || p_search_term || '%'
    ORDER BY u.created_at DESC
    LIMIT 100;
END;
$$;
