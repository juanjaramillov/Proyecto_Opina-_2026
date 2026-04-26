import { typedRpc } from '../../../supabase/typedRpc';

export const adminConfigService = {
    getAnalyticsMode: async (): Promise<'all' | 'clean'> => {
        const { data, error } = await typedRpc<'all' | 'clean' | 'UNAUTHORIZED_ADMIN'>('admin_get_analytics_mode');
        if (error) throw error;
        if (data === 'UNAUTHORIZED_ADMIN') {
            throw new Error('No tienes permisos de administrador.');
        }
        return data ?? 'all';
    },

    setAnalyticsMode: async (mode: 'all' | 'clean'): Promise<{ ok: boolean; mode?: 'all' | 'clean'; error?: string }> => {
        const { data, error } = await typedRpc<{ ok: boolean; mode?: 'all' | 'clean'; error?: string }>('admin_set_analytics_mode', { p_mode: mode });
        if (error) throw error;
        return data ?? { ok: false, error: 'sin respuesta del servidor' };
    }
};
