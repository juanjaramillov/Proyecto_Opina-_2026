import { supabase } from '../../../supabase/client';
import { logger } from '../../../lib/logger';

export interface UserStats {
    total_signals: number;
    level: number;
    signal_weight: number;
    last_signal_at: string | null;
}

export interface ParticipationSummary {
    versus_count: number;
    progressive_count: number;
    depth_count: number;
}

export interface ActivityEvent {
    id: string;
    created_at: string;
    module_type: string;
    entity_name?: string;
    option_id?: string | null;
    battle_id?: string | null;
}

export interface SegmentComparison {
    entity_id: string;
    entity_name: string;
    user_score: number;
    avg_age: number;
    avg_gender: number;
    avg_commune: number;
    avg_global: number;
    signals_count: number;
    coherence_level: 'Alta' | 'Media' | 'Baja' | 'Incipiente';
}

export interface PersonalHistoryPoint {
    date: string;
    avg_score: number;
    module_type: 'depth' | 'versus';
    category_slug?: string;
}

export interface RawPersonalHistoryPoint {
    created_at: string;
    value_numeric: number | null;
    module_type: string;
}

export const profileService = {
    /**
     * Gets general user stats (loyalty, weight, level).
     */
    async getUserStats(): Promise<UserStats | null> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        const { data, error } = await supabase
            .from('user_stats')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();

        if (error) throw error;

        if (!data) return null;

        const stats = data as { total_signals?: number; level?: number; signal_weight?: number; last_signal_at?: string | null };

        return {
            total_signals: stats.total_signals || 0,
            level: stats.level || 1,
            signal_weight: stats.signal_weight || 1.0,
            last_signal_at: stats.last_signal_at || null
        };
    },

    /**
     * Gets summary of participation by module.
     */
    async getParticipationSummary(): Promise<ParticipationSummary> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { versus_count: 0, progressive_count: 0, depth_count: 0 };

        const { data, error } = await supabase
            .from('signal_events')
            .select('module_type, signal_id')
            .eq('user_id', user.id);

        if (error) throw error;

        // Group by module and count unique signal_id (to avoid counting every depth answer as a separate participation)
        const rawData = (data || []) as Array<{ module_type: string | null; signal_id: string }>;

        const summaryMap = rawData.reduce((acc: Record<string, Set<string>>, curr) => {
            const key = `${curr.module_type || 'unknown'}_unique`;
            if (!acc[key]) acc[key] = new Set();
            acc[key].add(curr.signal_id);
            return acc;
        }, {});

        return {
            versus_count: summaryMap.versus_unique?.size || 0,
            progressive_count: summaryMap.progressive_unique?.size || 0,
            depth_count: summaryMap.depth_unique?.size || 0,
        };
    },

    /**
     * Gets chronological activity history.
     */
    async getActivityHistory(limit: number = 20): Promise<ActivityEvent[]> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        // Fetch unique signal entries with their module and entity data
        const { data, error } = await supabase
            .from('signal_events')
            .select(`
                id,
                created_at,
                module_type,
                option_id,
                battle_id
            `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return (data || []) as ActivityEvent[];
    },

    /**
     * Checks if demographic update is allowed (cooldown).
     */
    async checkUpdateCooldown(): Promise<{ allowed: boolean; daysRemaining: number }> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { allowed: true, daysRemaining: 0 };

        const { data, error } = await supabase
            .from('profiles')
            .select('last_demographic_update')
            .eq('id', user.id)
            .maybeSingle();

        if (error || !data) return { allowed: true, daysRemaining: 0 };

        const profile = data as { last_demographic_update?: string | null };
        if (!profile.last_demographic_update) return { allowed: true, daysRemaining: 0 };

        const lastUpdate = new Date(profile.last_demographic_update);
        const now = new Date();
        const diffDays = Math.ceil((now.getTime() - lastUpdate.getTime()) / (1000 * 3600 * 24));

        if (diffDays >= 30) return { allowed: true, daysRemaining: 0 };
        return { allowed: false, daysRemaining: 30 - diffDays };
    },

    /**
     * Gets comparison data between user scores and segments.
     */
    async getSegmentComparison(): Promise<SegmentComparison[]> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        // @ts-expect-error: RPC not yet in Database types
        const { data, error } = await supabase.rpc('calculate_user_segment_comparison', {
            p_user_id: user.id
        });

        if (error) {
            logger.error('Error in getSegmentComparison:', error);
            throw error;
        }

        return (data as unknown as SegmentComparison[]) || [];
    },

    /**
     * Gets user's historical evolution data.
     */
    async getPersonalHistory(): Promise<PersonalHistoryPoint[]> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        // @ts-expect-error: RPC not yet in Database types
        const { data, error } = await supabase.rpc('get_user_personal_history', {
            p_user_id: user.id
        });

        if (error) {
            logger.error('Error in getPersonalHistory:', error);
            throw error;
        }

        return (data as unknown as RawPersonalHistoryPoint[] || []).map((d) => ({
            date: d.created_at,
            avg_score: d.value_numeric || 0,
            module_type: (d.module_type as 'depth' | 'versus') || 'depth'
        }));
    }
};
