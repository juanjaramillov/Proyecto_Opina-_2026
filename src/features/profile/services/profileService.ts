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

export function getNextDemographicsUpdateDate(lastUpdateISO?: string): Date | null {
    if (!lastUpdateISO) return null;
    const date = new Date(lastUpdateISO);
    if (isNaN(date.getTime())) return null;
    date.setDate(date.getDate() + 30);
    return date;
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
     * (signal_events no permite SELECT directo por RLS, por eso usamos RPC)
     */
    async getParticipationSummary(): Promise<ParticipationSummary> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { versus_count: 0, progressive_count: 0, depth_count: 0 };

        const { data, error } = await supabase.rpc('get_my_participation_summary');
        if (error) throw error;

        const row = (data as any)?.[0] as any;

        return {
            versus_count: Number(row?.versus_count ?? 0),
            progressive_count: Number(row?.progressive_count ?? 0),
            depth_count: Number(row?.depth_count ?? 0),
        };
    },

    /**
     * Gets chronological activity history.
     * (signal_events no permite SELECT directo por RLS, por eso usamos RPC)
     */
    async getActivityHistory(limit: number = 20): Promise<ActivityEvent[]> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        const safeLimit = Math.max(1, Math.min(limit, 100));

        const { data, error } = await supabase.rpc('get_my_activity_history', {
            p_limit: safeLimit
        });

        if (error) throw error;

        return ((data as any) || []) as ActivityEvent[];
    },

    /**
     * Checks if demographic update is allowed (cooldown).
     */
    async checkUpdateCooldown(): Promise<{ allowed: boolean; daysRemaining: number }> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { allowed: true, daysRemaining: 0 };

        const { data, error } = await (supabase as any)
            .from('user_profiles')
            .select('profile_stage,last_demographics_update,updated_at')
            .eq('user_id', user.id)
            .maybeSingle();

        if (error || !data) return { allowed: true, daysRemaining: 0 };

        const profile = data as any;

        if (typeof profile.profile_stage === 'number' && profile.profile_stage < 4) {
            return { allowed: true, daysRemaining: 0 };
        }

        const lastUpdateISO = profile.last_demographics_update || profile.updated_at;
        if (!lastUpdateISO) return { allowed: true, daysRemaining: 0 };

        const lastUpdate = new Date(lastUpdateISO);
        if (isNaN(lastUpdate.getTime())) {
            return { allowed: true, daysRemaining: 0 };
        }

        const now = new Date();
        const diffDays = Math.ceil((now.getTime() - lastUpdate.getTime()) / (1000 * 3600 * 24));

        if (diffDays >= 30) {
            return { allowed: true, daysRemaining: 0 };
        }

        return { allowed: false, daysRemaining: Math.max(0, 30 - diffDays) };
    },

    /**
     * Gets comparison data between user scores and segments.
     */
    async getSegmentComparison(): Promise<SegmentComparison[]> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        const { data, error } = await (supabase.rpc as any)('calculate_user_segment_comparison', {
            p_user_id: user.id
        });

        if (error) {
            logger.error('Error fetching segment comparison:', error);
            throw error;
        }

        return (data as unknown as SegmentComparison[]) || [];
    },

    /**
     * Gets personal history chart points (user evolution over time).
     */
    async getPersonalHistory(): Promise<PersonalHistoryPoint[]> {
        const { data, error } = await supabase.rpc('get_user_personal_history');

        if (error) {
            logger.error('Error fetching personal history:', error);
            throw error;
        }

        const rawData = (data as unknown as RawPersonalHistoryPoint[]) || [];

        return rawData.map((p) => ({
            date: new Date(p.created_at).toISOString().slice(0, 10),
            avg_score: p.value_numeric ? Number(p.value_numeric) : 0,
            module_type: (p.module_type === 'depth' ? 'depth' : 'versus')
        }));
    }
};
