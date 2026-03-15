import { supabase } from '../../../supabase/client';
import { logger } from '../../../lib/logger';

export type PulseCategory = 'sobre_mi' | 'mi_semana' | 'mi_entorno';

export interface UserPulse {
    id?: string;
    user_id?: string;
    sub_category: PulseCategory;
    question_identifier: string;
    response_value: string;
    created_at?: string;
}

export const pulseService = {
    async savePulseBatch(pulses: UserPulse[]) {
        try {
            const authResponse = await supabase.auth.getUser();
            const user = authResponse.data.user;

            if (!user) {
                throw new Error("User must be authenticated to save a pulse");
            }

            // 1. ESCRITURA CANÓNICA (Signal Engine)
            const { signalService } = await import('./signalService');
            
            for (const p of pulses) {
                await signalService.saveSignalEvent({
                    battle_id: p.question_identifier, // The specific pulse question identifier as context
                    option_id: p.response_value,      // The value responded
                    attribute_id: p.sub_category,     // Store the category as attribute
                    meta: {
                        source: 'pulse'
                    }
                });
            }

            // 2. METADATA ESPECÍFICA LUEGO
            const pulsesToInsert = pulses.map(p => ({
                user_id: user.id,
                sub_category: p.sub_category,
                question_identifier: p.question_identifier,
                response_value: p.response_value
            }));

            const { error } = await supabase
                .from('user_pulses')
                .insert(pulsesToInsert);

            if (error) {
                // Not throwing here because canonical signals succeeded
                logger.error('Failed to save pulse batch fallback metadata', error);
            }

            return true;
        } catch (error) {
            logger.error('Failed to save pulse batch', error);
            throw error; // Let the caller UI (Tu Pulso) handle errors
        }
    },

    async checkCategoryAvailability(category: PulseCategory): Promise<boolean> {
        try {
            const authResponse = await supabase.auth.getUser();
            const user = authResponse.data.user;

            if (!user) {
                return false;
            }

            // Check if user answered anything in this category in the last 7 days
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);

            const { count, error } = await supabase
                .from('user_pulses')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id)
                .eq('sub_category', category)
                .gte('created_at', weekAgo.toISOString());

            if (error) {
                logger.error('Failed to check category availability', error);
                return true; // fail open, allow them
            }

            return (count || 0) === 0;
        } catch (error) {
            logger.error('Error checking pulse availability', error);
            return true;
        }
    }
};
