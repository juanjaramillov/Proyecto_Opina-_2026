import { supabase } from '../../../supabase/client';
import { Database } from '../../../supabase/database.types';
import { SupabaseClient } from '@supabase/supabase-js';
import { getAssetPathForOption } from '../config/brandAssets';
import { logger } from '../../../lib/logger';
import { typedRpc } from '../../../supabase/typedRpc';
import { DbCategory, BattleContextResponse, ActiveBattle } from './signalTypes';

const sb = supabase as unknown as SupabaseClient<Database>;

type HubLiveStats24h = {
    active_users_24h: number;
    signals_24h: number;
    depth_answers_24h: number;
    active_battles: number;
    entities_elo: number;
};

type HubTimeseriesPoint = {
    bucket_start: string;
    label: string;
    signals: number;
    depth: number;
};

type HubTopNow24h = {
    top_versus: { slug: string; title: string; signals_24h: number } | null;
    top_torneo: { slug: string; title: string; signals_24h: number } | null;
};

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

    getHubLiveStats24h: async (): Promise<HubLiveStats24h> => {
        const empty: HubLiveStats24h = { active_users_24h: 0, signals_24h: 0, depth_answers_24h: 0, active_battles: 0, entities_elo: 0 };
        if (!hasSupabaseEnv()) return empty;

        const { data, error } = await typedRpc<HubLiveStats24h>('get_hub_live_stats_24h');
        if (error) {
            logger.error('[Hub Live Stats] Error:', undefined, error);
            return empty;
        }
        return data ?? empty;
    },

    getHubSignalTimeseries24h: async (): Promise<HubTimeseriesPoint[]> => {
        if (!hasSupabaseEnv()) return [];

        const { data, error } = await typedRpc<HubTimeseriesPoint[]>('get_hub_signal_timeseries_24h');
        if (error) {
            logger.error('[Hub Timeseries 24h] Error:', undefined, error);
            return [];
        }
        return data ?? [];
    },

    getHubTopNow24h: async (): Promise<HubTopNow24h> => {
        const empty: HubTopNow24h = { top_versus: null, top_torneo: null };
        if (!hasSupabaseEnv()) return empty;

        const { data, error } = await typedRpc<HubTopNow24h>('get_hub_top_now_24h');
        if (error) {
            logger.error('[Hub Top Now] Error:', undefined, error);
            return empty;
        }
        return data ?? empty;
    },

    getActiveBattles: async (): Promise<ActiveBattle[]> => {
        if (!hasSupabaseEnv()) return [];

        // typedRpc no soporta .range() todavía, así que mantenemos sb.rpc directo
        // y casteamos el resultado al tipo conocido.
        const { data: page1, error: err1 } = await sb.rpc('get_active_battles').range(0, 999);
        if (err1) {
            logger.error('[Active Battles] Error fetching page 1:', err1);
            return [];
        }

        const { data: page2, error: err2 } = await sb.rpc('get_active_battles').range(1000, 1999);
        if (err2) {
            logger.error('[Active Battles] Error fetching page 2:', err2);
        }

        const rawData: ActiveBattle[] = [
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
                is_active_versus: (opt as { is_active_versus?: boolean }).is_active_versus ?? true,
                is_active_torneo: (opt as { is_active_torneo?: boolean }).is_active_torneo ?? true,
                type: 'brand',
                imageFit: 'contain'
            }))
        })) as ActiveBattle[];
    },

    getEntitiesByModule: async (module: string) => {
        if (!hasSupabaseEnv()) return [];

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (sb.rpc as any)('get_entities_by_module', {
            p_module: module
        });

        if (error) {
            logger.error(`[Entities module=${module}] Error fetching entities:`, error);
            return [];
        }

        return data || [];
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
