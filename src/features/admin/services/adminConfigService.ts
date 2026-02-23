import { supabase } from '../../../supabase/client';

export const adminConfigService = {
    getAnalyticsMode: async (): Promise<'all' | 'clean'> => {
        const { data, error } = await supabase.rpc('admin_get_analytics_mode' as any);

        if (error) {
            throw error;
        }

        if (data === 'UNAUTHORIZED_ADMIN') {
            throw new Error('No tienes permisos de administrador.');
        }

        return data as 'all' | 'clean';
    },

    setAnalyticsMode: async (mode: 'all' | 'clean'): Promise<{ ok: boolean; mode?: 'all' | 'clean'; error?: string }> => {
        const { data, error } = await supabase.rpc('admin_set_analytics_mode' as any, { p_mode: mode });

        if (error) {
            throw error;
        }

        return data as { ok: boolean; mode?: 'all' | 'clean'; error?: string };
    }
};
