import { TrendingItem } from "../../../types/trending";
import { logger } from "../../../lib/logger";
import { cached } from "../../../lib/requestCache";
import { typedRpc } from "../../../supabase/typedRpc";

export interface PlatformStats {
    signals_24h: number;
    trending_title: string;
    active_region: string;
    active_users: number;
    captured_at: string;
}

export interface RecentActivity {
    signals_last_3h: number;
    verified_signals_last_3h: number;
    unique_users_last_3h: number;
    total_signals?: number;
    active_users_24h?: number;
}

interface RawTrendingRanking {
    battle_id: string;
    battle_title: string;
    battle_slug: string;
    option_label: string;
    total_weight: number | string;
    snapshot_at: string;
    variation: number | string;
    variation_percent: number | string;
    direction: string;
}

export const platformService = {
    getLiveStats: async (): Promise<PlatformStats | null> => {
        const { data, error } = await typedRpc<PlatformStats[]>('get_live_platform_stats');

        if (error) {
            logger.error('[PlatformService] Error fetching live stats:', error);
            return null;
        }

        return data?.[0] || null;
    },

    getRecentActivity: async (): Promise<RecentActivity | null> => {
        return cached("platform:getRecentActivity", 30_000, async () => {
            const { data, error } = await typedRpc<RecentActivity[]>('get_recent_signal_activity');

            if (error) {
                logger.error('[PlatformService] Error fetching recent activity:', error);
                return null;
            }

            return data?.[0] || null;
        });
    },

    getTrendingFeedGrouped: async (): Promise<unknown[]> => {
        const { data, error } = await typedRpc<unknown[]>('get_trending_feed_grouped');

        if (error) {
            logger.error('[PlatformService] Error fetching trending feed:', error);
            return [];
        }

        return data || [];
    },

    getTrending: async (): Promise<TrendingItem[]> => {
        const { data, error } = await typedRpc<RawTrendingRanking[]>('get_ranking_with_variation');

        if (error) {
            logger.error('[PlatformService] Error fetching latest rankings (snapshots):', error);
            return [];
        }

        const rawData = data || [];
        return rawData.map(item => ({
            id: item.battle_id,
            title: item.battle_title,
            slug: item.battle_slug,
            total_signals: Math.round(Number(item.total_weight)),
            trend_score: parseFloat(String(item.total_weight)),
            snapshot_at: item.snapshot_at,
            variation: parseFloat(String(item.variation)),
            variation_percent: parseFloat(String(item.variation_percent)),
            direction: item.direction as 'up' | 'down' | 'stable'
        }));
    },

    getSegmentedRanking: async (
        battleSlug: string,
        ageRange: string = 'all',
        gender: string = 'all',
        commune: string = 'all'
    ): Promise<TrendingItem[]> => {
        const { data, error } = await typedRpc<RawTrendingRanking[]>('get_segmented_ranking', {
            p_battle_slug: battleSlug,
            p_age_range: ageRange,
            p_gender: gender,
            p_commune: commune
        });

        if (error) {
            logger.error('[PlatformService] Error fetching segmented ranking:', error);
            return [];
        }

        const rawData = data || [];
        return rawData.map(item => ({
            id: item.battle_id,
            title: item.battle_title,
            slug: item.battle_slug,
            total_signals: Math.round(Number(item.total_weight)),
            trend_score: parseFloat(String(item.total_weight)),
            snapshot_at: item.snapshot_at,
            variation: 0,
            variation_percent: 0,
            direction: 'stable'
        }));
    },

    getSegmentedTrending: async (
        ageRange: string = 'all',
        gender: string = 'all',
        commune: string = 'all'
    ): Promise<TrendingItem[]> => {
        const key = `platform:getSegmentedTrending:${ageRange}:${gender}:${commune}`;
        return cached(key, 15_000, async () => {
            const { data, error } = await typedRpc<RawTrendingRanking[]>('get_segmented_trending', {
                p_age_range: ageRange,
                p_gender: gender,
                p_commune: commune
            });

            if (error) {
                logger.error('[PlatformService] Error fetching segmented trending:', error);
                return [];
            }

            const rawData = data || [];
            return rawData.map(item => ({
                id: item.battle_id,
                title: item.battle_title,
                slug: item.battle_slug,
                total_signals: Math.round(Number(item.total_weight)),
                trend_score: parseFloat(String(item.total_weight)),
                snapshot_at: item.snapshot_at,
                variation: 0,
                variation_percent: 0,
                direction: 'stable'
            }));
        });
    }
} as const;
