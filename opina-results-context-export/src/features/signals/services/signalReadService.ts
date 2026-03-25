import { supabase } from '../../../supabase/client';
import { Database } from '../../../supabase/database.types';
import { SupabaseClient } from '@supabase/supabase-js';
import { getAssetPathForOption } from '../config/brandAssets';
import { logger } from '../../../lib/logger';
import { DbCategory, BattleContextResponse, ActiveBattle } from './signalTypes';

const sb = supabase as unknown as SupabaseClient<Database>;

function hasSupabaseEnv(): boolean {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    return Boolean(url && key);
}

export const signalReadService = {
    getCategories: async (): Promise<DbCategory[]> => {
        if (!hasSupabaseEnv()) return [];
        const { data, error } = await sb
            .from('categories')
            .select('*')
            .order('name', { ascending: true });

        if (error) throw error;
        return data ?? [];
    },

    resolveBattleContext: async (battleSlug: string): Promise<BattleContextResponse> => {
        if (!hasSupabaseEnv()) return { ok: false, error: 'Missing Supabase env' };

        const { data, error } = await sb.rpc('resolve_battle_context', {
            p_battle_slug: battleSlug,
        });

        if (error) return { ok: false, error: error.message };
        return data as BattleContextResponse;
    },

    getHubLiveStats24h: async (): Promise<{
        active_users_24h: number;
        signals_24h: number;
        depth_answers_24h: number;
        active_battles: number;
        entities_elo: number;
    }> => {
        if (!hasSupabaseEnv()) return { active_users_24h: 0, signals_24h: 0, depth_answers_24h: 0, active_battles: 0, entities_elo: 0 };

        const { data, error } = await sb.rpc('get_hub_live_stats_24h');
        if (error) {
            logger.error('[Hub Live Stats] Error:', error);
            return { active_users_24h: 0, signals_24h: 0, depth_answers_24h: 0, active_battles: 0, entities_elo: 0 };
        }
        return (data as unknown as {
            active_users_24h: number;
            signals_24h: number;
            depth_answers_24h: number;
            active_battles: number;
            entities_elo: number;
        }) ?? { active_users_24h: 0, signals_24h: 0, depth_answers_24h: 0, active_battles: 0, entities_elo: 0 };
    },

    getHubSignalTimeseries24h: async (): Promise<Array<{
        bucket_start: string;
        label: string;
        signals: number;
        depth: number;
    }>> => {
        if (!hasSupabaseEnv()) return [];

        const { data, error } = await sb.rpc('get_hub_signal_timeseries_24h');
        if (error) {
            logger.error('[Hub Timeseries 24h] Error:', error);
            return [];
        }

        return (data as unknown as Array<{
            bucket_start: string;
            label: string;
            signals: number;
            depth: number;
        }>) ?? [];
    },

    getHubTopNow24h: async (): Promise<{
        top_versus: { slug: string; title: string; signals_24h: number } | null;
        top_torneo: { slug: string; title: string; signals_24h: number } | null;
    }> => {
        if (!hasSupabaseEnv()) return { top_versus: null, top_torneo: null };

        const { data, error } = await sb.rpc('get_hub_top_now_24h');

        if (error) {
            logger.error('[Hub Top Now] Error:', error);
            return { top_versus: null, top_torneo: null };
        }

        return (data as unknown as {
            top_versus: { slug: string; title: string; signals_24h: number } | null;
            top_torneo: { slug: string; title: string; signals_24h: number } | null;
        }) ?? { top_versus: null, top_torneo: null };
    },

    getActiveBattles: async (): Promise<ActiveBattle[]> => {
        if (!hasSupabaseEnv()) return [];

        const { data: page1, error: err1 } = await sb.rpc('get_active_battles').range(0, 999);
        if (err1) {
            logger.error('[Active Battles] Error fetching page 1:', err1);
            return [];
        }

        const { data: page2, error: err2 } = await sb.rpc('get_active_battles').range(1000, 1999);
        if (err2) {
            logger.error('[Active Battles] Error fetching page 2:', err2);
        }

        const rawData = [
            ...((page1 as unknown as ActiveBattle[]) || []),
            ...((page2 as unknown as ActiveBattle[]) || [])
        ];

        return rawData.map((b) => ({
            id: b.id,
            slug: b.slug,
            title: b.title,
            description: b.description || null,
            created_at: b.created_at,
            category: b.category || null,
            options: (b.options || []).map((opt) => ({
                id: opt.id,
                label: opt.label,
                image_url: getAssetPathForOption(opt.label, opt.image_url),
                brand_domain: opt.brand_domain || null,
                category: (opt as { category?: string | null }).category || null,
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
