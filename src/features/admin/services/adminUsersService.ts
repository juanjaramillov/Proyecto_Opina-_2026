import { supabase } from '../../../supabase/client';
import { logger } from '../../../lib/logger';

export type AdminUserRow = {
    user_id: string;
    nickname: string | null;
    role: string;
    created_at: string;
    total_interactions: number;
    is_identity_verified: boolean;
};

export const adminUsersService = {
    searchUsers: async (searchTerm: string = ''): Promise<AdminUserRow[]> => {
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data, error } = await (supabase.rpc as any)('admin_search_users', { p_search_term: searchTerm });
            if (error) throw error;
            return data as AdminUserRow[];
        } catch (error) {
            logger.error("Error searching users", { domain: 'admin_actions', origin: 'adminUsersService', action: 'search' }, error);
            throw error;
        }
    },

    updateRole: async (userId: string, targetRole: 'user' | 'admin' | 'b2b'): Promise<boolean> => {
        try {
            // Using standard update, assuming RLS allows admin to update users role
            // If not, we would need another RPC.
            const { error } = await supabase.from('users').update({ role: targetRole }).eq('user_id', userId);
            if (error) throw error;
            return true;
        } catch (error) {
            logger.error("Error updating user role", { domain: 'admin_actions', origin: 'adminUsersService', action: 'update_role' }, error);
            throw error;
        }
    }
};
