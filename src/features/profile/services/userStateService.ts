import { supabase } from '../../../supabase/client';
import { getAnonId } from '../../auth/services/anonService';
import { logger } from '../../../lib/logger';

export interface UserState {
    mood_score: number;
    economic_score: number;
    job_score: number;
    happiness_score: number;
}

export interface StateBenchmark {
    mood: number;
    economic: number;
    job: number;
    happiness: number;
}

export interface UserStateBenchmarks {
    country: StateBenchmark;
    segment: StateBenchmark;
}

export interface UserHistoryEntry {
    created_at: string;
    value_numeric: number;
    module_type: string;
}

/**
 * Servicio para gestionar el estado personal privado del usuario.
 * Todo se guarda bajo un anon_id para mantener la privacidad absoluta.
 */
export const userStateService = {
    async saveUserState(state: UserState): Promise<void> {
        const { error } = await supabase.rpc('insert_user_state', {
            p_mood_score: state.mood_score,
            p_economic_score: state.economic_score,
            p_job_score: state.job_score,
            p_happiness_score: state.happiness_score
        });

        if (error) {
            logger.error('[UserStateService] Failed to save user state via RPC:', error);
            throw error;
        }
    },

    async getUserHistory(): Promise<UserHistoryEntry[]> {
        const anonId = await getAnonId();

        const { data, error } = await supabase
            .from('user_state_logs')
            .select('created_at, value_numeric, module_type') // Select specific columns
            .eq('anon_id', anonId)
            .order('created_at', { ascending: false })
            .limit(30);

        if (error) {
            logger.error('[UserStateService] Failed to fetch history:', error);
            throw error;
        }

        return (data || []) as unknown as UserHistoryEntry[];
    },

    async getBenchmarks(): Promise<UserStateBenchmarks | null> {
        const { data, error } = await supabase.rpc('get_state_benchmarks');
        if (error) {
            logger.error('[UserStateService] Failed to fetch benchmarks:', error);
            throw error;
        }
        return data as unknown as UserStateBenchmarks;
    }
};
