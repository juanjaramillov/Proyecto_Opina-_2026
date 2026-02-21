import { supabase } from '../../../supabase/client';
import { getAnonId } from '../../auth/services/anonService';

export interface UserState {
    mood_score: number;
    economic_score: number;
    job_score: number;
    happiness_score: number;
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
            console.error('[UserStateService] Failed to save user state via RPC:', error);
            throw error;
        }
    },

    async getUserHistory(): Promise<UserState[]> {
        const anonId = await getAnonId();

        const { data, error } = await supabase
            .from('user_state_logs')
            .select('*')
            .eq('anon_id', anonId)
            .order('created_at', { ascending: false })
            .limit(30);

        if (error) {
            console.error('[UserStateService] Failed to fetch history:', error);
            throw error;
        }

        return (data || []) as unknown as UserState[];
    },

    async getBenchmarks(): Promise<any> {
        const { data, error } = await supabase.rpc('get_state_benchmarks');
        if (error) {
            console.error('[UserStateService] Failed to fetch benchmarks:', error);
            throw error;
        }
        return data;
    }
};
