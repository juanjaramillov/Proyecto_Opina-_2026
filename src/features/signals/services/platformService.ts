import { supabase as sb } from "../../../supabase/client";

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
}

export const platformService = {
    getLiveStats: async (): Promise<PlatformStats | null> => {
        // Casting to any because Database types are not yet updated with the new RPC
        const { data, error } = await (sb.rpc as any)('get_live_platform_stats');

        if (error) {
            console.error('[PlatformService] Error fetching live stats:', error);
            return null;
        }

        return data as PlatformStats;
    },

    getRecentActivity: async (): Promise<RecentActivity | null> => {
        const { data, error } = await (sb.rpc as any)('get_recent_signal_activity');

        if (error) {
            console.error('[PlatformService] Error fetching recent activity:', error);
            return null;
        }

        if (Array.isArray(data) && data.length > 0) {
            return data[0] as RecentActivity;
        }
        return data as RecentActivity;
    },

    getTrendingFeedGrouped: async (): Promise<any[]> => {
        const { data, error } = await (sb.rpc as any)('get_trending_feed_grouped');

        if (error) {
            console.error('[PlatformService] Error fetching trending feed:', error);
            return [];
        }

        return data || [];
    }
};
