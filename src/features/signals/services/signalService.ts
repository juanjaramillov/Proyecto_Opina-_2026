import { supabase } from '../../../supabase/client';
import { Database } from '../../../supabase/database.types';
import { SupabaseClient } from '@supabase/supabase-js';
import { getAssetPathForOption } from '../config/brandAssets';
import { logger } from '../../../lib/logger';

const sb = supabase as unknown as SupabaseClient<Database>;

export type DbCategory = Database['public']['Tables']['categories']['Row'];

// --- NEW DATA MODEL TYPES ---
export type SignalEventPayload = {
    battle_id?: string;
    option_id?: string;
    session_id?: string;
    attribute_id?: string;
    meta?: Record<string, unknown>;
};

export type BattleContextResponse = {
    ok: boolean;
    error?: string;
    battle_id?: string;
    battle_instance_id?: string;
    battle_slug?: string;
    title?: string;
    options?: Array<{
        id: string;
        label: string;
        image_url: string;
        sort_order: number;
    }>;
};

// KPI types (por battle_instance_id)
export type ShareOfPreferenceRow = {
    option_label: string;
    option_id: string;
    signals_count: number;
    weighted_signals: number;
    share_pct: number;
};

export type TrendVelocityRow = {
    option_id: string;
    delta_signals: number;
};

export type EngagementQualityRow = {
    total_signals: number;
    weighted_total: number;
    verified_share_pct: number;
    avg_profile_completeness: number;
};

export type ActiveBattle = {
    id: string;
    slug: string;
    title: string;
    description: string | null;
    created_at: string;
    category: {
        slug: string;
        name: string;
        emoji: string;
        cover_url: string | null;
    } | null;
    options: Array<{
        id: string;
        label: string;
        image_url: string | null;
    }>;
};

function hasSupabaseEnv(): boolean {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    return Boolean(url && key);
}



export const signalService = {
    // =========================
    // REAL DATA (Supabase)
    // =========================
    getCategories: async (): Promise<DbCategory[]> => {
        if (!hasSupabaseEnv()) return [];
        const { data, error } = await sb
            .from('categories')
            .select('*')
            .order('name', { ascending: true });

        if (error) throw error;
        return data ?? [];
    },

    // Legacy getSignals & getTrending24h removed

    // =========================
    // STEP 2: RICH SIGNAL EVENTS
    // =========================
    saveSignalEvent: async (payload: SignalEventPayload): Promise<void> => {
        // 1. VALIDACIÓN ESTRICTA
        if (!payload.battle_id || !payload.option_id) {
            logger.error('[SignalService] INVALID SIGNAL PAYLOAD: Missing battle_id or option_id', payload);
            throw new Error('Invalid signal payload: missing battle_id or option_id');
        }

        // 2. SECURE RPC CALL
        // El RPC insert_signal_event maneja internamente:
        // - Obtención de anon_id (get_or_create_anon_id)
        // - Denormalización de segmentación (gender, age_bucket, region)
        // - Resolución de battle_instance_id
        // - Cálculo de pesos (user_stats)
        const { error } = await sb.rpc('insert_signal_event', {
            p_battle_id: payload.battle_id,
            p_option_id: payload.option_id,
            p_session_id: payload.session_id || undefined,
            p_attribute_id: payload.attribute_id || undefined
        });

        if (error) {
            logger.error('[SignalService] RPC insert_signal_event failed:', error);
            throw error;
        }
    },

    // =========================
    // STEP 3: CONTEXT RESOLUTION (RPC)
    // =========================
    resolveBattleContext: async (battleSlug: string): Promise<BattleContextResponse> => {
        if (!hasSupabaseEnv()) return { ok: false, error: 'Missing Supabase env' };

        const { data, error } = await (sb.rpc as any)('resolve_battle_context', {
            p_battle_slug: battleSlug,
        });

        if (error) return { ok: false, error: error.message };
        return data as unknown as BattleContextResponse;
    },

    // =========================
    // STEP 4: KPI READS (RPC)
    // =========================
    getShareOfPreference: async (
        battleId: string,
        startDate?: string,
        endDate?: string
    ): Promise<ShareOfPreferenceRow[]> => {
        if (!hasSupabaseEnv()) return [];

        const { data, error } = await (sb.rpc as any)('kpi_share_of_preference', {
            p_battle_id: battleId,
            p_start_date: startDate || undefined,
            p_end_date: endDate || undefined,
        });

        if (error) {
            logger.error('[KPI Share] Error:', error);
            return [];
        }
        return (data ?? []) as unknown as ShareOfPreferenceRow[];
    },

    getTrendVelocity: async (
        battleId: string,
        bucket: 'hour' | 'day' | 'week' = 'day',
        startDate?: string,
        endDate?: string
    ): Promise<TrendVelocityRow[]> => {
        if (!hasSupabaseEnv()) return [];

        const { data, error } = await (sb.rpc as any)('kpi_trend_velocity', {
            p_battle_id: battleId,
            p_bucket: bucket,
            p_start_date: startDate || undefined,
            p_end_date: endDate || undefined,
        });

        if (error) {
            logger.error('[KPI Trend] Error:', error);
            return [];
        }
        return (data ?? []) as unknown as TrendVelocityRow[];
    },

    async getEngagementQuality(
        battleId: string,
        startDate?: string,
        endDate?: string
    ): Promise<EngagementQualityRow[]> {
        if (!hasSupabaseEnv()) return [];

        const { data, error } = await (sb.rpc as any)('kpi_engagement_quality', {
            p_battle_id: battleId,
            p_start_date: startDate || undefined,
            p_end_date: endDate || undefined,
        });

        if (error) {
            logger.error('[KPI Quality] Error:', error);
            return [];
        }
        return (data ?? []) as unknown as EngagementQualityRow[];
    },

    // =========================
    // STEP 5: ACTIVE BATTLES (HUB)
    // =========================
    getActiveBattles: async (): Promise<ActiveBattle[]> => {
        if (!hasSupabaseEnv()) return [];

        const { data, error } = await sb.rpc('get_active_battles');

        if (error) {
            logger.error('[Active Battles] Error:', error);
            return [];
        }

        const rawData = (data as unknown as ActiveBattle[]) || [];
        return rawData.map((b) => ({
            id: b.id,
            slug: b.slug,
            title: b.title,
            description: b.description || null,
            created_at: b.created_at,
            category: b.category || null,
            options: (b.options || []).map((opt: { id: string; label: string; image_url: string | null; category?: string | null }) => ({
                ...opt,
                image_url: getAssetPathForOption(opt.label, opt.image_url),
                category: opt.category || null,
                type: 'brand',
                imageFit: 'contain'
            }))
        })) as ActiveBattle[];
    },

    getUserStats: async (): Promise<Database['public']['Tables']['user_stats']['Row'] | null> => {
        if (!hasSupabaseEnv()) return null;

        const { data: { session } } = await sb.auth.getSession();
        if (!session) return null;

        const { data, error } = await sb
            .from('user_stats')
            .select('*')
            .single();

        if (error) {
            if (error.code !== 'PGRST116') { // Ignore "no rows returned"
                logger.error('[User Stats] Error:', error);
            }
            return null;
        }
        return data;
    },
};
